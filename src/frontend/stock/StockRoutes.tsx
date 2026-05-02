import { Route } from 'react-router-dom'
import StockListPage from './pages/stockListPage'

const StockRoutes = [
  <Route key="stock" path="/stock" element={<StockListPage />} />,
]

export default StockRoutes
