// src/user/pages/ProfilePage.tsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { apiDeleteUser } from '../../services/userApi'
import Toast, { ToastData } from '../../components/Toast'

/* ── Formatadores de exibição ── */
function fmtPhone(v: string) {
  if (!v) return null
  const d = v.replace(/\D/g, '')
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`
  return v
}
function fmtCPF(v: string) {
  if (!v) return null
  const d = v.replace(/\D/g, '')
  if (d.length === 11) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`
  return v
}

/* ── Ícones ── */
const IcoUser = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)
const IcoPin = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const IcoLock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)
const IcoAlert = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)
const IcoEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const IcoCalendar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const IcoShield = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [toast, setToast]         = useState<ToastData | null>(null)

  const showToast = (message: string, type: ToastData['type']) => setToast({ message, type })

  const handleDeactivate = async () => {
    if (!user) return
    setLoading(true)
    try {
      await apiDeleteUser(user.id)
      setShowModal(false)
      showToast('Conta desativada com sucesso.', 'success')
      setTimeout(() => { logout(); navigate('/login') }, 2000)
    } catch (err: unknown) {
      setShowModal(false)
      showToast(err instanceof Error ? err.message : 'Erro ao desativar conta.', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  const initials = user.name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
  const firstName = user.name.split(' ')[0]

  const joinDate = new Date(user.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
  const hasAddress = !!user.address?.street

  return (
    <div className="pf-root">

      {/* ══════════════════════════════
          HERO
      ══════════════════════════════ */}
      <div className="pf-hero">
        {/* padrão de grade decorativo */}
        <div className="pf-hero-grid" />

        <div className="pf-hero-inner">
          {/* avatar */}
          <div className="pf-avatar-wrap">
            <div className="pf-avatar">{initials}</div>
            <div className={`pf-avatar-status ${user.active !== false ? 'pf-status-on' : 'pf-status-off'}`} />
          </div>

          {/* info */}
          <div className="pf-hero-info">
            <div className="pf-hero-top">
              <h1 className="pf-hero-name">{user.name}</h1>
              <span className={`pf-role ${user.role === 'admin' ? 'pf-role-admin' : 'pf-role-customer'}`}>
                {user.role === 'admin' ? (
                  <><IcoShield /> Administrador</>
                ) : (
                  'Cliente'
                )}
              </span>
            </div>
            <p className="pf-hero-email">{user.email}</p>
            <div className="pf-hero-meta">
              <span className="pf-meta-item"><IcoCalendar /> Membro desde {joinDate}</span>
            </div>
          </div>

          {/* ações */}
          <div className="pf-hero-btns">
            <Link to="/perfil/editar" className="pf-btn-primary">
              <IcoEdit /> Editar perfil
            </Link>
            <Link to="/perfil/senha" className="pf-btn-ghost">Alterar senha</Link>
          </div>
        </div>

        {/* strip de estatísticas */}
        <div className="pf-stats-strip">
          <div className="pf-stat">
            <span className="pf-stat-val">{firstName}</span>
            <span className="pf-stat-lbl">Nome</span>
          </div>
          <div className="pf-stat-div" />
          <div className="pf-stat">
            <span className="pf-stat-val">{fmtCPF(user.cpf ?? '') ?? '—'}</span>
            <span className="pf-stat-lbl">CPF</span>
          </div>
          <div className="pf-stat-div" />
          <div className="pf-stat">
            <span className="pf-stat-val">{fmtPhone(user.phone ?? '') ?? '—'}</span>
            <span className="pf-stat-lbl">Telefone</span>
          </div>
          <div className="pf-stat-div" />
          <div className="pf-stat">
            <span className="pf-stat-val">{hasAddress ? user.address?.city : '—'}</span>
            <span className="pf-stat-lbl">Cidade</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════
          CARDS
      ══════════════════════════════ */}
      <div className="pf-body">
        <div className="pf-grid">

          {/* ── Dados pessoais ── */}
          <div className="pf-card">
            <div className="pf-card-head">
              <div className="pf-card-icon pf-icon-user"><IcoUser /></div>
              <div className="pf-card-hd-text">
                <h2 className="pf-card-title">Dados pessoais</h2>
                <p className="pf-card-sub">Suas informações cadastradas</p>
              </div>
              <Link to="/perfil/editar" className="pf-card-edit-btn">
                <IcoEdit /> Editar
              </Link>
            </div>

            <div className="pf-fields">
              <div className="pf-field">
                <span className="pf-field-label">Nome completo</span>
                <span className="pf-field-value">{user.name}</span>
              </div>
              <div className="pf-field">
                <span className="pf-field-label">E-mail</span>
                <span className="pf-field-value">{user.email}</span>
              </div>
              <div className="pf-field pf-field-row">
                <div>
                  <span className="pf-field-label">CPF</span>
                  <span className="pf-field-value">{fmtCPF(user.cpf ?? '') ?? <em className="pf-empty">Não informado</em>}</span>
                </div>
                <div>
                  <span className="pf-field-label">Telefone</span>
                  <span className="pf-field-value">{fmtPhone(user.phone ?? '') ?? <em className="pf-empty">Não informado</em>}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Endereço ── */}
          <div className="pf-card">
            <div className="pf-card-head">
              <div className="pf-card-icon pf-icon-address"><IcoPin /></div>
              <div className="pf-card-hd-text">
                <h2 className="pf-card-title">Endereço</h2>
                <p className="pf-card-sub">Endereço para entrega</p>
              </div>
              {hasAddress && (
                <Link to="/perfil/editar" className="pf-card-edit-btn">
                  <IcoEdit /> Editar
                </Link>
              )}
            </div>

            {hasAddress ? (
              <div className="pf-fields">
                <div className="pf-field">
                  <span className="pf-field-label">Rua / Logradouro</span>
                  <span className="pf-field-value">{user.address?.street}</span>
                </div>
                <div className="pf-field pf-field-row">
                  <div>
                    <span className="pf-field-label">Cidade</span>
                    <span className="pf-field-value">{user.address?.city}</span>
                  </div>
                  <div>
                    <span className="pf-field-label">Estado</span>
                    <span className="pf-field-value">{user.address?.state}</span>
                  </div>
                  <div>
                    <span className="pf-field-label">CEP</span>
                    <span className="pf-field-value">{user.address?.zip}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="pf-empty-state">
                <div className="pf-empty-icon"><IcoPin /></div>
                <p className="pf-empty-txt">Nenhum endereço cadastrado.</p>
                <Link to="/perfil/editar" className="pf-empty-cta">+ Adicionar endereço</Link>
              </div>
            )}
          </div>

          {/* ── Segurança ── */}
          <div className="pf-card">
            <div className="pf-card-head">
              <div className="pf-card-icon pf-icon-security"><IcoLock /></div>
              <div className="pf-card-hd-text">
                <h2 className="pf-card-title">Segurança</h2>
                <p className="pf-card-sub">Gerencie sua senha de acesso</p>
              </div>
            </div>
            <div className="pf-security-item">
              <div className="pf-security-text">
                <p className="pf-security-label">Senha de acesso</p>
                <p className="pf-security-hint">Recomendamos trocar a senha periodicamente</p>
              </div>
              <Link to="/perfil/senha" className="btn btn-outline btn-sm">Alterar</Link>
            </div>
          </div>

          {/* ── Zona de perigo ── */}
          <div className="pf-card pf-card-danger">
            <div className="pf-card-head">
              <div className="pf-card-icon pf-icon-danger"><IcoAlert /></div>
              <div className="pf-card-hd-text">
                <h2 className="pf-card-title pf-title-danger">Zona de perigo</h2>
                <p className="pf-card-sub">Ações irreversíveis da conta</p>
              </div>
            </div>
            <div className="pf-danger-body">
              <p className="pf-danger-desc">
                Ao desativar sua conta você será desconectado imediatamente.
                Seus dados <strong>não serão excluídos</strong> e podem ser reativados por um administrador.
              </p>
              <button className="pf-danger-btn" onClick={() => setShowModal(true)}>
                Desativar minha conta
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── MODAL ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Desativar conta</h2>
            <p className="modal-text">
              Tem certeza que deseja desativar sua conta? Você será desconectado imediatamente.
              Seus dados permanecem no sistema e podem ser reativados por um administrador.
            </p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowModal(false)} disabled={loading}>Cancelar</button>
              <button className="btn btn-danger" onClick={handleDeactivate} disabled={loading}>
                {loading ? 'Desativando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
