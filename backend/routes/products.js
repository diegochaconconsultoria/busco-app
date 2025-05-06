const express = require('express');
const Product = require('../models/Product');
const { protect, restrictTo } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configuração do Multer para armazenar as imagens
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/uploads/products/');
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
  }
});

// Filtro para aceitar apenas imagens
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas imagens são permitidas'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

// Obter todos os produtos
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    console.log('Query de busca:', query);
    const products = await Product.find(query);
    console.log(`Encontrados ${products.length} produtos`);
    res.json(products);
  } catch (error) {
    console.error('Erro no servidor:', error);
    res.status(500).json({ message: 'Erro ao buscar produtos', error: error.message });
  }
});

// Obter um produto específico
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar produto', error: error.message });
  }
});

// Adicionar novo produto (apenas admin) com upload de imagem
router.post('/', protect, restrictTo('admin'), upload.single('image'), async (req, res) => {
  try {
    const productData = req.body;
    
    // Se houver uma imagem, adicionar o caminho ao productData
    if (req.file) {
      productData.image = `/uploads/products/${req.file.filename}`;
    }
    
    const product = new Product({
      ...productData,
      createdBy: req.user._id
    });
    
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    // Se ocorrer um erro e houver um arquivo, remover o arquivo
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({ message: 'Erro ao cadastrar produto', error: error.message });
  }
});

// Atualizar produto (apenas admin) com upload de imagem
router.put('/:id', protect, restrictTo('admin'), upload.single('image'), async (req, res) => {
  try {
    const productData = req.body;
    
    // Se houver uma imagem, adicionar o caminho ao productData
    if (req.file) {
      productData.image = `/uploads/products/${req.file.filename}`;
      
      // Verificar se o produto já tinha uma imagem e removê-la
      const existingProduct = await Product.findById(req.params.id);
      if (existingProduct && existingProduct.image) {
        const oldImagePath = path.join(__dirname, '..', 'public', existingProduct.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    
    res.json(product);
  } catch (error) {
    // Se ocorrer um erro e houver um arquivo, remover o arquivo
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({ message: 'Erro ao atualizar produto', error: error.message });
  }
});

// Excluir produto (apenas admin)
router.delete('/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    
    // Se o produto tinha uma imagem, removê-la
    if (product.image) {
      const imagePath = path.join(__dirname, '..', 'public', product.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    res.json({ message: 'Produto removido com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover produto', error: error.message });
  }
});

module.exports = router;