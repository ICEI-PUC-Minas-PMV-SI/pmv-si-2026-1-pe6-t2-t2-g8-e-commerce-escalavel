// src/pages/AdminUsersPage.tsx
import { useEffect, useState, useMemo } from 'react'
import { User, apiGetAllUsersAdmin, apiDeleteUser, apiReactivateUser, apiHardDeleteUser } from '../../services/userApi'
import Toast, { ToastData } from '../../components/Toast'

type TabFilter  = 'all' | 'active' | 'inactive'
type ModalAction = 'deactivate' | 'reactivate' | 'hard-delete'

/* ── Formatadores ── */
const fmtPhone = (v: string) => {
  if (!v) return null
  const d = v.replace(/\D/g, '')
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`
  return v
}
const fmtCPF = (v: string) => {
  if (!v) return null
  const d = v.replace(/\D/g, '')
  if (d.length === 11) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`
  return v
}

/* ── Avatar ── */
function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  return (
    <span className="au-avatar" style={{ width: size, height: size, fontSize: size * 0.33 }}>
      {initials}
    </span>
  )
}

/* ── Ícones ── */
const IcoRefresh = ({ spinning }: { spinning?: boolean }) => (
  <svg
    width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    className={spinning ? 'au-icon-spin' : ''}
  >
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
)
const IcoSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IcoUsers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const IcoShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)
const IcoPause = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
  </svg>
)
const IcoPlay = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
)
const IcoTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
)
const IcoWarn = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)

