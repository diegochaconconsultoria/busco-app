import React, { useState, useEffect } from 'react';
import {
  Typography, Button, Box,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, CircularProgress, Alert,
  FormControl, InputLabel, Select, MenuItem,
  FormControlLabel, Checkbox, FormGroup,
  Chip, Avatar
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ptBR from 'date-fns/locale/pt-BR';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { getAllProducts } from '../../api/products';
import { getAllMarkets } from '../../api/markets';
import { getProductPrices, getMarketPrices, savePrice } from '../../api/prices';

const AdminPricesPage = () => {
  const [products, setProducts] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('');

  const [openDialog, setOpenDialog] = useState(false);
  const [priceFormData, setPriceFormData] = useState({
    product: '',
    market: '',
    price: '',
    isPromotion: false,
    promotionEndDate: null
  });

  useEffect(() => {
    fetchProductsAndMarkets();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      fetchPricesByProduct(selectedProduct);
    } else if (selectedMarket) {
      fetchPricesByMarket(selectedMarket);
    }
  }, [selectedProduct, selectedMarket]);

  const fetchProductsAndMarkets = async () => {
    setLoading(true);
    try {
      const [productsResponse, marketsResponse] = await Promise.all([
        getAllProducts(),
        getAllMarkets()
      ]);
      setProducts(productsResponse.data);
      setMarkets(marketsResponse.data);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPricesByProduct = async (productId) => {
    setLoadingPrices(true);
    try {
      const response = await getProductPrices(productId);
      setPrices(response.data);
      setSelectedMarket('');
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar preços. Tente novamente.');
    } finally {
      setLoadingPrices(false);
    }
  };

  const fetchPricesByMarket = async (marketId) => {
    setLoadingPrices(true);
    try {
      const response = await getMarketPrices(marketId);
      setPrices(response.data);
      setSelectedProduct('');
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar preços. Tente novamente.');
    } finally {
      setLoadingPrices(false);
    }
  };

  const handleOpenPriceDialog = (price = null) => {
    if (price) {
      setPriceFormData({
        product: price.product._id,
        market: price.market._id,
        price: price.price,
        isPromotion: price.isPromotion || false,
        promotionEndDate: price.promotionEndDate ? new Date(price.promotionEndDate) : null
      });
    } else {
      setPriceFormData({
        product: selectedProduct || '',
        market: selectedMarket || '',
        price: '',
        isPromotion: false,
        promotionEndDate: null
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handlePriceFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPriceFormData({
      ...priceFormData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleDateChange = (date) => {
    setPriceFormData({
      ...priceFormData,
      promotionEndDate: date
    });
  };

  const handleSavePrice = async () => {
    try {
      await savePrice(priceFormData);
      setSuccess('Preço salvo com sucesso!');
      handleCloseDialog();

      // Recarregar os preços
      if (selectedProduct) {
        fetchPricesByProduct(selectedProduct);
      } else if (selectedMarket) {
        fetchPricesByMarket(selectedMarket);
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao salvar preço. Tente novamente.');
    }
  };

  const getProductName = (id) => {
    const product = products.find(p => p._id === id);
    return product ? product.name : 'Produto não encontrado';
  };

  const getMarketName = (id) => {
    const market = markets.find(m => m._id === id);
    return market ? market.name : 'Supermercado não encontrado';
  };

  const refreshData = () => {
    if (selectedProduct) {
      fetchPricesByProduct(selectedProduct);
    } else if (selectedMarket) {
      fetchPricesByMarket(selectedMarket);
    } else {
      // Se nenhum filtro estiver aplicado, não temos o que recarregar
      setSuccess('Selecione um produto ou supermercado para visualizar os preços.');
    }
  };

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Gerenciar Preços
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refreshData}
          >
            Atualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenPriceDialog()}
          >
            Novo Preço
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Box sx={{ mb: 4, mt: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Produto
              </Typography>
              <FormControl fullWidth variant="outlined" size="medium">
                <Select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  displayEmpty
                  renderValue={selected => {
                    if (!selected) {
                      return <em>Todos os produtos</em>;
                    }
                    
                    const product = products.find(p => p._id === selected);
                    if (!product) return selected;
                    
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          variant="rounded"
                          src={product.image ? `http://localhost:5000${product.image}` : undefined}
                          alt={product.name}
                          sx={{ width: 24, height: 24, mr: 1 }}
                        >
                          {!product.image && product.name.charAt(0)}
                        </Avatar>
                        {product.name} - {product.brand}
                      </Box>
                    );
                  }}
                >
                  <MenuItem value="">
                    <em>Todos os produtos</em>
                  </MenuItem>
                  {products.map((product) => (
                    <MenuItem key={product._id} value={product._id}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          variant="rounded"
                          src={product.image ? `http://localhost:5000${product.image}` : undefined}
                          alt={product.name}
                          sx={{ width: 24, height: 24, mr: 1 }}
                        >
                          {!product.image && product.name.charAt(0)}
                        </Avatar>
                        {product.name} - {product.brand}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Supermercado
              </Typography>
              <FormControl fullWidth variant="outlined" size="medium">
                <Select
                  value={selectedMarket}
                  onChange={(e) => setSelectedMarket(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="">Todos os supermercados</MenuItem>
                  {markets.map((market) => (
                    <MenuItem key={market._id} value={market._id}>
                      {market.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Tabela de preços */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {loadingPrices ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Produto</TableCell>
                    <TableCell>Supermercado</TableCell>
                    <TableCell align="right">Preço (R$)</TableCell>
                    <TableCell>Promoção</TableCell>
                    <TableCell>Validade da Promoção</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {prices.length > 0 ? (
                    prices.map((price) => (
                      <TableRow key={price._id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {price.product.image && (
                              <Avatar 
                                variant="rounded"
                                src={`http://localhost:5000${price.product.image}`}
                                alt={price.product.name}
                                sx={{ width: 30, height: 30, mr: 1 }}
                              />
                            )}
                            <div>
                              <Typography variant="body2">
                                {price.product.name || getProductName(price.product)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {price.product.brand} • {price.product.unitSize} {price.product.unit}
                              </Typography>
                            </div>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {price.market.name || getMarketName(price.market)}
                        </TableCell>
                        <TableCell align="right">
                          <Typography 
                            variant="body2" 
                            fontWeight={price.isPromotion ? 'bold' : 'normal'}
                            color={price.isPromotion ? 'error.main' : 'inherit'}
                          >
                            {price.price.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {price.isPromotion ? (
                            <Chip
                              icon={<LocalOfferIcon />}
                              label="Sim"
                              color="error"
                              size="small"
                            />
                          ) : 'Não'}
                        </TableCell>
                        <TableCell>
                          {price.isPromotion && price.promotionEndDate
                            ? new Date(price.promotionEndDate).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenPriceDialog(price)}
                          >
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Nenhum preço encontrado. Selecione um produto ou supermercado, ou adicione um novo preço.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* Diálogo para adicionar/editar preço */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Gerenciar Preço
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Produto</InputLabel>
                <Select
                  name="product"
                  value={priceFormData.product}
                  label="Produto"
                  onChange={handlePriceFormChange}
                  renderValue={selected => {
                    const product = products.find(p => p._id === selected);
                    if (!product) return selected;
                    
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          variant="rounded"
                          src={product.image ? `http://localhost:5000${product.image}` : undefined}
                          alt={product.name}
                          sx={{ width: 24, height: 24, mr: 1 }}
                        >
                          {!product.image && product.name.charAt(0)}
                        </Avatar>
                        {product.name} - {product.brand}
                      </Box>
                    );
                  }}
                >
                  {products.map((product) => (
                    <MenuItem key={product._id} value={product._id}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          variant="rounded"
                          src={product.image ? `http://localhost:5000${product.image}` : undefined}
                          alt={product.name}
                          sx={{ width: 24, height: 24, mr: 1 }}
                        >
                          {!product.image && product.name.charAt(0)}
                        </Avatar>
                        {product.name} - {product.brand}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Supermercado</InputLabel>
                <Select
                  name="market"
                  value={priceFormData.market}
                  label="Supermercado"
                  onChange={handlePriceFormChange}
                >
                  {markets.map((market) => (
                    <MenuItem key={market._id} value={market._id}>
                      {market.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Preço (R$)"
                name="price"
                type="number"
                value={priceFormData.price}
                onChange={handlePriceFormChange}
                required
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={priceFormData.isPromotion}
                      onChange={handlePriceFormChange}
                      name="isPromotion"
                    />
                  }
                  label="Está em promoção"
                />
              </FormGroup>
            </Grid>
            {priceFormData.isPromotion && (
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                  <DatePicker
                    label="Data de término da promoção"
                    value={priceFormData.promotionEndDate}
                    onChange={handleDateChange}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSavePrice}
            variant="contained"
            disabled={!priceFormData.product || !priceFormData.market || !priceFormData.price}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminPricesPage;