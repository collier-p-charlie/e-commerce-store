import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAllOrders, updateOrderStatus,
  getAllUsers, deleteUser,
  createProduct, updateProduct, deleteProduct,
} from '../api/admin'

export const useAllOrders = (params) => useQuery({
  queryKey: ['admin', 'orders', params],
  queryFn: () => getAllOrders(params).then(r => r.data),
})

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }) => updateOrderStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] }),
  })
}

export const useAllUsers = () => useQuery({
  queryKey: ['admin', 'users'],
  queryFn: () => getAllUsers().then(r => r.data),
})

export const useDeleteUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

export const useAdminCreateProduct = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}

export const useAdminUpdateProduct = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}

export const useAdminDeleteProduct = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}
