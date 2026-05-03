import { Link, useNavigate } from 'react-router-dom'
import { useBasket, useUpdateBasketItem, useDeleteBasketItem, useClearBasket } from '../hooks/useBasket'
import { useCreateOrder } from '../hooks/useOrders'
import Navbar from '../components/Navbar'

export default function BasketPage() {
  const navigate = useNavigate()
  const { data: basket, isLoading, error } = useBasket()
  const updateItem = useUpdateBasketItem()
  const deleteItem = useDeleteBasketItem()
  const clearBasket = useClearBasket()
  const createOrder = useCreateOrder()

  const handleQuantityChange = (item, quantity) => {
    if (quantity > item.product.stock) return
    if (quantity < 1) {
      deleteItem.mutate(item.id)
      return
    }
    updateItem.mutate({ id: item.id, data: { quantity } })
  }

  const handleCheckout = async () => {
    try {
      const { data } = await createOrder.mutateAsync()
      navigate(`/orders/${data.id}`)
    } catch (err) {
      alert(err.response?.data?.detail || 'Checkout failed')
    }
  }

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="text-center py-12 text-gray-400 text-sm">Loading basket...</div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="text-center py-12 text-red-500 text-sm">Failed to load basket</div>
    </div>
  )

  const items = basket?.items || []
  const total = basket?.total || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Your basket</h1>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm mb-4">Your basket is empty</p>
            <Link
              to="/"
              className="text-sm text-black font-medium hover:underline"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4">
                  {item.product?.image_url ? (
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded" />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.product?.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      £{parseFloat(item.price_at_add).toFixed(2)} each
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(item, item.quantity - 1)}
                      className="w-7 h-7 border border-gray-300 rounded text-sm hover:border-black flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="text-sm w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="w-7 h-7 border border-gray-300 rounded text-sm hover:border-black flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>

                  <p className="text-sm font-medium w-16 text-right">
                    £{(parseFloat(item.price_at_add) * item.quantity).toFixed(2)}
                  </p>

                  <button
                    onClick={() => deleteItem.mutate(item.id)}
                    className="text-gray-400 hover:text-red-500 text-sm ml-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600">Total</span>
                <span className="text-lg font-semibold">
                  £{parseFloat(total).toFixed(2)}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => clearBasket.mutate()}
                  disabled={clearBasket.isPending}
                  className="flex-1 border border-gray-300 text-sm py-2 rounded hover:border-black disabled:opacity-40"
                >
                  Clear basket
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={createOrder.isPending}
                  className="flex-1 bg-black text-white text-sm py-2 rounded hover:bg-gray-800 disabled:opacity-40"
                >
                  {createOrder.isPending ? 'Placing order...' : 'Checkout'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
