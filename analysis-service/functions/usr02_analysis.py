import pandas as pd
import numpy as np
from datetime import datetime
import logging
from typing import Dict, List, Optional, Tuple, Union
from io import BytesIO

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def analyze_usr02(df: pd.DataFrame, date_range: Optional[Dict[str, str]] = None) -> Dict:
    """
    Analyze USR02 data to extract user information and statistics.
    
    Args:
        df: DataFrame containing USR02 data
        date_range: Optional dictionary with 'start_date' and 'end_date' for filtering
        
    Returns:
        Dictionary containing analysis results
    """
    try:
        # Standardize column names to uppercase
        df.columns = df.columns.str.upper()
        
        # Check for required columns
        required_columns = ['BNAME', 'USTYP', 'GLTGV', 'GLTGB', 'TRDAT']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise ValueError(f"Colonnes requises manquantes: {', '.join(missing_columns)}. "
                           f"Colonnes trouvées: {', '.join(df.columns)}")
        
        # Convert date columns to datetime
        date_columns = ['GLTGV', 'GLTGB', 'TRDAT']
        for col in date_columns:
            if col in df.columns:
                df[col] = pd.to_datetime(df[col], errors='coerce')
        
        # Filter by date range if provided
        if date_range:
            start_date = pd.to_datetime(date_range.get('start_date'))
            end_date = pd.to_datetime(date_range.get('end_date'))
            
            if start_date:
                df = df[df['GLTGV'] >= start_date]
            if end_date:
                df = df[df['GLTGV'] <= end_date]
        
        # Calculate general statistics
        total_users = len(df)
        active_users = len(df[df['USTYP'] == 'A'])  # Assuming 'A' means active
        inactive_users = len(df[df['USTYP'] != 'A'])
        
        # Get user distribution by type
        user_distribution = df['USTYP'].value_counts().reset_index()
        user_distribution.columns = ['type', 'count']
        user_distribution = user_distribution.to_dict('records')
        
        # Prepare user list
        users = []
        for _, row in df.iterrows():
            user = {
                'username': row['BNAME'],
                'type': row['USTYP'],
                'status': 'Active' if row['USTYP'] == 'A' else 'Inactive',
                'lastLogin': row['TRDAT'].strftime('%Y-%m-%d') if pd.notna(row['TRDAT']) else None,
                'validFrom': row['GLTGV'].strftime('%Y-%m-%d') if pd.notna(row['GLTGV']) else None,
                'validTo': row['GLTGB'].strftime('%Y-%m-%d') if pd.notna(row['GLTGB']) else None
            }
            users.append(user)
        
        # Create activity timeline
        activity_timeline = []
        if 'TRDAT' in df.columns and 'USTYP' in df.columns:
            timeline_df = df.groupby(['TRDAT', 'USTYP']).size().unstack(fill_value=0)
            for date, row in timeline_df.iterrows():
                activity_timeline.append({
                    'date': date.strftime('%Y-%m-%d'),
                    'activeUsers': int(row.get('A', 0)),
                    'inactiveUsers': int(row.get('I', 0))
                })
        
        return {
            'generalStats': {
                'totalUsers': total_users,
                'activeUsers': active_users,
                'inactiveUsers': inactive_users
            },
            'userDistribution': user_distribution,
            'users': users,
            'activityTimeline': activity_timeline
        }
        
    except Exception as e:
        logger.error(f"Error analyzing USR02 data: {str(e)}")
        raise ValueError(f"Erreur lors de l'analyse des données USR02: {str(e)}")

def analyze_usr02_file(file_content: bytes, date_range: Optional[Dict[str, str]] = None) -> Dict:
    """
    Analyze a USR02 file and return the analysis results.
    
    Args:
        file_content: Raw file content as bytes
        date_range: Optional dictionary with 'start_date' and 'end_date' for filtering
        
    Returns:
        Dictionary containing analysis results
    """
    try:
        # Create a buffer from the file content
        buffer = BytesIO(file_content)
        
        # Try to read as Excel first
        try:
            df = pd.read_excel(buffer, engine='openpyxl')
        except Exception as e:
            logger.info(f"Failed to read as Excel with openpyxl: {str(e)}")
            try:
                buffer.seek(0)
                df = pd.read_excel(buffer, engine='xlrd')
            except Exception as e:
                logger.info(f"Failed to read as Excel with xlrd: {str(e)}")
                # Try reading as CSV with different encodings and delimiters
                buffer.seek(0)
                try:
                    df = pd.read_csv(buffer, encoding='utf-8', sep=None, engine='python')
                except Exception as e:
                    logger.info(f"Failed to read as UTF-8 CSV: {str(e)}")
                    buffer.seek(0)
                    try:
                        df = pd.read_csv(buffer, encoding='latin1', sep=None, engine='python')
                    except Exception as e:
                        logger.info(f"Failed to read as Latin-1 CSV: {str(e)}")
                        raise ValueError("Impossible de lire le fichier. Format non supporté ou fichier vide.")
        
        # Clean up the DataFrame
        df = df.dropna(how='all').dropna(axis=1, how='all')
        df.columns = df.columns.str.upper()
        
        # Analyze the data
        return analyze_usr02(df, date_range)
        
    except Exception as e:
        logger.error(f"Error processing USR02 file: {str(e)}")
        raise ValueError(f"Erreur lors du traitement du fichier USR02: {str(e)}") 