import React, { useState } from 'react';
import axios from 'axios';
import { Form, Input, Button, Alert } from 'antd';
import { useNavigate, Link } from 'react-router-dom'; // Added Link import
import '../CSS/LoginScreen.css'; // Import the CSS file

function LoginScreen() {
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            const { data } = await axios.post('http://localhost:5000/api/users/login', values);
            localStorage.setItem('currentUser', JSON.stringify(data));

            // Dispatch custom event to notify App.js
            window.dispatchEvent(new Event('userChanged'));

            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h2>Đăng Nhập</h2>
                {error && <Alert className="alert-error" message="Lỗi" description={error} type="error" showIcon />}
                <Form onFinish={onFinish} layout="vertical">
                    <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Vui lòng nhập email' }]}>
                        <Input placeholder="Email" />
                    </Form.Item>
                    <Form.Item name="password" label="Mật Khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
                        <Input.Password placeholder="Mật khẩu" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Đăng Nhập
                        </Button>
                    </Form.Item>
                </Form>
                <div className="register-link">
                    Bạn chưa có tài khoản? <Link to="/register">Đăng Ký</Link>
                </div>
            </div>
        </div>
    );
}

export default LoginScreen;