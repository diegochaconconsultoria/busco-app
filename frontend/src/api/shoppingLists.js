import api from './config';

export const getUserLists = () => {
  return api.get('/shopping-lists');
};

export const getListById = (id) => {
  return api.get(`/shopping-lists/${id}`);
};

export const createList = (listData) => {
  return api.post('/shopping-lists', listData);
};

export const updateList = (id, listData) => {
  return api.put(`/shopping-lists/${id}`, listData);
};

export const deleteList = (id) => {
  return api.delete(`/shopping-lists/${id}`);
};

export const addItemToList = (listId, itemData) => {
  return api.post(`/shopping-lists/${listId}/items`, itemData);
};

export const removeItemFromList = (listId, productId) => {
  return api.delete(`/shopping-lists/${listId}/items/${productId}`);
};