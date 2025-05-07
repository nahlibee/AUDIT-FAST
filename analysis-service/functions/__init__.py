"""
Functions package for the SAP User Analysis Tool.

This package contains modules for various analysis functions:
- data_loader: Load and validate SAP data files
- user_analyzer: Analyze user master data (USR02)
- role_analyzer: Analyze role assignments (AGR_USERS)
- auth_analyzer: Analyze user authorizations (USR12)
- report_generator: Generate reports from analysis results
- formatters: Utility functions to format SAP data
"""

from functions.data_loader import load_data, validate_data
from functions.user_analyzer import analyze_users, get_user_details
from functions.auth_analyzer import analyze_authorizations, get_user_authorizations
from functions.role_analyzer import analyze_roles, get_user_roles
from functions.report_generator import generate_report, output_report
from functions.formatters import (
    format_sap_date,
    format_sap_time,
    format_sap_datetime,
    format_user_type,
    format_boolean_flag,
    format_validity_period
)

__all__ = [
    # Data loader
    'load_data',
    'validate_data',
    
    # User analyzer
    'analyze_users',
    'get_user_details',
    
    # Role analyzer
    'analyze_roles',
    'get_user_roles',
    
    # Auth analyzer
    'analyze_authorizations',
    'get_user_authorizations',
    
    # Report generator
    'generate_report',
    'output_report',
    
    # Formatters
    'format_sap_date',
    'format_sap_time',
    'format_sap_datetime',
    'format_user_type',
    'format_boolean_flag',
    'format_validity_period'
]
