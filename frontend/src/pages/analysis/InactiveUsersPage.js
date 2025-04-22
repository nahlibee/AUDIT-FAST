// src/pages/analysis/InactiveUsersPage.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSAPData } from '../../context/SAPDataContext';
import DataTable from '../../components/common/DataTable';
import { getBadgeClass, getCardClass, getButtonClass, getAlertClass, getSectionTitleClass, getStatClass, getStatLabelClass } from '../../utils/styleUtils';
import { exportToCSV } from '../../utils/exportUtils';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#ef4444', '#f59e0b', '#facc15', '#84cc16'];

const InactiveUsersPage = () => {
  const { data, loading, error } = useSAPData();
  const navigate = useNavigate();

  useEffect(() => {
    // Rediriger vers la page UST12 si aucune donnée n'est disponible
    if (!data || !data.inactiveUsers) {
      navigate('/ust12', { state: { message: "Veuillez d'abord analyser les données UST12." } });
    }
  }, [data, navigate]);

  if (loading) {
    return <div className="text-center py-10">Chargement en cours...</div>;
  }

  if (error) {
    return <div className={getAlertClass('danger')}>{error}</div>;
  }

  if (!data || !data.inactiveUsers) {
    return null; // Redirection en cours
  }

  // Préparation des données pour le graphique
  const inactivityGroups = [
    { name: '+180 jours', value: 0, color: '#EF4444' },
    { name: '91-180 jours', value: 0, color: '#F59E0B' },
    { name: '31-90 jours', value: 0, color: '#FACC15' },
    { name: '0-30 jours', value: 0, color: '#84CC16' }
  ];

  data.inactiveUsers.forEach(user => {
    const days = user.days_since_login || 0;
    if (days > 180) inactivityGroups[0].value++;
    else if (days > 90) inactivityGroups[1].value++;
    else if (days > 30) inactivityGroups[2].value++;
    else inactivityGroups[3].value++;
  });

  // Définition des colonnes pour le tableau
  const columns = [
    { header: 'Utilisateur', accessor: 'user' },
    { header: 'Dernière connexion', accessor: 'last_login', defaultValue: 'Jamais' },
    { 
      header: 'Jours d\'inactivité', 
      accessor: 'days_since_login', 
      defaultValue: 'N/A',
      sortDefault: 'desc'
    },
    { 
      header: 'Niveau de risque', 
      accessor: 'days_since_login',
      cellRenderer: (value) => {
        let level, text;
        if (!value) {
          level = 'danger';
          text = 'Critique';
        } else if (value > 180) {
          level = 'danger';
          text = 'Critique';
        } else if (value > 90) {
          level = 'warning';
          text = 'Élevé';
        } else if (value > 30) {
          level = 'info';
          text = 'Moyen';
        } else {
          level = 'success';
          text = 'Faible';
        }
        
        return (
          <span className={getBadgeClass(level)}>
            {text}
          </span>
        );
      }
    },
    { header: 'Date de création', accessor: 'creation_date', defaultValue: 'N/A' }
  ];

  return (
    <div className="max-w-7xl mx-auto fade-in">
      <div className={getCardClass()}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className={getSectionTitleClass('xl')}>Utilisateurs inactifs</h2>
            <p className="text-sm text-gray-600 mt-1">
              Cette page présente les utilisateurs qui n'ont pas utilisé leur compte depuis au moins 30 jours.
            </p>
          </div>
          <button
            onClick={() => exportToCSV(data.inactiveUsers, 'utilisateurs_inactifs.csv')}
            className={getButtonClass('primary')}
          >
            Exporter en CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className={getCardClass('info', true)}>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Total utilisateurs inactifs</h3>
            <p className={getStatClass('negative')}>{data.inactiveUsers.length}</p>
            <p className={getStatLabelClass()}>Sur {data.generalStats?.uniqueUsersCount || '?'} utilisateurs</p>
          </div>
          
          <div className={getCardClass('danger', true)}>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Inactivité critique</h3>
            <p className={getStatClass('negative')}>{inactivityGroups[0].value}</p>
            <p className={getStatLabelClass()}>Plus de 180 jours</p>
          </div>
          
          <div className={getCardClass('warning', true)}>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Inactivité élevée</h3>
            <p className={getStatClass('warning')}>{inactivityGroups[1].value}</p>
            <p className={getStatLabelClass()}>Entre 91 et 180 jours</p>
          </div>
          
          <div className={getCardClass('info', true)}>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Inactivité moyenne</h3>
            <p className={getStatClass('highlight')}>{inactivityGroups[2].value}</p>
            <p className={getStatLabelClass()}>Entre 31 et 90 jours</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-1">
            <div className={getCardClass()}>
              <h3 className="text-lg font-medium text-gray-800 mb-3">Répartition des utilisateurs inactifs</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={inactivityGroups}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {inactivityGroups.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <div className={getCardClass()}>
              <h3 className="text-lg font-medium text-gray-800 mb-3">Risques et recommandations</h3>
              <div className="space-y-4">
                <div className={getAlertClass('danger')}>
                  <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-red-800">Risque - Comptes inutilisés</h4>
                    <p className="text-sm text-red-700 mt-1">
                      Les comptes inactifs représentent un risque de sécurité car ils peuvent être ciblés par 
                      des attaquants sans que l'utilisateur légitime ne s'en aperçoive.
                    </p>
                  </div>
                </div>
                
                <div className={getAlertClass('warning')}>
                  <svg className="h-5 w-5 text-amber-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-amber-800">Impact - Licence SAP</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Les comptes inactifs occupent des licences SAP qui pourraient être réattribuées, 
                      ce qui représente un coût inutile pour l'entreprise.
                    </p>
                  </div>
                </div>
                
                <div className={getAlertClass('success')}>
                  <svg className="h-5 w-5 text-lime-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-lime-800">Recommandation</h4>
                    <p className="text-sm text-lime-700 mt-1">
                      Les comptes inactifs depuis plus de 90 jours devraient être désactivés. 
                      Les comptes inactifs depuis plus de 180 jours devraient être supprimés 
                      après vérification qu'ils ne sont plus nécessaires.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-800 text-yellow-400 border-b border-gray-700">
            <h3 className="text-lg font-medium">Liste des utilisateurs inactifs</h3>
          </div>
          
          <DataTable 
            data={data.inactiveUsers} 
            columns={columns}
            pageSize={15}
            enableSorting={true}
            defaultSort={{ key: 'days_since_login', direction: 'desc' }}
          />
        </div>
      </div>
    </div>
  );
};

export default InactiveUsersPage;