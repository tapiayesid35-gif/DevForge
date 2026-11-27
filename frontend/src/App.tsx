
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import CodeArena from './CodeArena'
import CodeGuardian from './CodeGuardian'
import BackendStatus from './BackendStatus'
import { supabase } from './lib/supabase'
import './App.css'

function App() {
  const [activePage, setActivePage] = useState('Dashboard')
  const [session, setSession] = useState<Session | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (mounted) {
        if (error) {
          setError('No se pudo comprobar la sesión.')
        } else {
          setSession(data.session)
        }

        setCheckingSession(false)
      }
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) {
        setSession(newSession)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const handleAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (authMode === 'register') {
        if (!fullName.trim()) {
          setError('Escribe tu nombre completo.')
          return
        }

        if (password.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres.')
          return
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        })

        if (error) throw error

        if (data.session) {
          setMessage('¡Cuenta creada correctamente!')
        } else {
          setMessage(
            'Cuenta creada. Revisa tu correo para confirmar el registro antes de iniciar sesión.'
          )
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

        if (error) throw error

        setMessage('Inicio de sesión exitoso.')
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Ocurrió un error durante la autenticación.'

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      setError('No se pudo cerrar la sesión.')
      return
    }

    setActivePage('Dashboard')
    setMessage('')
    setError('')
  }

  const menuButton = (page: string) =>
    `block w-full text-left p-3 rounded-lg ${
      activePage === page
        ? 'bg-violet-600 text-white'
        : 'text-gray-400 hover:bg-gray-800'
    }`

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#0b1020] text-white flex items-center justify-center">
        <p className="text-violet-400">Comprobando sesión de DevForge...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0b1020] text-white flex items-center justify-center p-5">
        <div className="w-full max-w-md bg-[#151e33] border border-gray-800 rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-violet-400">
              DevForge
            </h1>
            <p className="text-gray-400 mt-3">
              Practica. Analiza. Mejora. Demuestra.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-[#0b1020] rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login')
                setError('')
                setMessage('')
              }}
              className={`py-2 rounded-md ${
                authMode === 'login'
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400'
              }`}
            >
              Iniciar sesión
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('register')
                setError('')
                setMessage('')
              }}
              className={`py-2 rounded-md ${
                authMode === 'register'
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400'
              }`}
            >
              Registrarse
            </button>
          </div>

          <h2 className="text-2xl font-bold mb-2">
            {authMode === 'login'
              ? 'Bienvenido de nuevo'
              : 'Crear cuenta'}
          </h2>

          <p className="text-gray-400 text-sm mb-6">
            {authMode === 'login'
              ? 'Ingresa a tu espacio de aprendizaje.'
              : 'Únete a la comunidad DevForge.'}
          </p>

          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'register' && (
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Tu nombre"
                  required
                  autoComplete="name"
                  className="w-full bg-[#0b1020] border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-violet-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                required
                autoComplete="email"
                className="w-full bg-[#0b1020] border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                autoComplete={
                  authMode === 'login'
                    ? 'current-password'
                    : 'new-password'
                }
                className="w-full bg-[#0b1020] border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-violet-500"
              />
            </div>

            {error && (
              <div className="bg-red-950/40 border border-red-800 text-red-300 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-950/40 border border-green-800 text-green-300 p-3 rounded-lg text-sm">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 py-3 rounded-lg font-semibold"
            >
              {loading
                ? 'Procesando...'
                : authMode === 'login'
                  ? 'Ingresar a DevForge'
                  : 'Crear mi cuenta'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-xs mt-6">
            Plataforma inteligente para el desarrollo y evaluación de habilidades de software.
          </p>
        </div>
      </div>
    )
  }

  const userName =
    session.user.user_metadata?.full_name ||
    session.user.email ||
    'Estudiante'

  return (
    <AuthenticatedApp
      session={session}
      userName={userName}
      activePage={activePage}
      setActivePage={setActivePage}
      onLogout={handleLogout}
      message={message}
      error={error}
    />
  )
}

