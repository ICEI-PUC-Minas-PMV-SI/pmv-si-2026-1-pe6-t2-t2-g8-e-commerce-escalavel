import { Route } from 'react-router-dom'
import PrivateRoute from '../components/PrivateRoute'
import StockListPage from './pages/stockListPage'

const StockRoutes = [
  <Route
    key="stock"
    path="/stock"
    element={
      <PrivateRoute adminOnly>
        <StockListPage />
      </PrivateRoute>
    }
  />,
]

export default StockRoutes
