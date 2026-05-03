import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAllOrders, useUpdateOrderStatus } from '../../hooks/useAdmin'
import AdminLayout from './AdminLayout'

const statusColors = {
  pending:   'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped:   'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const allStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState(null)
  const { data: orders, isLoading } = useAllOrders(statusFilter ? { status: statusFilter } : {})
  const updateStatus = useUpdateOrderStatus()

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateStatus.mutateAsync({ id: orderId, status: newStatus })
      toast.success('Order status updated')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update status')
    }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter(null)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              !statusFilter ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-300 hover:border-black'
            }`}
          >
            All
          </button>
          {allStatuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s === statusFilter ? null : s)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                statusFilter === s ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-300 hover:border-black'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading orders...</div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          {!orders || orders.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">No orders found</div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-sm font-medium">Order #{order.id}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    User #{order.user_id} · {new Date(order.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <p className="text-sm font-semibold">
                  £{parseFloat(order.total).toFixed(2)}
                </p>

                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className="text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-black"
                >
                  {allStatuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            ))
          )}
        </div>
      )}
    </AdminLayout>
  )
}
