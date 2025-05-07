const express = require('express');
const ShoppingList = require('../models/ShoppingList');
const Product = require('../models/Product');
const Price = require('../models/Price'); // Esta importação é essencial
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

// Adicionar esta rota ao arquivo backend/routes/shoppingLists.js

// Atualizar quantidade de um item na lista (apenas Premium)
router.put('/:id/items/:productId', protect, restrictTo('premium', 'admin'), async (req, res) => {
  try {
    const { quantity } = req.body;
    
    // Verificar se a quantidade é válida
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Quantidade inválida' });
    }
    
    const list = await ShoppingList.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!list) {
      return res.status(404).json({ message: 'Lista de compras não encontrada' });
    }
    
    // Encontrar o item na lista
    const itemIndex = list.items.findIndex(
      item => item.product.toString() === req.params.productId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item não encontrado na lista' });
    }
    
    // Atualizar quantidade
    list.items[itemIndex].quantity = quantity;
    list.updatedAt = Date.now();
    
    await list.save();
    
    res.json(list);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao atualizar quantidade', error: error.message });
  }
});

// Adicionar estas rotas ao arquivo backend/routes/shoppingLists.js

router.put('/:id/finalize', protect, restrictTo('premium', 'admin'), async (req, res) => {
  try {
    console.log('Requisição para finalizar lista recebida:', req.params.id);
    console.log('Opção de finalização:', req.body.finalizeOption);
    
    const { finalizeOption } = req.body;
    
    // Verificar se a opção de finalização é válida
    if (!['single', 'best'].includes(finalizeOption)) {
      console.log('Opção de finalização inválida:', finalizeOption);
      return res.status(400).json({ message: 'Opção de finalização inválida' });
    }
    
    const list = await ShoppingList.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('items.product', 'name brand category unitSize unit image');
    
    if (!list) {
      console.log('Lista não encontrada');
      return res.status(404).json({ message: 'Lista de compras não encontrada' });
    }
    
    // Verificar se a lista já está finalizada
    if (list.finalized) {
      console.log('Lista já está finalizada');
      return res.status(400).json({ message: 'Lista já está finalizada' });
    }
    
    console.log('Lista encontrada, itens:', list.items.length);
    
    // Obter resultados de comparação de preços
    const productIds = list.items.map(item => item.product._id);
    
    // Buscar preços no banco de dados
    const prices = await Price.find({ product: { $in: productIds } })
      .populate('product', 'name brand category unitSize unit image')
      .populate('market', 'name address');
    
    console.log('Preços encontrados:', prices.length);
    
    // Organizar preços por produto
    const comparisonResults = {};
    productIds.forEach(productId => {
      const productPrices = prices.filter(price => 
        price.product._id.toString() === productId.toString()
      );
      
      comparisonResults[productId.toString()] = {
        product: list.items.find(item => 
          item.product._id.toString() === productId.toString()
        ).product,
        prices: productPrices
      };
    });
    
    console.log('Resultados de comparação gerados');
    
    // Definir diretamente os campos
    list.finalized = true;
    list.finalizedAt = new Date();
    list.finalizeOption = finalizeOption;
    list.comparisonResults = comparisonResults;
    list.checkedItems = {};
    
    console.log('Antes de salvar - finalized:', list.finalized);
    console.log('Antes de salvar - finalizeOption:', list.finalizeOption);
    
    // Usar o método save para garantir que os middleware pre-save serão executados
    await list.save();
    
    // Buscar a lista atualizada para verificar se os campos foram salvos
    const updatedList = await ShoppingList.findById(list._id);
    console.log('Após salvar - finalized:', updatedList.finalized);
    console.log('Após salvar - finalizeOption:', updatedList.finalizeOption);
    
    // Retornar os dados atualizados
    return res.json(updatedList);
  } catch (error) {
    console.error('Erro ao finalizar lista:', error);
    res.status(500).json({ message: 'Erro ao finalizar lista', error: error.message });
  }
});


// Atualizar itens marcados (checklist) de uma lista finalizada (apenas Premium)
router.put('/:id/checked-items', protect, restrictTo('premium', 'admin'), async (req, res) => {
  try {
    const { checkedItems } = req.body;
    
    // Verificar se checkedItems é um objeto
    if (!checkedItems || typeof checkedItems !== 'object') {
      return res.status(400).json({ message: 'Formato de dados inválido' });
    }
    
    const list = await ShoppingList.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!list) {
      return res.status(404).json({ message: 'Lista de compras não encontrada' });
    }
    
    // Verificar se a lista está finalizada
    if (!list.finalized) {
      return res.status(400).json({ message: 'Lista não está finalizada' });
    }
    
    // Atualizar checklist
    list.checkedItems = checkedItems;
    await list.save();
    
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar checklist', error: error.message });
  }
});

module.exports = router;

