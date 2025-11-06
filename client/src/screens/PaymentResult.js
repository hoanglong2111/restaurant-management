import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Result, Button, Spin, Card } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import '../CSS/PaymentResult.css';

function PaymentResult() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState(null);

    useEffect(() => {
        // Đọc query params
        const success = searchParams.get('success');
        const orderId = searchParams.get('orderId');
        const paymentId = searchParams.get('paymentId');
        const message = searchParams.get('message');
        const source = searchParams.get('source');

        setTimeout(() => {
            setPaymentStatus({
                success: success === 'true',
                orderId,
                paymentId,
                message,
                source,
            });
            setLoading(false);
        }, 1000);
    }, [searchParams]);

    if (loading) {
        return (
            <div className="payment-result-loading">
                <Spin size="large" tip="Đang xử lý kết quả thanh toán..." />
            </div>
        );
    }

    return (
        <div className="payment-result-container">
            <Card className="payment-result-card">
                {paymentStatus?.success ? (
                    <Result
                        status="success"
                        icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                        title="Thanh Toán Thành Công!"
                        subTitle={
                            <div className="payment-details">
                                <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
                                {paymentStatus.orderId && (
                                    <p>Mã đơn hàng: <strong>{paymentStatus.orderId}</strong></p>
                                )}
                                {paymentStatus.paymentId && (
                                    <p>Mã thanh toán: <strong>{paymentStatus.paymentId}</strong></p>
                                )}
                                <p>Đơn hàng của bạn đang được xử lý.</p>
                            </div>
                        }
                        extra={[
                            <Button type="primary" key="menu" onClick={() => navigate('/menu')}>
                                Về Menu
                            </Button>,
                            <Button key="orders" onClick={() => navigate('/profile')}>
                                Xem Đơn Hàng
                            </Button>,
                        ]}
                    />
                ) : (
                    <Result
                        status="error"
                        icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                        title="Thanh Toán Thất Bại"
                        subTitle={
                            <div className="payment-details">
                                <p>{paymentStatus?.message || 'Có lỗi xảy ra trong quá trình thanh toán.'}</p>
                                <p>Vui lòng thử lại hoặc liên hệ hỗ trợ.</p>
                            </div>
                        }
                        extra={[
                            <Button type="primary" key="retry" onClick={() => navigate('/cart')}>
                                Thử Lại
                            </Button>,
                            <Button key="menu" onClick={() => navigate('/menu')}>
                                Về Menu
                            </Button>,
                        ]}
                    />
                )}
            </Card>
        </div>
    );
}

export default PaymentResult;
