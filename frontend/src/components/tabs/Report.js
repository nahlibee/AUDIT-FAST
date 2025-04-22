import React from 'react';
import { useSAPData } from '../../context/SAPDataContext';
import { exportReportToJSON } from '../../utils/exportUtils';

const Report = () => {
  const { data } = useSAPData();

  if (!data || !data.report) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md text-center">
        <p className="text-gray-500">Veuillez générer un rapport d'audit en cliquant sur le bouton en haut à droite.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 mb-8">
      {/* Contenu de l'onglet Rapport */}
    </div>
  );
};

export default Report;
