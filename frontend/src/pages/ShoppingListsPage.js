import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Button, CircularProgress, Alert, Box, 
  Grid, Paper, Card, CardContent, Avatar, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, Tooltip, IconButton,
  Chip, DialogContentText, RadioGroup, Radio, FormControlLabel,
  Snackbar
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { 
  getUserLists, createList, deleteList, finalizeList 
} from '../api/shoppingLists';

const ShoppingListsPage = () => {
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estado para mensagem de redirecionamento
  const [redirectMessage, setRedirectMessage] = useState('');
  const [redirectingTo, setRedirectingTo] = useState(null);
  
  // Estado para diálogo de nova lista
  const [openDialog, setOpenDialog] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Estado para diálogo de finalizar lista
  const [finalizeDialogOpen, setFinalizeDialogOpen] = useState(false);
  const [selectedListId, setSelectedListId] = useState(null);
  const [selectedListName, setSelectedListName] = useState('');
  const [finalizeOption, setFinalizeOption] = useState('single');
  const [finalizing, setFinalizing] = useState(false);

  useEffect(() => {
    fetchLists();
  }, []);
  
  // Redirecionamento com delay
  useEffect(() => {
    if (redirectingTo) {
      const timer = setTimeout(() => {
        navigate(redirectingTo);
        setRedirectingTo(null);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [redirectingTo, navigate]);

  const fetchLists = async () => {
    setLoading(true);
    try {
      const response = await getUserLists();
      setLists(response.data);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar listas de compras. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setNewListName('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      return;
    }
    
    setCreating(true);
    try {
      const response = await createList({ name: newListName.trim() });
      setSuccess('Lista criada com sucesso!');
      handleCloseDialog();
      fetchLists();
      
      // Navigate to the newly created list
      navigate(`/shopping-lists/${response.data._id}`);
    } catch (err) {
      console.error(err);
      setError('Erro ao criar lista. Tente novamente.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteList = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta lista?')) {
      return;
    }
    
    setDeleting(true);
    try {
      await deleteList(id);
      setSuccess('Lista excluída com sucesso!');
      fetchLists();
    } catch (err) {
      console.error(err);
      setError('Erro ao excluir lista. Tente novamente.');
    } finally {
      setDeleting(false);
    }
  };

  // Funções para finalizar lista
  const handleOpenFinalizeDialog = (listId, listName) => {
    setSelectedListId(listId);
    setSelectedListName(listName);
    setFinalizeOption('single');
    setFinalizeDialogOpen(true);
  };

  const handleCloseFinalizeDialog = () => {
    setFinalizeDialogOpen(false);
    setSelectedListId(null);
    setSelectedListName('');
  };

  const handleFinalizeList = async () => {
    if (!selectedListId) return;
    
    setFinalizing(true);
    try {
      await finalizeList(selectedListId, { finalizeOption });
      
      // Fechar o diálogo e mostrar mensagem de sucesso
      handleCloseFinalizeDialog();
      
      // Atualizar a lista local
      fetchLists();
      
      // Preparar redirecionamento com mensagem
      setRedirectMessage(
        `Lista "${selectedListName}" finalizada com sucesso! Redirecionando para o checklist...`
      );
      setRedirectingTo(`/shopping-lists/${selectedListId}`);
      
    } catch (err) {
      console.error(err);
      setError('Erro ao finalizar lista. Tente novamente.');
    } finally {
      setFinalizing(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  const handleViewList = (id) => {
    navigate(`/shopping-lists/${id}`);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Minhas Listas de Compras
        </Typography>
        
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{ borderRadius: 8 }}
        >
          Nova Lista
        </Button>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
      
      {/* Mensagem de redirecionamento */}
      <Snackbar
        open={!!redirectMessage}
        message={redirectMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            bgcolor: 'success.main',
            minWidth: '80%'
          }
        }}
      />
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {lists.length === 0 ? (
            <Paper sx={{ mb: 4, p: 3, textAlign: 'center', borderRadius: 2 }}>
              <ShoppingCartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" gutterBottom>
                Você ainda não tem nenhuma lista de compras
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Crie sua primeira lista para começar a adicionar produtos
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleOpenDialog}
                sx={{ mt: 2, borderRadius: 8 }}
              >
                Criar Minha Primeira Lista
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {lists.map((list) => (
                <Grid item xs={12} sm={6} key={list._id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      borderRadius: 2,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      boxShadow: list.finalized ? '0 0 0 2px #4CAF50' : 'inherit',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: list.finalized ? '0 8px 16px rgba(76, 175, 80, 0.25)' : '0 8px 16px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: list.finalized ? 'success.main' : 'primary.main',
                              color: 'white',
                              width: 40,
                              height: 40,
                              mr: 1.5
                            }}
                          >
                            {list.finalized ? <DoneAllIcon /> : <ShoppingCartIcon />}
                          </Avatar>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="h6" sx={{ mr: 1 }}>
                                {list.name}
                              </Typography>
                              {list.finalized && (
                                <Chip 
                                  label="Finalizada" 
                                  color="success" 
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              Criada em {formatDate(list.createdAt)}
                            </Typography>
                            {list.finalized && (
                              <Typography variant="body2" color="text.secondary">
                                Finalizada em {formatDate(list.finalizedAt)}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        {!list.finalized && (
                          <IconButton 
                            color="error"
                            onClick={() => handleDeleteList(list._id)}
                            disabled={deleting}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                      
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          {list.items.length} {list.items.length === 1 ? 'item' : 'itens'}
                        </Typography>
                        
                        {list.finalized && list.finalizeOption === 'best' && (
                          <Typography variant="body2" color="success.main" sx={{ mt: 0.5, display: 'flex', alignItems: 'center' }}>
                            <LocalOfferIcon fontSize="small" sx={{ mr: 0.5 }} />
                            Melhores preços por mercado
                          </Typography>
                        )}
                        
                        {list.finalized && list.finalizeOption === 'single' && (
                          <Typography variant="body2" color="primary.main" sx={{ mt: 0.5, display: 'flex', alignItems: 'center' }}>
                            <StorefrontIcon fontSize="small" sx={{ mr: 0.5 }} />
                            Comprar em um único supermercado
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                          <Button
                            variant="contained"
                            color={list.finalized ? "success" : "primary"}
                            fullWidth
                            startIcon={list.finalized ? <DoneAllIcon /> : <VisibilityIcon />}
                            onClick={() => handleViewList(list._id)}
                            sx={{ 
                              borderRadius: 8,
                              textTransform: 'none'
                            }}
                          >
                            {list.finalized ? 'Ver Checklist' : 'Visualizar Lista'}
                          </Button>
                          
                          {!list.finalized && list.items.length > 0 && (
                            <Button
                              variant="outlined"
                              color="primary"
                              fullWidth
                              startIcon={<DoneAllIcon />}
                              onClick={() => handleOpenFinalizeDialog(list._id, list.name)}
                              sx={{ 
                                borderRadius: 8,
                                textTransform: 'none'
                              }}
                            >
                              Finalizar
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
      
      {/* Diálogo para criar nova lista */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>Nova Lista de Compras</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome da Lista"
            fullWidth
            variant="outlined"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="Ex: Compras do mês"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button 
            onClick={handleCreateList} 
            variant="contained"
            disabled={creating || !newListName.trim()}
          >
            {creating ? 'Criando...' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Diálogo para finalizar lista */}
      <Dialog
        open={finalizeDialogOpen}
        onClose={handleCloseFinalizeDialog}
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>Finalizar Lista "{selectedListName}"</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Escolha como deseja finalizar sua lista de compras:
          </DialogContentText>
          
          <RadioGroup
            aria-label="finalize-option"
            name="finalize-option"
            value={finalizeOption}
            onChange={(e) => setFinalizeOption(e.target.value)}
          >
            <Paper sx={{ mb: 2, p: 2, border: finalizeOption === 'single' ? '2px solid #1976d2' : '1px solid #e0e0e0' }}>
              <FormControlLabel 
                value="single" 
                control={<Radio />} 
                sx={{ width: '100%', m: 0 }}
                label={
                  <Box sx={{ ml: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StorefrontIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="subtitle1" fontWeight="medium">
                        Finalizar em um único supermercado
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Gerar um checklist para comprar todos os itens em um único local.
                    </Typography>
                  </Box>
                }
              />
            </Paper>
            
            <Paper sx={{ p: 2, border: finalizeOption === 'best' ? '2px solid #1976d2' : '1px solid #e0e0e0' }}>
              <FormControlLabel 
                value="best" 
                control={<Radio />} 
                sx={{ width: '100%', m: 0 }}
                label={
                  <Box sx={{ ml: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocalOfferIcon sx={{ mr: 1, color: 'success.main' }} />
                      <Typography variant="subtitle1" fontWeight="medium">
                        Finalizar por melhor preço
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Gerar um checklist dividido por supermercado, com os melhores preços para cada item.
                    </Typography>
                  </Box>
                }
              />
            </Paper>
          </RadioGroup>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            Após finalizar, a lista não poderá mais ser editada, mas ficará disponível para consulta com um checklist para uso durante as compras.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFinalizeDialog}>Cancelar</Button>
          <Button 
            variant="contained"
            onClick={handleFinalizeList}
            disabled={finalizing}
          >
            {finalizing ? 'Finalizando...' : 'Finalizar Lista'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ShoppingListsPage;