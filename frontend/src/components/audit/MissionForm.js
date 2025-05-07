// src/components/audit/MissionForm.js
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuditContext } from '../../context/AuditContext';
import Card from '../common/Card';
import Alert from '../common/Alert';
import { getButtonClass } from '../../utils/StyleUtils';

const MissionForm = () => {
  const { missionId } = useParams();
  const navigate = useNavigate();
  const { 
    loadMissionById, 
    createMission, 
    updateMission, 
    missionLoading, 
    missionError
  } = useContext(AuditContext);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    client: '',
    clientContact: '',
    startDate: '',
    endDate: '',
    scope: '',
    objectives: '',
    status: 'PLANNED'
  });

  useEffect(() => {
    const fetchMission = async () => {
      if (missionId && missionId !== 'new') {
        const mission = await loadMissionById(missionId);
        if (mission) {
          // Format dates for the form inputs
          const startDate = mission.startDate ? 
            new Date(mission.startDate).toISOString().split('T')[0] : '';
          const endDate = mission.endDate ? 
            new Date(mission.endDate).toISOString().split('T')[0] : '';
          
          setFormData({
            title: mission.title || '',
            description: mission.description || '',
            client: mission.client || '',
            clientContact: mission.clientContact || '',
            startDate,
            endDate,
            scope: mission.scope || '',
            objectives: mission.objectives || '',
            status: mission.status || 'PLANNED'
          });
        }
      }
    };
    
    fetchMission();
  }, [missionId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (missionId && missionId !== 'new') {
        await updateMission(missionId, formData);
      } else {
        await createMission(formData);
      }
      
      navigate('/audit/missions');
    } catch (error) {
      console.error('Error saving mission:', error);
    }
  };

  const isEditMode = missionId && missionId !== 'new';
  
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        {isEditMode ? 'Edit Mission' : 'Create New Mission'}
      </h2>
      
      {missionError && <Alert type="error" message={missionError} className="mb-6" />}
      
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mission Title*
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Name*
              </label>
              <input
                type="text"
                name="client"
                value={formData.client}
                onChange={handleInputChange}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Contact
              </label>
              <input
                type="text"
                name="clientContact"
                value={formData.clientContact}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date*
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date*
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
              >
                <option value="PLANNED">Planned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </Card>
        
        <Card className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Mission Details</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description*
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scope
              </label>
              <textarea
                name="scope"
                value={formData.scope}
                onChange={handleInputChange}
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Objectives
              </label>
              <textarea
                name="objectives"
                value={formData.objectives}
                onChange={handleInputChange}
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
              />
            </div>
          </div>
        </Card>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/audit/missions')}
            className={getButtonClass('outline')}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={missionLoading}
            className={getButtonClass('primary')}
          >
            {missionLoading ? 'Saving...' : (isEditMode ? 'Update Mission' : 'Create Mission')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MissionForm;