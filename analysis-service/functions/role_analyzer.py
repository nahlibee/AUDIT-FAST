#!/usr/bin/env python3
"""
Role analyzer module for the SAP User Analysis Tool

This module analyzes role assignment data from the AGR_USERS table.
"""

from datetime import datetime
import pandas as pd
from functions.formatters import format_sap_date, format_validity_period
from config import CONFIG, SAP_MANDT_FIELD, SAP_ROLE_USER_FIELD

def analyze_roles(data):
    """
    Analyze role assignment data from the AGR_USERS table.
    
    Args:
        data (dict): Dictionary containing DataFrames for each loaded table
        
    Returns:
        dict: Dictionary containing role analysis results
    """
    print("\n======= ANALYZE ROLES FUNCTION STARTED =======")
    print(f"AGR_USERS DataFrame shape: {data['agr_users_df'].shape}")
    print(f"AGR_USERS columns: {data['agr_users_df'].columns.tolist()}")
    
    # Ensure we have the necessary fields
    required_fields = ['AGR_NAME', SAP_ROLE_USER_FIELD]
    missing_fields = []
    
    for field in required_fields:
        if field not in data['agr_users_df'].columns:
            missing_fields.append(field)
            print(f"ERROR: Required field {field} not found in AGR_USERS DataFrame")
            
            # Try to find potential match
            if field == 'AGR_NAME':
                potential_cols = [col for col in data['agr_users_df'].columns if 'ROLE' in col or 'AGR' in col]
                if potential_cols:
                    print(f"Potential role name columns found: {potential_cols}")
                    data['agr_users_df']['AGR_NAME'] = data['agr_users_df'][potential_cols[0]]
                    missing_fields.remove(field)
            elif field == SAP_ROLE_USER_FIELD:
                potential_cols = [col for col in data['agr_users_df'].columns if 'USER' in col or 'NAME' in col]
                if potential_cols:
                    print(f"Potential username columns found: {potential_cols}")
                    data['agr_users_df'][SAP_ROLE_USER_FIELD] = data['agr_users_df'][potential_cols[0]]
                    missing_fields.remove(field)
    
    if missing_fields:
        print(f"Unable to find required fields: {missing_fields}. Analysis will be limited.")
    
    role_analysis = {
        'roles': [],
        'role_assignments': [],
        'stats': {
            'total_roles': 0,
            'total_assignments': 0,
            'expired_assignments': 0,
            'excluded_assignments': 0,
            'roles_per_user': {}
        }
    }
    
    # If AGR_NAME is still missing, return limited analysis
    if 'AGR_NAME' not in data['agr_users_df'].columns:
        print("WARNING: AGR_NAME column missing, returning empty role analysis")
        return role_analysis
    
    # Get current date for comparison
    today = datetime.now().strftime(CONFIG['sap_date_format'])
    
    # Get unique roles
    unique_roles = data['agr_users_df']['AGR_NAME'].unique()
    role_analysis['stats']['total_roles'] = len(unique_roles)
    
    print(f"Found {len(unique_roles)} unique roles")
    
    # Process each role assignment
    assignment_count = 0
    for index, assignment in data['agr_users_df'].iterrows():
        try:
            # Get key fields with error handling
            if SAP_MANDT_FIELD not in assignment:
                print(f"Warning: MANDT field ({SAP_MANDT_FIELD}) not found for assignment at index {index}")
                client = "000"  # Default client as fallback
            else:
                client = assignment[SAP_MANDT_FIELD]
            
            if SAP_ROLE_USER_FIELD not in assignment:
                print(f"Error: Username field ({SAP_ROLE_USER_FIELD}) not found for assignment at index {index}")
                continue  # Skip this assignment
            
            username = assignment[SAP_ROLE_USER_FIELD]
            
            if pd.isna(username) or str(username).strip() == '':
                print(f"Warning: Empty username at index {index}, skipping")
                continue
            
            if 'AGR_NAME' not in assignment:
                print(f"Error: Role name field not found for assignment at index {index}")
                continue
                
            role_name = assignment['AGR_NAME']
            from_date = assignment.get('FROM_DAT', '')
            to_date = assignment.get('TO_DAT', '')
            excluded = assignment.get('EXCLUDE', '') == 'X'
            
            print(f"Processing role assignment: User {username}, Role {role_name}")
            
            # Create role assignment data structure
            role_assignment = {
                'client': client,
                'username': username,
                'role_name': role_name,
                'validity': format_validity_period(from_date, to_date),
                'from_date': format_sap_date(from_date),
                'to_date': format_sap_date(to_date),
                'excluded': 'Yes' if excluded else 'No',
                'is_expired': _is_date_expired(to_date, today),
                'org_flag': assignment.get('ORG_FLAG', '')
            }
            
            # Update statistics
            role_analysis['stats']['total_assignments'] += 1
            assignment_count += 1
            
            if role_assignment['is_expired']:
                role_analysis['stats']['expired_assignments'] += 1
                
            if excluded:
                role_analysis['stats']['excluded_assignments'] += 1
                
            # Track roles per user
            user_key = f"{client}:{username}"
            if user_key in role_analysis['stats']['roles_per_user']:
                role_analysis['stats']['roles_per_user'][user_key] += 1
            else:
                role_analysis['stats']['roles_per_user'][user_key] = 1
            
            # Add role assignment to results
            role_analysis['role_assignments'].append(role_assignment)
            
        except Exception as e:
            print(f"Error processing role assignment at index {index}: {str(e)}")
            import traceback
            print(traceback.format_exc())
    
    print(f"Processed {assignment_count} role assignments")
    
    # Calculate role frequency
    role_counts = data['agr_users_df']['AGR_NAME'].value_counts().to_dict()
    
    # Add role data
    for role_name in unique_roles:
        try:
            role_data = {
                'role_name': role_name,
                'assignment_count': role_counts.get(role_name, 0),
                'users': _get_users_with_role(data['agr_users_df'], role_name)
            }
            role_analysis['roles'].append(role_data)
        except Exception as e:
            print(f"Error processing role data for {role_name}: {str(e)}")
    
    # Sort roles by assignment count
    role_analysis['roles'] = sorted(
        role_analysis['roles'],
        key=lambda x: x['assignment_count'],
        reverse=True
    )
    
    print(f"Analysis complete. Found {len(role_analysis['roles'])} unique roles with {assignment_count} assignments")
    print("======= ANALYZE ROLES FUNCTION COMPLETED =======\n")
    
    return role_analysis

