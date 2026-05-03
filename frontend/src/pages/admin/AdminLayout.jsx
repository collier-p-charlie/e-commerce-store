import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function AdminLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`text-sm px-3 py-2 rounded transition-colors ${
        location.pathname === to
          ? 'bg-gray-100 text-black font-medium'
          : 'text-gray-600 hover:text-black'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Link to="/admin/orders" className="font-semibold text-lg tracking-tight mr-4">
              Admin
            </Link>
            {navLink('/admin/orders', 'Orders')}
            {navLink('/admin/products', 'Products')}
            {navLink('/admin/users', 'Users')}
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-gray-500 hover:text-black">
              Back to shop
            </Link>
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  )
}
