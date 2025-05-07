#!/usr/bin/env python3
"""
API-focused Report Generator for the SAP User Analysis Tool

This module processes analysis data and provides structured output
suitable for API consumption by a frontend application.
"""

import json
from datetime import datetime
from config import CONFIG

def generate_report(user_analysis, role_analysis, auth_analysis, config):
    """
    Generate a structured data report based on analysis results.
    
    Args:
        user_analysis (dict): User analysis results
        role_analysis (dict): Role analysis results
        auth_analysis (dict): Authorization analysis results
        config (dict): Configuration settings
        
    Returns:
        dict: API-ready structured data
    """
    # Create user data in expected format
    users = _prepare_user_data(user_analysis, role_analysis, auth_analysis, config)
    
    # Log detailed information about available data
    print(f"\n======= GENERATE REPORT FUNCTION DEBUG INFO =======")
    print(f"User analysis has {len(user_analysis.get('users', []))} users")
    print(f"Prepared user data has {len(users)} users")
    print(f"User analysis keys: {user_analysis.keys()}")
    print(f"Role analysis keys: {role_analysis.keys()}")
    print(f"Auth analysis keys: {auth_analysis.keys()}")
    print(f"======= END OF REPORT DEBUG INFO =======\n")
    
    # Create API data structure with users directly in the main object
    api_data = {
        "metadata": {
            "generated_at": datetime.now().isoformat(),
            "user_count": user_analysis['stats']['total_users'],
            "role_count": role_analysis['stats']['total_roles'],
            "auth_object_count": auth_analysis['stats']['total_auth_objects']
        },
        "summary": _generate_summary(user_analysis, role_analysis, auth_analysis),
        "users": users,  # This is the key change - putting users at the top level
        
        # Also include the original user_analysis for backward compatibility
        "user_analysis": user_analysis
    }
    
    return api_data

def output_report(report_data, config):
    """
    Output the report data in JSON format for API consumption.
    
    Args:
        report_data (dict): Structured report data
        config (dict): Configuration settings
        
    Returns:
        str: JSON string or None if output to file
    """
    # Convert data to JSON
    json_data = json.dumps(report_data, indent=2)
    
    if config['output_file'] is None:
        # Return JSON as string
        return json_data
    else:
        # Write JSON to file
        with open(config['output_file'], 'w') as f:
            f.write(json_data)
        print(f"API data saved to {config['output_file']}")
        return None

def _generate_summary(user_analysis, role_analysis, auth_analysis):
    """
    Generate a summary of the analysis results.
    
    Args:
        user_analysis (dict): User analysis results
        role_analysis (dict): Role analysis results
        auth_analysis (dict): Authorization analysis results
        
    Returns:
        dict: Summary data in API-friendly format
    """
    # Check if user analysis contains users
    if 'users' not in user_analysis or not user_analysis['users']:
        print("WARNING: No users found in user analysis, generating minimal summary")
        return {
            "warning": "No users were found in the provided data",
            "user_statistics": {
                "total": 0,
                "by_type": []
            },
            "role_statistics": {
                "total": role_analysis.get('stats', {}).get('total_roles', 0),
                "assignments": {
                    "total": role_analysis.get('stats', {}).get('total_assignments', 0),
                    "average_per_user": 0
                },
                "top_roles": []
            },
            "auth_statistics": {
                "total_objects": auth_analysis.get('stats', {}).get('total_auth_objects', 0),
                "total_authorizations": auth_analysis.get('stats', {}).get('total_authorizations', 0)
            },
            "data_validation": {
                "usr02_count": len(user_analysis.get('users', [])),
                "agr_users_assignments": role_analysis.get('stats', {}).get('total_assignments', 0),
                "auth_objects": auth_analysis.get('stats', {}).get('total_auth_objects', 0)
            }
        }
    
    # Get top roles by assignment count
    top_roles = sorted(
        role_analysis['roles'],
        key=lambda x: x['assignment_count'],
        reverse=True
    )[:CONFIG['top_roles_count']]
    
    # Get top auth objects by usage count
    top_auth_objects = sorted(
        auth_analysis['stats']['top_auth_objects'].items(),
        key=lambda x: x[1],
        reverse=True
    )[:CONFIG['top_roles_count']]
    
    # Calculate average roles per user
    total_users = user_analysis['stats']['total_users']
    total_role_assignments = role_analysis['stats']['total_assignments']
    avg_roles_per_user = (
        total_role_assignments / total_users if total_users > 0 else 0
    )
    
    # Calculate average auth objects per user
    auth_objects_per_user = auth_analysis['stats']['auth_objects_per_user']
    avg_auth_objects = (
        sum(auth_objects_per_user.values()) / len(auth_objects_per_user)
        if auth_objects_per_user else 0
    )
    
    # Create API-friendly summary structure
    summary = {
        "user_statistics": {
            "total": user_analysis['stats']['total_users'],
            "locked": user_analysis['stats']['locked_users'],
            "expired": user_analysis['stats']['expired_users'],
            "never_logged_in": user_analysis['stats']['never_logged_in'],
            "initial_password": user_analysis['stats']['initial_password'],
            "by_type": [
                {"type": user_type, "count": count}
                for user_type, count in user_analysis['stats']['user_types'].items()
            ]
        },
        "role_statistics": {
            "total": role_analysis['stats']['total_roles'],
            "assignments": {
                "total": role_analysis['stats']['total_assignments'],
                "expired": role_analysis['stats']['expired_assignments'],
                "excluded": role_analysis['stats']['excluded_assignments'],
                "average_per_user": round(avg_roles_per_user, 2)
            },
            "top_roles": [
                {
                    "name": role['role_name'],
                    "count": role['assignment_count'],
                    "users": len(role['users'])
                }
                for role in top_roles
            ]
        },
        "auth_statistics": {
            "total_objects": auth_analysis['stats']['total_auth_objects'],
            "total_authorizations": auth_analysis['stats']['total_authorizations'],
            "average_objects_per_user": round(avg_auth_objects, 2),
            "top_objects": [
                {
                    "name": object_name,
                    "count": count
                }
                for object_name, count in top_auth_objects
            ]
        },
        "security_insights": _generate_security_insights(
            user_analysis, 
            role_analysis, 
            auth_analysis
        )
    }
    
    return summary

