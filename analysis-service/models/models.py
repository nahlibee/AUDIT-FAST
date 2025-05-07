# Modèles de données

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
from io import BytesIO
import re
from datetime import datetime
import uvicorn
from fastapi.responses import JSONResponse

class GeneralStats(BaseModel):
    totalRecords: int
    uniqueRolesCount: int
    uniqueUsersCount: int

class RoleDistribution(BaseModel):
    role: str
    count: int

class UserRoleCount(BaseModel):
    user: str
    count: int

class TimelineData(BaseModel):
    month: str
    count: int

class UserHighPrivilege(BaseModel):
    user: str
    role: str
    from_date: Optional[str] = None
    to_date: Optional[str] = None

class AnalysisResults(BaseModel):
    generalStats: GeneralStats
    roleDistribution: List[RoleDistribution]
    topUsers: List[UserRoleCount]
    timelineData: List[TimelineData]
    highPrivilegeRoles: List[str]
    usersWithHighPrivilegeRoles: List[UserHighPrivilege]

class DateRangeFilter(BaseModel):
    start_date: Optional[str] = None
    end_date: Optional[str] = None

# Models for IT Audit findings and reports

class InactiveUser(BaseModel):
    user: str
    lastLogin: str
    days_since_login: int
    status: str

class UST12Results(BaseModel):
    generalStats: Dict[str, Any]
    inactiveUsers: List[InactiveUser]
    timelineData: List[Dict[str, Any]]
    inactivityDistribution: Dict[str, int]
    activityMetrics: Dict[str, Any]

class USR02User(BaseModel):
    username: str
    type: str
    status: str
    lastLogin: Optional[str] = None
    validFrom: Optional[str] = None
    validTo: Optional[str] = None

class USR02Results(BaseModel):
    generalStats: Dict[str, Any]
    userDistribution: List[Dict[str, Any]]
    users: List[USR02User]
    activityTimeline: List[Dict[str, Any]]

class SoDConflict(BaseModel):
    username: str
    conflictType: str
    roleSet1: List[str]
    roleSet2: List[str]

class SharedHighPrivilegeAccount(BaseModel):
    role: str
    users: List[str]
    userCount: int

class PrivilegedAccessIssues(BaseModel):
    highPrivilegeRolesCount: int
    highPrivilegeRoles: List[str]
    usersWithHighPrivilege: List[Dict[str, Any]]
    sharedHighPrivilegeAccounts: List[SharedHighPrivilegeAccount]

class CrossAnalysisResults(BaseModel):
    ghostUsers: Dict[str, Any]
    usersWithoutRoles: Dict[str, Any]
    inactiveActiveUsers: Dict[str, Any]
    segregationOfDutiesIssues: Dict[str, Any]
    privilegedAccessIssues: PrivilegedAccessIssues

class AuditFinding(BaseModel):
    id: str
    title: str
    description: str
    riskRating: str
    recommendation: str
    userCount: Optional[int] = None
    conflictCount: Optional[int] = None
    accountCount: Optional[int] = None

class FullAnalysisResults(BaseModel):
    userMasterData: Dict[str, Any]
    userRoleAssignments: Dict[str, Any]
    userLoginActivity: Dict[str, Any]
    crossAnalysis: CrossAnalysisResults
    auditFindings: List[AuditFinding]
