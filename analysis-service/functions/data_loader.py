#!/usr/bin/env python3
"""
Data loader module for the SAP User Analysis Tool

This module handles loading and validating data from the required CSV files:
- USR02: User master data
- AGR_USERS: User role assignments
- USR12: User authorizations
"""

import os
import pandas as pd
from config import CONFIG, REQUIRED_FIELDS

def load_data(config):
    """
    Load data from the required CSV files.
    
    Args:
        config (dict): Configuration dictionary
        
    Returns:
        dict: Dictionary containing DataFrames for each loaded table
        
    Raises:
        FileNotFoundError: If any required file is not found
        Exception: For other loading errors
    """
    data = {}
    
    # Construct file paths
    usr02_path = os.path.join(config['input_dir'], config['usr02_file'])
    agr_users_path = os.path.join(config['input_dir'], config['agr_users_file'])
    usr12_path = os.path.join(config['input_dir'], config['usr12_file'])
    
    # Check if files exist
    for file_path, file_name in [
        (usr02_path, 'USR02'),
        (agr_users_path, 'AGR_USERS'),
        (usr12_path, 'USR12')
    ]:
        if not os.path.exists(file_path):
            raise FileNotFoundError(
                f"File not found: {file_path}. Please ensure the {file_name} "
                f"file is in the specified directory."
            )
    
    # Load data from CSV files
    try:
        data['usr02_df'] = pd.read_csv(usr02_path)
        data['agr_users_df'] = pd.read_csv(agr_users_path)
        data['usr12_df'] = pd.read_csv(usr12_path)
        return data
    except Exception as e:
        raise Exception(f"Error loading data: {str(e)}")

def validate_data(data):
    """
    Validate that the loaded data has the required fields.
    
    Args:
        data (dict): Dictionary containing DataFrames for each loaded table
        
    Raises:
        ValueError: If any required field is missing
    """
    validation_errors = []
    
    # Print column names for debugging
    print("Validating data with the following columns:")
    print("AGR_USERS columns:", data['agr_users_df'].columns.tolist())
    print("USR02 columns:", data['usr02_df'].columns.tolist())
    print("USR12 columns:", data['usr12_df'].columns.tolist())
    
    # Create case-insensitive column maps for each DataFrame
    agr_columns = {col.upper(): col for col in data['agr_users_df'].columns}
    usr02_columns = {col.upper(): col for col in data['usr02_df'].columns}
    usr12_columns = {col.upper(): col for col in data['usr12_df'].columns}
    
    print("AGR_USERS case-insensitive map:", agr_columns)
    print("USR02 case-insensitive map:", usr02_columns)
    print("USR12 case-insensitive map:", usr12_columns)
    
    # Standardize column names to make them case-insensitive - this is critical for SAP data
    # Some extractions may use lowercase or mixed case column names
    print("Standardizing column names to uppercase...")
    
    # Create a copy of each DataFrame with standardized column names
    data['usr02_df_std'] = data['usr02_df'].copy()
    data['agr_users_df_std'] = data['agr_users_df'].copy()
    data['usr12_df_std'] = data['usr12_df'].copy()
    
    # Rename columns to uppercase in the standardized DataFrames
    data['usr02_df_std'].columns = [col.upper() for col in data['usr02_df'].columns]
    data['agr_users_df_std'].columns = [col.upper() for col in data['agr_users_df'].columns]
    data['usr12_df_std'].columns = [col.upper() for col in data['usr12_df'].columns]
    
    # Use standardized DataFrames for the rest of validation and processing
    data['usr02_df'] = data['usr02_df_std']
    data['agr_users_df'] = data['agr_users_df_std']
    data['usr12_df'] = data['usr12_df_std']
    
    print("Columns after standardization:")
    print("AGR_USERS columns:", data['agr_users_df'].columns.tolist())
    print("USR02 columns:", data['usr02_df'].columns.tolist())
    print("USR12 columns:", data['usr12_df'].columns.tolist())
    
    # Check for required fields in USR02 with case insensitivity
    required_usr02 = ['BNAME', 'USTYP']
    missing_usr02 = []
    for field in required_usr02:
        if field.upper() not in [col.upper() for col in data['usr02_df'].columns]:
            missing_usr02.append(field)
            print(f"Missing USR02 field: {field}")
    
    if missing_usr02:
        err_msg = f"Required fields missing from USR02 table: {', '.join(missing_usr02)}"
        validation_errors.append(err_msg)
        print(err_msg)
    
    # Check for required fields in AGR_USERS with case insensitivity
    required_agr = ['UNAME', 'AGR_NAME']
    missing_agr = []
    for field in required_agr:
        if field.upper() not in [col.upper() for col in data['agr_users_df'].columns]:
            missing_agr.append(field)
            print(f"Missing AGR_USERS field: {field}")
    
    if missing_agr:
        err_msg = f"Required fields missing from AGR_USERS table: {', '.join(missing_agr)}"
        validation_errors.append(err_msg)
        print(err_msg)
    
    # Check for required fields in USR12 with case insensitivity
    required_usr12 = ['UNAME', 'VON', 'BIS']
    missing_usr12 = []
    for field in required_usr12:
        if field.upper() not in [col.upper() for col in data['usr12_df'].columns]:
            missing_usr12.append(field)
            print(f"Missing USR12 field: {field}")
    
    if missing_usr12:
        err_msg = f"Required fields missing from USR12 table: {', '.join(missing_usr12)}"
        validation_errors.append(err_msg)
        print(err_msg)
    
    # Check for data consistency
    if data['usr02_df'].empty:
        err_msg = "USR02 table contains no data"
        validation_errors.append(err_msg)
        print(err_msg)
    else:
        print(f"USR02 contains {len(data['usr02_df'])} rows of data")
    
    if data['agr_users_df'].empty:
        err_msg = "AGR_USERS table contains no data"
        validation_errors.append(err_msg)
        print(err_msg)
    else:
        print(f"AGR_USERS contains {len(data['agr_users_df'])} rows of data")
    
    if data['usr12_df'].empty:
        err_msg = "USR12 table contains no data"
        validation_errors.append(err_msg)
        print(err_msg)
    else:
        print(f"USR12 contains {len(data['usr12_df'])} rows of data")
    
    # Ensure all tables have a matching client (MANDT) field
    if 'MANDT' in data['agr_users_df'].columns and 'MANDT' in data['usr02_df'].columns and 'MANDT' in data['usr12_df'].columns:
        usr02_clients = set(data['usr02_df']['MANDT'].unique())
        agr_users_clients = set(data['agr_users_df']['MANDT'].unique())
        usr12_clients = set(data['usr12_df']['MANDT'].unique())
        
        print(f"USR02 clients: {usr02_clients}")
        print(f"AGR_USERS clients: {agr_users_clients}")
        print(f"USR12 clients: {usr12_clients}")
        
        # Check if there's at least one common client across all tables
        common_clients = usr02_clients.intersection(agr_users_clients, usr12_clients)
        if not common_clients:
            warn_msg = "Warning: No common clients (MANDT) found across all tables"
            print(warn_msg)
        else:
            print(f"Common clients across all tables: {common_clients}")
    else:
        warn_msg = "Warning: MANDT field not found in all tables, skipping client validation"
        print(warn_msg)
    
    # Check for data consistency between tables
    if 'BNAME' in data['usr02_df'].columns and 'UNAME' in data['agr_users_df'].columns:
        usr02_users = set(data['usr02_df']['BNAME'].astype(str).unique())
        agr_users = set(data['agr_users_df']['UNAME'].astype(str).unique())
        
        print(f"Found {len(usr02_users)} unique users in USR02")
        print(f"Found {len(agr_users)} unique users in AGR_USERS")
        
        common_users = usr02_users.intersection(agr_users)
        print(f"Found {len(common_users)} users in common between USR02 and AGR_USERS")
        
        if not common_users:
            warn_msg = "Warning: No common users found between USR02 and AGR_USERS tables"
            print(warn_msg)
            validation_errors.append(warn_msg)
    
    # Prepare data for easier analysis (convert date/time fields to strings)
    _prepare_data(data)
    
    # Add sample data info for debugging
    print("\nSample data validation:")
    if not data['usr02_df'].empty:
        print("First user from USR02:", data['usr02_df'].iloc[0]['BNAME'] if 'BNAME' in data['usr02_df'].columns else "BNAME column not found")
    
    if not data['agr_users_df'].empty:
        print("First user-role assignment from AGR_USERS:", 
              f"User: {data['agr_users_df'].iloc[0]['UNAME'] if 'UNAME' in data['agr_users_df'].columns else 'UNAME not found'}, "
              f"Role: {data['agr_users_df'].iloc[0]['AGR_NAME'] if 'AGR_NAME' in data['agr_users_df'].columns else 'AGR_NAME not found'}")
    
    if validation_errors:
        raise ValueError(", ".join(validation_errors))
    
    return True

