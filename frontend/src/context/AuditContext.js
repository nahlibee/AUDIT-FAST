// src/context/AuditContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { ToastContext } from './ToastContext';
import { 
  fetchMissions, 
  fetchMissionById, 
  createMission, 
  updateMission, 
  deleteMission,
  fetchAuditors,
  assignAuditor,
  removeAuditor,
  fetchReports
} from '../services/AuditService';

// Create context
export const AuditContext = createContext();

// Provider component
export const AuditProvider = ({ children }) => {
  const { isAuthenticated, userRole } = useContext(AuthContext);
  const { showError, showSuccess } = useContext(ToastContext);
  const navigate = useNavigate();
  
  // State for missions
  const [missions, setMissions] = useState([]);
  const [currentMission, setCurrentMission] = useState(null);
  const [missionLoading, setMissionLoading] = useState(false);
  const [missionError, setMissionError] = useState(null);
  
  // State for auditors
  const [auditors, setAuditors] = useState([]);
  const [auditorsLoading, setAuditorsLoading] = useState(false);
  
  // State for reports
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  // Load missions when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadMissions();
      loadAuditors();
      loadReports();
    }
  }, [isAuthenticated]);

  // Load all missions
  const loadMissions = async () => {
    setMissionLoading(true);
    setMissionError(null);
    
    try {
      const data = await fetchMissions();
      setMissions(data);
    } catch (error) {
      setMissionError(error.message);
      showError(`Error loading missions: ${error.message}`);
    } finally {
      setMissionLoading(false);
    }
  };

  // Load a specific mission by ID
  const loadMissionById = async (missionId) => {
    setMissionLoading(true);
    setMissionError(null);
    
    try {
      const data = await fetchMissionById(missionId);
      setCurrentMission(data);
      return data;
    } catch (error) {
      setMissionError(error.message);
      showError(`Error loading mission: ${error.message}`);
      return null;
    } finally {
      setMissionLoading(false);
    }
  };

  // Create a new mission
  const handleCreateMission = async (missionData) => {
    setMissionLoading(true);
    setMissionError(null);
    
    try {
      const data = await createMission(missionData);
      setMissions([...missions, data]);
      showSuccess('Mission created successfully');
      return data;
    } catch (error) {
      setMissionError(error.message);
      showError(`Error creating mission: ${error.message}`);
      return null;
    } finally {
      setMissionLoading(false);
    }
  };

  // Update an existing mission
  const handleUpdateMission = async (missionId, missionData) => {
    setMissionLoading(true);
    setMissionError(null);
    
    try {
      const data = await updateMission(missionId, missionData);
      
      // Update missions list
      setMissions(missions.map(mission => 
        mission.id === missionId ? data : mission
      ));
      
      // Update current mission if it's the one being edited
      if (currentMission && currentMission.id === missionId) {
        setCurrentMission(data);
      }
      
      showSuccess('Mission updated successfully');
      return data;
    } catch (error) {
      setMissionError(error.message);
      showError(`Error updating mission: ${error.message}`);
      return null;
    } finally {
      setMissionLoading(false);
    }
  };

  // Delete a mission
  const handleDeleteMission = async (missionId) => {
    setMissionLoading(true);
    setMissionError(null);
    
    try {
      await deleteMission(missionId);
      
      // Remove from missions list
      setMissions(missions.filter(mission => mission.id !== missionId));
      
      // Clear current mission if it's the one being deleted
      if (currentMission && currentMission.id === missionId) {
        setCurrentMission(null);
      }
      
      showSuccess('Mission deleted successfully');
      return true;
    } catch (error) {
      setMissionError(error.message);
      showError(`Error deleting mission: ${error.message}`);
      return false;
    } finally {
      setMissionLoading(false);
    }
  };

  // Load all auditors
  const loadAuditors = async () => {
    if (userRole !== 'MANAGER' && userRole !== 'ADMIN') return;
    
    setAuditorsLoading(true);
    
    try {
      const data = await fetchAuditors();
      setAuditors(data);
    } catch (error) {
      showError(`Error loading auditors: ${error.message}`);
    } finally {
      setAuditorsLoading(false);
    }
  };

  // Assign an auditor to a mission
  const handleAssignAuditor = async (missionId, auditorId) => {
    setMissionLoading(true);
    
    try {
      const data = await assignAuditor(missionId, auditorId);
      
      // Update current mission if it's the one being updated
      if (currentMission && currentMission.id === missionId) {
        loadMissionById(missionId);
      }
      
      showSuccess('Auditor assigned successfully');
      return data;
    } catch (error) {
      showError(`Error assigning auditor: ${error.message}`);
      return null;
    } finally {
      setMissionLoading(false);
    }
  };

  // Remove an auditor from a mission
  const handleRemoveAuditor = async (missionId, auditorId) => {
    setMissionLoading(true);
    
    try {
      await removeAuditor(missionId, auditorId);
      
      // Update current mission if it's the one being updated
      if (currentMission && currentMission.id === missionId) {
        loadMissionById(missionId);
      }
      
      showSuccess('Auditor removed successfully');
      return true;
    } catch (error) {
      showError(`Error removing auditor: ${error.message}`);
      return false;
    } finally {
      setMissionLoading(false);
    }
  };

  // Load all reports
  const loadReports = async () => {
    setReportsLoading(true);
    
    try {
      const data = await fetchReports();
      setReports(data);
    } catch (error) {
      showError(`Error loading reports: ${error.message}`);
    } finally {
      setReportsLoading(false);
    }
  };

  // Context value
  const contextValue = {
    // Missions
    missions,
    currentMission,
    missionLoading,
    missionError,
    loadMissions,
    loadMissionById,
    createMission: handleCreateMission,
    updateMission: handleUpdateMission,
    deleteMission: handleDeleteMission,
    
    // Auditors
    auditors,
    auditorsLoading,
    assignAuditor: handleAssignAuditor,
    removeAuditor: handleRemoveAuditor,
    
    // Reports
    reports,
    reportsLoading,
    loadReports
  };

  return (
    <AuditContext.Provider value={contextValue}>
      {children}
    </AuditContext.Provider>
  );
};

// Custom hook for easy context use
export const useAudit = () => {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error('useAudit must be used within an AuditProvider');
  }
  return context;
};