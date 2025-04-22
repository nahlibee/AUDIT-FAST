# Fonction pour parser les dates SAP
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



def parse_sap_date(date_str):
    if pd.isna(date_str) or date_str == "":
        return None
    
    # Convert string to string if it's a number type
    if isinstance(date_str, (int, float)):
        date_str = str(int(date_str))
        
    # Format YYYYMMDD
    if re.match(r'^\d{8}$', str(date_str)):
        year = int(date_str[0:4])
        month = int(date_str[4:6])
        day = int(date_str[6:8])
        try:
            return datetime(year, month, day)
        except ValueError:
            return None
    
    # Essayer avec pandas
    try:
        return pd.to_datetime(date_str)
    except:
        return None