type AuthenticatedAppProps = {
  session: Session
  userName: string
  activePage: string
  setActivePage: (page: string) => void
  onLogout: () => void
  message: string
  error: string
}

type AttemptRow = {
  id: number
  challenge_id: number
  status: string
  score: number | null
  created_at: string
}

type AnalysisRow = {
  id: number
  total_findings: number
  created_at: string
}

type ProfileRow = {
  full_name: string | null
  role: string | null
}

type IepRow = {
  problem_solving: number | null
  code_quality: number | null
  improvement: number | null
  autonomy: number | null
  overall_score: number | null
}

function AuthenticatedApp({
  session,
  userName,
  activePage,
  setActivePage,
  onLogout,
  message,
  error,
}: AuthenticatedAppProps) {
  const [attempts, setAttempts] = useState<AttemptRow[]>([])
  const [analyses, setAnalyses] = useState<AnalysisRow[]>([])
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [iep, setIep] = useState<IepRow | null>(null)
  const [xp, setXp] = useState(0)
  const [loadingStats, setLoadingStats] = useState(true)
  const [dataError, setDataError] = useState('')

  useEffect(() => {
    let active = true

    const loadUserData = async () => {
      setLoadingStats(true)
      setDataError('')

      const userId = session.user.id
      const [attemptResult, analysisResult, profileResult, iepResult, xpResult] =
        await Promise.all([
          supabase
            .from('attempts')
            .select('id, challenge_id, status, score, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(100),
          supabase
            .from('code_analyses')
            .select('id, total_findings, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(100),
          supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', userId)
            .maybeSingle(),
          supabase
            .from('iep_snapshots')
            .select(
              'problem_solving, code_quality, improvement, autonomy, overall_score'
            )
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from('xp_transactions')
            .select('points')
            .eq('user_id', userId),
        ])

      if (!active) return

      if (attemptResult.error) {
        setDataError(
          'No se pudieron consultar las estadísticas. Verifica las políticas RLS de attempts.'
        )
      } else {
        setAttempts((attemptResult.data ?? []) as AttemptRow[])
      }

      if (!analysisResult.error) {
        setAnalyses((analysisResult.data ?? []) as AnalysisRow[])
      }

      if (!profileResult.error && profileResult.data) {
        setProfile(profileResult.data as ProfileRow)
      }

      if (!iepResult.error && iepResult.data) {
        setIep(iepResult.data as IepRow)
      }

      if (!xpResult.error) {
        const total = (xpResult.data ?? []).reduce(
          (sum, item) => sum + (Number(item.points) || 0),
          0
        )
        setXp(total)
      }

      setLoadingStats(false)
    }

    loadUserData()
    return () => {
      active = false
    }
  }, [session.user.id])

  const role = profile?.role ?? 'student'
  const evaluatedAttempts = attempts.filter(
    attempt => attempt.status === 'evaluated' || attempt.status === 'approved'
  )
  const completedAttempts = evaluatedAttempts.filter(
    attempt => (attempt.score ?? 0) >= 70
  )
  const averageScore =
    evaluatedAttempts.length > 0
      ? Math.round(
          evaluatedAttempts.reduce(
            (sum, attempt) => sum + (attempt.score ?? 0),
            0
          ) / evaluatedAttempts.length
        )
      : 0

  const menuItems = [
    'Dashboard',
    'CodeArena',
    'CodeGuardian',
    'AI Coach',
    'Mi perfil',
    ...(role === 'teacher' || role === 'admin' ? ['Panel docente'] : []),
  ]

  const menuButton = (page: string) =>
    `block w-full text-left p-3 rounded-lg transition ${
      activePage === page
        ? 'bg-violet-600 text-white'
        : 'text-gray-400 hover:bg-gray-800'
    }`

  return (
    <div className="min-h-screen bg-[#0b1020] text-white flex">
      <aside className="w-64 bg-[#11182b] border-r border-gray-800 p-6 hidden md:block">
        <h1 className="text-2xl font-bold text-violet-400 mb-10">DevForge</h1>
        <nav className="space-y-2">
          <p className="text-gray-500 text-xs uppercase mb-4">Principal</p>
          {menuItems.map(page => (
            <button
              key={page}
              onClick={() => setActivePage(page)}
              className={menuButton(page)}
            >
              {page}
            </button>
          ))}
        </nav>
        <div className="mt-10 border-t border-gray-800 pt-5 text-xs text-gray-500">
          Practica. Analiza. Mejora. Demuestra.
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-5 md:p-10">
        <header className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold">{activePage}</h2>
            <p className="text-gray-400 mt-2">
              Plataforma inteligente para desarrollar tus habilidades.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <BackendStatus />
            <span className="bg-[#1b2540] rounded-full px-4 py-2 text-sm">
              {profile?.full_name || userName}
            </span>
            <button
              onClick={onLogout}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        {message && (
          <div className="mb-4 rounded-lg border border-green-800 bg-green-950/30 p-3 text-green-200">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-lg border border-red-800 bg-red-950/30 p-3 text-red-200">
            {error}
          </div>
        )}

        {activePage === 'Dashboard' && (
          <div className="space-y-8">
            <section className="rounded-2xl border border-violet-800 bg-gradient-to-r from-violet-950 to-[#151e33] p-7">
              <p className="text-violet-300 text-sm">Bienvenido a DevForge</p>
              <h3 className="text-2xl font-bold mt-2">{profile?.full_name || userName}</h3>
              <p className="text-gray-300 mt-2">
                Tu progreso se construye con práctica, análisis y evidencia de aprendizaje.
              </p>
            </section>

            {dataError && (
              <div className="rounded-lg border border-yellow-800 bg-yellow-950/30 p-4 text-yellow-200">
                {dataError}
              </div>
            )}

            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <MetricCard
                label="Intentos evaluados"
                value={loadingStats ? '…' : evaluatedAttempts.length}
                note="Pruebas ejecutadas"
              />
              <MetricCard
                label="Retos aprobados"
                value={loadingStats ? '…' : completedAttempts.length}
                note="Puntuación igual o superior a 70"
              />
              <MetricCard
                label="Promedio"
                value={loadingStats ? '…' : `${averageScore}/100`}
                note="Sobre intentos evaluados"
              />
              <MetricCard
                label="Experiencia"
                value={loadingStats ? '…' : `${xp} XP`}
                note="Transacciones registradas"
              />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-[#151e33] border border-gray-800 p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-2">Índice de Evolución del Programador</h3>
                {iep ? (
                  <>
                    <p className="text-4xl font-bold text-violet-300">
                      {Math.round(iep.overall_score ?? 0)}/100
                    </p>
                    <div className="grid grid-cols-2 gap-3 mt-5 text-sm">
                      <IepMetric label="Resolución de problemas" value={iep.problem_solving} />
                      <IepMetric label="Calidad del código" value={iep.code_quality} />
                      <IepMetric label="Mejora" value={iep.improvement} />
                      <IepMetric label="Autonomía" value={iep.autonomy} />
                    </div>
                  </>
                ) : (
                  <p className="text-gray-400">
                    Aún no hay una medición IEP registrada. Se mostrará cuando el sistema genere una instantánea basada en evidencias.
                  </p>
                )}
              </div>

              <div className="bg-[#151e33] border border-gray-800 p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-2">Actividad reciente</h3>
                {loadingStats ? (
                  <p className="text-gray-400">Consultando tu actividad…</p>
                ) : attempts.length === 0 && analyses.length === 0 ? (
                  <p className="text-gray-400">
                    Todavía no tienes actividad. Comienza resolviendo un reto o analizando código.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {attempts.slice(0, 4).map(item => (
                      <div key={item.id} className="flex justify-between gap-3 border-b border-gray-800 pb-2 text-sm">
                        <span>Reto #{item.challenge_id} · {item.status}</span>
                        <span className="text-violet-300">{item.score ?? 'Sin nota'}</span>
                      </div>
                    ))}
                    <p className="text-gray-400 text-sm">
                      Análisis CodeGuardian guardados: {analyses.length}
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <ActionCard
                title="CodeArena"
                description="Resuelve desafíos y comprueba tus soluciones con casos de prueba."
                button="Explorar retos"
                onClick={() => setActivePage('CodeArena')}
              />
              <ActionCard
                title="CodeGuardian"
                description="Identifica tareas pendientes y oportunidades de mejora en tu código."
                button="Analizar código"
                onClick={() => setActivePage('CodeGuardian')}
              />
            </section>
          </div>
        )}

        {activePage === 'CodeArena' && <CodeArena />}
        {activePage === 'CodeGuardian' && <CodeGuardian />}
        {activePage === 'AI Coach' && (
          <CoachPage attempts={attempts} analyses={analyses} />
        )}
        {activePage === 'Mi perfil' && (
          <ProfilePage
            userName={profile?.full_name || userName}
            email={session.user.email || ''}
            role={role}
            attempts={attempts}
            analyses={analyses}
            xp={xp}
            averageScore={averageScore}
          />
        )}
        {activePage === 'Panel docente' && (
          <TeacherPage role={role} userId={session.user.id} />
        )}
      </main>
    </div>
  )
}

function MetricCard({
  label,
  value,
  note,
}: {
  label: string
  value: string | number
  note: string
}) {
  return (
    <div className="bg-[#151e33] border border-gray-800 p-5 rounded-xl">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-3xl font-bold mt-3">{value}</p>
      <p className="text-gray-500 text-xs mt-2">{note}</p>
    </div>
  )
}

function IepMetric({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="bg-[#0b1020] rounded-lg p-3">
      <p className="text-gray-400">{label}</p>
      <p className="text-lg font-semibold mt-1">
        {value === null ? 'Sin datos' : `${Math.round(value)}/100`}
      </p>
    </div>
  )
}

function ActionCard({
  title,
  description,
  button,
  onClick,
}: {
  title: string
  description: string
  button: string
  onClick: () => void
}) {
  return (
    <div className="bg-[#151e33] border border-gray-800 p-6 rounded-xl">
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-gray-400 mt-2 mb-5">{description}</p>
      <button
        onClick={onClick}
        className="bg-violet-600 hover:bg-violet-700 px-5 py-2 rounded-lg"
      >
        {button}
      </button>
    </div>
  )
}

function CoachPage({
  attempts,
  analyses,
}: {
  attempts: AttemptRow[]
  analyses: AnalysisRow[]
}) {
  const evaluated = attempts.filter(item => item.score !== null)
  const average =
    evaluated.length > 0
      ? evaluated.reduce((sum, item) => sum + (item.score ?? 0), 0) / evaluated.length
      : null
  const latest = evaluated[0]
  const recommendations: string[] = []

  if (evaluated.length === 0) {
    recommendations.push('Completa tu primer reto para obtener una recomendación basada en resultados.')
  } else {
    if ((average ?? 0) < 70) {
      recommendations.push('Refuerza la lógica básica y practica con entradas pequeñas antes de resolver casos más complejos.')
    } else {
      recommendations.push('Mantén la práctica y aumenta gradualmente la dificultad de los desafíos.')
    }
    if ((latest?.score ?? 100) < 100) {
      recommendations.push('Revisa los casos de prueba que no superaste y prueba valores límite y entradas negativas.')
    } else {
      recommendations.push('Tu último intento obtuvo la puntuación máxima. Intenta resolver el siguiente reto con una solución clara y eficiente.')
    }
  }

  if (analyses.some(item => item.total_findings > 0)) {
    recommendations.push('CodeGuardian detectó hallazgos en análisis anteriores. Revisa las recomendaciones y vuelve a analizar el código corregido.')
  }

  return (
    <section className="max-w-4xl space-y-5">
      <div className="bg-[#151e33] border border-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold">Coach de aprendizaje</h3>
        <p className="text-gray-400 mt-2">
          Recomendaciones adaptativas basadas en tus intentos y análisis guardados. Este módulo utiliza reglas de recomendación, no un modelo generativo de IA.
        </p>
      </div>
      {recommendations.map((item, index) => (
        <div key={index} className="bg-[#151e33] border border-violet-900 rounded-xl p-5">
          <p className="text-violet-300 text-sm">Recomendación {index + 1}</p>
          <p className="mt-2">{item}</p>
        </div>
      ))}
    </section>
  )
}

function ProfilePage({
  userName,
  email,
  role,
  attempts,
  analyses,
  xp,
  averageScore,
}: {
  userName: string
  email: string
  role: string
  attempts: AttemptRow[]
  analyses: AnalysisRow[]
  xp: number
  averageScore: number
}) {
  return (
    <section className="max-w-4xl space-y-5">
      <div className="bg-[#151e33] border border-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold">Mi perfil</h3>
        <div className="grid sm:grid-cols-2 gap-4 mt-5">
          <ProfileField label="Nombre" value={userName} />
          <ProfileField label="Correo" value={email} />
          <ProfileField label="Rol" value={role} />
          <ProfileField label="XP registrados" value={`${xp}`} />
          <ProfileField label="Intentos registrados" value={`${attempts.length}`} />
          <ProfileField label="Análisis guardados" value={`${analyses.length}`} />
          <ProfileField label="Promedio de evaluación" value={`${averageScore}/100`} />
        </div>
      </div>
    </section>
  )
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#0b1020] rounded-lg p-4">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="font-semibold mt-1 break-words">{value}</p>
    </div>
  )
}

function TeacherPage({ role, userId }: { role: string; userId: string }) {
  const [courses, setCourses] = useState<Array<{ id: number }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const loadCourses = async () => {
      if (role !== 'teacher' && role !== 'admin') {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('courses')
        .select('id')
        .eq('teacher_id', userId)
        .order('id', { ascending: false })

      if (!active) return
      if (error) {
        setError('No se pudieron cargar los cursos. Comprueba las políticas de acceso de courses.')
      } else {
        setCourses((data ?? []) as Array<{ id: number }>)
      }
      setLoading(false)
    }

    loadCourses()
    return () => { active = false }
  }, [role, userId])

  if (role !== 'teacher' && role !== 'admin') {
    return (
      <div className="bg-[#151e33] border border-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold">Panel docente</h3>
        <p className="text-gray-400 mt-2">
          Esta cuenta tiene rol de estudiante. El panel docente solo está disponible para perfiles autorizados por la institución.
        </p>
      </div>
    )
  }

  return (
    <section className="space-y-5">
      <div className="bg-[#151e33] border border-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold">Cursos asignados</h3>
        <p className="text-gray-400 mt-2">
          Vista inicial de los cursos asociados a tu perfil docente.
        </p>
      </div>
      {loading && <p className="text-gray-400">Cargando cursos…</p>}
      {error && <p className="text-red-300">{error}</p>}
      {!loading && !error && courses.length === 0 && (
        <p className="text-gray-400">No hay cursos asociados a esta cuenta.</p>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        {courses.map(course => (
          <article key={course.id} className="bg-[#151e33] border border-gray-800 rounded-xl p-5">
            <h4 className="font-bold">Curso #{course.id}</h4>
            <p className="text-gray-400 text-sm mt-2">Curso asignado a tu perfil docente.</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default App
