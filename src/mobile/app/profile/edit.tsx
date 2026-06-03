import { useState } from 'react'
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { Text, TextInput, Button, Snackbar } from 'react-native-paper'
import { useRouter, Redirect } from 'expo-router'
import { useAuth } from '@/src/contexts/AuthContext'
import { userService } from '@/src/services/userService'

const ACCENT = '#C9A96E'
const DARK   = '#0A0A0A'

function maskCPF(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`
}
function maskPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
}
function maskZip(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 8)
  if (d.length <= 5) return d
  return `${d.slice(0,5)}-${d.slice(5)}`
}

export default function EditProfileScreen() {
  const { user, setUser } = useAuth()
  const router = useRouter()

  if (!user) return <Redirect href="/login" />

  const [name,   setName]   = useState(user.name)
  const [email,  setEmail]  = useState(user.email)
  const [cpf,    setCpf]    = useState(maskCPF(user.cpf ?? ''))
  const [phone,  setPhone]  = useState(maskPhone(user.phone ?? ''))
  const [street, setStreet] = useState(user.address?.street ?? '')
  const [city,   setCity]   = useState(user.address?.city ?? '')
  const [state,  setState]  = useState(user.address?.state ?? '')
  const [zip,    setZip]    = useState(maskZip(user.address?.zip ?? ''))

  const [loading, setLoading] = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [snack,   setSnack]   = useState('')
  const [snackVisible, setSnackVisible] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      const updated = await userService.update(user.id, {
        name, email,
        cpf:   cpf   || undefined,
        phone: phone || undefined,
        address: { street: street || undefined, city: city || undefined, state: state || undefined, zip: zip || undefined },
      })
      setUser(updated)
      setSaved(true)
      setSnack('Perfil atualizado com sucesso!')
      setSnackVisible(true)
      setTimeout(() => router.back(), 1600)
    } catch (err: unknown) {
      setSnack(err instanceof Error ? err.message : 'Erro ao atualizar perfil.')
      setSnackVisible(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Seção Dados Pessoais */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <View style={[styles.sectionIcon, { backgroundColor: '#EFF6FF' }]}><Text>👤</Text></View>
            <View>
              <Text style={styles.sectionTitle}>Dados pessoais</Text>
              <Text style={styles.sectionSub}>Nome, e-mail e contato</Text>
            </View>
          </View>

          <TextInput label="Nome completo" value={name} onChangeText={setName}
            mode="outlined" style={styles.input} outlineColor="#E0E0E0" activeOutlineColor={DARK}
            left={<TextInput.Icon icon="account-outline" />} />

          <TextInput label="E-mail" value={email} onChangeText={setEmail}
            keyboardType="email-address" autoCapitalize="none"
            mode="outlined" style={styles.input} outlineColor="#E0E0E0" activeOutlineColor={DARK}
            left={<TextInput.Icon icon="email-outline" />} />

          <TextInput label="CPF (opcional)" value={cpf} onChangeText={v => setCpf(maskCPF(v))}
            keyboardType="numeric" placeholder="000.000.000-00"
            mode="outlined" style={styles.input} outlineColor="#E0E0E0" activeOutlineColor={DARK}
            left={<TextInput.Icon icon="card-account-details-outline" />} />

          <TextInput label="Telefone (opcional)" value={phone} onChangeText={v => setPhone(maskPhone(v))}
            keyboardType="phone-pad" placeholder="(00) 00000-0000"
            mode="outlined" style={styles.input} outlineColor="#E0E0E0" activeOutlineColor={DARK}
            left={<TextInput.Icon icon="phone-outline" />} />
        </View>

        {/* Seção Endereço */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <View style={[styles.sectionIcon, { backgroundColor: '#F0FDF4' }]}><Text>📍</Text></View>
            <View>
              <Text style={styles.sectionTitle}>Endereço</Text>
              <Text style={styles.sectionSub}>Endereço para entrega — opcional</Text>
            </View>
          </View>

          <TextInput label="Rua / Logradouro" value={street} onChangeText={setStreet}
            placeholder="Rua das Flores, 123"
            mode="outlined" style={styles.input} outlineColor="#E0E0E0" activeOutlineColor={DARK}
            left={<TextInput.Icon icon="map-marker-outline" />} />

          <TextInput label="CEP" value={zip} onChangeText={v => setZip(maskZip(v))}
            keyboardType="numeric" placeholder="00000-000"
            mode="outlined" style={styles.input} outlineColor="#E0E0E0" activeOutlineColor={DARK}
            left={<TextInput.Icon icon="mailbox-outline" />} />

          <TextInput label="Cidade" value={city} onChangeText={setCity}
            placeholder="Belo Horizonte"
            mode="outlined" style={styles.input} outlineColor="#E0E0E0" activeOutlineColor={DARK}
            left={<TextInput.Icon icon="city-outline" />} />

          <TextInput label="UF" value={state} onChangeText={v => setState(v.toUpperCase().slice(0,2))}
            placeholder="MG" autoCapitalize="characters"
            mode="outlined" style={styles.input} outlineColor="#E0E0E0" activeOutlineColor={DARK}
            left={<TextInput.Icon icon="flag-outline" />} />
        </View>

        {/* Ações */}
        <View style={styles.actions}>
          <Button mode="outlined" onPress={() => router.back()} style={styles.btnCancel}
            textColor="#666" contentStyle={styles.btnContent}>
            Cancelar
          </Button>
          <Button mode="contained" onPress={handleSave} loading={loading} disabled={loading}
            style={styles.btnSave} buttonColor={saved ? '#22C55E' : DARK} contentStyle={styles.btnContent}
            icon={saved ? 'check' : undefined} labelStyle={{ fontWeight: '700' }}>
            {saved ? 'Salvo!' : 'Salvar'}
          </Button>
        </View>

      </ScrollView>

      <Snackbar visible={snackVisible} onDismiss={() => setSnackVisible(false)} duration={3000}
        style={{ backgroundColor: saved ? '#166534' : '#1A1A1A' }}>
        {snack}
      </Snackbar>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root:         { flex: 1, backgroundColor: '#F3F4F6' },
  content:      { padding: 16, paddingBottom: 40 },
  section:      { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 1 },
  sectionHead:  { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  sectionIcon:  { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: DARK },
  sectionSub:   { fontSize: 12, color: '#888', marginTop: 1 },
  input:        { marginBottom: 12, backgroundColor: '#FFFFFF' },
  actions:      { flexDirection: 'row', gap: 12, marginTop: 4 },
  btnCancel:    { flex: 1, borderRadius: 8, borderColor: '#E0E0E0' },
  btnSave:      { flex: 1, borderRadius: 8 },
  btnContent:   { height: 48 },
})
