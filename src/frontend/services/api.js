const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000/api'

export const catalogApi = {
  getProducts: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.name) params.append('name', filters.name)
    if (filters.categoryId) params.append('categoryId', filters.categoryId)
    if (filters.minPrice) params.append('minPrice', filters.minPrice)
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)

    const response = await fetch(`${BASE_URL}/catalog/products?${params}`)
    return response.json()
  },

  getProductById: async (id) => {
    const response = await fetch(`${BASE_URL}/catalog/products/${id}`)
    if (!response.ok) {
      throw new Error('Erro ao buscar produto')
    }
    return response.json()
  },
  
  getCategories: async () => {
    const response = await fetch(`${BASE_URL}/catalog/categories`)
    return response.json()
  },

  createProduct: async (data) => {
    const response = await fetch(`${BASE_URL}/catalog/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Erro ao criar produto')
    return response.json()
  },

  updateProduct: async (id, data) => {
    const response = await fetch(`${BASE_URL}/catalog/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Erro ao atualizar produto')
    return response.json()
  },

  deleteProduct: async (id) => {
    const response = await fetch(`${BASE_URL}/catalog/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    })
    if (!response.ok) throw new Error('Erro ao deletar produto')
  },

  createCategory: async (data) => {
    const response = await fetch(`${BASE_URL}/catalog/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Erro ao criar categoria')
    return response.json()
  },

  updateCategory: async (id, data) => {
    const response = await fetch(`${BASE_URL}/catalog/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Erro ao atualizar categoria')
    return response.json()
  },

  deleteCategory: async (id) => {
    const response = await fetch(`${BASE_URL}/catalog/categories/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    })
    if (!response.ok) throw new Error('Erro ao deletar categoria')
  },
}
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
})

// OrderAPI service
export const orderApi = {
  createOrder: async (data) => {
    const response = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })

    return response.json()
  },

  getOrdersByUser: async (userId) => {
    const response = await fetch(`${BASE_URL}/orders/user/${userId}`, {
      headers: getHeaders()
    })

    return response.json()
  },

  getOrderById: async (id) => {
    const response = await fetch(`${BASE_URL}/orders/${id}`, {
      headers: getHeaders()
    })

    return response.json()
  },

  cancelOrder: async (id) => {
    const response = await fetch(`${BASE_URL}/orders/${id}/cancel`, {
      method: 'PUT',
      headers: getHeaders()
    })

    return response.json()
  },

  // Dispara o pagamento de um pedido já criado (estoque reservado).
  // Backend orquestra: chama PaymentAPI e confirma/libera estoque.
  payOrder: async (orderId, paymentMethod) => {
    const response = await fetch(`${BASE_URL}/orders/${orderId}/pay`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ paymentMethod })
    })

    return response.json()
  }
}