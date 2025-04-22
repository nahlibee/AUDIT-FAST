// src/services/ust12Service.js

import { API_URL, handleAPIResponse } from '../config/api';

/**
 * Structure de la table UST12 de SAP
 * MANDT: Client
 * OBJCT: Object
 * AUTH: SQL Authority Flags (Obsolete)
 * AKTPS: Active or maintenance version
 * FIELD: Field Name
 * VON: Authorization value
 * BIS: Valid-To Date
 */

/**
 * Analyse les données de la table UST12 pour déterminer la dernière connexion des utilisateurs
 * @param {Array} ust12Data - Données brutes de la table UST12
 * @returns {Object} - Objet avec les informations de dernière connexion par utilisateur
 */
export const analyzeUserActivity = (ust12Data) => {
  if (!ust12Data || !Array.isArray(ust12Data) || ust12Data.length === 0) {
    return {};
  }

  const userActivity = {};
  const now = new Date();

  // Filtrer les enregistrements pertinents pour l'activité utilisateur
  // Nous nous intéressons généralement aux objets de type S_USER
  const activityRecords = ust12Data.filter(record => 
    record.OBJCT === 'S_USER' || record.FIELD === 'LOGON_DATA'
  );

  // Traiter les enregistrements pour extraire les dates de dernière connexion
  activityRecords.forEach(record => {
    const username = record.VON; // Supposé contenir le nom d'utilisateur
    const loginDate = parseLoginDate(record.BIS); // Supposé contenir la date de connexion
    
    if (username && loginDate) {
      // Calculer le nombre de jours depuis la dernière connexion
      const daysSinceLogin = Math.floor((now - loginDate) / (1000 * 60 * 60 * 24));
      
      // Ne garder que l'activité la plus récente pour chaque utilisateur
      if (!userActivity[username] || userActivity[username].lastLogin < loginDate) {
        userActivity[username] = {
          lastLogin: loginDate,
          daysSinceLogin: daysSinceLogin,
          formattedLastLogin: loginDate.toISOString().split('T')[0]
        };
      }
    }
  });

  return userActivity;
};

/**
 * Identifie les utilisateurs inactifs (sans connexion depuis X jours)
 * @param {Object} userActivity - Résultat de analyzeUserActivity
 * @param {number} thresholdDays - Seuil de jours pour considérer un utilisateur comme inactif
 * @returns {Array} - Liste des utilisateurs inactifs avec leurs informations
 */
export const identifyInactiveUsers = (userActivity, thresholdDays = 90) => {
  if (!userActivity || typeof userActivity !== 'object') {
    return [];
  }

  const inactiveUsers = [];
  
  Object.entries(userActivity).forEach(([username, activity]) => {
    if (activity.daysSinceLogin >= thresholdDays) {
      inactiveUsers.push({
        user: username,
        last_login: activity.formattedLastLogin,
        days_since_login: activity.daysSinceLogin,
        status: 'Inactif'
      });
    }
  });

  return inactiveUsers.sort((a, b) => b.days_since_login - a.days_since_login);
};

/**
 * Parse une date de connexion dans différents formats possibles
 * @param {string} dateString - Chaîne de date à analyser
 * @returns {Date|null} - Objet Date ou null si invalide
 */
const parseLoginDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    // Essayer différents formats de date courants dans SAP
    // Format YYYYMMDD
    if (/^\d{8}$/.test(dateString)) {
      const year = parseInt(dateString.substring(0, 4));
      const month = parseInt(dateString.substring(4, 6)) - 1; // Les mois en JS sont 0-indexés
      const day = parseInt(dateString.substring(6, 8));
      return new Date(year, month, day);
    }
    
    // Format ISO ou similaire
    const parsedDate = new Date(dateString);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors du parsing de la date de connexion:', error);
    return null;
  }
};

/**
 * Enrichit les données utilisateur avec les informations d'activité
 * @param {Array} userData - Données utilisateur (ex: de AGR_USERS ou USR02)
 * @param {Object} userActivity - Résultat de analyzeUserActivity
 * @returns {Array} - Données utilisateur enrichies avec l'activité
 */
export const enrichUserDataWithActivity = (userData, userActivity) => {
  if (!userData || !Array.isArray(userData) || !userActivity) {
    return userData;
  }
  
  return userData.map(user => {
    const username = user.UNAME || user.BNAME || user.user;
    const activity = userActivity[username];
    
    if (activity) {
      return {
        ...user,
        last_login: activity.formattedLastLogin,
        days_since_login: activity.daysSinceLogin
      };
    }
    
    return user;
  });
};

/**
 * Récupère et analyse les données UST12 depuis l'API
 * @param {string} analysisId - ID de l'analyse en cours
 * @returns {Promise<Object>} - Résultat de l'analyse
 */
export const fetchAndAnalyzeUST12 = async (analysisId) => {
  try {
    const response = await fetch(`${API_URL}/ust12-data/${analysisId}`);
    const data = await handleAPIResponse(response);
    
    const userActivity = analyzeUserActivity(data);
    const inactiveUsers = identifyInactiveUsers(userActivity);
    
    return {
      userActivity,
      inactiveUsers
    };
  } catch (error) {
    console.error("Erreur lors de l'analyse UST12:", error);
    return {
      userActivity: {},
      inactiveUsers: []
    };
  }
};