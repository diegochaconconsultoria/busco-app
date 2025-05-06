import React, { useState } from 'react';
import { 
  Container, Typography, Box, Tabs, Tab, 
  Paper, Divider
} from '@mui/material';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';

import AdminMarketsPage from './admin/AdminMarketsPage';
import AdminProductsPage from './admin/AdminProductsPage';
import AdminPricesPage from './admin/AdminPricesPage';
import AdminUsersPage from './admin/AdminUsersPage';

const AdminDashboardPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determinar a aba ativa com base na URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/admin/markets')) return 0;
    if (path.includes('/admin/products')) return 1;
    if (path.includes('/admin/prices')) return 2;
    if (path.includes('/admin/users')) return 3;
    return 0; // Default to markets
  };
  
  const [activeTab, setActiveTab] = useState(getActiveTab());
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    switch (newValue) {
      case 0: navigate('/admin/markets'); break;
      case 1: navigate('/admin/products'); break;
      case 2: navigate('/admin/prices'); break;
      case 3: navigate('/admin/users'); break;
      default: navigate('/admin/markets');
    }
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Painel de Administração
      </Typography>
      
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Supermercados" />
          <Tab label="Produtos" />
          <Tab label="Preços" />
          <Tab label="Usuários" />
        </Tabs>
      </Paper>
      
      <Box sx={{ py: 2 }}>
        <Routes>
          <Route path="/" element={<AdminMarketsPage />} />
          <Route path="/markets" element={<AdminMarketsPage />} />
          <Route path="/products" element={<AdminProductsPage />} />
          <Route path="/prices" element={<AdminPricesPage />} />
          <Route path="/users" element={<AdminUsersPage />} />
        </Routes>
      </Box>
    </Container>
  );
};

export default AdminDashboardPage;