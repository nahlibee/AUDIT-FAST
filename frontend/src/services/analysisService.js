import { ANALYSIS_SERVICE_URL, API_ENDPOINTS } from '../config/Api';

const API_URL = ANALYSIS_SERVICE_URL;

/**
 * Analyse un fichier d'extraction AGR_USERS
 * @param {File} file - Fichier d'extraction AGR_USERS
 * @param {Object} dateRange - Plage de dates pour le filtrage (optionnel)
 * @returns {Promise<Object>} - Résultats de l'analyse
 */
export const analyzeAGRUsers = async (file, dateRange = null) => {
  const formData = new FormData();
  formData.append('file', file);
  
  if (dateRange && (dateRange.start || dateRange.end)) {
    const dateRangeData = {
      start_date: dateRange.start || null,
      end_date: dateRange.end || null
    };
    formData.append('date_range', JSON.stringify(dateRangeData));
  }
  
  const response = await fetch(`${API_URL}/analyze/agr-users`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Erreur lors de l'analyse du fichier");
  }
  
  return await response.json();
};

/**
 * Intègre des données supplémentaires (USR02, UST12) à une analyse existante
 * @param {string} analysisId - ID de l'analyse
 * @param {File} usr02File - Fichier d'extraction USR02 (optionnel)
 * @param {File} ust12File - Fichier d'extraction UST12 (optionnel)
 * @param {Object} dateRange - Plage de dates pour le filtrage (optionnel)
 * @returns {Promise<Object>} - Résultats de l'analyse mise à jour
 */
export const integrateAdditionalData = async (analysisId, usr02File = null, ust12File = null, dateRange = null) => {
  if (!analysisId || (!usr02File && !ust12File)) {
    return null;
  }
  
  const formData = new FormData();
  
  if (usr02File) {
    formData.append('usr02_file', usr02File);
  }
  
  if (ust12File) {
    formData.append('ust12_file', ust12File);
  }
  
  if (dateRange && (dateRange.start || dateRange.end)) {
    const dateRangeData = {
      start_date: dateRange.start || null,
      end_date: dateRange.end || null
    };
    formData.append('date_range', JSON.stringify(dateRangeData));
  }
  
  const response = await fetch(`${API_URL}/integrate/${analysisId}`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Erreur lors de l'intégration des données supplémentaires");
  }
  
  return await response.json();
};

/**
 * Analyse intégrée des trois fichiers: AGR_USER, USR02, et UST12
 * @param {Object} files - Objet contenant les fichiers à analyser
 * @param {File} files.agrUserFile - Fichier d'extraction AGR_USER
 * @param {File} files.usr02File - Fichier d'extraction USR02
 * @param {File} files.ust12File - Fichier d'extraction UST12
 * @param {Object} dateRange - Plage de dates pour le filtrage (optionnel)
 * @returns {Promise<Object>} - Résultats de l'analyse intégrée
 */
export const runIntegratedAnalysis = async (files, dateRange) => {
  console.log('Starting integrated analysis with files:', files);
  
  const formData = new FormData();
  
  // Add files with the exact field names expected by the backend API
  if (files.agrUserFile) {
    formData.append('agr_users_file', files.agrUserFile);
  }
  if (files.usr02File) {
    formData.append('usr02_file', files.usr02File);
  }
  if (files.ust12File) {
    formData.append('ust12_file', files.ust12File);
  }
  
  // Add date range only if both start and end dates are provided
  if (dateRange && Array.isArray(dateRange) && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
    const dateRangeData = {
      start_date: dateRange[0].format('YYYY-MM-DD'),
      end_date: dateRange[1].format('YYYY-MM-DD')
    };
    formData.append('date_range', JSON.stringify(dateRangeData));
  }
  
  const endpoint = `${ANALYSIS_SERVICE_URL}/api/integrate-data`;
  console.log('Sending request to:', endpoint);
  
  try {
    // Set a longer timeout as this can be a resource-intensive operation
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      // Important: Don't set Content-Type header to allow browser to set it with boundary
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: `Server error: ${response.status}` }));
      throw new Error(errorData.detail || 'Failed to analyze data');
    }
    
    const data = await response.json();
    console.log('Analysis response:', data);
    
    // Store the analysis data in local storage for later use
    localStorage.setItem('lastAnalysisData', JSON.stringify(data));
    
    return data;
  } catch (error) {
    console.error('Analysis error:', error);
    throw new Error(error.message || 'Failed to analyze data');
  }
};

/**
 * Récupère une analyse précédente par son ID
 * @param {string} analysisId - ID de l'analyse à récupérer
 * @returns {Promise<Object>} - Résultats de l'analyse
 */
export const getAnalysisById = async (analysisId) => {
  try {
    const endpoint = `${ANALYSIS_SERVICE_URL}/api/integrated-analysis/${analysisId}`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to retrieve analysis');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error retrieving analysis:', error);
    throw new Error(error.message || 'Failed to retrieve analysis');
  }
};

