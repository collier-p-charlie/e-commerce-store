import client from './client'

export const getAllOrders = (params) => client.get('/admin/orders', { params })
export const updateOrderStatus = (id, status) => client.put(`/admin/orders/${id}/status`, { status })
export const getAllUsers = () => client.get('/admin/users')
export const getUser = (id) => client.get(`/admin/users/${id}`)
export const deleteUser = (id) => client.delete(`/admin/users/${id}`)
export const createProduct = (data) => client.post('/admin/products', data)
export const updateProduct = (id, data) => client.put(`/admin/products/${id}`, data)
export const deleteProduct = (id) => client.delete(`/admin/products/${id}`)
