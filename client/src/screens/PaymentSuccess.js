import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Result, Button, Spin, message } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import axiosInstance from '../components/axiosInstance';
import '../CSS/PaymentSuccess.css';

function PaymentSuccess({ clearCart }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const sessionId = searchParams.get('session_id');
    const orderId = searchParams.get('order_id');

    useEffect(() => {
        const confirmPayment = async () => {
            if (sessionId && orderId) {
                try {
                    // Confirm payment với backend
                    await axiosInstance.post('/orders/stripe-confirm', {
                        sessionId,
                        orderId
                    });
                    clearCart();
                    setLoading(false);
                } catch (error) {
                    console.error('Error confirming payment:', error);
                    message.error('Có lỗi xảy ra khi xác nhận thanh toán');
                    clearCart(); // Vẫn clear cart
                    setLoading(false);
                }
            } else {
                // No session ID, redirect to home
                navigate('/');
            }
        };

        confirmPayment();
    }, [sessionId, orderId, clearCart, navigate]);

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
