import React from 'react';
import { UserOutlined, WarningOutlined, DeleteOutlined } from '@ant-design/icons';
import { Table, Tag, Button, Empty } from 'antd';

/**
 * Component to display ghost users (users with roles but no master record)
 */
const GhostUsersTable = ({ ghostUsers, onExport }) => {
  if (!ghostUsers || !ghostUsers.users || ghostUsers.users.length === 0) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <UserOutlined className="h-5 w-5 text-green-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              Aucun utilisateur fantôme
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <p>
                Tous les utilisateurs avec des rôles assignés ont un enregistrement master valide dans la table USR02.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Create a modified data array with additional info for display
  const dataSource = ghostUsers.users.map((username, index) => ({
    key: index,
    username,
    risk: "Moyen",
    recommendation: "Supprimer les assignations de rôles"
  }));

  // Define columns for ghost users
  const columns = [
    {
      title: 'Utilisateur',
      dataIndex: 'username',
      key: 'username',
      render: (text) => (
        <div className="flex items-center">
          <UserOutlined className="mr-2 text-gray-500" />
          <span className="font-medium">{text}</span>
          <Tag className="ml-2" color="orange">Fantôme</Tag>
        </div>
      ),
    },
    {
      title: 'Problème',
      key: 'issue',
      render: () => (
        <span className="text-gray-700">
          Rôles assignés, mais aucun enregistrement utilisateur dans USR02
        </span>
      ),
    },
    {
      title: 'Risque',
      dataIndex: 'risk',
      key: 'risk',
      render: (text) => (
        <Tag color="orange">
          <WarningOutlined className="mr-1" />
          {text.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Recommandation',
      dataIndex: 'recommendation',
      key: 'recommendation',
      render: (text) => (
        <Tag color="blue">
          <DeleteOutlined className="mr-1" />
          {text}
        </Tag>
      ),
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
              Utilisateurs fantômes détectés
            </h3>
            <div className="mt-2 text-sm text-orange-700">
              <p>
                {ghostUsers.count} utilisateurs ont des rôles assignés mais aucun enregistrement dans la table utilisateur (USR02).
                Ces assignations de rôles doivent être nettoyées.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium">Utilisateurs Fantômes ({ghostUsers.count})</h3>
        {onExport && (
          <Button 
            type="default" 
            size="small"
            onClick={() => onExport(dataSource, 'ghost_users.csv')}
          >
            Exporter
          </Button>
        )}
      </div>

      <Table 
        columns={columns} 
        dataSource={dataSource} 
        pagination={{ pageSize: 10 }}
        size="small"
      />

      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
        <h4 className="font-medium text-gray-700 mb-2">Impact et recommandations:</h4>
        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
          <li>Les utilisateurs fantômes peuvent indiquer un nettoyage incomplet lors de la suppression d'utilisateurs</li>
          <li>Ces assignations de rôles doivent être supprimées pour maintenir la propreté du système</li>
          <li>Des rôles assignés à des utilisateurs inexistants peuvent présenter un risque de sécurité lors de la recréation d'utilisateurs</li>
          <li>Procédez à une vérification complète du processus de suppression d'utilisateurs</li>
        </ul>
      </div>
    </div>
  );
};

export default GhostUsersTable; 