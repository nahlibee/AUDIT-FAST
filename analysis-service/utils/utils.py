#!/usr/bin/env python3
"""
Utility functions for the SAP User Analysis Tool
"""

import os
import sys
from datetime import datetime, timedelta

def get_current_date():
    """
    Get the current date in SAP format (YYYYMMDD).
    
    Returns:
        str: Current date in SAP format
    """
    return datetime.now().strftime('%Y%m%d')

def get_past_date(days):
    """
    Get a date in the past in SAP format (YYYYMMDD).
    
    Args:
        days (int): Number of days in the past
        
    Returns:
        str: Past date in SAP format
    """
    past_date = datetime.now() - timedelta(days=days)
    return past_date.strftime('%Y%m%d')

def ensure_directory(directory):
    """
    Ensure that a directory exists, creating it if necessary.
    
    Args:
        directory (str): Directory path
        
    Returns:
        bool: True if the directory exists or was created, False otherwise
    """
    if not os.path.exists(directory):
        try:
            os.makedirs(directory)
            return True
        except OSError:
            return False
    return True

def print_progress(current, total, prefix='Progress', suffix='Complete', length=50):
    """
    Print a progress bar to the console.
    
    Args:
        current (int): Current item
        total (int): Total items
        prefix (str): Prefix string
        suffix (str): Suffix string
        length (int): Bar length
    """
    percent = float(current) / float(total)
    filled_length = int(length * percent)
    bar = '█' * filled_length + '-' * (length - filled_length)
    sys.stdout.write(f'\r{prefix} |{bar}| {percent:.1%} {suffix}')
    sys.stdout.flush()
    
    # Print a new line when complete
    if current == total:
        print()

def chunk_list(lst, chunk_size):
    """
    Split a list into chunks of a specified size.
    
    Args:
        lst (list): List to chunk
        chunk_size (int): Size of each chunk
        
    Returns:
        list: List of chunks
    """
    return [lst[i:i + chunk_size] for i in range(0, len(lst), chunk_size)]

def yes_no_to_boolean(value):
    """
    Convert 'Yes'/'No' string to boolean.
    
    Args:
        value (str): 'Yes' or 'No'
        
    Returns:
        bool: True if 'Yes', False if 'No' or anything else
    """
    return str(value).lower() == 'yes'

def safe_dict_get(d, keys, default=None):
    """
    Safely get a value from a nested dictionary.
    
    Args:
        d (dict): Dictionary to get value from
        keys (list): List of keys to traverse
        default: Default value to return if keys are not found
        
    Returns:
        Value at the specified keys or default
    """
    result = d
    for key in keys:
        if isinstance(result, dict) and key in result:
            result = result[key]
        else:
            return default
    return result