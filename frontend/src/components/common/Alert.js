// src/components/common/Alert.js
import React from 'react';

const Alert = ({ type = 'info', message, className = '' }) => {
  let alertClass = '';
  
  switch (type) {
    case 'error':
      alertClass = 'bg-red-100 text-red-700 border-red-400';
      break;
    case 'warning':
      alertClass = 'bg-yellow-100 text-yellow-700 border-yellow-400';
      break;
    case 'success':
      alertClass = 'bg-green-100 text-green-700 border-green-400';
      break;
    default:
      alertClass = 'bg-blue-100 text-blue-700 border-blue-400';
  }
  
  return (
    <div className={`p-4 border-l-4 rounded-md ${alertClass} ${className}`}>
      {type === 'error' && (
        <div className="flex">
          <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{message}</span>
        </div>
      )}
      
      {type === 'warning' && (
        <div className="flex">
          <svg className="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{message}</span>
        </div>
      )}
      
      {type === 'success' && (
        <div className="flex">
          <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>{message}</span>
        </div>
      )}
      
      {type === 'info' && (
        <div className="flex">
          <svg className="h-5 w-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>{message}</span>
        </div>
      )}
    </div>
  );
};

export default Alert;