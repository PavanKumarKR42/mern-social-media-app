import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  const token = localStorage.getItem('token'); // Get token from storage

  return token ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;