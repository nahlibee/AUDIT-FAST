// src/layouts/MainLayout.js
import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import MainNavbar from '../components/MainNavbar';
import { useAuth } from '../context/AuthContext';
import { useSAPData } from '../context/SapDataContext';
import Alert from '../components/common/Alert';
import { getMainContainerClass } from '../utils/StyleUtils';


const MainLayout = () => {
  const { user } = useAuth();
  const { loading, error } = useSAPData();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Determine if we're in an audit-related section
  const isAuditSection = location.pathname.startsWith('/audit');
  const isAnalysisSection = location.pathname.startsWith('/analysis') || location.pathname.startsWith('/integrated');

  return (
    <div className="min-h-screen bg-gray-100">
      <MainNavbar />
      
      <main className="pt-16">
        {isAuditSection && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">SAP Audit Management</h1>
              <p className="text-sm text-gray-600">
                Manage audit missions, assignments, reports, and SAP system configurations
              </p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Alert 
              type="error" 
              message={error} 
              className="mb-6"
            />
          </div>
        )}
        
        <div className={getMainContainerClass()}>
          {loading && isAnalysisSection ? (
            <div className="flex justify-center items-center py-12">
              <div className="loading-spinner mr-3"></div>
              <span className="text-gray-800">Loading...</span>
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </main>
      
      
      
    </div>
  );
};

export default MainLayout;