import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getWishlist, addWishlistItem, deleteWishlistItem, moveToBasket } from '../api/wishlist'

export const useWishlist = () => useQuery({
  queryKey: ['wishlist'],
  queryFn: () => getWishlist().then(r => r.data),
})

export const useAddWishlistItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addWishlistItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  })
}

export const useDeleteWishlistItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteWishlistItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  })
}

export const useMoveToBasket = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: moveToBasket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      queryClient.invalidateQueries({ queryKey: ['basket'] })
    },
  })
}
