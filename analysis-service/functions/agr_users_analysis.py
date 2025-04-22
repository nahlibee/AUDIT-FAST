from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
from io import BytesIO
import re
from datetime import datetime
import uvicorn
from fastapi.responses import JSONResponse

from .date_parser import parse_sap_date



# Fonction pour analyser les données AGR_USERS
def analyze_agr_users(df, date_range=None):
    # Prétraitement des données
    for col in df.columns:
        if 'DATE' in col or 'DAT' in col:
            df[col] = df[col].apply(lambda x: parse_sap_date(x))
    
    # Appliquer le filtre de date si spécifié
    if date_range and date_range.start_date:
        start_date = parse_sap_date(date_range.start_date)
        if start_date:
            df = df[df['FROM_DAT'] >= start_date]
    
    if date_range and date_range.end_date:
        end_date = parse_sap_date(date_range.end_date)
        if end_date:
            df = df[df['FROM_DAT'] <= end_date]
    
    # 1. Statistiques générales
    total_records = len(df)
    unique_roles = df['AGR_NAME'].unique()
    unique_users = df['UNAME'].unique()
    
    # 2. Répartition des rôles
    role_distribution = (
        df.groupby('AGR_NAME')
        .size()
        .reset_index(name='count')
        .sort_values('count', ascending=False)
    )
    
    # 3. Utilisateurs avec le plus de rôles
    top_users = (
        df.groupby('UNAME')
        .size()
        .reset_index(name='count')
        .sort_values('count', ascending=False)
        .head(10)
    )
    
    # 4. Analyse temporelle
    df['month'] = df['FROM_DAT'].apply(
        lambda x: f"{x.year}-{x.month:02d}" if pd.notna(x) else "Inconnu"
    )
    
    timeline_data = (
        df[df['month'] != "Inconnu"]
        .groupby('month')
        .size()
        .reset_index(name='count')
        .sort_values('month')
    )
    
    # 5. Identification des rôles à privilèges élevés
    high_privilege_keywords = ['ADMIN', 'SUPER', 'ROOT', 'MANAGER', 'DIRECTOR', 'SAP_ALL']
    
    high_privilege_roles = [
        role for role in unique_roles
        if any(keyword in str(role).upper() for keyword in high_privilege_keywords)
    ]
    
    users_with_high_privilege = df[df['AGR_NAME'].isin(high_privilege_roles)].copy()
    users_with_high_privilege['from_date'] = users_with_high_privilege['FROM_DAT'].apply(
        lambda x: x.strftime('%Y-%m-%d') if pd.notna(x) else None
    )
    users_with_high_privilege['to_date'] = users_with_high_privilege['TO_DAT'].apply(
        lambda x: x.strftime('%Y-%m-%d') if pd.notna(x) else None
    )
    
    high_privilege_users = []
    for _, row in users_with_high_privilege.iterrows():
        high_privilege_users.append({
            'user': row['UNAME'],
            'role': row['AGR_NAME'],
            'from_date': row['from_date'],
            'to_date': row['to_date']
        })
    
    # Formater les résultats pour le frontend
    result = {
        'generalStats': {
            'totalRecords': total_records,
            'uniqueRolesCount': len(unique_roles),
            'uniqueUsersCount': len(unique_users)
        },
        'roleDistribution': role_distribution.to_dict('records'),
        'topUsers': top_users.to_dict('records'),
        'timelineData': timeline_data.to_dict('records'),
        'highPrivilegeRoles': high_privilege_roles,
        'usersWithHighPrivilegeRoles': high_privilege_users
    }
    
    return result
