import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Spin } from 'antd';
import '../../CSS/OAuthCallback.css';

const OAuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refreshToken');

        if (token && refreshToken) {
            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);

            fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then(res => res.json())
                .then(data => {
                    localStorage.setItem('currentUser', JSON.stringify(data));
                    window.dispatchEvent(new Event('userChanged'));
                    navigate('/menu', { replace: true });
                })
                .catch(error => {
                    console.error('OAuth callback error:', error);
                    navigate('/login', { replace: true });
                });
        } else {
            navigate('/login', { replace: true });
        }
    }, [searchParams, navigate]);

    return (
        <div className="oauth-callback-container">
            <Spin size="large" />
            <p>Completing login...</p>
        </div>
    );
};

export default OAuthCallback;
