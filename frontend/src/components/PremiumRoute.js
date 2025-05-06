import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const PremiumRoute = ({ children }) => {
  const { currentUser, isPremium, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!currentUser || !isPremium()) {
    return <Navigate to="/upgrade" />;
  }

  return children;
};

export default PremiumRoute;