import { useState } from 'react'
import { StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { Text, TextInput, Button, Snackbar } from 'react-native-paper'
import { useRouter, Redirect } from 'expo-router'
import { useAuth } from '@/src/contexts/AuthContext'
import { userService } from '@/src/services/userService'

const DARK = '#0A0A0A'

export default function ChangePasswordScreen() {
  const { user } = useAuth()
  const router   = useRouter()

  if (!user) return <Redirect href="/login" />

  const [next,    setNext]    = useState('')
  const [confirm, setConfirm] = useState('')
  const [showN,   setShowN]   = useState(false)
  const [showCf,  setShowCf]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [snack,   setSnack]   = useState('')
  const [snackOk, setSnackOk] = useState(false)

  const confirmErr = confirm.length > 0 && next !== confirm

  const handleSave = async () => {
    if (next.length < 8) { setSnack('A nova senha deve ter ao menos 8 caracteres.'); setSnackOk(false); return }
    if (next !== confirm) { setSnack('As senhas não coincidem.'); setSnackOk(false); return }

    setLoading(true)
    try {
      await userService.updatePassword(user.id, next)
      setSnack('Senha alterada com sucesso!')
      setSnackOk(true)
      setNext(''); setConfirm('')
    } catch (err: unknown) {
      setSnack(err instanceof Error ? err.message : 'Erro ao alterar senha.')
      setSnackOk(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={styles.cardIcon}><Text>🔒</Text></View>
            <View>
              <Text style={styles.cardTitle}>Alterar senha</Text>
              <Text style={styles.cardSub}>Crie uma senha forte e única</Text>
            </View>
          </View>

          <TextInput
            label="Nova senha"
            value={next}
            onChangeText={setNext}
            secureTextEntry={!showN}
            mode="outlined"
            style={styles.input}
            outlineColor="#E0E0E0"
            activeOutlineColor={DARK}
            left={<TextInput.Icon icon="lock-reset" />}
            right={<TextInput.Icon icon={showN ? 'eye-off' : 'eye'} onPress={() => setShowN(v => !v)} />}
          />
          <Text style={styles.hint}>Mínimo de 8 caracteres</Text>

          <TextInput
            label="Confirmar nova senha"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry={!showCf}
            mode="outlined"
            style={styles.input}
            outlineColor={confirmErr ? '#EF4444' : '#E0E0E0'}
            activeOutlineColor={confirmErr ? '#EF4444' : DARK}
            error={confirmErr}
            left={<TextInput.Icon icon="lock-check-outline" />}
            right={<TextInput.Icon icon={showCf ? 'eye-off' : 'eye'} onPress={() => setShowCf(v => !v)} />}
          />
          {confirmErr && <Text style={styles.fieldErr}>As senhas não coincidem</Text>}
        </View>

        <View style={styles.actions}>
          <Button mode="outlined" onPress={() => router.back()} style={styles.btnCancel}
            textColor="#666" contentStyle={styles.btnContent}>
            Cancelar
          </Button>
          <Button mode="contained" onPress={handleSave} loading={loading} disabled={loading || !!confirmErr}
            style={styles.btnSave} buttonColor={DARK} contentStyle={styles.btnContent}
            labelStyle={{ fontWeight: '700' }}>
            Salvar
          </Button>
        </View>

      </ScrollView>

      <Snackbar
        visible={!!snack}
        onDismiss={() => setSnack('')}
        duration={3000}
        style={{ backgroundColor: snackOk ? '#166534' : '#1A1A1A' }}
      >
        {snack}
      </Snackbar>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: '#F3F4F6' },
  content:    { padding: 16, paddingBottom: 40 },
  card:       { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, elevation: 1 },
  cardHead:   { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  cardIcon:   { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFFBEB', alignItems: 'center', justifyContent: 'center' },
  cardTitle:  { fontSize: 15, fontWeight: '700', color: DARK },
  cardSub:    { fontSize: 12, color: '#888', marginTop: 1 },
  input:      { marginBottom: 4, backgroundColor: '#FFFFFF' },
  hint:       { fontSize: 11, color: '#9CA3AF', marginBottom: 12, marginLeft: 4 },
  fieldErr:   { color: '#EF4444', fontSize: 12, marginBottom: 12, marginLeft: 4 },
  actions:    { flexDirection: 'row', gap: 12, marginTop: 16 },
  btnCancel:  { flex: 1, borderRadius: 8, borderColor: '#E0E0E0' },
  btnSave:    { flex: 1, borderRadius: 8 },
  btnContent: { height: 48 },
})
