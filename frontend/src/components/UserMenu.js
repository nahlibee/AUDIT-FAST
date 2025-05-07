import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import LogoutButton from './LogoutButton';

const UserMenu = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-gray-700 focus:outline-none"
      >
        <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center text-white font-semibold">
          {user.username ? user.username.charAt(0).toUpperCase() : '?'}
        </div>
        <span className="ml-2 hidden md:block">{user.username}</span>
        <svg
          className={`ml-1 h-5 w-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
          <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
            <p className="font-semibold">{user.username}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          
          {user.roles && user.roles.length > 0 && (
            <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-200">
              <p>Rôle: {user.roles.map(role => role.replace('ROLE_', '')).join(', ')}</p>
            </div>
          )}
          
          <Link 
            to="/profile" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-200"
            onClick={() => setIsOpen(false)}
          >
            Mon profil
          </Link>
          
          <div className="px-4 py-2">
            <LogoutButton className="w-full text-sm" variant="secondary" />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu; 