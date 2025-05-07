import React, { useState, useEffect } from 'react';
import { Table, Tabs, Card, Spin, Button, Tag, Tooltip, Modal, Alert, message, Input } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  KeyOutlined, 
  WarningOutlined, 
  CalendarOutlined,
  ExclamationCircleOutlined,
  SafetyCertificateOutlined,
  FileExcelOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { getAnalysisById } from '../../services/AnalysisService';
import { 
  getTabClass, 
  getCardClass, 
  getButtonClass, 
  getBadgeClass,
  getAlertClass,
  getTableContainerClass
} from '../../utils/StyleUtils';

const DetailedUserAnalysisPage = ({ analysisId: propAnalysisId }) => {
  const { analysisId: urlAnalysisId } = useParams();
  const effectiveAnalysisId = propAnalysisId || urlAnalysisId;
  
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedConflict, setSelectedConflict] = useState(null);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [conflictModalVisible, setConflictModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        // Either load from passed ID or from localStorage for demo purposes
        if (effectiveAnalysisId) {
          console.log('Fetching analysis data for ID:', effectiveAnalysisId);
          const data = await getAnalysisById(effectiveAnalysisId);
          
          // Debug: Log the structure of the data
          console.log('Analysis data structure:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
          
          if (!data || !data.report) {
            setError('Invalid data format: missing report data');
            setDebugInfo({
              dataType: typeof data,
              hasData: !!data,
              keys: data ? Object.keys(data) : []
            });
          } else {
            setAnalysisData(data.report);
            
            // Debug: Check if user_analysis exists and has users
            if (!data.report.user_analysis) {
              setError('Missing user_analysis in report');
              setDebugInfo({
                reportKeys: Object.keys(data.report)
              });
            } else if (!data.report.user_analysis.users || 
                      !Array.isArray(data.report.user_analysis.users) ||
                      data.report.user_analysis.users.length === 0) {
              setError('No users found in analysis');
              setDebugInfo({
                userAnalysis: data.report.user_analysis,
                userCount: data.report.user_analysis.user_count,
                usersType: typeof data.report.user_analysis.users,
                isArray: Array.isArray(data.report.user_analysis.users),
                length: Array.isArray(data.report.user_analysis.users) 
                  ? data.report.user_analysis.users.length : 'N/A'
              });
            }
          }
        } else {
          console.log('No analysis ID provided, trying localStorage');
          const storedData = localStorage.getItem('lastAnalysisData');
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            setAnalysisData(parsedData.report);
            
            if (!parsedData.report.user_analysis || 
                !parsedData.report.user_analysis.users ||
                parsedData.report.user_analysis.users.length === 0) {
              setError('No users found in stored analysis data');
            }
          } else {
            console.log('No data found in localStorage');
            setError('No analysis data found in storage');
          }
        }
      } catch (error) {
        console.error('Error fetching analysis data:', error);
        setError(`Error fetching analysis: ${error.message}`);
        setDebugInfo({
          errorType: error.name,
          errorMessage: error.message,
          errorStack: error.stack
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisData();
  }, [effectiveAnalysisId]);

  // Handler for opening user details modal
  const handleUserClick = (user) => {
    setSelectedUser(user);
    setUserModalVisible(true);
  };

  // Handler for opening conflict details modal
  const handleConflictClick = (conflict) => {
    setSelectedConflict(conflict);
    setConflictModalVisible(true);
  };

  // Handler for exporting data to Excel
  const handleExportToExcel = (data, filename) => {
    if (!data || data.length === 0) {
      message.error("Aucune donnée à exporter");
      return;
    }
    
    // Create Excel header row from the first object's keys
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    // Add data rows
    data.forEach(item => {
      const row = headers.map(header => {
        const value = item[header];
        // Handle special values (objects, arrays, etc.)
        if (Array.isArray(value)) {
          return `"${value.join('; ')}"`;
        } else if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        } else {
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        }
      });
      csvContent += row.join(',') + '\n';
    });
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    message.success(`Exportation de ${data.length} enregistrements réussie`);
  };

  // Filter users based on search text
  const filterUsers = (users) => {
    if (!searchText) return users;
    
    return users.filter(user => 
      user.username.toLowerCase().includes(searchText.toLowerCase()) ||
      (user.status && user.status.toLowerCase().includes(searchText.toLowerCase()))
    );
  };

  // Fix Row Key function to use a more stable identifier without index
  const getRowKey = (record) => {
    if (record.username) {
      return record.username;
    } else if (record.role) {
      return record.role;
    } else if (record.conflictType) {
      return `${record.conflictType}-${record.username || ''}`;
    } else {
      return JSON.stringify(record);
    }
  };

  // Render User Details Modal
  const renderUserDetailsModal = () => {
    if (!selectedUser) return null;

    return (
      <Modal
        title={<span className="text-lg font-bold flex items-center"><UserOutlined className="mr-2" /> Détails utilisateur: {selectedUser.username}</span>}
        visible={userModalVisible}
        onCancel={() => setUserModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setUserModalVisible(false)} className={getButtonClass('outline')}>
            Fermer
          </Button>
        ]}
        width={900}
      >
        <div className="space-y-6">
          {/* General Information */}
          <div className={getCardClass('info')}>
            <h3 className="text-lg font-medium mb-3">Informations générales</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Nom d'utilisateur:</p>
                <p className="font-medium">{selectedUser.username}</p>
              </div>
              {selectedUser.user_type && (
                <div>
                  <p className="text-gray-600">Type d'utilisateur:</p>
                  <p className="font-medium">{selectedUser.user_type}</p>
                </div>
              )}
              <div>
                <p className="text-gray-600">Statut:</p>
                <p className="font-medium">
                  <Tag color={selectedUser.active ? 'green' : 'volcano'}>
                    {selectedUser.active ? 'Actif' : 'Inactif'}
                  </Tag>
                </p>
              </div>
              {selectedUser.creation_date && (
                <div>
                  <p className="text-gray-600">Date de création:</p>
                  <p className="font-medium">{selectedUser.creation_date}</p>
                </div>
              )}
              {selectedUser.valid_from && (
                <div>
                  <p className="text-gray-600">Valide du:</p>
                  <p className="font-medium">{selectedUser.valid_from}</p>
                </div>
              )}
              {selectedUser.valid_to && (
                <div>
                  <p className="text-gray-600">Valide jusqu'au:</p>
                  <p className="font-medium">{selectedUser.valid_to}</p>
                </div>
              )}
              <div>
                <p className="text-gray-600">Dernière connexion:</p>
                <p className="font-medium">{selectedUser.last_login_date || 'Jamais'}</p>
              </div>
              <div>
                <p className="text-gray-600">Nombre de rôles:</p>
                <p className="font-medium">{selectedUser.role_count}</p>
              </div>
              <div>
                <p className="text-gray-600">Rôles actifs/expirés:</p>
                <p className="font-medium">{selectedUser.active_roles || 0} / {selectedUser.expired_roles || 0}</p>
              </div>
            </div>
          </div>

          {/* User Roles */}
          <div className={getCardClass('warning')}>
            <h3 className="text-lg font-medium mb-3">Rôles attribués</h3>
            <Table 
              dataSource={selectedUser.roles} 
              rowKey={(record) => record.role || JSON.stringify(record)}
              pagination={false}
              size="small"
              className="w-full"
              columns={[
                {
                  title: 'Rôle',
                  dataIndex: 'role',
                  key: 'role',
                  render: (text) => <span className="font-medium">{text}</span>
                },
                {
                  title: 'Date d\'attribution',
                  dataIndex: 'from_date',
                  key: 'from_date',
                  render: (text) => text || 'N/A'
                },
                {
                  title: 'Date d\'expiration',
                  dataIndex: 'to_date',
                  key: 'to_date',
                  render: (text) => text || 'Indéfinie'
                },
                {
                  title: 'Statut',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => (
                    <Tag color={status === 'Active' ? 'green' : 'volcano'}>
                      {status}
                    </Tag>
                  )
                }
              ]}
            />
          </div>
        </div>
      </Modal>
    );
  };

  // Render SoD Conflict Details Modal
  const renderConflictDetailsModal = () => {
    if (!selectedConflict) return null;

    return (
      <Modal
        title={<span className="text-lg font-bold flex items-center"><ExclamationCircleOutlined className="mr-2 text-red-500" /> Conflit SoD: {selectedConflict.conflictType}</span>}
        visible={conflictModalVisible}
        onCancel={() => setConflictModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setConflictModalVisible(false)} className={getButtonClass('outline')}>
            Fermer
          </Button>
        ]}
        width={900}
      >
        <div className="space-y-6">
          {/* Conflict Information */}
          <div className={getCardClass('danger')}>
            <h3 className="text-lg font-medium mb-3">Informations sur le conflit</h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-600">Type de conflit:</p>
                <p className="font-medium">{selectedConflict.conflictDescription}</p>
              </div>
              <div>
                <p className="text-gray-600">Risque:</p>
                <p className="font-medium text-red-600">{selectedConflict.riskDescription}</p>
              </div>
              <div>
                <p className="text-gray-600">Utilisateur:</p>
                <p className="font-medium">{selectedConflict.username} ({selectedConflict.userTypeDesc})</p>
              </div>
            </div>
          </div>

          {/* Conflicting Roles */}
          <div className={getCardClass('warning')}>
            <h3 className="text-lg font-medium mb-3">Rôles en conflit</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Ensemble 1:</h4>
                <ul className="list-disc list-inside">
                  {selectedConflict.conflictingRolesSet1.map((role, index) => (
                    <li key={`set1-${index}`} className="text-amber-700">{role}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Ensemble 2:</h4>
                <ul className="list-disc list-inside">
                  {selectedConflict.conflictingRolesSet2.map((role, index) => (
                    <li key={`set2-${index}`} className="text-amber-700">{role}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* All User Roles */}
          <div className={getCardClass()}>
            <h3 className="text-lg font-medium mb-3">Tous les rôles de l'utilisateur</h3>
            <div className="flex flex-wrap gap-2">
              {selectedConflict.roles.map((role, index) => (
                <Tag key={`role-${index}`} color="blue">{role}</Tag>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    );
  };

  // Render Users Tab Content
  const renderUsersTab = () => {
    const userAnalysis = analysisData?.user_analysis;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className={getCardClass('info')}>
            <div className="flex items-center">
              <UserOutlined className="text-2xl mr-2" />
              <div>
                <p className="text-sm text-gray-500">Total Utilisateurs</p>
                <p className="text-xl font-bold">{userAnalysis?.users?.length || 0}</p>
              </div>
            </div>
          </Card>
          <Card className={getCardClass('warning')}>
            <div className="flex items-center">
              <CalendarOutlined className="text-2xl mr-2" />
              <div>
                <p className="text-sm text-gray-500">Utilisateurs Inactifs</p>
                <p className="text-xl font-bold">{userAnalysis?.inactive_users?.length || 0}</p>
              </div>
            </div>
          </Card>
          <Card className={getCardClass('danger')}>
            <div className="flex items-center">
              <WarningOutlined className="text-2xl mr-2" />
              <div>
                <p className="text-sm text-gray-500">Avec Rôles Sensibles</p>
                <p className="text-xl font-bold">{analysisData?.role_analysis?.critical_role_assignments?.length || 0}</p>
              </div>
            </div>
          </Card>
          <Card className={getCardClass('success')}>
            <div className="flex items-center">
              <KeyOutlined className="text-2xl mr-2" />
              <div>
                <p className="text-sm text-gray-500">Rôles Uniques</p>
                <p className="text-xl font-bold">{analysisData?.role_analysis?.unique_role_count || 0}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center w-64">
            <Input 
              placeholder="Rechercher..." 
              prefix={<SearchOutlined />} 
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="rounded-md border-gray-300"
            />
          </div>
          <Button 
            type="primary" 
            icon={<FileExcelOutlined />}
            onClick={() => handleExportToExcel(userAnalysis?.users || [], 'users.csv')}
            className={getButtonClass('success')}
          >
            Exporter
          </Button>
        </div>

          <Table
          dataSource={filterUsers(userAnalysis?.users || [])}
          rowKey={getRowKey}
          className="mt-4"
          scroll={{ x: true }}
          pagination={{ pageSize: 10 }}
            columns={[
              {
                title: 'Nom d\'utilisateur',
                dataIndex: 'username',
                key: 'username',
                sorter: (a, b) => a.username.localeCompare(b.username),
              render: (text, record) => (
                <Button type="link" onClick={() => handleUserClick(record)}>
                  {text}
                </Button>
              )
            },
            {
              title: 'Type',
              dataIndex: 'user_type',
              key: 'user_type',
              sorter: (a, b) => a.user_type.localeCompare(b.user_type),
                filters: [
                { text: 'Dialog', value: 'Dialog' },
                  { text: 'System', value: 'System' },
                  { text: 'Communication', value: 'Communication' },
                { text: 'Service', value: 'Service' }
              ],
              onFilter: (value, record) => record.user_type === value
            },
            {
              title: 'Statut',
              dataIndex: 'active',
              key: 'active',
              render: active => (
                <Tag color={active ? 'green' : 'volcano'}>
                  {active ? 'Actif' : 'Inactif'}
                </Tag>
              ),
              filters: [
                { text: 'Actif', value: true },
                { text: 'Inactif', value: false }
              ],
              onFilter: (value, record) => record.active === value
            },
            {
              title: 'Rôles',
              dataIndex: 'role_count',
              key: 'role_count',
              sorter: (a, b) => a.role_count - b.role_count
            },
            {
              title: 'Dernière Connexion',
              dataIndex: 'last_login_date',
              key: 'last_login_date',
              sorter: (a, b) => {
                if (!a.last_login_date) return 1;
                if (!b.last_login_date) return -1;
                return new Date(a.last_login_date) - new Date(b.last_login_date);
              },
              render: date => date || 'Jamais'
            },
            {
              title: 'Risque',
              key: 'risk',
              render: (_, record) => {
                const hasConflicts = record.has_sod_conflicts;
                const hasCriticalRoles = record.has_critical_roles;
                
                if (hasConflicts && hasCriticalRoles) {
                  return <Tag color="red">Élevé</Tag>;
                } else if (hasConflicts || hasCriticalRoles) {
                  return <Tag color="orange">Moyen</Tag>;
                } else {
                  return <Tag color="green">Faible</Tag>;
                }
              },
              filters: [
                { text: 'Élevé', value: 'high' },
                { text: 'Moyen', value: 'medium' },
                { text: 'Faible', value: 'low' }
              ],
              onFilter: (value, record) => {
                const hasConflicts = record.has_sod_conflicts;
                const hasCriticalRoles = record.has_critical_roles;
                
                if (value === 'high') {
                  return hasConflicts && hasCriticalRoles;
                } else if (value === 'medium') {
                  return (hasConflicts || hasCriticalRoles) && !(hasConflicts && hasCriticalRoles);
                } else {
                  return !hasConflicts && !hasCriticalRoles;
                }
              }
            }
          ]}
        />
      </div>
    );
  };

  // Render Roles Tab Content
  const renderRolesTab = () => {
    const roleAnalysis = analysisData?.role_analysis || {};
    const roles = roleAnalysis.roles || [];
    const criticalRoles = roleAnalysis.critical_roles || [];
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={getCardClass('info')}>
            <div className="flex items-center">
              <KeyOutlined className="text-2xl mr-2" />
              <div>
                <p className="text-sm text-gray-500">Total Rôles</p>
                <p className="text-xl font-bold">{roles.length}</p>
              </div>
            </div>
          </Card>
          <Card className={getCardClass('warning')}>
            <div className="flex items-center">
              <WarningOutlined className="text-2xl mr-2" />
              <div>
                <p className="text-sm text-gray-500">Rôles Critiques</p>
                <p className="text-xl font-bold">{criticalRoles.length}</p>
              </div>
            </div>
          </Card>
          <Card className={getCardClass('danger')}>
            <div className="flex items-center">
              <ExclamationCircleOutlined className="text-2xl mr-2" />
              <div>
                <p className="text-sm text-gray-500">Assignations Expirées</p>
                <p className="text-xl font-bold">{roleAnalysis.expired_role_assignments?.length || 0}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex justify-end mt-4">
          <Button 
            type="primary" 
            icon={<FileExcelOutlined />}
            onClick={() => handleExportToExcel(roles, 'roles.csv')}
            className={getButtonClass('success')}
          >
            Exporter
          </Button>
        </div>

        <Tabs 
          defaultActiveKey="roles" 
          className="mt-4"
          items={[
            {
              key: 'roles',
              label: <span className={getTabClass(true)}>Tous les Rôles</span>,
              children: (
            <Table
                  dataSource={roles}
                  rowKey="role_name"
                  scroll={{ x: true }}
                  pagination={{ pageSize: 10 }}
              columns={[
                {
                      title: 'Nom du Rôle',
                      dataIndex: 'role_name',
                      key: 'role_name',
                      sorter: (a, b) => a.role_name.localeCompare(b.role_name)
                    },
                    {
                      title: 'Type',
                      dataIndex: 'role_type',
                      key: 'role_type',
                      filters: [
                        { text: 'Standard', value: 'Standard' },
                        { text: 'Custom', value: 'Custom' }
                      ],
                      onFilter: (value, record) => record.role_type === value
                    },
                    {
                      title: 'Assignations',
                      dataIndex: 'assignment_count',
                      key: 'assignment_count',
                      sorter: (a, b) => a.assignment_count - b.assignment_count
                    },
                    {
                      title: 'Niveau Critique',
                      dataIndex: 'is_critical',
                      key: 'is_critical',
                      render: isCritical => (
                        <Tag color={isCritical ? 'red' : 'green'}>
                          {isCritical ? 'Critique' : 'Normal'}
                        </Tag>
                      ),
                      filters: [
                        { text: 'Critique', value: true },
                        { text: 'Normal', value: false }
                      ],
                      onFilter: (value, record) => record.is_critical === value
                    }
                  ]}
                />
              )
            },
            {
              key: 'critical',
              label: <span className={getTabClass(false)}>Rôles Critiques</span>,
              children: (
                <Table
                  dataSource={criticalRoles}
                  rowKey="role_name"
                  scroll={{ x: true }}
                  pagination={{ pageSize: 10 }}
                  columns={[
                    {
                      title: 'Nom du Rôle',
                      dataIndex: 'role_name',
                      key: 'role_name',
                      sorter: (a, b) => a.role_name.localeCompare(b.role_name)
                    },
                    {
                      title: 'Description',
                      dataIndex: 'description',
                      key: 'description'
                    },
                    {
                      title: 'Assignations',
                      dataIndex: 'assignment_count',
                      key: 'assignment_count',
                      sorter: (a, b) => a.assignment_count - b.assignment_count
                    },
                    {
                      title: 'Risque',
                      dataIndex: 'risk_level',
                      key: 'risk_level',
                      render: risk => (
                        <Tag color={risk === 'High' ? 'red' : risk === 'Medium' ? 'orange' : 'yellow'}>
                          {risk}
                        </Tag>
                      )
                    }
                  ]}
                />
              )
                }
              ]}
            />
      </div>
    );
  };

  // Render Segregation of Duties (SoD) Tab Content
  const renderSodTab = () => {
    const sodAnalysis = analysisData?.sod_analysis || {};
    const conflicts = sodAnalysis?.conflicts || [];

    // If no conflicts available, show empty state
    if (!conflicts.length) {
    return (
        <Alert
          message="Aucun conflit SoD détecté"
          description="L'analyse n'a pas identifié de conflits de séparation des devoirs dans les rôles assignés."
          type="info"
          showIcon
          className={getAlertClass('info')}
        />
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={getCardClass('danger')}>
            <div className="flex items-center">
              <ExclamationCircleOutlined className="text-2xl mr-2" />
              <div>
                <p className="text-sm text-gray-500">Total Conflits</p>
                <p className="text-xl font-bold">{conflicts.length}</p>
          </div>
          </div>
          </Card>
          <Card className={getCardClass('warning')}>
            <div className="flex items-center">
              <UserOutlined className="text-2xl mr-2" />
              <div>
                <p className="text-sm text-gray-500">Utilisateurs Affectés</p>
                <p className="text-xl font-bold">{sodAnalysis?.uniqueUsersWithConflicts || 0}</p>
          </div>
            </div>
          </Card>
          <Card className={getCardClass('info')}>
            <div className="flex items-center">
              <SafetyCertificateOutlined className="text-2xl mr-2" />
              <div>
                <p className="text-sm text-gray-500">% Utilisateurs affectés</p>
            <p className="text-3xl font-bold mt-2">
                  {(analysisData?.user_analysis?.user_count ? 
                    Math.round((sodAnalysis?.uniqueUsersWithConflicts / analysisData.user_analysis.user_count) * 100) : 
                0)}%
            </p>
          </div>
            </div>
          </Card>
        </div>

        <div className="flex justify-end mt-4">
          <Button 
            type="primary" 
            icon={<FileExcelOutlined />}
            onClick={() => handleExportToExcel(conflicts, 'sod_conflicts.csv')}
            className={getButtonClass('success')}
          >
            Exporter
          </Button>
              </div>
              
                <Table
          dataSource={conflicts}
          rowKey={(record, index) => `${record.conflict_type}-${record.username}-${index}`}
          scroll={{ x: true }}
          pagination={{ pageSize: 10 }}
                  columns={[
                    {
                      title: 'Utilisateur',
                      dataIndex: 'username',
                      key: 'username',
              sorter: (a, b) => a.username.localeCompare(b.username)
            },
            {
              title: 'Type de Conflit',
              dataIndex: 'conflict_type',
              key: 'conflict_type',
              filters: [
                ...new Set(conflicts.map(item => item.conflict_type))
              ].map(type => ({ text: type, value: type })),
              onFilter: (value, record) => record.conflict_type === value,
              render: (type) => (
                <Tag color="red">{type}</Tag>
              )
            },
            {
              title: 'Rôle 1',
              dataIndex: 'role1',
              key: 'role1'
            },
            {
              title: 'Rôle 2',
              dataIndex: 'role2',
              key: 'role2'
            },
            {
              title: 'Niveau de Risque',
              dataIndex: 'risk_level',
              key: 'risk_level',
              render: (risk) => (
                <Tag color={risk === 'High' ? 'red' : risk === 'Medium' ? 'orange' : 'yellow'}>
                  {risk}
                </Tag>
              ),
                  filters: [
                { text: 'Élevé', value: 'High' },
                { text: 'Moyen', value: 'Medium' },
                { text: 'Faible', value: 'Low' }
              ],
              onFilter: (value, record) => record.risk_level === value
                },
                {
                  title: 'Actions',
                  key: 'actions',
                  render: (_, record) => (
                    <Button 
                  type="link" 
                      onClick={() => handleConflictClick(record)}
                    >
                      Détails
                    </Button>
                  )
                }
              ]}
            />
      </div>
    );
  };

  // Render Findings Tab Content
  const renderFindingsTab = () => {
    const auditFindings = analysisData?.auditFindings || [];
    if (!auditFindings.length) return <div>Aucun résultat d'audit disponible</div>;

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold">Résultats d'audit et recommandations</h2>
        
        {auditFindings.map((finding, index) => (
          <div 
            key={finding.id || index} 
            className={`${getCardClass(finding.riskRating === 'Critical' || finding.riskRating === 'High' ? 'danger' : 
              finding.riskRating === 'Medium' ? 'warning' : 'info')} mb-4`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{finding.title}</h3>
                <p className="mt-2">{finding.description}</p>
              </div>
              <Tag 
                color={
                  finding.riskRating === 'Critical' ? 'red' : 
                  finding.riskRating === 'High' ? 'volcano' : 
                  finding.riskRating === 'Medium' ? 'orange' : 
                  'green'
                }
                className="text-sm font-medium px-2 py-1"
              >
                {finding.riskRating}
              </Tag>
            </div>
            
            <div className="mt-4">
              <p className="font-medium text-gray-700">Recommandation:</p>
              <p className="mt-1">{finding.recommendation}</p>
            </div>
            
            {(finding.userCount || finding.accountCount || finding.conflictCount) && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex space-x-4">
                  {finding.userCount && (
                    <div>
                      <span className="text-sm text-gray-500">Utilisateurs concernés:</span>
                      <span className="ml-1 font-medium">{finding.userCount}</span>
                    </div>
                  )}
                  {finding.accountCount && (
                    <div>
                      <span className="text-sm text-gray-500">Comptes concernés:</span>
                      <span className="ml-1 font-medium">{finding.accountCount}</span>
                    </div>
                  )}
                  {finding.conflictCount && (
                    <div>
                      <span className="text-sm text-gray-500">Conflits détectés:</span>
                      <span className="ml-1 font-medium">{finding.conflictCount}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Add this debugging component
  const renderDebugInfo = () => {
    if (!error && !debugInfo) return null;
    
    return (
      <div className="mb-6">
        <Alert
          message={`Error: ${error}`}
          description={
            <div>
              <p>Please check that your uploaded files match the expected format for SAP tables:</p>
              <ul className="list-disc list-inside mt-2">
                <li>AGR_USERS should contain UNAME and AGR_NAME columns</li>
                <li>USR02 should contain BNAME column</li>
                <li>UST12 should contain VON and BIS columns</li>
              </ul>
              {debugInfo && (
                <div className="mt-4 p-4 bg-gray-100 rounded overflow-auto max-h-32">
                  <pre className="text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
                </div>
              )}
            </div>
          }
          type="error"
          showIcon
        />
      </div>
    );
  };

  // Create tab items for the new Tabs API
  const tabItems = [
    {
      key: 'users',
      label: <span className={getTabClass(activeTab === 'users')}><UserOutlined className="mr-1" /> Utilisateurs</span>,
      children: renderUsersTab()
    },
    {
      key: 'roles',
      label: <span className={getTabClass(activeTab === 'roles')}><KeyOutlined className="mr-1" /> Rôles</span>,
      children: renderRolesTab()
    },
    {
      key: 'sod',
      label: <span className={getTabClass(activeTab === 'sod')}><WarningOutlined className="mr-1" /> Conflits SoD</span>,
      children: renderSodTab()
    },
    {
      key: 'findings',
      label: <span className={getTabClass(activeTab === 'findings')}><SafetyCertificateOutlined className="mr-1" /> Résultats d'audit</span>,
      children: renderFindingsTab()
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large">
          <div className="p-8">Chargement de l'analyse détaillée...</div>
        </Spin>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        {renderDebugInfo()}
        <Alert
          message="Données non disponibles"
          description="Une erreur s'est produite lors de l'analyse. Veuillez vérifier le format de vos fichiers et essayer à nouveau."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  if (!analysisData || !analysisData.user_analysis) {
    return (
      <Alert
        message="Données non disponibles"
        description="Aucune donnée d'analyse détaillée n'a été trouvée. Veuillez effectuer une analyse ou sélectionner un rapport existant."
        type="warning"
        showIcon
      />
    );
  }

  // Add a diagnostic for empty user list
  if (!analysisData.user_analysis.users || analysisData.user_analysis.users.length === 0) {
    return (
      <div>
        <Alert
          message="Aucun utilisateur trouvé"
          description={
            <div>
              <p>L'analyse n'a trouvé aucun utilisateur dans les fichiers fournis. Cela peut être dû à:</p>
              <ul className="list-disc list-inside mt-2">
                <li>Des fichiers ne correspondant pas au format attendu pour les tables SAP</li>
                <li>Des noms de colonnes incorrects dans les fichiers</li>
                <li>Des fichiers vides ou sans données d'utilisateurs</li>
              </ul>
              <p className="mt-2">Veuillez vérifier que vos fichiers contiennent bien les tables SAP avec les colonnes requises.</p>
            </div>
          }
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!propAnalysisId && (
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Analyse détaillée de la sécurité SAP</h1>
          <div>
            <Button 
              type="primary"
              icon={<FileExcelOutlined />}
              onClick={() => handleExportToExcel(analysisData.user_analysis?.users || [], 'detailed_analysis.csv')}
              className={getButtonClass('success')}
            >
              Exporter l'analyse
            </Button>
          </div>
        </div>
      )}

      {renderDebugInfo()}

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab} 
        items={tabItems} 
      />
      
      {renderUserDetailsModal()}
      {renderConflictDetailsModal()}
    </div>
  );
};

export default DetailedUserAnalysisPage; 