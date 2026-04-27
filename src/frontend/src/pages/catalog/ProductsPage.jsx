import { useEffect, useState } from 'react'
import { catalogApi } from '../../services/api'

function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    catalogApi.getProducts()
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
  }, [])

  if (loading) return <p className="p-6">Carregando...</p>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Produtos</h1>
      <div className="grid grid-cols-3 gap-4">
        {products.map(product => (
          <div key={product.id} className="bg-gray-800 text-white p-4 rounded-lg">
            <h2 className="text-lg font-semibold">{product.name}</h2>
            <p className="text-gray-400">{product.description}</p>
            <p className="text-green-400 mt-2">R$ {product.price}</p>
            <p className="text-sm text-gray-500">{product.category.name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductsPage