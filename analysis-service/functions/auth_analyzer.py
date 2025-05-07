#!/usr/bin/env python3
"""
Authorization analyzer module for the SAP User Analysis Tool

This module analyzes authorization data from the USR12 table.
"""

import pandas as pd
from config import CONFIG, SAP_MANDT_FIELD, SAP_AUTH_USER_FIELD

def analyze_authorizations(data):
    """
    Analyze authorization data from the USR12 table.
    
    Args:
        data (dict): Dictionary containing DataFrames for each loaded table
        
    Returns:
        dict: Dictionary containing authorization analysis results
    """
    print("\n======= ANALYZE AUTHORIZATIONS FUNCTION STARTED =======")
    print(f"USR12 DataFrame shape: {data['usr12_df'].shape}")
    print(f"USR12 columns: {data['usr12_df'].columns.tolist()}")
    
    # Ensure we have the necessary fields
    if 'OBJCT' not in data['usr12_df'].columns:
        print("ERROR: OBJCT column not found in USR12 DataFrame")
        potential_obj_cols = [col for col in data['usr12_df'].columns if 'OBJ' in col]
        if potential_obj_cols:
            print(f"Potential object columns found: {potential_obj_cols}")
            # If we find a potential match, use that instead
            data['usr12_df']['OBJCT'] = data['usr12_df'][potential_obj_cols[0]]
    
    # Ensure the username field exists
    if SAP_AUTH_USER_FIELD not in data['usr12_df'].columns:
        print(f"ERROR: Username field {SAP_AUTH_USER_FIELD} not found in USR12 DataFrame")
        # Try to find potential username column
        potential_user_cols = [col for col in data['usr12_df'].columns if 'NAME' in col or 'USER' in col]
        if potential_user_cols:
            print(f"Potential username columns found: {potential_user_cols}")
            # If we find a potential match, use that instead
            data['usr12_df'][SAP_AUTH_USER_FIELD] = data['usr12_df'][potential_user_cols[0]]
        else:
            print("No potential username columns found. Authorization analysis will be limited.")
    
    auth_analysis = {
        'authorizations': [],
        'auth_objects': [],
        'stats': {
            'total_authorizations': 0,
            'total_auth_objects': 0,
            'auth_objects_per_user': {},
            'top_auth_objects': {}
        }
    }
    
    # Fallback to empty list if OBJCT column doesn't exist
    if 'OBJCT' not in data['usr12_df'].columns:
        print("WARNING: OBJCT column missing, returning empty analysis")
        return auth_analysis
    
    # Get unique authorization objects
    unique_objects = data['usr12_df']['OBJCT'].unique()
    auth_analysis['stats']['total_auth_objects'] = len(unique_objects)
    
    print(f"Found {len(unique_objects)} unique authorization objects")
    
    # Process each authorization
    for index, auth in data['usr12_df'].iterrows():
        try:
            # Get key fields with error handling
            if SAP_MANDT_FIELD not in auth:
                print(f"Warning: MANDT field ({SAP_MANDT_FIELD}) not found for auth at index {index}")
                client = "000"  # Default client as fallback
            else:
                client = auth[SAP_MANDT_FIELD]
            
            if SAP_AUTH_USER_FIELD not in auth:
                print(f"Error: Username field ({SAP_AUTH_USER_FIELD}) not found for auth at index {index}")
                continue  # Skip this authorization
            
            username = auth[SAP_AUTH_USER_FIELD]
            
            if pd.isna(username) or str(username).strip() == '':
                print(f"Warning: Empty username at index {index}, skipping")
                continue
            
            if 'OBJCT' not in auth:
                print(f"Error: OBJCT field not found for auth at index {index}")
                continue
                
            object_name = auth['OBJCT']
            field_name = auth.get('FIELD', '')
            from_value = auth.get('VON', '')
            to_value = auth.get('BIS', '')
            
            # Create authorization data structure
            authorization = {
                'client': client,
                'username': username,
                'object': object_name,
                'field': field_name,
                'from_value': from_value,
                'to_value': to_value,
                'is_wildcard': _is_wildcard_value(from_value, to_value)
            }
            
            # Update statistics
            auth_analysis['stats']['total_authorizations'] += 1
            
            # Track auth objects per user
            user_key = f"{client}:{username}"
            if user_key not in auth_analysis['stats']['auth_objects_per_user']:
                auth_analysis['stats']['auth_objects_per_user'][user_key] = set()
            auth_analysis['stats']['auth_objects_per_user'][user_key].add(object_name)
            
            # Track top auth objects
            if object_name in auth_analysis['stats']['top_auth_objects']:
                auth_analysis['stats']['top_auth_objects'][object_name] += 1
            else:
                auth_analysis['stats']['top_auth_objects'][object_name] = 1
            
            # Add authorization to results
            auth_analysis['authorizations'].append(authorization)
            
        except Exception as e:
            print(f"Error processing authorization at index {index}: {str(e)}")
            import traceback
            print(traceback.format_exc())
    
    # Calculate auth object frequency
    auth_objects = data['usr12_df']['OBJCT'].value_counts().to_dict()
    
    # Add auth object data
    for object_name in unique_objects:
        object_data = {
            'object_name': object_name,
            'auth_count': auth_objects.get(object_name, 0),
            'fields': _get_fields_for_object(data['usr12_df'], object_name)
        }
        auth_analysis['auth_objects'].append(object_data)
    
    # Sort auth objects by count
    auth_analysis['auth_objects'] = sorted(
        auth_analysis['auth_objects'],
        key=lambda x: x['auth_count'],
        reverse=True
    )
    
    # Convert sets to counts for auth_objects_per_user
    for user_key in auth_analysis['stats']['auth_objects_per_user']:
        auth_analysis['stats']['auth_objects_per_user'][user_key] = len(
            auth_analysis['stats']['auth_objects_per_user'][user_key]
        )
    
    print(f"Analysis complete. Found {auth_analysis['stats']['total_authorizations']} authorizations")
    print("======= ANALYZE AUTHORIZATIONS FUNCTION COMPLETED =======\n")
    
    return auth_analysis

