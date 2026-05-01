// src/pages/RegisterPage.tsx
import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

type Step = 1 | 2

function passwordStrength(p: string): { level: 'weak' | 'medium' | 'strong'; label: string } {
  if (p.length < 8)  return { level: 'weak',   label: 'Fraca' }
  if (p.length < 12) return { level: 'medium',  label: 'Boa' }
  return               { level: 'strong', label: 'Forte' }
}

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [step, setStep]           = useState<Step>(1)
  const [exiting, setExiting]     = useState(false)
  const [direction, setDirection] = useState<'fwd' | 'back'>('fwd')
  const [showPass, setShowPass]   = useState(false)
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [success, setSuccess]     = useState(false)

  const [form, setForm] = useState({
    name: '', email: '', password: '', cpf: '', phone: '',
    street: '', city: '', state: '', zip: '',
  })

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const goStep = (next: Step, dir: 'fwd' | 'back') => {
    setDirection(dir)
    setExiting(true)
    setTimeout(() => {
      setStep(next)
      setExiting(false)
    }, 200)
  }

  const handleNext = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    goStep(2, 'fwd')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const address =
      form.street || form.city || form.state || form.zip
        ? { street: form.street, city: form.city, state: form.state, zip: form.zip }
        : undefined
    try {
      await register({
        name: form.name, email: form.email, password: form.password,
        cpf: form.cpf || undefined, phone: form.phone || undefined, address,
      })
      setSuccess(true)
      setTimeout(() => navigate('/perfil'), 800)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  const strength = form.password ? passwordStrength(form.password) : null

  if (success) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card auth-card-animate">
          <div className="auth-success">
            <div className="auth-success-icon">✓</div>
            <p className="auth-success-text">Conta criada com sucesso!</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card auth-card-lg auth-card-animate">

        <div className="auth-brand">INSIDER</div>

        {/* Indicador de etapas */}
        <div className="steps-bar">
          <div className="steps-track">
            <div className={`step-node${step >= 1 ? ' step-node-done' : ''}`}>1</div>
            <div className={`step-connector${step >= 2 ? ' step-connector-done' : ''}`} />
            <div className={`step-node${step >= 2 ? ' step-node-done' : ''}`}>2</div>
          </div>
          <div className="steps-labels">
            <span className={step === 1 ? 'step-lbl-active' : 'step-lbl'}>Dados pessoais</span>
            <span className={step === 2 ? 'step-lbl-active' : 'step-lbl'}>Endereço</span>
          </div>
        </div>

        {error && (
          <div className="alert alert-error alert-animate">
            <span className="alert-icon">✕</span>
            {error}
          </div>
        )}

        {/* Etapa 1 */}
        {step === 1 && (
          <div className={`step-content${exiting ? (direction === 'fwd' ? ' step-exit-fwd' : ' step-exit-back') : ' step-enter'}`}>
            <form onSubmit={handleNext} className="form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nome completo *</label>
                  <input type="text" className="form-input" placeholder="Seu nome"
                    value={form.name} onChange={set('name')} required autoFocus />
                </div>
                <div className="form-group">
                  <label className="form-label">E-mail *</label>
                  <input type="email" className="form-input" placeholder="seu@email.com"
                    value={form.email} onChange={set('email')} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Senha *</label>
                <div className="input-wrapper">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-input input-with-icon"
                    placeholder="Mínimo 8 caracteres"
                    value={form.password}
                    onChange={set('password')}
                    required
                    minLength={8}
                  />
                  <button type="button" className="input-eye-btn"
                    onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                    {showPass ? 'Ocultar' : 'Ver'}
                  </button>
                </div>
                {strength && (
                  <div className="pwd-strength">
                    <div className="pwd-bars">
                      <div className={`pwd-bar pwd-bar-1 pwd-${strength.level}`} />
                      <div className={`pwd-bar pwd-bar-2 pwd-${strength.level !== 'weak' ? strength.level : ''}`} />
                      <div className={`pwd-bar pwd-bar-3 pwd-${strength.level === 'strong' ? 'strong' : ''}`} />
                    </div>
                    <span className={`pwd-label pwd-label-${strength.level}`}>{strength.label}</span>
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">CPF</label>
                  <input type="text" className="form-input" placeholder="000.000.000-00"
                    value={form.cpf} onChange={set('cpf')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Telefone</label>
                  <input type="text" className="form-input" placeholder="(00) 00000-0000"
                    value={form.phone} onChange={set('phone')} />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full">
                Continuar →
              </button>
            </form>
          </div>
        )}

        {/* Etapa 2 */}
        {step === 2 && (
          <div className={`step-content${exiting ? (direction === 'fwd' ? ' step-exit-fwd' : ' step-exit-back') : ' step-enter'}`}>
            <form onSubmit={handleSubmit} className="form">
              <p className="step-hint">Endereço é opcional — você pode pular esta etapa.</p>

              <div className="form-row">
                <div className="form-group form-group-lg">
                  <label className="form-label">Rua</label>
                  <input type="text" className="form-input" placeholder="Rua das Flores, 123"
                    value={form.street} onChange={set('street')} />
                </div>
                <div className="form-group">
                  <label className="form-label">CEP</label>
                  <input type="text" className="form-input" placeholder="00000-000"
                    value={form.zip} onChange={set('zip')} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group form-group-lg">
                  <label className="form-label">Cidade</label>
                  <input type="text" className="form-input" placeholder="Belo Horizonte"
                    value={form.city} onChange={set('city')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <input type="text" className="form-input" placeholder="MG" maxLength={2}
                    value={form.state} onChange={set('state')} />
                </div>
              </div>

              <div className="step-actions">
                <button type="button" className="btn btn-outline"
                  onClick={() => goStep(1, 'back')}>
                  ← Voltar
                </button>
                <button type="submit" className="btn btn-primary step-btn-submit"
                  disabled={loading}>
                  {loading
                    ? <><span className="btn-spinner" /> Criando conta...</>
                    : 'Criar conta'}
                </button>
              </div>
            </form>
          </div>
        )}

        <p className="auth-footer">
          Já tem conta?{' '}
          <Link to="/login" className="link">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
