/**
 * Configuration de l'API pour l'analyseur SAP
 * 
 * Ce fichier contient les constantes et paramètres de configuration
 * pour toutes les communications avec l'API backend.
 */

// URL de base de l'API
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8082/api/audit';
export const AUTH_SERVICE_URL = process.env.REACT_APP_AUTH_SERVICE_URL || 'http://localhost:8081/api/auth';
export const ANALYSIS_SERVICE_URL = process.env.REACT_APP_ANALYSIS_SERVICE_URL || 'http://localhost:8000';

// Délai d'attente pour les requêtes (en millisecondes)
export const API_TIMEOUT = 30000;

// Options par défaut pour les requêtes fetch
export const DEFAULT_FETCH_OPTIONS = {
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  credentials: 'include'
};

// Paramètres pour les différents endpoints
export const API_ENDPOINTS = {
  // Endpoints pour l'authentification
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    REFRESH: '/refresh',
    LOGOUT: '/logout'
  },
  
  // AGR_USERS analysis
  AGR_USERS: '/analyze/agr-users',
  
  // USR02 analysis
  USR02: '/analyze/usr02',
  
  // UST12 analysis
  UST12: '/ust12/analyze',
  
  // Integrated analysis
  INTEGRATE: '/integrate-data',
  
  // Filter results by date range
  FILTER: '/filter',
  
  // Generate reports
  REPORTS: '/reports',
  
  // Audit findings
  AUDIT_FINDINGS: '/audit-findings',
  
  // Health check
  HEALTH: '/health',
  
  // Audit types
  AUDIT_TYPES: '/audit-types',
  
  // Endpoints pour les règles SoD
  SOD_RULES: '/sod-rules'
};

/**
 * Configure et renvoie les options de fetch avec les headers appropriés
 * @param {Object} options - Options fetch additionnelles
 * @returns {Object} - Options fetch complètes
 */
export const getFetchOptions = (options = {}) => {
  return {
    ...DEFAULT_FETCH_OPTIONS,
    ...options,
    headers: {
      ...DEFAULT_FETCH_OPTIONS.headers,
      ...(options.headers || {})
    }
  };
};

/**
 * Gère les erreurs de l'API de manière cohérente
 * @param {Response} response - Réponse de fetch
 * @returns {Promise<Object>} - Données JSON de la réponse ou erreur
 */
export const handleAPIResponse = async (response) => {
  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.detail || `Erreur ${response.status}: ${response.statusText}`);
    } catch (e) {
      if (e instanceof SyntaxError) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      throw e;
    }
  }
  
  return await response.json();
};