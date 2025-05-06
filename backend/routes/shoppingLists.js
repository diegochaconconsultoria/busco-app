const express = require('express');
const ShoppingList = require('../models/ShoppingList');
const Product = require('../models/Product');
const { protect, restrictTo } = require('../middleware/auth');
const router = express.Router();

// Obter todas as listas de compras do usuário (apenas Premium)
router.get('/', protect, restrictTo('premium', 'admin'), async (req, res) => {
  try {
    const lists = await ShoppingList.find({ user: req.user._id })
      .populate('items.product', 'name brand category unitSize unit');
    
    res.json(lists);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar listas de compras', error: error.message });
  }
});

// Obter uma lista específica (apenas Premium)
router.get('/:id', protect, restrictTo('premium', 'admin'), async (req, res) => {
  try {
    const list = await ShoppingList.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('items.product', 'name brand category unitSize unit');
    
    if (!list) {
      return res.status(404).json({ message: 'Lista de compras não encontrada' });
    }
    
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar lista de compras', error: error.message });
  }
});

// Criar nova lista de compras (apenas Premium)
router.post('/', protect, restrictTo('premium', 'admin'), async (req, res) => {
  try {
    const { name, items } = req.body;
    
    // Validar itens da lista
    if (items && items.length > 0) {
      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(400).json({ message: `Produto ${item.product} não encontrado` });
        }
      }
    }
    
    const list = new ShoppingList({
      user: req.user._id,
      name: name || 'Minha Lista',
      items: items || []
    });
    
    await list.save();
    res.status(201).json(list);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao criar lista de compras', error: error.message });
  }
});

// Atualizar lista de compras (apenas Premium)
router.put('/:id', protect, restrictTo('premium', 'admin'), async (req, res) => {
  try {
    const { name, items } = req.body;
    
    // Validar itens da lista
    if (items && items.length > 0) {
      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(400).json({ message: `Produto ${item.product} não encontrado` });
        }
      }
    }
    
    const list = await ShoppingList.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        name,
        items,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );
    
    if (!list) {
      return res.status(404).json({ message: 'Lista de compras não encontrada' });
    }
    
    res.json(list);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao atualizar lista de compras', error: error.message });
  }
});

// Adicionar item à lista (apenas Premium)
router.post('/:id/items', protect, restrictTo('premium', 'admin'), async (req, res) => {
  try {
    const { product, quantity } = req.body;
    
    // Verificar se o produto existe
    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(400).json({ message: 'Produto não encontrado' });
    }
    
    const list = await ShoppingList.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!list) {
      return res.status(404).json({ message: 'Lista de compras não encontrada' });
    }
    
    // Verificar se o produto já está na lista
    const existingItemIndex = list.items.findIndex(
      item => item.product.toString() === product
    );
    
    if (existingItemIndex !== -1) {
      // Atualizar quantidade se o produto já estiver na lista
      list.items[existingItemIndex].quantity = quantity || list.items[existingItemIndex].quantity;
    } else {
      // Adicionar novo item à lista
      list.items.push({
        product,
        quantity: quantity || 1
      });
    }
    
    list.updatedAt = Date.now();
    await list.save();
    
    res.json(list);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao adicionar item à lista', error: error.message });
  }
});

// Remover item da lista (apenas Premium)
router.delete('/:id/items/:productId', protect, restrictTo('premium', 'admin'), async (req, res) => {
  try {
    const list = await ShoppingList.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!list) {
      return res.status(404).json({ message: 'Lista de compras não encontrada' });
    }
    
    // Filtrar itens para remover o produto
    list.items = list.items.filter(
      item => item.product.toString() !== req.params.productId
    );
    
    list.updatedAt = Date.now();
    await list.save();
    
    res.json(list);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao remover item da lista', error: error.message });
  }
});

// Excluir lista de compras (apenas Premium)
router.delete('/:id', protect, restrictTo('premium', 'admin'), async (req, res) => {
  try {
    const list = await ShoppingList.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!list) {
      return res.status(404).json({ message: 'Lista de compras não encontrada' });
    }
    
    res.json({ message: 'Lista de compras removida com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover lista de compras', error: error.message });
  }
});

module.exports = router;