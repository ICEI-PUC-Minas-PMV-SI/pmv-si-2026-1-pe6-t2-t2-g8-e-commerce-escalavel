// src/user/pages/EditProfilePage.tsx
import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { apiUpdateUser } from '../../services/userApi'
import Toast, { ToastData } from '../../components/Toast'

/* ── Máscaras ── */
function maskCPF(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3)  return d
  if (d.length <= 6)  return `${d.slice(0,3)}.${d.slice(3)}`
  if (d.length <= 9)  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`
}
function maskPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2)  return d.length ? `(${d}` : ''
  if (d.length <= 7)  return `(${d.slice(0,2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
}
function maskZip(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 8)
  if (d.length <= 5) return d
  return `${d.slice(0,5)}-${d.slice(5)}`
}

/* ── Ícones ── */
const IcoUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)
const IcoPin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const IcoCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IcoArrowLeft = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)

export default function EditProfilePage() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()

  const initials = user?.name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase() ?? '?'

  const [form, setForm] = useState({
    name:   user?.name || '',
    email:  user?.email || '',
    cpf:    maskCPF(user?.cpf || ''),
    phone:  maskPhone(user?.phone || ''),
    street: user?.address?.street || '',
    city:   user?.address?.city || '',
    state:  user?.address?.state || '',
    zip:    maskZip(user?.address?.zip || ''),
  })

  const [toast, setToast]   = useState<ToastData | null>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved]     = useState(false)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    try {
      const updated = await apiUpdateUser(user.id, {
        name:  form.name,
        email: form.email,
        cpf:   form.cpf  || undefined,
        phone: form.phone || undefined,
        address: {
          street: form.street || undefined,
          city:   form.city   || undefined,
          state:  form.state  || undefined,
          zip:    form.zip    || undefined,
        },
      })
      setUser(updated)
      setSaved(true)
      setToast({ message: 'Perfil atualizado com sucesso!', type: 'success' })
      setTimeout(() => navigate('/perfil'), 1600)
    } catch (err: unknown) {
      setToast({ message: err instanceof Error ? err.message : 'Erro ao atualizar perfil.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ep-root">

      {/* ══ TOPO ══ */}
      <div className="ep-topbar">
        <div className="ep-topbar-inner">
          <button className="ep-back" onClick={() => navigate('/perfil')}>
            <IcoArrowLeft /> Voltar ao perfil
          </button>
          <div className="ep-topbar-title">
            <div className="ep-top-avatar">{initials}</div>
            <div>
              <h1 className="ep-title">Editar perfil</h1>
              <p className="ep-subtitle">Atualize suas informações pessoais</p>
            </div>
          </div>
          <div className="ep-topbar-actions">
            <button type="button" className="ep-cancel" onClick={() => navigate('/perfil')}>
              Cancelar
            </button>
            <button
              form="ep-form"
              type="submit"
              className={`ep-save${saved ? ' ep-save-done' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <><span className="btn-spinner" /> Salvando…</>
              ) : saved ? (
                <><IcoCheck /> Salvo!</>
              ) : (
                'Salvar alterações'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ══ CONTEÚDO ══ */}
      <div className="ep-body">
        <form id="ep-form" onSubmit={handleSubmit} className="ep-form" noValidate>

          {/* ── Seção Dados Pessoais ── */}
          <div className="ep-section">
            <div className="ep-section-head">
              <div className="ep-section-icon ep-icon-user"><IcoUser /></div>
              <div>
                <h2 className="ep-section-title">Dados pessoais</h2>
                <p className="ep-section-sub">Nome, e-mail e contato</p>
              </div>
            </div>

            <div className="ep-fields">
              <div className="ep-row">
                <div className="ep-field ep-field-lg">
                  <label className="ep-label" htmlFor="ep-name">Nome completo</label>
                  <input id="ep-name" type="text" className="ep-input"
                    placeholder="Seu nome completo"
                    value={form.name} onChange={set('name')} required />
                </div>
                <div className="ep-field ep-field-lg">
                  <label className="ep-label" htmlFor="ep-email">E-mail</label>
                  <input id="ep-email" type="email" className="ep-input"
                    placeholder="seu@email.com"
                    value={form.email} onChange={set('email')} required />
                </div>
              </div>

              <div className="ep-row">
                <div className="ep-field">
                  <label className="ep-label" htmlFor="ep-cpf">
                    CPF <span className="ep-opt">opcional</span>
                  </label>
                  <input id="ep-cpf" type="text" className="ep-input"
                    placeholder="000.000.000-00"
                    value={form.cpf}
                    onChange={e => setForm(prev => ({ ...prev, cpf: maskCPF(e.target.value) }))} />
                </div>
                <div className="ep-field">
                  <label className="ep-label" htmlFor="ep-phone">
                    Telefone <span className="ep-opt">opcional</span>
                  </label>
                  <input id="ep-phone" type="text" className="ep-input"
                    placeholder="(00) 00000-0000"
                    value={form.phone}
                    onChange={e => setForm(prev => ({ ...prev, phone: maskPhone(e.target.value) }))} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Seção Endereço ── */}
          <div className="ep-section">
            <div className="ep-section-head">
              <div className="ep-section-icon ep-icon-pin"><IcoPin /></div>
              <div>
                <h2 className="ep-section-title">Endereço</h2>
                <p className="ep-section-sub">Endereço para entrega — opcional</p>
              </div>
            </div>

            <div className="ep-fields">
              <div className="ep-row">
                <div className="ep-field ep-field-xl">
                  <label className="ep-label" htmlFor="ep-street">Rua / Logradouro</label>
                  <input id="ep-street" type="text" className="ep-input"
                    placeholder="Rua das Flores, 123"
                    value={form.street} onChange={set('street')} />
                </div>
                <div className="ep-field ep-field-sm">
                  <label className="ep-label" htmlFor="ep-zip">CEP</label>
                  <input id="ep-zip" type="text" className="ep-input"
                    placeholder="00000-000"
                    value={form.zip}
                    onChange={e => setForm(prev => ({ ...prev, zip: maskZip(e.target.value) }))} />
                </div>
              </div>

              <div className="ep-row">
                <div className="ep-field ep-field-xl">
                  <label className="ep-label" htmlFor="ep-city">Cidade</label>
                  <input id="ep-city" type="text" className="ep-input"
                    placeholder="Belo Horizonte"
                    value={form.city} onChange={set('city')} />
                </div>
                <div className="ep-field ep-field-sm">
                  <label className="ep-label" htmlFor="ep-state">UF</label>
                  <input id="ep-state" type="text" className="ep-input"
                    placeholder="MG" maxLength={2}
                    value={form.state} onChange={set('state')}
                    style={{ textTransform: 'uppercase' }} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Ações mobile (bottom) ── */}
          <div className="ep-mobile-actions">
            <button type="button" className="ep-cancel" onClick={() => navigate('/perfil')}>
              Cancelar
            </button>
            <button type="submit" className={`ep-save${saved ? ' ep-save-done' : ''}`} disabled={loading}>
              {loading ? <><span className="btn-spinner" /> Salvando…</> : saved ? <><IcoCheck /> Salvo!</> : 'Salvar alterações'}
            </button>
          </div>

        </form>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
