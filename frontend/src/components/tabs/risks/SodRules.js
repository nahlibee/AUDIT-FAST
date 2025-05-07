import React, { useState } from 'react';
import { useSAPData } from '../../../context/SapDataContext';
import DataTable from '../../common/DataTable';
import { getRiskLevelClass } from '../../../utils/StyleUtils';

const SodRules = () => {
  const { sodRules, createSodRule } = useSAPData();
  const [newRule, setNewRule] = useState({
    rule_name: '',
    conflicting_roles: '',
    risk_level: 'Élevé'
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Contenu pour la gestion des règles SoD */}
    </div>
  );
};

export default SodRules;
