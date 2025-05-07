import React, { useState } from 'react';
import { Layout, Menu, Button, Drawer } from 'antd';
import { 
  HomeOutlined, 
  TeamOutlined, 
  HistoryOutlined, 
  AppstoreOutlined, 
  MenuOutlined,
  SafetyOutlined,
  AuditOutlined
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const { Header } = Layout;

const Navbar = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const menuItems = [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: 'Tableau de bord',
      link: '/dashboard'
    },
    {
      key: '/agr-users',
      icon: <TeamOutlined />,
      label: 'AGR_USERS',
      link: '/agr-users'
    },
    {
      key: '/ust12',
      icon: <HistoryOutlined />,
      label: 'UST12',
      link: '/ust12'
    },
    {
      key: '/integrated-analysis',
      icon: <AppstoreOutlined />,
      label: 'Analyse Intégrée',
      link: '/integrated-analysis'
    },
    {
      key: '/audit-report',
      icon: <SafetyOutlined />,
      label: 'Rapport d\'Audit',
      link: '/audit-report'
    }
  ];

  return (
    <Header className="bg-white shadow-md p-0 flex justify-between items-center">
      <Link to="/" className="h-16 w-40 flex items-center">
        <div className="flex items-center">
          <AuditOutlined className="text-2xl text-blue-600 ml-6 mr-2" />
          <span className="text-lg font-bold">AUDIT-FAST</span>
        </div>
      </Link>
      
      {/* Mobile menu button */}
      <Button 
        className="lg:hidden mr-4" 
        type="text" 
        icon={<MenuOutlined />} 
        onClick={showDrawer}
      />
      
      {/* Desktop menu */}
      <div className="hidden lg:block flex-1">
        <Menu 
          mode="horizontal" 
          selectedKeys={[location.pathname]}
          className="border-none"
          items={menuItems.map(item => ({
            key: item.key,
            icon: item.icon,
            label: <Link to={item.link}>{item.label}</Link>
          }))}
        />
      </div>
      
      {/* Mobile menu drawer */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={onClose}
        open={visible}
      >
        <Menu 
          mode="vertical" 
          selectedKeys={[location.pathname]}
          className="border-none"
          items={menuItems.map(item => ({
            key: item.key,
            icon: item.icon,
            label: <Link to={item.link}>{item.label}</Link>,
            onClick: onClose
          }))}
        />
      </Drawer>
    </Header>
  );
};

export default Navbar; 