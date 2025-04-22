import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { getRiskLevelClass, getButtonClass, getCardClass, getTableContainerClass, getTableClass, getTableHeaderClass, getTableHeaderCellClass, getTableRowClass, getTableCellClass } from '../utils/styleUtils';

const COLORS = ['#facc15', '#eab308', '#84cc16', '#f59e0b', '#ef4444', '#8884d8', '#82ca9d', '#4ade80'];

const AGRUsersPage = () => {
  const [file, setFile] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [analysisId, setAnalysisId] = useState(null);

  const API_URL = 'http://localhost:8000/api';

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);
  };

  const processData = async () => {
    if (!file) {
      setError("Veuillez sélectionner un fichier d'extraction AGR_USERS");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (dateRange.start || dateRange.end) {
        const dateRangeData = {
          start_date: dateRange.start || null,
          end_date: dateRange.end || null
        };
        formData.append('date_range', JSON.stringify(dateRangeData));
      }
      
      const response = await fetch(`${API_URL}/analyze/agr-users`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erreur lors de l'analyse du fichier");
      }
      
      const result = await response.json();
      setData(result);
      setAnalysisId(result.analysis_id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterByDateRange = async () => {
    if (!data || !analysisId) {
      setError("Aucune donnée à filtrer. Veuillez d'abord analyser un fichier.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const dateRangeData = {
        start_date: dateRange.start || null,
        end_date: dateRange.end || null
      };
      
      const response = await fetch(`${API_URL}/filter/agr-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: data,
          date_range: dateRangeData
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors du filtrage des données');
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (dataToExport, filename) => {
    if (!dataToExport || dataToExport.length === 0) {
      setError("Aucune donnée à exporter");
      return;
    }
    
    let csvContent = '';
    
    // Entêtes
    const headers = Object.keys(dataToExport[0]);
    csvContent += headers.join(',') + '\n';
    
    // Données
    dataToExport.forEach(item => {
      const row = headers.map(header => {
        const value = item[header];
        // Gérer les valeurs spéciales (objets, tableaux, etc.)
        if (Array.isArray(value)) {
          return `"${value.join('; ')}"`;
        } else if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        } else {
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        }
      });
      csvContent += row.join(',') + '\n';
    });
    
    // Créer et télécharger le fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-gray-800 text-white p-4 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Analyseur AGR_USERS</h1>
            <p className="text-sm">Outil d'audit avancé pour l'analyse des rôles SAP</p>
            <div className="mt-2 text-xs bg-yellow-400 text-black inline-block px-2 py-1 rounded">
              FastAPI Backend v1.0
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow p-6">
        <div className={getCardClass('default')}>
          <h2 className="text-xl font-semibold mb-4">Import des données</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex-grow col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Extraction AGR_USERS (table des attributions de rôles)
              </label>
              <input
                type="file"
                accept=".csv,.txt,.xlsx,.xls"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-yellow-50 file:text-yellow-700
                        hover:file:bg-yellow-100"
              />
              <p className="mt-1 text-xs text-gray-500">Fichier contenant les assignations de rôles aux utilisateurs (AGR_USERS)</p>
            </div>
            
            <div className="flex-grow">
              <h3 className="block text-sm font-medium text-gray-700 mb-3">Filtrer par dates d'attribution</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    className="block w-full rounded-md border-gray-300 shadow-sm
                            focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    className="block w-full rounded-md border-gray-300 shadow-sm
                            focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3">
            <button
              onClick={processData}
              disabled={loading || !file}
              className={getButtonClass(loading || !file ? 'secondary' : 'primary', loading || !file)}
            >
              {loading ? 'Traitement en cours...' : 'Analyser les données'}
            </button>

            {data && (
              <button
                onClick={filterByDateRange}
                disabled={loading}
                className={getButtonClass('outline', loading)}
              >
                Appliquer le filtre de dates
              </button>
            )}
          </div>
          
          {error && (
            <div className={getAlertClass('danger', true)}>
              <p className="font-medium">Erreur:</p>
              <p>{error}</p>
            </div>
          )}
        </div>
        
        {data && (
          <>
            <div className="my-6">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={getTableClass(activeTab === 'overview')}
                  >
                    Vue d'ensemble
                  </button>
                  <button
                    onClick={() => setActiveTab('roles')}
                    className={getTableClass(activeTab === 'roles')}
                  >
                    Analyse des rôles
                  </button>
                  <button
                    onClick={() => setActiveTab('users')}
                    className={getTableClass(activeTab === 'users')}
                  >
                    Analyse des utilisateurs
                  </button>
                  <button
                    onClick={() => setActiveTab('security')}
                    className={getTableClass(activeTab === 'security')}
                  >
                    Risques de sécurité
                  </button>
                </nav>
              </div>
              
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 gap-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={getCardClass('info')}>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Total des enregistrements</h3>
                      <p className="text-3xl font-bold text-yellow-600">{data.generalStats.totalRecords}</p>
                      <p className="text-sm text-gray-600 mt-1">Lignes dans l'extraction AGR_USERS</p>
                    </div>
                    
                    <div className={getCardClass('info')}>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Rôles uniques</h3>
                      <p className="text-3xl font-bold text-yellow-600">{data.generalStats.uniqueRolesCount}</p>
                      <p className="text-sm text-gray-600 mt-1">Nombre de rôles distincts</p>
                    </div>
                    
                    <div className={getCardClass('info')}>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Utilisateurs uniques</h3>
                      <p className="text-3xl font-bold text-yellow-600">{data.generalStats.uniqueUsersCount}</p>
                      <p className="text-sm text-gray-600 mt-1">Nombre d'utilisateurs distincts</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={getCardClass('default')}>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Attribution des rôles dans le temps</h3>
                        {data.timelineData && data.timelineData.length > 0 && (
                          <button 
                            onClick={() => exportToCSV(data.timelineData, 'attributions_roles_timeline.csv')}
                            className={getButtonClass('text', false, 'sm')}
                          >
                            Exporter CSV
                          </button>
                        )}
                      </div>
                      
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={data.timelineData || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="count" name="Attributions de rôles" fill="#facc15" stroke="#eab308" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div className={getCardClass('default')}>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Répartition des rôles (Top 8)</h3>
                        {data.roleDistribution && data.roleDistribution.length > 0 && (
                          <button 
                            onClick={() => exportToCSV(data.roleDistribution, 'role_distribution.csv')}
                            className={getButtonClass('text', false, 'sm')}
                          >
                            Exporter CSV
                          </button>
                        )}
                      </div>
                      
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={data.roleDistribution ? data.roleDistribution.slice(0, 8) : []}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="count"
                              nameKey="role"
                              label={({ role, count, percent }) => 
                                `${role?.substring(0, 10)}${role?.length > 10 ? '...' : ''}: ${(percent * 100).toFixed(1)}%`
                              }
                            >
                              {data.roleDistribution && data.roleDistribution.slice(0, 8).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                  
                  <div className={getCardClass('warning', true)}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-amber-900">Tableau de bord des risques</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <h4 className="text-lg font-medium text-red-800 mb-2">Privilèges élevés</h4>
                        <p className="text-3xl font-bold text-red-600">
                          {data.usersWithHighPrivilegeRoles ? 
                            new Set(data.usersWithHighPrivilegeRoles.map(item => item.user)).size : 
                            0}
                        </p>
                        <p className="text-sm text-red-600 mt-1">Utilisateurs avec des rôles sensibles</p>
                      </div>
                      
                      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <h4 className="text-lg font-medium text-amber-800 mb-2">Rôles sensibles</h4>
                        <p className="text-3xl font-bold text-amber-600">
                          {data.highPrivilegeRoles ? data.highPrivilegeRoles.length : 0}
                        </p>
                        <p className="text-sm text-amber-600 mt-1">Rôles à privilèges élevés</p>
                      </div>
                      
                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <h4 className="text-lg font-medium text-yellow-800 mb-2">Risque global</h4>
                        <p className="text-3xl font-bold text-yellow-600">
                          {data.highPrivilegeRoles && data.usersWithHighPrivilegeRoles 
                            ? data.highPrivilegeRoles.length > 10 || 
                              new Set(data.usersWithHighPrivilegeRoles.map(item => item.user)).size > 5
                              ? "Élevé" : "Moyen"
                            : "Faible"}
                        </p>
                        <p className="text-sm text-yellow-600 mt-1">Évaluation basée sur l'analyse</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'roles' && (
                <div className="grid grid-cols-1 gap-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={getCardClass('default')}>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Top 10 des rôles les plus attribués</h3>
                        {data.roleDistribution && data.roleDistribution.length > 0 && (
                          <button 
                            onClick={() => exportToCSV(data.roleDistribution.slice(0, 10), 'top10_roles.csv')}
                            className={getButtonClass('text', false, 'sm')}
                          >
                            Exporter CSV
                          </button>
                        )}
                      </div>
                      
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data.roleDistribution ? data.roleDistribution.slice(0, 10) : []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="role" angle={-45} textAnchor="end" height={80} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" name="Nombre d'utilisateurs" fill="#facc15" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div className={getCardClass('info')}>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Statistiques des rôles</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600">Nombre total de rôles:</p>
                          <p className="text-xl font-bold text-yellow-600">{data.generalStats?.uniqueRolesCount || 0}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Moyenne d'utilisateurs par rôle:</p>
                          <p className="text-xl font-bold text-yellow-600">
                            {data.generalStats && data.generalStats.uniqueRolesCount
                              ? (data.generalStats.totalRecords / data.generalStats.uniqueRolesCount).toFixed(2)
                              : 0}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Rôles à privilèges élevés:</p>
                          <p className="text-xl font-bold text-red-600">{data.highPrivilegeRoles?.length || 0}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {data.generalStats && data.highPrivilegeRoles
                              ? `(${((data.highPrivilegeRoles.length / data.generalStats.uniqueRolesCount) * 100).toFixed(1)}% du total)`
                              : ''}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Rôles peu utilisés (1 utilisateur):</p>
                          <p className="text-xl font-bold text-blue-600">
                            {data.roleDistribution
                              ? data.roleDistribution.filter(r => r.count === 1).length
                              : 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={getCardClass('default')}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Liste complète des rôles</h3>
                      {data.roleDistribution && data.roleDistribution.length > 0 && (
                        <button 
                          onClick={() => exportToCSV(data.roleDistribution, 'tous_roles.csv')}
                          className={getButtonClass('primary', false, 'sm')}
                        >
                          Exporter tous les rôles
                        </button>
                      )}
                    </div>
                    
                    <div className={getTableContainerClass()}>
                      <table className={getTableClass()}>
                        <thead className={getTableHeaderClass()}>
                          <tr>
                            <th className={getTableHeaderCellClass(true)}>
                              Nom du rôle
                            </th>
                            <th className={getTableHeaderCellClass(true)}>
                              Nombre d'utilisateurs
                            </th>
                            <th className={getTableHeaderCellClass()}>
                              Pourcentage du total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {data.roleDistribution && data.roleDistribution.map((role, index) => (
                            <tr key={index} className={getTableRowClass(index % 2 === 0, true)}>
                              <td className={getTableCellClass(data.highPrivilegeRoles && data.highPrivilegeRoles.includes(role.role))}>
                                {role.role}
                                {data.highPrivilegeRoles && data.highPrivilegeRoles.includes(role.role) && (
                                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    Privilèges élevés
                                  </span>
                                )}
                              </td>
                              <td className={getTableCellClass()}>{role.count}</td>
                              <td className={getTableCellClass()}>
                                {data.generalStats && ((role.count / data.generalStats.uniqueUsersCount) * 100).toFixed(1)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'users' && (
                <div className="grid grid-cols-1 gap-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={getCardClass('default')}>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Top 10 des utilisateurs avec le plus de rôles</h3>
                        {data.topUsers && data.topUsers.length > 0 && (
                          <button 
                            onClick={() => exportToCSV(data.topUsers, 'top_users.csv')}
                            className={getButtonClass('text', false, 'sm')}
                          >
                            Exporter CSV
                          </button>
                        )}
                      </div>
                      
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data.topUsers || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="user" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" name="Nombre de rôles" fill="#84cc16" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div className={getCardClass('info')}>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Statistiques des utilisateurs</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600">Nombre total d'utilisateurs:</p>
                          <p className="text-xl font-bold text-yellow-600">{data.generalStats?.uniqueUsersCount || 0}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Moyenne de rôles par utilisateur:</p>
                          <p className="text-xl font-bold text-yellow-600">
                            {data.generalStats && data.generalStats.uniqueUsersCount
                              ? (data.generalStats.totalRecords / data.generalStats.uniqueUsersCount).toFixed(2)
                              : 0}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Utilisateurs avec rôles à privilèges élevés:</p>
                          <p className="text-xl font-bold text-red-600">
                            {data.usersWithHighPrivilegeRoles
                              ? new Set(data.usersWithHighPrivilegeRoles.map(item => item.user)).size
                              : 0}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {data.generalStats && data.usersWithHighPrivilegeRoles
                              ? `(${((new Set(data.usersWithHighPrivilegeRoles.map(item => item.user)).size / data.generalStats.uniqueUsersCount) * 100).toFixed(1)}% du total)`
                              : ''}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Utilisateurs avec un seul rôle:</p>
                          <p className="text-xl font-bold text-blue-600">
                            {data.topUsers
                              ? data.topUsers.filter(u => u.count === 1).length
                              : 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={getCardClass('default')}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Top 20 des utilisateurs avec le plus de rôles</h3>
                    </div>
                    
                    <div className={getTableContainerClass()}>
                      <table className={getTableClass()}>
                        <thead className={getTableHeaderClass()}>
                          <tr>
                            <th className={getTableHeaderCellClass()}>Utilisateur</th>
                            <th className={getTableHeaderCellClass()}>Nombre de rôles</th>
                            <th className={getTableHeaderCellClass()}>% par rapport à la moyenne</th>
                            <th className={getTableHeaderCellClass()}>Rôles à privilèges</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {data.topUsers && data.topUsers.slice(0, 20).map((user, index) => {
                            const hasHighPrivilege = data.usersWithHighPrivilegeRoles && 
                              data.usersWithHighPrivilegeRoles.some(item => item.user === user.user);
                            
                            const avgRolesPerUser = data.generalStats
                              ? (data.generalStats.totalRecords / data.generalStats.uniqueUsersCount)
                              : 0;
                              
                            const percentOfAvg = avgRolesPerUser > 0
                              ? ((user.count / avgRolesPerUser) * 100).toFixed(0)
                              : 0;
                            
                            return (
                              <tr key={index} className={getTableRowClass(index % 2 === 0, true)}>
                                <td className={getTableCellClass(hasHighPrivilege)}>
                                  {user.user}
                                  {hasHighPrivilege && (
                                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      Privilèges élevés
                                    </span>
                                  )}
                                </td>
                                <td className={getTableCellClass()}>{user.count}</td>
                                <td className={getTableCellClass()}>
                                  <span className={percentOfAvg > 150 ? "text-red-600 font-medium" : percentOfAvg > 100 ? "text-amber-600" : ""}>
                                    {percentOfAvg}%
                                  </span>
                                </td>
                                <td className={getTableCellClass()}>
                                  {hasHighPrivilege ? (
                                    <span className="text-red-600">
                                      {data.usersWithHighPrivilegeRoles
                                        .filter(item => item.user === user.user)
                                        .map(item => item.role)
                                        .join(", ")}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'security' && (
                <div className="grid grid-cols-1 gap-6 mt-6">
                  <div className={getCardClass('warning')}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-amber-900">Rôles à privilèges élevés</h3>
                      {data.highPrivilegeRoles && data.highPrivilegeRoles.length > 0 && (
                        <button 
                          onClick={() => exportToCSV(
                            data.highPrivilegeRoles.map(role => ({ role })), 
                            'high_privilege_roles.csv'
                          )}
                          className={getButtonClass('warning', false, 'sm')}
                        >
                          Exporter CSV
                        </button>
                      )}
                    </div>
                    
                    <div className="bg-amber-50 p-4 rounded-md mb-4">
                      <p className="text-amber-800">
                        <strong>Note de sécurité:</strong> Les rôles à privilèges élevés permettent aux utilisateurs d'effectuer des actions sensibles dans le système SAP.
                        L'attribution de ces rôles doit être strictement contrôlée et limitée au personnel autorisé.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Liste des rôles sensibles identifiés</h4>
                        <ul className="space-y-1 text-sm">
                          {data.highPrivilegeRoles && data.highPrivilegeRoles.map((role, index) => (
                            <li key={index} className="py-1 px-2 bg-red-50 text-red-800 rounded-md">
                              {role}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Critères d'identification</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Les rôles sont identifiés comme sensibles s'ils contiennent l'un des termes suivants:
                        </p>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          <li>ADMIN</li>
                          <li>SUPER</li>
                          <li>ROOT</li>
                          <li>MANAGER</li>
                          <li>DIRECTOR</li>
                          <li>SAP_ALL</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-900 mb-2">Utilisateurs avec des rôles à privilèges élevés</h4>
                      
                      {data.usersWithHighPrivilegeRoles && data.usersWithHighPrivilegeRoles.length > 0 && (
                        <div className="flex justify-end mb-2">
                          <button 
                            onClick={() => exportToCSV(data.usersWithHighPrivilegeRoles, 'users_high_privilege.csv')}
                            className={getButtonClass('danger', false, 'sm')}
                          >
                            Exporter CSV
                          </button>
                        </div>
                      )}
                      
                      <div className={getTableContainerClass()}>
                        <table className={getTableClass()}>
                          <thead className={getTableHeaderClass()}>
                            <tr>
                              <th className={getTableHeaderCellClass()}>
                                Utilisateur
                              </th>
                              <th className={getTableHeaderCellClass()}>
                                Rôle à privilège élevé
                              </th>
                              <th className={getTableHeaderCellClass()}>
                                Date d'attribution
                              </th>
                              <th className={getTableHeaderCellClass()}>
                                Date d'expiration
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {data.usersWithHighPrivilegeRoles && data.usersWithHighPrivilegeRoles.map((item, index) => (
                              <tr key={index} className={getTableRowClass(index % 2 === 0, true)}>
                                <td className={getTableCellClass(true)}>{item.user}</td>
                                <td className={getTableCellClass(true)}>{item.role}</td>
                                <td className={getTableCellClass()}>{item.from_date || 'N/A'}</td>
                                <td className={getTableCellClass()}>
                                  {item.to_date || (
                                    <span className="text-red-600 font-medium">Indéfinie</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  
                  <div className={getCardClass('info')}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Recommandations de sécurité</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-50 rounded-md border-l-4 border-yellow-400">
                        <h4 className="font-medium text-yellow-800 mb-1">Gérer les rôles à privilèges élevés</h4>
                        <p className="text-sm text-yellow-800">
                          Révisez régulièrement la liste des utilisateurs disposant de rôles à privilèges élevés.
                          Limitez ces attributions au strict minimum nécessaire selon le principe du moindre privilège.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-lime-50 rounded-md border-l-4 border-lime-400">
                        <h4 className="font-medium text-lime-800 mb-1">Établir des périodes d'expiration</h4>
                        <p className="text-sm text-lime-800">
                          Configurez des dates d'expiration pour tous les rôles sensibles. Ne laissez pas 
                          d'attributions à durée indéfinie pour les rôles critiques.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-blue-50 rounded-md border-l-4 border-blue-400">
                        <h4 className="font-medium text-blue-800 mb-1">Implémenter la séparation des tâches (SoD)</h4>
                        <p className="text-sm text-blue-800">
                          Définissez des matrices de séparation des tâches pour éviter les conflits
                          et les risques de fraude. Aucun utilisateur ne devrait avoir des droits
                          qui permettent de contrôler un processus de bout en bout.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-purple-50 rounded-md border-l-4 border-purple-400">
                        <h4 className="font-medium text-purple-800 mb-1">Mettre en place des revues périodiques</h4>
                        <p className="text-sm text-purple-800">
                          Établissez un calendrier de revue des accès pour vérifier régulièrement
                          que les attributions de rôles sont toujours appropriées et nécessaires.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
      
      <footer className="bg-gray-800 text-white p-4 text-center text-sm">
        <div className="mb-1">Outil d'analyse AGR_USERS pour l'audit SAP | {new Date().getFullYear()}</div>
        <div className="text-xs text-gray-400">
          Architecture hybride: Frontend React + Backend Python FastAPI
        </div>
      </footer>
    </div>
  );
};

const getAlertClass = (variant = 'info', isDismissible = false) => {
  const baseClasses = 'p-4 rounded-lg border-l-4 flex items-start mt-4';
  const dismissibleClasses = isDismissible ? 'pr-10 relative' : '';
  
  switch (variant) {
    case 'info':
      return `${baseClasses} ${dismissibleClasses} bg-yellow-50 border-yellow-400 text-yellow-800`;
    case 'warning':
      return `${baseClasses} ${dismissibleClasses} bg-amber-50 border-amber-400 text-amber-800`;
    case 'danger':
      return `${baseClasses} ${dismissibleClasses} bg-red-50 border-red-500 text-red-800`;
    case 'success':
      return `${baseClasses} ${dismissibleClasses} bg-lime-50 border-lime-500 text-lime-800`;
    default:
      return `${baseClasses} ${dismissibleClasses} bg-yellow-50 border-yellow-400 text-yellow-800`;
  }
};

export default AGRUsersPage;