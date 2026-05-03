import client from './client'

export const getWishlist = () => client.get('/wishlist')
export const addWishlistItem = (data) => client.post('/wishlist/items', data)
export const deleteWishlistItem = (id) => client.delete(`/wishlist/items/${id}`)
export const moveToBasket = (productId) => client.post(`/wishlist/items/${productId}/moveToBasket`)
