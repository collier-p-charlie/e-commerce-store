import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBasket, addBasketItem, updateBasketItem, deleteBasketItem, clearBasket } from '../api/basket'

export const useBasket = () => useQuery({
  queryKey: ['basket'],
  queryFn: () => getBasket().then(r => r.data),
})

export const useAddBasketItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addBasketItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['basket'] }),
  })
}

export const useUpdateBasketItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateBasketItem(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['basket'] }),
  })
}

export const useDeleteBasketItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteBasketItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['basket'] }),
  })
}

export const useClearBasket = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: clearBasket,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['basket'] }),
  })
}
