import React from 'react';
import { Box, Container, Typography, Link, Grid } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import logo from '../assets/images/logo.png';

const Footer = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 4, 
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[900],
        color: 'white'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <img 
                src={logo} 
                alt="Buscô Logo" 
                style={{ 
                  height: '32px', 
                  marginRight: '10px' 
                }} 
              />
              <Typography variant="h6" fontWeight="bold">
               
              </Typography>
            </Box>
            <Typography variant="body2" color="rgba(255,255,255,0.7)">
              Compare preços, economize tempo e dinheiro
              nas suas compras de supermercado.
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              Links Úteis
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link color="rgba(255,255,255,0.7)" href="/" underline="hover">
                Home
              </Link>
              <Link color="rgba(255,255,255,0.7)" href="/products" underline="hover">
                Produtos
              </Link>
              <Link color="rgba(255,255,255,0.7)" href="/upgrade" underline="hover">
                Plano Premium
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              Contato
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.7)">
              Email: contato@busco.com.br
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.7)">
              Telefone: (14) 9999-9999
            </Typography>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
          <Typography variant="body2" color="rgba(255,255,255,0.7)">
            © {new Date().getFullYear()} Buscô - Todos os direitos reservados
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;