// client/src/components/ManageOrders.js
import React, { useEffect, useState } from 'react';
import axiosInstance from './axiosInstance'; // Updated import
import { Table, Button, Modal, Form, Select, Alert, Spin, Space, message } from 'antd';
import '../CSS/ManageOrders.css';

const { Option } = Select;

function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
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

  // Bulk delete
  const handleBulkDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất 1 đơn hàng');
      return;
    }

    const selectedOrders = orders.filter(order => selectedRowKeys.includes(order._id));

    Modal.confirm({
      title: `Xác nhận xóa ${selectedRowKeys.length} đơn hàng`,
      content: (
        <div>
          <p style={{ marginBottom: 12 }}>Bạn có chắc chắn muốn xóa các đơn hàng đã chọn? Hành động này không thể hoàn tác.</p>
          <div style={{ maxHeight: 200, overflowY: 'auto', background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
            {selectedOrders.map((order, index) => (
              <div key={order._id} style={{ marginBottom: 4 }}>
                {index + 1}. <strong>{order.user?.name || 'Khách hàng'}</strong> - ID: {order._id.slice(-6)} - {order.totalPrice.toLocaleString()} VND
              </div>
            ))}
          </div>
        </div>
      ),
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      width: 600,
      onOk: async () => {
        try {
          await Promise.all(selectedRowKeys.map(id => axiosInstance.delete(`orders/${id}`)));
          message.success(`Đã xóa ${selectedRowKeys.length} đơn hàng`);
          setSelectedRowKeys([]);
          fetchOrders();
        } catch (err) {
          message.error('Có lỗi xảy ra khi xóa đơn hàng');
        }
      },
    });
  };

  // Bulk update status
  const handleBulkUpdateStatus = (status) => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất 1 đơn hàng');
      return;
    }

    const selectedOrders = orders.filter(order => selectedRowKeys.includes(order._id));
    const statusMap = {
      'confirmed': 'Hoàn Thành',
      'pending': 'Đang Chờ',
      'cancelled': 'Đã Hủy'
    };

    Modal.confirm({
      title: `Cập nhật ${selectedRowKeys.length} đơn hàng`,
      content: (
        <div>
          <p style={{ marginBottom: 12 }}>Đổi trạng thái thành <strong>"{statusMap[status.toLowerCase()]}"</strong>?</p>
          <div style={{ maxHeight: 200, overflowY: 'auto', background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
            {selectedOrders.map((order, index) => (
              <div key={order._id} style={{ marginBottom: 4 }}>
                {index + 1}. <strong>{order.user?.name || 'Khách hàng'}</strong> - ID: {order._id.slice(-6)} - Trạng thái hiện tại: {order.status}
              </div>
            ))}
          </div>
        </div>
      ),
      okText: 'Cập nhật',
      cancelText: 'Hủy',
      width: 600,
      onOk: async () => {
        try {
          await Promise.all(selectedRowKeys.map(id => 
            axiosInstance.put(`orders/${id}`, { status: status.toLowerCase() })
          ));
          message.success(`Đã cập nhật ${selectedRowKeys.length} đơn hàng`);
          setSelectedRowKeys([]);
          fetchOrders();
        } catch (err) {
          message.error('Có lỗi xảy ra khi cập nhật');
        }
      },
    });
  };

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
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
      
      {/* Bulk Actions */}
      {selectedRowKeys.length > 0 && (
        <div className="bulk-actions-bar">
          <Space wrap>
            <span style={{ marginRight: 8 }}>
              Đã chọn <strong>{selectedRowKeys.length}</strong> đơn hàng
            </span>
            <Button 
              onClick={() => handleBulkUpdateStatus('confirmed')}
            >
              Hoàn thành
            </Button>
            <Button onClick={() => handleBulkUpdateStatus('pending')}>
              Đang chờ
            </Button>
            <Button onClick={() => handleBulkUpdateStatus('cancelled')}>
              Hủy bỏ
            </Button>
            <Button danger onClick={handleBulkDelete}>
              Xóa
            </Button>
          </Space>
        </div>
      )}

      <div className="manage-orders-table">
        <Table 
          dataSource={orders} 
          columns={columns} 
          rowKey="_id" 
          rowSelection={rowSelection}
          scroll={{ x: 'max-content' }} 
        />
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