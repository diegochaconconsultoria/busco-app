import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, Card, CardContent,
  Button, CircularProgress, Alert, Box,
  Divider, Paper, IconButton, Chip,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Avatar, Collapse,
  Checkbox, Tabs, Tab, TextField,
  List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Switch, FormControlLabel
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import {
  getListById, removeItemFromList, updateItemQuantity,
  updateCheckedItems
} from '../api/shoppingLists';
import AddProductDialog from '../components/AddProductDialog';
import { addItemToList } from '../api/shoppingLists';
import { compareProducts } from '../api/prices';

// Componente de barra de progresso
const ProgressBar = ({ progress }) => (
  <Box sx={{ mt: 1, mb: 2 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
      <Typography variant="body2" fontWeight="medium">
        Progresso das compras
      </Typography>
      <Typography variant="body2" fontWeight="bold">
        {progress}%
      </Typography>
    </Box>
    <Box
      sx={{
        height: 10,
        width: '100%',
        bgcolor: 'rgba(0,0,0,0.1)',
        borderRadius: 5,
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <Box
        sx={{
          height: '100%',
          width: `${progress}%`,
          bgcolor: 'success.main',
          borderRadius: 5,
          transition: 'width 0.3s ease-in-out'
        }}
      />
    </Box>
  </Box>
);

const ShoppingListDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [removing, setRemoving] = useState(false);

  // Estado para comparação de preços
  const [comparing, setComparing] = useState(false);
  const [comparisonResults, setComparisonResults] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonTab, setComparisonTab] = useState(0);

  // Estado para edição de quantidade
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newQuantity, setNewQuantity] = useState(1);
  const [updating, setUpdating] = useState(false);

  // Estado para checklist em listas finalizadas
  const [checkedItems, setCheckedItems] = useState({});
  const [marketTab, setMarketTab] = useState(0);
  const [savingChecklist, setSavingChecklist] = useState(false);

  // Estado para melhorias no checklist
  const [compactMode, setCompactMode] = useState(false);
  const [showOnlyRemaining, setShowOnlyRemaining] = useState(false);

  useEffect(() => {
    fetchListDetails();
  }, [id]);

  const fetchListDetails = async () => {
    setLoading(true);
    try {
      console.log('Buscando detalhes da lista ID:', id);
      const response = await getListById(id);
      console.log('Dados recebidos da API:', response.data);
      console.log('Lista finalizada?', response.data.finalized);

      setList(response.data);

      // Inicializar checklist se a lista está finalizada
      if (response.data.finalized && response.data.checkedItems) {
        console.log('Inicializando checklist com:', response.data.checkedItems);
        setCheckedItems(response.data.checkedItems);
      } else {
        // Inicializar como um objeto vazio
        setCheckedItems({});
      }

      // Se a lista está finalizada e tem resultados de comparação, mostrar
      if (response.data.finalized && response.data.comparisonResults) {
        console.log('Lista tem resultados de comparação.');
        setComparisonResults(response.data.comparisonResults);
      }
    } catch (err) {
      console.error('Erro ao carregar detalhes da lista:', err);
      setError('Erro ao carregar detalhes da lista. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };


  const handleOpenProductDialog = () => {
    setOpenProductDialog(true);
  };

  const handleCloseProductDialog = () => {
    setOpenProductDialog(false);
  };

  const handleAddProduct = async (productData) => {
    try {
      await addItemToList(id, productData);
      setSuccess('Produto adicionado com sucesso!');
      // Resetar comparação quando adicionar novos produtos
      setComparisonResults(null);
      setShowComparison(false);
      fetchListDetails(); // Recarregar a lista após adicionar o produto
    } catch (err) {
      console.error(err);
      setError('Erro ao adicionar produto. Tente novamente.');
    }
  };

  const handleRemoveItem = async (productId) => {
    setRemoving(true);
    try {
      await removeItemFromList(id, productId);
      setSuccess('Produto removido com sucesso!');
      // Resetar comparação quando remover produtos
      setComparisonResults(null);
      setShowComparison(false);
      fetchListDetails();
    } catch (err) {
      console.error(err);
      setError('Erro ao remover produto. Tente novamente.');
    } finally {
      setRemoving(false);
    }
  };

  // Funções para edição de quantidade
  const handleOpenEditDialog = (item) => {
    setEditingItem(item);
    setNewQuantity(item.quantity);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingItem(null);
  };

  const handleUpdateQuantity = async () => {
    if (!editingItem || newQuantity < 1) return;

    setUpdating(true);
    try {
      await updateItemQuantity(id, editingItem.product._id, newQuantity);
      setSuccess('Quantidade atualizada com sucesso!');
      handleCloseEditDialog();
      // Resetar comparação quando atualizar quantidades
      setComparisonResults(null);
      setShowComparison(false);
      fetchListDetails();
    } catch (err) {
      console.error(err);
      setError('Erro ao atualizar quantidade. Tente novamente.');
    } finally {
      setUpdating(false);
    }
  };

  const handleCompareList = async () => {
    setComparing(true);
    try {
      const productIds = list.items.map(item => item.product._id);
      const response = await compareProducts(productIds);
      setComparisonResults(response.data);
      setShowComparison(true);
      setComparisonTab(0); // Reset to first tab
    } catch (err) {
      console.error(err);
      setError('Erro ao comparar preços. Tente novamente.');
    } finally {
      setComparing(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setComparisonTab(newValue);
  };

  const handleMarketTabChange = (event, newValue) => {
    setMarketTab(newValue);
  };

  // Funções para checklist em listas finalizadas
  const handleToggleChecked = async (itemId) => {
    // Atualizar estado local imediatamente para feedback do usuário
    const newCheckedItems = {
      ...checkedItems,
      [itemId]: !checkedItems[itemId]
    };
    setCheckedItems(newCheckedItems);

    // Salvar no servidor para persistir as alterações
    setSavingChecklist(true);
    try {
      await updateCheckedItems(id, newCheckedItems);
    } catch (err) {
      console.error(err);
      setError('Erro ao atualizar checklist. Tente novamente.');
      // Reverter mudança local se falhar
      setCheckedItems(checkedItems);
    } finally {
      setSavingChecklist(false);
    }
  };

  // Marcar todos os itens de um mercado
  const markAllInMarket = async (marketId) => {
    const newCheckedItems = { ...checkedItems };

    // Pegar todos os itens deste mercado
    const marketItems = bestPricesData.marketGroups.find(
      group => group.market._id === marketId
    )?.items || [];

    // Marcar todos como checados
    marketItems.forEach(item => {
      newCheckedItems[item._id] = true;
    });

    setCheckedItems(newCheckedItems);

    // Salvar no servidor
    try {
      await updateCheckedItems(id, newCheckedItems);
      setSuccess('Itens atualizados com sucesso!');
    } catch (err) {
      console.error(err);
      setError('Erro ao atualizar itens. Tente novamente.');
    }
  };

  // Desmarcar todos os itens de um mercado
  const unmarkAllInMarket = async (marketId) => {
    const newCheckedItems = { ...checkedItems };

    // Pegar todos os itens deste mercado
    const marketItems = bestPricesData.marketGroups.find(
      group => group.market._id === marketId
    )?.items || [];

    // Desmarcar todos
    marketItems.forEach(item => {
      newCheckedItems[item._id] = false;
    });

    setCheckedItems(newCheckedItems);

    // Salvar no servidor
    try {
      await updateCheckedItems(id, newCheckedItems);
      setSuccess('Itens atualizados com sucesso!');
    } catch (err) {
      console.error(err);
      setError('Erro ao atualizar itens. Tente novamente.');
    }
  };

  // Função para imprimir o checklist
  const handlePrintChecklist = () => {
    window.print();
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

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
            _id: productId, // Adicionar ID para checklist
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

  // Obter a lista de produtos com os melhores preços de cada supermercado
  const getBestPricesPerProduct = () => {
    if (!comparisonResults) return null;

    const bestPrices = [];

    // Para cada produto
    Object.keys(comparisonResults).forEach(productId => {
      const productData = comparisonResults[productId];

      // Se houver preços para este produto
      if (productData.prices && productData.prices.length > 0) {
        // Ordenar preços do mais barato para o mais caro
        const sortedPrices = [...productData.prices].sort((a, b) => a.price - b.price);

        // Pegar o preço mais barato
        const bestPrice = sortedPrices[0];

        const productQuantity = list.items.find(
          item => item.product._id === productId
        )?.quantity || 1;

        bestPrices.push({
          _id: productId, // Adicionar ID para checklist
          product: productData.product,
          market: bestPrice.market,
          price: bestPrice.price,
          quantity: productQuantity,
          subtotal: bestPrice.price * productQuantity
        });
      }
    });

    // Organizar por mercado
    const marketGroups = {};

    bestPrices.forEach(item => {
      const marketId = item.market._id;

      if (!marketGroups[marketId]) {
        marketGroups[marketId] = {
          market: item.market,
          items: [],
          total: 0
        };
      }

      marketGroups[marketId].items.push(item);
      marketGroups[marketId].total += item.subtotal;
    });

    return {
      bestPrices,
      marketGroups: Object.values(marketGroups).sort((a, b) => a.market.name.localeCompare(b.market.name)),
      totalSavings: calculateTotalSavings(bestPrices)
    };
  };

  // Calcular quanto economizaria comprando os produtos mais baratos de cada mercado
  const calculateTotalSavings = (bestPrices) => {
    if (!bestPrices || !sortedMarkets || !sortedMarkets.length) return 0;

    // Total da melhor lista (todos produtos no melhor mercado)
    const bestMarketTotal = sortedMarkets[0].total;

    // Total comprando cada produto no mercado mais barato
    const bestPricesTotal = bestPrices.reduce((total, item) => total + item.subtotal, 0);

    return bestMarketTotal - bestPricesTotal;
  };

  const isListFinalized = (list) => {
    if (!list) return false;

    // Verificações em ordem de prioridade

    // 1. Verificação direta do campo booleano
    if (list.finalized === true) return true;

    // 2. Verificação do campo finalized como string (pode acontecer em APIs)
    if (list.finalized === 'true' || list.finalized === '1') return true;

    // 3. Verificar se há data de finalização
    if (list.finalizedAt) return true;

    // 4. Verificar se há opção de finalização definida
    if (list.finalizeOption && ['single', 'best'].includes(list.finalizeOption)) return true;

    // 5. Verificar se tem campo checkedItems (só listas finalizadas têm)
    if (list.checkedItems && Object.keys(list.checkedItems).length > 0) return true;

    // 6. Verificar se tem resultados de comparação (só listas finalizadas têm)
    if (list.comparisonResults) return true;

    // Se nenhuma condição for atendida, a lista não está finalizada
    return false;
  };

  // Calcular progresso do checklist
  const calculateProgress = () => {
    if (!list || !list.finalized) return 0;

    const totalItems = list.items.length;
    if (totalItems === 0) return 100; // Lista vazia, 100% completa

    const checkedCount = Object.values(checkedItems).filter(Boolean).length;
    return Math.round((checkedCount / totalItems) * 100);
  };

  // Filtrar itens pelo status de "checado" se necessário
  const filterItemsByChecked = (items) => {
    if (!showOnlyRemaining) return items;
    return items.filter(item => !checkedItems[item._id]);
  };

  const sortedMarkets = comparisonResults ? getBestMarket() : [];
  const bestPricesData = comparisonResults ? getBestPricesPerProduct() : null;

  // Verificar se tem itens em múltiplos mercados para exibir as tabs
  const hasMultipleMarkets = list?.finalized && list.finalizeOption === 'best' &&
    bestPricesData && bestPricesData.marketGroups && bestPricesData.marketGroups.length > 1;

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

  // Renderizar lista finalizada (checklist)
  const isFinalized = isListFinalized(list);
  console.log('A lista está finalizada?', isFinalized, 'baseado em:', {
    'finalized===true': list.finalized === true,
    'finalized===string': typeof list.finalized === 'string' ? list.finalized : null,
    'tem finalizedAt': !!list.finalizedAt,
    'tem finalizeOption': list.finalizeOption,
    'tem checkedItems': list.checkedItems && Object.keys(list.checkedItems).length > 0,
    'tem comparisonResults': !!list.comparisonResults
  });

  if (isFinalized) {
    // Renderizar lista não finalizada (interface normal)
    return (
      <Container maxWidth="lg">
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
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate('/shopping-lists')}
                  sx={{ mr: 2 }}
                >
                  Voltar
                </Button>
                <Box>
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
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenProductDialog}
                sx={{ borderRadius: 8 }}
              >
                Adicionar Item
              </Button>

              {list.items.length > 0 && (
                <Button
                  variant="outlined"
                  startIcon={<CompareArrowsIcon />}
                  onClick={handleCompareList}
                  disabled={comparing}
                  sx={{ borderRadius: 8 }}
                >
                  Comparar Preços
                </Button>
              )}
            </Grid>
          </Grid>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        {/* Seção de Comparação de Preços */}
        <Collapse in={showComparison} sx={{ mb: 3 }}>
          {comparing ? (
            <Paper sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography>Comparando preços em diferentes supermercados...</Typography>
            </Paper>
          ) : (
            <>
              {comparisonResults && sortedMarkets.length > 0 && (
                <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 1.5, px: 2 }}>
                    <Typography variant="h6">
                      Comparação de Preços
                    </Typography>
                  </Box>

                  <Tabs
                    value={comparisonTab}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    indicatorColor="primary"
                    textColor="primary"
                  >
                    <Tab label="Melhor Supermercado" />
                    <Tab label="Melhores Preços" />
                  </Tabs>

                  {/* Tab 1: Melhor Supermercado */}
                  {comparisonTab === 0 && (
                    <Box sx={{ p: 0 }}>
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
                                <TableRow key={item._id || item.product._id}>
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
                    </Box>
                  )}

                  {/* Tab 2: Melhores Preços por Produto */}
                  {comparisonTab === 1 && bestPricesData && (
                    <Box sx={{ p: 0 }}>
                      <Box sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocalOfferIcon sx={{ mr: 1 }} />
                          <Typography variant="subtitle1" fontWeight="bold">
                            Melhores Preços por Produto
                          </Typography>
                        </Box>
                        <Typography variant="h5" fontWeight="bold">
                          Economia: R$ {bestPricesData.totalSavings.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Comparado com comprar tudo no mesmo supermercado
                        </Typography>
                      </Box>

                      <Divider />

                      {bestPricesData.marketGroups.map((marketGroup, groupIndex) => (
                        <Box key={marketGroup.market._id}>
                          <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.03)' }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {marketGroup.market.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {marketGroup.items.length} {marketGroup.items.length === 1 ? 'item' : 'itens'} •
                              Total: R$ {marketGroup.total.toFixed(2)}
                            </Typography>
                          </Box>

                          <TableContainer>
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
                                {marketGroup.items.map((item) => (
                                  <TableRow key={item._id || item.product._id}>
                                    <TableCell>
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body2" noWrap>
                                          {item.product.name}
                                        </Typography>
                                        <Chip
                                          label="Melhor preço"
                                          color="success"
                                          size="small"
                                          variant="outlined"
                                          icon={<LocalOfferIcon />}
                                          sx={{ ml: 1, height: 20 }}
                                        />
                                      </Box>
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
                              </TableBody>
                            </Table>
                          </TableContainer>

                          {groupIndex < bestPricesData.marketGroups.length - 1 && <Divider />}
                        </Box>
                      ))}

                      <Box sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
                        <Grid container justifyContent="space-between" alignItems="center">
                          <Grid item>
                            <Typography variant="subtitle1" fontWeight="bold">
                              Total Comprando nos Melhores Preços:
                            </Typography>
                          </Grid>
                          <Grid item>
                            <Typography variant="h6" fontWeight="bold">
                              R$ {bestPricesData.bestPrices.reduce((total, item) => total + item.subtotal, 0).toFixed(2)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>
                  )}

                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                    <Button
                      variant="text"
                      onClick={() => setShowComparison(false)}
                    >
                      Ocultar Comparação
                    </Button>
                  </Box>
                </Paper>
              )}
            </>
          )}
        </Collapse>

        {/* Lista de Produtos */}
        <Paper sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
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
                Adicione produtos para começar
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenProductDialog}
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
                    <TableCell>Detalhes</TableCell>
                    <TableCell align="center">Quantidade</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {list.items.map((item) => (
                    <TableRow key={item._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar
                            variant="rounded"
                            src={item.product.image ? `http://localhost:5000${item.product.image}` : undefined}
                            alt={item.product.name}
                            sx={{ width: 40, height: 40, mr: 2 }}
                          >
                            {!item.product.image && item.product.name.charAt(0)}
                          </Avatar>
                          <Typography variant="body1" fontWeight="medium">
                            {item.product.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {item.product.brand}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {item.product.unitSize} {item.product.unit}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={item.quantity}
                          size="small"
                          onClick={() => handleOpenEditDialog(item)}
                          sx={{ cursor: 'pointer' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleOpenEditDialog(item)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleRemoveItem(item.product._id)}
                          disabled={removing}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Diálogo para adicionar produto */}
        <AddProductDialog
          open={openProductDialog}
          onClose={handleCloseProductDialog}
          onAddProduct={handleAddProduct}
        />

        {/* Diálogo para editar quantidade */}
        <Dialog
          open={editDialogOpen}
          onClose={handleCloseEditDialog}
          PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle>Editar Quantidade</DialogTitle>
          <DialogContent>
            {editingItem && (
              <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    variant="rounded"
                    src={editingItem.product.image ? `http://localhost:5000${editingItem.product.image}` : undefined}
                    alt={editingItem.product.name}
                    sx={{ width: 50, height: 50, mr: 2 }}
                  >
                    {!editingItem.product.image && editingItem.product.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{editingItem.product.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {editingItem.product.brand} • {editingItem.product.unitSize} {editingItem.product.unit}
                    </Typography>
                  </Box>
                </Box>

                <TextField
                  fullWidth
                  label="Quantidade"
                  type="number"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  InputProps={{ inputProps: { min: 1 } }}
                  helperText="Quantidade mínima: 1"
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog}>Cancelar</Button>
            <Button
              onClick={handleUpdateQuantity}
              variant="contained"
              disabled={updating || !newQuantity || newQuantity < 1}
            >
              {updating ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
  } 
  };

  export default ShoppingListDetailsPage;