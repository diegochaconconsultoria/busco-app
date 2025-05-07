// Corrigir o modelo em backend/models/ShoppingList.js

const mongoose = require('mongoose');

// Usando Schema Types explícitos para garantir integridade de dados
const shoppingListSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    default: 'Minha Lista'
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: {
      type: Number,
      default: 1
    }
  }],
  // Campos para finalização explicitamente tipados
  finalized: {
    type: Boolean,
    default: false
  },
  finalizedAt: {
    type: Date,
    default: null
  },
  finalizeOption: {
    type: String,
    enum: ['single', 'best'],
    default: null
  },
  // Armazenar resultados de comparação como um objeto comum (não tipado)
  comparisonResults: mongoose.Schema.Types.Mixed,
  // Armazenar checklist como um objeto comum (não tipado)
  checkedItems: {
    type: Map,
    of: Boolean,
    default: () => new Map()
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Adicionando um pre-save hook para atualizar a data
shoppingListSchema.pre('save', function(next) {
  // Atualizar a data de modificação
  this.updatedAt = Date.now();
  
  // Se a lista está sendo finalizada agora, definir a data de finalização
  if (this.finalized === true && !this.finalizedAt) {
    this.finalizedAt = Date.now();
  }
  
  next();
});

module.exports = mongoose.model('ShoppingList', shoppingListSchema);