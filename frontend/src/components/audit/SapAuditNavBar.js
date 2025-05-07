// src/components/audit/SAPAuditNavbar.js
import React, { useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getTabClass } from '../../utils/StyleUtils';

const SAPAuditNavbar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  
  // Check if path starts with /audit to highlight the parent nav item
  const isAuditPath = location.pathname.startsWith('/audit');
  
  return (
    <nav className="border-b border-gray-200 mb-6">
      <div className="flex overflow-x-auto custom-scrollbar">
        <NavLink
          to="/audit/dashboard"
          className={({ isActive }) => getTabClass(isActive || (isAuditPath && location.pathname === '/audit'))}
        >
          Dashboard
        </NavLink>
        
        <NavLink
          to="/audit/missions"
          className={({ isActive }) => getTabClass(isActive)}
        >
          Missions
        </NavLink>
        
        <NavLink
          to="/audit/missions/assignments"
          className={({ isActive }) => getTabClass(isActive)}
        >
          Assignments
        </NavLink>
        
        <NavLink
          to="/audit/reports"
          className={({ isActive }) => getTabClass(isActive)}
        >
          Audit Reports
        </NavLink>
        
        <NavLink
          to="/audit/sap-systems"
          className={({ isActive }) => getTabClass(isActive)}
        >
          SAP Systems
        </NavLink>
        
        <NavLink
          to="/audit/analysis"
          className={({ isActive }) => getTabClass(isActive)}
        >
          Data Analysis
        </NavLink>
        
        {/* Admin specific navigation items */}
        {user?.roles?.includes('ADMIN') && (
          <NavLink
            to="/audit/users"
            className={({ isActive }) => getTabClass(isActive)}
          >
            User Management
          </NavLink>
        )}
      </div>
    </nav>
  );
};

export default SAPAuditNavbar;