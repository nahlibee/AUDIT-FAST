
import React from 'react';

const UsersAnalysisPage = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white p-4 rounded-lg shadow ${className}`}>
      {title && <h3 className="text-lg font-medium text-gray-800 mb-3">{title}</h3>}
      {children}
    </div>
  );
};

export default UsersAnalysisPage;