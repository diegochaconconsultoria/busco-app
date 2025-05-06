import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import ShoppingListsPage from './pages/ShoppingListsPage';
import ShoppingListDetailsPage from './pages/ShoppingListDetailsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';
//import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import PremiumRoute from './components/PremiumRoute';
import UpgradePage from './pages/UpgradePage';
//import { AnimatePresence } from 'framer-motion';
//import PageTransition from './components/PageTransition';
import { NotificationProvider } from './contexts/NotificationContext';
import { CityProvider } from './contexts/CityContext';

// No arquivo src/App.js, atualize a criação do tema:

const theme = createTheme({
  palette: {
    primary: {
      main: '#b51f19',
      light: '#d44944',
      dark: '#8c0000',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#424242',
      light: '#6d6d6d',
      dark: '#1b1b1b',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
        containedPrimary: {
          boxShadow: '0px 4px 8px rgba(181, 31, 25, 0.25)',
          '&:hover': {
            boxShadow: '0px 6px 12px rgba(181, 31, 25, 0.35)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
    
        <NotificationProvider>
        <CityProvider>
          <Router>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100vh'
            }}>
              <Header />
              <main style={{ flex: 1, padding: '20px 0' }}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/products/:id" element={<ProductDetailsPage />} />
                  <Route path="/upgrade" element={<UpgradePage />} />

                  <Route
                    path="/shopping-lists"
                    element={
                      <PremiumRoute>
                        <ShoppingListsPage />
                      </PremiumRoute>
                    }
                  />
                  <Route
                    path="/shopping-lists/:id"
                    element={
                      <PremiumRoute>
                        <ShoppingListDetailsPage />
                      </PremiumRoute>
                    }
                  />

                  <Route
                    path="/admin/*"
                    element={
                      <AdminRoute>
                        <AdminDashboardPage />
                      </AdminRoute>
                    }
                  />

                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
          </CityProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;