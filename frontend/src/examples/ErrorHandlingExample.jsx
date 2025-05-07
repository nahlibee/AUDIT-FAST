import React, { useState } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { extractValidationErrors } from '../utils/ErrorHandler';

/**
 * Example component demonstrating how to use toast notifications and error handling
 */
const ErrorHandlingExample = () => {
  const { showSuccess, showError, showInfo, showWarning } = useToast();
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  // Example of successful API call with toast
  const handleSuccessExample = () => {
    showSuccess('Opération réussie!');
  };
  
  // Example of showing different toast types
  const handleShowToastTypes = () => {
    showInfo('Ceci est une information.');
    setTimeout(() => {
      showWarning('Attention, ceci est un avertissement!');
    }, 1000);
    setTimeout(() => {
      showError('Une erreur s\'est produite!');
    }, 2000);
  };
  
  // Example of error handling with an API call
  const handleApiCallExample = async () => {
    setLoading(true);
    setFormErrors({});
    
    try {
      // Example API call
      const response = await axios.get('/api/some-endpoint');
      showSuccess('Données récupérées avec succès');
      console.log(response.data);
    } catch (error) {
      // For validation errors (status 422)
      if (error.status === 422) {
        const fieldErrors = extractValidationErrors(error);
        setFormErrors(fieldErrors);
      } else {
        // For other errors, the global interceptor will show a toast automatically
        // But you can add additional handling here if needed
        console.error('Error details:', error);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Example handling different types of errors
  const handleDifferentErrors = async () => {
    try {
      // Simulating a 404 error
      await axios.get('/api/non-existent');
    } catch (error) {
      // No need to call showError here since the global interceptor will handle it
      // But you can add additional handling logic if needed
      if (error.status === 404) {
        // Do something specific for 404 errors
        console.log('Resource not found specific handling');
      }
    }
  };
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Exemples de gestion d'erreurs et notifications</h2>
      
      <div className="space-y-4">
        <div>
          <button 
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={handleSuccessExample}
          >
            Montrer une notification de succès
          </button>
        </div>
        
        <div>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleShowToastTypes}
          >
            Montrer différents types de notifications
          </button>
        </div>
        
        <div>
          <button 
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            onClick={handleApiCallExample}
            disabled={loading}
          >
            {loading ? 'Chargement...' : 'Simuler un appel API'}
          </button>
        </div>
        
        <div>
          <button 
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={handleDifferentErrors}
          >
            Simuler différentes erreurs
          </button>
        </div>
        
        {/* Display form errors if any */}
        {Object.keys(formErrors).length > 0 && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            <p className="font-medium">Erreurs de validation:</p>
            <ul className="list-disc pl-5">
              {Object.entries(formErrors).map(([field, error]) => (
                <li key={field}>
                  <span className="font-medium">{field}:</span> {error}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorHandlingExample; 