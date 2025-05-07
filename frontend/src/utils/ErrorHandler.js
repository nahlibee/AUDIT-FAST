import axios from 'axios';

/**
 * Parses an error from axios response
 * @param {Error} error - Axios error object
 * @returns {Object} Error details with status, message and details
 */
export const parseError = (error) => {
  // Default error structure
  let parsedError = {
    status: 500,
    message: 'Un problème est survenu. Veuillez réessayer.',
    details: ''
  };

  // If axios error with response
  if (error.response) {
    // Extract data from the response
    const { status, data } = error.response;
    parsedError.status = status;

    // If backend sends ErrorResponse format, use it
    if (data && typeof data === 'object') {
      parsedError.message = data.message || parsedError.message;
      parsedError.details = data.details || '';
    }

    // Handle common HTTP status codes
    switch (status) {
      case 400:
        parsedError.message = data.message || 'Requête invalide';
        break;
      case 401:
        parsedError.message = 'Authentification requise';
        break;
      case 403:
        parsedError.message = 'Accès non autorisé';
        break;
      case 404:
        parsedError.message = data.message || 'Ressource non trouvée';
        break;
      case 422:
        parsedError.message = 'Données de validation invalides';
        break;
      default:
        // Keep default or use what was in the response
        break;
    }
  } else if (error.request) {
    // Request was made but no response received
    parsedError.message = 'Aucune réponse du serveur. Vérifiez votre connexion.';
  }

  return parsedError;
};

/**
 * Setup axios interceptors for global error handling
 * @param {Function} onError - Optional callback for when errors occur
 */
export const setupAxiosInterceptors = (onError) => {
  // Response interceptor
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const parsedError = parseError(error);
      
      // Call the error handler if provided
      if (onError && typeof onError === 'function') {
        onError(parsedError);
      }

      // Handle authentication errors globally
      if (parsedError.status === 401) {
        // Clear auth data and redirect to login
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      // Propagate the error for component-level handling
      return Promise.reject(parsedError);
    }
  );
};

/**
 * Extracts validation errors from a 422 response
 * @param {Object} error - Error object from axios
 * @returns {Object} Field errors mapped by field name
 */
export const extractValidationErrors = (error) => {
  const fieldErrors = {};
  
  if (error.response && 
      error.response.status === 422 && 
      error.response.data && 
      error.response.data.details) {
    try {
      // Try to parse details as JSON if it's a string
      const details = typeof error.response.data.details === 'string' 
        ? JSON.parse(error.response.data.details) 
        : error.response.data.details;
        
      // Map errors to field names
      if (typeof details === 'object') {
        Object.keys(details).forEach(field => {
          fieldErrors[field] = details[field];
        });
      }
    } catch (e) {
      // If parsing fails, use the details as a general error
      fieldErrors._error = error.response.data.details;
    }
  }
  
  return fieldErrors;
};

/**
 * Handles API errors by parsing and throwing them
 * @param {Error} error - Axios error object
 * @throws {Object} Parsed error
 */
export const handleApiError = (error) => {
  throw parseError(error);
};