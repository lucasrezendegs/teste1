import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://whgidbsuxbtlxowdcdvx.supabase.co'
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
const supabase = SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null

const initialForm = { fullName: '', email: '', password: '', confirmPassword: '' }

function App() {
  const [mode, setMode] = useState('signup')
  const [form, setForm] = useState(initialForm)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(supabase))
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (!supabase) return undefined

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const passwordScore = useMemo(() => {
    const value = form.password
    let score = 0
    if (value.length >= 8) score += 1
    if (/[A-Z]/.test(value)) score += 1
    if (/\d/.test(value)) score += 1
    if (/[^A-Za-z0-9]/.test(value)) score += 1
    return score
  }, [form.password])

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    setMessage(null)
  }

  const switchMode = (nextMode) => {
    setMode(nextMode)
    setForm(initialForm)
    setMessage(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage(null)

    if (!supabase) {
      setMessage({ type: 'error', text: 'Configure a variável VITE_SUPABASE_PUBLISHABLE_KEY antes de executar o cadastro.' })
      return
    }

    if (mode === 'signup') {
      if (form.fullName.trim().length < 2) {
        setMessage({ type: 'error', text: 'Informe seu nome completo.' })
        return
      }
      if (form.password.length < 8) {
        setMessage({ type: 'error', text: 'A senha deve ter pelo menos 8 caracteres.' })
        return
      }
      if (form.password !== form.confirmPassword) {
        setMessage({ type: 'error', text: 'As senhas não coincidem.' })
        return
      }
    }

    setSubmitting(true)
    const email = form.email.trim().toLowerCase()

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: form.password,
          options: { data: { full_name: form.fullName.trim() } },
        })
        if (error) throw error
        if (!data.session) {
          setMessage({ type: 'success', text: 'Cadastro criado. Confira seu e-mail para confirmar a conta.' })
        } else {
          setMessage({ type: 'success', text: 'Cadastro concluído com sucesso.' })
        }
        setForm(initialForm)
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: form.password })
        if (error) throw error
        setForm(initialForm)
      }
    } catch (error) {
      setMessage({ type: 'error', text: translateSupabaseError(error.message) })
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await supabase?.auth.signOut()
    setMode('signup')
    setForm(initialForm)
    setMessage({ type: 'success', text: 'Você saiu da conta.' })
  }

  if (loading) return <main className="screen"><div className="loader" aria-label="Carregando" /></main>

  if (user) {
    const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário'
    return (
      <main className="screen">
        <section className="dashboard-card">
          <div className="brand-mark">✓</div>
          <span className="eyebrow">Conta ativa</span>
          <h1>Olá, {displayName.split(' ')[0]}.</h1>
          <p className="subtitle">Seu cadastro está conectado ao Supabase e sua sessão está protegida.</p>
          <div className="profile-box">
            <span className="avatar">{displayName.charAt(0).toUpperCase()}</span>
            <div>
              <strong>{displayName}</strong>
              <span>{user.email}</span>
            </div>
          </div>
          <button className="button secondary" type="button" onClick={handleLogout}>Sair da conta</button>
        </section>
      </main>
    )
  }

  return (
    <main className="screen">
      <section className="auth-card">
        <div className="brand-row">
          <div className="brand-mark">✓</div>
          <div>
            <strong>Conta</strong>
            <span>Cadastro seguro</span>
          </div>
        </div>

        <div className="intro">
          <span className="eyebrow">{mode === 'signup' ? 'Comece agora' : 'Bem-vindo de volta'}</span>
          <h1>{mode === 'signup' ? 'Crie sua conta' : 'Entre na sua conta'}</h1>
          <p>{mode === 'signup' ? 'Um cadastro rápido, claro e sem excesso de campos.' : 'Acesse sua conta usando seu e-mail e senha.'}</p>
        </div>

        <div className="mode-switch" role="tablist" aria-label="Autenticação">
          <button className={mode === 'signup' ? 'active' : ''} onClick={() => switchMode('signup')} type="button">Cadastrar</button>
          <button className={mode === 'login' ? 'active' : ''} onClick={() => switchMode('login')} type="button">Entrar</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {mode === 'signup' && (
            <label>
              <span>Nome completo</span>
              <input name="fullName" value={form.fullName} onChange={update} placeholder="Ex.: Lucas Rezende" autoComplete="name" required />
            </label>
          )}

          <label>
            <span>E-mail</span>
            <input name="email" value={form.email} onChange={update} type="email" inputMode="email" placeholder="voce@exemplo.com" autoComplete="email" required />
          </label>

          <label>
            <span>Senha</span>
            <input name="password" value={form.password} onChange={update} type="password" placeholder="Mínimo de 8 caracteres" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required />
          </label>

          {mode === 'signup' && form.password && (
            <div className="strength" aria-label={`Força da senha: ${passwordScore} de 4`}>
              <div className="strength-bars">{[1,2,3,4].map((item) => <i key={item} className={passwordScore >= item ? 'filled' : ''} />)}</div>
              <small>{passwordScore < 2 ? 'Senha fraca' : passwordScore < 4 ? 'Senha razoável' : 'Senha forte'}</small>
            </div>
          )}

          {mode === 'signup' && (
            <label>
              <span>Confirmar senha</span>
              <input name="confirmPassword" value={form.confirmPassword} onChange={update} type="password" placeholder="Digite novamente" autoComplete="new-password" required />
            </label>
          )}

          {message && <div className={`message ${message.type}`} role="alert">{message.text}</div>}

          <button className="button primary" disabled={submitting} type="submit">
            {submitting ? 'Aguarde...' : mode === 'signup' ? 'Criar minha conta' : 'Entrar'}
          </button>
        </form>

        <p className="fine-print">Ao continuar, você concorda com os termos de uso e a política de privacidade.</p>
      </section>
    </main>
  )
}

function translateSupabaseError(message = '') {
  const normalized = message.toLowerCase()
  if (normalized.includes('user already registered')) return 'Este e-mail já está cadastrado.'
  if (normalized.includes('invalid login credentials')) return 'E-mail ou senha incorretos.'
  if (normalized.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.'
  if (normalized.includes('password should be at least')) return 'A senha informada é muito curta.'
  if (normalized.includes('rate limit')) return 'Muitas tentativas. Aguarde um pouco e tente novamente.'
  return message || 'Não foi possível concluir a operação.'
}

export default App
