import React, { useContext, useState } from 'react';
import { 
  AppBar, Toolbar, Button, Box, Container, 
  Menu, MenuItem, IconButton, useMediaQuery, useTheme, Avatar,
  Select, FormControl, InputLabel
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LocationOnIcon from '@mui/icons-material/LocationOn';
// Importe a logo
import logo from '../assets/images/logo.png'; // Ajuste o caminho conforme necessário

const Header = () => {
  const { currentUser, logout, isPremium, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const [city, setCity] = useState('jau');
  
  // Lista de cidades disponíveis (inicialmente só Jaú)
  const cities = [
    { id: 'jau', name: 'Jaú' },
    // Para expansão futura:
    { id: 'bauru', name: 'Bauru' },
    { id: 'botucatu', name: 'Botucatu' },
  ];
  
  // Verificar se estamos na página de login ou registro
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  
  const handleCityChange = (event) => {
    setCity(event.target.value);
    // Aqui você pode adicionar lógica para mudar o contexto da aplicação
    // baseado na cidade selecionada
  };
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };
  
  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
    handleMobileMenuClose();
  };

  return (
    <AppBar position="static" sx={{ 
      boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
      backgroundColor: 'white',
      color: theme.palette.primary.main
    }}>
      <Container>
        <Toolbar sx={{ py: 1, display: 'flex', justifyContent: 'space-between' }}>
          {/* Logo e nome do app */}
          <Box 
            component={Link} 
            to="/" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              textDecoration: 'none'
            }}
          >
            <img 
              src={logo} 
              alt="Buscô Logo" 
              style={{ 
                height: '50px', 
                marginRight: '10px' 
              }} 
            />
          </Box>
          
          {/* Seletor de cidade - apenas visível quando logado */}
          {currentUser && !isAuthPage && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              mx: isMobile ? 1 : 2,
              flexGrow: 0
            }}>
              <LocationOnIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              <FormControl variant="standard" size="small">
                <Select
                  value={city}
                  onChange={handleCityChange}
                  sx={{ 
                    minWidth: 100,
                    '& .MuiSelect-select': {
                      py: 0.5
                    }
                  }}
                  disableUnderline
                >
                  {cities.map((city) => (
                    <MenuItem key={city.id} value={city.id}>
                      {city.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
          
          {/* Menu de navegação */}
          {isMobile ? (
            <>
              <IconButton 
                color="inherit" 
                onClick={handleMobileMenuOpen}
                aria-label="menu"
              >
                <MenuIcon />
              </IconButton>
              
              <Menu
                anchorEl={mobileMenuAnchor}
                open={Boolean(mobileMenuAnchor)}
                onClose={handleMobileMenuClose}
                sx={{ mt: 1 }}
              >
                {/* Opção Consultar Preços apenas se logado */}
                {currentUser && !isAuthPage && (
                  <MenuItem component={Link} to="/products" onClick={handleMobileMenuClose}>
                    Consultar Preços
                  </MenuItem>
                )}
                
                {isPremium && isPremium() && !isAuthPage && (
                  <MenuItem component={Link} to="/shopping-lists" onClick={handleMobileMenuClose}>
                    Minhas Listas
                  </MenuItem>
                )}
                
                {isAdmin && isAdmin() && !isAuthPage && (
                  <MenuItem component={Link} to="/admin" onClick={handleMobileMenuClose}>
                    Admin
                  </MenuItem>
                )}
                
                {currentUser ? (
                  <>
                    <MenuItem component={Link} to="/profile" onClick={handleMobileMenuClose}>
                      Meu Perfil
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      Sair
                    </MenuItem>
                  </>
                ) : (
                  <>
                    <MenuItem component={Link} to="/login" onClick={handleMobileMenuClose}>
                      Login
                    </MenuItem>
                    <MenuItem component={Link} to="/register" onClick={handleMobileMenuClose}>
                      Cadastrar
                    </MenuItem>
                  </>
                )}
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* Opção Consultar Preços apenas se logado */}
              {currentUser && !isAuthPage && (
                <Button 
                  color="primary" 
                  component={Link} 
                  to="/products"
                  sx={{ fontWeight: 500 }}
                >
                  Consultar Preços
                </Button>
              )}
              
              {isPremium && isPremium() && !isAuthPage && (
                <Button 
                  color="primary" 
                  component={Link} 
                  to="/shopping-lists"
                  sx={{ fontWeight: 500 }}
                >
                  Minhas Listas
                </Button>
              )}
              
              {isAdmin && isAdmin() && !isAuthPage && (
                <Button 
                  color="primary" 
                  component={Link} 
                  to="/admin"
                  sx={{ fontWeight: 500 }}
                >
                  Admin
                </Button>
              )}
              
              {currentUser ? (
                <>
                  <Button 
                    color="primary" 
                    onClick={handleMenuOpen}
                    endIcon={<ArrowDropDownIcon />}
                    startIcon={
                      <Avatar 
                        sx={{ 
                          width: 24, 
                          height: 24,
                          bgcolor: theme.palette.primary.main,
                          color: 'white',
                          fontSize: 14
                        }}
                      >
                        {currentUser.name.charAt(0).toUpperCase()}
                      </Avatar>
                    }
                  >
                    {currentUser.name}
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    sx={{ mt: 1 }}
                  >
                    <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
                      Meu Perfil
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      Sair
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button 
                    color="primary" 
                    component={Link} 
                    to="/login"
                    sx={{ fontWeight: 500 }}
                  >
                    Login
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    component={Link} 
                    to="/register"
                    sx={{ 
                      fontWeight: 500,
                      color: 'white'
                    }}
                  >
                    Cadastrar
                  </Button>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;