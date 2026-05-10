import { Route } from 'react-router-dom'
import Home from './pages/Home'
import ProductsPage from './pages/ProductsPage'
import CategoriesPage from './pages/CategoriesPage'
import ProductDetails from './pages/ProductDetails'

const CatalogRoutes = [
  <Route key="home" path="/" element={<Home />} />,
  <Route key="product-details" path="/products/:id" element={<ProductDetails />} />,
  <Route key="products" path="/products" element={<ProductsPage />} />,
  <Route key="categories" path="/categories" element={<CategoriesPage />} />,
]

export default CatalogRoutes