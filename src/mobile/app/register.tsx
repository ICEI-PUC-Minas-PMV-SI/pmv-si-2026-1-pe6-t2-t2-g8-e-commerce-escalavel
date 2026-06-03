import { useState } from 'react'
import {
  StyleSheet, View, KeyboardAvoidingView, Platform,
  ScrollView, Pressable, TextInput as RNInput,
} from 'react-native'
import { Text, Button, Snackbar } from 'react-native-paper'
import { useRouter, Redirect } from 'expo-router'
import { useAuth } from '@/src/contexts/AuthContext'
import { userService } from '@/src/services/userService'

const ACCENT = '#C9A96E'
const DARK   = '#0A0A0A'

/* ── Máscaras ── */
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

/* ── Força da senha ── */
function passStrength(p: string) {
  if (!p) return 0
  let s = 0
  if (p.length >= 8) s++
  if (/[0-9]/.test(p)) s++
  if (/[^a-zA-Z0-9]/.test(p)) s++
  return s
}
const STRENGTH_COLOR = ['#EF4444', '#F59E0B', '#22C55E']
const STRENGTH_LABEL = ['Fraca', 'Média', 'Forte']

/* ── Campo customizado ── */
function Field({
  label, value, onChangeText, placeholder, secureTextEntry,
  keyboardType, autoCapitalize, required, error, showToggle,
  onToggle, optional,
}: {
  label: string; value: string; onChangeText: (v: string) => void
  placeholder?: string; secureTextEntry?: boolean; keyboardType?: any
  autoCapitalize?: any; required?: boolean; error?: string
  showToggle?: boolean; onToggle?: () => void; optional?: boolean
}) {
  return (
    <View style={f.wrap}>
      <View style={f.labelRow}>
        <Text style={f.label}>{label}</Text>
        {optional && <Text style={f.opt}>opcional</Text>}
      </View>
      <View style={[f.box, !!error && f.boxErr]}>
        <RNInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#C4C4C4"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? 'none'}
          autoComplete="off"
          style={f.input}
        />
        {showToggle && (
          <Pressable onPress={onToggle} style={f.eyeBtn}>
            <Text style={f.eyeIco}>{secureTextEntry ? '👁' : '🙈'}</Text>
          </Pressable>
        )}
      </View>
      {!!error && <Text style={f.err}>{error}</Text>}
    </View>
  )
}

