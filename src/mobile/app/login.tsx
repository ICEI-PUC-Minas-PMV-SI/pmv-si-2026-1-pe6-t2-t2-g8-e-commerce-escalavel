import { useState } from 'react'
import {
  StyleSheet, View, KeyboardAvoidingView, Platform,
  ScrollView, Dimensions, TouchableOpacity, StatusBar,
  TextInput as RNInput, Pressable, ActivityIndicator,
} from 'react-native'
import { Text, Snackbar } from 'react-native-paper'
import { useRouter, Redirect } from 'expo-router'
import { useAuth } from '@/src/contexts/AuthContext'

const ACCENT = '#C9A96E'
const DARK   = '#0A0A0A'
const { width } = Dimensions.get('window')
const IS_WIDE   = width >= 700

const SLIDES = [
  { tag: 'SS 2026',  headline: 'Nova\nColeção',     sub: 'Tendências exclusivas para o seu estilo',      accent: '#C9A96E' },
  { tag: 'Premium',  headline: 'Estilo\nque Define', sub: 'Peças selecionadas para quem exige o melhor',  accent: '#C9A96E' },
  { tag: 'Limited',  headline: 'Exclusi\nvidade',    sub: 'Cada detalhe pensado com precisão absoluta',   accent: '#90b8e0' },
]

function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

