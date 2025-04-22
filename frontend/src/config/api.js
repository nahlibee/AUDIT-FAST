/**
 * Configuration de l'API pour l'analyseur SAP
 * 
 * Ce fichier contient les constantes et paramètres de configuration
 * pour toutes les communications avec l'API backend.
 */

// URL de base de l'API
export const API_URL = 'http://localhost:8000/api';

// Délai d'attente pour les requêtes (en millisecondes)
export const API_TIMEOUT = 30000;

// Options par défaut pour les requêtes fetch
export const DEFAULT_FETCH_OPTIONS = {
  headers: {
    'Accept': 'application/json'
  },
  // Activer les cookies cross-origin si nécessaire
  credentials: 'include'
};

// Paramètres pour les différents endpoints
export const API_ENDPOINTS = {
  // Endpoints pour l'analyse
  ANALYZE: '/analyze/agr-users',
  INTEGRATE: '/integrate',
  FILTER: '/filter',
  
  // Endpoints pour les rapports
  REPORTS: '/reports',
  
  // Endpoints pour les règles SoD
  SOD_RULES: '/sod-rules',
  
  // Endpoint de vérification de santé de l'API
  HEALTH: '/health'
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
      throw new Error(errorData.detail || `Erreur ${response.status}: ${response.statusText}`);
    } catch (e) {
      if (e instanceof SyntaxError) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      throw e;
    }
  }
  
  return await response.json();
};