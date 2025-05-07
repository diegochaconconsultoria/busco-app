import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, Typography, Box,
  CircularProgress, Card, CardContent, CardMedia,
  FormControl, InputLabel, Select, MenuItem,
  IconButton, InputAdornment, Pagination,
  Chip, Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import { getAllProducts } from '../api/products';

const AddProductDialog = ({ open, onClose, onAddProduct }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [page, setPage] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState('');

  const productsPerPage = 6;

  useEffect(() => {
    if (open) {
      fetchProducts();
    }
  }, [open]);

  useEffect(() => {
    // Aplicar filtros
    applyFilters();
  }, [searchTerm, category, brand, products]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await getAllProducts();
      setProducts(response.data);
      setFilteredProducts(response.data);
      
      // Extrair categorias e marcas únicas para os filtros
      const uniqueCategories = [...new Set(response.data.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories);
      
      const uniqueBrands = [...new Set(response.data.map(p => p.brand).filter(Boolean))];
      setBrands(uniqueBrands);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar produtos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...products];
    
    // Filtrar por nome/descrição
    if (searchTerm) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrar por categoria
    if (category) {
      result = result.filter(product => product.category === category);
    }
    
    // Filtrar por marca
    if (brand) {
      result = result.filter(product => product.brand === brand);
    }
    
    setFilteredProducts(result);
    setPage(1); // Resetar para a primeira página
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategory('');
    setBrand('');
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  const handleAddToList = () => {
    if (selectedProduct) {
      onAddProduct({ 
        product: selectedProduct._id, 
        quantity: parseInt(quantity) || 1 
      });
      // Resetar seleção
      setSelectedProduct(null);
      setQuantity(1);
      onClose();
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Paginação
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * productsPerPage,
    page * productsPerPage
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Typography variant="h6">Adicionar Produto à Lista</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ pb: 1 }}>
        {/* Barra de pesquisa e filtros */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={9}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchTerm('')}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{ height: '56px' }}
              >
                {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'} 
              </Button>
            </Grid>
          </Grid>
          
          {showFilters && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={5}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Categoria</InputLabel>
                    <Select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      label="Categoria"
                    >
                      <MenuItem value="">Todas as categorias</MenuItem>
                      {categories.map((cat) => (
                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={5}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Marca</InputLabel>
                    <Select
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      label="Marca"
                    >
                      <MenuItem value="">Todas as marcas</MenuItem>
                      {brands.map((b) => (
                        <MenuItem key={b} value={b}>{b}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button 
                    variant="text" 
                    onClick={clearFilters}
                    fullWidth
                    sx={{ height: '56px' }}
                  >
                    Limpar Filtros
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>

        {/* Resultados da pesquisa */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {error ? (
              <Typography color="error" align="center" sx={{ py: 2 }}>
                {error}
              </Typography>
            ) : (
              <>
                {filteredProducts.length === 0 ? (
                  <Typography align="center" sx={{ py: 2 }}>
                    Nenhum produto encontrado com os filtros selecionados.
                  </Typography>
                ) : (
                  <>
                    {/* Lista de produtos */}
                    <Grid container spacing={2}>
                      {paginatedProducts.map(product => (
                        <Grid item xs={12} sm={6} md={4} key={product._id}>
                          <Card 
                            variant="outlined"
                            sx={{
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              cursor: 'pointer',
                              border: selectedProduct && selectedProduct._id === product._id 
                                ? '2px solid #b51f19' 
                                : '1px solid rgba(0, 0, 0, 0.12)',
                              transition: 'all 0.2s',
                              '&:hover': {
                                borderColor: '#b51f19',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                              }
                            }}
                            onClick={() => handleSelectProduct(product)}
                          >
                            <CardMedia
                              component="img"
                              height="140"
                              image={product.image ? `http://localhost:5000${product.image}` : "https://via.placeholder.com/140x140?text=Produto"}
                              alt={product.name}
                              sx={{ objectFit: 'contain', p: 1 }}
                            />
                            <CardContent sx={{ flexGrow: 1 }}>
                              <Typography gutterBottom variant="body1" component="div" fontWeight="medium" noWrap>
                                {product.name}
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                  {product.brand || ''}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {product.unitSize} {product.unit}
                                </Typography>
                              </Box>
                              <Box sx={{ mt: 1 }}>
                                <Chip 
                                  label={product.category} 
                                  size="small" 
                                  variant="outlined" 
                                />
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>

                    {/* Paginação */}
                    {totalPages > 1 && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <Pagination
                          count={totalPages}
                          page={page}
                          onChange={handlePageChange}
                          color="primary"
                        />
                      </Box>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </DialogContent>

      <Divider />

      {/* Produto selecionado e ações */}
      <DialogActions sx={{ justifyContent: 'space-between', py: 2, px: 3 }}>
        <Box>
          {selectedProduct && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body1" fontWeight="medium">
                {selectedProduct.name}
              </Typography>
              <Box sx={{ ml: 2, width: 100 }}>
                <TextField
                  type="number"
                  size="small"
                  label="Quantidade"
                  InputProps={{ inputProps: { min: 1 } }}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </Box>
            </Box>
          )}
        </Box>
        <Box>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddCircleIcon />}
            onClick={handleAddToList}
            disabled={!selectedProduct}
          >
            Adicionar à Lista
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default AddProductDialog;