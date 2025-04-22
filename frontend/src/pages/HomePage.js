// src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useSAPData } from '../context/SAPDataContext';
import Card from '../components/common/Card';
import { 
  getCardClass, 
  getButtonClass, 
  getAlertClass, 
  getSectionTitleClass,
  getSectionContainerClass,
  getDividerClass
} from '../utils/styleUtils';

const HomePage = () => {
  const { data } = useSAPData();
  
  const hasAnalysis = data !== null;
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className={getCardClass('default')}>
        <h2 className={getSectionTitleClass('xl')}>Analyseur SAP pour l'audit IT</h2>
        
        <p className="text-gray-600 mb-6">
          Bienvenue dans l'outil d'analyse des données SAP pour l'audit IT. Cet outil vous permet d'analyser 
          les extractions des tables SAP pour identifier les risques liés aux accès utilisateurs.
        </p>
        
        {hasAnalysis ? (
          <div className={getAlertClass('success')}>
            <div className="flex">
              <svg className="h-6 w-6 text-lime-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-medium text-lime-800">Analyse en cours</h3>
                <p className="text-sm text-lime-700 mt-1">
                  Une analyse est actuellement en cours. Vous pouvez consulter les résultats dans les différentes sections.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className={getAlertClass('info')}>
            <div className="flex">
              <svg className="h-6 w-6 text-yellow-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-medium text-yellow-800">Commencer une analyse</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Pour commencer, importez les données des tables SAP que vous souhaitez analyser.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Link to="/agr-users" className="block hover:no-underline">
            <div className={getCardClass('default', true)}>
              <div className="flex items-center mb-4">
                <div className="p-3 bg-yellow-100 rounded-full mr-4">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">AGR_USERS</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Analyse des rôles attribués aux utilisateurs SAP. Identifiez les utilisateurs avec des privilèges élevés.
              </p>
              <div className="mt-4 flex justify-end">
                <span className="text-yellow-600 text-sm font-medium">
                  Analyser les rôles →
                </span>
              </div>
            </div>
          </Link>
          
          <Link to="/usr02" className="block hover:no-underline">
            <div className={getCardClass('default', true)}>
              <div className="flex items-center mb-4">
                <div className="p-3 bg-yellow-100 rounded-full mr-4">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">USR02</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Analyse des informations de base des utilisateurs SAP. Identifiez les paramètres de sécurité des comptes.
              </p>
              <div className="mt-4 flex justify-end">
                <span className="text-yellow-600 text-sm font-medium">
                  Analyser les utilisateurs →
                </span>
              </div>
            </div>
          </Link>
          
          <Link to="/ust12" className="block hover:no-underline">
            <div className={getCardClass('default', true)}>
              <div className="flex items-center mb-4">
                <div className="p-3 bg-yellow-100 rounded-full mr-4">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">UST12</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Analyse des connexions utilisateur. Identifiez les utilisateurs inactifs et les comptes inutilisés.
              </p>
              <div className="mt-4 flex justify-end">
                <span className="text-yellow-600 text-sm font-medium">
                  Analyser les connexions →
                </span>
              </div>
            </div>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/integrated" className="block hover:no-underline">
            <div className={getCardClass('info', true)}>
              <div className="flex items-center mb-4">
                <div className="p-3 bg-yellow-100 rounded-full mr-4">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Analyse intégrée</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Analyse combinée de plusieurs tables SAP pour une vue complète des accès utilisateurs et des risques associés.
              </p>
              <div className="mt-4 flex justify-end">
                <span className="text-yellow-600 text-sm font-medium">
                  Analyse avancée →
                </span>
              </div>
            </div>
          </Link>
          
          <Link to="/report" className={`block hover:no-underline ${!hasAnalysis ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className={getCardClass('info', true)}>
              <div className="flex items-center mb-4">
                <div className="p-3 bg-yellow-100 rounded-full mr-4">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Rapport d'audit</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Génération d'un rapport d'audit complet avec toutes les observations et recommandations.
              </p>
              <div className="mt-4 flex justify-end">
                <span className="text-yellow-600 text-sm font-medium">
                  Voir le rapport →
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
      
      <div className={getDividerClass('yellow')}></div>
      
      {/* Informations supplémentaires */}
      <div className={getCardClass('default')}>
        <h3 className={getSectionTitleClass('lg')}>À propos de l'outil</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={getSectionContainerClass()}>
            <h4 className="text-lg font-medium text-gray-700 mb-2">Comment utiliser cet outil</h4>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-600">
              <li><strong>Extraire les données</strong> - Exportez les tables SAP nécessaires</li>
              <li><strong>Importer les fichiers</strong> - Chargez les fichiers dans l'outil</li>
              <li><strong>Analyser les données</strong> - Explorez les différentes analyses</li>
              <li><strong>Générer un rapport</strong> - Créez un rapport d'audit complet</li>
            </ol>
          </div>
          
          <div className={getSectionContainerClass()}>
            <h4 className="text-lg font-medium text-gray-700 mb-2">Tables SAP supportées</h4>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
              <li><strong>AGR_USERS</strong> - Attribution des rôles aux utilisateurs</li>
              <li><strong>USR02</strong> - Données de base des utilisateurs</li>
              <li><strong>UST12</strong> - Données de connexion des utilisateurs</li>
              <li><strong>AGR_1251</strong> - Autorisations associées aux rôles</li>
              <li><strong>AGR_AGRS</strong> - Rôles composites</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6">
          <Link to="/import">
            <button className={getButtonClass('primary', false, 'lg')}>
              Commencer une nouvelle analyse
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;