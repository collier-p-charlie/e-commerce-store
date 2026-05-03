import { useAddBasketItem, useDeleteBasketItem } from '../hooks/useBasket'
import { useAddWishlistItem, useDeleteWishlistItem, useWishlist } from '../hooks/useWishlist'

export default function ProductCard({ product }) {
  const addToBasket = useAddBasketItem()
  const addToWishlist = useAddWishlistItem()
  const deleteWishlistItem = useDeleteWishlistItem()
  const { data: wishlist } = useWishlist()

  const wishlistItem = wishlist?.find((item) => item.product_id === product.id)
  const isWishlisted = !!wishlistItem

  const handleWishlistClick = () => {
    if (isWishlisted) {
      deleteWishlistItem.mutate(wishlistItem.id)
    } else {
      addToWishlist.mutate({ product_id: product.id })
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {product.image_url ? (
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400 text-sm">No image</span>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-medium text-gray-900 leading-snug">
            {product.name}
          </h3>
          <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
            £{parseFloat(product.price).toFixed(2)}
          </span>
        </div>

        {product.category && (
          <span className="inline-block text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded mb-2">
            {product.category}
          </span>
        )}

        {product.description && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-2">
          <span className={`text-xs ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => addToBasket.mutate({ product_id: product.id, quantity: 1 })}
            disabled={product.stock === 0 || addToBasket.isPending}
            className="flex-1 bg-black text-white text-xs py-2 rounded hover:bg-gray-800 disabled:opacity-40"
          >
            {addToBasket.isPending ? 'Adding...' : 'Add to basket'}
          </button>
          <button
            onClick={handleWishlistClick}
            disabled={addToWishlist.isPending || deleteWishlistItem.isPending}
            className={`px-3 py-2 border rounded text-sm transition-colors disabled:opacity-40 ${
              isWishlisted
                ? 'border-red-400 text-red-500 hover:border-red-600'
                : 'border-gray-300 text-gray-400 hover:border-black'
            }`}
          >
            {isWishlisted ? '♥' : '♡'}
          </button>
        </div>
      </div>
    </div>
  )
}