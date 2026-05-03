import { Link } from 'react-router-dom'
import { useWishlist, useDeleteWishlistItem, useMoveToBasket } from '../hooks/useWishlist'
import Navbar from '../components/Navbar'

export default function WishlistPage() {
  const { data: items, isLoading, error } = useWishlist()
  const deleteItem = useDeleteWishlistItem()
  const moveToBasket = useMoveToBasket()

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="text-center py-12 text-gray-400 text-sm">Loading wishlist...</div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="text-center py-12 text-red-500 text-sm">Failed to load wishlist</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Your wishlist</h1>

        {!items || items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm mb-4">Your wishlist is empty</p>
            <Link to="/" className="text-sm text-black font-medium hover:underline">
              Browse products
            </Link>
          </div>
        ) : (
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
                    £{parseFloat(item.product?.price).toFixed(2)}
                  </p>
                  {item.product?.stock === 0 && (
                    <p className="text-xs text-red-500 mt-0.5">Out of stock</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => moveToBasket.mutate(item.product.id)}
                    disabled={item.product?.stock === 0 || moveToBasket.isPending}
                    className="text-xs bg-black text-white px-3 py-1.5 rounded hover:bg-gray-800 disabled:opacity-40"
                  >
                    Move to basket
                  </button>
                  <button
                    onClick={() => deleteItem.mutate(item.id)}
                    disabled={deleteItem.isPending}
                    className="text-gray-400 hover:text-red-500 text-sm ml-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
