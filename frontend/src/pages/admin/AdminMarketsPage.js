import React, { useState, useEffect } from 'react';
import { 
  Typography, Button, Box, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, CircularProgress, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getAllMarkets, createMarket, updateMarket, deleteMarket } from '../../api/markets';

const AdminMarketsPage = () => {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMarket, setCurrentMarket] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: {
      street: '',
      number: '',
      neighborhood: '',
      city: 'Jaú',
      state: 'SP',
      zipCode: ''
    },
    phone: '',
    hasAPI: false
  });
  
  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    setLoading(true);
    try {
      const response = await getAllMarkets();
      setMarkets(response.data);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar supermercados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (market = null) => {
    if (market) {
      setIsEditing(true);
      setCurrentMarket(market);
      setFormData({
        name: market.name,
        address: { ...market.address },
        phone: market.phone || '',
        hasAPI: market.hasAPI || false
      });
    } else {
      setIsEditing(false);
      setCurrentMarket(null);
      setFormData({
        name: '',
        address: {
          street: '',
          number: '',
          neighborhood: '',
          city: 'Jaú',
          state: 'SP',
          zipCode: ''
        },
        phone: '',
        hasAPI: false
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async () => {
    try {
      if (isEditing && currentMarket) {
        await updateMarket(currentMarket._id, formData);
        setSuccess('Supermercado atualizado com sucesso!');
      } else {
        await createMarket(formData);
        setSuccess('Supermercado criado com sucesso!');
      }
      handleCloseDialog();
      fetchMarkets();
    } catch (err) {
      console.error(err);
      setError('Erro ao salvar supermercado. Tente novamente.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este supermercado?')) {
      return;
    }
    
    try {
      await deleteMarket(id);
      setSuccess('Supermercado excluído com sucesso!');
      fetchMarkets();
    } catch (err) {
      console.error(err);
      setError('Erro ao excluir supermercado. Tente novamente.');
    }
  };

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Gerenciar Supermercados
        </Typography>
        
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Novo Supermercado
        </Button>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Endereço</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {markets.map((market) => (
                <TableRow key={market._id}>
                  <TableCell>{market.name}</TableCell>
                  <TableCell>
                    {market.address.street}, {market.address.number}, {market.address.neighborhood}
                  </TableCell>
                  <TableCell>{market.phone}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(market)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(market._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {markets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Nenhum supermercado cadastrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Diálogo para adicionar/editar supermercado */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditing ? 'Editar Supermercado' : 'Novo Supermercado'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome do Supermercado"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Rua"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Número"
                name="address.number"
                value={formData.address.number}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bairro"
                name="address.neighborhood"
                value={formData.address.neighborhood}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="CEP"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cidade"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Estado"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Telefone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.name || !formData.address.street || !formData.address.number || !formData.address.neighborhood}
          >
            {isEditing ? 'Atualizar' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminMarketsPage;