import React, { useState, useContext } from 'react';
import { 
  Container, Typography, Button, Box, Card, 
  CardContent, CardActions, Divider, List, ListItem, 
  ListItemIcon, ListItemText, Alert, CircularProgress 
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Simulação de API para upgrade (em produção, você teria uma integração real com pagamentos)
const simulateUpgrade = () => {
  return new Promise((resolve) => {
    // Simulando um tempo de processamento
    setTimeout(() => {
      resolve({ success: true });
    }, 2000);
  });
};

const UpgradePage = () => {
  const { currentUser, isPremium } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleUpgrade = async () => {
    setLoading(true);
    setError('');
    try {
      // Simulação de upgrade
      // Em produção, implementar integração com gateway de pagamento
      await simulateUpgrade();
      setSuccess('Upgrade realizado com sucesso! Para finalizar, faça login novamente.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error(err);
      setError('Erro ao processar upgrade. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Se já for premium, redirecionar
  if (isPremium()) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h4" gutterBottom>
              Você já é um usuário Premium!
            </Typography>
            <Typography variant="body1" paragraph>
              Aproveite todos os recursos exclusivos do Buscô Premium.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/products')}
              sx={{ mt: 2 }}
            >
              Explorar Produtos
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        Upgrade para Buscô Premium
      </Typography>
      <Typography variant="subtitle1" align="center" paragraph sx={{ mb: 4 }}>
        Compare preços, monte listas de compras e receba notificações de ofertas.
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
      
      {/* Card do plano Gratuito */}
      <Card sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Plano Gratuito
          </Typography>
          <Typography variant="h4" color="text.secondary" sx={{ mb: 2 }}>
            R$ 0,00
          </Typography>
          <Divider sx={{ my: 2 }} />
          <List dense>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="Comparação de preços básica" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CancelIcon color="error" />
              </ListItemIcon>
              <ListItemText primary="Listas de compras" secondary="Não disponível" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CancelIcon color="error" />
              </ListItemIcon>
              <ListItemText primary="Notificações de ofertas" secondary="Não disponível" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CancelIcon color="error" />
              </ListItemIcon>
              <ListItemText primary="Melhor supermercado para sua lista" secondary="Não disponível" />
            </ListItem>
          </List>
        </CardContent>
        <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Typography variant="subtitle1">
            Seu plano atual
          </Typography>
        </CardActions>
      </Card>
      
      {/* Card do plano Premium */}
      <Card sx={{ borderColor: 'primary.main', borderWidth: 2, borderStyle: 'solid', maxWidth: 600, mx: 'auto' }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Plano Premium
          </Typography>
          <Typography variant="h4" color="primary" sx={{ mb: 2 }}>
            R$ 9,90/mês
          </Typography>
          <Divider sx={{ my: 2 }} />
          <List dense>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="Comparação de preços avançada" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="Criação de listas de compras ilimitadas" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="Notificações de ofertas dos seus produtos favoritos" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="Descubra o melhor supermercado para sua lista completa" />
            </ListItem>
          </List>
        </CardContent>
        <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            variant="contained" 
            size="large" 
            onClick={handleUpgrade}
            disabled={loading}
            sx={{ minWidth: 200 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Fazer Upgrade'
            )}
          </Button>
        </CardActions>
      </Card>
      
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="body2" color="text.secondary">
          O plano Premium é recorrente e será cobrado mensalmente. 
          Você pode cancelar a qualquer momento.
        </Typography>
      </Box>
    </Container>
  );
};

export default UpgradePage;