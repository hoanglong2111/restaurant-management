// client/src/components/ManageTables.js
import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Modal, Form, InputNumber, Input, Select, Alert, Spin } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import axiosInstance from './axiosInstance';
import '../CSS/ManageTables.css';
import '../CSS/global.css'; // Nếu bạn tạo lớp global

const { Option } = Select;

function ManageTables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [form] = Form.useForm();

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

  const showModal = (table = null) => {
    setEditingTable(table);
    if (table) {
      form.setFieldsValue({
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        location: table.location,
        status: table.status,
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.submit();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingTable(null);
    setError('');
  };

  const onFinish = async (values) => {
    try {
      if (editingTable) {
        // Chỉnh sửa bàn
        await axiosInstance.put(`tables/${editingTable._id}`, values);
        Modal.success({
          title: 'Cập Nhật Bàn Thành Công',
        });
      } else {
        // Thêm mới bàn
        await axiosInstance.post('tables/create', values);
        Modal.success({
          title: 'Thêm Bàn Thành Công',
        });
      }
      setIsModalVisible(false);
      fetchTables();
      form.resetFields();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Lưu bàn thất bại');
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Xác Nhận Xóa',
      content: 'Bạn có chắc chắn muốn xóa bàn này?',
      okText: 'Có',
      cancelText: 'Không',
      onOk: async () => {
        try {
          await axiosInstance.delete(`tables/${id}`);
          Modal.success({
            title: 'Xóa Bàn Thành Công',
          });
          fetchTables();
        } catch (err) {
          Modal.error({
            title: 'Xóa Thất Bại',
            content: err.response?.data?.message || 'Xóa bàn thất bại.',
          });
        }
      },
    });
  };

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
    {
      title: 'Hành Động',
      key: 'action',
      render: (text, record) => (
        <>
          <Button
            type="link"
            icon={<EditOutlined />}
            style={{ fontSize: '12px' }}
            onClick={() => showModal(record)}
            className="action-button edit-button"
          >
            Chỉnh Sửa
          </Button>
          <Button
            type="link"
            icon={<DeleteOutlined />}
            danger
            style={{ fontSize: '12px' }}
            onClick={() => handleDelete(record._id)}
            className="action-button delete-button"
          >
            Xóa
          </Button>
        </>
      ),
    },
  ];

  if (loading) return <Spin tip="Đang tải..." className="manage-tables-spin" />;
  if (error)
    return <Alert message="Lỗi" description={error} type="error" showIcon className="manage-tables-alert" />;

  return (
    <div className="manage-tables-container">
      <h2 className="manage-tables-title">Quản Lý Bàn</h2>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => showModal()}
        className="add-table-button gradient-button" // Áp dụng lớp gradient
      >
        Thêm Bàn Mới
      </Button>
      <Table
        dataSource={tables}
        columns={columns}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        className="manage-tables-table"
        bordered
        scroll={{ x: 'max-content' }}
      />

      <Modal
        title={editingTable ? 'Chỉnh Sửa Bàn' : 'Thêm Bàn Mới'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Lưu"
        cancelText="Hủy"
        centered
      >
        {error && <Alert message="Lỗi" description={error} type="error" showIcon style={{ marginBottom: 16 }} />}
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="tableNumber"
            label="Số Bàn"
            rules={[{ required: true, message: 'Vui lòng nhập số bàn' }]}
          >
            <Input placeholder="Nhập số bàn" />
          </Form.Item>
          <Form.Item
            name="capacity"
            label="Sức Chứa"
            rules={[{ required: true, message: 'Vui lòng nhập sức chứa' }]}
          >
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item
            name="location"
            label="Vị Trí"
            rules={[{ required: true, message: 'Vui lòng nhập vị trí' }]}
          >
            <Input placeholder="Nhập vị trí" />
          </Form.Item>
          <Form.Item
            name="status"
            label="Trạng Thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
            initialValue="Trống"
          >
            <Select>
              <Option value="Trống">Trống</Option>
              <Option value="Đang Sử Dụng">Đang Sử Dụng</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ManageTables;