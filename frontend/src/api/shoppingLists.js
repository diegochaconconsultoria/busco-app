import api from './config';

export const getUserLists = () => {
  return api.get('/shopping-lists');
};

// Também verifique se a função getListById está processando corretamente a resposta
export const getListById = (id) => {
  console.log('Buscando lista por ID:', id);
  
  return api.get(`/shopping-lists/${id}`)
    .then(response => {
      console.log('Lista recebida da API:', response.data);
      console.log('- finalized:', response.data.finalized);
      console.log('- finalizeOption:', response.data.finalizeOption);
      return response;
    })
    .catch(error => {
      console.error('Erro ao buscar lista:', error);
      throw error;
    });
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

// Função para atualizar a quantidade de um item na lista
export const updateItemQuantity = (listId, productId, quantity) => {
  return api.put(`/shopping-lists/${listId}/items/${productId}`, { quantity });
};

// Finalizar lista de compras - versão corrigida e com logging
export const finalizeList = (listId, finalizeData) => {
  console.log('Chamando API para finalizar lista:', listId);
  console.log('Dados de finalização:', finalizeData);
  
  return api.put(`/shopping-lists/${listId}/finalize`, finalizeData)
    .then(response => {
      console.log('Resposta da API de finalização:', response.data);
      // Verificar se a lista foi marcada como finalizada
      if (!response.data.finalized) {
        console.error('ALERTA: A API retornou a lista, mas o campo finalized não está definido como true!');
      }
      return response;
    })
    .catch(error => {
      console.error('Erro ao finalizar lista:', error);
      throw error;
    });
};

// Atualizar itens marcados (checklist)
export const updateCheckedItems = (listId, checkedItems) => {
  return api.put(`/shopping-lists/${listId}/checked-items`, { checkedItems });
};