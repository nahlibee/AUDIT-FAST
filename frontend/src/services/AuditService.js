// src/services/auditService.js
import { backendApi } from '../utils/AxiosConfig';
import { handleApiError } from '../utils/ErrorHandler';

// Mission endpoints
export const fetchMissions = async () => {
  try {
    const response = await backendApi.get('/audit/missions');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const fetchMissionById = async (missionId) => {
  try {
    const response = await backendApi.get(`/audit/missions/${missionId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const createMission = async (missionData) => {
  try {
    const response = await backendApi.post('/audit/missions', missionData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateMission = async (missionId, missionData) => {
  try {
    const response = await backendApi.put(`/audit/missions/${missionId}`, missionData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deleteMission = async (missionId) => {
  try {
    await backendApi.delete(`/audit/missions/${missionId}`);
    return true;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Auditor assignment endpoints
export const fetchAuditors = async () => {
  try {
    const response = await backendApi.get('/audit/auditors');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const assignAuditor = async (missionId, auditorId) => {
  try {
    const response = await backendApi.post(`/audit/missions/${missionId}/auditors/${auditorId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const removeAuditor = async (missionId, auditorId) => {
  try {
    await backendApi.delete(`/audit/missions/${missionId}/auditors/${auditorId}`);
    return true;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Report endpoints
export const fetchReports = async () => {
  try {
    const response = await backendApi.get('/audit/reports');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const fetchReportById = async (reportId) => {
  try {
    const response = await backendApi.get(`/audit/reports/${reportId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const createReport = async (reportData) => {
  try {
    const response = await backendApi.post('/audit/reports', reportData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateReport = async (reportId, reportData) => {
  try {
    const response = await backendApi.put(`/audit/reports/${reportId}`, reportData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const submitReportForReview = async (reportId) => {
  try {
    const response = await backendApi.post(`/audit/reports/${reportId}/submit`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const approveReport = async (reportId) => {
  try {
    const response = await backendApi.post(`/audit/reports/${reportId}/approve`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const rejectReport = async (reportId, comments) => {
  try {
    const response = await backendApi.post(`/audit/reports/${reportId}/reject`, { comments });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const publishReport = async (reportId) => {
  try {
    const response = await backendApi.post(`/audit/reports/${reportId}/publish`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Analysis endpoints
export const analyzeSAPData = async (missionId, analysisType, fileData) => {
  try {
    const formData = new FormData();
    formData.append('file', fileData);
    
    const response = await backendApi.post(
      `/audit/missions/${missionId}/analyze/${analysisType}`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getSAPAnalysisResults = async (missionId, analysisId) => {
  try {
    const response = await backendApi.get(`/audit/missions/${missionId}/analysis/${analysisId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Dashboard data
export const fetchDashboardData = async () => {
  try {
    const response = await backendApi.get('/audit/dashboard');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};