def _prepare_user_data(user_analysis, role_analysis, auth_analysis, config):
    """
    Prepare user data for API consumption.
    
    Args:
        user_analysis (dict): User analysis results
        role_analysis (dict): Role analysis results
        auth_analysis (dict): Authorization analysis results
        config (dict): Configuration settings
        
    Returns:
        list: List of user data objects
    """
    if not config['include_user_details']:
        return []
    
    users_data = []
    
    for user_data in user_analysis['users']:
        client = user_data['client']
        username = user_data['username']
        
        # Get user's roles
        user_roles = []
        for role_assignment in role_analysis['role_assignments']:
            if (role_assignment['client'] == client and 
                role_assignment['username'] == username):
                user_roles.append({
                    "name": role_assignment['role_name'],
                    "from_date": role_assignment['from_date'],
                    "to_date": role_assignment['to_date'],
                    "is_expired": role_assignment['is_expired'],
                    "is_excluded": role_assignment['excluded'] == 'Yes'
                })
        
        # Get user's authorizations
        user_auths = {}
        for auth in auth_analysis['authorizations']:
            if auth['client'] == client and auth['username'] == username:
                object_name = auth['object']
                if object_name not in user_auths:
                    user_auths[object_name] = []
                user_auths[object_name].append({
                    "field": auth['field'],
                    "from_value": auth['from_value'],
                    "to_value": auth['to_value'],
                    "is_wildcard": auth['is_wildcard']
                })
        
        # Convert auth dict to list for API
        auth_list = [
            {
                "object": obj_name,
                "authorizations": auth_details
            }
            for obj_name, auth_details in user_auths.items()
        ]
        
        # Create user object for API
        user_api_data = {
            "client": client,
            "username": username,
            "details": {
                "user_type": user_data['user_type'],
                "is_locked": user_data['locked'] == 'Yes',
                "has_initial_password": user_data['initial_password'] == 'Yes',
                "validity": {
                    "from_date": user_data['validity']['from_date'],
                    "to_date": user_data['validity']['to_date'],
                    "is_expired": user_data['validity']['is_expired']
                },
                "activity": {
                    "last_login": user_data['activity']['last_login'],
                    "first_login": user_data['activity']['first_login'],
                    "last_password_change": user_data['activity']['last_password_change']
                }
            },
            "roles": user_roles,
            "authorizations": auth_list,
            "risk_score": _calculate_user_risk_score(user_data, user_roles, user_auths)
        }
        
        users_data.append(user_api_data)
    
    return users_data

