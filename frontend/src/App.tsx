
import { useState } from 'react'
import CodeArena from './CodeArena'
import CodeGuardian from './CodeGuardian'
import BackendStatus from './BackendStatus'
import './App.css'

function App() {
  const [activePage, setActivePage] = useState('Dashboard')

  const menuButton = (page: string) =>
    `block w-full text-left p-3 rounded-lg ${
      activePage === page
        ? 'bg-violet-600 text-white'
        : 'text-gray-400 hover:bg-gray-800'
    }`

  return (
    <div className="min-h-screen bg-[#0b1020] text-white flex">

      {/* Menú lateral */}
      <aside className="w-64 bg-[#11182b] border-r border-gray-800 p-6 hidden md:block">
        <h1 className="text-2xl font-bold text-violet-400 mb-10">
          DevForge
        </h1>

        <nav className="space-y-3">
          <p className="text-gray-500 text-xs uppercase mb-4">
            Principal
          </p>

          <button
            onClick={() => setActivePage('Dashboard')}
            className={menuButton('Dashboard')}
          >
            Dashboard
          </button>

          <button
            onClick={() => setActivePage('CodeArena')}
            className={menuButton('CodeArena')}
          >
            CodeArena
          </button>

          <button
            onClick={() => setActivePage('CodeGuardian')}
            className={menuButton('CodeGuardian')}
          >
            CodeGuardian
          </button>

          <button
            onClick={() => setActivePage('AI Coach')}
            className={menuButton('AI Coach')}
          >
            AI Coach
          </button>

          <button
            onClick={() => setActivePage('Mi perfil')}
            className={menuButton('Mi perfil')}
          >
            Mi perfil
          </button>
        </nav>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-6 md:p-10">

        {activePage === 'Dashboard' ? (

          <>
            <header className="flex flex-wrap justify-between items-center gap-4 mb-10">
              <div>
                <h2 className="text-3xl font-bold">Dashboard</h2>
                <p className="text-gray-400 mt-2">
                  Bienvenido a DevForge. Sigue mejorando tus habilidades.
                </p>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <BackendStatus />
                <div className="bg-[#1b2540] rounded-full px-4 py-2">
                  Usuario
                </div>
              </div>
            </header>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">

              <div className="bg-[#151e33] border border-gray-800 p-6 rounded-xl">
                <p className="text-gray-400">Retos completados</p>
                <h3 className="text-3xl font-bold mt-3">0</h3>
                <p className="text-violet-400 text-sm mt-2">
                  Comienza tu primera práctica
                </p>
              </div>

              <div className="bg-[#151e33] border border-gray-800 p-6 rounded-xl">
                <p className="text-gray-400">Análisis realizados</p>
                <h3 className="text-3xl font-bold mt-3">0</h3>
                <p className="text-blue-400 text-sm mt-2">
                  Analiza tu primer proyecto
                </p>
              </div>

              <div className="bg-[#151e33] border border-gray-800 p-6 rounded-xl">
                <p className="text-gray-400">Puntuación de habilidades</p>
                <h3 className="text-3xl font-bold mt-3">0 XP</h3>
                <p className="text-green-400 text-sm mt-2">
                  Tu progreso comienza aquí
                </p>
              </div>

            </section>

            <section>
              <h3 className="text-xl font-bold mb-5">
                Explora DevForge
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                <div className="bg-gradient-to-br from-violet-700 to-indigo-900 p-7 rounded-xl">
                  <h4 className="text-2xl font-bold mb-3">
                    CodeArena
                  </h4>

                  <p className="text-violet-100 mb-6">
                    Resuelve desafíos de programación y demuestra tus conocimientos.
                  </p>

                  <button
                    onClick={() => setActivePage('CodeArena')}
                    className="bg-white text-violet-800 font-semibold px-5 py-2 rounded-lg"
                  >
                    Explorar retos
                  </button>
                </div>

                <div className="bg-gradient-to-br from-blue-700 to-cyan-900 p-7 rounded-xl">
                  <h4 className="text-2xl font-bold mb-3">
                    CodeGuardian
                  </h4>

                  <p className="text-blue-100 mb-6">
                    Analiza tus proyectos y descubre oportunidades de mejora.
                  </p>

                  <button
                    onClick={() => setActivePage('CodeGuardian')}
                    className="bg-white text-blue-800 px-5 py-2 rounded-lg"
                  >
                    Analizar código
                  </button>
                </div>

              </div>
            </section>

            <section className="mt-10 bg-[#151e33] border border-gray-800 p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-3">
                Actividad reciente
              </h3>

              <p className="text-gray-400">
                Todavía no tienes actividad. ¡Completa tu primer reto!
              </p>
            </section>
          </>

        ) : activePage === 'CodeArena' ? (

          <CodeArena />

        ) : activePage === 'CodeGuardian' ? (

          <CodeGuardian />

        ) : (

          <div className="text-white">
            <h2 className="text-3xl font-bold">{activePage}</h2>
            <p className="text-gray-400 mt-2">
              Esta sección estará disponible próximamente.
            </p>
          </div>

        )}

      </main>
    </div>
  )
}

export default App
