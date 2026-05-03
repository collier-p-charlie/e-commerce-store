import client from './client'

export const getBasket = () => client.get('/basket')
export const addBasketItem = (data) => client.post('/basket/items', data)
export const updateBasketItem = (id, data) => client.put(`/basket/items/${id}`, data)
export const deleteBasketItem = (id) => client.delete(`/basket/items/${id}`)
export const clearBasket = () => client.delete('/basket')
