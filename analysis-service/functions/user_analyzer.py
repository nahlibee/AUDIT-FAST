#!/usr/bin/env python3
"""
User analyzer module for the SAP User Analysis Tool

This module analyzes user master data from the USR02 table
and correlates it with role and authorization data.
"""

from datetime import datetime
import pandas as pd
from functions.formatters import (
    format_sap_date, 
    format_sap_time, 
    format_user_type,
    format_boolean_flag,
    format_sap_datetime
)
from config import CONFIG, SAP_MANDT_FIELD, SAP_USER_FIELD

def analyze_users(data):
    """
    Analyze user data from the USR02 table.
    
    Args:
        data (dict): Dictionary containing DataFrames for each loaded table
        
    Returns:
        dict: Dictionary containing user analysis results
    """
    print("\n======= ANALYZE USERS FUNCTION STARTED =======")
    print(f"USR02 DataFrame shape: {data['usr02_df'].shape}")
    print(f"USR02 columns: {data['usr02_df'].columns.tolist()}")
    
    if 'BNAME' not in data['usr02_df'].columns:
        print("CRITICAL ERROR: BNAME column not found in USR02 DataFrame!")
        # Try to find similar columns
        potential_bname_cols = [col for col in data['usr02_df'].columns if 'NAME' in col or 'USER' in col]
        if potential_bname_cols:
            print(f"Potential username columns found: {potential_bname_cols}")
        
        # Fall back to the first column for testing
        if not data['usr02_df'].empty and len(data['usr02_df'].columns) > 0:
            print(f"First few rows of USR02:")
            print(data['usr02_df'].head(3).to_string())
    
    user_analysis = {
        'users': [],
        'stats': {
            'total_users': 0,
            'locked_users': 0,
            'expired_users': 0,
            'never_logged_in': 0,
            'initial_password': 0,
            'user_types': {}
        }
    }
    
    # Get current date for comparison
    today = datetime.now().strftime(CONFIG['sap_date_format'])
    
    print(f"Processing {len(data['usr02_df'])} users from USR02 table")
    
    # Process each user
    for index, user in data['usr02_df'].iterrows():
        try:
            # Get key fields with extensive error handling
            if SAP_MANDT_FIELD not in user:
                print(f"Warning: MANDT field ({SAP_MANDT_FIELD}) not found for user at index {index}")
                client = "000"  # Default client as fallback
            else:
                client = user[SAP_MANDT_FIELD]
            
            if SAP_USER_FIELD not in user:
                print(f"Error: Username field ({SAP_USER_FIELD}) not found for user at index {index}")
                print(f"Available fields: {user.index.tolist()}")
                continue  # Skip this user
            
            username = user[SAP_USER_FIELD]
            
            if pd.isna(username) or str(username).strip() == '':
                print(f"Warning: Empty username at index {index}, skipping")
                continue
                
            print(f"Processing user: {username} (Client: {client})")
            
            # Create user data structure
            user_data = {
                'client': client,
                'username': username,
                'user_type': format_user_type(user.get('USTYP', '')),
                'locked': format_boolean_flag(user.get('UFLAG', '')),
                'initial_password': format_boolean_flag(user.get('PWDINITIAL', '')),
                'validity': {
                    'from_date': format_sap_date(user.get('GLTGV', '')),
                    'to_date': format_sap_date(user.get('GLTGB', '')),
                    'is_expired': _is_date_expired(user.get('GLTGB', ''), today)
                },
                'activity': {
                    'last_login': format_sap_datetime(
                        user.get('TRDAT', ''), 
                        user.get('LTIME', '')
                    ),
                    'last_password_change': format_sap_datetime(
                        user.get('PWDLGNDATE', ''), 
                        user.get('PWDLGNTIME', '')
                    ),
                    'first_login': _get_first_login(user)
                }
            }
            
            # Update statistics
            user_analysis['stats']['total_users'] += 1
            
            if user_data['locked'] == 'Yes':
                user_analysis['stats']['locked_users'] += 1
                
            if user_data['validity']['is_expired']:
                user_analysis['stats']['expired_users'] += 1
                
            if user_data['initial_password'] == 'Yes':
                user_analysis['stats']['initial_password'] += 1
                
            if user.get('TRDAT', '') == '' or pd.isna(user.get('TRDAT', '')):
                user_analysis['stats']['never_logged_in'] += 1
                
            # Track user types
            user_type = user_data['user_type']
            if user_type in user_analysis['stats']['user_types']:
                user_analysis['stats']['user_types'][user_type] += 1
            else:
                user_analysis['stats']['user_types'][user_type] = 1
            
            # Add user data to results
            user_analysis['users'].append(user_data)
            
        except Exception as e:
            print(f"Error processing user at index {index}: {str(e)}")
            import traceback
            print(traceback.format_exc())
    
    print(f"Analysis complete. Found {len(user_analysis['users'])} users")
    print("User types found:", user_analysis['stats']['user_types'])
    print("======= ANALYZE USERS FUNCTION COMPLETED =======\n")
    
    return user_analysis

def get_user_details(user_data, role_data, auth_data):
    """
    Combine user data with role and authorization data for a comprehensive view.
    
    Args:
        user_data (dict): User master data
        role_data (dict): Role assignment data
        auth_data (dict): Authorization data
        
    Returns:
        dict: Combined user details
    """
    # Find user's roles and authorizations
    client = user_data['client']
    username = user_data['username']
    
    user_roles = [
        role for role in role_data.get('roles', [])
        if role['client'] == client and role['username'] == username
    ]
    
    user_auths = [
        auth for auth in auth_data.get('authorizations', [])
        if auth['client'] == client and auth['username'] == username
    ]
    
    # Combine all data
    user_details = {
        **user_data,
        'roles': user_roles,
        'authorizations': user_auths
    }
    
    return user_details

def _is_date_expired(date_str, compare_date):
    """
    Check if a date is expired compared to another date.
    
    Args:
        date_str (str): Date to check in SAP format (YYYYMMDD)
        compare_date (str): Date to compare against in SAP format
        
    Returns:
        bool: True if date is expired, False otherwise
    """
    if pd.isna(date_str) or str(date_str).strip() == '':
        return False
        
    try:
        # Handle permanent dates (99991231 or similar)
        if str(date_str).startswith('9999') or str(date_str).startswith('2999'):
            return False
            
        # Convert to integers for comparison
        date_int = int(float(date_str))
        compare_int = int(float(compare_date))
        
        return date_int < compare_int
    except (ValueError, TypeError):
        return False

def _get_first_login(user):
    """
    Estimate first login date based on available data.
    This is a best effort since SAP doesn't directly store first login.
    
    Args:
        user (Series): User data row from USR02
        
    Returns:
        str: Estimated first login or "Not available"
    """
    # This is a heuristic - SAP doesn't directly store first login
    # We can use password change date as a proxy in some cases
    pw_date = user.get('PWDLGNDATE', '')
    pw_time = user.get('PWDLGNTIME', '')
    
    if not pd.isna(pw_date) and str(pw_date).strip() != '':
        return format_sap_datetime(pw_date, pw_time) + " (estimated from password change)"
    
    return "Not available"