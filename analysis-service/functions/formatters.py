#!/usr/bin/env python3
"""
Formatting utilities for SAP data

This module provides functions to format SAP-specific data formats
into more readable formats for output.
"""

from datetime import datetime
import pandas as pd
from config import CONFIG

def format_sap_date(date_str):
    """
    Convert SAP date format (YYYYMMDD) to readable date format.
    
    Args:
        date_str: Date string in SAP format
        
    Returns:
        str: Formatted date string or "Not available" if invalid
    """
    if pd.isna(date_str) or str(date_str).strip() in ['', 'nan', '00000000']:
        return "Not available"
    
    try:
        # Remove decimals and convert to string
        date_str = str(int(float(date_str)))
        
        # Format date if it's a valid 8-digit string
        if len(date_str) == 8:
            date_obj = datetime.strptime(date_str, CONFIG['sap_date_format'])
            return date_obj.strftime(CONFIG['output_date_format'])
        return date_str
    except (ValueError, TypeError):
        # If conversion fails, return as is
        return str(date_str)

def format_sap_time(time_str):
    """
    Convert SAP time format (HHMMSS) to readable time format.
    
    Args:
        time_str: Time string in SAP format
        
    Returns:
        str: Formatted time string or "Not available" if invalid
    """
    if pd.isna(time_str) or str(time_str).strip() in ['', 'nan', '000000']:
        return "Not available"
    
    try:
        # Remove decimals and convert to string
        time_str = str(int(float(time_str))).zfill(6)
        
        # Format time if it's a valid 6-digit string
        if len(time_str) == 6:
            time_obj = datetime.strptime(time_str, CONFIG['sap_time_format'])
            return time_obj.strftime(CONFIG['output_time_format'])
        return time_str
    except (ValueError, TypeError):
        # If conversion fails, return as is
        return str(time_str)

def format_sap_datetime(date_str, time_str):
    """
    Combine and format SAP date and time.
    
    Args:
        date_str: Date string in SAP format
        time_str: Time string in SAP format
        
    Returns:
        str: Formatted date and time string
    """
    date_formatted = format_sap_date(date_str)
    time_formatted = format_sap_time(time_str)
    
    if date_formatted == "Not available" and time_formatted == "Not available":
        return "Not available"
    elif date_formatted == "Not available":
        return f"Unknown date at {time_formatted}"
    elif time_formatted == "Not available":
        return f"{date_formatted} at unknown time"
    else:
        return f"{date_formatted} {time_formatted}"

def format_user_type(type_code):
    """
    Convert SAP user type code to descriptive text.
    
    Args:
        type_code: SAP user type code (A, B, C, etc.)
        
    Returns:
        str: Descriptive user type
    """
    if pd.isna(type_code) or str(type_code).strip() == '':
        return "Unknown"
    
    return CONFIG['user_type_map'].get(
        type_code, 
        f"Unknown ({type_code})"
    )

def format_boolean_flag(flag):
    """
    Format SAP boolean flag (X) to Yes/No.
    
    Args:
        flag: SAP boolean flag
        
    Returns:
        str: "Yes" if flag is "X", "No" otherwise
    """
    if pd.isna(flag) or str(flag).strip() == '':
        return "No"
    
    return "Yes" if str(flag).upper() == 'X' else "No"

def format_validity_period(from_date, to_date):
    """
    Format validity period from from/to dates.
    
    Args:
        from_date: Start date in SAP format
        to_date: End date in SAP format
        
    Returns:
        str: Formatted validity period
    """
    from_formatted = format_sap_date(from_date)
    to_formatted = format_sap_date(to_date)
    
    # Handle special case for permanent validity (9999-12-31)
    if to_formatted.startswith("29") or to_formatted.startswith("99"):
        return f"Since {from_formatted} (unlimited)"
    
    return f"{from_formatted} to {to_formatted}"