def _generate_security_insights(user_analysis, role_analysis, auth_analysis):
    """
    Generate security insights based on the analysis results.
    
    Args:
        user_analysis (dict): User analysis results
        role_analysis (dict): Role analysis results
        auth_analysis (dict): Authorization analysis results
        
    Returns:
        list: List of security insights
    """
    insights = []
    
    # Check for locked users
    locked_users = user_analysis['stats']['locked_users']
    if locked_users > 0:
        insights.append({
            "type": "info",
            "category": "user_management",
            "message": f"There are {locked_users} locked user accounts.",
            "impact": "low"
        })
    
    # Check for expired accounts
    expired_users = user_analysis['stats']['expired_users']
    if expired_users > 0:
        insights.append({
            "type": "info",
            "category": "user_management",
            "message": f"There are {expired_users} expired user accounts.",
            "impact": "low"
        })
    
    # Check for users with initial passwords
    initial_pw_users = user_analysis['stats']['initial_password']
    if initial_pw_users > 0:
        insights.append({
            "type": "warning",
            "category": "security",
            "message": f"There are {initial_pw_users} users with initial passwords that need to be changed.",
            "impact": "medium"
        })
    
    # Check for users with critical authorizations
    critical_auth_objects = ["S_ADMI_FCD", "SAP_ALL", "S_DEVELOP"]
    users_with_critical_auth = _count_users_with_critical_auth(
        auth_analysis, critical_auth_objects
    )
    
    if users_with_critical_auth > 0:
        insights.append({
            "type": "alert",
            "category": "security",
            "message": f"There are {users_with_critical_auth} users with critical authorizations (S_ADMI_FCD, SAP_ALL, S_DEVELOP).",
            "impact": "high"
        })
    
    # Check for users with too many roles
    max_recommended_roles = 10
    users_with_many_roles = _count_users_with_many_roles(
        role_analysis, max_recommended_roles
    )
    
    if users_with_many_roles > 0:
        insights.append({
            "type": "warning",
            "category": "role_management",
            "message": f"There are {users_with_many_roles} users with more than {max_recommended_roles} roles assigned.",
            "impact": "medium"
        })
    
    return insights

def _count_users_with_critical_auth(auth_analysis, critical_objects):
    """
    Count users with critical authorizations.
    
    Args:
        auth_analysis (dict): Authorization analysis results
        critical_objects (list): List of critical authorization objects
        
    Returns:
        int: Count of users with critical authorizations
    """
    users_with_critical = set()
    
    for auth in auth_analysis['authorizations']:
        if auth['object'] in critical_objects:
            user_key = f"{auth['client']}:{auth['username']}"
            users_with_critical.add(user_key)
    
    return len(users_with_critical)

def _count_users_with_many_roles(role_analysis, max_roles):
    """
    Count users with more than the maximum recommended roles.
    
    Args:
        role_analysis (dict): Role analysis results
        max_roles (int): Maximum recommended roles
        
    Returns:
        int: Count of users with too many roles
    """
    count = 0
    
    for user, role_count in role_analysis['stats']['roles_per_user'].items():
        if role_count > max_roles:
            count += 1
    
    return count

def _calculate_user_risk_score(user_data, user_roles, user_auths):
    """
    Calculate a security risk score for a user based on various factors.
    
    Args:
        user_data (dict): User master data
        user_roles (list): User role assignments
        user_auths (dict): User authorizations
        
    Returns:
        int: Risk score (0-100, higher is more risky)
    """
    score = 0
    
    # Base score based on user type
    if user_data['user_type'] == 'Dialog User':
        score += 10
    elif user_data['user_type'] == 'System User':
        score += 20
    elif user_data['user_type'] == 'Communication User':
        score += 15
    
    # Initial password is a risk
    if user_data['initial_password'] == 'Yes':
        score += 25
    
    # Account expired but not locked is a risk
    if user_data['validity']['is_expired'] and user_data['locked'] == 'No':
        score += 15
    
    # Add points for each critical authorization
    critical_auths = ['S_ADMI_FCD', 'SAP_ALL', 'S_DEVELOP']
    for obj in critical_auths:
        if obj in user_auths:
            score += 20
    
    # Add points for wildcards in authorizations
    wildcard_count = 0
    for obj_auths in user_auths.values():
        for auth in obj_auths:
            if 'is_wildcard' in auth and auth['is_wildcard']:
                wildcard_count += 1
    
    # Cap wildcard penalty at 20
    score += min(wildcard_count * 2, 20)
    
    # Cap at 100
    return min(score, 100)