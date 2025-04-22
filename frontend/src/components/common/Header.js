import React from 'react';
import { useSAPData } from '../../context/SAPDataContext';
import { getButtonClass } from '../../utils/styleUtils';

/**
 * Composant d'en-tête de l'application
 * @param {Object} props - Propriétés du composant
 * @param {Function} props.setActiveTab - Fonction pour changer d'onglet
 * @returns {JSX.Element} - Élément JSX
 */
const Header = ({ setActiveTab }) => {
  const { data, createReport } = useSAPData();

  return (
    <header className="bg-gray-900 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-3 md:mb-0">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-10 w-10 mr-3" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/40';
              }}
            />
            <div>
              <h1 className="text-xl font-bold text-yellow-400">Analyseur de données SAP</h1>
              <p className="text-sm text-gray-300">Outil d'audit avancé pour l'analyse des accès utilisateurs SAP</p>
              <span className="text-xs text-yellow-500">Connecté à l'API Python FastAPI v2.0</span>
            </div>
          </div>

          <div className="flex space-x-2">
            {data && (
              <button
                onClick={() => {
                  createReport();
                  setActiveTab('report');
                }}
                className={getButtonClass('success')}
              >
                Générer un rapport d'audit
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;