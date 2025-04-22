// src/layouts/MainLayout.js
import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useSAPData } from '../context/SAPDataContext';
import { getButtonClass, getAppContainerClass, getMainContainerClass } from '../utils/styleUtils';

const MainLayout = () => {
  const { loading, data, analysisId } = useSAPData();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className={getAppContainerClass()}>
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-gray-800 text-white transition-all duration-300 ease-in-out fixed h-screen`}>
        <div className="p-4 flex items-center justify-between">
          <h1 className={`text-xl font-bold text-yellow-400 ${isSidebarOpen ? 'block' : 'hidden'}`}>Analyseur SAP</h1>
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-1 rounded-full hover:bg-gray-700 focus:outline-none text-yellow-400"
          >
            {isSidebarOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>
        
        <nav className="mt-4">
          {/* Liens de navigation principale */}
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `flex items-center p-4 ${isActive ? 'bg-gray-700 border-l-4 border-yellow-400' : 'hover:bg-gray-700 hover:border-l-4 hover:border-yellow-300'}`
            }
          >
            <svg className="w-6 h-6 mr-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {isSidebarOpen && <span>Accueil</span>}
          </NavLink>
          
          {/* Section d'import de données */}
          <div className={`px-4 pt-4 pb-2 ${isSidebarOpen ? 'block' : 'hidden'}`}>
            <h5 className="text-xs uppercase tracking-wider text-yellow-400">Import de données</h5>
          </div>
          
          <NavLink 
            to="/agr-users" 
            className={({ isActive }) => 
              `flex items-center p-4 ${isActive ? 'bg-gray-700 border-l-4 border-yellow-400' : 'hover:bg-gray-700 hover:border-l-4 hover:border-yellow-300'}`
            }
          >
            <svg className="w-6 h-6 mr-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {isSidebarOpen && <span>AGR_USERS (Rôles)</span>}
          </NavLink>
          
          <NavLink 
            to="/usr02" 
            className={({ isActive }) => 
              `flex items-center p-4 ${isActive ? 'bg-gray-700 border-l-4 border-yellow-400' : 'hover:bg-gray-700 hover:border-l-4 hover:border-yellow-300'}`
            }
          >
            <svg className="w-6 h-6 mr-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {isSidebarOpen && <span>USR02 (Utilisateurs)</span>}
          </NavLink>
          
          <NavLink 
            to="/ust12" 
            className={({ isActive }) => 
              `flex items-center p-4 ${isActive ? 'bg-gray-700 border-l-4 border-yellow-400' : 'hover:bg-gray-700 hover:border-l-4 hover:border-yellow-300'}`
            }
          >
            <svg className="w-6 h-6 mr-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {isSidebarOpen && <span>UST12 (Connexions)</span>}
          </NavLink>
          
          {/* Section d'analyse */}
          <div className={`px-4 pt-4 pb-2 ${isSidebarOpen ? 'block' : 'hidden'}`}>
            <h5 className="text-xs uppercase tracking-wider text-yellow-400">Analyse</h5>
          </div>
          
          <NavLink 
            to="/analysis/roles" 
            className={({ isActive }) => 
              `flex items-center p-4 ${isActive ? 'bg-gray-700 border-l-4 border-yellow-400' : 'hover:bg-gray-700 hover:border-l-4 hover:border-yellow-300'}`
            }
          >
            <svg className="w-6 h-6 mr-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            {isSidebarOpen && <span>Analyse des rôles</span>}
          </NavLink>
          
          <NavLink 
            to="/analysis/users" 
            className={({ isActive }) => 
              `flex items-center p-4 ${isActive ? 'bg-gray-700 border-l-4 border-yellow-400' : 'hover:bg-gray-700 hover:border-l-4 hover:border-yellow-300'}`
            }
          >
            <svg className="w-6 h-6 mr-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {isSidebarOpen && <span>Analyse des utilisateurs</span>}
          </NavLink>
          
          <NavLink 
            to="/analysis/privileges" 
            className={({ isActive }) => 
              `flex items-center p-4 ${isActive ? 'bg-gray-700 border-l-4 border-yellow-400' : 'hover:bg-gray-700 hover:border-l-4 hover:border-yellow-300'}`
            }
          >
            <svg className="w-6 h-6 mr-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            {isSidebarOpen && <span>Analyse des privilèges</span>}
          </NavLink>
          
          <NavLink 
            to="/analysis/inactive" 
            className={({ isActive }) => 
              `flex items-center p-4 ${isActive ? 'bg-gray-700 border-l-4 border-yellow-400' : 'hover:bg-gray-700 hover:border-l-4 hover:border-yellow-300'}`
            }
          >
            <svg className="w-6 h-6 mr-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {isSidebarOpen && <span>Utilisateurs inactifs</span>}
          </NavLink>
          
          <NavLink 
            to="/analysis/sod-violations" 
            className={({ isActive }) => 
              `flex items-center p-4 ${isActive ? 'bg-gray-700 border-l-4 border-yellow-400' : 'hover:bg-gray-700 hover:border-l-4 hover:border-yellow-300'}`
            }
          >
            <svg className="w-6 h-6 mr-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {isSidebarOpen && <span>Violations SoD</span>}
          </NavLink>
          
          <NavLink 
            to="/analysis/sod-rules" 
            className={({ isActive }) => 
              `flex items-center p-4 ${isActive ? 'bg-gray-700 border-l-4 border-yellow-400' : 'hover:bg-gray-700 hover:border-l-4 hover:border-yellow-300'}`
            }
          >
            <svg className="w-6 h-6 mr-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            {isSidebarOpen && <span>Règles SoD</span>}
          </NavLink>
          
          <NavLink 
            to="/integrated" 
            className={({ isActive }) => 
              `flex items-center p-4 ${isActive ? 'bg-gray-700 border-l-4 border-yellow-400' : 'hover:bg-gray-700 hover:border-l-4 hover:border-yellow-300'}`
            }
          >
            <svg className="w-6 h-6 mr-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            {isSidebarOpen && <span>Analyse intégrée</span>}
          </NavLink>
          
          <NavLink 
            to="/report" 
            className={({ isActive }) => 
              `flex items-center p-4 ${isActive ? 'bg-gray-700 border-l-4 border-yellow-400' : 'hover:bg-gray-700 hover:border-l-4 hover:border-yellow-300'}`
            }
          >
            <svg className="w-6 h-6 mr-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {isSidebarOpen && <span>Rapport</span>}
          </NavLink>
        </nav>
      </div>
      
      {/* Main content */}
      <div className={`${isSidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out`}>
        {/* Top header */}
        <header className="bg-white shadow-md border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {location.pathname === '/' && 'Tableau de bord'}
              {location.pathname === '/agr-users' && 'Analyse AGR_USERS'}
              {location.pathname === '/usr02' && 'Analyse USR02'}
              {location.pathname === '/ust12' && 'Analyse UST12'}
              {location.pathname === '/integrated' && 'Analyse intégrée'}
              {location.pathname === '/report' && 'Rapport'}
              {location.pathname.startsWith('/analysis/') && 'Analyse détaillée'}
            </h2>
            
            {analysisId && (
              <div className="text-sm bg-yellow-100 text-black px-3 py-1 rounded-full border border-yellow-400">
                ID d'analyse: <span className="font-mono font-medium">{analysisId}</span>
              </div>
            )}
          </div>
        </header>
        
        {/* Loading indicator */}
        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-5 rounded-lg flex items-center">
              <div className="loading-spinner mr-3"></div>
              <span className="text-gray-800">Traitement en cours...</span>
            </div>
          </div>
        )}
        
        {/* Main content area */}
        <main className={getMainContainerClass()}>
          <Outlet />
        </main>
        
        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
            <p>Analyseur SAP pour l'audit IT | {new Date().getFullYear()}</p>
            <p className="text-xs">Architecture hybride: React + Python FastAPI</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;