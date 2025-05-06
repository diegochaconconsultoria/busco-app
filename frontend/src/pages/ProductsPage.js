import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion'; // Adicione esta importação
import {
  Container, Typography, Grid, Card, CardContent, CardMedia,
  TextField, InputAdornment, MenuItem, FormControl,
  InputLabel, Select, Box, Pagination, CircularProgress, Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Link } from 'react-router-dom';
import { getAllProducts } from '../api/products';
import FadeIn from '../components/FadeIn';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);

  const productsPerPage = 12;

  // Buscar produtos do backend
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        console.log('Iniciando busca de produtos...');
        const response = await getAllProducts({
          search: searchTerm,
          category: category
        });
        console.log('Resposta recebida:', response);
        setProducts(response.data);

        // Extrair categorias únicas
        const uniqueCategories = [...new Set(response.data.map(p => p.category).filter(Boolean))];
        setCategories(uniqueCategories);
        setError('');
      } catch (err) {
        console.error('Erro detalhado:', err);
        if (err.response) {
          console.error('Resposta de erro do servidor:', err.response.data);
          console.error('Status do erro:', err.response.status);
        } else if (err.request) {
          console.error('Nenhuma resposta recebida:', err.request);
        } else {
          console.error('Erro ao configurar a requisição:', err.message);
        }
        setError('Erro ao carregar produtos. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm, category]);

  // Filtragem e paginação
  const filteredProducts = products;
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * productsPerPage,
    page * productsPerPage
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Manipuladores de eventos
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  return (
    <Container>
      <FadeIn>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
          Produtos
        </Typography>
      </FadeIn>

      {/* Filtros */}
      <FadeIn delay={0.1}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              label="Buscar produtos"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Categoria</InputLabel>
              <Select
                value={category}
                onChange={handleCategoryChange}
                label="Categoria"
              >
                <MenuItem value="">Todas as categorias</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </FadeIn>


      {/* Mensagem de erro */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error} Verifique se o servidor backend está rodando em http://localhost:5000.
        </Alert>
      )}

      {/* Produtos */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <FadeIn delay={0.2}>
          <>
            {paginatedProducts.length === 0 ? (
              <Typography variant="body1" sx={{ my: 4, textAlign: 'center' }}>
                Nenhum produto encontrado com os filtros selecionados.
              </Typography>
            ) : (
              <>
                <Grid container spacing={3}>
                  {paginatedProducts.map((product, index) => ( // Adicione o parâmetro index aqui
                    <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{
                          scale: 1.03,
                          boxShadow: "0px 10px 20px rgba(0,0,0,0.1)",
                          transition: { duration: 0.2 }
                        }}
                      ></motion.div>
                      <Card component={Link} to={`/products/${product._id}`} sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        textDecoration: 'none',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'scale(1.03)',
                          boxShadow: 3
                        }
                      }}>
                        <CardMedia
                          component="img"
                          height="180"
                          image={product.image ? `http://localhost:5000${product.image}` : "https://via.placeholder.com/180x180?text=Produto"}
                          alt={product.name}
                          sx={{ objectFit: 'contain', p: 1 }}
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography gutterBottom variant="h6" component="div" noWrap>
                            {product.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {product.brand}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {product.unitSize} {product.unit}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {/* Paginação */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
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
        </FadeIn>
      )}
    </Container>
  );
};

export default ProductsPage;