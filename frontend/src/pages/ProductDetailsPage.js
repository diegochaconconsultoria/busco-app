import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion'; // Adicione esta importação
import {
  Container, Typography, Grid, Card, CardContent, CardMedia,
  Box, Button, CircularProgress, Alert, Divider,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { getProductById } from '../api/products';
import { getProductPrices } from '../api/prices';
import { addItemToList } from '../api/shoppingLists';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { getUserLists, createList } from '../api/shoppingLists';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isPremium } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToList, setAddingToList] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        // Buscar detalhes do produto
        const productResponse = await getProductById(id);
        setProduct(productResponse.data);

        // Buscar preços do produto em diferentes supermercados
        const pricesResponse = await getProductPrices(id);
        setPrices(pricesResponse.data.sort((a, b) => a.price - b.price));
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar informações do produto. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleAddToList = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (!isPremium()) {
      navigate('/upgrade');
      return;
    }

    setAddingToList(true);
    setError('');
    setSuccess('');

    try {
      // Por simplicidade, estamos apenas adicionando à primeira lista do usuário
      // Em uma implementação completa, você pode mostrar um diálogo para escolher a lista
      const listsResponse = await getUserLists();

      if (listsResponse.data.length === 0) {
        // Criar uma nova lista se não existir nenhuma
        const newListResponse = await createList({
          name: 'Minha Lista',
          items: [{ product: product._id, quantity: 1 }]
        });
        setSuccess('Produto adicionado a uma nova lista de compras!');
      } else {
        // Adicionar à primeira lista existente
        const listId = listsResponse.data[0]._id;
        await addItemToList(listId, { product: product._id, quantity: 1 });
        setSuccess(`Produto adicionado à lista "${listsResponse.data[0].name}"!`);
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao adicionar produto à lista. Tente novamente.');
    } finally {
      setAddingToList(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!product) {
    return (
      <Container>
        <Alert severity="error">Produto não encontrado.</Alert>
      </Container>
    );
  }

  return (
    <Container>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Grid container spacing={4}>
        {/* Detalhes do produto */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardMedia
              component="img"
              image={product.image ? `http://localhost:5000${product.image}` : "https://via.placeholder.com/300x300?text=Produto"}
              alt={product.name}
              sx={{ height: 300, objectFit: 'contain', p: 2 }}
            />
            <CardContent>
              <Typography variant="h5" component="h1" gutterBottom>
                {product.name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                {product.brand}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Categoria: {product.category}
                {product.subCategory && ` > ${product.subCategory}`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tamanho: {product.unitSize} {product.unit}
              </Typography>

              {isPremium() && (
                <Button
                  variant="contained"
                  startIcon={<ShoppingCartIcon />}
                  onClick={handleAddToList}
                  disabled={addingToList}
                  fullWidth
                  sx={{ mt: 3 }}
                >
                  {addingToList ? 'Adicionando...' : 'Adicionar à Lista'}
                </Button>
              )}

              {currentUser && !isPremium() && (
                <Button
                  variant="outlined"
                  onClick={() => navigate('/upgrade')}
                  fullWidth
                  sx={{ mt: 3 }}
                >
                  Faça upgrade para adicionar à lista
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Comparação de preços */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >

            <Typography variant="h5" component="h2" gutterBottom>
              Comparação de Preços
            </Typography>

            {prices.length === 0 ? (
              <Alert severity="info">
                Não foram encontrados preços para este produto.
              </Alert>
            ) : (
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Supermercado</TableCell>
                      <TableCell>Localização</TableCell>
                      <TableCell align="right">Preço</TableCell>
                      <TableCell>Atualizado em</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {prices.map((price, index) => (

                      <motion.tr
                        key={price._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.1,
                          ease: "easeOut"
                        }}
                      >



                        <TableRow
                          key={price._id}
                          sx={{
                            backgroundColor: index === 0 ? 'rgba(76, 175, 80, 0.1)' : 'inherit'
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {index === 0 && (
                                <Chip
                                  label="Melhor preço"
                                  color="success"
                                  size="small"
                                  icon={<LocalOfferIcon />}
                                  sx={{ mr: 1 }}
                                />
                              )}
                              {price.market.name}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {price.market.address.neighborhood}, {price.market.address.city}
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="body1"
                              component="span"
                              sx={{
                                fontWeight: index === 0 ? 'bold' : 'regular',
                                color: price.isPromotion ? 'error.main' : 'inherit'
                              }}
                            >
                              R$ {price.price.toFixed(2)}
                            </Typography>
                            {price.isPromotion && (
                              <Typography variant="caption" display="block" color="error">
                                Promoção até {new Date(price.promotionEndDate).toLocaleDateString()}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(price.updatedAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

            )}
          </motion.div>

          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle2" color="text.secondary">
              * Os preços podem variar. Última atualização em {new Date().toLocaleDateString()}.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetailsPage;