const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importar rotas
const authRoutes = require('./routes/auth');
const marketRoutes = require('./routes/markets');
const productRoutes = require('./routes/products');
const priceRoutes = require('./routes/prices');
const shoppingListRoutes = require('./routes/shoppingLists');
const userRoutes = require('./routes/users'); // Se existir

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
/*app.use(cors({
  origin: 'http://localhost:3000', // URL do frontend
  credentials: true
}));*/

app.use(cors({
  origin: '*', // Em produção, você deve restringir isso para domínios específicos
  credentials: true
}));


app.use(express.json());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API do Buscô está funcionando!' });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/markets', marketRoutes);
app.use('/api/products', productRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/shopping-lists', shoppingListRoutes);
if (userRoutes) app.use('/api/users', userRoutes); // Se existir

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Iniciar servidor
/*app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});*/

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse em http://192.168.0.117:${PORT}`);
});