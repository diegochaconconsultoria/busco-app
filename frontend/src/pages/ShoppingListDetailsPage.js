import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Grid, Card, CardContent, 
  Button, CircularProgress, Alert, Box, 
  List, Divider, Paper, IconButton, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, FormControl, InputLabel, Select,
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { 
  getListById, addItemToList, removeItemFromList, updateList,
  getUserLists, createList
} from '../api/shoppingLists';
import { getAllProducts } from '../api/products';
import { compareProducts } from '../api/prices';

const ShoppingListDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [list, setList] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [comparisonResults, setComparisonResults] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchListDetails();
    fetchProducts();
  }, [id]);

  const fetchListDetails = async () => {
    setLoading(true);
    try {
      const response = await getListById(id);
      setList(response.data);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar detalhes da lista. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await getAllProducts();
      setProducts(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setSelectedProduct('');
    setQuantity(1);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleAddItem = async () => {
    if (!selectedProduct) {
      return;
    }
    
    setAdding(true);
    try {
      await addItemToList(id, { product: selectedProduct, quantity });
      setSuccess('Produto adicionado com sucesso!');
      handleCloseDialog();
      fetchListDetails();
    } catch (err) {
      console.error(err);
      setError('Erro ao adicionar produto. Tente novamente.');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await removeItemFromList(id, productId);
      setSuccess('Produto removido com sucesso!');
      fetchListDetails();
    } catch (err) {
      console.error(err);
      setError('Erro ao remover produto. Tente novamente.');
    }
  };

  const handleCompareList = async () => {
    setComparing(true);
    try {
      const productIds = list.items.map(item => item.product._id);
      const response = await compareProducts(productIds);
      setComparisonResults(response.data);
    } catch (err) {
      console.error(err);
      setError('Erro ao comparar preços. Tente novamente.');
    } finally {
      setComparing(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!list) {
    return (
      <Container>
        <Alert severity="error">Lista não encontrada.</Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/shopping-lists')}
          sx={{ mt: 2 }}
        >
          Voltar para Minhas Listas
        </Button>
      </Container>
    );
  }

  // Cálculo dos melhores preços por supermercado com base na comparação
  const getBestMarket = () => {
    if (!comparisonResults) return null;
    
    const marketTotals = {};
    
    // Para cada produto
    Object.keys(comparisonResults).forEach(productId => {
      const productData = comparisonResults[productId];
      
      // Se houver preços para este produto
      if (productData.prices && productData.prices.length > 0) {
        // Para cada preço deste produto
        productData.prices.forEach(priceData => {
          const marketId = priceData.market._id;
          const productQuantity = list.items.find(
            item => item.product._id === productId
          )?.quantity || 1;
          
          if (!marketTotals[marketId]) {
            marketTotals[marketId] = {
              market: priceData.market,
              total: 0,
              items: []
            };
          }
          
          marketTotals[marketId].total += priceData.price * productQuantity;
          marketTotals[marketId].items.push({
            product: productData.product,
            price: priceData.price,
            quantity: productQuantity,
            subtotal: priceData.price * productQuantity
          });
        });
      }
    });
    
    // Converter objeto em array e ordenar por preço total
    return Object.values(marketTotals).sort((a, b) => a.total - b.total);
  };
  
  const sortedMarkets = comparisonResults ? getBestMarket() : [];

  return (
    <Container maxWidth="md">
      {/* Cabeçalho com informações da lista */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 2,
        background: 'linear-gradient(to right, #f8f9fa, #ffffff)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h1" fontWeight="600">
              {list.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Chip 
                label={`Criada em ${formatDate(list.createdAt)}`} 
                size="small" 
                sx={{ mr: 1 }}
              />
              <Chip 
                label={`${list.items.length} ${list.items.length === 1 ? 'item' : 'itens'}`} 
                size="small" 
                color="primary" 
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
              sx={{ mr: 2, borderRadius: 8 }}
            >
              Adicionar Item
            </Button>
            {list.items.length > 0 && (
              <Button
                variant="outlined"
                onClick={handleCompareList}
                disabled={comparing}
                sx={{ borderRadius: 8 }}
              >
                {comparing ? 'Comparando...' : 'Comparar Preços'}
              </Button>
            )}
          </Grid>
        </Grid>
      </Paper>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          {/* Lista de Produtos */}
          <Paper sx={{ borderRadius: 2, overflow: 'hidden', height: '100%' }}>
            <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 1.5, px: 2 }}>
              <Typography variant="h6">
                Itens da Lista
              </Typography>
            </Box>
            
            {list.items.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <ShoppingCartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" gutterBottom>
                  Esta lista está vazia
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Adicione produtos para começar a comparar preços
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={handleOpenDialog}
                  sx={{ mt: 2, borderRadius: 8 }}
                >
                  Adicionar Produto
                </Button>
              </Box>
            ) : (
              <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Produto</TableCell>
                      <TableCell align="center">Quantidade</TableCell>
                      <TableCell align="right">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {list.items.map((item) => (
                      <TableRow key={item._id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body1" fontWeight="medium">
                              {item.product.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {item.product.brand} - {item.product.unitSize} {item.product.unit}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={item.quantity} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleRemoveItem(item.product._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={5}>
          {/* Resultado da Comparação */}
          {comparisonResults ? (
            <Paper sx={{ borderRadius: 2, overflow: 'hidden', height: '100%' }}>
              <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 1.5, px: 2 }}>
                <Typography variant="h6">
                  Comparação de Preços
                </Typography>
              </Box>
              
              <Box sx={{ p: 0 }}>
                {sortedMarkets.length > 0 ? (
                  <>
                    <Box sx={{ p: 2, bgcolor: 'success.light', color: 'white' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <StorefrontIcon sx={{ mr: 1 }} />
                        <Typography variant="subtitle1" fontWeight="bold">
                          Melhor Opção: {sortedMarkets[0].market.name}
                        </Typography>
                      </Box>
                      <Typography variant="h5" fontWeight="bold">
                        Total: R$ {sortedMarkets[0].total.toFixed(2)}
                      </Typography>
                    </Box>
                    
                    <Divider />
                    
                    <Box sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Comparação por Supermercado
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableBody>
                            {sortedMarkets.map((market, index) => (
                              <TableRow 
                                key={market.market._id}
                                sx={{ 
                                  bgcolor: index === 0 ? 'rgba(76, 175, 80, 0.1)' : 'inherit'
                                }}
                              >
                                <TableCell>
                                  <Typography variant="body2" fontWeight={index === 0 ? 'bold' : 'regular'}>
                                    {market.market.name}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2" fontWeight={index === 0 ? 'bold' : 'regular'}>
                                    R$ {market.total.toFixed(2)}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  {index === 0 ? (
                                    <Chip 
                                      label="Melhor preço" 
                                      color="success" 
                                      size="small" 
                                      icon={<LocalOfferIcon />} 
                                    />
                                  ) : (
                                    <Typography variant="body2" color="error.main">
                                      + R$ {(market.total - sortedMarkets[0].total).toFixed(2)}
                                    </Typography>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                    
                    <Divider />
                    
                    <Box sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Detalhes da Melhor Opção
                      </Typography>
                      <TableContainer sx={{ maxHeight: 200, overflow: 'auto' }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Produto</TableCell>
                              <TableCell align="right">Preço</TableCell>
                              <TableCell align="right">Qtd</TableCell>
                              <TableCell align="right">Total</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {sortedMarkets[0].items.map((item) => (
                              <TableRow key={item.product._id}>
                                <TableCell>
                                  <Typography variant="body2" noWrap>
                                    {item.product.name}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2">
                                    R$ {item.price.toFixed(2)}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2">
                                    {item.quantity}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2">
                                    R$ {item.subtotal.toFixed(2)}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow>
                              <TableCell colSpan={3} align="right">
                                <Typography variant="subtitle2">Total:</Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="subtitle2" fontWeight="bold">
                                  R$ {sortedMarkets[0].total.toFixed(2)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </>
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Alert severity="info">
                      Não foram encontrados preços para os produtos desta lista.
                    </Alert>
                  </Box>
                )}
              </Box>
            </Paper>
          ) : (
            <Paper sx={{ 
              borderRadius: 2, 
              p: 3, 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              bgcolor: '#f8f9fa'
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <LocalOfferIcon sx={{ fontSize: 60, color: 'primary.main', opacity: 0.7, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Compare preços dos supermercados
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Clique no botão "Comparar Preços" para descobrir o melhor lugar para comprar seus itens
                </Typography>
                {list.items.length > 0 && (
                  <Button
                    variant="contained"
                    onClick={handleCompareList}
                    disabled={comparing}
                    sx={{ mt: 2, borderRadius: 8 }}
                  >
                    {comparing ? 'Comparando...' : 'Comparar Preços'}
                  </Button>
                )}
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
      
      {/* Diálogo para adicionar item */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Adicionar Produto à Lista</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="product-select-label">Produto</InputLabel>
            <Select
              labelId="product-select-label"
              value={selectedProduct}
              label="Produto"
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              {products.map((product) => (
                <MenuItem key={product._id} value={product._id}>
                  {product.name} - {product.brand} ({product.unitSize} {product.unit})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            margin="dense"
            label="Quantidade"
            type="number"
            fullWidth
            variant="outlined"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            InputProps={{ inputProps: { min: 1 } }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button 
            onClick={handleAddItem} 
            variant="contained"
            disabled={adding || !selectedProduct}
          >
            {adding ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ShoppingListDetailsPage;