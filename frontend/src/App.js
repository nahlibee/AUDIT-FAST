import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SAPDataProvider } from './context/SAPDataContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Composants de layout
import MainLayout from './layouts/MainLayout';

// Auth pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Pages principales
import HomePage from './pages/HomePage';
import AGRUsersPage from './pages/AGRUsersPage';
import USR02Page from './pages/USR02Page';
import UST12Page from './pages/UST12Page';
import IntegratedAnalysisPage from './pages/IntegratedAnalysisPage';
import ReportPage from './pages/ReportPage';
import NotFoundPage from './pages/NotFoundPage';

// Pages d'analyse des accès
import RolesAnalysisPage from './pages/analysis/RolesAnalysisPage';
import UsersAnalysisPage from './pages/analysis/UsersAnalysisPage';
import PrivilegesAnalysisPage from './pages/analysis/PrivilegesAnalysisPage';
import InactiveUsersPage from './pages/analysis/InactiveUsersPage';
import SoDViolationsPage from './pages/analysis/SoDViolationsPage';
import SoDRulesPage from './pages/analysis/SoDRulesPage';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  
  if (!isLoggedIn) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <SAPDataProvider>
        <Router>
          <Routes>
            {/* Auth routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              {/* Page d'accueil */}
              <Route index element={<HomePage />} />
              
              {/* Pages d'analyse par table */}
              <Route path="agr-users" element={<AGRUsersPage />} />
              <Route path="usr02" element={<USR02Page />} />
              <Route path="ust12" element={<UST12Page />} />
              <Route path="integrated" element={<IntegratedAnalysisPage />} />
              
              {/* Pages d'analyse spécifiques */}
              <Route path="analysis/roles" element={<RolesAnalysisPage />} />
              <Route path="analysis/users" element={<UsersAnalysisPage />} />
              <Route path="analysis/privileges" element={<PrivilegesAnalysisPage />} />
              <Route path="analysis/inactive" element={<InactiveUsersPage />} />
              <Route path="analysis/sod-violations" element={<SoDViolationsPage />} />
              <Route path="analysis/sod-rules" element={<SoDRulesPage />} />
              
              {/* Page de rapport */}
              <Route path="report" element={<ReportPage />} />
            </Route>

            {/* Page 404 */}
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Router>
      </SAPDataProvider>
    </AuthProvider>
  );
};

export default App;