def get_user_roles(role_data, client, username):
    """
    Get all roles assigned to a specific user.
    
    Args:
        role_data (dict): Role analysis data
        client (str): Client ID
        username (str): Username
        
    Returns:
        list: List of role assignments for the user
    """
    return [
        assignment for assignment in role_data.get('role_assignments', [])
        if assignment['client'] == client and assignment['username'] == username        ]

def get_users_with_role(role_data, role_name):
    """
    Get all users assigned to a specific role.
    
    Args:
        role_data (dict): Role analysis data
        role_name (str): Role name
        
    Returns:
        list: List of usernames with the role
    """
    users = []
    for assignment in role_data.get('role_assignments', []):
        if assignment['role_name'] == role_name and not assignment['is_expired']:
            user_key = f"{assignment['client']}:{assignment['username']}"
            if user_key not in users:
                users.append(user_key)
    
    return users

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

def _get_users_with_role(agr_users_df, role_name):
    """
    Get list of unique users assigned to a specific role.
    
    Args:
        agr_users_df (DataFrame): AGR_USERS DataFrame
        role_name (str): Role name
        
    Returns:
        list: List of user dictionary objects
    """
    user_list = []
    today = datetime.now().strftime(CONFIG['sap_date_format'])
    
    # Filter DataFrame for the role
    role_assignments = agr_users_df[agr_users_df['AGR_NAME'] == role_name]
    
    # Process each assignment
    for index, assignment in role_assignments.iterrows():
        client = assignment[SAP_MANDT_FIELD]
        username = assignment[SAP_ROLE_USER_FIELD]
        from_date = assignment.get('FROM_DAT', '')
        to_date = assignment.get('TO_DAT', '')
        excluded = assignment.get('EXCLUDE', '') == 'X'
        
        # Skip excluded assignments and expired assignments
        if excluded or _is_date_expired(to_date, today):
            continue
            
        # Add user to list
        user_list.append({
            'client': client,
            'username': username,
            'from_date': format_sap_date(from_date)
        })
    
    return user_list
