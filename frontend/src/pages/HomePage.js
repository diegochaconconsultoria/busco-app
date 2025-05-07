import React, { useContext } from 'react';
import { useTheme } from '@mui/material/styles';
import { Container, Typography, Button, Box, Grid, Paper, Card, CardContent, CardActions } from '@mui/material';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

// Componente de animação para a comparação de preços - versão mais moderna e compacta
const PriceComparisonAnimation = () => {
  const theme = useTheme();

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      gap: { xs: 2, md: 4 },
      my: 3,
      position: 'relative',
      mx: 'auto'
    }}>
      {/* Primeiro carrinho (mais caro) */}
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        animation: 'float 3s ease-in-out infinite',
        animationDelay: '0.5s',
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' }
        }
      }}>
        <ShoppingCartIcon sx={{ fontSize: 36, color: 'white', opacity: 0.8 }} />
        <Box sx={{ 
          backgroundColor: 'rgba(255,255,255,0.15)',
          px: 2,
          py: 0.5,
          borderRadius: 8,
          mt: 1
        }}>
          <Typography color="white" fontWeight="bold" fontSize="0.9rem">
            R$ 250,00
          </Typography>
        </Box>
      </Box>

      {/* Segundo carrinho (preço médio) */}
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        animation: 'float 3s ease-in-out infinite',
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' }
        }
      }}>
        <ShoppingCartIcon sx={{ fontSize: 36, color: 'white', opacity: 0.9 }} />
        <Box sx={{ 
          backgroundColor: 'rgba(255,255,255,0.2)',
          px: 2,
          py: 0.5,
          borderRadius: 8,
          mt: 1
        }}>
          <Typography color="white" fontWeight="bold" fontSize="0.9rem">
            R$ 210,00
          </Typography>
        </Box>
      </Box>

      {/* Terceiro carrinho (mais barato - destaque) */}
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        animation: 'float 3s ease-in-out infinite',
        animationDelay: '1s',
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' }
        }
      }}>
        <Box sx={{ position: 'relative' }}>
          <ShoppingCartIcon sx={{ fontSize: 36, color: 'white' }} />
          <LocalOfferIcon sx={{ 
            position: 'absolute',
            top: -8,
            right: -8,
            fontSize: 16,
            color: 'yellow',
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.2)' },
              '100%': { transform: 'scale(1)' }
            }
          }} />
        </Box>
        <Box sx={{ 
          backgroundColor: 'white',
          px: 2,
          py: 0.5,
          borderRadius: 8,
          mt: 1,
          color: theme.palette.primary.main
        }}>
          <Typography fontWeight="bold" fontSize="0.9rem">
            R$ 175,00
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

const HomePage = () => {
  const { currentUser, isPremium } = useContext(AuthContext);
  const theme = useTheme();

  return (
    <Container>
      {/* Hero Section */}
      <Box
        sx={{
          py: 5,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #b51f19 0%, #8c0000 100%)',
          color: 'white',
          borderRadius: 2,
          mb: 6,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Efeito de fundo com padrão sutil */}
        <Box 
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            opacity: 0.3
          }} 
        />

        <Typography variant="h2" component="h1" 
          sx={{ 
            fontWeight: 700, 
            mb: 1,
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          Buscô
        </Typography>
        
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 'medium', 
            mb: 2,
            maxWidth: '700px',
            mx: 'auto',
            lineHeight: 1.4
          }}
        >
          <strong>Compare preços dos supermercados em Jaú e economize em suas compras</strong>
        </Typography>

        <PriceComparisonAnimation />

        <Box sx={{ mt: 3 }}>
          {currentUser ? (
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/products"
              sx={{
                backgroundColor: 'white',
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
                px: 4,
                py: 1,
                borderRadius: 8,
                fontWeight: 600,
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
                }
              }}
            >
              Comparar Preços
            </Button>
          ) : (
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/register"
              sx={{
                backgroundColor: 'white',
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
                px: 4,
                py: 1,
                borderRadius: 8,
                fontWeight: 600,
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
                }
              }}
            >
              Cadastre-se Grátis
            </Button>
          )}
        </Box>
      </Box>

      {/* Features Section */}
      <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
        Como o Buscô funciona
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 6 }}>
        <Grid container spacing={4} sx={{ maxWidth: 900, mx: 'auto' }}>
          <Grid item xs={12} md={4}>
            <Card sx={{
              height: '100%',
              minHeight: 110, // Altura reduzida
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
              },
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="h5" component="div" gutterBottom align="center">
                  Compare Preços
                </Typography>
                <Typography variant="body1" color="text.secondary" align="center">
                  Veja os preços dos produtos em diferentes supermercados da cidade de Jaú e região e encontre as melhores ofertas.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{
              height: '100%',
              minHeight: 110, // Altura reduzida
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
              },
              border: isPremium() ? `2px solid ${theme.palette.primary.main}` : 'none',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="h5" component="div" gutterBottom align="center">
                  Monte Sua Lista
                </Typography>
                <Typography variant="body1" color="text.secondary" align="center">
                  Crie listas de compras personalizadas com os produtos que você deseja adquirir.
                  {!isPremium() && " (Recurso Premium)"}
                </Typography>
              </CardContent>
              {!isPremium() && (
                <CardActions sx={{ justifyContent: 'center', pb: 2, pt: 0 }}>
                  <Button size="small" component={Link} to="/upgrade" color="primary">
                    Conheça o Plano Premium
                  </Button>
                </CardActions>
              )}
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{
              height: '100%',
              minHeight: 110, // Altura reduzida
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
              },
              border: isPremium() ? `2px solid ${theme.palette.primary.main}` : 'none',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="h5" component="div" gutterBottom align="center">
                  Receba Notificações
                </Typography>
                <Typography variant="body1" color="text.secondary" align="center">
                  Seja notificado sobre promoções e ofertas dos produtos que você mais compra.
                  {!isPremium() && " (Recurso Premium)"}
                </Typography>
              </CardContent>
              {!isPremium() && (
                <CardActions sx={{ justifyContent: 'center', pb: 2, pt: 0 }}>
                  <Button size="small" component={Link} to="/upgrade" color="primary">
                    Conheça o Plano Premium
                  </Button>
                </CardActions>
              )}
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* CTA Section */}
      {!currentUser && (
        <Paper 
          sx={{ 
            p: 4, 
            textAlign: 'center', 
            mb: 6,
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            background: 'linear-gradient(to right, #f9f9f9, #ffffff)'
          }}
        >
          <Typography variant="h5" gutterBottom fontWeight="600">
            Pronto para começar a economizar?
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/register"
              sx={{ 
                mr: 2,
                px: 3,
                borderRadius: 8,
                fontWeight: 600,
                boxShadow: '0 4px 8px rgba(181, 31, 25, 0.2)',
              }}
            >
              Cadastre-se Grátis
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              to="/login"
              sx={{ 
                borderRadius: 8,
                px: 3
              }}
            >
              Fazer Login
            </Button>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default HomePage;