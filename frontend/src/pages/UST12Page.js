import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { getButtonClass, getCardClass, getTableContainerClass, getTableClass, getTableHeaderClass, getTableHeaderCellClass, getTableRowClass, getTableCellClass } from '../utils/styleUtils';

const UST12Page = () => {
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
      setError("Veuillez sélectionner un fichier d'extraction UST12");
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
      
      const response = await fetch(`${API_URL}/analyze/ust12`, {
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
      
      const response = await fetch(`${API_URL}/filter/ust12/${analysisId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dateRangeData)
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-gray-800 text-white p-4 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Analyseur UST12</h1>
            <p className="text-sm">Outil d'audit avancé pour l'analyse des données UST12</p>
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
                Extraction UST12 (table des objets d'autorisation)
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
              <p className="mt-1 text-xs text-gray-500">Fichier contenant les objets d'autorisation (UST12)</p>
            </div>
            
            <div className="flex-grow">
              <h3 className="block text-sm font-medium text-gray-700 mb-3">Filtrer par dates</h3>
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
            <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 rounded-md">
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
                    className={`${
                      activeTab === 'overview'
                        ? 'border-yellow-500 text-yellow-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Vue d'ensemble
                  </button>
                  <button
                    onClick={() => setActiveTab('activity')}
                    className={`${
                      activeTab === 'activity'
                        ? 'border-yellow-500 text-yellow-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Activité des utilisateurs
                  </button>
                  <button
                    onClick={() => setActiveTab('inactive')}
                    className={`${
                      activeTab === 'inactive'
                        ? 'border-yellow-500 text-yellow-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Utilisateurs inactifs
                  </button>
                </nav>
              </div>
              
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 gap-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={getCardClass('info')}>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Total des enregistrements</h3>
                      <p className="text-3xl font-bold text-yellow-600">{data.generalStats.totalRecords}</p>
                      <p className="text-sm text-gray-600 mt-1">Lignes dans l'extraction UST12</p>
                    </div>
                    
                    <div className={getCardClass('info')}>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Utilisateurs uniques</h3>
                      <p className="text-3xl font-bold text-yellow-600">{data.generalStats.uniqueUsersCount}</p>
                      <p className="text-sm text-gray-600 mt-1">Nombre d'utilisateurs distincts</p>
                    </div>
                    
                    <div className={getCardClass('info')}>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Dernière mise à jour</h3>
                      <p className="text-3xl font-bold text-yellow-600">{data.generalStats.lastUpdated}</p>
                      <p className="text-sm text-gray-600 mt-1">Date de la dernière analyse</p>
                    </div>
                  </div>

                  {/* Activity Distribution */}
                  {data.inactivityDistribution && (
                    <div className={getCardClass('default')}>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Distribution de l'inactivité</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { name: 'Jamais connectés', value: data.inactivityDistribution.never_logged },
                            { name: 'Critique (>180 jours)', value: data.inactivityDistribution.critical },
                            { name: 'Risque élevé (90-180 jours)', value: data.inactivityDistribution.high_risk },
                            { name: 'Risque moyen (30-90 jours)', value: data.inactivityDistribution.medium_risk }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#f59e0b" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="grid grid-cols-1 gap-6 mt-6">
                  {/* Timeline Chart */}
                  {data.timelineData && data.timelineData.length > 0 && (
                    <div className={getCardClass('default')}>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Activité des utilisateurs</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={data.timelineData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Area type="monotone" dataKey="count" stroke="#f59e0b" fill="#fef3c7" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Activity Metrics */}
                  {data.activityMetrics && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className={getCardClass('info')}>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Utilisateurs actifs</h3>
                        <p className="text-3xl font-bold text-green-600">{data.activityMetrics.active_users}</p>
                        <p className="text-sm text-gray-600 mt-1">Utilisateurs ayant une activité récente</p>
                      </div>
                      
                      <div className={getCardClass('info')}>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Utilisateurs inactifs</h3>
                        <p className="text-3xl font-bold text-red-600">{data.activityMetrics.inactive_users}</p>
                        <p className="text-sm text-gray-600 mt-1">Utilisateurs sans activité récente</p>
                      </div>
                      
                      <div className={getCardClass('info')}>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Taux d'inactivité</h3>
                        <p className="text-3xl font-bold text-amber-600">{data.activityMetrics.inactive_percentage}%</p>
                        <p className="text-sm text-gray-600 mt-1">Pourcentage d'utilisateurs inactifs</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'inactive' && (
                <div className="grid grid-cols-1 gap-6 mt-6">
                  {/* Inactive Users Table */}
                  {data.inactiveUsers && data.inactiveUsers.length > 0 && (
                    <div className={getCardClass('default')}>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Utilisateurs inactifs</h3>
                      <div className={getTableContainerClass()}>
                        <table className={getTableClass()}>
                          <thead className={getTableHeaderClass()}>
                            <tr>
                              <th className={getTableHeaderCellClass()}>Utilisateur</th>
                              <th className={getTableHeaderCellClass()}>Dernière connexion</th>
                              <th className={getTableHeaderCellClass()}>Jours d'inactivité</th>
                              <th className={getTableHeaderCellClass()}>Statut</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.inactiveUsers.map((user, index) => (
                              <tr key={index} className={getTableRowClass()}>
                                <td className={getTableCellClass()}>{user.user}</td>
                                <td className={getTableCellClass()}>{user.last_login || 'Jamais'}</td>
                                <td className={getTableCellClass()}>
                                  {user.days_since_login === Infinity ? 'Jamais' : user.days_since_login}
                                </td>
                                <td className={getTableCellClass()}>
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    user.status === 'Critical' ? 'bg-red-100 text-red-800' :
                                    user.status === 'High Risk' ? 'bg-orange-100 text-orange-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {user.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>
      
      <footer className="bg-gray-800 text-white p-4 text-center text-sm">
        <div className="mb-1">Outil d'analyse UST12 pour l'audit SAP | {new Date().getFullYear()}</div>
        <div className="text-xs text-gray-400">
          Architecture hybride: Frontend React + Backend Python FastAPI
        </div>
      </footer>
    </div>
  );
};

export default UST12Page;