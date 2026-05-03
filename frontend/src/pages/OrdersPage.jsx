import { Link } from 'react-router-dom'
import { useOrders } from '../hooks/useOrders'
import Navbar from '../components/Navbar'

const statusColors = {
  pending:   'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped:   'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function OrdersPage() {
  const { data: orders, isLoading, error } = useOrders()

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="text-center py-12 text-gray-400 text-sm">Loading orders...</div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="text-center py-12 text-red-500 text-sm">Failed to load orders</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Your orders</h1>

        {!orders || orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm mb-4">No orders yet</p>
            <Link to="/" className="text-sm text-black font-medium hover:underline">
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Order #{order.id}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                    <span className="text-sm font-semibold">
                      £{parseFloat(order.total).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {order.items.slice(0, 4).map((item) => (
                    item.product?.image_url ? (
                      <img
                        key={item.id}
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div key={item.id} className="w-10 h-10 bg-gray-100 rounded" />
                    )
                  ))}
                  {order.items.length > 4 && (
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-500">+{order.items.length - 4}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
