import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Drawer, Button, Badge, Dropdown, Avatar } from 'antd';
import { 
  MenuOutlined, 
  ShoppingCartOutlined, 
  UserOutlined,
  CalendarOutlined,
  ShopOutlined,
  InboxOutlined,
  SettingOutlined,
  LogoutOutlined,
  LoginOutlined,
  UserAddOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import 'antd/dist/reset.css';
import '../CSS/Navbar.css'; // Ensure this path is correct based on your project structure
import '../CSS/global.css'; // Nếu bạn tạo lớp global

const { Header } = Layout;

function Navbar({ cart, removeFromCart }) {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};

  const selectedKey = () => {
    const path = location.pathname;
    if (path.startsWith('/admin')) return '/admin';
    return path === '/' ? '/' : `/${path.split('/')[1]}`;
  };

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');

    // Dispatch custom event to notify App.js
    window.dispatchEvent(new Event('userChanged'));

    window.location.href = '/login';
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: <Link to="/profile">Hồ Sơ Cá Nhân</Link>,
    },
    {
      key: 'myorders',
      label: <Link to="/myorders">Đơn Hàng Của Tôi</Link>,
    },
    {
      key: 'reservations',
      label: <Link to="/reservations">Đặt Chỗ</Link>,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Đăng Xuất',
      onClick: handleLogout,
    },
  ];

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const cartDropdown = cart.length > 0 ? [
    ...cart.map((item) => ({
      key: item._id,
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '250px' }}>
          <span>{item.name} x {item.quantity}</span>
          <Button type="link" danger size="small" onClick={() => removeFromCart(item._id)}>
            Bỏ
          </Button>
        </div>
      ),
    })),
    {
      type: 'divider',
    },
    {
      key: 'checkout',
      label: (
        <Link to="/cart">
          <Button type="primary" block>
            Thanh Toán
          </Button>
        </Link>
      ),
    },
  ] : [
    {
      key: 'empty',
      label: 'Giỏ hàng của bạn đang trống.',
      disabled: true,
    },
  ];

  return (
    <Layout>
      <Header className="navbar-header">
        <div className="logo">
          <Link to="/">Cảnh Quan</Link>
        </div>
        <Menu 
          theme="dark" 
          mode="horizontal" 
          defaultSelectedKeys={[selectedKey()]} 
          className="navbar-menu desktop-menu"
          items={[
            {
              key: '/menu',
              label: <Link to="/menu">Thực Đơn</Link>,
            },
            {
              key: '/reservations',
              label: <Link to="/reservations">Đặt Chỗ</Link>,
            },
            {
              key: '/tables',
              label: <Link to="/tables">Bàn</Link>,
            },
          ]}
        />
        <div className="navbar-actions desktop-menu">
          <Dropdown menu={{ items: cartDropdown }} trigger={['click']} placement="bottomRight">
            <Badge count={totalItems} offset={[-5, 5]}>
              <ShoppingCartOutlined style={{ fontSize: '18px', color: '#ffffff', cursor: 'pointer' }} />
            </Badge>
          </Dropdown>
          <Dropdown menu={{ items: userMenuItems }}>
            <Avatar icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
          </Dropdown>
          {currentUser.isAdmin && (
            <Link to="/admin">
              <Button className="admin-button">Quản Trị</Button>
            </Link>
          )}
        </div>
        {/* Mobile Menu Button - Moved to right */}
        <Button
          className="menu-button mobile-only"
          icon={<MenuOutlined />}
          onClick={showDrawer}
        />
      </Header>

      <Drawer
        placement="right"
        closable={true}
        onClose={onClose}
        open={visible}
        width="280px"
        className="mobile-drawer"
        title={
          <div className="drawer-header">
            <span className="drawer-title">Menu</span>
          </div>
        }
      >
        <Menu 
          mode="inline" 
          selectedKeys={[selectedKey()]} 
          className="drawer-menu"
          items={
            currentUser.name ? [
              {
                key: '/menu',
                icon: <AppstoreOutlined />,
                label: <Link to="/menu" onClick={onClose}>Thực Đơn</Link>,
              },
              {
                key: '/reservations',
                icon: <CalendarOutlined />,
                label: <Link to="/reservations" onClick={onClose}>Đặt Chỗ</Link>,
              },
              {
                key: '/tables',
                icon: <ShopOutlined />,
                label: <Link to="/tables" onClick={onClose}>Bàn</Link>,
              },
              {
                type: 'divider',
              },
              {
                key: '/cart',
                icon: <ShoppingCartOutlined />,
                label: (
                  <Link to="/cart" onClick={onClose}>
                    Giỏ Hàng {totalItems > 0 && <Badge count={totalItems} style={{ marginLeft: '8px' }} />}
                  </Link>
                ),
              },
              {
                key: '/myorders',
                icon: <InboxOutlined />,
                label: <Link to="/myorders" onClick={onClose}>Đơn Hàng Của Tôi</Link>,
              },
              {
                key: '/profile',
                icon: <UserOutlined />,
                label: <Link to="/profile" onClick={onClose}>Hồ Sơ</Link>,
              },
              ...(currentUser.isAdmin ? [
                {
                  key: '/admin',
                  icon: <SettingOutlined />,
                  label: <Link to="/admin" onClick={onClose}>Quản Trị</Link>,
                },
              ] : []),
              {
                type: 'divider',
              },
              {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: 'Đăng Xuất',
                onClick: handleLogout,
              },
            ] : [
              {
                key: '/menu',
                icon: <AppstoreOutlined />,
                label: <Link to="/menu" onClick={onClose}>Thực Đơn</Link>,
              },
              {
                key: '/reservations',
                icon: <CalendarOutlined />,
                label: <Link to="/reservations" onClick={onClose}>Đặt Chỗ</Link>,
              },
              {
                key: '/tables',
                icon: <ShopOutlined />,
                label: <Link to="/tables" onClick={onClose}>Bàn</Link>,
              },
              {
                type: 'divider',
              },
              {
                key: '/login',
                icon: <LoginOutlined />,
                label: <Link to="/login" onClick={onClose}>Đăng Nhập</Link>,
              },
              {
                key: '/register',
                icon: <UserAddOutlined />,
                label: <Link to="/register" onClick={onClose}>Đăng Ký</Link>,
              },
            ]
          }
        />
      </Drawer>
    </Layout>
  );
}

export default Navbar;