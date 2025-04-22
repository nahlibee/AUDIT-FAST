from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
from io import BytesIO
import uuid

from functions.ust12_analysis import analyze_ust12_file
from models.models import DateRangeFilter

# Create a router for UST12 endpoints
router = APIRouter(
    prefix="/api",
    tags=["ust12"],
    responses={404: {"description": "Not found"}},
)

# Store analysis results with ID for reference
ust12_analyses = {}

@router.post("/analyze/ust12")
async def analyze_ust12_file_endpoint(file: UploadFile = File(...), date_range: Optional[DateRangeFilter] = None):
    """
    Analyze a UST12 table extraction file
    """
    # Check file type
    if not file.filename.endswith(('.csv', '.txt', '.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="File must be CSV, TXT, or Excel format")
    
    # Read file content
    contents = await file.read()
    
    try:
        # Analyze the data
        result = analyze_ust12_file(contents, date_range)
        
        # Generate a unique ID for this analysis
        analysis_id = str(uuid.uuid4())
        
        # Store the analysis results
        ust12_analyses[analysis_id] = result
        
        # Add the analysis ID to the result
        result['analysis_id'] = analysis_id
        
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing UST12 file: {str(e)}")

@router.post("/filter/ust12/{analysis_id}")
async def filter_ust12_data(analysis_id: str, date_range: DateRangeFilter):
    """
    Filter existing UST12 analysis results by date range
    """
    if analysis_id not in ust12_analyses:
        raise HTTPException(status_code=404, detail="Analysis ID not found")
    
    try:
        # Get the original data (would need to store the original DataFrame or file)
        # For now, we'll just return the stored results
        result = ust12_analyses[analysis_id].copy()
        
        # In a real implementation, you would reanalyze the data with the new date range
        # result = analyze_ust12(original_data, date_range)
        
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error filtering UST12 data: {str(e)}")

@router.get("/ust12-data/{analysis_id}")
async def get_ust12_analysis(analysis_id: str):
    """
    Retrieve a stored UST12 analysis by ID
    """
    if analysis_id not in ust12_analyses:
        raise HTTPException(status_code=404, detail="Analysis ID not found")
    
    return ust12_analyses[analysis_id]