// src/pages/AdminUsersPage.tsx
import { useEffect, useState, useMemo } from 'react'
import { User, apiGetAllUsersAdmin, apiDeleteUser, apiReactivateUser, apiHardDeleteUser } from '../../services/userApi'
import Toast, { ToastData } from '../../components/Toast'

type TabFilter = 'all' | 'active' | 'inactive'
type ModalAction = 'deactivate' | 'reactivate' | 'hard-delete'

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
  return <span className="avatar">{initials}</span>
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<TabFilter>('all')
  const [toast, setToast] = useState<ToastData | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [modalAction, setModalAction] = useState<ModalAction>('deactivate')
  const [processing, setProcessing] = useState(false)

  const showToast = (message: string, type: ToastData['type']) =>
    setToast({ message, type })

  const load = async () => {
    setLoading(true)
    try {
      const data = await apiGetAllUsersAdmin()
      setUsers(data)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Erro ao carregar usuários.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // Stats
  const stats = useMemo(() => ({
    total:    users.length,
    active:   users.filter(u => u.active).length,
    inactive: users.filter(u => !u.active).length,
    admins:   users.filter(u => u.role === 'admin').length,
  }), [users])

  // Filtro por aba + busca
  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchTab =
        tab === 'all' ? true :
        tab === 'active' ? u.active :
        !u.active
      const q = search.toLowerCase()
      const matchSearch = !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      return matchTab && matchSearch
    })
  }, [users, tab, search])

  const openModal = (user: User, action: ModalAction) => {
    setSelectedUser(user)
    setModalAction(action)
  }

  const handleConfirm = async () => {
    if (!selectedUser) return
    setProcessing(true)
    try {
      if (modalAction === 'deactivate') {
        await apiDeleteUser(selectedUser.id)
        setUsers(prev => prev.map(u =>
          u.id === selectedUser.id ? { ...u, active: false } : u
        ))
        showToast(`Conta de "${selectedUser.name}" desativada com sucesso.`, 'success')
      } else if (modalAction === 'reactivate') {
        await apiReactivateUser(selectedUser.id)
        setUsers(prev => prev.map(u =>
          u.id === selectedUser.id ? { ...u, active: true } : u
        ))
        showToast(`Conta de "${selectedUser.name}" reativada com sucesso.`, 'success')
      } else if (modalAction === 'hard-delete') {
        await apiHardDeleteUser(selectedUser.id)
        setUsers(prev => prev.filter(u => u.id !== selectedUser.id))
        showToast(`Usuário "${selectedUser.name}" excluído permanentemente.`, 'success')
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Erro ao processar ação.', 'error')
    } finally {
      setProcessing(false)
      setSelectedUser(null)
    }
  }

  return (
    <div className="page-wrapper">
      <div className="page-container page-container-full">

        {/* Cabeçalho */}
        <div className="page-header">
          <h1 className="page-title">Gerenciar Usuários</h1>
          <button className="btn btn-outline btn-sm" onClick={load}>
            ↻ Atualizar
          </button>
        </div>

        {/* Cards de estatísticas */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-card stat-card-green">
            <span className="stat-value">{stats.active}</span>
            <span className="stat-label">Ativos</span>
          </div>
          <div className="stat-card stat-card-red">
            <span className="stat-value">{stats.inactive}</span>
            <span className="stat-label">Inativos</span>
          </div>
          <div className="stat-card stat-card-dark">
            <span className="stat-value">{stats.admins}</span>
            <span className="stat-label">Admins</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="table-toolbar">
          <div className="tab-group">
            {(['all', 'active', 'inactive'] as TabFilter[]).map(t => (
              <button
                key={t}
                className={`tab-btn${tab === t ? ' tab-btn-active' : ''}`}
                onClick={() => setTab(t)}
              >
                {t === 'all' ? 'Todos' : t === 'active' ? 'Ativos' : 'Inativos'}
                <span className="tab-count">
                  {t === 'all' ? stats.total : t === 'active' ? stats.active : stats.inactive}
                </span>
              </button>
            ))}
          </div>
          <input
            type="text"
            className="form-input search-input"
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Tabela */}
        {loading ? (
          <div className="loading">Carregando...</div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>CPF</th>
                  <th>Telefone</th>
                  <th>Perfil</th>
                  <th>Status</th>
                  <th>Desde</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="table-empty">
                      Nenhum usuário encontrado
                    </td>
                  </tr>
                ) : (
                  filtered.map(u => (
                    <tr key={u.id} className={!u.active ? 'row-inactive' : ''}>
                      <td>
                        <div className="user-cell">
                          <Avatar name={u.name} />
                          <div className="user-info">
                            <span className="user-name">{u.name}</span>
                            <span className="user-email">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>{u.cpf || '—'}</td>
                      <td>{u.phone || '—'}</td>
                      <td>
                        <span className={`badge badge-${u.role}`}>{u.role}</span>
                      </td>
                      <td>
                        <span className={`status-pill ${u.active ? 'status-active' : 'status-inactive'}`}>
                          {u.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td>{new Date(u.created_at).toLocaleDateString('pt-BR')}</td>
                      <td>
                        <div className="action-btns">
                          {u.active ? (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => openModal(u, 'deactivate')}
                            >
                              Desativar
                            </button>
                          ) : (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => openModal(u, 'reactivate')}
                            >
                              Reativar
                            </button>
                          )}
                          <button
                            className="btn btn-hard-delete btn-sm"
                            onClick={() => openModal(u, 'hard-delete')}
                            title="Excluir permanentemente"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de confirmação */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => !processing && setSelectedUser(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">
              {modalAction === 'deactivate' && 'Desativar usuário'}
              {modalAction === 'reactivate' && 'Reativar usuário'}
              {modalAction === 'hard-delete' && '⚠ Excluir permanentemente'}
            </h2>
            <p className="modal-text">
              {modalAction === 'deactivate' && (
                <>
                  Tem certeza que deseja desativar a conta de{' '}
                  <strong>{selectedUser.name}</strong>?<br />
                  O usuário perderá o acesso imediatamente. Os dados não serão excluídos.
                </>
              )}
              {modalAction === 'reactivate' && (
                <>
                  Deseja reativar a conta de <strong>{selectedUser.name}</strong>?<br />
                  O usuário voltará a ter acesso ao sistema com as mesmas permissões.
                </>
              )}
              {modalAction === 'hard-delete' && (
                <>
                  Você está prestes a excluir permanentemente a conta de{' '}
                  <strong>{selectedUser.name}</strong>.<br /><br />
                  <span className="modal-warning">
                    Esta ação é irreversível. Todos os dados do usuário serão removidos
                    definitivamente do banco de dados e não poderão ser recuperados.
                  </span>
                </>
              )}
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => setSelectedUser(null)}
                disabled={processing}
              >
                Cancelar
              </button>
              <button
                className={`btn ${
                  modalAction === 'reactivate' ? 'btn-success' :
                  modalAction === 'hard-delete' ? 'btn-hard-delete' :
                  'btn-danger'
                }`}
                onClick={handleConfirm}
                disabled={processing}
              >
                {processing ? (
                  <><span className="btn-spinner" /> Processando...</>
                ) : (
                  modalAction === 'deactivate' ? 'Confirmar desativação' :
                  modalAction === 'reactivate' ? 'Confirmar reativação' :
                  'Excluir permanentemente'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
