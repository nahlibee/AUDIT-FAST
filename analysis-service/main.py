import io
import json
import uuid
from fastapi import APIRouter, FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from param import DateRange
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
from io import BytesIO
import re
from datetime import datetime
import uvicorn
from fastapi.responses import JSONResponse

from functions.agr_users_analysis import analyze_agr_users
from functions.ust12_analysis import analyze_ust12, analyze_ust12_file
from functions.usr02_analysis import analyze_usr02_file
from models.models import DateRangeFilter





app = FastAPI(title="SAP Analyzer API", description="API pour l'analyse des données SAP AGR_USERS")





# Configuration CORS pour permettre les requêtes du frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, remplacer par l'URL de votre frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



analyses = {
    "agr_users": {},
    "ust12": {}
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
        
        # Analyse des données
        result = analyze_agr_users(df, date_range)
        return result
    
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


@app.post("/api/analyze/ust12-users")
async def analyze_ust12_users_file(file: UploadFile = File(...), date_range: Optional[DateRangeFilter] = None):

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
        
        # Analyse des données
        result = analyze_agr_users(df, date_range)
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'analyse du fichier: {str(e)}")
    


@app.post("/api/integrate-data")
async def integrate_data(
    agr_users_file: UploadFile = File(None), 
    usr02_file: UploadFile = File(None),
    ust12_file: UploadFile = File(None)
):
    """
    Intègre et analyse les données de plusieurs tables SAP
    """
    # TODO: Implémenter l'intégration des données des autres tables SAP
    return {"message": "Fonctionnalité en cours de développement"}

@app.post("/api/analyze/ust12")
async def analyze_ust12_endpoint(file: UploadFile = File(...), date_range: Optional[DateRangeFilter] = None):
    """
    Analyse un fichier d'extraction de la table UST12
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
        
        # Analyse des données
        result = analyze_ust12(df, date_range)
        
        # Générer un ID unique pour cette analyse
        analysis_id = str(uuid.uuid4())
        
        # Stocker les résultats d'analyse
        analyses["ust12"][analysis_id] = result
        
        # Ajouter l'ID d'analyse au résultat
        result["analysis_id"] = analysis_id
        
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'analyse du fichier UST12: {str(e)}")

@app.post("/api/filter/ust12/{analysis_id}")
async def filter_ust12(analysis_id: str, date_range: DateRangeFilter):
    """
    Filtre les résultats d'analyse UST12 par plage de dates
    """
    if analysis_id not in analyses["ust12"]:
        raise HTTPException(status_code=404, detail="ID d'analyse non trouvé")
    
    try:
        # Récupérer les résultats d'analyse précédents
        # Pour une implémentation complète, on devrait réanalyser avec les nouveaux filtres
        result = analyses["ust12"][analysis_id]
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du filtrage des données UST12: {str(e)}")

@app.get("/api/ust12-data/{analysis_id}")
async def get_ust12_analysis(analysis_id: str):
    """
    Récupère une analyse UST12 stockée par ID
    """
    if analysis_id not in analyses["ust12"]:
        raise HTTPException(status_code=404, detail="ID d'analyse non trouvé")
    
    return analyses["ust12"][analysis_id]

@app.post("/api/analyze/usr02")
async def analyze_usr02_endpoint(
    file: UploadFile = File(...),
    date_range: Optional[str] = Form(None)
):
    try:
        # Check file type
        if not file.filename.lower().endswith(('.csv', '.txt', '.xlsx', '.xls')):
            raise HTTPException(
                status_code=400,
                detail="Format de fichier non supporté. Utilisez CSV, TXT ou Excel."
            )
        
        # Read file content
        contents = await file.read()
        if not contents:
            raise HTTPException(
                status_code=400,
                detail="Le fichier est vide"
            )
        
        # Parse date range if provided
        date_range_data = None
        if date_range:
            try:
                date_range_data = json.loads(date_range)
            except json.JSONDecodeError:
                raise HTTPException(
                    status_code=400,
                    detail="Format de plage de dates invalide"
                )
        
        # Analyze the file
        result = analyze_usr02_file(contents, date_range_data)
        
        # Generate a unique analysis ID
        analysis_id = str(uuid.uuid4())
        
        # Store the result
        analyses["usr02"][analysis_id] = result
        
        # Add the analysis ID to the response
        result['analysis_id'] = analysis_id
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@app.post("/api/filter/usr02/{analysis_id}")
async def filter_usr02_endpoint(
    analysis_id: str,
    date_range: DateRangeFilter
):
    try:
        # Get the original analysis result
        if analysis_id not in analyses["usr02"]:
            raise HTTPException(
                status_code=404,
                detail="Analyse non trouvée"
            )
        
        original_result = analyses["usr02"][analysis_id]
        
        # Create a new analysis with the filtered date range
        date_range_data = {
            'start_date': date_range.start_date,
            'end_date': date_range.end_date
        }
        
        # Return the filtered result
        return {
            **original_result,
            'analysis_id': analysis_id
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@app.get("/api/health")
async def health_check():
    """
    Vérifier que l'API est en ligne
    """
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)