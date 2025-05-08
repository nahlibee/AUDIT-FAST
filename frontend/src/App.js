// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SAPDataProvider } from './context/SapDataContext';
import { AuditProvider } from './context/AuditContext';
import { ToastProvider } from './context/ToastContext';
import MainLayout from './layouts/MainLayout';
import RoleBasedRoute from './components/RoleBasedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import MissionManagementPage from './pages/MissionManagementPage';
import MissionAssignmentsPage from './pages/MissionAssignmentsPage';
import IntegratedAnalysisPage from './pages/IntegratedAnalysisPage';
import UserProfilePage from './pages/UserProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import MissionForm from './components/audit/MissionForm';
import { AdminUsersPage } from './pages/admin';
import { Layout } from 'antd';
import { getAppContainerClass, getMainContainerClass } from './utils/StyleUtils';

// Import components
import BackendDashboardPage from './pages/BackendDashboardPage';
import AuditReportPage from './pages/AuditReportPage';

const { Content, Footer } = Layout;

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <SAPDataProvider>
          <ToastProvider>
            <AuditProvider>
              <div className={getAppContainerClass()}>
                <div className={getMainContainerClass()}>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    
                    {/* Protected routes */}
                    <Route path="/" element={<MainLayout />}>
                      <Route index element={<HomePage />} />
                      
                      {/* Mission Management routes */}
                      <Route path="missions">
                        <Route index element={<MissionManagementPage />} />
                        <Route path="new" element={<MissionForm />} />
                        <Route path=":missionId/edit" element={<MissionForm />} />
                        <Route path="assignments" element={<MissionAssignmentsPage />} />
                      </Route>
                      
                      {/* Analysis routes */}
                      <Route path="analysis" element={<IntegratedAnalysisPage />} />
                      <Route path="integrated" element={<IntegratedAnalysisPage />} />
                      <Route path="audit-report" element={<AuditReportPage />} />
                      <Route path="dashboard" element={<BackendDashboardPage />} />
                      
                      {/* User routes */}
                      <Route path="profile" element={<UserProfilePage />} />
                      
                      {/* Admin routes */}
                      <Route path="admin">
                        <Route path="users" element={
                          <RoleBasedRoute allowedRoles={['ADMIN']}>
                            <AdminUsersPage />
                          </RoleBasedRoute>
                        } />
                      </Route>
                      
                      {/* Catch all route */}
                      <Route path="*" element={<NotFoundPage />} />
                    </Route>
                  </Routes>
                </div>
              </div>
            </AuditProvider>
          </ToastProvider>
        </SAPDataProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;