import { useState } from 'react'
import { useProducts, useCategories } from '../hooks/useProducts'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'

export default function ProductsPage() {
  const [category, setCategory] = useState(null)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const { data: products, isLoading, error } = useProducts({ category, search })
  const { data: categories } = useCategories()

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  const handleCategoryClick = (cat) => {
    setCategory(cat === category ? null : cat)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products..."
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              type="submit"
              className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800"
            >
              Search
            </button>
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); setSearchInput('') }}
                className="px-4 py-2 border border-gray-300 rounded text-sm hover:border-black"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {categories && categories.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  category === cat
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-black'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12 text-gray-400 text-sm">
            Loading products...
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-red-500 text-sm">
            Failed to load products
          </div>
        )}

        {products && products.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            No products found
          </div>
        )}

        {products && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
