import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getButtonClass } from '../utils/StyleUtils';

const LogoutButton = ({ className = '', variant = 'primary' }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <button
      onClick={handleLogout}
      className={`${getButtonClass(variant)} ${className}`}
      type="button"
    >
      Déconnexion
    </button>
  );
};

export default LogoutButton; 