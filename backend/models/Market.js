const mongoose = require('mongoose');

const marketSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    street: String,
    number: String,
    neighborhood: String,
    city: {
      type: String,
      default: 'Jaú'
    },
    state: {
      type: String,
      default: 'SP'
    },
    zipCode: String
  },
  phone: String,
  hasAPI: {
    type: Boolean,
    default: false
  },
  apiDetails: {
    url: String,
    key: String,
    active: {
      type: Boolean,
      default: false
    }
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Market', marketSchema);