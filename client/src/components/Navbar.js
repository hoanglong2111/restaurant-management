import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Drawer, Button, Badge, Dropdown, Avatar } from 'antd';
import { MenuOutlined, ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
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

  const userMenu = (
    <Menu>
      <Menu.Item key="profile">
        <Link to="/profile">Hồ Sơ Cá Nhân</Link>
      </Menu.Item>
      <Menu.Item key="reservations">
        <Link to="/reservations">Đặt Chỗ</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" onClick={handleLogout}>
        Đăng Xuất
      </Menu.Item>
    </Menu>
  );

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const cartDropdown = (
    <div style={{ padding: '10px', maxWidth: '300px' }}>
      <h4>Giỏ Hàng</h4>
      {cart.length > 0 ? (
        <>
          {cart.map((item) => (
            <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>{item.name} x {item.quantity}</span>
              <Button type="link" danger onClick={() => removeFromCart(item._id)}>
                Bỏ
              </Button>
            </div>
          ))}
          <Link to="/cart">
            <Button type="primary" block>
              Thanh Toán
            </Button>
          </Link>
        </>
      ) : (
        <p>Giỏ hàng của bạn đang trống.</p>
      )}
    </div>
  );

  return (
    <Layout>
      <Header className="navbar-header">
        <div className="logo">
          <Link to="/">Cảnh Quan</Link>
        </div>
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={[selectedKey()]} className="navbar-menu desktop-menu">
          <Menu.Item key="/menu">
            <Link to="/menu">Thực Đơn</Link>
          </Menu.Item>
          <Menu.Item key="/reservations">
            <Link to="/reservations">Đặt Chỗ</Link>
          </Menu.Item>
          <Menu.Item key="/tables">
            <Link to="/tables">Bàn</Link>
          </Menu.Item>
        </Menu>
        <div className="navbar-actions desktop-menu">
          <Dropdown overlay={cartDropdown} trigger={['click']} placement="bottomRight">
            <Badge count={totalItems} offset={[-5, 5]}>
              <ShoppingCartOutlined style={{ fontSize: '18px', color: '#ffffff', cursor: 'pointer' }} />
            </Badge>
          </Dropdown>
          <Dropdown overlay={userMenu}>
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
        <Menu mode="inline" selectedKeys={[selectedKey()]} className="drawer-menu">
          <Menu.Item key="/menu" icon={<span>🍽️</span>}>
            <Link to="/menu" onClick={onClose}>Thực Đơn</Link>
          </Menu.Item>
          <Menu.Item key="/reservations" icon={<span>📅</span>}>
            <Link to="/reservations" onClick={onClose}>Đặt Chỗ</Link>
          </Menu.Item>
          <Menu.Item key="/tables" icon={<span>🪑</span>}>
            <Link to="/tables" onClick={onClose}>Bàn</Link>
          </Menu.Item>

          <Menu.Divider />

          {currentUser.name ? (
            <>
              <Menu.Item key="/cart" icon={<ShoppingCartOutlined />}>
                <Link to="/cart" onClick={onClose}>
                  Giỏ Hàng {totalItems > 0 && <Badge count={totalItems} style={{ marginLeft: '8px' }} />}
                </Link>
              </Menu.Item>
              <Menu.Item key="/profile" icon={<UserOutlined />}>
                <Link to="/profile" onClick={onClose}>Hồ Sơ</Link>
              </Menu.Item>
              {currentUser.isAdmin && (
                <Menu.Item key="/admin" icon={<span>⚙️</span>}>
                  <Link to="/admin" onClick={onClose}>Quản Trị</Link>
                </Menu.Item>
              )}
              <Menu.Divider />
              <Menu.Item key="logout" icon={<span>🚪</span>} onClick={handleLogout}>
                Đăng Xuất
              </Menu.Item>
            </>
          ) : (
            <>
              <Menu.Item key="/login" icon={<span>🔑</span>}>
                <Link to="/login" onClick={onClose}>Đăng Nhập</Link>
              </Menu.Item>
              <Menu.Item key="/register" icon={<span>📝</span>}>
                <Link to="/register" onClick={onClose}>Đăng Ký</Link>
              </Menu.Item>
            </>
          )}
        </Menu>
      </Drawer>
    </Layout>
  );
}

export default Navbar;