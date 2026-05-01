// src/pages/ChangePasswordPage.tsx
import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { apiUpdatePassword } from '../api/userApi'
import Toast, { ToastData } from '../components/Toast'

export default function ChangePasswordPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [toast, setToast] = useState<ToastData | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (password.length < 8) {
      setToast({ message: 'A senha deve ter no mínimo 8 caracteres.', type: 'error' })
      return
    }
    if (password !== confirm) {
      setToast({ message: 'As senhas não coincidem.', type: 'error' })
      return
    }

    if (!user) return
    setLoading(true)

    try {
      await apiUpdatePassword(user.id, password)
      setToast({ message: 'Senha alterada com sucesso!', type: 'success' })
      setPassword('')
      setConfirm('')
      setTimeout(() => navigate('/perfil'), 1800)
    } catch (err: unknown) {
      setToast({ message: err instanceof Error ? err.message : 'Erro ao alterar senha.', type: 'error' })
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
          <h1 className="page-title">Alterar senha</h1>
        </div>

        <form onSubmit={handleSubmit} className="form card">
          <div className="form-group">
            <label className="form-label">Nova senha</label>
            <input
              type="password"
              className="form-input"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirmar nova senha</label>
            <input
              type="password"
              className="form-input"
              placeholder="Repita a senha"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
            />
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
              {loading ? 'Salvando...' : 'Alterar senha'}
            </button>
          </div>
        </form>
      </div>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
