import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Button, CircularProgress, Alert, Box, 
  List, ListItem, Divider, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Paper, Grid, Tooltip
} from '@mui/material';
import { Link } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { getUserLists, createList, deleteList } from '../api/shoppingLists';

const ShoppingListsPage = () => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchLists();
  }, []);

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
      await createList({ name: newListName.trim() });
      setSuccess('Lista criada com sucesso!');
      handleCloseDialog();
      fetchLists();
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

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
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
                Crie sua primeira lista para começar a comparar preços
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
            <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
                {lists.map((list, index) => (
                  <React.Fragment key={list._id}>
                    <ListItem sx={{ py: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={4}>
                          <Typography variant="body1" fontWeight="medium">
                            {list.name}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2">
                            Emissão: {formatDate(list.createdAt)}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2">
                            {list.items.length} {list.items.length === 1 ? 'item' : 'itens'}
                          </Typography>
                        </Grid>
                        <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Tooltip title="Visualizar">
                            <IconButton 
                              component={Link} 
                              to={`/shopping-lists/${list._id}`}
                              color="primary"
                              size="small"
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir">
                            <IconButton 
                              onClick={() => handleDeleteList(list._id)}
                              color="error"
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Grid>
                      </Grid>
                    </ListItem>
                    {index < lists.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          )}
        </>
      )}
      
      {/* Diálogo para criar nova lista */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
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
    </Container>
  );
};

export default ShoppingListsPage;