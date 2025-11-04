// client/src/components/AdminDashboard.js
import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Menu, Layout, Drawer, Button } from 'antd';
import { MenuOutlined, DashboardOutlined, AppstoreOutlined, TableOutlined, ShoppingOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
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

  const menuItems = (
    <Menu
      mode="inline"
      style={{ height: '100%', borderRight: 0 }}
      onClick={closeDrawer}
    >
      <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
        <Link to="/admin">Dashboard</Link>
      </Menu.Item>
      <Menu.Item key="menu" icon={<AppstoreOutlined />}>
        <Link to="menu">Quản Lý Thực Đơn</Link>
      </Menu.Item>
      <Menu.Item key="tables" icon={<TableOutlined />}>
        <Link to="tables">Quản Lý Bàn</Link>
      </Menu.Item>
      <Menu.Item key="orders" icon={<ShoppingOutlined />}>
        <Link to="orders">Quản Lý Đơn Hàng</Link>
      </Menu.Item>
      <Menu.Item key="reservations" icon={<CalendarOutlined />}>
        <Link to="reservations">Quản Lý Đặt Chỗ</Link>
      </Menu.Item>
      <Menu.Item key="users" icon={<UserOutlined />}>
        <Link to="users">Quản Lý Người Dùng</Link>
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout className="admin-dashboard-layout">
      {/* Desktop Sider */}
      <Sider width={200} className="admin-sider desktop-only">
        {menuItems}
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
        {menuItems}
      </Drawer>

      <Layout className="admin-content-layout">
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default AdminDashboard;