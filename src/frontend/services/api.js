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

  getCategories: async () => {
    const response = await fetch(`${BASE_URL}/catalog/categories`)
    return response.json()
  }
}
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
})

