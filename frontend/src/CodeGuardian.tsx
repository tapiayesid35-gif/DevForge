import { useState } from 'react'
import { supabase } from './lib/supabase'

type Finding = {
  title: string
  description: string
  recommendation: string
  severity: 'Media' | 'Baja' | 'Alta'
  line: number
}

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

function CodeGuardian() {
  const [code, setCode] = useState(`# Ejemplo de código para analizar

def saludar(nombre):
    # TODO: completar validaciones
    print("Hola", nombre)
    pass`)
  const [language, setLanguage] = useState('python')
  const [findings, setFindings] = useState<Finding[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saveMessage, setSaveMessage] = useState('')

  const handleAnalyze = async () => {
    setLoading(true)
    setError('')
    setSaveMessage('')
    setFindings(null)

    try {
      const response = await fetch(`${API_URL}/api/codeguardian/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.detail || `Error del servidor: ${response.status}`)
      }

      const detected = (data.findings ?? []) as Finding[]
      setFindings(detected)

      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      if (userData.user) {
        const { error: insertError } = await supabase.from('code_analyses').insert({
          user_id: userData.user.id,
          language,
          total_findings: detected.length,
          findings: detected,
        })

        if (insertError) {
          setSaveMessage(
            `Análisis completado, pero no se pudo guardar en el historial: ${insertError.message}`
          )
        } else {
          setSaveMessage('Análisis completado y guardado en tu historial.')
        }
      } else {
        setSaveMessage('Análisis completado. Inicia sesión para conservar el historial.')
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No fue posible conectar con el backend.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header>
        <h2 className="text-3xl font-bold">CodeGuardian</h2>
        <p className="text-gray-400 mt-2">
          Analiza tu código y descubre oportunidades de mejora.
        </p>
      </header>

      <section className="bg-[#151e33] border border-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-2">Analizador de código</h3>
        <p className="text-gray-400 text-sm mb-4">
          Análisis estático mediante reglas automáticas. No ejecuta el código ni sustituye una auditoría de seguridad.
        </p>

        <label className="block text-gray-300 text-sm mb-2">
          Lenguaje de programación
        </label>
        <select
          value={language}
          onChange={event => {
            setLanguage(event.target.value)
            setFindings(null)
            setSaveMessage('')
          }}
          className="bg-[#0b1020] border border-gray-700 rounded-lg p-3 mb-4 text-white"
        >
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>

        <label className="block text-gray-300 text-sm mb-2">Código fuente</label>
        <textarea
          value={code}
          onChange={event => {
            setCode(event.target.value)
            setFindings(null)
            setError('')
            setSaveMessage('')
          }}
          spellCheck={false}
          className="w-full min-h-72 bg-[#0b1020] border border-gray-700 rounded-lg p-4 text-green-300 font-mono text-sm outline-none focus:border-violet-500 resize-y"
          placeholder="Pega aquí tu código..."
        />

        <div className="flex flex-wrap justify-between items-center gap-3 mt-4">
          <p className="text-gray-500 text-xs">El código se analiza sin ejecutarlo.</p>
          <button
            onClick={handleAnalyze}
            disabled={!code.trim() || loading}
            className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 px-6 py-3 rounded-lg font-semibold"
          >
            {loading ? 'Analizando...' : 'Analizar código'}
          </button>
        </div>

        {error && (
          <div className="mt-5 bg-red-950/40 border border-red-800 rounded-lg p-4 text-red-300">
            {error}
          </div>
        )}
        {saveMessage && (
          <div className="mt-4 bg-blue-950/30 border border-blue-800 rounded-lg p-4 text-blue-200 text-sm">
            {saveMessage}
          </div>
        )}
      </section>

      {findings !== null && (
        <section className="bg-[#151e33] border border-gray-800 rounded-xl p-6">
          <div className="flex justify-between items-center flex-wrap gap-3 mb-5">
            <h3 className="text-xl font-semibold">Resultados del análisis</h3>
            <span className="bg-violet-950 text-violet-300 px-3 py-2 rounded-lg text-sm">
              {findings.length} hallazgos
            </span>
          </div>

          {findings.length === 0 ? (
            <p className="text-green-300">No se encontraron problemas en las reglas revisadas.</p>
          ) : (
            <div className="space-y-4">
              {findings.map((finding, index) => (
                <article key={index} className="border border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center gap-3 flex-wrap">
                    <h4 className="font-semibold">{finding.title}</h4>
                    <span className="text-xs px-3 py-1 rounded-full bg-yellow-950 text-yellow-300">
                      Severidad {finding.severity}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">{finding.description}</p>
                  <p className="text-violet-300 text-sm mt-2">
                    Recomendación: {finding.recommendation}
                  </p>
                  <p className="text-gray-500 text-xs mt-3">Línea {finding.line}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}

export default CodeGuardian
