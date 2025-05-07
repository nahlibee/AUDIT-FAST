import React, { useState, useEffect } from 'react';
import { Table, Button, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { auditApi } from '../utils/AxiosConfig';
import { getButtonClass } from '../utils/StyleUtils';

const MissionManagementPage = () => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      setLoading(true);
      const response = await auditApi.get('/missions');
      setMissions(response.data);
    } catch (error) {
      message.error('Failed to fetch missions');
      console.error('Error fetching missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await auditApi.delete(`/missions/${id}`);
      message.success('Mission deleted successfully');
      fetchMissions();
    } catch (error) {
      message.error('Failed to delete mission');
      console.error('Error deleting mission:', error);
    }
  };

  const columns = [
    {
      title: 'Mission Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="space-x-2">
          <Link
            to={`/audit/missions/${record.id}/edit`}
            className="text-blue-600 hover:text-blue-800"
          >
            <EditOutlined /> Edit
          </Link>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mission Management</h1>
        <Link
          to="/audit/missions/new"
          className={getButtonClass('primary')}
        >
          <PlusOutlined /> Add Mission
        </Link>
      </div>

      <Table
        columns={columns}
        dataSource={missions}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default MissionManagementPage; 