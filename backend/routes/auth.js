const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Rota para registro de usuário
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Verificar se o usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Este email já está em uso' });
    }
    
    // Criar novo usuário
    const user = new User({
      name,
      email,
      password
    });
    
    await user.save();
    
    // Gerar token JWT
    const token = jwt.sign(
      { userId: user._id, accountType: user.accountType },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        accountType: user.accountType
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao registrar usuário', error: error.message });
  }
});

// Rota para registro de administrador (temporária)
router.post('/register-admin', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Verificar se o usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Este email já está em uso' });
    }
    
    // Criar admin
    const user = new User({
      name,
      email,
      password,
      accountType: 'admin'
    });
    
    await user.save();
    
    // Gerar token JWT
    const token = jwt.sign(
      { userId: user._id, accountType: user.accountType },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'Administrador registrado com sucesso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        accountType: user.accountType
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao registrar administrador', error: error.message });
  }
});

// Rota para login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Verificar se o usuário existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }
    
    // Verificar senha
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }
    
    // Gerar token JWT
    const token = jwt.sign(
      { userId: user._id, accountType: user.accountType },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        accountType: user.accountType
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao fazer login', error: error.message });
  }
});

module.exports = router;