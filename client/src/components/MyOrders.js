// client/src/components/MyOrders.js
import React, { useState, useEffect } from 'react';
import { Table, Tag, Spin, Alert, Card, Descriptions } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import axiosInstance from './axiosInstance';
import MobileBackButton from './MobileBackButton';
import '../CSS/MyOrders.css';

function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMyOrders();
    }, []);

    const fetchMyOrders = async () => {
        try {
            const { data } = await axiosInstance.get('/orders/myorders');
            setOrders(data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải đơn hàng');
            setLoading(false);
        }
    };

    const getStatusTag = (status) => {
        const statusConfig = {
            pending: { color: 'orange', icon: <ClockCircleOutlined />, text: 'Chờ xử lý' },
            confirmed: { color: 'blue', icon: <CheckCircleOutlined />, text: 'Đã thanh toán' },
            preparing: { color: 'cyan', icon: <ClockCircleOutlined />, text: 'Đang chuẩn bị' },
            delivering: { color: 'geekblue', icon: <ClockCircleOutlined />, text: 'Đang giao' },
            delivered: { color: 'green', icon: <CheckCircleOutlined />, text: 'Đã giao' },
            cancelled: { color: 'red', icon: <CloseCircleOutlined />, text: 'Đã hủy' },
        };
        const config = statusConfig[status] || { color: 'default', icon: null, text: status };
        return (
            <Tag color={config.color} icon={config.icon}>
                {config.text}
            </Tag>
        );
    };

    const getPaymentMethodTag = (method) => {
        const methodConfig = {
            Stripe: { color: 'purple', text: '💳 Stripe' },
            PayPal: { color: 'blue', text: '💙 PayPal' },
            Cash: { color: 'green', text: '💵 Tiền mặt' },
        };
        const config = methodConfig[method] || { color: 'default', text: method };
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const columns = [
        {
            title: 'Mã đơn',
            dataIndex: '_id',
            key: '_id',
            render: (id) => <span style={{ fontFamily: 'monospace' }}>{id.slice(-8)}</span>,
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            render: (price) => <strong>{price?.toLocaleString()} VND</strong>,
        },
        {
            title: 'Thanh toán',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            render: (method) => getPaymentMethodTag(method),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => getStatusTag(status),
        },
    ];

    const expandedRowRender = (order) => {
        const itemColumns = [
            {
                title: 'Món ăn',
                dataIndex: ['menuItem', 'name'],
                key: 'name',
            },
            {
                title: 'Số lượng',
                dataIndex: 'quantity',
                key: 'quantity',
            },
            {
                title: 'Đơn giá',
                dataIndex: 'price',
                key: 'price',
                render: (price) => `${price?.toLocaleString()} VND`,
            },
            {
                title: 'Thành tiền',
                key: 'total',
                render: (_, record) => (
                    <strong>{(record.price * record.quantity)?.toLocaleString()} VND</strong>
                ),
            },
        ];

        return (
            <Card size="small" style={{ marginBottom: 16 }}>
                <Descriptions bordered size="small" column={1}>
                    <Descriptions.Item label="Mã đơn hàng">{order._id}</Descriptions.Item>
                    <Descriptions.Item label="Phương thức thanh toán">
                        {getPaymentMethodTag(order.paymentMethod)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        {getStatusTag(order.status)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày đặt">
                        {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </Descriptions.Item>
                </Descriptions>
                <h4 style={{ marginTop: 16, marginBottom: 8 }}>Chi tiết món ăn:</h4>
                <Table
                    columns={itemColumns}
                    dataSource={order.orderItems}
                    pagination={false}
                    rowKey={(record) => record._id}
                    size="small"
                    scroll={{ x: 'max-content' }}
                />
            </Card>
        );
    };

    if (loading) {
        return (
            <div className="my-orders-loading">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="my-orders-screen">
            <MobileBackButton to="/menu" label="Quay về Menu" />
            
            <div className="my-orders-content">
                <h2 className="my-orders-title">Đơn Hàng Của Tôi</h2>

                {error && (
                    <Alert
                        message="Lỗi"
                        description={error}
                        type="error"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                )}

                {orders.length === 0 ? (
                    <Card>
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <p style={{ fontSize: 16, color: '#8c8c8c' }}>
                                Bạn chưa có đơn hàng nào
                            </p>
                        </div>
                    </Card>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={orders}
                        rowKey={(record) => record._id}
                        expandable={{
                            expandedRowRender,
                            expandRowByClick: true,
                        }}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng ${total} đơn hàng`,
                        }}
                        scroll={{ x: 'max-content' }}
                    />
                )}
            </div>
        </div>
    );
}

export default MyOrders;
