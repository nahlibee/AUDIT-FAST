from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional
from io import BytesIO

from .date_parser import parse_sap_date

def analyze_ust12(df, date_range=None):
    """
    Analyze UST12 table data for user activity and last login information
    
    Parameters:
    -----------
    df : pandas.DataFrame
        The dataframe containing UST12 data
    date_range : Optional[DateRangeFilter]
        Optional date range filter to apply
        
    Returns:
    --------
    dict
        A dictionary containing analysis results
    """
    # Standardize column names
    df.columns = [col.upper() for col in df.columns]
    
    # Ensure required columns exist
    required_columns = ['MANDT', 'OBJCT', 'FIELD', 'VON', 'BIS']
    missing_columns = [col for col in required_columns if col not in df.columns]
    
    if missing_columns:
        raise ValueError(
            f"Colonnes requises manquantes: {', '.join(missing_columns)}. "
            f"Colonnes trouvées: {', '.join(df.columns)}"
        )
    
    # Validate data types and content
    try:
        # Convert date columns
        for col in ['BIS']:
            df[col] = df[col].apply(lambda x: parse_sap_date(x))
        
        # Check for required values in key columns
        if df['OBJCT'].isna().all():
            raise ValueError("La colonne OBJCT ne contient pas de données valides")
        
        if df['VON'].isna().all():
            raise ValueError("La colonne VON ne contient pas de données valides")
        
        # Filter for relevant records (login activity)
        login_records = df[(df['OBJCT'] == 'S_USER') | (df['FIELD'] == 'LOGON_DATA')].copy()
        
        if len(login_records) == 0:
            raise ValueError("Aucun enregistrement de connexion trouvé dans le fichier")
        
    except Exception as e:
        raise ValueError(f"Erreur lors de la validation des données: {str(e)}")
    
    # Apply date range filter if specified
    if date_range and date_range.start_date:
        start_date = parse_sap_date(date_range.start_date)
        if start_date:
            df = df[df['BIS'] >= start_date]
    
    if date_range and date_range.end_date:
        end_date = parse_sap_date(date_range.end_date)
        if end_date:
            df = df[df['BIS'] <= end_date]
    
    # 1. Collect General Statistics
    total_records = len(df)
    unique_users = len(df['VON'].unique())
    
    # 2. Analyze user activity (users typically found in the VON field for login records)
    # Filter relevant records for login activity
    login_records = df[(df['OBJCT'] == 'S_USER') | (df['FIELD'] == 'LOGON_DATA')].copy()
    
    # Current date for calculations
    current_date = datetime.now()
    
    # Prepare user activity data
    user_activity = {}
    login_data = []
    
    for _, row in login_records.iterrows():
        username = row['VON']
        login_date = row['BIS']
        
        if pd.notna(username) and pd.notna(login_date):
            days_since_login = (current_date - login_date).days if login_date else None
            
            # Store in user_activity dict - keep only the most recent login for each user
            if username not in user_activity or (user_activity[username]['last_login'] and login_date > user_activity[username]['last_login']):
                user_activity[username] = {
                    'last_login': login_date,
                    'days_since_login': days_since_login,
                    'formatted_last_login': login_date.strftime('%Y-%m-%d') if login_date else None
                }
            
            # Add to login_data list for timeline analysis
            login_data.append({
                'user': username,
                'login_date': login_date,
                'month': login_date.strftime('%Y-%m') if login_date else 'Unknown'
            })
    
    # 3. Identify inactive users (no login for 90+ days)
    inactive_users = []
    
    for username, activity in user_activity.items():
        if activity['days_since_login'] is None or activity['days_since_login'] > 90:
            status = 'Critical' if activity['days_since_login'] is None or activity['days_since_login'] > 180 else 'High Risk'
            
            inactive_users.append({
                'user': username,
                'last_login': activity['formatted_last_login'] or 'Never',
                'days_since_login': activity['days_since_login'] or float('inf'),
                'status': status
            })
    
    # Sort inactive users by days_since_login (descending)
    inactive_users = sorted(inactive_users, key=lambda x: x['days_since_login'], reverse=True)
    
    # 4. Create login timeline data (activity over time)
    login_df = pd.DataFrame(login_data)
    
    if not login_df.empty and 'month' in login_df.columns:
        timeline_data = (
            login_df[login_df['month'] != 'Unknown']
            .groupby('month')
            .size()
            .reset_index(name='count')
            .sort_values('month')
        ).to_dict('records')
    else:
        timeline_data = []
    
    # 5. Calculate inactivity distribution
    inactivity_distribution = {
        'never_logged': len([u for u in inactive_users if u['days_since_login'] == float('inf')]),
        'critical': len([u for u in inactive_users if u['days_since_login'] != float('inf') and u['days_since_login'] > 180]),
        'high_risk': len([u for u in inactive_users if u['days_since_login'] != float('inf') and 90 < u['days_since_login'] <= 180]),
        'medium_risk': len([u for u in inactive_users if u['days_since_login'] != float('inf') and 30 < u['days_since_login'] <= 90])
    }
    
    # 6. Calculate activity metrics
    activity_metrics = {
        'active_users': unique_users - len(inactive_users),
        'inactive_users': len(inactive_users),
        'inactive_percentage': round((len(inactive_users) / unique_users * 100) if unique_users > 0 else 0, 1)
    }
    
    # Format the results for the frontend
    result = {
        'generalStats': {
            'totalRecords': total_records,
            'uniqueUsersCount': unique_users,
            'lastUpdated': current_date.strftime('%Y-%m-%d')
        },
        'inactiveUsers': inactive_users,
        'timelineData': timeline_data,
        'inactivityDistribution': inactivity_distribution,
        'activityMetrics': activity_metrics
    }
    
    return result

# Function to parse UST12 file directly
def analyze_ust12_file(file_content, date_range=None):
    """
    Analyze UST12 file directly from uploaded content
    
    Parameters:
    -----------
    file_content : bytes
        The content of the uploaded file
    date_range : Optional[DateRangeFilter]
        Optional date range filter to apply
        
    Returns:
    --------
    dict
        A dictionary containing analysis results
    """
    buffer = BytesIO(file_content)
    df = None
    
    try:
        # Check if file is empty
        if len(file_content) == 0:
            raise ValueError("Le fichier est vide")
            
        # Try to read the file
        try:
            df = pd.read_csv(
                buffer,
                sep=None,  # Try to infer separator
                engine='python',
                encoding='utf-8',
                on_bad_lines='skip'
            )
        except:
            # If CSV reading fails, try Excel
            buffer.seek(0)
            try:
                df = pd.read_excel(buffer)
            except Exception as e:
                raise ValueError(f"Impossible de lire le fichier: {str(e)}")
        
        if df is None or len(df.columns) <= 1:
            raise ValueError("Impossible de créer un DataFrame valide à partir du fichier")
            
        # Clean up the DataFrame
        df = df.dropna(how='all')  # Remove empty rows
        df = df.dropna(axis=1, how='all')  # Remove empty columns
        
        if len(df) == 0:
            raise ValueError("Le fichier ne contient aucune donnée après nettoyage")
            
        # Standardize column names
        df.columns = [str(col).strip().upper() for col in df.columns]
        
        return analyze_ust12(df, date_range)
    
    except Exception as e:
        error_msg = f"Erreur lors de l'analyse du fichier UST12: {str(e)}"
        print(error_msg)  # Log the error
        raise ValueError(error_msg)