// client/src/components/AdminDashboard.js
import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Menu, Layout, Drawer, Button } from 'antd';
import { MenuOutlined, DashboardOutlined, AppstoreOutlined, TableOutlined, ShoppingOutlined, CalendarOutlined, UserOutlined, HomeOutlined } from '@ant-design/icons';
import MobileBackButton from './MobileBackButton';
import '../CSS/AdminDashboard.css';

const { Sider, Content } = Layout;

function AdminDashboard() {
  const [drawerVisible, setDrawerVisible] = useState(false);

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/admin">Dashboard</Link>,
    },
    {
      key: 'menu',
      icon: <AppstoreOutlined />,
      label: <Link to="menu">Quản Lý Thực Đơn</Link>,
    },
    {
      key: 'tables',
      icon: <TableOutlined />,
      label: <Link to="tables">Quản Lý Bàn</Link>,
    },
    {
      key: 'orders',
      icon: <ShoppingOutlined />,
      label: <Link to="orders">Quản Lý Đơn Hàng</Link>,
    },
    {
      key: 'reservations',
      icon: <CalendarOutlined />,
      label: <Link to="reservations">Quản Lý Đặt Chỗ</Link>,
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: <Link to="users">Quản Lý Người Dùng</Link>,
    },
    {
      type: 'divider',
    },
    {
      key: 'back-to-menu',
      icon: <HomeOutlined />,
      label: <Link to="/menu">Quay về Menu</Link>,
    },
  ];

  return (
    <Layout className="admin-dashboard-layout">
      {/* Desktop Sider */}
      <Sider width={200} className="admin-sider desktop-only">
        <Menu
          mode="inline"
          style={{ height: '100%', borderRight: 0 }}
          onClick={closeDrawer}
          items={menuItems}
        />
      </Sider>

      {/* Mobile Menu Button */}
      <Button
        className="admin-mobile-menu-btn mobile-only"
        icon={<MenuOutlined />}
        onClick={showDrawer}
        size="large"
      >
        Menu
      </Button>

      {/* Mobile Drawer */}
      <Drawer
        title="Admin Menu"
        placement="left"
        onClose={closeDrawer}
        open={drawerVisible}
        className="admin-drawer"
      >
        <Menu
          mode="inline"
          style={{ height: '100%', borderRight: 0 }}
          onClick={closeDrawer}
          items={menuItems}
        />
      </Drawer>

      <Layout className="admin-content-layout">
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>

      {/* Mobile Back Button */}
      <MobileBackButton to="/menu" label="Quay về Menu" />
    </Layout>
  );
}

export default AdminDashboard;