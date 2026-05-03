import client from './client'

export const getOrders = () => client.get('/orders')
export const getOrder = (id) => client.get(`/orders/${id}`)
export const createOrder = () => client.post('/orders')
export const cancelOrder = (id) => client.put(`/orders/${id}/cancel`)
