#!/usr/bin/env python3
"""
Configuration settings for the SAP User Analysis Tool
"""

# Default configuration
CONFIG = {
    # Input file names
    'usr02_file': 'usr02.csv',
    'agr_users_file': 'agr_users.csv',
    'usr12_file': 'usr12.csv',
    
    # Input file directory (default is current directory)
    'input_dir': '.',
    
    # Output configuration
    'output_file': None,  # None means output to console
    'output_format': 'text',  # Options: 'text', 'csv', 'html', 'json'
    
    # Analysis configuration
    'analyze_all_users': True,  # If False, only analyze users in usr02
    'max_auth_objects_per_user': 5,  # Maximum number of auth objects to show per user
    'max_auths_per_object': 3,  # Maximum number of authorizations to show per object
    
    # Date and time formats
    'sap_date_format': '%Y%m%d',
    'sap_time_format': '%H%M%S',
    'output_date_format': '%Y-%m-%d',
    'output_time_format': '%H:%M:%S',
    
    # User types mapping
    'user_type_map': {
        'A': 'Dialog User',
        'B': 'System User',
        'C': 'Communication User',
        'L': 'Reference User',
        'S': 'Service User'
    },
    
    # Statistics configuration
    'recent_login_days': 30,  # Number of days to consider for "recent login" statistic
    'top_roles_count': 5,  # Number of top roles to show in summary
    
    # Report section flags (enable/disable sections)
    'include_user_details': True,
    'include_role_details': True,
    'include_auth_details': True,
    'include_summary': True
}

# Constants
SAP_MANDT_FIELD = 'MANDT'  # Client field name
SAP_USER_FIELD = 'BNAME'   # Username field in USR02
SAP_ROLE_USER_FIELD = 'UNAME'  # Username field in AGR_USERS
SAP_AUTH_USER_FIELD = 'UNAME'  # Username field in USR12

# Required fields for each table
REQUIRED_FIELDS = {
    'usr02': [
        'MANDT', 'BNAME', 'USTYP', 'GLTGV', 'GLTGB', 
        'TRDAT', 'LTIME', 'PWDLGNDATE', 'PWDLGNTIME'
    ],
    'agr_users': [
        'MANDT', 'UNAME', 'AGR_NAME', 'FROM_DAT', 'TO_DAT'
    ],
    'usr12': [
        'MANDT', 'UNAME', 'OBJCT', 'FIELD', 'VON', 'BIS'
    ]
}