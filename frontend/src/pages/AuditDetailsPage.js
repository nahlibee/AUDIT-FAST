import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Typography, Descriptions, Button, Spin, message } from 'antd';
import { ArrowLeftOutlined, DownloadOutlined } from '@ant-design/icons';
import { backendApi } from '../utils/AxiosConfig';

const { Content } = Layout;
const { Title, Text } = Typography;

const AuditDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [audit, setAudit] = useState(null);

  useEffect(() => {
    const fetchAuditDetails = async () => {
      try {
        const response = await backendApi.get(`/audits/${id}`);
        setAudit(response.data);
      } catch (error) {
        message.error('Failed to fetch audit details');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditDetails();
  }, [id]);

  const handleDownload = async () => {
    try {
      const response = await backendApi.get(`/audits/${id}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      message.error('Failed to download audit report');
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!audit) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text>Audit not found</Text>
      </div>
    );
  }

  return (
    <Layout>
      <Content style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
          >
            Back to Dashboard
          </Button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Title level={2}>Audit Details</Title>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
          >
            Download Report
          </Button>
        </div>

        <Descriptions bordered column={2}>
          <Descriptions.Item label="Audit ID">{audit.id}</Descriptions.Item>
          <Descriptions.Item label="Name">{audit.name}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Text type={audit.status === 'COMPLETED' ? 'success' : 'warning'}>
              {audit.status}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {new Date(audit.createdAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Description" span={2}>
            {audit.description}
          </Descriptions.Item>
          <Descriptions.Item label="Findings" span={2}>
            {audit.findings?.map((finding, index) => (
              <div key={index} style={{ marginBottom: '8px' }}>
                <Text strong>{finding.title}</Text>
                <br />
                <Text>{finding.description}</Text>
              </div>
            ))}
          </Descriptions.Item>
        </Descriptions>
      </Content>
    </Layout>
  );
};

export default AuditDetailsPage; 