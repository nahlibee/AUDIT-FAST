// src/components/tabs/risks/InactiveUsers.js

import React from 'react';
import { useSAPData } from '../../../context/SAPDataContext';
import DataTable from '../../common/DataTable';
import { exportToCSV } from '../../../utils/exportUtils';
import { getRiskLevelClass } from '../../../utils/styleUtils';

const InactiveUsers = () => {
  const { data } = useSAPData();

  // Si aucune donnée d'inactivité n'est disponible
  if (!data.inactiveUsers || data.inactiveUsers.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <p className="text-gray-500">
          Aucun utilisateur inactif détecté ou données UST12 non disponibles.
          <br />
          Pour analyser l'inactivité des utilisateurs, veuillez importer un fichier UST12.
        </p>
      </div>
    );
  }

  // Définition des colonnes pour le tableau
  const columns = [
    { header: 'Utilisateur', accessor: 'user' },
    { header: 'Dernière connexion', accessor: 'last_login', defaultValue: 'Jamais' },
    { header: 'Jours d\'inactivité', accessor: 'days_since_login', defaultValue: 'N/A' },
    { 
      header: 'Statut', 
      accessor: 'status',
      // Format conditionnel pour le statut
      cellRenderer: (value, row) => {
        const riskLevel = row.days_since_login > 180 ? 'Critique' : 
                         row.days_since_login > 90 ? 'Élevé' : 'Moyen';
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${getRiskLevelClass(riskLevel)}`}>
            {value || 'Inactif'}
          </span>
        );
      }
    },
    { header: 'Date de création', accessor: 'creation_date', defaultValue: 'N/A' }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Utilisateurs inactifs (plus de 90 jours)</h3>
        <button 
          onClick={() => exportToCSV(data.inactiveUsers, 'utilisateurs_inactifs.csv')}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
        >
          Exporter
        </button>
      </div>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              {data.inactiveUsers.length} utilisateurs n'ont pas utilisé leur compte depuis plus de 90 jours.
              Ces comptes représentent un risque potentiel de sécurité.
            </p>
          </div>
        </div>
      </div>
      
      <DataTable 
        data={data.inactiveUsers} 
        columns={columns}
        pageSize={15}
        enableSorting={true}
      />
      
      <div className="mt-4 text-sm text-gray-500">
        <p>
          <strong>Recommandation :</strong> Les comptes inactifs devraient être désactivés ou supprimés 
          selon la politique de sécurité de l'entreprise.
        </p>
      </div>
    </div>
  );
};

export default InactiveUsers;