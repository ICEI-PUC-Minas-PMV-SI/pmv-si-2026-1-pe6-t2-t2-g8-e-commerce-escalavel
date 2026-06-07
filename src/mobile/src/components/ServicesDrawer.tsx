import { useRouter, type Href } from 'expo-router'
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '@/src/contexts/AuthContext'

const ACCENT = '#C9A96E'
const DARK = '#0A0A0A'
const RED = '#EF4444'
const GREEN = '#22C55E'

type Props = { visible: boolean; onDismiss: () => void }

type MenuItem = {
  icon: string
  label: string
  href?: Href
  onPress?: () => void
}

export function ServicesDrawer({ visible, onDismiss }: Props) {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { user, logout } = useAuth()

  const go = (href: Href) => { onDismiss(); router.push(href) }
  const handleLogout = () => { onDismiss(); logout() }

  const initials = user?.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() ?? '?'
  const isAdmin  = user?.role === 'admin'

  const ACCOUNT_ITEMS: MenuItem[] = [
    { icon: '👤', label: 'Meu Perfil', href: '/profile' },
    { icon: '✏️', label: 'Editar Perfil', href: '/profile/edit' },
    { icon: '🔒', label: 'Alterar Senha', href: '/profile/password' },

    { icon: '🛒', label: 'Carrinho', href: '/order/cart/cart' },
    { icon: '📋', label: 'Meus Pedidos', href: '/order/purchasedOrders/purchasedOrders'},
  ]

  const CATALOG_ITEMS: MenuItem[] = [
    { icon: '🏷️', label: 'Categorias', href: '/catalog/categories' },
  ]

  const ADMIN_ITEMS: MenuItem[] = [
    { icon: '👥', label: 'Usuários', href: '/admin/users' },
    { icon: '📦', label: 'Estoque',  href: '/stock' },
  ]

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <View style={s.root}>
        {/* Painel lateral */}
        <View style={[s.panel, { paddingTop: insets.top + 16 }]}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

            {/* ── Cabeçalho ── */}
            <View style={s.header}>
              <Text style={s.headerLabel}>INSIDER</Text>
              <Pressable onPress={onDismiss} style={s.closeBtn}>
                <Text style={s.closeTxt}>✕</Text>
              </Pressable>
            </View>

            {/* ── User Card ── */}
            {user && (
              <View style={s.userCard}>
                <View style={[s.userAvatar, { backgroundColor: isAdmin ? '#1a0f00' : '#0f0f1a' }]}>
                  <Text style={[s.userAvatarTxt, { color: isAdmin ? ACCENT : '#90b8e0' }]}>{initials}</Text>
                </View>
                <View style={s.userInfo}>
                  <Text style={s.userName} numberOfLines={1}>{user.name}</Text>
                  <Text style={s.userEmail} numberOfLines={1}>{user.email}</Text>
                  <View style={[s.userRolePill, isAdmin && s.userRolePillAdmin]}>
                    <View style={[s.roleDot, { backgroundColor: user.active !== false ? GREEN : '#9CA3AF' }]} />
                    <Text style={[s.userRoleTxt, isAdmin && s.userRoleTxtAdmin]}>
                      {isAdmin ? '⚑  Administrador' : 'Cliente'}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* ── Seção Conta ── */}
            <View style={s.section}>
              <Text style={s.sectionLabel}>Minha Conta</Text>
              {ACCOUNT_ITEMS.map(item => (
                <Pressable
                  key={item.label}
                  style={({ pressed }) => [s.item, pressed && s.itemPressed]}
                  onPress={() => item.href && go(item.href)}
                >
                  <View style={s.itemIcon}>
                    <Text style={s.itemIconTxt}>{item.icon}</Text>
                  </View>
                  <Text style={s.itemLabel}>{item.label}</Text>
                  <Text style={s.itemArrow}>›</Text>
                </Pressable>
              ))}
            </View>

            {/* ── Seção Catálogo ── */}
            <View style={s.section}>
              <Text style={s.sectionLabel}>Catálogo</Text>
              {CATALOG_ITEMS.map(item => (
                <Pressable
                  key={item.label}
                  style={({ pressed }) => [s.item, pressed && s.itemPressed]}
                  onPress={() => item.href && go(item.href)}
                >
                  <View style={s.itemIcon}>
                    <Text style={s.itemIconTxt}>{item.icon}</Text>
                  </View>
                  <Text style={s.itemLabel}>{item.label}</Text>
                  <Text style={s.itemArrow}>›</Text>
                </Pressable>
              ))}
            </View>

            {/* ── Seção Admin ── */}
            {isAdmin && (
              <View style={s.section}>
                <Text style={s.sectionLabel}>Administração</Text>
                {ADMIN_ITEMS.map(item => (
                  <Pressable
                    key={item.label}
                    style={({ pressed }) => [s.item, pressed && s.itemPressed]}
                    onPress={() => item.href && go(item.href)}
                  >
                    <View style={[s.itemIcon, s.itemIconAdmin]}>
                      <Text style={s.itemIconTxt}>{item.icon}</Text>
                    </View>
                    <Text style={s.itemLabel}>{item.label}</Text>
                    <Text style={s.itemArrow}>›</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* ── Sair ── */}
            <View style={s.section}>
              <Pressable
                style={({ pressed }) => [s.item, s.itemLogout, pressed && s.itemLogoutPressed]}
                onPress={handleLogout}
              >
                <View style={[s.itemIcon, s.itemIconLogout]}>
                  <Text style={s.itemIconTxt}>🚪</Text>
                </View>
                <Text style={[s.itemLabel, s.itemLabelLogout]}>Sair da conta</Text>
              </Pressable>
            </View>

            <Text style={s.version}>INSIDER · v1.0.0</Text>

          </ScrollView>
        </View>

        {/* Backdrop — toca para fechar */}
        <Pressable style={s.backdrop} onPress={onDismiss} />
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  panel: { width: 260, flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 0 },
  scroll: { flexGrow: 1, paddingBottom: 32 },

  /* Header */
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerLabel: { fontSize: 11, letterSpacing: 4, fontWeight: '800', color: DARK },
  closeBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  closeTxt: { color: '#6B7280', fontSize: 13, fontWeight: '700' },

  /* User Card */
  userCard: { flexDirection: 'row', alignItems: 'center', gap: 12, margin: 16, padding: 14, backgroundColor: '#F8F9FA', borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  userAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  userAvatarTxt: { fontSize: 16, fontWeight: '900' },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { fontSize: 14, fontWeight: '700', color: DARK },
  userEmail: { fontSize: 11, color: '#9CA3AF', marginTop: 1, marginBottom: 5 },
  userRolePill: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  userRolePillAdmin: { backgroundColor: 'rgba(201,169,110,0.12)' },
  roleDot: { width: 6, height: 6, borderRadius: 3 },
  userRoleTxt: { fontSize: 10, fontWeight: '700', color: '#6B7280' },
  userRoleTxtAdmin: { color: ACCENT },

  /* Sections */
  section: { paddingHorizontal: 12, paddingTop: 6, paddingBottom: 4 },
  sectionLabel: { fontSize: 10, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1.5, marginLeft: 8, marginBottom: 4, marginTop: 8 },

  /* Items */
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 12, borderRadius: 10 },
  itemPressed: { backgroundColor: '#F8F9FA' },
  itemIcon: { width: 34, height: 34, borderRadius: 9, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  itemIconAdmin: { backgroundColor: 'rgba(201,169,110,0.1)' },
  itemIconLogout: { backgroundColor: 'rgba(239,68,68,0.08)' },
  itemIconTxt: { fontSize: 16 },
  itemLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: DARK },
  itemLabelLogout: { color: RED },
  itemArrow: { color: '#D1D5DB', fontSize: 18, fontWeight: '300' },
  itemLogout: { marginTop: 4 },
  itemLogoutPressed: { backgroundColor: '#FEF2F2' },

  /* Footer */
  version: { textAlign: 'center', fontSize: 11, color: '#D1D5DB', marginTop: 24, letterSpacing: 1 },
})
