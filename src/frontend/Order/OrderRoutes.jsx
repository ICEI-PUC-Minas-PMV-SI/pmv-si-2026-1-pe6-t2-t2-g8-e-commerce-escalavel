import { Route } from 'react-router-dom'
import PrivateRoute from '../components/PrivateRoute'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrdersPage from './pages/OrdersPage'

const OrderRoutes = [
  <Route key="cart" path="/cart" element={<CartPage />} />,
  <Route key="checkout" path="/checkout" element={<CheckoutPage />} />,
  <Route key="orders" path="/orders" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />,
]

export default OrderRoutes