const f = StyleSheet.create({
  wrap:     { gap: 6 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label:    { fontSize: 13, fontWeight: '700', color: '#374151' },
  opt:      { fontSize: 11, color: '#9CA3AF', backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  box:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 14, height: 52 },
  boxErr:   { borderColor: '#EF4444', backgroundColor: '#FFF5F5' },
  input:    { flex: 1, fontSize: 15, color: '#111', height: 52, outlineStyle: 'none' } as any,
  eyeBtn:   { padding: 6 },
  eyeIco:   { fontSize: 16 },
  err:      { fontSize: 12, color: '#EF4444', marginLeft: 4 },
})

export default function RegisterScreen() {
  const { register, isAuthenticated } = useAuth()
  const router = useRouter()

  const [step, setStep] = useState<1|2>(1)

  /* Passo 1 */
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  /* Passo 2 */
  const [cpf,   setCpf]   = useState('')
  const [phone, setPhone] = useState('')

  /* Estado */
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')
  const [snack,      setSnack]      = useState(false)
  const [emailError, setEmailError] = useState('')
  const [nameError,  setNameError]  = useState('')
  const [passError,  setPassError]  = useState('')
  const [emailInUse, setEmailInUse] = useState(false)

  if (isAuthenticated) return <Redirect href="/" />

  const strength = passStrength(password)

  const validateStep1 = () => {
    if (name.trim().length < 3)              { setError('Nome deve ter ao menos 3 caracteres.'); setSnack(true); return false }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('E-mail inválido.'); setSnack(true); return false }
    if (password.length < 8)                { setError('Senha deve ter ao menos 8 caracteres.'); setSnack(true); return false }
    return true
  }

  const handleRegister = async () => {
    setLoading(true); setError(''); setEmailInUse(false)
    try {
      await register(name, email, password, cpf || undefined, phone || undefined)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar conta.'
      const isEmailConflict = /e-?mail|já cadastrado|already|conflict|duplicate|exist/i.test(msg)
      if (isEmailConflict) {
        setEmailInUse(true)
        setStep(1)
        setError('Este e-mail já está cadastrado.')
      } else {
        setError(msg)
      }
      setSnack(true)
    } finally { setLoading(false) }
  }

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      {/* ── Hero ── */}
      <View style={s.hero}>
        {/* Grade decorativa */}
        <View style={s.heroDecor} pointerEvents="none">
          {Array.from({ length: 5 }).map((_, i) => <View key={i} style={s.decorLine} />)}
        </View>

        <View style={s.heroContent}>
          <Text style={s.brand}>INSIDER</Text>
          <Text style={s.heroTitle}>Crie sua{'\n'}conta.</Text>
          <View style={s.accentLine} />

          {/* Indicador de passo */}
          <View style={s.stepRow}>
            <View style={[s.stepNode, s.stepDone]}>
              <Text style={s.stepNodeTxt}>{step > 1 ? '✓' : '1'}</Text>
            </View>
            <View style={[s.stepConnector, step > 1 && s.stepConnectorDone]} />
            <View style={[s.stepNode, step === 2 && s.stepDone, step < 2 && s.stepPending]}>
              <Text style={[s.stepNodeTxt, step < 2 && s.stepNodeTxtPending]}>2</Text>
            </View>
            <Text style={s.stepLabel}>Passo {step} de 2</Text>
          </View>
        </View>
      </View>

      {/* ── Formulário ── */}
      <ScrollView
        style={s.formScroll}
        contentContainerStyle={s.formInner}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step === 1 ? (
          <>
            <View style={s.formHeader}>
              <Text style={s.formEyebrow}>Passo 1 de 2</Text>
              <Text style={s.formTitle}>Dados de acesso</Text>
              <Text style={s.formSub}>Informações para entrar na sua conta</Text>
            </View>

            <View style={s.fields}>
              <Field label="Nome completo" value={name} onChangeText={setName}
                placeholder="Seu nome completo" autoCapitalize="words" />

              <Field label="E-mail" value={email} onChangeText={v => { setEmail(v); setEmailInUse(false) }}
                placeholder="seu@email.com" keyboardType="email-address"
                error={emailInUse ? 'Este e-mail já está cadastrado' : undefined} />

              <View style={f.wrap}>
                <Text style={f.label}>Senha</Text>
                <View style={f.box}>
                  <RNInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Mínimo 8 caracteres"
                    placeholderTextColor="#C4C4C4"
                    secureTextEntry={!showPass}
                    autoComplete="off"
                    style={f.input}
                  />
                  <Pressable onPress={() => setShowPass(v => !v)} style={f.eyeBtn}>
                    <Text style={f.eyeIco}>{showPass ? '🙈' : '👁'}</Text>
                  </Pressable>
                </View>

                {/* Barra de força */}
                {password.length > 0 && (
                  <View style={s.strengthWrap}>
                    <View style={s.strengthBars}>
                      {[0,1,2].map(i => (
                        <View key={i} style={[s.strengthBar,
                          { backgroundColor: i < strength ? STRENGTH_COLOR[strength-1] : '#E5E7EB' }
                        ]} />
                      ))}
                    </View>
                    <Text style={[s.strengthTxt, { color: strength > 0 ? STRENGTH_COLOR[strength-1] : '#9CA3AF' }]}>
                      {strength > 0 ? STRENGTH_LABEL[strength-1] : 'Muito fraca'}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <Button
              mode="contained"
              loading={loading}
              disabled={loading || emailInUse}
              onPress={async () => {
                if (!validateStep1()) return
                setLoading(true)
                try {
                  const available = await userService.checkEmailAvailable(email)
                  if (!available) {
                    setEmailInUse(true)
                    setError('Este e-mail já está cadastrado.')
                    setSnack(true)
                  } else {
                    setStep(2)
                  }
                } catch {
                  // se falhar a checagem, deixa avançar (backend vai barrar no registro)
                  setStep(2)
                } finally {
                  setLoading(false)
                }
              }}
              style={s.btnPrimary} contentStyle={s.btnContent} buttonColor={DARK} labelStyle={s.btnLabel}>
              Continuar →
            </Button>

            <Pressable onPress={() => router.back()} style={s.linkBtn}>
              <Text style={s.linkTxt}>Já tenho uma conta</Text>
            </Pressable>
          </>
        ) : (
          <>
            <View style={s.formHeader}>
              <Text style={s.formEyebrow}>Passo 2 de 2</Text>
              <Text style={s.formTitle}>Dados pessoais</Text>
              <Text style={s.formSub}>Campos opcionais — pode pular se preferir</Text>
            </View>

            <View style={s.fields}>
              <Field label="CPF" value={cpf} onChangeText={v => setCpf(maskCPF(v))}
                placeholder="000.000.000-00" keyboardType="numeric" optional />

              <Field label="Telefone" value={phone} onChangeText={v => setPhone(maskPhone(v))}
                placeholder="(00) 00000-0000" keyboardType="phone-pad" optional />
            </View>

            {/* Resumo */}
            <View style={s.summaryBox}>
              <Text style={s.summaryTitle}>Resumo da conta</Text>
              <View style={s.summaryRow}>
                <Text style={s.summaryLbl}>Nome</Text>
                <Text style={s.summaryVal}>{name}</Text>
              </View>
              <View style={s.summaryRow}>
                <Text style={s.summaryLbl}>E-mail</Text>
                <Text style={s.summaryVal}>{email}</Text>
              </View>
            </View>

            <Button mode="contained" onPress={handleRegister} loading={loading} disabled={loading}
              style={s.btnPrimary} contentStyle={s.btnContent} buttonColor={DARK} labelStyle={s.btnLabel}>
              {loading ? 'Criando conta...' : 'Criar conta'}
            </Button>

            <Pressable onPress={() => setStep(1)} style={s.linkBtn}>
              <Text style={s.linkTxt}>← Voltar</Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      <Snackbar visible={snack} onDismiss={() => setSnack(false)} duration={3500}
        style={{ backgroundColor: '#1A1A1A', borderRadius: 10 }}
        action={{ label: '✕', onPress: () => setSnack(false) }}>
        {error}
      </Snackbar>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  root:           { flex: 1, backgroundColor: '#F8F9FA' },

  /* Hero */
  hero:           { backgroundColor: DARK, overflow: 'hidden' },
  heroDecor:      { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'space-evenly', opacity: 0.04 },
  decorLine:      { height: 1, backgroundColor: '#FFF' },
  heroContent:    { padding: 28, paddingTop: 48, paddingBottom: 32 },
  brand:          { color: ACCENT, fontSize: 11, letterSpacing: 5, fontWeight: '800', marginBottom: 16 },
  heroTitle:      { color: '#FFF', fontSize: 36, fontWeight: '900', lineHeight: 42, letterSpacing: -0.5 },
  accentLine:     { width: 40, height: 2, backgroundColor: ACCENT, marginTop: 16, marginBottom: 20 },

  /* Step indicator */
  stepRow:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepNode:       { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stepDone:       { backgroundColor: ACCENT },
  stepPending:    { backgroundColor: 'rgba(255,255,255,0.15)' },
  stepNodeTxt:    { color: DARK, fontSize: 12, fontWeight: '800' },
  stepNodeTxtPending: { color: 'rgba(255,255,255,0.5)' },
  stepConnector:  { width: 32, height: 2, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2 },
  stepConnectorDone: { backgroundColor: ACCENT },
  stepLabel:      { color: 'rgba(255,255,255,0.45)', fontSize: 12, marginLeft: 8 },

  /* Form */
  formScroll:     { flex: 1 },
  formInner:      { padding: 24, paddingBottom: 48 },
  formHeader:     { marginBottom: 24 },
  formEyebrow:    { fontSize: 11, letterSpacing: 3, color: ACCENT, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 },
  formTitle:      { fontSize: 24, fontWeight: '900', color: DARK, letterSpacing: -0.3 },
  formSub:        { fontSize: 13, color: '#9CA3AF', marginTop: 4 },
  fields:         { gap: 16, marginBottom: 8 },

  /* Strength */
  strengthWrap:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  strengthBars:   { flexDirection: 'row', gap: 4, flex: 1 },
  strengthBar:    { flex: 1, height: 4, borderRadius: 2 },
  strengthTxt:    { fontSize: 12, fontWeight: '700', minWidth: 50 },

  /* Summary */
  summaryBox:     { backgroundColor: '#F8F9FA', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 20, gap: 8 },
  summaryTitle:   { fontSize: 12, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  summaryRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLbl:     { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  summaryVal:     { fontSize: 13, color: DARK, fontWeight: '700', maxWidth: '60%' },

  /* Buttons */
  btnPrimary:     { borderRadius: 10, marginTop: 8, elevation: 0 },
  btnContent:     { height: 54 },
  btnLabel:       { fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
  linkBtn:        { alignItems: 'center', paddingVertical: 16 },
  linkTxt:        { color: '#9CA3AF', fontSize: 14, fontWeight: '600' },
})
