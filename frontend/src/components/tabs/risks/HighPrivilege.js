import React from 'react';
import { useSAPData } from '../../../context/SapDataContext';
import DataTable from '../../common/DataTable';
import { exportToCSV } from '../../../utils/ExportUtils';

/**
 * Composant d'analyse des privilèges élevés
 * @returns {JSX.Element} - Élément JSX
 */
const HighPrivilege = () => {
  const { data } = useSAPData();

  // Définition des colonnes pour le tableau des rôles à privilèges élevés
  const rolesColumns = [
    { header: 'Nom du rôle', accessor: 'role' }
  ];

  // Préparation des données des rôles
  const rolesData = data.highPrivilegeRoles.map(role => ({ role }));

  // Définition des colonnes pour le tableau des utilisateurs avec des rôles à privilèges élevés
  const usersColumns = [
    { header: 'Utilisateur', accessor: 'user' },
    { header: 'Rôle à privilège élevé', accessor: 'role' },
    { header: 'Date d\'attribution', accessor: 'from_date', defaultValue: 'N/A' },
    { header: 'Date d\'expiration', accessor: 'to_date', defaultValue: 'Indéfinie' }
  ];

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Rôles à privilèges élevés</h3>
          <button 
            onClick={() => exportToCSV(rolesData, 'high_privilege_roles.csv')}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            Exporter
          </button>
        </div>
        
        <DataTable 
          data={rolesData} 
          columns={rolesColumns} 
        />
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Utilisateurs avec des rôles à privilèges élevés</h3>
          <button 
            onClick={() => exportToCSV(data.usersWithHighPrivilegeRoles, 'users_high_privilege.csv')}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            Exporter
          </button>
        </div>
        
        <DataTable 
          data={data.usersWithHighPrivilegeRoles} 
          columns={usersColumns} 
        />
      </div>
    </>
  );
};

export default HighPrivilege;