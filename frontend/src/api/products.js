import api from './config';

export const getAllProducts = (params = {}) => {
  return api.get('/products', { params });
};

export const getProductById = (id) => {
  return api.get(`/products/${id}`);
};

export const createProduct = (productData) => {
  // FormData requer configuração especial para o header
  return api.post('/products', productData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const updateProduct = (id, productData) => {
  // FormData requer configuração especial para o header
  return api.put(`/products/${id}`, productData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const deleteProduct = (id) => {
  return api.delete(`/products/${id}`);
};