import { API_URL } from '../config/api';

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
 * Filtre les résultats d'analyse par plage de dates
 * @param {string} analysisId - ID de l'analyse
 * @param {Object} dateRange - Plage de dates pour le filtrage
 * @returns {Promise<Object>} - Résultats de l'analyse filtrée
 */
export const filterByDateRange = async (analysisId, dateRange) => {
  if (!analysisId) {
    throw new Error("ID d'analyse manquant");
  }
  
  const dateRangeData = {
    start_date: dateRange.start || null,
    end_date: dateRange.end || null
  };
  
  const response = await fetch(`${API_URL}/filter/${analysisId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dateRangeData)
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Erreur lors du filtrage des données');
  }
  
  return await response.json();
};

/**
 * Génère un rapport d'audit à partir des données analysées
 * @param {string} analysisId - ID de l'analyse
 * @returns {Promise<Object>} - Rapport d'audit
 */
export const generateReport = async (analysisId) => {
  if (!analysisId) {
    throw new Error("ID d'analyse manquant");
  }
  
  const response = await fetch(`${API_URL}/reports/${analysisId}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Erreur lors de la génération du rapport');
  }
  
  return await response.json();
};