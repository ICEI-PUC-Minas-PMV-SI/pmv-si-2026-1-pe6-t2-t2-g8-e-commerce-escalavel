// src/pages/ProfilePage.tsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { apiDeleteUser } from '../api/userApi'
import Toast, { ToastData } from '../components/Toast'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<ToastData | null>(null)

  const showToast = (message: string, type: ToastData['type']) => {
    setToast({ message, type })
  }

  const handleDeactivate = async () => {
    if (!user) return
    setLoading(true)
    try {
      await apiDeleteUser(user.id)
      setShowModal(false)
      showToast('Conta desativada com sucesso.', 'success')
      setTimeout(() => {
        logout()
        navigate('/login')
      }, 2000)
    } catch (err: unknown) {
      setShowModal(false)
      showToast(err instanceof Error ? err.message : 'Erro ao desativar conta.', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="page-wrapper">
      <div className="page-container">
        <h1 className="page-title">Minha Conta</h1>

        <div className="profile-grid">
          {/* Dados pessoais */}
          <section className="card">
            <div className="card-header">
              <h2 className="card-title">Dados pessoais</h2>
              <Link to="/perfil/editar" className="btn btn-outline btn-sm">Editar</Link>
            </div>
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">Nome</span>
                <span className="info-value">{user.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">E-mail</span>
                <span className="info-value">{user.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">CPF</span>
                <span className="info-value">{user.cpf || '—'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Telefone</span>
                <span className="info-value">{user.phone || '—'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Perfil</span>
                <span className="info-value info-badge">{user.role}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Membro desde</span>
                <span className="info-value">
                  {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </section>

          {/* Endereço */}
          <section className="card">
            <div className="card-header">
              <h2 className="card-title">Endereço</h2>
              <Link to="/perfil/editar" className="btn btn-outline btn-sm">Editar</Link>
            </div>
            {user.address?.street ? (
              <div className="info-list">
                <div className="info-item">
                  <span className="info-label">Rua</span>
                  <span className="info-value">{user.address.street}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Cidade</span>
                  <span className="info-value">{user.address.city}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Estado</span>
                  <span className="info-value">{user.address.state}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">CEP</span>
                  <span className="info-value">{user.address.zip}</span>
                </div>
              </div>
            ) : (
              <p className="info-empty">Nenhum endereço cadastrado.</p>
            )}
          </section>

          {/* Segurança */}
          <section className="card">
            <div className="card-header">
              <h2 className="card-title">Segurança</h2>
            </div>
            <div className="card-actions">
              <Link to="/perfil/senha" className="btn btn-outline">Alterar senha</Link>
            </div>
          </section>

          {/* Zona de perigo */}
          <section className="card card-danger">
            <div className="card-header">
              <h2 className="card-title">Zona de perigo</h2>
            </div>
            <p className="info-empty" style={{ marginBottom: 16 }}>
              Ao desativar sua conta, você perderá o acesso ao sistema. Seus dados não serão excluídos.
            </p>
            <div className="card-actions">
              <button className="btn btn-danger" onClick={() => setShowModal(true)}>
                Desativar minha conta
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Modal de confirmação */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Desativar conta</h2>
            <p className="modal-text">
              Tem certeza que deseja desativar sua conta? Você será desconectado imediatamente.
              Seus dados permanecem no sistema e podem ser reativados por um administrador.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeactivate}
                disabled={loading}
              >
                {loading ? 'Desativando...' : 'Confirmar desativação'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
