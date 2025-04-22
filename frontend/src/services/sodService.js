import { API_URL } from '../config/api';

/**
 * Récupère la liste des règles de séparation des tâches
 * @returns {Promise<Array>} - Liste des règles SoD
 */
export const getSodRules = async () => {
  try {
    const response = await fetch(`${API_URL}/sod-rules`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des règles SoD');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur:', error);
    return [];
  }
};

/**
 * Ajoute une nouvelle règle de séparation des tâches
 * @param {string} ruleName - Nom de la règle
 * @param {string} conflictingRoles - Rôles en conflit (chaîne séparée par des virgules)
 * @param {string} riskLevel - Niveau de risque
 * @returns {Promise<Object>} - Résultat de l'opération
 */
export const addSodRule = async (ruleName, conflictingRoles, riskLevel) => {
  // Convertir la chaîne de rôles en tableau
  const rolesArray = conflictingRoles.split(',').map(role => role.trim());
  
  const ruleData = {
    rule_name: ruleName,
    conflicting_roles: rolesArray,
    risk_level: riskLevel
  };
  
  const response = await fetch(`${API_URL}/sod-rules`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(ruleData)
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Erreur lors de l'ajout de la règle");
  }
  
  return await response.json();
};

/**
 * Analyse les violations de séparation des tâches dans les données
 * @param {Array} users - Liste des utilisateurs avec leurs rôles
 * @param {Array} sodRules - Liste des règles SoD
 * @returns {Array} - Liste des violations détectées
 */
export const analyzeSodViolations = (users, sodRules) => {
  if (!users || !sodRules || !Array.isArray(users) || !Array.isArray(sodRules)) {
    return [];
  }
  
  // Regrouper les rôles par utilisateur
  const userRoles = {};
  users.forEach(item => {
    const user = item.user || item.UNAME;
    const role = item.role || item.AGR_NAME;
    
    if (user && role) {
      if (!userRoles[user]) {
        userRoles[user] = [];
      }
      
      if (!userRoles[user].includes(role)) {
        userRoles[user].push(role);
      }
    }
  });
  
  // Détecter les violations pour chaque utilisateur
  const violations = [];
  
  Object.entries(userRoles).forEach(([user, roles]) => {
    sodRules.forEach(rule => {
      // Vérifier si l'utilisateur a des rôles conflictuels
      const conflictingRoles = rules => roles.filter(role => rule.conflicting_roles.includes(role));
      const conflicts = conflictingRoles(roles);
      
      // Si l'utilisateur a au moins 2 rôles conflictuels, c'est une violation
      if (conflicts.length >= 2) {
        violations.push({
          user,
          violation_type: rule.rule_name,
          risk_level: rule.risk_level,
          conflicting_roles: conflicts
        });
      }
    });
  });
  
  return violations;
};