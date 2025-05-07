// src/components/audit/MissionList.js
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuditContext } from '../../context/AuditContext';
import { AuthContext } from '../../context/AuthContext';
import DataTable from '../common/DataTable';
import Card from '../common/Card';
import Alert from '../common/Alert';
import { getButtonClass, getBadgeClass } from '../../utils/StyleUtils';

const MissionList = () => {
  const { missions, missionLoading, missionError, loadMissions, deleteMission } = useContext(AuditContext);
  const { userRole } = useContext(AuthContext);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [missionToDelete, setMissionToDelete] = useState(null);

  useEffect(() => {
    loadMissions();
  }, []);

  const handleDelete = (missionId) => {
    setMissionToDelete(missionId);
    setShowConfirmation(true);
  };

  const confirmDelete = async () => {
    await deleteMission(missionToDelete);
    setShowConfirmation(false);
    setMissionToDelete(null);
  };

  const cancelDelete = () => {
    setShowConfirmation(false);
    setMissionToDelete(null);
  };

  const getStatusBadge = (status) => {
    switch (status.toUpperCase()) {
      case 'PLANNED':
        return getBadgeClass('info', true);
      case 'IN_PROGRESS':
        return getBadgeClass('warning', true);
      case 'COMPLETED':
        return getBadgeClass('success', true);
      case 'CANCELLED':
        return getBadgeClass('danger', true);
      default:
        return getBadgeClass('default', true);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const columns = [
    { 
      header: 'Mission Name', 
      accessor: 'name',
      cellRenderer: (value, row) => (
        <Link to={`/audit/missions/${row.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
          {value}
        </Link>
      )
    },
    { 
      header: 'Client', 
      accessor: 'clientName' 
    },
    { 
      header: 'Status', 
      accessor: 'status',
      cellRenderer: (value) => (
        <span className={getStatusBadge(value)}>
          {value.replace('_', ' ')}
        </span>
      )
    },
    { 
      header: 'Start Date', 
      accessor: 'startDate',
      cellRenderer: (value) => formatDate(value)
    },
    { 
      header: 'End Date', 
      accessor: 'endDate',
      cellRenderer: (value) => formatDate(value)
    },
    { 
      header: 'Actions', 
      accessor: 'id',
      cellRenderer: (value, row) => (
        <div className="flex space-x-2">
          <Link 
            to={`/audit/missions/${value}`}
            className="text-blue-600 hover:text-blue-800"
          >
            View
          </Link>
          
          {(userRole === 'MANAGER' || userRole === 'ADMIN') && (
            <>
              <Link 
                to={`/audit/missions/${value}/edit`}
                className="text-green-600 hover:text-green-800"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(value)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Audit Missions</h2>
        
        {(userRole === 'MANAGER' || userRole === 'ADMIN') && (
          <Link to="/audit/missions/new" className={getButtonClass('primary')}>
            Create New Mission
          </Link>
        )}
      </div>

      {missionError && <Alert type="error" message={missionError} className="mb-6" />}

      <Card>
        {missionLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="loading-spinner mr-3"></div>
            <span>Loading missions...</span>
          </div>
        ) : missions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No audit missions found.</p>
            {(userRole === 'MANAGER' || userRole === 'ADMIN') && (
              <Link to="/audit/missions/new" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
                Create your first mission
              </Link>
            )}
          </div>
        ) : (
          <DataTable
            data={missions}
            columns={columns}
            pageSize={10}
            enableSorting={true}
          />
        )}
      </Card>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this mission? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className={getButtonClass('outline')}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className={getButtonClass('danger')}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MissionList;