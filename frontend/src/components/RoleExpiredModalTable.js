import React from 'react';
import { Table, Tag } from 'antd';

/**
 * Component to display a table of expired roles in a modal
 */
const RoleExpiredModalTable = ({ data }) => {
  // Define table columns
  const columns = [
    {
      title: 'Utilisateur',
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => a.username.localeCompare(b.username),
      render: (text) => <span className="font-medium">{text}</span>,
      width: '20%',
    },
    {
      title: 'Role',
      dataIndex: 'role_name',
      key: 'role_name',
      sorter: (a, b) => a.role_name.localeCompare(b.role_name),
      render: (text) => (
        <div className="max-w-md truncate">
          <Tag color="red">{text}</Tag>
        </div>
      ),
      width: '30%',
    },
    {
      title: 'Date de début',
      dataIndex: 'from_date',
      key: 'from_date',
      sorter: (a, b) => {
        // Handle sorting for various date formats or N/A values
        if (a.from_date === 'N/A' || a.from_date === 'Not available') return 1;
        if (b.from_date === 'N/A' || b.from_date === 'Not available') return -1;
        return a.from_date.localeCompare(b.from_date);
      },
      width: '25%',
    },
    {
      title: 'Date d\'expiration',
      dataIndex: 'to_date',
      key: 'to_date',
      render: (text) => <span className="text-red-500 font-medium">{text}</span>,
      sorter: (a, b) => {
        // Handle sorting for various date formats or N/A values
        if (a.to_date === 'N/A' || a.to_date === 'Not available') return 1;
        if (b.to_date === 'N/A' || b.to_date === 'Not available') return -1;
        return a.to_date.localeCompare(b.to_date);
      },
      width: '25%',
    },
  ];

  // Add key property to each row if not present
  const tableData = data.map((item, index) => ({
    key: item.key || `${item.username}-${item.role_name}-${index}`,
    ...item,
  }));

  return (
    <div className="overflow-x-auto">
      <Table 
        columns={columns} 
        dataSource={tableData}
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        className="w-full"
        scroll={{ x: 800 }}
        bordered
        size="middle"
        locale={{ 
          emptyText: 'Aucun rôle expiré trouvé',
          filterConfirm: 'OK',
          filterReset: 'Réinitialiser',
        }}
      />
    </div>
  );
};

export default RoleExpiredModalTable; 