export default function AdminUsersPage() {
  const [users, setUsers]         = useState<User[]>([])
  const [loading, setLoading]     = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch]       = useState('')
  const [tab, setTab]             = useState<TabFilter>('all')
  const [toast, setToast]         = useState<ToastData | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [modalAction, setModalAction]   = useState<ModalAction>('deactivate')
  const [processing, setProcessing]     = useState(false)

  const showToast = (msg: string, type: ToastData['type']) => setToast({ message: msg, type })

  /* carga inicial — sem toast */
  const load = async () => {
    setLoading(true)
    try { setUsers(await apiGetAllUsersAdmin()) }
    catch (err: unknown) { showToast(err instanceof Error ? err.message : 'Erro ao carregar.', 'error') }
    finally { setLoading(false) }
  }

  /* refresh manual — com ícone girando + toast */
  const handleRefresh = async () => {
    if (refreshing) return
    setRefreshing(true)
    try {
      const data = await apiGetAllUsersAdmin()
      setUsers(data)
      showToast(`Lista atualizada — ${data.length} usuário${data.length !== 1 ? 's' : ''} carregado${data.length !== 1 ? 's' : ''}.`, 'success')
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Erro ao atualizar lista.', 'error')
    } finally {
      setRefreshing(false)
    }
  }

  const handleTabChange = (t: TabFilter) => {
    setTab(t)
    const count = t === 'all' ? users.length : t === 'active'
      ? users.filter(u => u.active).length
      : users.filter(u => !u.active).length
    const label = t === 'all' ? 'todos' : t === 'active' ? 'ativos' : 'inativos'
    showToast(`Exibindo ${count} usuário${count !== 1 ? 's' : ''} ${label}.`, 'success')
  }

  useEffect(() => { load() }, [])

  const stats = useMemo(() => ({
    total:    users.length,
    active:   users.filter(u => u.active).length,
    inactive: users.filter(u => !u.active).length,
    admins:   users.filter(u => u.role === 'admin').length,
  }), [users])

  const filtered = useMemo(() => users.filter(u => {
    const matchTab = tab === 'all' ? true : tab === 'active' ? u.active : !u.active
    const q = search.toLowerCase()
    return matchTab && (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
  }), [users, tab, search])

  const openModal = (user: User, action: ModalAction) => {
    setSelectedUser(user); setModalAction(action)
  }

  const handleConfirm = async () => {
    if (!selectedUser) return
    setProcessing(true)
    try {
      if (modalAction === 'deactivate') {
        await apiDeleteUser(selectedUser.id)
        setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, active: false } : u))
        showToast(`Conta de "${selectedUser.name}" desativada.`, 'success')
      } else if (modalAction === 'reactivate') {
        await apiReactivateUser(selectedUser.id)
        setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, active: true } : u))
        showToast(`Conta de "${selectedUser.name}" reativada.`, 'success')
      } else {
        await apiHardDeleteUser(selectedUser.id)
        setUsers(prev => prev.filter(u => u.id !== selectedUser.id))
        showToast(`"${selectedUser.name}" excluído permanentemente.`, 'success')
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Erro ao processar.', 'error')
    } finally {
      setProcessing(false); setSelectedUser(null)
    }
  }

  /* ── Conteúdo do modal ── */
  const modalMeta = {
    deactivate: {
      title: 'Desativar usuário',
      body: (name: string) => <>Deseja desativar a conta de <strong>{name}</strong>? O usuário perderá o acesso imediatamente. Os dados não serão removidos.</>,
      confirmClass: 'au-modal-btn au-modal-danger',
      confirmLabel: 'Desativar',
    },
    reactivate: {
      title: 'Reativar usuário',
      body: (name: string) => <>Deseja reativar a conta de <strong>{name}</strong>? O usuário voltará a ter acesso completo ao sistema.</>,
      confirmClass: 'au-modal-btn au-modal-success',
      confirmLabel: 'Reativar',
    },
    'hard-delete': {
      title: 'Excluir permanentemente',
      body: (name: string) => <>Você está prestes a excluir todos os dados de <strong>{name}</strong>. Essa ação não pode ser desfeita.</>,
      confirmClass: 'au-modal-btn au-modal-hard',
      confirmLabel: 'Excluir definitivamente',
    },
  }

  return (
    <div className="au-root">

      {/* ══ HERO ══ */}
      <div className="au-hero">
        <div className="au-hero-inner">
          <div className="au-hero-left">
            <div className="au-hero-icon"><IcoUsers /></div>
            <div>
              <h1 className="au-hero-title">Usuários</h1>
              <p className="au-hero-sub">Gerencie contas e permissões</p>
            </div>
          </div>
          <button className="au-refresh" onClick={handleRefresh} disabled={refreshing}>
            <IcoRefresh spinning={refreshing} />
            {refreshing ? 'Atualizando…' : 'Atualizar'}
          </button>
        </div>

        {/* stats */}
        <div className="au-stats">
          <div className="au-stat">
            <span className="au-stat-num">{stats.total}</span>
            <span className="au-stat-lbl">Total</span>
          </div>
          <div className="au-stat-sep" />
          <div className="au-stat">
            <span className="au-stat-num au-num-green">{stats.active}</span>
            <span className="au-stat-lbl">Ativos</span>
          </div>
          <div className="au-stat-sep" />
          <div className="au-stat">
            <span className="au-stat-num au-num-red">{stats.inactive}</span>
            <span className="au-stat-lbl">Inativos</span>
          </div>
          <div className="au-stat-sep" />
          <div className="au-stat">
            <span className="au-stat-num au-num-gold">{stats.admins}</span>
            <span className="au-stat-lbl"><span style={{display:'inline',marginRight:3}}><IcoShield /></span>Admins</span>
          </div>
        </div>
      </div>

      {/* ══ TABELA ══ */}
      <div className="au-body">

        {/* toolbar */}
        <div className="au-toolbar">
          <div className="au-tabs">
            {(['all','active','inactive'] as TabFilter[]).map(t => (
              <button key={t} className={`au-tab${tab === t ? ' au-tab-on' : ''}`} onClick={() => handleTabChange(t)}>
                {t === 'all' ? 'Todos' : t === 'active' ? 'Ativos' : 'Inativos'}
                <span className="au-tab-count">
                  {t === 'all' ? stats.total : t === 'active' ? stats.active : stats.inactive}
                </span>
              </button>
            ))}
          </div>
          <div className="au-search-wrap">
            <IcoSearch />
            <input
              type="text"
              className="au-search"
              placeholder="Buscar por nome ou e-mail…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="au-search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
        </div>

        {/* tabela */}
        <div className="au-table-wrap">
          {loading ? (
            <div className="au-loading">
              <span className="btn-spinner" style={{ borderTopColor: '#888', borderColor: '#e5e7eb', width: 20, height: 20 }} />
              <span>Carregando usuários…</span>
            </div>
          ) : (
            <table className="au-table">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>CPF</th>
                  <th>Telefone</th>
                  <th>Perfil</th>
                  <th>Status</th>
                  <th>Cadastro</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="au-empty">
                      <div className="au-empty-inner">
                        <IcoSearch />
                        <p>Nenhum usuário encontrado</p>
                        {search && <button className="au-empty-clear" onClick={() => setSearch('')}>Limpar busca</button>}
                      </div>
                    </td>
                  </tr>
                ) : filtered.map(u => (
                  <tr key={u.id} className={!u.active ? 'au-row-off' : ''}>
                    <td>
                      <div className="au-user-cell">
                        <Avatar name={u.name} />
                        <div className="au-user-info">
                          <span className="au-user-name">{u.name}</span>
                          <span className="au-user-email">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="au-mono">{fmtCPF(u.cpf ?? '') ?? <span className="au-dash">—</span>}</td>
                    <td className="au-mono">{fmtPhone(u.phone ?? '') ?? <span className="au-dash">—</span>}</td>
                    <td>
                      <span className={`au-role ${u.role === 'admin' ? 'au-role-admin' : 'au-role-customer'}`}>
                        {u.role === 'admin' ? <><IcoShield /> Admin</> : 'Cliente'}
                      </span>
                    </td>
                    <td>
                      <span className={`au-status ${u.active ? 'au-status-on' : 'au-status-off'}`}>
                        <span className="au-status-dot" />
                        {u.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="au-date">
                      {new Date(u.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td>
                      <div className="au-actions">
                        {u.active ? (
                          <button className="au-action-btn au-btn-warn" onClick={() => openModal(u, 'deactivate')} title="Desativar conta">
                            <IcoPause /> Desativar
                          </button>
                        ) : (
                          <button className="au-action-btn au-btn-green" onClick={() => openModal(u, 'reactivate')} title="Reativar conta">
                            <IcoPlay /> Reativar
                          </button>
                        )}
                        <button className="au-action-btn au-btn-delete" onClick={() => openModal(u, 'hard-delete')} title="Excluir permanentemente">
                          <IcoTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* rodapé da tabela */}
        {!loading && filtered.length > 0 && (
          <div className="au-table-footer">
            Exibindo <strong>{filtered.length}</strong> de <strong>{stats.total}</strong> usuários
          </div>
        )}
      </div>

      {/* ══ MODAL ══ */}
      {selectedUser && (
        <div className="au-modal-overlay" onClick={() => !processing && setSelectedUser(null)}>
          <div className="au-modal" onClick={e => e.stopPropagation()}>

            {/* ícone */}
            <div className={`au-modal-icon ${modalAction === 'reactivate' ? 'au-modal-icon-green' : modalAction === 'hard-delete' ? 'au-modal-icon-hard' : 'au-modal-icon-warn'}`}>
              {modalAction === 'reactivate' ? <IcoPlay /> : <IcoWarn />}
            </div>

            {/* usuário alvo */}
            <div className="au-modal-user">
              <Avatar name={selectedUser.name} size={40} />
              <div>
                <p className="au-modal-uname">{selectedUser.name}</p>
                <p className="au-modal-uemail">{selectedUser.email}</p>
              </div>
            </div>

            <h2 className="au-modal-title">{modalMeta[modalAction].title}</h2>
            <p className="au-modal-body">{modalMeta[modalAction].body(selectedUser.name)}</p>

            {modalAction === 'hard-delete' && (
              <div className="au-modal-warn-box">
                <IcoWarn /> Esta ação é <strong>irreversível</strong>. Todos os dados serão removidos permanentemente.
              </div>
            )}

            <div className="au-modal-actions">
              <button className="au-modal-btn au-modal-cancel" onClick={() => setSelectedUser(null)} disabled={processing}>
                Cancelar
              </button>
              <button className={modalMeta[modalAction].confirmClass} onClick={handleConfirm} disabled={processing}>
                {processing ? <><span className="btn-spinner" /> Processando…</> : modalMeta[modalAction].confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
