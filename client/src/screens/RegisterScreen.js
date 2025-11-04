import React, { useState } from 'react';
import axiosInstance from '../components/axiosInstance';
import { Form, Input, Button, Alert } from 'antd';
import { useNavigate, Link } from 'react-router-dom'; // Added Link import
import '../CSS/RegisterScreen.css'; // Import the CSS file

function RegisterScreen() {
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const onFinish = async (values) => {
        if (values.password !== values.confirmPassword) {
            setError('Mật khẩu không khớp');
            return;
        }

        try {
            const { data } = await axiosInstance.post('users/register', {
                name: values.name,
                email: values.email,
                password: values.password,
            });
            localStorage.setItem('currentUser', JSON.stringify(data));
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng ký thất bại');
        }
    };

    return (
        <div className="register-container">
            <div className="register-form">
                <h2>Đăng Ký</h2>
                {error && <Alert className="alert-error" message="Lỗi" description={error} type="error" showIcon />}
                <Form onFinish={onFinish} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Tên"
                        rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                    >
                        <Input placeholder="Tên" />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email' },
                            { type: 'email', message: 'Email không hợp lệ' },
                        ]}
                    >
                        <Input placeholder="Email" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label="Mật Khẩu"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                    >
                        <Input.Password placeholder="Mật khẩu" />
                    </Form.Item>
                    <Form.Item
                        name="confirmPassword"
                        label="Xác Nhận Mật Khẩu"
                        rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu' }]}
                    >
                        <Input.Password placeholder="Xác nhận mật khẩu" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Đăng Ký
                        </Button>
                    </Form.Item>
                </Form>
                <div className="login-link">
                    Bạn đã có tài khoản? <Link to="/login">Đăng Nhập</Link>
                </div>
            </div>
        </div>
    );
}

export default RegisterScreen;