import React, { useState, useEffect } from 'react';
import { useSAPData } from '../../context/SAPDataContext';
import HighPrivilege from './risks/HighPrivilege';
import InactiveUsers from './risks/InactiveUsers';
import SodViolations from './risks/SodViolations';
import SodRules from './risks/SodRules';
import { getSubTabClass } from '../../utils/styleUtils';

/**
 * Composant d'analyse des risques avec sous-onglets
 * @returns {JSX.Element} - Élément JSX
 */
const RisksAnalysis = () => {
  const [activeSubTab, setActiveSubTab] = useState('highPrivilege');
  const { data, fetchSodRules } = useSAPData();

  // Charger les règles SoD au chargement du composant
  useEffect(() => {
    fetchSodRules();
  }, [fetchSodRules]);

  // Si aucune donnée n'est disponible, afficher un message
  if (!data) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md text-center">
        <p className="text-gray-500">Veuillez importer des données pour afficher l'analyse des risques.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Sous-navigation */}
      <div className="mt-4 mb-4 border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveSubTab('highPrivilege')}
            className={getSubTabClass(activeSubTab === 'highPrivilege')}
          >
            Privilèges élevés
          </button>
          <button
            onClick={() => setActiveSubTab('inactiveUsers')}
            className={getSubTabClass(activeSubTab === 'inactiveUsers')}
          >
            Utilisateurs inactifs
          </button>
          <button
            onClick={() => setActiveSubTab('sodViolations')}
            className={getSubTabClass(activeSubTab === 'sodViolations')}
          >
            Violations SoD
          </button>
          <button
            onClick={() => setActiveSubTab('sodRules')}
            className={getSubTabClass(activeSubTab === 'sodRules')}
          >
            Gestion des règles SoD
          </button>
        </nav>
      </div>

      {/* Contenu des sous-onglets */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        {activeSubTab === 'highPrivilege' && <HighPrivilege />}
        {activeSubTab === 'inactiveUsers' && <InactiveUsers />}
        {activeSubTab === 'sodViolations' && <SodViolations />}
        {activeSubTab === 'sodRules' && <SodRules />}
      </div>
    </div>
  );
};

export default RisksAnalysis;