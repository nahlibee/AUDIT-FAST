import React from 'react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { useSAPData } from '../../context/SAPDataContext';
import { exportToCSV } from '../../utils/exportUtils';
import { getCardClass } from '../../utils/styleUtils';

/**
 * Composant d'affichage de la vue d'ensemble
 * @returns {JSX.Element} - Élément JSX
 */
const Overview = () => {
  const { data } = useSAPData();

  // Si aucune donnée n'est disponible, afficher un message
  if (!data) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md text-center">
        <p className="text-gray-500">Veuillez importer des données pour afficher la vue d'ensemble.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 mb-8">
      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Total des enregistrements</h3>
          <p className="text-3xl font-bold text-blue-600">{data.generalStats.totalRecords}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Rôles uniques</h3>
          <p className="text-3xl font-bold text-green-600">{data.generalStats.uniqueRolesCount}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Utilisateurs uniques</h3>
          <p className="text-3xl font-bold text-purple-600">{data.generalStats.uniqueUsersCount}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Dernière mise à jour</h3>
          <p className="text-lg font-medium text-gray-700">{data.generalStats.lastUpdated || 'N/A'}</p>
        </div>
      </div>
      
      {/* Graphiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Attribution des rôles dans le temps</h3>
            <button 
              onClick={() => exportToCSV(data.timelineData, 'attributions_roles_timeline.csv')}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
            >
              Exporter
            </button>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="count" name="Attributions de rôles" fill="#8884d8" stroke="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Top 10 des utilisateurs avec le plus de rôles</h3>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topUsers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="user" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Nombre de rôles" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Tableau de bord des risques */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Tableau de bord des risques</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={getCardClass('danger')}>
              <h4 className="text-lg font-medium text-red-800 mb-2">Privilèges élevés</h4>
              <p className="text-3xl font-bold text-red-600">
                {data.usersWithHighPrivilegeRoles ? 
                  new Set(data.usersWithHighPrivilegeRoles.map(item => item.user)).size : 
                  0}
              </p>
              <p className="text-sm text-red-600 mt-1">Utilisateurs avec des rôles sensibles</p>
            </div>
            
            <div className={getCardClass('warning')}>
              <h4 className="text-lg font-medium text-orange-800 mb-2">Violations SoD</h4>
              <p className="text-3xl font-bold text-orange-600">
                {data.sodViolations ? data.sodViolations.length : 0}
              </p>
              <p className="text-sm text-orange-600 mt-1">Conflits de séparation des tâches</p>
            </div>
            
            <div className={getCardClass('info')}>
              <h4 className="text-lg font-medium text-yellow-800 mb-2">Utilisateurs inactifs</h4>
              <p className="text-3xl font-bold text-yellow-600">
                {data.inactiveUsers ? data.inactiveUsers.length : 0}
              </p>
              <p className="text-sm text-yellow-600 mt-1">Sans connexion depuis +90 jours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;