import { useState } from 'react'
import { StyleSheet, View, ScrollView, Pressable } from 'react-native'
import { Text, Portal, Dialog, Button, Snackbar, Divider } from 'react-native-paper'
import { useRouter, Redirect } from 'expo-router'
import { useAuth } from '@/src/contexts/AuthContext'
import { userService } from '@/src/services/userService'

const ACCENT = '#C9A96E'
const DARK   = '#0A0A0A'
const RED    = '#EF4444'
const GREEN  = '#22C55E'

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
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`
  return v
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      {value
        ? <Text style={s.infoValue}>{value}</Text>
        : <Text style={s.infoEmpty}>Não informado</Text>}
    </View>
  )
}

export default function ProfileScreen() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [loading, setLoading]     = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [snack, setSnack]         = useState('')

  if (!user) return <Redirect href="/login" />

  const initials  = user.name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase()
  const firstName = user.name.split(' ')[0]
  const joinDate  = new Date(user.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  const hasAddress = !!user.address?.street
  const isAdmin   = user.role === 'admin'

  const handleDeactivate = async () => {
    setLoading(true)
    try {
      await userService.deactivate(user.id)
      setShowModal(false)
      logout()
      router.replace('/login')
    } catch (err: unknown) {
      setSnack(err instanceof Error ? err.message : 'Erro ao desativar conta.')
      setShowModal(false)
    } finally { setLoading(false) }
  }

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

      {/* ══ HERO ══ */}
      <View style={s.hero}>
        {/* Linhas decorativas */}
        <View style={s.heroDecor} pointerEvents="none">
          {Array.from({ length: 5 }).map((_, i) => <View key={i} style={s.decorLine} />)}
        </View>

        {/* Avatar + info */}
        <View style={s.heroMain}>
          <View style={s.avatarWrap}>
            <View style={[s.avatar, { backgroundColor: isAdmin ? '#1a0f00' : '#1a1a2e' }]}>
              <Text style={[s.avatarTxt, { color: isAdmin ? ACCENT : '#90b8e0' }]}>{initials}</Text>
            </View>
            <View style={[s.statusDot, { backgroundColor: user.active !== false ? GREEN : '#9CA3AF' }]} />
          </View>

          <View style={s.heroInfo}>
            <Text style={s.heroName}>{user.name}</Text>
            <View style={[s.rolePill, isAdmin && s.rolePillAdmin]}>
              <Text style={[s.roleText, isAdmin && s.roleTextAdmin]}>
                {isAdmin ? '⚑  Administrador' : 'Cliente'}
              </Text>
            </View>
            <Text style={s.heroEmail}>{user.email}</Text>
            <Text style={s.heroDate}>📅  Membro desde {joinDate}</Text>
          </View>
        </View>

        {/* Stats strip */}
        <View style={s.statsStrip}>
          {[
            { val: firstName,                  lbl: 'Nome' },
            { val: fmtCPF(user.cpf) ?? '—',   lbl: 'CPF' },
            { val: fmtPhone(user.phone) ?? '—',lbl: 'Telefone' },
            { val: user.address?.city ?? '—',  lbl: 'Cidade' },
          ].map((st, i) => (
            <View key={i} style={s.statWrap}>
              {i > 0 && <View style={s.statDivider} />}
              <View style={s.stat}>
                <Text style={s.statVal} numberOfLines={1}>{st.val}</Text>
                <Text style={s.statLbl}>{st.lbl}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Ações */}
        <View style={s.heroBtns}>
          <Pressable style={s.btnWhite} onPress={() => router.push('/profile/edit')}>
            <Text style={s.btnWhiteTxt}>✏  Editar perfil</Text>
          </Pressable>
          <Pressable style={s.btnGhost} onPress={() => router.push('/profile/password')}>
            <Text style={s.btnGhostTxt}>Alterar senha</Text>
          </Pressable>
        </View>
      </View>

      {/* ══ CARDS ══ */}
      <View style={s.cards}>

        {/* Dados pessoais */}
        <View style={s.card}>
          <View style={s.cardHead}>
            <View style={[s.cardIcon, { backgroundColor: '#EFF6FF' }]}>
              <Text style={s.cardIconEmoji}>👤</Text>
            </View>
            <View style={s.cardHeadText}>
              <Text style={s.cardTitle}>Dados pessoais</Text>
              <Text style={s.cardSub}>Suas informações cadastradas</Text>
            </View>
            <Pressable onPress={() => router.push('/profile/edit')} style={s.editBtn}>
              <Text style={s.editBtnTxt}>Editar</Text>
            </Pressable>
          </View>
          <Divider style={s.divider} />
          <InfoRow label="NOME COMPLETO" value={user.name} />
          <InfoRow label="E-MAIL" value={user.email} />
          <View style={s.infoGrid}>
            <View style={s.infoGridItem}>
              <Text style={s.infoLabel}>CPF</Text>
              {fmtCPF(user.cpf)
                ? <Text style={s.infoValue}>{fmtCPF(user.cpf)}</Text>
                : <Text style={s.infoEmpty}>Não informado</Text>}
            </View>
            <View style={s.infoGridItem}>
              <Text style={s.infoLabel}>TELEFONE</Text>
              {fmtPhone(user.phone)
                ? <Text style={s.infoValue}>{fmtPhone(user.phone)}</Text>
                : <Text style={s.infoEmpty}>Não informado</Text>}
            </View>
          </View>
        </View>

        {/* Endereço */}
        <View style={s.card}>
          <View style={s.cardHead}>
            <View style={[s.cardIcon, { backgroundColor: '#F0FDF4' }]}>
              <Text style={s.cardIconEmoji}>📍</Text>
            </View>
            <View style={s.cardHeadText}>
              <Text style={s.cardTitle}>Endereço</Text>
              <Text style={s.cardSub}>Endereço para entrega</Text>
            </View>
            {hasAddress && (
              <Pressable onPress={() => router.push('/profile/edit')} style={s.editBtn}>
                <Text style={s.editBtnTxt}>Editar</Text>
              </Pressable>
            )}
          </View>
          <Divider style={s.divider} />
          {hasAddress ? (
            <>
              <InfoRow label="RUA / LOGRADOURO" value={user.address?.street} />
              <View style={s.infoGrid}>
                <View style={s.infoGridItem}>
                  <Text style={s.infoLabel}>CIDADE</Text>
                  <Text style={s.infoValue}>{user.address?.city}</Text>
                </View>
                <View style={s.infoGridItem}>
                  <Text style={s.infoLabel}>ESTADO</Text>
                  <Text style={s.infoValue}>{user.address?.state}</Text>
                </View>
                <View style={s.infoGridItem}>
                  <Text style={s.infoLabel}>CEP</Text>
                  <Text style={s.infoValue}>{user.address?.zip}</Text>
                </View>
              </View>
            </>
          ) : (
            <View style={s.emptyState}>
              <Text style={s.emptyTxt}>Nenhum endereço cadastrado.</Text>
              <Pressable onPress={() => router.push('/profile/edit')} style={s.addBtn}>
                <Text style={s.addBtnTxt}>+ Adicionar endereço</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Segurança */}
        <View style={s.card}>
          <View style={s.cardHead}>
            <View style={[s.cardIcon, { backgroundColor: '#FFFBEB' }]}>
              <Text style={s.cardIconEmoji}>🔒</Text>
            </View>
            <View style={s.cardHeadText}>
              <Text style={s.cardTitle}>Segurança</Text>
              <Text style={s.cardSub}>Gerencie sua senha de acesso</Text>
            </View>
          </View>
          <Divider style={s.divider} />
          <View style={s.secRow}>
            <View style={s.secText}>
              <Text style={s.secLabel}>Senha de acesso</Text>
              <Text style={s.secHint}>Recomendamos trocar periodicamente</Text>
            </View>
            <Pressable onPress={() => router.push('/profile/password')} style={s.editBtn}>
              <Text style={s.editBtnTxt}>Alterar</Text>
            </Pressable>
          </View>
        </View>

        {/* Zona de perigo */}
        <View style={[s.card, s.cardDanger]}>
          <View style={s.cardHead}>
            <View style={[s.cardIcon, { backgroundColor: '#FEF2F2' }]}>
              <Text style={s.cardIconEmoji}>⚠️</Text>
            </View>
            <View style={s.cardHeadText}>
              <Text style={[s.cardTitle, { color: RED }]}>Zona de perigo</Text>
              <Text style={s.cardSub}>Ações irreversíveis da conta</Text>
            </View>
          </View>
          <Divider style={s.divider} />
          <View style={s.dangerWarnBox}>
            <Text style={s.dangerWarnTxt}>
              Ao desativar sua conta você será desconectado imediatamente.{' '}
              <Text style={s.dangerWarnBold}>Seus dados não serão excluídos</Text>
              {' '}e podem ser reativados por um administrador.
            </Text>
          </View>
          <Pressable style={s.dangerBtn} onPress={() => setShowModal(true)}>
            <Text style={s.dangerBtnTxt}>Desativar minha conta</Text>
          </Pressable>
        </View>

      </View>

      {/* Modal */}
      <Portal>
        <Dialog visible={showModal} onDismiss={() => !loading && setShowModal(false)}>
          <Dialog.Icon icon="alert-circle-outline" />
          <Dialog.Title style={{ textAlign: 'center' }}>Desativar conta</Dialog.Title>
          <Dialog.Content>
            <Text style={{ textAlign: 'center', color: '#6B7280', lineHeight: 22 }}>
              Tem certeza? Você será desconectado imediatamente.{'\n\n'}
              Seus dados <Text style={{ fontWeight: '700', color: DARK }}>não serão excluídos</Text> e podem ser reativados por um administrador.
            </Text>
          </Dialog.Content>
          <Dialog.Actions style={{ justifyContent: 'space-between', paddingHorizontal: 16 }}>
            <Button onPress={() => setShowModal(false)} disabled={loading} textColor="#6B7280">Cancelar</Button>
            <Button onPress={handleDeactivate} loading={loading} disabled={loading} textColor={RED} labelStyle={{ fontWeight: '700' }}>
              Confirmar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3000} style={{ backgroundColor: '#1A1A1A' }}>
        {snack}
      </Snackbar>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: '#F3F4F6' },
  content:       { paddingBottom: 48 },

  /* Hero */
  hero:          { backgroundColor: DARK, paddingBottom: 0, overflow: 'hidden' },
  heroDecor:     { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'space-evenly', opacity: 0.04 },
  decorLine:     { height: 1, backgroundColor: '#FFF', width: '100%' },
  heroMain:      { flexDirection: 'row', padding: 24, paddingBottom: 20, gap: 16, alignItems: 'flex-start' },
  avatarWrap:    { position: 'relative' },
  avatar:        { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center' },
  avatarTxt:     { fontSize: 24, fontWeight: '900' },
  statusDot:     { position: 'absolute', bottom: 2, right: 2, width: 16, height: 16, borderRadius: 8, borderWidth: 2.5, borderColor: DARK },
  heroInfo:      { flex: 1 },
  heroName:      { color: '#FFF', fontSize: 20, fontWeight: '800', marginBottom: 6 },
  rolePill:      { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 8 },
  rolePillAdmin: { backgroundColor: 'rgba(201,169,110,0.2)' },
  roleText:      { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
  roleTextAdmin: { color: ACCENT },
  heroEmail:     { color: 'rgba(255,255,255,0.45)', fontSize: 12, marginBottom: 4 },
  heroDate:      { color: 'rgba(255,255,255,0.3)', fontSize: 11 },

  statsStrip:    { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)', marginTop: 4 },
  statWrap:      { flex: 1, flexDirection: 'row' },
  stat:          { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statVal:       { color: '#FFF', fontSize: 12, fontWeight: '700', maxWidth: 80 },
  statLbl:       { color: 'rgba(255,255,255,0.35)', fontSize: 9, marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.6 },
  statDivider:   { width: 1, backgroundColor: 'rgba(255,255,255,0.07)' },

  heroBtns:      { flexDirection: 'row', gap: 10, padding: 16, paddingTop: 8 },
  btnWhite:      { flex: 1, backgroundColor: '#FFF', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  btnWhiteTxt:   { color: DARK, fontSize: 13, fontWeight: '700' },
  btnGhost:      { flex: 1, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  btnGhostTxt:   { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' },

  /* Cards */
  cards:         { padding: 16, gap: 12 },
  card:          { backgroundColor: '#FFF', borderRadius: 14, padding: 16, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  cardDanger:    { borderWidth: 1, borderColor: '#FEE2E2' },
  cardHead:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIcon:      { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cardIconEmoji: { fontSize: 18 },
  cardHeadText:  { flex: 1 },
  cardTitle:     { fontSize: 15, fontWeight: '700', color: DARK },
  cardSub:       { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
  editBtn:       { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  editBtnTxt:    { fontSize: 12, fontWeight: '600', color: DARK },
  divider:       { marginVertical: 14 },

  infoRow:       { marginBottom: 14 },
  infoLabel:     { fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4, fontWeight: '600' },
  infoValue:     { fontSize: 14, color: DARK, fontWeight: '500' },
  infoEmpty:     { fontSize: 14, color: '#D1D5DB', fontStyle: 'italic' },
  infoGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  infoGridItem:  { minWidth: 100 },

  emptyState:    { alignItems: 'center', paddingVertical: 12, gap: 8 },
  emptyTxt:      { color: '#9CA3AF', fontSize: 14 },
  addBtn:        { paddingVertical: 6 },
  addBtnTxt:     { color: ACCENT, fontSize: 14, fontWeight: '700' },

  secRow:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  secText:       { flex: 1 },
  secLabel:      { fontSize: 14, fontWeight: '600', color: DARK },
  secHint:       { fontSize: 12, color: '#9CA3AF', marginTop: 2 },

  dangerWarnBox: { backgroundColor: '#FEF2F2', borderRadius: 8, padding: 12, marginBottom: 14 },
  dangerWarnTxt: { fontSize: 13, color: '#6B7280', lineHeight: 20 },
  dangerWarnBold:{ fontWeight: '700', color: DARK },
  dangerBtn:     { backgroundColor: RED, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  dangerBtnTxt:  { color: '#FFF', fontSize: 14, fontWeight: '800', letterSpacing: 0.3 },
})
