import { Route } from 'react-router-dom'
import Home from './pages/Home'
import ProductsPage from './pages/ProductsPage'
import CategoriesPage from './pages/CategoriesPage'

export default function CatalogRoutes() {
  return (
    <>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/categories" element={<CategoriesPage />} />
    </>
  )
}