/**
 * Filtre les résultats d'analyse par plage de dates
 * @param {string} analysisId - ID de l'analyse
 * @param {Object} dateRange - Plage de dates pour le filtrage
 * @returns {Promise<Object>} - Résultats de l'analyse filtrée
 */
export const filterResultsByDateRange = async (analysisId, dateRange) => {
  const response = await fetch(`${ANALYSIS_SERVICE_URL}${API_ENDPOINTS.FILTER}/${analysisId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      start_date: dateRange[0].format('YYYY-MM-DD'),
      end_date: dateRange[1].format('YYYY-MM-DD')
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to filter results');
  }
  
  return await response.json();
};

/**
 * Génère un rapport d'audit à partir des données analysées
 * @param {string} analysisId - ID de l'analyse
 * @param {string} reportType - Type de rapport à générer ('pdf', 'excel')
 * @returns {Promise<Object>} - Rapport d'audit avec URL de téléchargement
 */
export const generateReport = async (analysisId, reportType = 'pdf') => {
  try {
    const response = await fetch(`${ANALYSIS_SERVICE_URL}/reports/${analysisId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ reportType })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to generate report');
  }
  
  return await response.json();
  } catch (error) {
    console.error('Error generating report:', error);
    throw new Error(error.message || 'Failed to generate report');
  }
};

/**
 * Récupère les problèmes d'audit à partir d'une analyse
 * @param {string} analysisId - ID de l'analyse
 * @returns {Promise<Object>} - Problèmes d'audit
 */
export const getAuditFindings = async (analysisId) => {
  try {
    const response = await fetch(`${ANALYSIS_SERVICE_URL}${API_ENDPOINTS.AUDIT_FINDINGS}/${analysisId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to retrieve audit findings');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error retrieving audit findings:', error);
    throw new Error(error.message || 'Failed to retrieve audit findings');
  }
};

/**
 * Récupère les types d'audit disponibles
 * @returns {Promise<Object>} - Types d'audit disponibles
 */
export const getAuditTypes = async () => {
  try {
    const response = await fetch(`${ANALYSIS_SERVICE_URL}${API_ENDPOINTS.AUDIT_TYPES}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to retrieve audit types');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error retrieving audit types:', error);
    throw new Error(error.message || 'Failed to retrieve audit types');
  }
};

export const integrateData = async (files) => {
  console.log('Starting integrated analysis with files:', files);
  
  if (!files.agrUserFile || !files.usr02File || !files.ust12File) {
    throw new Error('Veuillez télécharger tous les fichiers requis');
  }

  try {
    const formData = new FormData();
    formData.append('agr_users_file', files.agrUserFile);
    formData.append('usr02_file', files.usr02File);
    formData.append('ust12_file', files.ust12File);
    
    if (files.dateRange) {
      formData.append('date_range', JSON.stringify(files.dateRange));
    }
    
    const apiUrl = `${API_URL}/integrate-data`;
    console.log('Sending request to:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    console.log('Analysis response:', data);
    
    if (!response.ok) {
      // Enhanced error handling with more details
      const errorMsg = data.detail || 'Une erreur est survenue lors de l\'analyse';
      console.error('Analysis failed with status:', response.status, 'Error:', errorMsg);
      
      // Try to extract more specific information
      let detailedError = errorMsg;
      
      if (errorMsg.includes('Aucun enregistrement de connexion trouvé')) {
        detailedError = 'Le fichier UST12 ne contient pas de données de connexion reconnues. Assurez-vous que le fichier contient des enregistrements de connexion avec OBJCT=S_USER ou FIELD=LOGON_DATA.';
      } else if (errorMsg.includes('colonnes requises manquantes')) {
        detailedError = `${errorMsg} Vérifiez que vos extractions contiennent toutes les colonnes requises.`;
      } else if (errorMsg.includes('USR02')) {
        detailedError = `Problème avec le fichier des utilisateurs: ${errorMsg}`;
      } else if (errorMsg.includes('AGR_USERS')) {
        detailedError = `Problème avec le fichier des rôles: ${errorMsg}`;
      } else if (errorMsg.includes('UST12')) {
        detailedError = `Problème avec le fichier des connexions: ${errorMsg}`;
      }
      
      throw new Error(detailedError);
    }
    
    return data;
  } catch (error) {
    console.error('Error during integrated analysis:', error);
    throw error;
  }
};

export const uploadLogData = async (file) => {
  console.log('Uploading log data file:', file.name);
  
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const apiUrl = `${API_URL}/upload-log-data`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      const errorMsg = data.detail || 'Une erreur est survenue lors du téléchargement';
      console.error('Upload failed with status:', response.status, 'Error:', errorMsg);
      throw new Error(errorMsg);
    }
    
    return data;
  } catch (error) {
    console.error('Error uploading log data:', error);
    throw error;
  }
};