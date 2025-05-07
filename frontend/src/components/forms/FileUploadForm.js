import React, { useState, useEffect } from 'react';
import { useSAPData } from '../../context/SapDataContext';
import { getButtonClass } from '../../utils/StyleUtils';
import DateRangeForm from './DateRangeForm';

/**
 * Composant de formulaire pour l'upload des fichiers SAP
 * @param {Object} props - Propriétés du composant
 * @param {Function} props.setError - Fonction pour définir le message d'erreur
 * @returns {JSX.Element} - Élément JSX
 */
const FileUploadForm = ({ setError }) => {
  const { 
    handleFileUpload, 
    processData, 
    loading, 
    files, 
    setDateRange, 
    dateRange, 
    applyDateFilter,
    data
  } = useSAPData();

  // État local pour suivre quels fichiers ont été sélectionnés
  const [selectedFiles, setSelectedFiles] = useState({
    agrUsers: false,
    usr02: false,
    ust12: false
  });

  // Mettre à jour l'état local quand les fichiers changent
  useEffect(() => {
    setSelectedFiles({
      agrUsers: !!files.agrUsers,
      usr02: !!files.usr02,
      ust12: !!files.ust12
    });
  }, [files]);

  // Gestionnaire pour l'upload de fichier
  const onFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file, fileType);
    }
  };

  return (
    <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Import des données</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex-grow">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Extraction AGR_USERS (obligatoire)
          </label>
          <input
            type="file"
            accept=".csv,.txt,.xlsx,.xls"
            onChange={(e) => onFileChange(e, 'agrUsers')}
            className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
          />
          <p className="mt-1 text-xs text-gray-500">Rôles attribués aux utilisateurs</p>
          {selectedFiles.agrUsers && (
            <p className="mt-1 text-xs text-green-600">Fichier sélectionné ✓</p>
          )}
        </div>
        
        <div className="flex-grow">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Extraction USR02 (optionnel)
          </label>
          <input
            type="file"
            accept=".csv,.txt,.xlsx,.xls"
            onChange={(e) => onFileChange(e, 'usr02')}
            className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
          />
          <p className="mt-1 text-xs text-gray-500">Informations de base des utilisateurs</p>
          {selectedFiles.usr02 && (
            <p className="mt-1 text-xs text-green-600">Fichier sélectionné ✓</p>
          )}
        </div>
        
        <div className="flex-grow">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Extraction UST12 (optionnel)
          </label>
          <input
            type="file"
            accept=".csv,.txt,.xlsx,.xls"
            onChange={(e) => onFileChange(e, 'ust12')}
            className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
          />
          <p className="mt-1 text-xs text-gray-500">Dates de dernière connexion</p>
          {selectedFiles.ust12 && (
            <p className="mt-1 text-xs text-green-600">Fichier sélectionné ✓</p>
          )}
        </div>
      </div>
      
      <DateRangeForm 
        dateRange={dateRange} 
        setDateRange={setDateRange} 
        onApplyFilter={data ? applyDateFilter : processData}
        buttonText={data ? "Appliquer les filtres" : "Analyser les données"}
        disabled={loading || !files.agrUsers}
        loading={loading}
      />
    </div>
  );
};

export default FileUploadForm;