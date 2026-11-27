import { useEffect, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { javascript } from '@codemirror/lang-javascript'
import { java } from '@codemirror/lang-java'
import { cpp } from '@codemirror/lang-cpp'
import { supabase } from './lib/supabase'

type Language = 'python' | 'javascript' | 'java' | 'cpp'

type Challenge = {
  id: number
  title: string
  difficulty: string
  category: string
  description: string
  exampleInput: string
  exampleOutput: string
  expected: string
  starterCodes: Record<Language, string>
}

type SupabaseChallenge = {
  id: number
  title: string
  difficulty: string
  category: string | null
  description: string
  example_input: string | null
  example_output: string | null
  expected: string | null
  starter_codes: Partial<Record<Language, string>> | null
}

type EvaluationResult = {
  success: boolean
  challenge: string
  score: number
  passed_tests: number
  total_tests: number
  results: Array<{
    input: string
    expected: string
    actual: string
    passed: boolean
    error?: string
  }>
  message: string
}

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

const languages: Record<Language, string> = {
  python: 'Python',
  javascript: 'JavaScript',
  java: 'Java',
  cpp: 'C++',
}

const languageExtensions = {
  python: python(),
  javascript: javascript(),
  java: java(),
  cpp: cpp(),
}

const defaultStarterCodes: Record<Language, string> = {
  python: 'a, b = map(int, input().split())\nprint(a + b)',
  javascript: 'function solucion() {\n  return null;\n}\nconsole.log(solucion());',
  java: 'public class Main {\n public static void main(String[] args) {\n  System.out.println("Solución");\n }\n}',
  cpp: '#include <iostream>\nusing namespace std;\nint main() {\n cout << "Solución" << endl;\n return 0;\n}',
}

function CodeArena() {
  const [filter, setFilter] = useState('Todos')
  const [selectedChallenge, setSelectedChallenge] = useState<number | null>(null)
  const [language, setLanguage] = useState<Language>('python')

  const [codes, setCodes] = useState<Record<Language, string>>({
    python: '',
    javascript: '',
    java: '',
    cpp: '',
  })

  const [result, setResult] = useState<EvaluationResult | null>(null)
  const [passed, setPassed] = useState<boolean | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    let active = true

    const loadChallenges = async () => {
      setLoading(true)
      setApiError('')

      try {
        const { data, error } = await supabase
          .from('challenges')
          .select(
            'id, title, difficulty, category, description, example_input, example_output, expected, starter_codes'
          )
          .eq('is_published', true)
          .order('id', { ascending: true })

        if (error) throw error

        const rows = (data ?? []) as unknown as SupabaseChallenge[]

        const formattedChallenges: Challenge[] = rows.map(item => ({
          id: item.id,
          title: item.title,
          difficulty: item.difficulty,
          category: item.category ?? 'General',
          description: item.description,
          exampleInput: item.example_input ?? '',
          exampleOutput: item.example_output ?? '',
          expected: item.expected ?? '',
          starterCodes: {
            ...defaultStarterCodes,
            ...(item.starter_codes ?? {}),
          },
        }))

        if (active) setChallenges(formattedChallenges)
      } catch (error) {
        console.error('Error al consultar retos de Supabase:', error)
        if (active) {
          setApiError(
            'No se pudieron cargar los retos desde Supabase. Comprueba la conexión y las políticas de seguridad.'
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadChallenges()

    return () => {
      active = false
    }
  }, [])

  const selected = challenges.find(c => c.id === selectedChallenge)

  const updateCode = (value: string) => {
    setCodes(previous => ({ ...previous, [language]: value }))
    setResult(null)
    setPassed(null)
    setSaveMessage('')
  }

  // El backend ejecuta las pruebas en Docker. Solo Python está habilitado
  // en el evaluador actual; los otros editores quedan visibles como prototipo.
  const checkChallenge = async () => {
    if (!selected || saving) return

    if (language !== 'python') {
      setResult(null)
      setPassed(false)
      setSaveMessage(
        'El evaluador automático actualmente admite Python. JavaScript, Java y C++ están disponibles en el editor, pero sus motores de ejecución aún no están conectados.'
      )
      return
    }

    const code = codes[language] || selected.starterCodes[language]

    if (!code.trim()) {
      setPassed(false)
      setResult(null)
      setSaveMessage('Escribe una solución antes de evaluar el reto.')
      return
    }

    setSaving(true)
    setResult(null)
    setPassed(null)
    setSaveMessage('Ejecutando tu solución y comprobando los casos de prueba...')

    try {
      const response = await fetch(`${API_URL}/api/codearena/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge_id: selected.id,
          source_code: code,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        const detail =
          typeof responseData.detail === 'string'
            ? responseData.detail
            : 'El servidor no pudo evaluar el código.'
        throw new Error(detail)
      }

      const evaluation = responseData as EvaluationResult
      setResult(evaluation)
      setPassed(evaluation.score === 100)

      const { data: userData, error: userError } =
        await supabase.auth.getUser()

      if (userError) throw userError

      const user = userData.user

      if (!user) {
        setSaveMessage(
          'Evaluación completada. Inicia sesión para guardar este intento en tu historial.'
        )
        return
      }

      // Prototipo: se guarda el resultado devuelto por el backend.
      // Para producción, el backend debe validar la sesión y registrar la nota
      // directamente para evitar que el cliente pueda alterar la puntuación.
      const { error: insertError } = await supabase.from('attempts').insert({
        user_id: user.id,
        challenge_id: selected.id,
        source_code: code,
        language,
        status: 'evaluated',
        score: evaluation.score,
      })

      if (insertError) throw insertError

      setSaveMessage(
        `Evaluación terminada y guardada. ${evaluation.passed_tests} de ${evaluation.total_tests} pruebas aprobadas.`
      )
    } catch (error) {
      console.error('Error al evaluar o guardar el intento:', error)
      const message =
        error instanceof Error ? error.message : 'Error desconocido'

      if (
        message.includes('Failed to fetch') ||
        message.includes('NetworkError')
      ) {
        setSaveMessage(
          'No se pudo conectar con el evaluador. Verifica que FastAPI esté activo en http://127.0.0.1:8000 y vuelve a intentarlo.'
        )
      } else {
        setSaveMessage(`No se pudo completar la evaluación: ${message}`)
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="text-white space-y-3">
        <h1 className="text-3xl font-bold">CodeArena</h1>
        <p className="text-violet-400">Cargando desafíos desde Supabase...</p>
      </div>
    )
  }

  if (apiError) {
    return (
      <div className="text-white space-y-4">
        <h1 className="text-3xl font-bold">CodeArena</h1>
        <div className="bg-red-950/30 border border-red-800 rounded-xl p-5">
          <p className="text-red-300">{apiError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-violet-600 hover:bg-violet-700 px-5 py-2 rounded-lg"
          >
            Volver a intentar
          </button>
        </div>
      </div>
    )
  }

  if (selected) {
    return (
      <div className="space-y-8 text-white">
        <button
          onClick={() => {
            setSelectedChallenge(null)
            setResult(null)
            setPassed(null)
            setSaveMessage('')
          }}
          className="text-violet-400"
        >
          ← Volver a los desafíos
        </button>

        <div>
          <span className="text-violet-300">{selected.difficulty}</span>
          <h1 className="text-3xl font-bold mt-2">{selected.title}</h1>
          <p className="text-gray-400 mt-2">{selected.description}</p>
        </div>

        <section className="bg-[#151e33] rounded-xl p-6">
          <h2 className="text-xl font-bold mb-3">Ejemplo</h2>
          <p className="text-gray-400">
            Entrada: {selected.exampleInput || 'No especificada'}
          </p>
          <p className="text-green-400">
            Salida esperada: {selected.exampleOutput || 'No especificada'}
          </p>
        </section>

        <section className="bg-[#151e33] rounded-xl p-6">
          <div className="flex justify-between items-center flex-wrap gap-3 mb-4">
            <h2 className="text-xl font-bold">Editor de código</h2>

            <select
              value={language}
              onChange={e => {
                setLanguage(e.target.value as Language)
                setResult(null)
                setPassed(null)
                setSaveMessage('')
              }}
              className="bg-[#0b1020] border border-gray-700 rounded-lg p-2"
            >
              {Object.entries(languages).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <CodeMirror
            value={codes[language] || selected.starterCodes[language]}
            height="380px"
            theme="dark"
            extensions={[languageExtensions[language]]}
            onChange={updateCode}
          />

          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={() => {
                setCodes(previous => ({
                  ...previous,
                  [language]: selected.starterCodes[language],
                }))
                setResult(null)
                setPassed(null)
                setSaveMessage('')
              }}
              disabled={saving}
              className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 px-5 py-2 rounded-lg"
            >
              Restablecer código
            </button>

            <button
              onClick={checkChallenge}
              disabled={saving}
              className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 px-5 py-2 rounded-lg"
            >
              {saving ? 'Evaluando código...' : 'Ejecutar y evaluar'}
            </button>
          </div>

          {result && (
            <div
              className={`mt-5 p-4 rounded-lg border ${
                passed
                  ? 'bg-green-950/40 border-green-800 text-green-300'
                  : 'bg-yellow-950/40 border-yellow-800 text-yellow-300'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <strong>{result.message}</strong>
                <span className="text-2xl font-bold">
                  {result.score}/100
                </span>
              </div>
              <p className="mt-2 text-sm">
                Casos aprobados: {result.passed_tests} de {result.total_tests}
              </p>

              <div className="mt-4 space-y-2">
                {result.results?.map((test, index) => (
                  <div
                    key={index}
                    className="bg-black/20 rounded-lg p-3 text-sm"
                  >
                    <div className="flex justify-between gap-3">
                      <strong>Prueba {index + 1}</strong>
                      <span
                        className={
                          test.passed ? 'text-green-300' : 'text-red-300'
                        }
                      >
                        {test.passed ? 'Aprobada' : 'No aprobada'}
                      </span>
                    </div>
                    <p className="text-gray-300 mt-1">
                      Entrada: <code>{test.input}</code>
                    </p>
                    <p className="text-gray-300">
                      Esperado: <code>{test.expected}</code>
                    </p>
                    <p className="text-gray-300">
                      Obtenido: <code>{test.actual || '(sin salida)'}</code>
                    </p>
                    {test.error && (
                      <p className="text-red-300 mt-1">{test.error}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {saveMessage && (
            <div className="mt-4 p-4 rounded-lg border border-blue-800 bg-blue-950/30 text-blue-200">
              <p className="text-sm">{saveMessage}</p>
            </div>
          )}

          <p className="text-gray-500 text-xs mt-4">
            El evaluador conectado ejecuta actualmente soluciones Python en
            contenedores Docker y compara su salida con casos de prueba. Los
            otros lenguajes todavía no tienen motor de evaluación conectado.
            Esta configuración es para el prototipo local; debe reforzarse
            antes de aceptar código de usuarios en un despliegue público.
          </p>
        </section>
      </div>
    )
  }

  const filteredChallenges =
    filter === 'Todos'
      ? challenges
      : challenges.filter(c => c.difficulty === filter)

  return (
    <div className="space-y-8 text-white">
      <div>
        <h1 className="text-3xl font-bold mb-2">CodeArena</h1>
        <p className="text-gray-400">
          Mejora tus habilidades resolviendo desafíos de programación.
        </p>
        <p className="text-green-400 text-sm mt-2">
          Desafíos cargados desde Supabase.
        </p>
      </div>

      <div className="flex gap-3 flex-wrap">
        {['Todos', 'Fácil', 'Intermedio', 'Difícil'].map(option => (
          <button
            key={option}
            onClick={() => setFilter(option)}
            className={`px-5 py-2 rounded-lg ${
              filter === option ? 'bg-violet-600' : 'bg-[#151e33]'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {filteredChallenges.length === 0 ? (
        <div className="bg-[#151e33] border border-gray-800 rounded-xl p-6">
          <p className="text-gray-400">
            No hay desafíos publicados para este filtro.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredChallenges.map(challenge => (
            <article
              key={challenge.id}
              className="bg-[#151e33] border border-gray-800 rounded-xl p-6"
            >
              <span className="text-violet-400">{challenge.category}</span>
              <h2 className="text-xl font-bold my-3">{challenge.title}</h2>
              <p className="text-gray-400 text-sm mb-5">
                {challenge.description}
              </p>

              <div className="text-sm text-gray-400 mb-4">
                Dificultad: {challenge.difficulty}
              </div>

              <button
                onClick={() => {
                  setSelectedChallenge(challenge.id)
                  setLanguage('python')
                  setCodes({ ...challenge.starterCodes })
                  setResult(null)
                  setPassed(null)
                  setSaveMessage('')
                }}
                className="w-full bg-violet-600 hover:bg-violet-700 py-2 rounded-lg"
              >
                Resolver desafío
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default CodeArena
