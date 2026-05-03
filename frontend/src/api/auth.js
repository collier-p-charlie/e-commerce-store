import client from './client'

export const register = (data) => client.post('/auth/register', data)
export const login = (data) => client.post('/auth/login', data)
export const getMe = (token) => client.get('/auth/me', {
  headers: token ? { Authorization: `Bearer ${token}` } : {}
})
export const updateMe = (data) => client.put('/auth/me', data)
