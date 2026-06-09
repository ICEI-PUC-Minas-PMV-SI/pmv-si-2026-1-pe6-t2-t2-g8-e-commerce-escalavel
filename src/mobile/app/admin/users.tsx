import { useState, useEffect, useMemo } from 'react'
import { StyleSheet, View, FlatList, Pressable, TextInput as RNInput } from 'react-native'
import { Text, Snackbar, ActivityIndicator, Portal, Dialog, Button, Divider } from 'react-native-paper'
import { Redirect } from 'expo-router'
import { useAuth } from '@/src/contexts/AuthContext'
import { userService, User } from '@/src/services/userService'

const ACCENT = '#C9A96E'
const DARK   = '#0A0A0A'
const GREEN  = '#22C55E'
const RED    = '#EF4444'
const GOLD   = '#F59E0B'

function fmtCPF(v?: string | null) {
  if (!v) return null
  const d = v.replace(/\D/g, '')
  if (d.length === 11) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`
  return v
}
function fmtPhone(v?: string | null) {
  if (!v) return null
  const d = v.replace(/\D/g, '')
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
  return v
}

type Filter     = 'all' | 'active' | 'inactive'
type ActionType = 'deactivate' | 'reactivate' | 'delete'

const FILTER_OPTS: { key: Filter; label: string }[] = [
  { key: 'all',      label: 'Todos'    },
  { key: 'active',   label: 'Ativos'   },
  { key: 'inactive', label: 'Inativos' },
]

export default function AdminUsersScreen() {
  const { user: me } = useAuth()

  if (!me)               return <Redirect href="/login" />
  if (me.role !== 'admin') return <Redirect href="/" />

  const [users, setUsers]           = useState<User[]>([])
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter]         = useState<Filter>('all')
  const [search, setSearch]         = useState('')
  const [snack, setSnack]           = useState('')
  const [snackOk, setSnackOk]       = useState(true)
  const [processing, setProcessing] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalTarget, setModalTarget]   = useState<User | null>(null)
  const [modalAction, setModalAction]   = useState<ActionType>('deactivate')

  const toast = (msg: string, ok = true) => { setSnack(msg); setSnackOk(ok) }

  const load = async (showCount = false) => {
    try {
      const data = await userService.getAllUsersAdmin()
      setUsers(data)
      if (showCount) toast(`${data.length} usuários carregados.`)
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Erro ao carregar.', false)
    } finally { setLoading(false); setRefreshing(false) }
  }

  useEffect(() => { load() }, [])

  const stats = useMemo(() => ({
    total:    users.length,
    active:   users.filter(u => u.active).length,
    inactive: users.filter(u => !u.active).length,
    admins:   users.filter(u => u.role === 'admin').length,
  }), [users])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return users.filter(u => {
      const ok = filter === 'all' ? true : filter === 'active' ? u.active : !u.active
      return ok && (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    })
  }, [users, filter, search])

  const changeTab = (t: Filter) => {
    setFilter(t)
    const n   = t === 'all' ? stats.total : t === 'active' ? stats.active : stats.inactive
    const lbl = t === 'all' ? 'todos' : t === 'active' ? 'ativos' : 'inativos'
    toast(`${n} usuário${n !== 1 ? 's' : ''} ${lbl}.`)
  }

  const openModal = (u: User, action: ActionType) => {
    setModalTarget(u); setModalAction(action); setModalVisible(true)
  }

  const handleConfirm = async () => {
    if (!modalTarget) return
    setProcessing(true)
    try {
      if (modalAction === 'deactivate') {
        await userService.deactivate(modalTarget.id)
        setUsers(p => p.map(x => x.id === modalTarget.id ? { ...x, active: false } : x))
        toast(`"${modalTarget.name}" desativado.`)
      } else if (modalAction === 'reactivate') {
        await userService.reactivate(modalTarget.id)
        setUsers(p => p.map(x => x.id === modalTarget.id ? { ...x, active: true } : x))
        toast(`"${modalTarget.name}" reativado.`)
      } else {
        await userService.hardDelete(modalTarget.id)
        setUsers(p => p.filter(x => x.id !== modalTarget.id))
        toast(`"${modalTarget.name}" excluído.`)
      }
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Erro.', false)
    } finally { setProcessing(false); setModalVisible(false) }
  }

  const modalColor = modalAction === 'delete' ? RED : modalAction === 'deactivate' ? GOLD : GREEN
  const modalTitle = modalAction === 'deactivate' ? 'Desativar conta'
    : modalAction === 'reactivate' ? 'Reativar conta' : 'Excluir permanentemente'
  const modalBody = modalAction === 'deactivate'
    ? `Desativar "${modalTarget?.name}"?\n\nO usuário será desconectado, mas os dados serão mantidos.`
    : modalAction === 'reactivate' ? `Reativar a conta de "${modalTarget?.name}"?`
    : `Excluir "${modalTarget?.name}" definitivamente?\n\nEsta ação é irreversível.`

  const renderItem = ({ item: u, index }: { item: User; index: number }) => {
    const initials = u.name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase()
    const isAdmin  = u.role === 'admin'
    return (
      <View style={[s.card, index === 0 && s.cardFirst]}>

        {/* Linha superior */}
        <View style={s.cardRow}>
          {/* Avatar */}
          <View style={[s.avatar, { backgroundColor: isAdmin ? '#1a0f00' : '#0f0f1a' }]}>
            <Text style={[s.avatarTxt, { color: isAdmin ? GOLD : '#90b8e0' }]}>{initials}</Text>
          </View>

          {/* Info */}
          <View style={s.cardInfo}>
            <View style={s.nameRow}>
              <Text style={s.cardName} numberOfLines={1}>{u.name}</Text>
              {isAdmin && (
                <View style={s.adminChip}>
                  <Text style={s.adminChipTxt}>⚑ Admin</Text>
                </View>
              )}
            </View>
            <Text style={s.cardEmail} numberOfLines={1}>{u.email}</Text>
          </View>

          {/* Status */}
          <View style={[s.statusChip, u.active ? s.chipActive : s.chipInactive]}>
            <View style={[s.statusDot, { backgroundColor: u.active ? GREEN : '#9CA3AF' }]} />
            <Text style={[s.statusTxt, { color: u.active ? GREEN : '#9CA3AF' }]}>
              {u.active ? 'Ativo' : 'Inativo'}
            </Text>
          </View>
        </View>

        {/* Detalhes */}
        <View style={s.detailRow}>
          <View style={s.detailCell}>
            <Text style={s.detailLbl}>CPF</Text>
            <Text style={[s.detailVal, !fmtCPF(u.cpf) && s.detailEmpty]}>
              {fmtCPF(u.cpf) ?? 'Não informado'}
            </Text>
          </View>
          <View style={s.detailSep} />
          <View style={s.detailCell}>
            <Text style={s.detailLbl}>TELEFONE</Text>
            <Text style={[s.detailVal, !fmtPhone(u.phone) && s.detailEmpty]}>
              {fmtPhone(u.phone) ?? 'Não informado'}
            </Text>
          </View>
        </View>

        {/* Ações */}
        <View style={s.actionRow}>
          {u.active ? (
            <Pressable style={[s.actionBtn, s.btnWarn]} onPress={() => openModal(u, 'deactivate')}>
              <Text style={[s.actionTxt, { color: GOLD }]}>⏸  Desativar</Text>
            </Pressable>
          ) : (
            <Pressable style={[s.actionBtn, s.btnGreen]} onPress={() => openModal(u, 'reactivate')}>
              <Text style={[s.actionTxt, { color: GREEN }]}>▶  Reativar</Text>
            </Pressable>
          )}
          <Pressable style={[s.actionBtn, s.btnDanger]} onPress={() => openModal(u, 'delete')}>
            <Text style={[s.actionTxt, { color: RED }]}>🗑  Excluir</Text>
          </Pressable>
        </View>

      </View>
    )
  }

  return (
    <View style={s.root}>

      {/* ══ HERO ══ */}
      <View style={s.hero}>
        <View style={s.heroDecor} pointerEvents="none">
          {Array.from({ length: 5 }).map((_, i) => <View key={i} style={s.decorLine} />)}
        </View>
        <View style={s.heroTop}>
          <View>
            <Text style={s.heroLabel}>OUTSIDER · ADMIN</Text>
            <Text style={s.heroTitle}>Gestão de{'\n'}Usuários</Text>
          </View>
          <Pressable
            style={[s.refreshBtn, refreshing && s.refreshBtnLoading]}
            onPress={() => { if (!refreshing) { setRefreshing(true); load(true) } }}
          >
            {refreshing
              ? <ActivityIndicator size={14} color="rgba(255,255,255,0.7)" />
              : <Text style={s.refreshIco}>⟳</Text>}
            <Text style={s.refreshTxt}>{refreshing ? 'Atualizando' : 'Atualizar'}</Text>
          </Pressable>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          {[
            { val: stats.total,    lbl: 'Total',    color: '#FFF' },
            { val: stats.active,   lbl: 'Ativos',   color: GREEN  },
            { val: stats.inactive, lbl: 'Inativos', color: RED    },
            { val: stats.admins,   lbl: 'Admins',   color: GOLD   },
          ].map((st, i) => (
            <View key={i} style={s.statWrap}>
              {i > 0 && <View style={s.statDivider} />}
              <View style={s.stat}>
                <Text style={[s.statNum, { color: st.color }]}>{st.val}</Text>
                <Text style={s.statLbl}>{st.lbl}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* ══ CONTROLES ══ */}
      <View style={s.controls}>
        {/* Search */}
        <View style={s.searchBox}>
          <Text style={s.searchIco}>🔍</Text>
          <RNInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por nome ou e-mail..."
            placeholderTextColor="#9CA3AF"
            style={s.searchInput}
          />
          {!!search && (
            <Pressable onPress={() => setSearch('')} style={s.searchClear}>
              <Text style={s.searchClearTxt}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* Filtros */}
        <View style={s.filterRow}>
          <View style={s.filterGroup}>
            {FILTER_OPTS.map(opt => (
              <Pressable
                key={opt.key}
                onPress={() => changeTab(opt.key)}
                style={[s.filterBtn, filter === opt.key && s.filterBtnActive]}
              >
                <Text style={[s.filterTxt, filter === opt.key && s.filterTxtActive]}>
                  {opt.label}
                </Text>
                {filter === opt.key && (
                  <View style={s.filterCount}>
                    <Text style={s.filterCountTxt}>
                      {opt.key === 'all' ? stats.total : opt.key === 'active' ? stats.active : stats.inactive}
                    </Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
          <Text style={s.resultCount}>{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</Text>
        </View>
      </View>

      {/* ══ LISTA ══ */}
      {loading ? (
        <View style={s.center}><ActivityIndicator color={DARK} size="large" /></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={u => u.id}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.emptyState}>
              <Text style={s.emptyIcon}>👤</Text>
              <Text style={s.emptyTitle}>Nenhum resultado</Text>
              <Text style={s.emptyHint}>Tente ajustar os filtros ou a busca</Text>
            </View>
          }
        />
      )}

      {/* ══ MODAL ══ */}
      <Portal>
        <Dialog visible={modalVisible} onDismiss={() => !processing && setModalVisible(false)}>
          <Dialog.Icon
            icon={modalAction === 'delete' ? 'delete-alert' : modalAction === 'deactivate' ? 'account-off' : 'account-check'}
            color={modalColor}
          />
          <Dialog.Title style={{ textAlign: 'center' }}>{modalTitle}</Dialog.Title>
          <Dialog.Content>
            <Text style={{ textAlign: 'center', color: '#6B7280', lineHeight: 22 }}>{modalBody}</Text>
          </Dialog.Content>
          <Dialog.Actions style={{ justifyContent: 'space-between', paddingHorizontal: 16 }}>
            <Button onPress={() => setModalVisible(false)} disabled={processing} textColor="#9CA3AF">
              Cancelar
            </Button>
            <Button
              onPress={handleConfirm}
              loading={processing}
              disabled={processing}
              textColor={modalColor}
              labelStyle={{ fontWeight: '800' }}
            >
              Confirmar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={!!snack}
        onDismiss={() => setSnack('')}
        duration={3000}
        style={{ backgroundColor: snackOk ? '#14532D' : '#7F1D1D', borderRadius: 10 }}
      >
        {snack}
      </Snackbar>
    </View>
  )
}

const s = StyleSheet.create({
  root:              { flex: 1, backgroundColor: '#F1F2F4' },

  /* Hero */
  hero:              { backgroundColor: DARK, overflow: 'hidden' },
  heroDecor:         { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'space-evenly', opacity: 0.04 },
  decorLine:         { height: 1, backgroundColor: '#FFF' },
  heroTop:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 20, paddingBottom: 16 },
  heroLabel:         { color: ACCENT, fontSize: 10, letterSpacing: 4, fontWeight: '800', marginBottom: 8 },
  heroTitle:         { color: '#FFF', fontSize: 26, fontWeight: '900', lineHeight: 30, letterSpacing: -0.5 },
  refreshBtn:        { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginTop: 4 },
  refreshBtnLoading: { opacity: 0.6 },
  refreshIco:        { color: 'rgba(255,255,255,0.7)', fontSize: 16 },
  refreshTxt:        { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
  statsRow:          { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  statWrap:          { flex: 1, flexDirection: 'row' },
  stat:              { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statNum:           { fontSize: 24, fontWeight: '900' },
  statLbl:           { color: 'rgba(255,255,255,0.3)', fontSize: 9, marginTop: 3, textTransform: 'uppercase', letterSpacing: 1 },
  statDivider:       { width: 1, backgroundColor: 'rgba(255,255,255,0.06)' },

  /* Controls */
  controls:          { backgroundColor: '#FFF', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  searchBox:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12, height: 46, marginBottom: 12 },
  searchIco:         { fontSize: 15, marginRight: 8, opacity: 0.5 },
  searchInput:       { flex: 1, fontSize: 14, color: DARK, height: 46, outlineStyle: 'none' } as any,
  searchClear:       { padding: 4 },
  searchClearTxt:    { color: '#9CA3AF', fontSize: 13, fontWeight: '600' },
  filterRow:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  filterGroup:       { flexDirection: 'row', gap: 6 },
  filterBtn:         { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#F8F9FA' },
  filterBtnActive:   { backgroundColor: DARK, borderColor: DARK },
  filterTxt:         { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  filterTxtActive:   { color: '#FFF' },
  filterCount:       { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 },
  filterCountTxt:    { color: '#FFF', fontSize: 11, fontWeight: '700' },
  resultCount:       { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },

  /* List */
  list:              { padding: 14, gap: 10, paddingBottom: 32 },

  /* Card */
  card:              { backgroundColor: '#FFF', borderRadius: 14, padding: 16, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  cardFirst:         {},
  cardRow:           { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  avatar:            { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarTxt:         { fontSize: 16, fontWeight: '900' },
  cardInfo:          { flex: 1, minWidth: 0 },
  nameRow:           { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  cardName:          { fontSize: 15, fontWeight: '700', color: DARK, flexShrink: 1 },
  adminChip:         { backgroundColor: 'rgba(245,158,11,0.1)', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  adminChipTxt:      { fontSize: 10, fontWeight: '800', color: GOLD },
  cardEmail:         { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  statusChip:        { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, paddingHorizontal: 9, paddingVertical: 5, flexShrink: 0 },
  chipActive:        { backgroundColor: 'rgba(34,197,94,0.08)' },
  chipInactive:      { backgroundColor: '#F3F4F6' },
  statusDot:         { width: 6, height: 6, borderRadius: 3 },
  statusTxt:         { fontSize: 11, fontWeight: '700' },

  detailRow:         { flexDirection: 'row', backgroundColor: '#F8F9FA', borderRadius: 10, padding: 12, marginBottom: 12 },
  detailCell:        { flex: 1 },
  detailSep:         { width: 1, backgroundColor: '#E5E7EB', marginHorizontal: 12 },
  detailLbl:         { fontSize: 9, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600', marginBottom: 4 },
  detailVal:         { fontSize: 13, color: DARK, fontWeight: '600' },
  detailEmpty:       { color: '#D1D5DB', fontStyle: 'italic', fontWeight: '400' },

  actionRow:         { flexDirection: 'row', gap: 8 },
  actionBtn:         { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1.5 },
  btnWarn:           { borderColor: 'rgba(245,158,11,0.4)', backgroundColor: 'rgba(245,158,11,0.04)' },
  btnGreen:          { borderColor: 'rgba(34,197,94,0.4)', backgroundColor: 'rgba(34,197,94,0.04)' },
  btnDanger:         { borderColor: 'rgba(239,68,68,0.4)', backgroundColor: 'rgba(239,68,68,0.04)' },
  actionTxt:         { fontSize: 13, fontWeight: '700' },

  center:            { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyState:        { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyIcon:         { fontSize: 44, marginBottom: 4 },
  emptyTitle:        { fontSize: 16, fontWeight: '700', color: '#374151' },
  emptyHint:         { fontSize: 13, color: '#9CA3AF' },
})
