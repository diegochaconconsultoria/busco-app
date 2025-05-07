const express = require('express');
const User = require('../models/User');
const { protect, restrictTo } = require('../middleware/auth');
const router = express.Router();

// Obter todos os usuários (apenas admin)
router.get('/', protect, restrictTo('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuários', error: error.message });
  }
});

// Obter um usuário específico (próprio usuário ou admin)
router.get('/:id', protect, async (req, res) => {
  try {
    // Verificar se o usuário está tentando acessar seu próprio perfil ou é um admin
    if (req.user._id.toString() !== req.params.id && req.user.accountType !== 'admin') {
      return res.status(403).json({ 
        message: 'Acesso negado. Você só pode ver seu próprio perfil.'
      });
    }
    
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuário', error: error.message });
  }
});

// Atualizar usuário (próprio usuário ou admin)
router.put('/:id', protect, async (req, res) => {
  try {
    // Verificar se o usuário está tentando atualizar seu próprio perfil ou é um admin
    const isOwnProfile = req.user._id.toString() === req.params.id;
    const isAdmin = req.user.accountType === 'admin';
    
    if (!isOwnProfile && !isAdmin) {
      return res.status(403).json({ 
        message: 'Acesso negado. Você só pode atualizar seu próprio perfil.'
      });
    }
    
    // Se não for admin, restringir campos que podem ser atualizados
    let updateData = req.body;
    if (!isAdmin) {
      // Usuários normais só podem atualizar nome e senha
      const { name, password } = req.body;
      updateData = { name };
      
      // Se a senha for fornecida, ela será automaticamente hasheada pelo middleware no modelo
      if (password) {
        updateData.password = password;
      }
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao atualizar usuário', error: error.message });
  }
});

// Excluir usuário (apenas admin)
router.delete('/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    res.json({ message: 'Usuário removido com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover usuário', error: error.message });
  }
});

module.exports = router;