from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

# Modèles pour l'analyse UST12

class UserActivity(BaseModel):
    """Informations sur l'activité d'un utilisateur"""
    user: str
    last_login: Optional[str] = None
    days_since_login: Optional[int] = None
    status: Optional[str] = None

class ActivityTimeline(BaseModel):
    """Données de timeline pour l'activité utilisateur"""
    month: str
    count: int

class InactivityDistribution(BaseModel):
    """Distribution des utilisateurs par niveau d'inactivité"""
    never_logged: int
    critical: int
    high_risk: int
    medium_risk: int

class ActivityMetrics(BaseModel):
    """Métriques d'activité utilisateur"""
    active_users: int
    inactive_users: int
    inactive_percentage: float

class UST12GeneralStats(BaseModel):
    """Statistiques générales pour UST12"""
    totalRecords: int
    uniqueUsersCount: int
    lastUpdated: str

class UST12AnalysisResults(BaseModel):
    """Résultats complets de l'analyse UST12"""
    generalStats: UST12GeneralStats
    inactiveUsers: List[UserActivity]
    timelineData: List[ActivityTimeline]
    inactivityDistribution: InactivityDistribution
    activityMetrics: ActivityMetrics
    analysis_id: Optional[str] = None