// src/pages/EditProfilePage.tsx
import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { apiUpdateUser } from '../../services/userApi'
import Toast, { ToastData } from '../../components/Toast'

export default function EditProfilePage() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    cpf: user?.cpf || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zip: user?.address?.zip || '',
  })
  const [toast, setToast] = useState<ToastData | null>(null)
  const [loading, setLoading] = useState(false)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)

    try {
      const updated = await apiUpdateUser(user.id, {
        name: form.name,
        email: form.email,
        cpf: form.cpf || undefined,
        phone: form.phone || undefined,
        address: {
          street: form.street || undefined,
          city: form.city || undefined,
          state: form.state || undefined,
          zip: form.zip || undefined,
        },
      })
      setUser(updated)
      setToast({ message: 'Perfil atualizado com sucesso!', type: 'success' })
      setTimeout(() => navigate('/perfil'), 1800)
    } catch (err: unknown) {
      setToast({ message: err instanceof Error ? err.message : 'Erro ao atualizar perfil.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-wrapper">
      <div className="page-container page-container-sm">
        <div className="page-header">
          <button className="btn-back" onClick={() => navigate('/perfil')}>
            ← Voltar
          </button>
          <h1 className="page-title">Editar perfil</h1>
        </div>


        <form onSubmit={handleSubmit} className="form card">
          <h2 className="form-section-title">Dados pessoais</h2>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nome completo</label>
              <input
                type="text"
                className="form-input"
                value={form.name}
                onChange={set('name')}
              />
            </div>
            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input
                type="email"
                className="form-input"
                value={form.email}
                onChange={set('email')}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">CPF</label>
              <input
                type="text"
                className="form-input"
                placeholder="000.000.000-00"
                value={form.cpf}
                onChange={set('cpf')}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Telefone</label>
              <input
                type="text"
                className="form-input"
                placeholder="(00) 00000-0000"
                value={form.phone}
                onChange={set('phone')}
              />
            </div>
          </div>

          <h2 className="form-section-title">Endereço</h2>

          <div className="form-row">
            <div className="form-group form-group-lg">
              <label className="form-label">Rua</label>
              <input
                type="text"
                className="form-input"
                placeholder="Rua das Flores, 123"
                value={form.street}
                onChange={set('street')}
              />
            </div>
            <div className="form-group">
              <label className="form-label">CEP</label>
              <input
                type="text"
                className="form-input"
                placeholder="00000-000"
                value={form.zip}
                onChange={set('zip')}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group form-group-lg">
              <label className="form-label">Cidade</label>
              <input
                type="text"
                className="form-input"
                placeholder="Belo Horizonte"
                value={form.city}
                onChange={set('city')}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Estado</label>
              <input
                type="text"
                className="form-input"
                placeholder="MG"
                maxLength={2}
                value={form.state}
                onChange={set('state')}
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/perfil')}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </div>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
