import io
import json
import uuid
import numpy as np
from fastapi import APIRouter, FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
from io import BytesIO
import re
from datetime import datetime
import uvicorn
import sys
import os

# Add the current directory to Python path to make imports work
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))



# Import the models
from models.models import DateRangeFilter

# Import functions from the new structure
from functions.data_loader import load_data, validate_data
from functions.user_analyzer import analyze_users, get_user_details
from functions.auth_analyzer import analyze_authorizations, get_user_authorizations
from functions.role_analyzer import analyze_roles, get_user_roles
from functions.report_generator import generate_report, output_report

# Keep any legacy imports that might still be needed
# Since role_analyzer.py is empty (0 bytes) according to the listing, we can't import from it yet
# from functions.role_analyzer import analyze_roles, get_user_roles

# Custom JSON encoder to handle special values like NaN, infinity, and NumPy types
class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            if np.isnan(obj):
                return None  # Convert NaN to null in JSON
            elif np.isinf(obj):
                return str(obj)  # Convert Infinity to string
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, datetime):
            return obj.isoformat()
        elif isinstance(obj, pd.Timestamp):
            return obj.isoformat()
        return super().default(obj)

# Custom JSONResponse class that uses our encoder
class CustomJSONResponse(JSONResponse):
    def render(self, content) -> bytes:
        return json.dumps(
            content,
            ensure_ascii=False,
            allow_nan=False,
            indent=None,
            separators=(",", ":"),
            cls=CustomJSONEncoder,
        ).encode("utf-8")

app = FastAPI(
    title="SAP Analyzer API", 
    description="API pour l'analyse des données SAP pour l'audit informatique",
    default_response_class=CustomJSONResponse  # Use our custom JSON response
)



# Configuration CORS pour permettre les requêtes du frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, remplacer par l'URL de votre frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Storage for analyses
analyses = {
    "agr_users": {},
    "ust12": {},
    "usr02": {},
    "integrated": {}
}

