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
  const [menuItems, setMenuItems] = useState([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [productStats, setProductStats] = useState({ totalQuantity: 0, totalRevenue: 0 });

  useEffect(() => {
    fetchOrders();
    fetchMenuItems();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('orders'); // Updated to use axiosInstance
      setOrders(data);
      setFilteredOrders(data); // Initially show all orders
    } catch (err) {
      setError(err.response?.data?.message || 'Lấy danh sách đơn hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const { data } = await axiosInstance.get('menu');
      setMenuItems(data);
    } catch (err) {
      console.error('Failed to fetch menu items:', err);
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

  const handleMenuItemChange = (menuItemId) => {
    setSelectedMenuItem(menuItemId);
    
    if (!menuItemId) {
      // Show all orders
      setFilteredOrders(orders);
      setProductStats({ totalQuantity: 0, totalRevenue: 0 });
      return;
    }

    // Filter orders that contain the selected menu item
    const filtered = orders.filter(order => 
      order.orderItems.some(item => item.menuItem._id === menuItemId)
    );
    
    setFilteredOrders(filtered);

    // Calculate stats
    let totalQuantity = 0;
    let totalRevenue = 0;
    
    filtered.forEach(order => {
      order.orderItems.forEach(item => {
        if (item.menuItem._id === menuItemId) {
          totalQuantity += item.quantity;
          totalRevenue += item.price * item.quantity;
        }
      });
    });
    
    setProductStats({ totalQuantity, totalRevenue });
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
      
      {/* Product Check Section */}
      <div className="product-check-section" style={{ marginBottom: 20, padding: 20, background: '#f9f9f9', borderRadius: 8 }}>
        <h3 style={{ marginBottom: 16 }}>Kiểm Tra Sản Phẩm</h3>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ minWidth: 200 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Chọn sản phẩm:</label>
            <Select
              placeholder="Chọn sản phẩm từ thực đơn"
              style={{ width: '100%' }}
              allowClear
              onChange={handleMenuItemChange}
              value={selectedMenuItem}
            >
              {menuItems.map(item => (
                <Option key={item._id} value={item._id}>
                  {item.name} (Còn: {(item.stock || 0) - (item.sold || 0)})
                </Option>
              ))}
            </Select>
          </div>
          
          {selectedMenuItem && (
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                  {productStats.totalQuantity}
                </div>
                <div style={{ color: '#666', fontSize: 12 }}>Tổng số lượng đã bán</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                  {productStats.totalRevenue.toLocaleString()} VND
                </div>
                <div style={{ color: '#666', fontSize: 12 }}>Tổng doanh thu</div>
              </div>
            </div>
          )}
        </div>
      </div>
      
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
          dataSource={filteredOrders} 
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