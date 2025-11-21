import React, { useState, useEffect, useCallback } from 'react';
import { Table, Alert, Spin } from 'antd';
import axiosInstance from './axiosInstance';
import MobileBackButton from './MobileBackButton';
import '../CSS/Tables.css';
import '../CSS/global.css';
function Tables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTables = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosInstance.get('tables');
      setTables(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Lấy danh sách bàn thất bại');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const columns = [
    {
      title: 'Số Bàn',
      dataIndex: 'tableNumber',
      key: 'tableNumber',
      sorter: (a, b) => a.tableNumber - b.tableNumber,
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Sức Chứa',
      dataIndex: 'capacity',
      key: 'capacity',
      sorter: (a, b) => a.capacity - b.capacity,
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Vị Trí',
      dataIndex: 'location',
      key: 'location',
      filters: [
        { text: 'Indoor', value: 'Indoor' },
        { text: 'Outdoor', value: 'Outdoor' },
      ],
      onFilter: (value, record) => record.location === value,
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Trống', value: 'Trống' },
        { text: 'Đang Sử Dụng', value: 'Đang Sử Dụng' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <span className={status === 'Trống' ? 'status-free' : 'status-occupied'}>
          {status}
        </span>
      ),
    },
  ];

  if (loading) return <div className="tables-spin"><Spin /></div>;
  if (error) return <div className="tables-alert"><Alert message="Lỗi" description={error} type="error" showIcon /></div>;

  return (
    <div className="tables-container">
      <MobileBackButton to="/menu" label="Quay về Menu" />

      <h2 className="tables-title">Danh Sách Bàn</h2>
      <div className="tables-table-wrapper">
        <Table
          dataSource={tables}
          columns={columns}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          className="tables-table"
          bordered
          scroll={{ x: 'max-content' }}
        />
      </div>
    </div>
  );
}

export default Tables;