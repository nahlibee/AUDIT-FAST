import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/common/Toast';

// Create context
const ToastContext = createContext();

// Generate unique IDs for toasts
let toastId = 0;
const generateId = () => {
  return `toast-${toastId++}`;
};

/**
 * Provider component for toast notifications
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Add a new toast
  const addToast = useCallback((type, message, duration = 5000) => {
    const id = generateId();
    setToasts(prevToasts => [...prevToasts, { id, type, message, duration }]);
    return id;
  }, []);

  // Remove a toast by id
  const removeToast = useCallback((id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  // Helper methods for common toast types
  const showSuccess = useCallback((message, duration) => {
    return addToast('success', message, duration);
  }, [addToast]);

  const showError = useCallback((message, duration) => {
    return addToast('error', message, duration);
  }, [addToast]);

  const showWarning = useCallback((message, duration) => {
    return addToast('warning', message, duration);
  }, [addToast]);

  const showInfo = useCallback((message, duration) => {
    return addToast('info', message, duration);
  }, [addToast]);

  // Clear all toasts
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Context value
  const contextValue = {
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearToasts
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Render active toasts */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
};

/**
 * Hook to use the toast context
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
export { ToastContext };