import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProducts, getProduct, getCategories, createProduct, updateProduct, deleteProduct } from '../api/products'

export const useProducts = (params) => useQuery({
  queryKey: ['products', params],
  queryFn: () => getProducts(params).then(r => r.data),
})

export const useProduct = (id) => useQuery({
  queryKey: ['products', id],
  queryFn: () => getProduct(id).then(r => r.data),
  enabled: !!id,
})

export const useCategories = () => useQuery({
  queryKey: ['categories'],
  queryFn: () => getCategories().then(r => r.data),
})

export const useCreateProduct = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}

export const useDeleteProduct = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}