@app.post("/api/analyze/agr-users")
async def analyze_agr_users_file(file: UploadFile = File(...), date_range: Optional[DateRangeFilter] = None):
    """
    Analyse un fichier d'extraction de la table AGR_USERS
    """
    # Vérifier le type de fichier
    if not file.filename.endswith(('.csv', '.txt', '.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Le fichier doit être au format CSV, TXT ou Excel")
    
    # Lire le fichier
    contents = await file.read()
    buffer = BytesIO(contents)
    
    try:
        # Essayer différents formats d'importation
        try:
            if file.filename.endswith(('.xlsx', '.xls')):
                df = pd.read_excel(buffer)
            else:
                # Essayer avec différents délimiteurs
                for delimiter in [',', ';', '\t', '|']:
                    buffer.seek(0)
                    try:
                        df = pd.read_csv(buffer, delimiter=delimiter, encoding='utf-8')
                        if len(df.columns) > 1:
                            break
                    except:
                        continue
        except Exception as e:
            # Dernière tentative avec des options plus flexibles
            buffer.seek(0)
            df = pd.read_csv(
                buffer, 
                sep=None, 
                engine='python',
                encoding_errors='replace'
            )
        
        # Standardiser les noms de colonnes
        df.columns = [col.upper() for col in df.columns]
        required_columns = ['AGR_NAME', 'UNAME', 'FROM_DAT', 'TO_DAT']
        
        for col in required_columns:
            if col not in df.columns:
                # Essayer de trouver des colonnes similaires
                potential_matches = [c for c in df.columns if col in c]
                if potential_matches:
                    df[col] = df[potential_matches[0]]
                else:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Colonne requise manquante: {col}. Colonnes trouvées: {', '.join(df.columns)}"
                    )
        
        # Create data dictionary in the format expected by our analysis functions
        data = {
            'agr_users_df': df,
            # Create empty DataFrames for other tables that might be required by the analysis functions
            'usr02_df': pd.DataFrame(),
            'usr12_df': pd.DataFrame()
        }
        
        # Get the config from the config module
        from config import CONFIG
        
        # For now, we'll do a simplified analysis as the original analyze_agr_users function is no longer imported
        # In a complete implementation, you might want to create a new function in role_analyzer.py
        
        # Generate a unique analysis ID
        analysis_id = str(uuid.uuid4())
        
        # Store the processed data for future use
        analyses["agr_users"][analysis_id] = {
            "data": df.to_dict(orient='records'),
            "timestamp": datetime.now().isoformat()
        }
        
        # Return a basic response for now
        return {
            "analysis_id": analysis_id,
            "timestamp": datetime.now().isoformat(),
            "record_count": len(df),
            "message": "AGR_USERS data loaded successfully. Integration with role_analyzer will be implemented when available."
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'analyse du fichier: {str(e)}")

@app.post("/api/filter/agr-users")
async def filter_agr_users(data: Dict[str, Any], date_range: DateRangeFilter):
    """
    Filtre les résultats d'analyse par plage de dates
    """
    try:
        # Convertir les données JSON en DataFrame
        df = pd.DataFrame(data['data'])
        
        # Analyse des données filtrées
        result = analyze_agr_users(df, date_range)
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du filtrage des données: {str(e)}")

@app.post("/api/integrate-data")
async def integrate_data(
    agr_users_file: UploadFile = File(None), 
    usr02_file: UploadFile = File(None),
    ust12_file: UploadFile = File(None),
    date_range: Optional[str] = Form(None)
):
    """
    Intègre et analyse les données de plusieurs tables SAP
    """
    print(f"Received integration request with files: {agr_users_file}, {usr02_file}, {ust12_file}")
    
    if not agr_users_file or not usr02_file or not ust12_file:
        raise HTTPException(status_code=400, detail="Veuillez fournir les trois fichiers : agr_user, usr02, et ust12")
    
    # Vérifier le type des fichiers
    for file in [agr_users_file, usr02_file, ust12_file]:
        if not file.filename.endswith(('.csv', '.txt', '.xlsx', '.xls')):
            raise HTTPException(status_code=400, detail=f"Le fichier {file.filename} doit être au format CSV, TXT ou Excel")
    
    # Parse date range if provided
    date_range_filter = None
    if date_range:
        try:
            date_range_data = json.loads(date_range)
            date_range_filter = DateRangeFilter(**date_range_data)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Format de plage de dates invalide")
    
    try:
        # Read all files
        agr_users_content = await agr_users_file.read()
        usr02_content = await usr02_file.read()
        ust12_content = await ust12_file.read()
        
        # Parse the files into DataFrames
        try:
            agr_users_df = parse_file_to_dataframe(agr_users_file.filename, BytesIO(agr_users_content))
            usr02_df = parse_file_to_dataframe(usr02_file.filename, BytesIO(usr02_content))
            ust12_df = parse_file_to_dataframe(ust12_file.filename, BytesIO(ust12_content))
        except Exception as e:
            # Return a structured error response
            analysis_id = str(uuid.uuid4())
            error_report = {
                "validation_errors": {
                    "message": f"Error parsing files: {str(e)}",
                    "details": "Cannot parse one or more input files into DataFrames"
                }
            }
            analyses["integrated"][analysis_id] = {
                "report": error_report,
                "timestamp": datetime.now().isoformat()
            }
            return {
                "analysis_id": analysis_id,
                "timestamp": datetime.now().isoformat(),
                "report": error_report
            }
        
        # Store original column names for debugging
        original_agr_columns = agr_users_df.columns.tolist()
        original_usr02_columns = usr02_df.columns.tolist()
        original_ust12_columns = ust12_df.columns.tolist()
        
        # Print column names for debugging
        print("AGR_USERS columns:", original_agr_columns)
        print("USR02 columns:", original_usr02_columns)
        print("UST12 columns:", original_ust12_columns)
        
        # Standardize column names
        agr_users_df.columns = [col.upper() for col in agr_users_df.columns]
        usr02_df.columns = [col.upper() for col in usr02_df.columns]
        ust12_df.columns = [col.upper() for col in ust12_df.columns]
        
        # Create data dictionary
        data = {
            'agr_users_df': agr_users_df,
            'usr02_df': usr02_df,
            'usr12_df': ust12_df  # Map UST12 to USR12 as expected by the analysis functions
        }
        
        # Validate the data with error handling
        validation_errors = {}
        try:
            validate_data(data)
        except ValueError as e:
            validation_errors["validation_error"] = str(e)
            print(f"Validation error: {e}")
        
        # Import the config
        from config import CONFIG
        
        # Generate analysis report even if there are validation issues
        try:
            user_analysis = analyze_users(data)
        except Exception as e:
            user_analysis = {"error": str(e), "users": []}
            validation_errors["user_analysis_error"] = str(e)
            print(f"User analysis error: {e}")
        
        try:
            role_analysis = analyze_roles(data)
        except Exception as e:
            role_analysis = {"error": str(e)}
            validation_errors["role_analysis_error"] = str(e)
            print(f"Role analysis error: {e}")
        
        try:
            auth_analysis = analyze_authorizations(data)
        except Exception as e:
            auth_analysis = {"error": str(e)}
            validation_errors["auth_analysis_error"] = str(e)
            print(f"Authorization analysis error: {e}")
        
        # Generate the integrated report
        report = generate_report(user_analysis, role_analysis, auth_analysis, CONFIG)
        
        # Add validation errors to the report if any
        if validation_errors:
            report["validation_errors"] = validation_errors
        
        # Add column information to help with debugging, including both original and standardized columns
        report["file_info"] = {
            "agr_users_columns": original_agr_columns,
            "usr02_columns": original_usr02_columns,
            "ust12_columns": original_ust12_columns,
            "agr_users_standardized": agr_users_df.columns.tolist(),
            "usr02_standardized": usr02_df.columns.tolist(),
            "ust12_standardized": ust12_df.columns.tolist(),
            "data_summary": {
                "agr_users_rows": len(agr_users_df),
                "usr02_rows": len(usr02_df),
                "ust12_rows": len(ust12_df),
                "user_count": len(user_analysis.get('users', [])),
                "role_count": len(role_analysis.get('roles', [])),
            }
        }
        
        # Generate a unique analysis ID and store the results
        analysis_id = str(uuid.uuid4())
        analyses["integrated"][analysis_id] = {
            "report": report,
            "timestamp": datetime.now().isoformat()
        }
        
        # Print response information for debugging
        print("\n======= FINAL RESPONSE DEBUG INFO =======")
        print(f"Analysis ID: {analysis_id}")
        print(f"User count in report: {len(report.get('users', []))}")
        print(f"User count in metadata: {report.get('metadata', {}).get('user_count', 0)}")
        if 'summary' in report and 'user_statistics' in report['summary']:
            print(f"User statistics in summary: {report['summary']['user_statistics']}")
        if 'warning' in report.get('summary', {}):
            print(f"Warning in summary: {report['summary']['warning']}")
        print("======= END OF RESPONSE DEBUG INFO =======\n")
        
        # Return the report data along with the analysis ID
        return {
            "analysis_id": analysis_id,
            "timestamp": datetime.now().isoformat(),
            "report": report
        }
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        # Return a structured error response for any other exception
        analysis_id = str(uuid.uuid4())
        error_report = {
            "validation_errors": {
                "message": f"Error processing data: {str(e)}",
                "traceback": traceback.format_exc()
            }
        }
        analyses["integrated"][analysis_id] = {
            "report": error_report,
            "timestamp": datetime.now().isoformat()
        }
        return {
            "analysis_id": analysis_id,
            "timestamp": datetime.now().isoformat(),
            "report": error_report
        }

def parse_file_to_dataframe(filename, buffer):
    """
    Parse a file buffer into a pandas DataFrame.
    
    Args:
        filename (str): The name of the file
        buffer (BytesIO): File content buffer
        
    Returns:
        DataFrame: Parsed data
    """
    print(f"Attempting to parse file: {filename}")
    
    try:
        if filename.endswith(('.xlsx', '.xls')):
            print(f"Parsing Excel file: {filename}")
            try:
                # Try with default options first
                df = pd.read_excel(buffer)
                print(f"Successfully parsed Excel file with {len(df)} rows and {len(df.columns)} columns")
                return df
            except Exception as e:
                print(f"Error with default Excel parsing: {str(e)}")
                # Try with explicit engine
                buffer.seek(0)
                df = pd.read_excel(buffer, engine='openpyxl')
                print(f"Successfully parsed Excel file with openpyxl engine: {len(df)} rows")
                return df
        
        # For CSV files, try multiple approaches with different encodings and separators
        print(f"Parsing CSV-like file: {filename}")
        
        # Try common encodings
        encodings = ['utf-8', 'latin1', 'iso-8859-1', 'cp1252']
        
        # Try different delimiters for CSV files
        for encoding in encodings:
            for delimiter in [',', ';', '\t', '|']:
                buffer.seek(0)
                try:
                    print(f"Trying with encoding {encoding} and delimiter '{delimiter}'")
                    df = pd.read_csv(buffer, delimiter=delimiter, encoding=encoding)
                    if len(df.columns) > 1:
                        print(f"Successfully parsed with encoding {encoding} and delimiter '{delimiter}': {len(df)} rows")
                        return df
                except Exception as e:
                    print(f"Failed with encoding {encoding} and delimiter '{delimiter}': {str(e)}")
                    continue
        
        # Last attempt with more flexible options
        print("Trying with python engine and automatic delimiter detection")
        buffer.seek(0)
        df = pd.read_csv(
            buffer, 
            sep=None, 
            engine='python',
            encoding_errors='replace'
        )
        
        if len(df) > 0:
            print(f"Successfully parsed with flexible options: {len(df)} rows and {len(df.columns)} columns")
            return df
        else:
            raise Exception(f"Parsed file contains no data rows")
    except Exception as e:
        print(f"All parsing attempts failed for {filename}: {str(e)}")
        # Make one final attempt with read_fwf for fixed-width files
        try:
            buffer.seek(0)
            df = pd.read_fwf(buffer, encoding_errors='replace')
            if len(df) > 0:
                print(f"Successfully parsed as fixed-width file: {len(df)} rows")
                return df
        except Exception as fw_error:
            print(f"Fixed-width parsing also failed: {str(fw_error)}")
        
        raise Exception(f"Could not parse file {filename}: {str(e)}")
    
    # If we get here without returning a DataFrame, something went wrong
    raise Exception(f"Could not parse file {filename} with any available method")

@app.get("/api/integrated-analysis/{analysis_id}")
async def get_integrated_analysis(analysis_id: str):
    """
    Retrieve a previously completed integrated analysis by ID
    """
    if analysis_id not in analyses["integrated"]:
        raise HTTPException(status_code=404, detail="Analyse non trouvée")
    
    return {
        "analysis_id": analysis_id,
        "timestamp": analyses["integrated"][analysis_id].get("timestamp", ""),
        "report": analyses["integrated"][analysis_id].get("report", {})
    }

@app.post("/api/analyze/usr02")
async def analyze_usr02_endpoint(
    file: UploadFile = File(...),
    date_range: Optional[str] = Form(None)
):
    """
    Analyze SAP USR02 file (user master data)
    """
    if not file.filename.endswith(('.csv', '.txt', '.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Le fichier doit être au format CSV, TXT ou Excel")
    
    # Parse date range if provided
    date_range_filter = None
    if date_range:
        try:
            date_range_data = json.loads(date_range)
            date_range_filter = DateRangeFilter(**date_range_data)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Format de plage de dates invalide")
    
    try:
        # Read the file
        contents = await file.read()
        
        # Parse the file into a DataFrame
        df = parse_file_to_dataframe(file.filename, BytesIO(contents))
        
        # Standardize column names
        df.columns = [col.upper() for col in df.columns]
        
        # Create data dictionary
        data = {
            'usr02_df': df,
            # Create empty DataFrames for other tables that might be required
            'agr_users_df': pd.DataFrame(),
            'usr12_df': pd.DataFrame()
        }
        
        # Validate essential fields for USR02
        required_columns = ['MANDT', 'BNAME', 'USTYP', 'UFLAG', 'GLTGV', 'GLTGB', 'TRDAT', 'LTIME']
        for col in required_columns:
            if col not in df.columns:
                # Try to find similar columns
                potential_matches = [c for c in df.columns if col in c]
                if potential_matches:
                    df[col] = df[potential_matches[0]]
                else:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Required column missing: {col}. Columns found: {', '.join(df.columns)}"
                    )
        
        # Perform user analysis
        user_analysis = analyze_users(data)
        
        # Generate a unique analysis ID
        analysis_id = str(uuid.uuid4())
        
        # Store the analysis results
        analyses["usr02"][analysis_id] = {
            "analysis": user_analysis,
            "data": df.to_dict(orient='records'),
            "timestamp": datetime.now().isoformat()
        }
        
        # Return the analysis results along with the analysis ID
        return {
            "analysis_id": analysis_id,
            "timestamp": datetime.now().isoformat(),
            "analysis": user_analysis
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error analyzing USR02 file: {str(e)}")

@app.post("/api/filter/usr02/{analysis_id}")
async def filter_usr02_endpoint(
    analysis_id: str,
    date_range: DateRangeFilter
):
    """
    Filter previously analyzed USR02 data by date
    """
    # Check if the analysis exists
    if analysis_id not in analyses["usr02"]:
        raise HTTPException(status_code=404, detail="Analyse non trouvée")
    
    try:
        # Get the stored data
        stored_data = analyses["usr02"][analysis_id]
        
        if "data" not in stored_data:
            raise HTTPException(status_code=400, detail="Les données de l'analyse sont invalides")
        
        # Create a DataFrame from the stored data
        df = pd.DataFrame(stored_data["data"])
        
        # Apply date filter if applicable
        if date_range and date_range.start_date and date_range.end_date:
            # Convert dates to comparable format
            from datetime import datetime
            start_date = datetime.strptime(date_range.start_date, "%Y-%m-%d")
            end_date = datetime.strptime(date_range.end_date, "%Y-%m-%d")
            
            # Try to filter based on validity dates
            # This is simplified - actual implementation would need to handle SAP date formats
            if 'GLTGV' in df.columns and 'GLTGB' in df.columns:
                # Convert SAP dates to datetime for comparison
                # This is a simplified approach - real implementation would need more robust conversion
                df = df[(df['GLTGV'] >= date_range.start_date) & 
                        (df['GLTGB'] <= date_range.end_date)]
        
        # Create data dictionary for analysis
        data = {
            'usr02_df': df,
            'agr_users_df': pd.DataFrame(),
            'usr12_df': pd.DataFrame()
        }
        
        # Perform user analysis on filtered data
        user_analysis = analyze_users(data)
        
        return {
            "analysis_id": analysis_id,
            "timestamp": datetime.now().isoformat(),
            "filtered_records": len(df),
            "analysis": user_analysis
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error filtering USR02 data: {str(e)}")

@app.get("/api/health")
async def health_check():
    """
    Vérifier que l'API est en ligne
    """
    return {"status": "ok"}

@app.get("/api/audit-types")
async def get_audit_types():
    """
    Retourne les types d'analyses d'audit disponibles
    """
    return {
        "audit_types": [
            {
                "id": "usr02",
                "name": "User Master Records (USR02)",
                "description": "Analyze user accounts, their status, and creation/modification dates"
            },
            {
                "id": "ust12",
                "name": "User Login History (UST12)",
                "description": "Analyze user login activity and identify inactive accounts"
            },
            {
                "id": "agr_users",
                "name": "User Role Assignments (AGR_USERS)",
                "description": "Analyze role assignments and identify high-privilege access"
            },
            {
                "id": "integrated",
                "name": "Integrated Analysis",
                "description": "Full cross-table analysis with comprehensive audit findings and risk assessment"
            }
        ]
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)