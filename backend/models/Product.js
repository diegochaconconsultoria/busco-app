const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  brand: String,
  category: {
    type: String,
    required: true
  },
  subCategory: String,
  unit: {
    type: String,
    enum: ['un', 'kg', 'g', 'ml', 'l'],
    default: 'un'
  },
  unitSize: Number,
  barcode: String,
  image: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);