export default function LoginScreen() {
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()

  const [slide, setSlide]               = useState(0)
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPass, setShowPass]         = useState(false)
  const [emailBlurred, setEmailBlurred] = useState(false)
  const [passBlurred, setPassBlurred]   = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const [snack, setSnack]               = useState(false)

  if (isAuthenticated) return <Redirect href="/" />

  const cur      = SLIDES[slide]
  const emailErr = emailBlurred && !validateEmail(email)
  const passErr  = passBlurred  && password.length < 1

  const handleLogin = async () => {
    setEmailBlurred(true); setPassBlurred(true)
    if (!validateEmail(email) || !password) return
    setLoading(true); setError('')
    try {
      await login(email, password)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'E-mail ou senha incorretos.')
      setSnack(true)
    } finally { setLoading(false) }
  }

  /* ── Hero JSX ── */
  const heroJSX = (
    <View style={IS_WIDE ? s.heroWide : s.heroMobile}>
      <View style={s.grid} pointerEvents="none">
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} style={s.gridLine} />
        ))}
      </View>
      <View style={s.heroContent}>
        <Text style={[s.brand, { color: cur.accent }]}>OUTSIDER</Text>
        <View style={s.slideNum}>
          <Text style={s.slideNumCur}>0{slide + 1}</Text>
          <Text style={s.slideNumSep}>/</Text>
          <Text style={s.slideNumTot}>0{SLIDES.length}</Text>
        </View>
        <Text style={IS_WIDE ? s.headlineWide : s.headlineMobile}>
          {cur.headline}
        </Text>
        <View style={[s.accentLine, { backgroundColor: cur.accent }]} />
        <Text style={s.heroSub}>{cur.sub}</Text>
        <View style={[s.tagPill, { borderColor: cur.accent }]}>
          <Text style={[s.tagTxt, { color: cur.accent }]}>— {cur.tag}</Text>
        </View>
        <View style={s.dots}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => setSlide(i)}>
              <View style={[
                s.dot,
                i === slide
                  ? { backgroundColor: cur.accent, width: 28 }
                  : { backgroundColor: 'rgba(255,255,255,0.2)', width: 8 }
              ]} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  )

  /* ── Form JSX ── */
  const formJSX = (
    <ScrollView
      style={IS_WIDE ? s.formWide : s.formMobile}
      contentContainerStyle={s.formInner}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={s.formHeader}>
        <Text style={s.formEyebrow}>Bem-vindo de volta</Text>
        <Text style={s.formTitle}>Entrar</Text>
        <Text style={s.formSub}>Acesse sua conta OUTSIDER</Text>
      </View>

      <View style={s.fields}>
        <View style={s.inputWrap}>
          <Text style={s.inputLabel}>E-mail</Text>
          <View style={[s.inputBox, emailErr && s.inputBoxErr]}>
            <Text style={s.inputIcon}>✉</Text>
            <RNInput
              value={email}
              onChangeText={v => { setEmail(v); setError('') }}
              onBlur={() => setEmailBlurred(true)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="off"
              placeholder="seu@email.com"
              placeholderTextColor="#C4C4C4"
              style={s.inputField}
            />
          </View>
          {emailErr && <Text style={s.fieldErr}>E-mail inválido</Text>}
        </View>

        <View style={s.inputWrap}>
          <Text style={s.inputLabel}>Senha</Text>
          <View style={[s.inputBox, passErr && s.inputBoxErr]}>
            <Text style={s.inputIcon}>🔒</Text>
            <RNInput
              value={password}
              onChangeText={v => { setPassword(v); setError('') }}
              onBlur={() => setPassBlurred(true)}
              secureTextEntry={!showPass}
              autoComplete="off"
              placeholder="••••••••"
              placeholderTextColor="#C4C4C4"
              style={s.inputField}
            />
            <Pressable onPress={() => setShowPass(v => !v)} style={s.eyeBtn}>
              <Text style={s.eyeIcon}>{showPass ? '🙈' : '👁'}</Text>
            </Pressable>
          </View>
          {passErr && <Text style={s.fieldErr}>Informe a senha</Text>}
        </View>
      </View>

      {error ? (
        <View style={s.errorBox}>
          <Text style={s.errorTxt}>✕  {error}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        style={[s.btnPrimary, loading && { opacity: 0.7 }]}
        activeOpacity={0.8}
      >
        {loading
          ? <ActivityIndicator color="#FFF" size="small" />
          : <Text style={s.btnLabel}>Entrar</Text>}
      </TouchableOpacity>

      <View style={s.divRow}>
        <View style={s.divLine} />
        <Text style={s.divTxt}>ou</Text>
        <View style={s.divLine} />
      </View>

      <TouchableOpacity
        onPress={() => router.push('/register')}
        style={s.btnOutline}
        activeOpacity={0.8}
      >
        <Text style={s.btnLabelDark}>Criar conta</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.replace('/')}
        style={s.btnGhost}
        activeOpacity={0.7}
      >
        <Text style={s.btnLabelGhost}>← Continuar para a loja</Text>
      </TouchableOpacity>

      <Text style={s.footerTxt}>
        Ao entrar, você concorda com nossos{' '}
        <Text style={s.footerLink}>Termos de Uso</Text>
      </Text>
    </ScrollView>
  )

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" />
      {IS_WIDE ? (
        <View style={s.wide}>
          {heroJSX}
          {formJSX}
        </View>
      ) : (
        <>
          {heroJSX}
          {formJSX}
        </>
      )}

      <Snackbar
        visible={snack}
        onDismiss={() => setSnack(false)}
        duration={3500}
        style={s.snack}
        action={{ label: '✕', onPress: () => setSnack(false) }}
      >
        {error}
      </Snackbar>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: '#F8F9FA' },
  wide:          { flex: 1, flexDirection: 'row' },

  heroWide:      { width: '44%', backgroundColor: DARK, overflow: 'hidden', position: 'relative' },
  heroMobile:    { backgroundColor: DARK, paddingTop: 56, paddingBottom: 36, overflow: 'hidden', position: 'relative' },

  grid:          { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'column', justifyContent: 'space-evenly', opacity: 0.06 },
  gridLine:      { height: 1, backgroundColor: '#FFFFFF', width: '100%' },

  heroContent:   { flex: 1, justifyContent: 'flex-end', padding: 36, paddingBottom: 48 },
  brand:         { fontSize: 11, letterSpacing: 5, fontWeight: '800', marginBottom: 'auto' as any, paddingTop: 20 },

  slideNum:      { flexDirection: 'row', alignItems: 'baseline', marginBottom: 20, marginTop: 40 },
  slideNumCur:   { color: '#FFF', fontSize: 28, fontWeight: '800' },
  slideNumSep:   { color: 'rgba(255,255,255,0.3)', fontSize: 16, marginHorizontal: 4 },
  slideNumTot:   { color: 'rgba(255,255,255,0.3)', fontSize: 14 },

  headlineWide:  { color: '#FFFFFF', fontSize: 52, fontWeight: '900', lineHeight: 58, letterSpacing: -1 },
  headlineMobile:{ color: '#FFFFFF', fontSize: 40, fontWeight: '900', lineHeight: 46, letterSpacing: -1, paddingHorizontal: 4 },

  accentLine:    { width: 40, height: 2, marginTop: 20, marginBottom: 16 },
  heroSub:       { color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 22, marginBottom: 24 },

  tagPill:       { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 28 },
  tagTxt:        { fontSize: 12, fontWeight: '600', letterSpacing: 1 },

  dots:          { flexDirection: 'row', gap: 8, alignItems: 'center' },
  dot:           { height: 4, borderRadius: 2 },

  formWide:      { flex: 1, backgroundColor: '#F8F9FA' },
  formMobile:    { flex: 1, backgroundColor: '#F8F9FA' },
  formInner:     { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 36, paddingVertical: 48 },

  formHeader:    { marginBottom: 32 },
  formEyebrow:   { fontSize: 11, letterSpacing: 3, color: ACCENT, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 },
  formTitle:     { fontSize: 36, fontWeight: '900', color: DARK, letterSpacing: -0.5 },
  formSub:       { fontSize: 14, color: '#9CA3AF', marginTop: 6 },

  fields:        { gap: 16, marginBottom: 8 },
  inputWrap:     { gap: 6 },
  inputLabel:    { fontSize: 13, fontWeight: '600', color: '#374151', marginLeft: 2 },
  inputBox:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 14, height: 52 },
  inputBoxErr:   { borderColor: '#EF4444', backgroundColor: '#FFF5F5' },
  inputIcon:     { fontSize: 16, marginRight: 10, opacity: 0.5 },
  inputField:    { flex: 1, fontSize: 15, color: DARK, height: 52, outlineStyle: 'none' } as any,
  eyeBtn:        { padding: 6 },
  eyeIcon:       { fontSize: 16 },
  fieldErr:      { color: '#EF4444', fontSize: 12, marginLeft: 4 },

  btnPrimary:    { borderRadius: 10, marginTop: 24, backgroundColor: DARK, height: 54, alignItems: 'center', justifyContent: 'center' },
  btnOutline:    { borderRadius: 10, borderColor: '#D1D5DB', borderWidth: 1.5, height: 54, alignItems: 'center', justifyContent: 'center' },
  btnLabel:      { fontSize: 15, fontWeight: '800', letterSpacing: 0.5, color: '#FFF' },
  btnLabelDark:  { fontSize: 15, fontWeight: '800', letterSpacing: 0.5, color: DARK },
  btnGhost:      { height: 48, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  btnLabelGhost: { fontSize: 14, fontWeight: '700', letterSpacing: 0.3, color: '#6B7280' },

  divRow:        { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  divLine:       { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  divTxt:        { color: '#9CA3AF', marginHorizontal: 14, fontSize: 13 },

  footerTxt:     { textAlign: 'center', color: '#9CA3AF', fontSize: 12, marginTop: 24, lineHeight: 18 },
  footerLink:    { color: DARK, fontWeight: '600', textDecorationLine: 'underline' },

  snack:         { backgroundColor: '#1A1A1A', borderRadius: 10 },
  errorBox:      { backgroundColor: '#FEF2F2', borderRadius: 8, padding: 12, marginTop: 12, borderWidth: 1, borderColor: '#FECACA' },
  errorTxt:      { color: '#DC2626', fontSize: 13, fontWeight: '600' },
})
