import { useState } from 'react'
import toast from 'react-hot-toast'
import { useProducts } from '../../hooks/useProducts'
import { useAdminCreateProduct, useAdminUpdateProduct, useAdminDeleteProduct } from '../../hooks/useAdmin'
import AdminLayout from './AdminLayout'

const emptyForm = {
  name: '', description: '', price: '', stock: '', category: '', image_url: ''
}

export default function AdminProductsPage() {
  const { data: products, isLoading } = useProducts({})
  const createProduct = useAdminCreateProduct()
  const updateProduct = useAdminUpdateProduct()
  const deleteProduct = useAdminDeleteProduct()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleEdit = (product) => {
    setEditing(product.id)
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      stock: product.stock || '',
      category: product.category || '',
      image_url: product.image_url || '',
    })
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditing(null)
    setForm(emptyForm)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
    }
    try {
      if (editing) {
        await updateProduct.mutateAsync({ id: editing, data })
        toast.success('Product updated')
      } else {
        await createProduct.mutateAsync(data)
        toast.success('Product created')
      }
      handleCancel()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save product')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    try {
      await deleteProduct.mutateAsync(id)
      toast.success('Product deleted')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete product')
    }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Products</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-black text-white text-sm px-4 py-2 rounded hover:bg-gray-800"
          >
            Add product
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">
            {editing ? 'Edit product' : 'New product'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (£)</label>
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div className="col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                disabled={createProduct.isPending || updateProduct.isPending}
                className="bg-black text-white text-sm px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-40"
              >
                {editing ? 'Save changes' : 'Create product'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="border border-gray-300 text-sm px-4 py-2 rounded hover:border-black"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading products...</div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          {!products || products.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">No products found</div>
          ) : (
            products.map((product) => (
              <div key={product.id} className="flex items-center gap-4 p-4">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    £{parseFloat(product.price).toFixed(2)} · {product.stock} in stock
                    {product.category && ` · ${product.category}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-xs border border-gray-300 px-3 py-1.5 rounded hover:border-black"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-xs border border-red-300 text-red-600 px-3 py-1.5 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </AdminLayout>
  )
}
