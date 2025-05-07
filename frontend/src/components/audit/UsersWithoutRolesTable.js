import React from 'react';
import { UserOutlined, InfoCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Table, Tag, Button, Tooltip } from 'antd';

/**
 * Component to display users without any role assignments
 */
const UsersWithoutRolesTable = ({ usersWithoutRoles, onExport }) => {
  if (!usersWithoutRoles || !usersWithoutRoles.users || usersWithoutRoles.users.length === 0) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <UserOutlined className="h-5 w-5 text-green-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              Tous les utilisateurs ont des rôles
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <p>
                Tous les utilisateurs ont au moins un rôle assigné.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Create a modified data array with additional info for display
  const dataSource = usersWithoutRoles.users.map((username, index) => ({
    key: index,
    username,
    status: "Inactif",
    risk: "Faible",
    recommendation: "Vérifier et supprimer si non nécessaire"
  }));

  // Define columns for users without roles
  const columns = [
    {
      title: 'Utilisateur',
      dataIndex: 'username',
      key: 'username',
      render: (text) => (
        <div className="flex items-center">
          <UserOutlined className="mr-2 text-gray-500" />
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (text) => (
        <Tag color="default">
          {text.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Problème',
      key: 'issue',
      render: () => (
        <span className="text-gray-700">
          Utilisateur sans aucun rôle assigné
        </span>
      ),
    },
    {
      title: 'Risque',
      dataIndex: 'risk',
      key: 'risk',
      render: (text) => (
        <Tag color="blue">
          <InfoCircleOutlined className="mr-1" />
          {text.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Recommandation',
      dataIndex: 'recommendation',
      key: 'recommendation',
      render: (text) => (
        <Tooltip title="Ces utilisateurs devraient soit recevoir des rôles appropriés, soit être supprimés du système.">
          <Tag color="blue">
            <QuestionCircleOutlined className="mr-1" />
            {text}
          </Tag>
        </Tooltip>
      ),
    }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <InfoCircleOutlined className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Utilisateurs sans rôles
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                {usersWithoutRoles.count} utilisateurs n'ont aucun rôle assigné.
                Ces utilisateurs n'ont pas accès au système et peuvent être des comptes inutiles.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium">Utilisateurs Sans Rôles ({usersWithoutRoles.count})</h3>
        {onExport && (
          <Button 
            type="default" 
            size="small"
            onClick={() => onExport(dataSource, 'users_without_roles.csv')}
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
        <h4 className="font-medium text-gray-700 mb-2">Interprétation:</h4>
        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
          <li>Les utilisateurs sans rôles ne peuvent pas accéder au système</li>
          <li>Ces comptes peuvent être des utilisateurs en attente de provisionnement</li>
          <li>Ils peuvent également être des comptes abandonnés qui n'ont jamais été supprimés</li>
          <li>Vérifiez ces comptes et soit assignez-leur des rôles appropriés, soit supprimez-les</li>
        </ul>
      </div>
    </div>
  );
};

export default UsersWithoutRolesTable; 