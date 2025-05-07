const express = require('express');
const Price = require('../models/Price');
const Product = require('../models/Product');
const Market = require('../models/Market');
const { protect, restrictTo } = require('../middleware/auth');
const router = express.Router();

// Obter preços de um produto em todos os supermercados
router.get('/product/:productId', async (req, res) => {
  try {
    const prices = await Price.find({ product: req.params.productId })
      .populate('market', 'name address')
      .sort('price');
    
    res.json(prices);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar preços', error: error.message });
  }
});

// Obter preços de todos os produtos em um supermercado
router.get('/market/:marketId', async (req, res) => {
  try {
    const prices = await Price.find({ market: req.params.marketId })
      .populate('product', 'name brand category unitSize unit');
    
    res.json(prices);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar preços', error: error.message });
  }
});

// Adicionar ou atualizar preço (admin)
router.post('/', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { product: productId, market: marketId, price, isPromotion, promotionEndDate } = req.body;
    
    // Verificar se produto e mercado existem
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    
    const market = await Market.findById(marketId);
    if (!market) {
      return res.status(404).json({ message: 'Supermercado não encontrado' });
    }
    
    // Verificar se já existe um preço para este produto/mercado
    let priceRecord = await Price.findOne({ product: productId, market: marketId });
    
    if (priceRecord) {
      // Atualizar preço existente
      priceRecord.price = price;
      priceRecord.isPromotion = isPromotion || false;
      priceRecord.promotionEndDate = promotionEndDate;
      priceRecord.updatedBy = req.user._id;
      priceRecord.updatedAt = Date.now();
      
      await priceRecord.save();
      res.json(priceRecord);
    } else {
      // Criar novo preço
      priceRecord = new Price({
        product: productId,
        market: marketId,
        price,
        isPromotion: isPromotion || false,
        promotionEndDate,
        updatedBy: req.user._id
      });
      
      await priceRecord.save();
      res.status(201).json(priceRecord);
    }
  } catch (error) {
    res.status(400).json({ message: 'Erro ao salvar preço', error: error.message });
  }
});

// Comparar preços entre supermercados para múltiplos produtos
router.post('/compare', async (req, res) => {
  try {
    const { products } = req.body; // Array de IDs de produtos
    
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Lista de produtos inválida' });
    }
    
    // Buscar preços para todos os produtos
    const prices = await Price.find({ product: { $in: products } })
      .populate('product', 'name brand category unitSize unit')
      .populate('market', 'name address');
    
    // Organizar por produto
    const comparison = {};
    
    prices.forEach(price => {
      const productId = price.product._id.toString();
      
      if (!comparison[productId]) {
        comparison[productId] = {
          product: price.product,
          prices: []
        };
      }
      
      comparison[productId].prices.push({
        market: price.market,
        price: price.price,
        isPromotion: price.isPromotion,
        promotionEndDate: price.promotionEndDate
      });
    });
    
    // Ordenar preços de cada produto (do mais barato para o mais caro)
    Object.keys(comparison).forEach(productId => {
      comparison[productId].prices.sort((a, b) => a.price - b.price);
    });
    
    res.json(comparison);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao comparar preços', error: error.message });
  }
});

module.exports = router;