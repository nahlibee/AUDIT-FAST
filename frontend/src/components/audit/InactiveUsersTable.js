import React from 'react';
import { UserDeleteOutlined, ExclamationCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Table, Tag, Button, Tooltip, Progress } from 'antd';

/**
 * Component to display inactive users information
 */
const InactiveUsersTable = ({ inactiveUsers, onExport }) => {
  if (!inactiveUsers || !inactiveUsers.users || inactiveUsers.users.length === 0) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <UserDeleteOutlined className="h-5 w-5 text-green-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              Aucun utilisateur inactif
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <p>
                Tous les utilisateurs actifs se sont connectés récemment, ce qui est une bonne pratique de sécurité.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Define columns for inactive users
  const columns = [
    {
      title: 'Utilisateur',
      dataIndex: 'username',
      key: 'username',
      render: (text) => (
        <span className="flex items-center">
          <UserDeleteOutlined className="mr-2" />
          {text}
        </span>
      ),
    },
    {
      title: 'Dernière connexion',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (text) => {
        return text && text !== 'Never' ? (
          <span>{text}</span>
        ) : (
          <Tag color="red">Jamais connecté</Tag>
        );
      },
    },
    {
      title: 'Jours d\'inactivité',
      dataIndex: 'daysSinceLogin',
      key: 'daysSinceLogin',
      render: (days) => {
        if (days === 'Never logged in') {
          return <Tag color="red">Jamais connecté</Tag>;
        }
        
        // Calculate inactivity level
        let color = 'green';
        if (days > 180) color = 'red';
        else if (days > 90) color = 'orange';
        else if (days > 30) color = 'gold';
        
        return (
          <Tooltip 
            title={`${days} jours depuis la dernière connexion`}
            destroyTooltipOnHide={{ keepParent: false }}
          >
            <div className="flex items-center">
              <span className="mr-2">{days}</span>
              <Progress 
                percent={Math.min(days / 180 * 100, 100)} 
                size="small" 
                strokeColor={color}
                showInfo={false}
                className="w-20"
              />
            </div>
          </Tooltip>
        );
      },
      sorter: (a, b) => {
        const daysA = a.daysSinceLogin === 'Never logged in' ? Infinity : a.daysSinceLogin;
        const daysB = b.daysSinceLogin === 'Never logged in' ? Infinity : b.daysSinceLogin;
        return daysA - daysB;
      },
      defaultSortOrder: 'descend',
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (text) => {
        let color = 'gold';
        if (text === 'Critical') color = 'red';
        else if (text === 'High Risk') color = 'orange';
        
        return (
          <Tag color={color}>
            {text === 'Critical' ? 'CRITIQUE' : text === 'High Risk' ? 'RISQUE ÉLEVÉ' : 'RISQUE MOYEN'}
          </Tag>
        );
      },
      filters: [
        { text: 'Critique', value: 'Critical' },
        { text: 'Risque élevé', value: 'High Risk' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Recommandation',
      key: 'recommendation',
      render: (_, record) => {
        const isCritical = record.status === 'Critical';
        return (
          <Tag color={isCritical ? "red" : "orange"}>
            {isCritical ? 'SUPPRIMER LE COMPTE' : 'DÉSACTIVER LE COMPTE'}
          </Tag>
        );
      },
    }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationCircleOutlined className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Utilisateurs inactifs - Risque de sécurité
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>
                {inactiveUsers.count} utilisateurs n'ont pas accédé au système depuis plus de 90 jours.
                Les comptes inactifs représentent un risque de sécurité significatif.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium">Utilisateurs Inactifs ({inactiveUsers.count})</h3>
        {onExport && (
          <Button 
            type="default" 
            size="small"
            onClick={() => onExport(inactiveUsers.users, 'inactive_users.csv')}
          >
            Exporter
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <ExclamationCircleOutlined className="text-red-500 mr-2 text-xl" />
            <div>
              <div className="text-sm text-gray-500">Jamais connectés</div>
              <div className="text-xl font-bold text-red-700">
                {inactiveUsers.users.filter(u => u.lastLogin === 'Never' || !u.lastLogin).length}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-md">
          <div className="flex items-center">
            <ExclamationCircleOutlined className="text-orange-500 mr-2 text-xl" />
            <div>
              <div className="text-sm text-gray-500">Inactifs plus de 180 jours</div>
              <div className="text-xl font-bold text-orange-700">
                {inactiveUsers.users.filter(u => u.daysSinceLogin !== 'Never logged in' && u.daysSinceLogin > 180).length}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center">
            <ClockCircleOutlined className="text-yellow-500 mr-2 text-xl" />
            <div>
              <div className="text-sm text-gray-500">Inactifs 90-180 jours</div>
              <div className="text-xl font-bold text-yellow-700">
                {inactiveUsers.users.filter(u => u.daysSinceLogin !== 'Never logged in' && u.daysSinceLogin <= 180 && u.daysSinceLogin > 90).length}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center">
            <ClockCircleOutlined className="text-blue-500 mr-2 text-xl" />
            <div>
              <div className="text-sm text-gray-500">Inactifs 30-90 jours</div>
              <div className="text-xl font-bold text-blue-700">
                {inactiveUsers.users.filter(u => u.daysSinceLogin !== 'Never logged in' && u.daysSinceLogin <= 90 && u.daysSinceLogin > 30).length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Table 
        columns={columns} 
        dataSource={inactiveUsers.users.map((user, index) => ({...user, key: index}))} 
        pagination={{ pageSize: 10 }}
        size="small"
      />
    </div>
  );
};

export default InactiveUsersTable; 