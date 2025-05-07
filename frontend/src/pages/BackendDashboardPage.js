import React, { useState, useEffect } from 'react';
import { Layout, Typography, Spin } from 'antd';
import BackendDashboard from '../components/backend/BackendDashboard';
import AuditList from '../components/backend/AuditList';
import { backendApi } from '../utils/AxiosConfig';

const { Content } = Layout;
const { Title } = Typography;

const BackendDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [audits, setAudits] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, auditsResponse] = await Promise.all([
          backendApi.get('/stats'),
          backendApi.get('/audits')
        ]);
        
        setStats(statsResponse.data);
        setAudits(auditsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewAudit = (audit) => {
    // Navigate to audit details page
    console.log('View audit:', audit);
  };

  const handleDownloadAudit = async (audit) => {
    try {
      const response = await backendApi.get(`/audits/${audit.id}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-${audit.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading audit:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout>
      <Content style={{ padding: '24px' }}>
        <Title level={2}>Backend Dashboard</Title>
        
        <BackendDashboard stats={stats} />
        
        <div style={{ marginTop: '24px' }}>
          <Title level={3}>Recent Audits</Title>
          <AuditList
            audits={audits}
            onView={handleViewAudit}
            onDownload={handleDownloadAudit}
          />
        </div>
      </Content>
    </Layout>
  );
};

export default BackendDashboardPage; 