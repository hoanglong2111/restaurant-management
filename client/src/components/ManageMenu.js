import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Switch, Alert, Spin, Space } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import axiosInstance from './axiosInstance';
import '../CSS/ManageMenu.css'; // Import the CSS

function ManageMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('menu');
      setMenuItems(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Lấy danh sách món ăn thất bại');
    } finally {
      setLoading(false);
    }
  };

  const showModal = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (item) => {
    setEditingItem(item);
    form.setFieldsValue({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      imageUrls: item.imageUrls || [''],
      availability: item.availability,
    });
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.submit();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingItem(null);
  };

  const onFinish = async (values) => {
    try {
      if (editingItem) {
        await axiosInstance.put(`menu/${editingItem._id}`, {
          ...values,
          availability: values.availability,
        });
      } else {
        await axiosInstance.post('menu/create', {
          ...values,
          availability: values.availability,
        });
      }
      setIsModalVisible(false);
      fetchMenuItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Lưu món ăn thất bại');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`menu/${id}`);
      fetchMenuItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Xóa món ăn thất bại');
    }
  };

  const columns = [
    { title: 'Tên Món', dataIndex: 'name', key: 'name' },
    { title: 'Mô Tả', dataIndex: 'description', key: 'description' },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price.toLocaleString()} VND`,
    },
    { title: 'Danh Mục', dataIndex: 'category', key: 'category' },
    {
      title: 'Hình Ảnh',
      dataIndex: 'imageUrls',
      key: 'imageUrls',
      render: (urls) =>
        urls && urls.length > 0 ? (
          <img src={urls[0]} alt="Menu Item" style={{ width: '50px' }} />
        ) : (
          'Không có hình ảnh'
        ),
    },
    {
      title: 'Tình Trạng',
      dataIndex: 'availability',
      key: 'availability',
      render: (avail) => (avail ? 'Còn hàng' : 'Hết hàng'),
      className: 'menu-availability',
    },
    {
      title: 'Hành Động',
      key: 'action',
      render: (text, record) => (
        <>
          <Button type="link" style={{ fontSize: '12px' }} onClick={() => showEditModal(record)} className="action-button edit-button">
            Chỉnh Sửa
          </Button>
          <Button type="link" danger style={{ fontSize: '12px' }} onClick={() => handleDelete(record._id)} className="action-button delete-button">
            Xóa
          </Button>
        </>
      ),
    },
  ];

  if (loading) return <Spin tip="Đang tải..." className="manage-menu-spin" />;
  if (error) return <Alert message="Lỗi" description={error} type="error" showIcon className="manage-menu-alert" />;

  return (
    <div className="manage-menu-container">
      <h2 className="manage-menu-title">Quản Lý Thực Đơn</h2>
      <Button type="primary" onClick={showModal} style={{ marginBottom: 16 }} className="add-menu-button gradient-button">
        Thêm Món Mới
      </Button>
      <Table dataSource={menuItems} columns={columns} rowKey="_id" className="manage-menu-table" bordered scroll={{ x: 'max-content' }} />
      <Modal
        title={editingItem ? 'Chỉnh Sửa Món Ăn' : 'Thêm Món Mới'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="name"
            label="Tên Món"
            rules={[{ required: true, message: 'Vui lòng nhập tên món' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô Tả">
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="price"
            label="Giá"
            rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="category"
            label="Danh Mục"
            rules={[{ required: true, message: 'Vui lòng nhập danh mục' }]}
          >
            <Input />
          </Form.Item>
          <Form.List name="imageUrls" initialValue={['']}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, index) => (
                  <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                    <Form.Item
                      {...restField}
                      name={[name]}
                      label={index === 0 ? 'Hình Ảnh URL' : ''}
                      rules={[{ required: true, message: 'Vui lòng nhập URL hình ảnh' }]}
                    >
                      <Input placeholder="Nhập URL hình ảnh" />
                    </Form.Item>
                    {fields.length > 1 ? (
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    ) : null}
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                    Thêm URL Hình Ảnh
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          <Form.Item name="availability" label="Tình Trạng" valuePropName="checked">
            <Switch checkedChildren="Còn hàng" unCheckedChildren="Hết hàng" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ManageMenu;