import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import '../../CSS/OAuthButtons.css';

const OAuthButtons = () => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    const handleGoogleLogin = () => {
        window.location.href = `${API_URL}/api/auth/google`;
    };

    const handleFacebookLogin = () => {
        window.location.href = `${API_URL}/api/auth/facebook`;
    };

    return (
        <div className="oauth-container">
            <div className="oauth-divider">
                <span>hoặc tiếp tục với</span>
            </div>

            <div className="oauth-buttons">
                <button
                    className="oauth-button google-button"
                    onClick={handleGoogleLogin}
                    type="button"
                >
                    <FcGoogle className="oauth-icon" />
                    <span>Google</span>
                </button>

                <button
                    className="oauth-button facebook-button"
                    onClick={handleFacebookLogin}
                    type="button"
                >
                    <FaFacebook className="oauth-icon" />
                    <span>Facebook</span>
                </button>
            </div>
        </div>
    );
};

export default OAuthButtons;
