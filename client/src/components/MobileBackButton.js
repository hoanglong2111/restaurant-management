import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import '../CSS/MobileBackButton.css';

function MobileBackButton({ to = -1, label = 'Quay về' }) {
    const navigate = useNavigate();

    const handleBack = () => {
        if (typeof to === 'number') {
            navigate(to);
        } else {
            navigate(to);
        }
    };

    return (
        <Button 
            className="mobile-back-button"
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            size="large"
        >
            {label}
        </Button>
    );
}

export default MobileBackButton;

