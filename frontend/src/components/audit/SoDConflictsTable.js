import React from 'react';
import { DisconnectOutlined, WarningOutlined, UserOutlined } from '@ant-design/icons';
import { Table, Tag, Button, Tooltip, Alert } from 'antd';

/**
 * Component to display Segregation of Duties conflicts
 */
const SoDConflictsTable = ({ conflictsData, onExport }) => {
  if (!conflictsData || !conflictsData.conflicts || conflictsData.conflicts.length === 0) {
    return (
      <Alert
        message="Aucun conflit de séparation des tâches détecté"
        description="Aucun utilisateur ne possède des combinaisons de rôles conflictuelles qui pourraient poser un risque de séparation des tâches."
        type="success"
        showIcon
      />
    );
  }

  const { conflicts, count } = conflictsData;

  // Define columns for SoD conflicts
  const columns = [
    {
      title: 'Utilisateur',
      dataIndex: 'username',
      key: 'username',
      render: (text) => (
        <span className="flex items-center">
          <UserOutlined className="mr-2" />
          {text}
        </span>
      ),
    },
    {
      title: 'Type de Conflit',
      dataIndex: 'conflictType',
      key: 'conflictType',
      render: (text) => (
        <Tag color="orange">
          <DisconnectOutlined className="mr-1" />
          {formatConflictType(text)}
        </Tag>
      ),
    },
    {
      title: 'Premier Ensemble de Rôles',
      dataIndex: 'roleSet1',
      key: 'roleSet1',
      render: (roles) => (
        <div className="flex flex-wrap gap-1">
          {roles.map((role, index) => (
            <Tag key={index} color="blue">
              {role}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Second Ensemble de Rôles',
      dataIndex: 'roleSet2',
      key: 'roleSet2',
      render: (roles) => (
        <div className="flex flex-wrap gap-1">
          {roles.map((role, index) => (
            <Tag key={index} color="purple">
              {role}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Risque',
      key: 'risk',
      render: (_, record) => {
        // Finance conflicts are typically higher risk
        const isHighRisk = record.conflictType.includes('finance');
        return (
          <Tag color={isHighRisk ? "red" : "orange"}>
            <WarningOutlined className="mr-1" />
            {isHighRisk ? 'ÉLEVÉ' : 'MOYEN'}
          </Tag>
        );
      }
    }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <WarningOutlined className="h-5 w-5 text-orange-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-orange-800">
              Risques de Séparation des Tâches Détectés
            </h3>
            <div className="mt-2 text-sm text-orange-700">
              <p>
                {count} conflits de séparation des tâches ont été détectés. Ces conflits peuvent poser des risques
                de fraude, d'erreurs, ou d'autres problèmes de contrôle interne.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium">Conflits de Séparation des Tâches ({count})</h3>
        {onExport && (
          <Button 
            type="default" 
            size="small"
            onClick={() => onExport(conflicts, 'sod_conflicts.csv')}
          >
            Exporter
          </Button>
        )}
      </div>

      <Table 
        columns={columns} 
        dataSource={conflicts.map((conflict, index) => ({...conflict, key: index}))} 
        pagination={{ pageSize: 5 }}
        size="small"
        expandable={{
          expandedRowRender: (record) => (
            <div className="p-4 bg-gray-50">
              <h4 className="text-sm font-medium mb-2">Détails du conflit de séparation des tâches:</h4>
              <div className="text-sm text-gray-700">
                <p><strong>Description:</strong> {getConflictDescription(record.conflictType)}</p>
                <p><strong>Impact:</strong> {getConflictImpact(record.conflictType)}</p>
                <p><strong>Recommandation:</strong> Séparer les autorisations en assignant les rôles conflictuels à des utilisateurs différents.</p>
              </div>
            </div>
          ),
        }}
      />
    </div>
  );
};

// Helper function to format conflict type
const formatConflictType = (conflictType) => {
  switch (conflictType) {
    case 'finance_payment':
      return 'Finance & Paiements';
    case 'purchase_payment':
      return 'Achats & Paiements';
    case 'system_admin_finance':
      return 'Admin Système & Finance';
    default:
      return conflictType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
};

// Helper function to get conflict description
const getConflictDescription = (conflictType) => {
  switch (conflictType) {
    case 'finance_payment':
      return 'L\'utilisateur possède à la fois des droits de création d\'écritures financières et d\'approbation des paiements.';
    case 'purchase_payment':
      return 'L\'utilisateur peut à la fois créer des commandes d\'achat et approuver des paiements pour ces commandes.';
    case 'system_admin_finance':
      return 'L\'utilisateur possède à la fois des droits d\'administration système et de gestion financière.';
    default:
      return 'Combinaison de rôles incompatible du point de vue de la séparation des tâches.';
  }
};

// Helper function to get conflict impact
const getConflictImpact = (conflictType) => {
  switch (conflictType) {
    case 'finance_payment':
      return 'Risque de fraude financière, possibilité de créer des transactions fictives et d\'effectuer des paiements sans contrôle.';
    case 'purchase_payment':
      return 'Risque de fraude dans le processus d\'achat, possibilité de créer des fournisseurs fictifs et d\'effectuer des paiements frauduleux.';
    case 'system_admin_finance':
      return 'Risque de contournement des contrôles financiers grâce aux privilèges d\'administration système.';
    default:
      return 'Risque de contournement des contrôles et de fraude interne.';
  }
};

export default SoDConflictsTable; 