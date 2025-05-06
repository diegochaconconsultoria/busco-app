import api from './config';

export const getProductPrices = (productId) => {
  return api.get(`/prices/product/${productId}`);
};

export const getMarketPrices = (marketId) => {
  return api.get(`/prices/market/${marketId}`);
};

export const savePrice = (priceData) => {
  return api.post('/prices', priceData);
};

export const compareProducts = (productIds) => {
  return api.post('/prices/compare', { products: productIds });
};