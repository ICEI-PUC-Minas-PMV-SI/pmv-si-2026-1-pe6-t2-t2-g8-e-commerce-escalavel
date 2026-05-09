import { Route } from 'react-router-dom'
import Home from './pages/Home'
import ProductsPage from './pages/ProductsPage'
import CategoriesPage from './pages/CategoriesPage'

const CatalogRoutes = [
  <Route key="home"       path="/"           element={<Home />} />,
  <Route key="products"   path="/products"   element={<ProductsPage />} />,
  <Route key="categories" path="/categories" element={<CategoriesPage />} />,
]

export default Catalo