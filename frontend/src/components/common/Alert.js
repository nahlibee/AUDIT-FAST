// src/components/common/Alert.js
import React, { useState } from 'react';
import { getAlertClass } from '../../utils/StyleUtils';

/**
 * Standardized Alert component
 * @param {Object} props
 * @param {string} props.variant - Alert variant (info, warning, danger, success)
 * @param {boolean} props.dismissible - Whether the alert can be dismissed
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Alert content
 * @param {Function} props.onDismiss - Callback when alert is dismissed
 */
const Alert = ({
  variant = 'info',
  dismissible = false,
  className = '',
  children,
  onDismiss,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <div
      className={`${getAlertClass(variant, dismissible)} ${className}`}
      role="alert"
      {...props}
    >
      <div className="flex-1">
        {children}
      </div>
      {dismissible && (
        <button
          type="button"
          className="ml-3 text-gray-500 hover:text-gray-700 focus:outline-none"
          onClick={handleDismiss}
          aria-label="Close"
        >
          <span className="sr-only">Close</span>
          <svg
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Alert;