import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Toast component for displaying notifications
 * @param {Object} props - Component props
 * @param {string} props.type - Toast type (success, error, warning, info)
 * @param {string} props.message - Message to display
 * @param {number} props.duration - Duration in ms (default: 3000)
 * @param {Function} props.onClose - Function called when toast is closed
 */
const Toast = ({ type = 'info', message, duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);
  
  // Default styling based on type
  const getToastClass = () => {
    const baseClass = 'fixed top-4 right-4 max-w-md px-4 py-3 rounded-md shadow-lg z-50 flex items-center justify-between transform transition-transform duration-300';
    
    switch (type) {
      case 'success':
        return `${baseClass} bg-green-50 text-green-800 border-l-4 border-green-500`;
      case 'error':
        return `${baseClass} bg-red-50 text-red-800 border-l-4 border-red-500`;
      case 'warning':
        return `${baseClass} bg-yellow-50 text-yellow-800 border-l-4 border-yellow-500`;
      default:
        return `${baseClass} bg-blue-50 text-blue-800 border-l-4 border-blue-500`;
    }
  };
  
  // Get appropriate icon based on type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 mr-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 mr-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 mr-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 mr-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };
  
  useEffect(() => {
    // Auto close after duration
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          if (onClose) onClose();
        }, 300); // Wait for animation to complete
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);
  
  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // Wait for animation to complete
  };
  
  return createPortal(
    <div 
      className={`${getToastClass()} ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
      role="alert"
    >
      <div className="flex items-center">
        {getIcon()}
        <div>
          <p className="font-medium">{message}</p>
        </div>
      </div>
      <button 
        onClick={handleClose}
        className="ml-4 text-gray-500 hover:text-gray-700"
        aria-label="Close"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>,
    document.body
  );
};

export default Toast; 