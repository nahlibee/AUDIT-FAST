import React from 'react';
import { LockOutlined, WarningOutlined, UserOutlined } from '@ant-design/icons';
import { Table, Tag, Button, Tooltip } from 'antd';

/**
 * Component to display privileged access information
 */
const PrivilegedAccessTable = ({ privilegedAccess, onExport }) => {
  if (!privilegedAccess) return null;

  const { highPrivilegeRoles, usersWithHighPrivilege, sharedHighPrivilegeAccounts } = privilegedAccess;

  // Define columns for users with privileged access
  const userColumns = [
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
      title: 'Rôle Critique',
      dataIndex: 'role',
      key: 'role',
      render: (text) => (
        <Tag color="red">
          <LockOutlined className="mr-1" />
          {text}
        </Tag>
      ),
    },
    {
      title: 'Attribué le',
      dataIndex: 'fromDate',
      key: 'fromDate',
      render: (text) => text || 'Non spécifié',
    },
    {
      title: 'Expire le',
      dataIndex: 'toDate',
      key: 'toDate',
      render: (text) => text || 'Jamais',
    },
    {
      title: 'Risque',
      key: 'risk',
      render: (_, record) => {
        // Higher risk if role never expires
        const isHighRisk = !record.toDate;
        return (
          <Tag color={isHighRisk ? "red" : "orange"}>
            {isHighRisk ? 'CRITIQUE' : 'ÉLEVÉ'}
          </Tag>
        );
      }
    }
  ];

  // Define columns for shared privileged accounts
  const sharedAccountColumns = [
    {
      title: 'Rôle Critique',
      dataIndex: 'role',
      key: 'role',
      render: (text) => (
        <Tag color="red">
          <LockOutlined className="mr-1" />
          {text}
        </Tag>
      ),
    },
    {
      title: 'Nombre d\'utilisateurs',
      dataIndex: 'userCount',
      key: 'userCount',
      render: (text) => (
        <Tag color="red">{text} utilisateurs</Tag>
      ),
    },
    {
      title: 'Utilisateurs',
      dataIndex: 'users',
      key: 'users',
      render: (users) => (
        <div className="flex flex-wrap gap-1">
          {users.map((user, index) => (
            <Tag key={index} color="blue">
              <UserOutlined className="mr-1" />
              {user}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Risque',
      key: 'risk',
      render: (_, record) => (
        <Tag color="red">
          <WarningOutlined className="mr-1" />
          CRITIQUE
        </Tag>
      ),
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <WarningOutlined className="h-5 w-5 text-amber-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800">
              Attention: Risque de sécurité élevé
            </h3>
            <div className="mt-2 text-sm text-amber-700">
              <p>
                {highPrivilegeRoles.length} rôles à privilèges élevés ont été détectés.
                Ces rôles accordent des accès sensibles au système SAP et doivent être attribués avec précaution.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* High privilege roles section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium">Rôles à privilèges élevés</h3>
          {onExport && (
            <Button 
              type="default" 
              size="small"
              onClick={() => onExport(highPrivilegeRoles, 'high_privilege_roles.csv')}
            >
              Exporter
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
          {highPrivilegeRoles.map((role, index) => (
            <Tooltip 
              key={index} 
              title="Rôle critique avec accès système élevé"
              destroyTooltipOnHide={{ keepParent: false }}
            >
              <div>
                <Tag color="red" className="py-1">
                  <LockOutlined className="mr-1" />
                  {role}
                </Tag>
              </div>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Users with privileged access */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium">Utilisateurs avec privilèges élevés ({usersWithHighPrivilege.length})</h3>
          {onExport && (
            <Button 
              type="default" 
              size="small"
              onClick={() => onExport(usersWithHighPrivilege, 'users_with_high_privilege.csv')}
            >
              Exporter
            </Button>
          )}
        </div>
        <Table 
          columns={userColumns} 
          dataSource={usersWithHighPrivilege.map((user, index) => ({...user, key: index}))} 
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </div>

      {/* Shared high privilege accounts */}
      {sharedHighPrivilegeAccounts && sharedHighPrivilegeAccounts.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Comptes privilégiés partagés ({sharedHighPrivilegeAccounts.length})</h3>
            {onExport && (
              <Button 
                type="default" 
                size="small"
                onClick={() => onExport(sharedHighPrivilegeAccounts, 'shared_high_privilege_accounts.csv')}
              >
                Exporter
              </Button>
            )}
          </div>
          <Table 
            columns={sharedAccountColumns} 
            dataSource={sharedHighPrivilegeAccounts.map((account, index) => ({...account, key: index}))} 
            pagination={{ pageSize: 5 }}
            size="small"
          />
        </div>
      )}
    </div>
  );
};

export default PrivilegedAccessTable; 