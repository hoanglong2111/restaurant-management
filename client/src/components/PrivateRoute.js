// client/src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, isAdmin }) => {
    const user = JSON.parse(localStorage.getItem('currentUser'));

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (isAdmin && !user.isAdmin ) {
        return <Navigate to="/" />;
    }

    return children;
};

export default PrivateRoute;