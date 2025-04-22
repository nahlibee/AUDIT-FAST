import React from 'react';
import { useSAPData } from '../../../context/SAPDataContext';
import DataTable from '../../common/DataTable';
import { exportToCSV } from '../../../utils/exportUtils';
import { getRiskLevelClass } from '../../../utils/styleUtils';

const SodViolations = () => {
  const { data } = useSAPData();

  if (!data.sodViolations || data.sodViolations.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md text-center">
        <p className="text-gray-500">Aucune violation de séparation des tâches détectée.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Contenu pour les violations SoD */}
    </div>
  );
};

export default SodViolations;
