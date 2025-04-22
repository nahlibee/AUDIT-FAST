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
