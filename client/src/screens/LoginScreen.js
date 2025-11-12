import React, { useState } from 'react';
import axiosInstance from '../components/axiosInstance';
import { Form, Input, Button, Alert } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import useThemeColor from '../utils/useThemeColor';
import '../CSS/LoginScreen.css';

function LoginScreen() {
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Set theme color to orange gradient for login page
    useThemeColor('#fda085');

    const onFinish = async (values) => {
        try {
            const { data } = await axiosInstance.post('/users/login', values);
            localStorage.setItem('currentUser', JSON.stringify(data));

            // Dispatch custom event to notify App.js
            window.dispatchEvent(new Event('userChanged'));

            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="landing-wrapper login-page">
            <div className="hero">
                <div className="brand">
                    <img src={process.env.PUBLIC_URL + '/logo192.png'} alt="Cảnh Quan" className="brand-logo" />
                    <h1 className="brand-title">Chào mừng đến với Cảnh Quan</h1>
                    <p className="brand-subtitle">Quán ăn của mọi nhà — đặt món, đặt bàn, tận hưởng.</p>
                    <Link to="/register" className="cta-ghost">Tạo tài khoản mới</Link>
                </div>
            </div>

            <div className="form-panel">
                <div className="form-card">
                    <img src={process.env.PUBLIC_URL + '/logo192.png'} alt="Cảnh Quan" className="mobile-logo" />
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
        </div>
    );
}

export default LoginScreen;