import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Result, Button, Spin } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import '../CSS/PaymentSuccess.css';

function PaymentSuccess({ clearCart }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        // Clear cart after successful payment
        if (sessionId) {
            clearCart();
            setLoading(false);
        } else {
            // No session ID, redirect to home
            navigate('/');
        }
    }, [sessionId, clearCart, navigate]);

    const handleViewOrders = () => {
        navigate('/myorders');
    };

    const handleBackToMenu = () => {
        navigate('/');
    };

    if (loading) {
        return (
            <div className="payment-success-screen">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="payment-success-screen">
            <Result
                icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                status="success"
                title="Thanh toán thành công!"
                subTitle="Đơn hàng của bạn đã được xử lý. Cảm ơn bạn đã đặt hàng!"
                extra={[
                    <Button type="primary" key="orders" onClick={handleViewOrders}>
                        Xem đơn hàng
                    </Button>,
                    <Button key="menu" onClick={handleBackToMenu}>
                        Quay lại menu
                    </Button>,
                ]}
            />
        </div>
    );
}

export default PaymentSuccess;
