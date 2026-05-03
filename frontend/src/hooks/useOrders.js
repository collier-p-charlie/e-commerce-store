import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getOrders, getOrder, createOrder, cancelOrder } from '../api/orders'

export const useOrders = () => useQuery({
  queryKey: ['orders'],
  queryFn: () => getOrders().then(r => r.data),
})

export const useOrder = (id) => useQuery({
  queryKey: ['orders', id],
  queryFn: () => getOrder(id).then(r => r.data),
  enabled: !!id,
})

export const useCreateOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['basket'] })
    },
  })
}

export const useCancelOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  })
}