def _prepare_data(data):
    """
    Prepare data for analysis by converting data types and ensuring consistency.
    
    Args:
        data (dict): Dictionary containing DataFrames for each loaded table
    """
    print("Preparing data for analysis...")
    
    # Convert MANDT to string in all tables to ensure consistent joining
    for table_name in ['usr02_df', 'agr_users_df', 'usr12_df']:
        if 'MANDT' in data[table_name].columns:
            data[table_name]['MANDT'] = data[table_name]['MANDT'].astype(str)
            print(f"Converted MANDT to string in {table_name}")
    
    # Convert date fields to strings in USR02
    date_fields = ['GLTGV', 'GLTGB', 'TRDAT', 'PWDLGNDATE']
    for field in date_fields:
        if field in data['usr02_df'].columns:
            data['usr02_df'][field] = data['usr02_df'][field].astype(str)
            print(f"Converted {field} to string in USR02")
    
    # Convert time fields to strings in USR02
    time_fields = ['LTIME', 'PWDLGNTIME']
    for field in time_fields:
        if field in data['usr02_df'].columns:
            data['usr02_df'][field] = data['usr02_df'][field].astype(str)
            print(f"Converted {field} to string in USR02")
    
    # Convert date fields to strings in AGR_USERS
    date_fields = ['FROM_DAT', 'TO_DAT']
    for field in date_fields:
        if field in data['agr_users_df'].columns:
            data['agr_users_df'][field] = data['agr_users_df'][field].astype(str)
            print(f"Converted {field} to string in AGR_USERS")
    
    # Handle NaN values
    for table_name in ['usr02_df', 'agr_users_df', 'usr12_df']:
        data[table_name] = data[table_name].fillna('')
        print(f"Filled NaN values in {table_name}")
    
    print("Data preparation complete")