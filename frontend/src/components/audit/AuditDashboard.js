// src/components/audit/AuditDashboard.js
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuditContext } from '../../context/AuditContext';
import { AuthContext } from '../../context/AuthContext';
import { fetchDashboardData } from '../../services/AuditService.js';
import Card from '../common/Card';
import Alert from '../common/Alert';
import { getButtonClass, getBadgeClass } from '../../utils/StyleUtils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#facc15', '#84cc16', '#ef4444', '#f59e0b', '#3b82f6', '#a855f7'];

const AuditDashboard = () => {
  const { userRole, userName } = useContext(AuthContext);
  const { missions, loadMissions } = useContext(AuditContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMissions();
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    
    try {
      const data = await fetchDashboardData();
      setDashboardData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PLANNED':
        return '#3b82f6'; // blue-500
      case 'IN_PROGRESS':
        return '#f59e0b'; // amber-500
      case 'COMPLETED':
        return '#84cc16'; // lime-500
      case 'CANCELLED':
        return '#ef4444'; // red-500
      default:
        return '#6b7280'; // gray-500
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="loading-spinner mr-3"></div>
        <span>Loading dashboard data...</span>
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message={error} />;
  }

  // Prepare data for charts
  const missionStatusData = [
    { name: 'Planned', value: dashboardData?.missionsByStatus?.PLANNED || 0 },
    { name: 'In Progress', value: dashboardData?.missionsByStatus?.IN_PROGRESS || 0 },
    { name: 'Completed', value: dashboardData?.missionsByStatus?.COMPLETED || 0 },
    { name: 'Cancelled', value: dashboardData?.missionsByStatus?.CANCELLED || 0 }
  ];

  const reportStatusData = [
    { name: 'Draft', value: dashboardData?.reportsByStatus?.DRAFT || 0 },
    { name: 'Under Review', value: dashboardData?.reportsByStatus?.UNDER_REVIEW || 0 },
    { name: 'Approved', value: dashboardData?.reportsByStatus?.APPROVED || 0 },
    { name: 'Published', value: dashboardData?.reportsByStatus?.PUBLISHED || 0 },
    { name: 'Rejected', value: dashboardData?.reportsByStatus?.REJECTED || 0 }
  ];

  const findingsData = dashboardData?.findingsByCategory || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Audit Dashboard</h2>
        
        <div className="flex space-x-3">
          <button
            onClick={loadDashboardData}
            className={getButtonClass('outline')}
            disabled={loading}
          >
            Refresh Data
          </button>
          
          {(userRole === 'MANAGER' || userRole === 'ADMIN') && (
            <Link
              to="/audit/missions/new"
              className={getButtonClass('primary')}
            >
              Create New Mission
            </Link>
          )}
        </div>
      </div>

      {/* Welcome Card */}
      <Card className="bg-yellow-50 border-l-4 border-yellow-400">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-800">Welcome, {userName}!</h3>
            <p className="text-gray-600 mt-1">
              {dashboardData?.userAssignedMissions 
                ? `You are currently assigned to ${dashboardData.userAssignedMissions} audit missions.`
                : 'You are not currently assigned to any audit missions.'}
            </p>
          </div>
          
          {dashboardData?.nextDeadline && (
            <div className="bg-white p-3 rounded-md border border-yellow-300">
              <p className="text-sm font-medium text-gray-700">Next Deadline</p>
              <p className="text-lg font-bold text-yellow-600">{formatDate(dashboardData.nextDeadline.date)}</p>
              <p className="text-xs text-gray-500">{dashboardData.nextDeadline.description}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Total Missions</p>
          <p className="text-2xl font-bold text-gray-800">{dashboardData?.totalMissions || 0}</p>
          <div className="mt-2 flex justify-between items-center">
            <span className="text-xs text-gray-500">
              {dashboardData?.activeMissions || 0} active
            </span>
            <Link to="/audit/missions" className="text-xs text-yellow-600 hover:text-yellow-800">
              View All
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Total Reports</p>
          <p className="text-2xl font-bold text-gray-800">{dashboardData?.totalReports || 0}</p>
          <div className="mt-2 flex justify-between items-center">
            <span className="text-xs text-gray-500">
              {dashboardData?.publishedReports || 0} published
            </span>
            <Link to="/audit/reports" className="text-xs text-yellow-600 hover:text-yellow-800">
              View All
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Total Findings</p>
          <p className="text-2xl font-bold text-gray-800">{dashboardData?.totalFindings || 0}</p>
          <div className="mt-2 flex justify-between items-center">
            <span className="text-xs text-gray-500">
              {dashboardData?.criticalFindings || 0} critical
            </span>
            <span className="text-xs text-yellow-600">
              {dashboardData?.averageFindingsPerMission?.toFixed(1) || 0} avg per mission
            </span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Mission Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={missionStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {missionStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Findings by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={findingsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Number of Findings" fill="#facc15" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Activity</h3>
        
        {dashboardData?.recentActivities && dashboardData.recentActivities.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {dashboardData.recentActivities.map((activity, index) => (
              <div key={index} className="py-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-800">{activity.description}</p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-gray-500">
                      {formatDate(activity.timestamp)}
                    </span>
                    {activity.user && (
                      <span className="text-xs text-gray-500 ml-2">
                        by {activity.user}
                      </span>
                    )}
                  </div>
                </div>
                
                {activity.type === 'MISSION_UPDATE' && (
                  <Link
                    to={`/audit/missions/${activity.entityId}`}
                    className="text-sm text-yellow-600 hover:text-yellow-800"
                  >
                    View Mission
                  </Link>
                )}
                
                {activity.type === 'REPORT_UPDATE' && (
                  <Link
                    to={`/audit/reports/${activity.entityId}`}
                    className="text-sm text-yellow-600 hover:text-yellow-800"
                  >
                    View Report
                  </Link>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No recent activity found.
          </p>
        )}
      </Card>

      {/* Current Missions */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">Your Current Missions</h3>
          
          <Link
            to="/audit/missions"
            className="text-sm text-yellow-600 hover:text-yellow-800"
          >
            View All Missions
          </Link>
        </div>
        
        {dashboardData?.userMissions && dashboardData.userMissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.userMissions.map((mission, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{mission.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{mission.clientName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        mission.status === 'PLANNED' 
                          ? 'bg-blue-100 text-blue-800' 
                          : mission.status === 'IN_PROGRESS'
                            ? 'bg-amber-100 text-amber-800'
                            : mission.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                      }`}>
                        {mission.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(mission.startDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(mission.endDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link 
                        to={`/audit/missions/${mission.id}`}
                        className="text-yellow-600 hover:text-yellow-800"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p>You are not assigned to any missions.</p>
            {userRole === 'AUDITOR' && (
              <p className="mt-2 text-sm">
                Missions will appear here once they are assigned to you.
              </p>
            )}
            {(userRole === 'MANAGER' || userRole === 'ADMIN') && (
              <Link 
                to="/audit/missions/new"
                className="mt-2 inline-block text-yellow-600 hover:text-yellow-800"
              >
                Create a new mission
              </Link>
            )}
          </div>
        )}
      </Card>
      
      {/* Pending Tasks */}
      <Card>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Pending Tasks</h3>
        
        {dashboardData?.pendingTasks && dashboardData.pendingTasks.length > 0 ? (
          <div className="space-y-3">
            {dashboardData.pendingTasks.map((task, index) => (
              <div 
                key={index}
                className="p-3 bg-gray-50 rounded-md border border-gray-200"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-800">{task.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-xs text-gray-500">
                        Due: {formatDate(task.dueDate)}
                      </span>
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                        task.priority === 'HIGH' 
                          ? 'bg-red-100 text-red-800' 
                          : task.priority === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                  
                  <Link
                    to={task.link}
                    className={getButtonClass('primary', false, 'sm')}
                  >
                    {task.actionText || 'View'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No pending tasks.
          </p>
        )}
      </Card>
    </div>
  );
};

export default AuditDashboard;