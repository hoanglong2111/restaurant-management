// client/src/screens/CartScreen.js
import React, { useState } from 'react';
import { Button, Modal, Alert } from 'antd';
import { FaCcVisa, FaCcMastercard } from 'react-icons/fa';
import StripeCheckout from 'react-stripe-checkout';
import { PayPalButtons } from '@paypal/react-paypal-js';
import axiosInstance from '../components/axiosInstance';
import MobileBackButton from '../components/MobileBackButton';
import '../CSS/CartScreen.css';

function CartScreen({ cart, removeFromCart, clearCart }) {
    const [loading, setLoading] = useState(false);
    const [error] = useState('');

    const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const totalUSD = (totalPrice / 25000).toFixed(2); // Convert VND to USD (1 USD ≈ 25,000 VND)

    const handleToken = async (token) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/orders/stripe', {
                token,
                amount: totalPrice * 10 , // Convert to smallest currency unit
                orderItems: cart.map(item => ({
                    menuItem: item._id,    // Reference to MenuItem's _id
                    quantity: item.quantity,
                    price: item.price
                })),
            });
            if (response.data.success) {
                clearCart();
                Modal.success({
                    title: 'Thanh Toán Thành Công',
                    content: 'Giao dịch của bạn đã được xử lý thành công.',
                });
            } else {
                Modal.error({
                    title: 'Thanh Toán Thất Bại',
                    content: response.data.message || 'Có lỗi xảy ra trong quá trình thanh toán.',
                });
            }
        } catch (err) {
            Modal.error({
                title: 'Thanh Toán Thất Bại',
                content: err.response?.data?.message || 'Có lỗi xảy ra trong quá trình thanh toán.',
            });
        }
        setLoading(false);
    };

    const handleCheckout = () => {
        // StripeCheckout handles the checkout process
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
        try {
            const details = await actions.order.capture();
            
            // Send order to backend
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

            if (response.data.success) {
                clearCart();
                Modal.success({
                    title: 'Thanh Toán Thành Công',
                    content: 'Giao dịch PayPal của bạn đã được xử lý thành công.',
                });
            }
        } catch (err) {
            Modal.error({
                title: 'Thanh Toán Thất Bại',
                content: err.response?.data?.message || 'Có lỗi xảy ra',
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
                                <div className="cart-item-info">
                                    <span className="cart-item-name">{item.name}</span>
                                    <span className="cart-item-quantity">x {item.quantity}</span>
                                </div>
                                <div className="cart-item-actions">
                                    <span className="cart-item-price">{(item.price * item.quantity).toLocaleString()} VND</span>
                                    <Button type="link" danger onClick={() => removeFromCart(item._id)}>Xóa</Button>
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
                            <FaCcVisa style={{ fontSize: '32px', marginRight: '10px' }} />
                            <FaCcMastercard style={{ fontSize: '32px', marginRight: '10px' }} />
                        </div>

                        {error && <Alert message="Lỗi" description={error} type="error" showIcon style={{ marginBottom: 16 }} />}

                        <div className="payment-buttons">
                            <StripeCheckout
                                stripeKey="pk_test_51PzSctJezifUlBdf2XqkntE5CDvInoO2LOMfbqJnM1lp84btQUPsiC4ojf2WJHJKGhZKCz1thwHMn3BQceOYz3kr00CmHIYBWW"
                                token={handleToken}
                                amount={totalPrice * 10}
                                name="Thanh Toán Giỏ Hàng"
                            >
                                <Button type="primary" loading={loading} onClick={handleCheckout} className="checkout-button">
                                    💳 Stripe
                                </Button>
                            </StripeCheckout>

                            <div className="paypal-button-container">
                                <PayPalButtons
                                    style={{ layout: "vertical", color: "blue", shape: "rect", label: "pay" }}
                                    createOrder={createPayPalOrder}
                                    onApprove={onPayPalApprove}
                                    onError={onPayPalError}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default CartScreen;