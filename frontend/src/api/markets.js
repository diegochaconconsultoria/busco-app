import api from './config';

export const getAllMarkets = () => {
  return api.get('/markets');
};

export const getMarketById = (id) => {
  return api.get(`/markets/${id}`);
};

export const createMarket = (marketData) => {
  return api.post('/markets', marketData);
};

export const updateMarket = (id, marketData) => {
  return api.put(`/markets/${id}`, marketData);
};

export const deleteMarket = (id) => {
  return api.delete(`/markets/${id}`);
};