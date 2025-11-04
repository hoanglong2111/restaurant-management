import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Button, Card, Tabs, Alert, Table, Tag } from 'antd';
import { UserOutlined, LockOutlined, HistoryOutlined, EditOutlined } from '@ant-design/icons';
import axiosInstance from '../components/axiosInstance';
import MobileBackButton from '../components/MobileBackButton';
import '../CSS/ProfileScreen.css';

const { TabPane } = Tabs;

function ProfileScreen() {
    const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('currentUser')) || {});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [reservations, setReservations] = useState([]);
    const [orders, setOrders] = useState([]);

    const [profileForm] = Form.useForm();
    const [passwordForm] = Form.useForm();

    const fetchUserData = useCallback(() => {
        profileForm.setFieldsValue({
            name: currentUser.name,
            email: currentUser.email,
        });
    }, [profileForm, currentUser.name, currentUser.email]);

    const fetchReservations = useCallback(async () => {
        try {
            const { data } = await axiosInstance.get('/reservations/my');
            setReservations(data);
        } catch (err) {
            console.error('Error fetching reservations:', err);
        }
    }, []);

    const fetchOrders = useCallback(async () => {
        try {
            const { data } = await axiosInstance.get('/orders/myorders');
            setOrders(data);
        } catch (err) {
            console.error('Error fetching orders:', err);
        }
    }, []);

    useEffect(() => {
        fetchUserData();
        fetchReservations();
        fetchOrders();
    }, [fetchUserData, fetchReservations, fetchOrders]);

    const handleUpdateProfile = async (values) => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const { data } = await axiosInstance.put('/users/profile', {
                name: values.name,
                email: values.email,
            });

            // Update localStorage
            const updatedUser = { ...currentUser, name: data.name, email: data.email };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            setCurrentUser(updatedUser);

            setSuccess('Cập nhật thông tin thành công!');
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Cập nhật thất bại');
            setLoading(false);
        }
    };

    const handleChangePassword = async (values) => {
        if (values.newPassword !== values.confirmPassword) {
            setError('Mật khẩu mới không khớp');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await axiosInstance.put('/users/password', {
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            });

            setSuccess('Đổi mật khẩu thành công!');
            passwordForm.resetFields();
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Đổi mật khẩu thất bại');
            setLoading(false);
        }
    };

    const reservationColumns = [
        {
            title: 'Ngày Đặt',
            dataIndex: 'reservationDate',
            key: 'reservationDate',
            render: (date) => new Date(date).toLocaleString('vi-VN'),
        },
        {
            title: 'Số Người',
            dataIndex: 'numberOfGuests',
            key: 'numberOfGuests',
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const colors = {
                    pending: 'orange',
                    confirmed: 'green',
                    completed: 'blue',
                    cancelled: 'red',
                };
                const labels = {
                    pending: 'Chờ xác nhận',
                    confirmed: 'Đã xác nhận',
                    completed: 'Hoàn thành',
                    cancelled: 'Đã hủy',
                };
                return <Tag color={colors[status]}>{labels[status]}</Tag>;
            },
        },
    ];

    const orderColumns = [
        {
            title: 'Ngày Đặt',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleString('vi-VN'),
        },
        {
            title: 'Tổng Tiền',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            render: (price) => `${price.toLocaleString()} VND`,
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'isPaid',
            key: 'isPaid',
            render: (isPaid) => (
                <Tag color={isPaid ? 'green' : 'orange'}>
                    {isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </Tag>
            ),
        },
    ];

    return (
        <div className="profile-container">
            <div className="profile-content">
                <h1 className="profile-title">Hồ Sơ Cá Nhân</h1>

                {error && <Alert message="Lỗi" description={error} type="error" showIcon closable onClose={() => setError('')} style={{ marginBottom: 16 }} />}
                {success && <Alert message="Thành công" description={success} type="success" showIcon closable onClose={() => setSuccess('')} style={{ marginBottom: 16 }} />}

                <MobileBackButton to="/menu" label="Quay về Menu" />

                <Tabs defaultActiveKey="1" className="profile-tabs">
                    <TabPane
                        tab={
                            <span>
                                <UserOutlined />
                                Thông Tin
                            </span>
                        }
                        key="1"
                    >
                        <Card className="profile-card">
                            <Form
                                form={profileForm}
                                layout="vertical"
                                onFinish={handleUpdateProfile}
                            >
                                <Form.Item
                                    name="name"
                                    label="Tên"
                                    rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                                >
                                    <Input prefix={<UserOutlined />} placeholder="Tên của bạn" size="large" />
                                </Form.Item>

                                <Form.Item
                                    name="email"
                                    label="Email"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập email' },
                                        { type: 'email', message: 'Email không hợp lệ' },
                                    ]}
                                >
                                    <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
                                </Form.Item>

                                <Form.Item>
                                    <Button type="primary" htmlType="submit" loading={loading} icon={<EditOutlined />} size="large" block>
                                        Cập Nhật Thông Tin
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Card>
                    </TabPane>

                    <TabPane
                        tab={
                            <span>
                                <LockOutlined />
                                Đổi Mật Khẩu
                            </span>
                        }
                        key="2"
                    >
                        <Card className="profile-card">
                            <Form
                                form={passwordForm}
                                layout="vertical"
                                onFinish={handleChangePassword}
                            >
                                <Form.Item
                                    name="currentPassword"
                                    label="Mật Khẩu Hiện Tại"
                                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
                                >
                                    <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu hiện tại" size="large" />
                                </Form.Item>

                                <Form.Item
                                    name="newPassword"
                                    label="Mật Khẩu Mới"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                                        { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
                                    ]}
                                >
                                    <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu mới" size="large" />
                                </Form.Item>

                                <Form.Item
                                    name="confirmPassword"
                                    label="Xác Nhận Mật Khẩu Mới"
                                    rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu mới' }]}
                                >
                                    <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu mới" size="large" />
                                </Form.Item>

                                <Form.Item>
                                    <Button type="primary" htmlType="submit" loading={loading} icon={<LockOutlined />} size="large" block>
                                        Đổi Mật Khẩu
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Card>
                    </TabPane>

                    <TabPane
                        tab={
                            <span>
                                <HistoryOutlined />
                                Lịch Sử
                            </span>
                        }
                        key="3"
                    >
                        <Card className="profile-card" title="Lịch Sử Đặt Chỗ">
                            <Table
                                dataSource={reservations}
                                columns={reservationColumns}
                                rowKey="_id"
                                pagination={{ pageSize: 5 }}
                            />
                        </Card>

                        <Card className="profile-card" title="Lịch Sử Đơn Hàng" style={{ marginTop: 16 }}>
                            <Table
                                dataSource={orders}
                                columns={orderColumns}
                                rowKey="_id"
                                pagination={{ pageSize: 5 }}
                            />
                        </Card>
                    </TabPane>
                </Tabs>
            </div>
        </div>
    );
}

export default ProfileScreen;

