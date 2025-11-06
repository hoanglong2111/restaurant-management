// client/src/components/ManageUsers.js
import React, { useEffect, useState } from 'react';
import axiosInstance from './axiosInstance'; // Updated import
import { Table, Switch, Alert, Spin, Button, Modal, message } from 'antd';
import { Link } from 'react-router-dom';
import '../CSS/ManageUsers.css';

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get('users');
        setUsers(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching users.');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const toggleAdmin = async (id, isAdmin) => {
    try {
      await axiosInstance.put(`users/${id}`, { isAdmin: !isAdmin });
      // Refresh users
      const { data } = await axiosInstance.get('users');
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating user.');
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Bạn có chắc chắn muốn xóa người dùng này?',
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await axiosInstance.delete(`users/${id}`);
          message.success('Xóa người dùng thành công');
          // Refresh users
          const { data } = await axiosInstance.get('users');
          setUsers(data);
        } catch (err) {
          message.error(err.response?.data?.message || 'Lỗi khi xóa người dùng');
        }
      },
    });
  };

  const columns = [
    { title: 'Tên', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Admin',
      dataIndex: 'isAdmin',
      key: 'isAdmin',
      render: (text, record) => (
        <Switch
          checked={record.isAdmin}
          onChange={() => toggleAdmin(record._id, record.isAdmin)}
        />
      ),
    },
    {
      title: 'Hành Động',
      key: 'action',
      render: (text, record) => (
        <>
          <Link to={`/admin/users/edit/${record._id}`} style={{ fontSize: '12px' }}>Chỉnh Sửa</Link>
          <Button type="link" danger style={{ fontSize: '12px' }} onClick={() => handleDelete(record._id)}>Xóa</Button>
        </>
      ),
    },
  ];

  if (loading) return <div className="manage-users-spin"><Spin tip="Đang tải..." /></div>;
  if (error) return <div className="manage-users-alert"><Alert message="Lỗi" description={error} type="error" showIcon /></div>;

  return (
    <div className="manage-users-container">
      <h2 className="manage-users-title">Quản Lý Người Dùng</h2>
      <div className="manage-users-table">
        <Table dataSource={users} columns={columns} rowKey="_id" scroll={{ x: 'max-content' }} />
      </div>
    </div>
  );
}

export default ManageUsers;