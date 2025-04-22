import React, { createContext, useState, useContext } from 'react';
import { analyzeAGRUsers, integrateAdditionalData, filterByDateRange, generateReport } from '../services/analysisService';
import { getSodRules, addSodRule } from '../services/sodService';

// Création du contexte
const SAPDataContext = createContext();

// Hook personnalisé pour utiliser le contexte
export const useSAPData = () => useContext(SAPDataContext);

// Fournisseur du contexte
export const SAPDataProvider = ({ children }) => {
  // États pour les fichiers
  const [files, setFiles] = useState({
    agrUsers: null,
    usr02: null,
    ust12: null
  });
  
  // État pour les données analysées
  const [data, setData] = useState(null);
  
  // État pour l'ID d'analyse
  const [analysisId, setAnalysisId] = useState(null);
  
  // État pour les règles SoD
  const [sodRules, setSodRules] = useState([]);
  
  // État pour la plage de dates
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  
  // États pour le chargement et les erreurs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Gestion des fichiers
  const handleFileUpload = (file, fileType) => {
    setFiles(prevFiles => ({
      ...prevFiles,
      [fileType]: file
    }));
  };

  // Traitement des données
  const processData = async () => {
    if (!files.agrUsers) {
      setError("Veuillez sélectionner au moins un fichier d'extraction AGR_USERS");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Analyser le fichier AGR_USERS
      const result = await analyzeAGRUsers(files.agrUsers, dateRange);
      
      setData(result);
      setAnalysisId(result.analysis_id);
      
      // Si d'autres fichiers sont fournis, intégrer les données supplémentaires
      if (files.usr02 || files.ust12) {
        await integrateAdditionalData(result.analysis_id, files.usr02, files.ust12, dateRange);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrage par plage de dates
  const applyDateFilter = async () => {
    if (!data || !analysisId) {
      setError("Aucune donnée à filtrer. Veuillez d'abord analyser un fichier.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await filterByDateRange(analysisId, dateRange);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Génération de rapport
  const createReport = async () => {
    if (!analysisId) {
      setError("Aucune analyse disponible pour générer un rapport.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const report = await generateReport(analysisId);
      setData({
        ...data,
        report
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Chargement des règles SoD
  const fetchSodRules = async () => {
    try {
      const rules = await getSodRules();
      setSodRules(rules);
    } catch (err) {
      console.error("Erreur lors de la récupération des règles SoD:", err);
    }
  };

  // Ajout d'une règle SoD
  const createSodRule = async (ruleName, conflictingRoles, riskLevel) => {
    if (!ruleName || !conflictingRoles) {
      setError("Veuillez compléter tous les champs de la règle");
      return;
    }
    
    try {
      await addSodRule(ruleName, conflictingRoles, riskLevel);
      await fetchSodRules(); // Rafraîchir la liste des règles
    } catch (err) {
      setError(err.message);
    }
  };

  // Valeur du contexte
  const contextValue = {
    files,
    data,
    analysisId,
    sodRules,
    dateRange,
    loading,
    error,
    handleFileUpload,
    processData,
    setDateRange,
    applyDateFilter,
    createReport,
    fetchSodRules,
    createSodRule,
    setError
  };

  return (
    <SAPDataContext.Provider value={contextValue}>
      {children}
    </SAPDataContext.Provider>
  );
};