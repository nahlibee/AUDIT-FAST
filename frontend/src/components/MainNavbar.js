// src/components/MainNavbar.js (ou le fichier de navigation principal de votre application)
import React, { useContext, useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getButtonClass } from '../utils/StyleUtils';
import UserMenu from './UserMenu';

const MainNavbar = () => {
  const { user, isAdmin } = useContext(AuthContext);
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMissionMenuOpen, setIsMissionMenuOpen] = useState(false);
  const [isAnalysisMenuOpen, setIsAnalysisMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  
  // Check if the user is an admin and log the relevant information
  useEffect(() => {
    if (user) {
      console.log('User roles:', user.roles);
      const adminCheck = isAdmin();
      console.log('isAdmin() result:', adminCheck);
      setIsUserAdmin(adminCheck);
      
      // Debug server-side role format
      if (user.roles && Array.isArray(user.roles)) {
        console.log('Role formats in array:', user.roles);
      }
    }
  }, [user, isAdmin]);

  const navItems = [
    { to: '/', label: 'Accueil', icon: 'home' },
    { 
      label: 'Missions', 
      icon: 'shield-check',
      subItems: [
        { to: '/missions', label: 'Gestion des missions' },
        { to: '/missions/assignments', label: 'Assignations' }
      ]
    },
    { 
      label: 'Analyse', 
      icon: 'chart-bar',
      subItems: [
        { to: '/analysis', label: 'Analyse intégrée' },
        { to: '/integrated', label: 'Analyse détaillée' },
        { to: '/audit-report', label: 'Rapport d\'audit' },
        { to: '/dashboard', label: 'Tableau de bord' }
      ]
    }
  ];

  // Admin nav items - only include if user is admin
  if (isUserAdmin) {
    navItems.push({
      label: 'Administration',
      icon: 'cog',
      subItems: [
        { to: '/admin/users', label: 'Gestion des utilisateurs' }
      ]
    });
  }

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'home':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      case 'shield-check':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'chart-bar':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'cog':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <nav className="bg-gray-800 fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img className="h-8 w-8" src="/logo.png" alt="Logo" />
              <span className="text-white ml-2 text-lg font-bold hidden sm:block">AUDIT-FAST</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item, index) => (
                <div key={index} className="relative">
                  {item.subItems ? (
                    <div className="relative">
                      <button
                        onClick={() => {
                          if (item.label === 'Missions') setIsMissionMenuOpen(!isMissionMenuOpen);
                          if (item.label === 'Analyse') setIsAnalysisMenuOpen(!isAnalysisMenuOpen);
                          if (item.label === 'Administration') setIsAdminMenuOpen(!isAdminMenuOpen);
                        }}
                        className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                          location.pathname.startsWith('/' + item.subItems[0].to.split('/')[1])
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        {getIcon(item.icon)}
                        <span>{item.label}</span>
                        <svg
                          className={`ml-2 h-4 w-4 transition-transform duration-200 ${
                            (item.label === 'Missions' && isMissionMenuOpen) ||
                            (item.label === 'Analyse' && isAnalysisMenuOpen) ||
                            (item.label === 'Administration' && isAdminMenuOpen)
                              ? 'transform rotate-180'
                              : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Dropdown Menu */}
                      {((item.label === 'Missions' && isMissionMenuOpen) || 
                         (item.label === 'Analyse' && isAnalysisMenuOpen) ||
                         (item.label === 'Administration' && isAdminMenuOpen)) ? (
                        <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                          <div className="py-1" role="menu" aria-orientation="vertical">
                            {item.subItems.map((subItem, subIndex) => (
                              <NavLink
                                key={subIndex}
                                to={subItem.to}
                                className={({ isActive }) =>
                                  `block px-4 py-2 text-sm ${
                                    isActive
                                      ? 'bg-gray-100 text-gray-900'
                                      : 'text-gray-700 hover:bg-gray-100'
                                  }`
                                }
                                role="menuitem"
                              >
                                {subItem.label}
                              </NavLink>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                          isActive
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`
                      }
                    >
                      {getIcon(item.icon)}
                      <span>{item.label}</span>
                    </NavLink>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden md:block">
            <UserMenu />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item, index) => (
              <div key={index}>
                {item.subItems ? (
                  <div>
                    <button
                      onClick={() => {
                        if (item.label === 'Missions') setIsMissionMenuOpen(!isMissionMenuOpen);
                        if (item.label === 'Analyse') setIsAnalysisMenuOpen(!isAnalysisMenuOpen);
                        if (item.label === 'Administration') setIsAdminMenuOpen(!isAdminMenuOpen);
                      }}
                      className="flex items-center space-x-1 w-full px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                    >
                      {getIcon(item.icon)}
                      <span>{item.label}</span>
                      <svg
                        className={`ml-2 h-4 w-4 transition-transform duration-200 ${
                          (item.label === 'Missions' && isMissionMenuOpen) ||
                          (item.label === 'Analyse' && isAnalysisMenuOpen) ||
                          (item.label === 'Administration' && isAdminMenuOpen)
                            ? 'transform rotate-180'
                            : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {((item.label === 'Missions' && isMissionMenuOpen) ||
                      (item.label === 'Analyse' && isAnalysisMenuOpen) ||
                      (item.label === 'Administration' && isAdminMenuOpen)) ? (
                      <div className="pl-4">
                        {item.subItems.map((subItem, subIndex) => (
                          <NavLink
                            key={subIndex}
                            to={subItem.to}
                            className={({ isActive }) =>
                              `block px-3 py-2 rounded-md text-base font-medium ${
                                isActive
                                  ? 'bg-gray-900 text-white'
                                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
                              }`
                            }
                          >
                            {subItem.label}
                          </NavLink>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center space-x-1 px-3 py-2 rounded-md text-base font-medium ${
                        isActive
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-300 hover:text-white hover:bg-gray-700'
                      }`
                    }
                  >
                    {getIcon(item.icon)}
                    <span>{item.label}</span>
                  </NavLink>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default MainNavbar;