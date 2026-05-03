import { useParams, useNavigate } from 'react-router-dom'
import { useOrder, useCancelOrder } from '../hooks/useOrders'
import Navbar from '../components/Navbar'

const statusColors = {
  pending:   'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped:   'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: order, isLoading, error } = useOrder(id)
  const cancelOrder = useCancelOrder()

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return
    try {
      await cancelOrder.mutateAsync(id)
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to cancel order')
    }
  }

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="text-center py-12 text-gray-400 text-sm">Loading order...</div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="text-center py-12 text-red-500 text-sm">Order not found</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/orders')}
          className="text-sm text-gray-500 hover:text-black mb-6 flex items-center gap-1"
        >
          ← Back to orders
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Order #{order.id}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Placed {new Date(order.created_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${statusColors[order.status]}`}>
            {order.status}
          </span>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100 mb-4">
          {order.items.map((item) => (
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
                  Qty: {item.quantity} × £{parseFloat(item.price_at_purchase).toFixed(2)}
                </p>
              </div>

              <p className="text-sm font-medium">
                £{(parseFloat(item.price_at_purchase) * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total</span>
            <span className="text-lg font-semibold">
              £{parseFloat(order.total).toFixed(2)}
            </span>
          </div>
        </div>

        {order.status === 'pending' && (
          <button
            onClick={handleCancel}
            disabled={cancelOrder.isPending}
            className="mt-4 w-full border border-red-300 text-red-600 text-sm py-2 rounded hover:bg-red-50 disabled:opacity-40"
          >
            {cancelOrder.isPending ? 'Cancelling...' : 'Cancel order'}
          </button>
        )}
      </div>
    </div>
  )
}
