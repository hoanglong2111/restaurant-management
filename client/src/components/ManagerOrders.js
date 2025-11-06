// client/src/components/ManageOrders.js
import React, { useEffect, useState } from 'react';
import axiosInstance from './axiosInstance'; // Updated import
import { Table, Button, Modal, Form, Select, Alert, Spin } from 'antd';
import '../CSS/ManageOrders.css';

const { Option } = Select;

function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('orders'); // Updated to use axiosInstance
      setOrders(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Lấy danh sách đơn hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  const showModal = (order) => {
    setCurrentOrder(order);
    form.setFieldsValue({ status: order.status });
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.submit();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentOrder(null);
  };

  const onFinish = async (values) => {
    try {
      await axiosInstance.put(`orders/${currentOrder._id}`, { status: values.status.toLowerCase() }); // Updated to use axiosInstance
      setIsModalVisible(false);
      setCurrentOrder(null);
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Cập nhật đơn hàng thất bại');
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa đơn hàng',
      content: 'Bạn có chắc chắn muốn xóa đơn hàng này? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await axiosInstance.delete(`orders/${id}`);
          Modal.success({
            title: 'Thành công',
            content: 'Đơn hàng đã được xóa thành công',
          });
          fetchOrders();
        } catch (err) {
          Modal.error({
            title: 'Lỗi',
            content: err.response?.data?.message || 'Xóa đơn hàng thất bại',
          });
        }
      },
    });
  };

  const columns = [
    { title: 'ID Đơn Hàng', dataIndex: '_id', key: '_id' },
    { title: 'Tên Người Dùng', dataIndex: ['user', 'name'], key: 'user' },
    { title: 'Phương Thức Thanh Toán', dataIndex: 'paymentMethod', key: 'paymentMethod' },
    { title: 'Tổng Giá', dataIndex: 'totalPrice', key: 'totalPrice', render: (price) => `${price.toLocaleString()} VND` },
    { title: 'Trạng Thái', dataIndex: 'status', key: 'status' },
    {
      title: 'Hành Động',
      key: 'action',
      render: (text, record) => (
        <>
          <Button type="link" style={{ fontSize: '12px' }} onClick={() => showModal(record)}>Cập Nhật</Button>
          <Button type="link" danger style={{ fontSize: '12px' }} onClick={() => handleDelete(record._id)}>Xóa</Button>
        </>
      ),
    },
  ];

  if (loading) return <Spin tip="Đang tải..." />;
  if (error) return <Alert message="Lỗi" description={error} type="error" showIcon />;

  return (
    <div className="manage-orders-container">
      <h2 className="manage-orders-title">Quản Lý Đơn Hàng</h2>
      <div className="manage-orders-table">
        <Table dataSource={orders} columns={columns} rowKey="_id" scroll={{ x: 'max-content' }} />
      </div>
      <Modal title="Cập Nhật Trạng Thái Đơn Hàng" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="status" label="Trạng Thái" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
            <Select>
              <Option value="pending">Đang Chờ</Option>
              <Option value="confirmed">Hoàn Thành</Option>
              <Option value="cancelled">Đã Hủy</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ManageOrders;