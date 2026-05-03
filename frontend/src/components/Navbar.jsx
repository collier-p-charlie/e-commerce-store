import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useBasket } from '../hooks/useBasket'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { data: basket } = useBasket()

  const itemCount = basket?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-semibold text-lg tracking-tight">
          Shop
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/" className="text-sm text-gray-600 hover:text-black">
            Products
          </Link>
          <Link to="/wishlist" className="text-sm text-gray-600 hover:text-black">
            Wishlist
          </Link>
          <Link to="/basket" className="relative text-sm text-gray-600 hover:text-black">
            Basket
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-4 bg-black text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>
          <Link to="/orders" className="text-sm text-gray-600 hover:text-black">
            Orders
          </Link>
          {user?.is_admin && (
            <Link to="/admin" className="text-sm text-gray-600 hover:text-black">
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-black"
          >
            Sign out
          </button>
        </div>

      </div>
    </nav>
  )
}