def get_user_authorizations(auth_data, client, username):
    """
    Get all authorizations for a specific user.
    
    Args:
        auth_data (dict): Authorization analysis data
        client (str): Client ID
        username (str): Username
        
    Returns:
        dict: Dictionary of authorizations grouped by object
    """
    user_auths = {}
    
    # Filter authorizations for the user
    user_auth_list = [
        auth for auth in auth_data.get('authorizations', [])
        if auth['client'] == client and auth['username'] == username
    ]
    
    # Group by object
    for auth in user_auth_list:
        object_name = auth['object']
        if object_name not in user_auths:
            user_auths[object_name] = []
        user_auths[object_name].append(auth)
    
    return user_auths

def _is_wildcard_value(from_value, to_value):
    """
    Check if an authorization value is a wildcard.
    
    Args:
        from_value (str): From value
        to_value (str): To value
        
    Returns:
        bool: True if wildcard, False otherwise
    """
    # Check for typical wildcard patterns in SAP
    wildcard_patterns = ['*', '%']
    
    # Check if either value contains a wildcard
    for pattern in wildcard_patterns:
        if str(from_value).strip() == pattern or str(to_value).strip() == pattern:
            return True
    
    return False

def _get_fields_for_object(usr12_df, object_name):
    """
    Get list of unique fields for a specific authorization object.
    
    Args:
        usr12_df (DataFrame): USR12 DataFrame
        object_name (str): Authorization object name
        
    Returns:
        list: List of field names
    """
    # Filter DataFrame for the object
    object_auths = usr12_df[usr12_df['OBJCT'] == object_name]
    
    # Get unique fields
    fields = object_auths['FIELD'].unique().tolist()
    
    return fields