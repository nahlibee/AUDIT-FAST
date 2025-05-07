import React from 'react';
import { ExclamationCircleOutlined, WarningOutlined, InfoCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

/**
 * Component to display audit findings with risk ratings
 */
const AuditFindings = ({ findings }) => {
  if (!findings || findings.length === 0) {
    return (
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <InfoCircleOutlined className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Aucun problème d'audit n'a été détecté.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Sort findings by risk rating (Critical first, then High, Medium, Low)
  const sortedFindings = [...findings].sort((a, b) => {
    const riskPriority = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
    return riskPriority[a.riskRating] - riskPriority[b.riskRating];
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Problèmes d'Audit ({findings.length})</h2>
      
      {sortedFindings.map((finding, index) => (
        <div 
          key={finding.id || index} 
          className={`rounded-md p-4 mb-4 ${getRiskColor(finding.riskRating)}`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getRiskIcon(finding.riskRating)}
            </div>
            <div className="ml-3 w-full">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">
                  {finding.title}
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskBadgeColor(finding.riskRating)}`}>
                  {finding.riskRating}
                </span>
              </div>
              <div className="mt-2 mb-2">
                <p className="text-sm text-gray-700">
                  {finding.description}
                </p>
              </div>
              <div className="mt-2 border-t border-gray-200 pt-2">
                <p className="text-sm font-medium text-gray-700">Recommandation:</p>
                <p className="text-sm text-gray-600">
                  {finding.recommendation}
                </p>
              </div>
              {(finding.userCount || finding.conflictCount || finding.accountCount) && (
                <div className="mt-3 flex space-x-3">
                  {finding.userCount && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {finding.userCount} utilisateurs
                    </span>
                  )}
                  {finding.conflictCount && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {finding.conflictCount} conflits
                    </span>
                  )}
                  {finding.accountCount && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {finding.accountCount} comptes
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Helper function to get background color based on risk rating
const getRiskColor = (riskRating) => {
  switch (riskRating) {
    case 'Critical':
      return 'bg-red-50 border border-red-200';
    case 'High':
      return 'bg-orange-50 border border-orange-200';
    case 'Medium':
      return 'bg-yellow-50 border border-yellow-200';
    case 'Low':
      return 'bg-green-50 border border-green-200';
    default:
      return 'bg-gray-50 border border-gray-200';
  }
};

// Helper function to get badge color based on risk rating
const getRiskBadgeColor = (riskRating) => {
  switch (riskRating) {
    case 'Critical':
      return 'bg-red-100 text-red-800';
    case 'High':
      return 'bg-orange-100 text-orange-800';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'Low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Helper function to get icon based on risk rating
const getRiskIcon = (riskRating) => {
  switch (riskRating) {
    case 'Critical':
      return <ExclamationCircleOutlined className="h-5 w-5 text-red-400" />;
    case 'High':
      return <WarningOutlined className="h-5 w-5 text-orange-400" />;
    case 'Medium':
      return <WarningOutlined className="h-5 w-5 text-yellow-400" />;
    case 'Low':
      return <InfoCircleOutlined className="h-5 w-5 text-green-400" />;
    default:
      return <CheckCircleOutlined className="h-5 w-5 text-gray-400" />;
  }
};

export default AuditFindings; 