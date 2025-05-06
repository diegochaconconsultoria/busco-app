const express = require('express');
const Market = require('../models/Market');
const { protect, restrictTo } = require('../middleware/auth');
const router = express.Router();

// Obter todos os supermercados
router.get('/', async (req, res) => {
  try {
    const markets = await Market.find({ active: true });
    res.json(markets);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar supermercados', error: error.message });
  }
});

// Obter um supermercado específico
router.get('/:id', async (req, res) => {
  try {
    const market = await Market.findById(req.params.id);
    if (!market) {
      return res.status(404).json({ message: 'Supermercado não encontrado' });
    }
    res.json(market);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar supermercado', error: error.message });
  }
});

// Adicionar novo supermercado (apenas admin)
router.post('/', protect, restrictTo('admin'), async (req, res) => {
  try {
    const market = new Market(req.body);
    await market.save();
    res.status(201).json(market);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao cadastrar supermercado', error: error.message });
  }
});

// Atualizar supermercado (apenas admin)
router.put('/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const market = await Market.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!market) {
      return res.status(404).json({ message: 'Supermercado não encontrado' });
    }
    res.json(market);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao atualizar supermercado', error: error.message });
  }
});

// Desativar supermercado (soft delete) (apenas admin)
router.delete('/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const market = await Market.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );
    if (!market) {
      return res.status(404).json({ message: 'Supermercado não encontrado' });
    }
    res.json({ message: 'Supermercado desativado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao desativar supermercado', error: error.message });
  }
});

module.exports = router;