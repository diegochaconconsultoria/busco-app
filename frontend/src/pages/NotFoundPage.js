import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <Container maxWidth="md" sx={{ textAlign: 'center', py: 8 }}>
      <Typography variant="h1" component="h1" gutterBottom>
        404
      </Typography>
      <Typography variant="h4" component="h2" gutterBottom>
        Página não encontrada
      </Typography>
      <Typography variant="body1" paragraph>
        A página que você está procurando não existe ou foi movida.
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button variant="contained" component={Link} to="/">
          Voltar para a página inicial
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage;