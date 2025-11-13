// client/src/screens/CartScreen.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, Alert, InputNumber, message } from 'antd';
import { FaCcVisa, FaCcMastercard, FaMoneyBillWave, FaCcStripe, FaCcPaypal } from 'react-icons/fa';
import { PlusOutlined, MinusOutlined, QrcodeOutlined } from '@ant-design/icons';
import { PayPalButtons } from '@paypal/react-paypal-js';
import axiosInstance from '../components/axiosInstance';
import MobileBackButton from '../components/MobileBackButton';
import '../CSS/CartScreen.css';

function CartScreen({ cart, removeFromCart, updateQuantity, clearCart }) {
    const [loading, setLoading] = useState(false);
    const [error] = useState('');
    const navigate = useNavigate();

    const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const totalUSD = (totalPrice / 25000).toFixed(2); // Convert VND to USD (1 USD ≈ 25,000 VND)

    // Stripe handler (New Checkout)
    const handleStripeCheckout = async () => {
        setLoading(true);
        try {
            console.log('=== Stripe Checkout Started ===');
            console.log('Cart items:', cart);
            console.log('Total price:', totalPrice);
            
            // Create checkout session
            const response = await axiosInstance.post('/orders/stripe-checkout', {
                orderItems: cart.map(item => ({
                    menuItem: item._id,
                    quantity: item.quantity,
                    price: item.price,
                    name: item.name
                })),
                totalPrice: totalPrice,
            });

            console.log('Backend response:', response.data);

            if (response.data.success && response.data.checkoutUrl) {
                console.log('Redirecting to Stripe Checkout:', response.data.checkoutUrl);
                // Redirect directly using window.location (new method)
                window.location.href = response.data.checkoutUrl;
            } else {
                console.error('Invalid response:', response.data);
                message.error({
                    content: response.data.message || 'Không thể tạo phiên thanh toán',
                    duration: 3,
                });
                setLoading(false);
            }
        } catch (err) {
            console.error('=== Stripe Checkout Error ===', err);
            console.error('Error response:', err.response?.data);
            message.error({
                content: err.response?.data?.message || 'Có lỗi xảy ra',
                duration: 3,
            });
            setLoading(false);
        }
    };

    // PayPal handlers
    const createPayPalOrder = (data, actions) => {
        return actions.order.create({
            purchase_units: [{
                amount: {
                    currency_code: "USD",
                    value: totalUSD,
                },
                description: "Restaurant Order Payment",
            }],
        });
    };

    const onPayPalApprove = async (data, actions) => {
        console.log('=== PayPal Approve Started ===');
        console.log('Order ID:', data.orderID);
        
        try {
            const details = await actions.order.capture();
            console.log('=== Payment Details ===', details);
            
            // Send order to backend
            console.log('Sending to backend:', {
                orderID: details.id,
                totalPrice: totalPrice,
                itemCount: cart.length
            });
            
            const response = await axiosInstance.post('/orders/paypal', {
                orderID: details.id,
                paymentDetails: details,
                orderItems: cart.map(item => ({
                    menuItem: item._id,
                    quantity: item.quantity,
                    price: item.price
                })),
                totalPrice: totalPrice,
            });

            console.log('Backend response:', response.data);

            if (response.data.success) {
                clearCart();
                message.success({
                    content: 'Thanh toán PayPal thành công! Đơn hàng đang được xử lý.',
                    duration: 3,
                });
                setTimeout(() => {
                    navigate('/my-orders');
                }, 1500);
            } else {
                message.error({
                    content: response.data.message || 'Thanh toán thất bại',
                    duration: 3,
                });
            }
        } catch (err) {
            console.error('=== PayPal Error ===', err);
            console.error('Error response:', err.response?.data);
            message.error({
                content: err.response?.data?.message || 'Có lỗi xảy ra trong quá trình thanh toán',
                duration: 3,
            });
        }
    };

    const onPayPalError = (err) => {
        Modal.error({
            title: 'Lỗi PayPal',
            content: 'Có lỗi xảy ra trong quá trình thanh toán.',
        });
        console.error('PayPal Error:', err);
    };

    // Cash on Delivery handler
    const handleCashOnDelivery = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/orders/cod', {
                orderItems: cart.map(item => ({
                    menuItem: item._id,
                    quantity: item.quantity,
                    price: item.price
                })),
                totalPrice: totalPrice,
            });

            if (response.data.success) {
                clearCart();
                message.success({
                    content: 'Đơn hàng đã được tạo thành công! Vui lòng chuẩn bị tiền mặt khi nhận hàng.',
                    duration: 3,
                });
                setTimeout(() => {
                    navigate('/my-orders');
                }, 1500);
            } else {
                message.error({
                    content: response.data.message || 'Đặt hàng thất bại',
                    duration: 3,
                });
            }
        } catch (err) {
            message.error({
                content: err.response?.data?.message || 'Có lỗi xảy ra',
                duration: 3,
            });
        }
        setLoading(false);
    };

    // VietQR handler
    const handleVietQR = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/orders/vietqr', {
                orderItems: cart.map(item => ({
                    menuItem: item._id,
                    quantity: item.quantity,
                    price: item.price
                })),
                totalPrice: totalPrice,
            });

            if (response.data.success) {
                // Hiển thị modal với QR code
                Modal.info({
                    title: 'Quét mã QR để thanh toán',
                    width: 500,
                    content: (
                        <div style={{ textAlign: 'center' }}>
                            <img 
                                src={response.data.qrUrl} 
                                alt="VietQR" 
                                style={{ width: '100%', maxWidth: '400px', margin: '20px 0' }}
                            />
                            <div style={{ marginTop: '15px', textAlign: 'left', backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
                                <p style={{ marginBottom: '8px' }}><strong>Số tiền:</strong> {response.data.paymentInfo.amount.toLocaleString()} VNĐ</p>
                                <p style={{ marginBottom: '8px' }}><strong>Nội dung CK:</strong> {response.data.paymentInfo.description}</p>
                                <p style={{ marginBottom: '8px' }}><strong>Ngân hàng:</strong> {response.data.paymentInfo.accountName}</p>
                                <p style={{ color: '#ff4d4f', marginTop: '15px', marginBottom: '0', fontWeight: '500' }}>
                                    ⚠️ Vui lòng chuyển khoản ĐÚNG nội dung để đơn hàng được xử lý nhanh
                                </p>
                            </div>
                        </div>
                    ),
                    onOk: () => {
                        clearCart();
                        navigate('/my-orders');
                    },
                    okText: 'Đã chuyển khoản',
                    cancelText: 'Hủy',
                });
            } else {
                message.error({
                    content: response.data.message || 'Không thể tạo mã QR',
                    duration: 3,
                });
            }
        } catch (err) {
            message.error({
                content: err.response?.data?.message || 'Có lỗi xảy ra',
                duration: 3,
            });
        }
        setLoading(false);
    };

    return (
        <div className="cart-screen">
            <MobileBackButton to="/menu" label="Quay về Menu" />

            <div className="cart-content">
                <h2 className="cart-title">Giỏ Hàng</h2>

                <div className="cart-items">
                    {cart.length === 0 ? (
                        <div className="cart-empty">
                            <p>Giỏ hàng trống</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item._id} className="cart-item">
                                <div className="cart-item-content">
                                    <div className="cart-item-image">
                                        {item.imageUrls && item.imageUrls.length > 0 ? (
                                            <img src={item.imageUrls[0]} alt={item.name} />
                                        ) : (
                                            <div className="cart-item-image-placeholder">
                                                <span>Không có ảnh</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="cart-item-details">
                                        <div className="cart-item-info">
                                            <span className="cart-item-name">{item.name}</span>
                                            <div className="cart-item-quantity-controls">
                                                <Button
                                                    type="default"
                                                    size="small"
                                                    icon={<MinusOutlined />}
                                                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                />
                                                <InputNumber
                                                    min={1}
                                                    max={99}
                                                    value={item.quantity}
                                                    onChange={(value) => updateQuantity(item._id, value || 1)}
                                                    style={{ width: '60px', margin: '0 8px' }}
                                                />
                                                <Button
                                                    type="default"
                                                    size="small"
                                                    icon={<PlusOutlined />}
                                                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                />
                                            </div>
                                        </div>
                                        <div className="cart-item-actions">
                                            <span className="cart-item-price">{(item.price * item.quantity).toLocaleString()} VND</span>
                                            <Button type="link" danger onClick={() => removeFromCart(item._id)}>Xóa</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <>
                        <div className="cart-total">
                            <h3>Tổng Cộng: {totalPrice.toLocaleString()} VND</h3>
                        </div>

                        <div className="credit-payment-methods">
                            <FaCcVisa style={{ fontSize: '32px', marginRight: '10px', color: '#1A1F71' }} />
                            <FaCcMastercard style={{ fontSize: '32px', marginRight: '10px', color: '#EB001B' }} />
                            <FaCcStripe style={{ fontSize: '32px', marginRight: '10px', color: '#635BFF' }} />
                            <FaCcPaypal style={{ fontSize: '32px', marginRight: '10px', color: '#003087' }} />
                            <QrcodeOutlined style={{ fontSize: '32px', marginRight: '10px', color: '#00A8E8' }} />
                        </div>

                        {error && <Alert message="Lỗi" description={error} type="error" showIcon style={{ marginBottom: 16 }} />}

                        <div className="payment-buttons">
                            {/* 1. Stripe */}
                            <Button 
                                type="primary" 
                                loading={loading} 
                                onClick={handleStripeCheckout} 
                                className="stripe-button"
                                style={{
                                    width: '100%',
                                    height: '45px',
                                    background: '#635BFF',
                                    borderColor: '#635BFF',
                                    marginBottom: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%' }}>
                                    <img 
                                        src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" 
                                        alt="Stripe" 
                                        style={{ height: '20px', objectFit: 'contain' }}
                                    />
                                </div>
                            </Button>

                            {/* 2. Cash on Delivery */}
                            <Button 
                                type="default" 
                                loading={loading} 
                                onClick={handleCashOnDelivery} 
                                className="cod-button"
                                style={{ 
                                    width: '100%', 
                                    height: '45px',
                                    fontSize: '16px',
                                    backgroundColor: '#52c41a',
                                    color: 'white',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <FaMoneyBillWave style={{ fontSize: '20px' }} />
                                Thanh Toán Khi Nhận Hàng
                            </Button>

                            {/* 3. PayPal - Debit or Credit Card */}
                            <div className="paypal-button-container">
                                <PayPalButtons
                                    style={{ 
                                        layout: "vertical", 
                                        color: "gold", 
                                        shape: "rect", 
                                        label: "paypal",
                                        height: 45
                                    }}
                                    createOrder={createPayPalOrder}
                                    onApprove={onPayPalApprove}
                                    onError={onPayPalError}
                                    forceReRender={[totalUSD]}
                                />
                            </div>

                            {/* 4. VietQR - QR Code Payment */}
                            <Button 
                                onClick={handleVietQR} 
                                className="vietqr-button"
                                icon={<QrcodeOutlined />}
                                style={{
                                    width: '100%',
                                    height: '45px',
                                    background: 'linear-gradient(to right, #00A651, #00C853)',
                                    borderColor: '#00A651',
                                    color: '#fff',
                                    fontWeight: 'bold',
                                    fontSize: '16px',
                                    marginTop: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                Thanh toán VietQR
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default CartScreen;