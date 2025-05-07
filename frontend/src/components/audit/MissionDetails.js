// src/components/audit/MissionDetails.js
import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { AuditContext } from '../../context/AuditContext';
import { AuthContext } from '../../context/AuthContext';
import Card from '../common/Card';
import Alert from '../common/Alert';
import DataTable from '../common/DataTable';
import { getButtonClass, getBadgeClass } from '../../utils/StyleUtils';

const MissionDetails = () => {
  const { missionId } = useParams();
  const navigate = useNavigate();
  const { 
    loadMissionById, 
    currentMission, 
    missionLoading, 
    missionError,
    auditors,
    assignAuditor,
    removeAuditor,
    auditorsLoading
  } = useContext(AuditContext);
  const { userRole, userId } = useContext(AuthContext);
  
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedAuditor, setSelectedAuditor] = useState('');
  const [assignmentLoading, setAssignmentLoading] = useState(false);

  useEffect(() => {
    loadMissionById(missionId);
  }, [missionId]);

  if (missionLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="loading-spinner mr-3"></div>
        <span>Loading mission details...</span>
      </div>
    );
  }

  if (missionError) {
    return <Alert type="error" message={missionError} />;
  }

  if (!currentMission) {
    return <Alert type="error" message="Mission not found" />;
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
  
  const handleAssignAuditor = async () => {
    if (!selectedAuditor) return;
    
    setAssignmentLoading(true);
    try {
      await assignAuditor(missionId, selectedAuditor);
      setShowAssignForm(false);
      setSelectedAuditor('');
    } catch (error) {
      console.error('Error assigning auditor:', error);
    } finally {
      setAssignmentLoading(false);
    }
  };
  
  const handleRemoveAuditor = async (auditorId) => {
    if (window.confirm('Are you sure you want to remove this auditor from the mission?')) {
      try {
        await removeAuditor(missionId, auditorId);
      } catch (error) {
        console.error('Error removing auditor:', error);
      }
    }
  };
  
  // Prepare columns for the assigned auditors table
  const auditorColumns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Assigned Date', accessor: 'assignedDate',
      cellRenderer: (value) => formatDate(value)
    },
    { header: 'Actions', accessor: 'id',
      cellRenderer: (value, row) => (
        <div className="flex space-x-2">
          {(userRole === 'MANAGER' || userRole === 'ADMIN') && (
            <button
              onClick={() => handleRemoveAuditor(value)}
              className="text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          )}
        </div>
      )
    }
  ];
  
  // Filter available auditors (not already assigned)
  const availableAuditors = auditors.filter(auditor => 
    !currentMission.assignedAuditors?.some(assigned => assigned.id === auditor.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">{currentMission.name}</h2>
        
        <div className="flex space-x-3">
          {(userRole === 'MANAGER' || userRole === 'ADMIN') && (
            <Link
              to={`/audit/missions/${missionId}/edit`}
              className={getButtonClass('outline')}
            >
              Edit Mission
            </Link>
          )}
          
          <Link
            to={`/audit/missions/${missionId}/analysis`}
            className={getButtonClass('primary')}
          >
            Analysis & Reports
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Mission Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className={`mt-1 ${getStatusBadge(currentMission.status)}`}>
                  {currentMission.status?.replace('_', ' ')}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Client</p>
                <p className="mt-1 text-gray-900">{currentMission.clientName}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Start Date</p>
                <p className="mt-1 text-gray-900">{formatDate(currentMission.startDate)}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">End Date</p>
                <p className="mt-1 text-gray-900">{formatDate(currentMission.endDate)}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Client Contact</p>
                <p className="mt-1 text-gray-900">{currentMission.clientContact || 'Not specified'}</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Mission Details</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="mt-1 text-gray-900">{currentMission.description}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Scope</p>
                <p className="mt-1 text-gray-900">{currentMission.scope || 'Not specified'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Objectives</p>
                <p className="mt-1 text-gray-900">{currentMission.objectives || 'Not specified'}</p>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">Assigned Auditors</h3>
              
              {(userRole === 'MANAGER' || userRole === 'ADMIN') && (
                <button
                  onClick={() => setShowAssignForm(!showAssignForm)}
                  className={getButtonClass(showAssignForm ? 'outline' : 'primary', false, 'sm')}
                >
                  {showAssignForm ? 'Cancel' : 'Assign Auditor'}
                </button>
              )}
            </div>
            
            {showAssignForm && (
              <div className="mb-4 p-4 bg-gray-50 rounded-md">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Auditor to Assign
                </label>
                <div className="flex space-x-2">
                  <select
                    value={selectedAuditor}
                    onChange={(e) => setSelectedAuditor(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                    disabled={auditorsLoading || availableAuditors.length === 0}
                  >
                    <option value="">Select an auditor</option>
                    {availableAuditors.map(auditor => (
                      <option key={auditor.id} value={auditor.id}>
                        {auditor.name} ({auditor.email})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignAuditor}
                    disabled={!selectedAuditor || assignmentLoading}
                    className={getButtonClass('primary', !selectedAuditor || assignmentLoading, 'sm')}
                  >
                    {assignmentLoading ? 'Assigning...' : 'Assign'}
                  </button>
                </div>
                {availableAuditors.length === 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    No available auditors to assign.
                  </p>
                )}
              </div>
            )}
            
            {currentMission.assignedAuditors?.length > 0 ? (
              <DataTable
                data={currentMission.assignedAuditors}
                columns={auditorColumns}
                pageSize={5}
                isCompact={true}
              />
            ) : (
              <p className="text-gray-500 text-center py-4">
                No auditors assigned to this mission yet.
              </p>
            )}
          </Card>
          
          <Card>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Mission Progress</h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium text-gray-500">Analysis Completed</p>
                  <p className="text-sm font-medium text-gray-900">
                    {currentMission.analysisCompletedCount || 0}/{currentMission.totalAnalysisCount || 0}
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-yellow-400 h-2.5 rounded-full" 
                    style={{ 
                      width: `${currentMission.totalAnalysisCount ? 
                        (currentMission.analysisCompletedCount / currentMission.totalAnalysisCount) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium text-gray-500">Reports</p>
                  <p className="text-sm font-medium text-gray-900">
                    {currentMission.reportCompletedCount || 0}/{currentMission.totalReportCount || 0}
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-lime-500 h-2.5 rounded-full" 
                    style={{ 
                      width: `${currentMission.totalReportCount ? 
                        (currentMission.reportCompletedCount / currentMission.totalReportCount) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="pt-3">
                <Link 
                  to={`/audit/missions/${missionId}/analysis`}
                  className="text-yellow-600 hover:text-yellow-800 font-medium text-sm inline-flex items-center"
                >
                  View Analysis & Reports
                  <svg className="ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MissionDetails;