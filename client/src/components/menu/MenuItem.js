// src/components/menu/MenuItem.js
import React from 'react';
import { Card, Button } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';

/**
 * MenuItem component renders a single menu card.
 * Props:
 *  - item: menu item object containing _id, name, description, price, imageUrls
 *  - onAddToCart: function to call when user adds the item to cart
 */
const MenuItem = ({ item, onAddToCart }) => {
    const handleAdd = () => {
        if (onAddToCart) onAddToCart(item);
    };

    return (
        <Card
            hoverable
            className="menu-card"
            cover={
                item.imageUrls && item.imageUrls.length > 0 ? (
                    <img alt={item.name} src={item.imageUrls[0]} className="menu-image" />
                ) : (
                    <div className="menu-image menu-image-placeholder">
                        <span className="placeholder-icon">🍽️</span>
                    </div>
                )
            }
        >
            <Card.Meta title={item.name} description={item.description} />
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="price">${item.price?.toFixed(2)}</span>
                <Button type="primary" icon={<ShoppingCartOutlined />} onClick={handleAdd}>
                    Add
                </Button>
            </div>
        </Card>
    );
};

export default MenuItem;
