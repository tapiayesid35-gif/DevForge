
import { useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'

import { python } from '@codemirror/lang-python'
import { javascript } from '@codemirror/lang-javascript'
import { java } from '@codemirror/lang-java'
import { cpp } from '@codemirror/lang-cpp'

type Language = 'python' | 'javascript' | 'java' | 'cpp'

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

const challenges = [
  {
    id: 1,
    title: 'Suma de dos números',
    difficulty: 'Fácil',
    category: 'Fundamentos',
    description:
      'Crea una función que reciba dos números y devuelva el resultado de su suma.',
    exampleInput: '5, 3',
    exampleOutput: '8',
    starterCodes: {
      python: `def suma(a, b):
    # Escribe tu solución aquí
    return 0

print(suma(5, 3))`,

      javascript: `function suma(a, b) {
  // Escribe tu solución aquí
  return 0;
}

console.log(suma(5, 3));`,

      java: `public class Main {
    public static int suma(int a, int b) {
        // Escribe tu solución aquí
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(suma(5, 3));
    }
}`,

      cpp: `#include <iostream>
using namespace std;

int suma(int a, int b) {
    // Escribe tu solución aquí
    return 0;
}

int main() {
    cout << suma(5, 3) << endl;
    return 0;
}`,
    },
  },
  {
    id: 2,
    title: 'Palíndromo',
    difficulty: 'Intermedio',
    category: 'Cadenas',
    description:
      'Determina si una palabra se lee igual de izquierda a derecha que de derecha a izquierda.',
    exampleInput: '"radar"',
    exampleOutput: 'True',
    starterCodes: {
      python: `def es_palindromo(palabra):
    # Escribe tu solución aquí
    return False

print(es_palindromo("radar"))`,

      javascript: `function esPalindromo(palabra) {
  // Escribe tu solución aquí
  return false;
}

console.log(esPalindromo("radar"));`,

      java: `public class Main {
    public static boolean esPalindromo(String palabra) {
        // Escribe tu solución aquí
        return false;
    }

    public static void main(String[] args) {
        System.out.println(esPalindromo("radar"));
    }
}`,

      cpp: `#include <iostream>
#include <string>
using namespace std;

bool esPalindromo(string palabra) {
    // Escribe tu solución aquí
    return false;
}

int main() {
    cout << esPalindromo("radar") << endl;
    return 0;
}`,
    },
  },
  {
    id: 3,
    title: 'Encontrar el número mayor',
    difficulty: 'Fácil',
    category: 'Listas',
    description:
      'Crea una función que reciba una lista de números y devuelva el número más grande.',
    exampleInput: '[4, 9, 2, 7]',
    exampleOutput: '9',
    starterCodes: {
      python: `def numero_mayor(numeros):
    # Escribe tu solución aquí
    return 0

print(numero_mayor([4, 9, 2, 7]))`,

      javascript: `function numeroMayor(numeros) {
  // Escribe tu solución aquí
  return 0;
}

console.log(numeroMayor([4, 9, 2, 7]));`,

      java: `public class Main {
    public static int numeroMayor(int[] numeros) {
        // Escribe tu solución aquí
        return 0;
    }

    public static void main(String[] args) {
        int[] numeros = {4, 9, 2, 7};
        System.out.println(numeroMayor(numeros));
    }
}`,

      cpp: `#include <iostream>
using namespace std;

int numeroMayor(int numeros[], int cantidad) {
    // Escribe tu solución aquí
    return 0;
}

int main() {
    int numeros[] = {4, 9, 2, 7};
    cout << numeroMayor(numeros, 4) << endl;
    return 0;
}`,
    },
  },
]

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

  const selected = challenges.find(
    (challenge) => challenge.id === selectedChallenge
  )

  const filteredChallenges =
    filter === 'Todos'
      ? challenges
      : challenges.filter(
          (challenge) => challenge.difficulty === filter
        )

  const updateCode = (value: string) => {
    setCodes((previous) => ({
      ...previous,
      [language]: value,
    }))
  }

  if (selected) {
    return (
      <div className="space-y-8 text-white">

        <button
          onClick={() => setSelectedChallenge(null)}
          className="text-violet-400 hover:text-violet-300"
        >
          ← Volver a los desafíos
        </button>

        <div>
          <div className="flex flex-wrap gap-3 mb-4">
            <span className="bg-violet-500/20 text-violet-300 px-3 py-1 rounded-full text-sm">
              {selected.difficulty}
            </span>

            <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">
              {selected.category}
            </span>
          </div>

          <h1 className="text-3xl font-bold mb-3">
            {selected.title}
          </h1>

          <p className="text-gray-400">
            {selected.description}
          </p>
        </div>

        <section className="bg-[#151e33] border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">
            Ejemplo
          </h2>

          <div className="space-y-3">
            <div>
              <p className="text-gray-400 text-sm mb-1">
                Entrada
              </p>
              <code className="text-green-400">
                {selected.exampleInput}
              </code>
            </div>

            <div>
              <p className="text-gray-400 text-sm mb-1">
                Salida esperada
              </p>
              <code className="text-green-400">
                {selected.exampleOutput}
              </code>
            </div>
          </div>
        </section>

        <section className="bg-[#151e33] border border-gray-800 rounded-xl p-6">

          <div className="flex flex-wrap justify-between items-center gap-4 mb-5">
            <h2 className="text-xl font-bold">
              Editor de código
            </h2>

            <div className="flex items-center gap-3">
              <label
                htmlFor="language"
                className="text-sm text-gray-400"
              >
                Lenguaje:
              </label>

              <select
                id="language"
                value={language}
                onChange={(event) =>
                  setLanguage(event.target.value as Language)
                }
                className="bg-[#0b1020] border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-violet-500"
              >
                {Object.entries(languages).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-700">

            <CodeMirror
              value={
                codes[language] || selected.starterCodes[language]
              }
              height="380px"
              theme="dark"
              extensions={[languageExtensions[language]]}
              onChange={updateCode}
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                highlightActiveLine: true,
                autocompletion: true,
              }}
            />

          </div>

          <div className="flex flex-wrap gap-3 mt-4">

            <button
              onClick={() =>
                setCodes((previous) => ({
                  ...previous,
                  [language]: selected.starterCodes[language],
                }))
              }
              className="bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded-lg transition"
            >
              Restablecer código
            </button>

            <button
              disabled
              title="La ejecución se implementará posteriormente"
              className="bg-violet-600 opacity-50 cursor-not-allowed px-5 py-2 rounded-lg"
            >
              Ejecutar código (próximamente)
            </button>

          </div>

          <p className="text-gray-500 text-sm mt-4">
            Editor CodeMirror integrado. Tus cambios se conservan
            al cambiar entre lenguajes mientras trabajas en el reto.
          </p>

        </section>
      </div>
    )
  }

  return (
    <div className="space-y-8 text-white">

      <div>
        <h1 className="text-3xl font-bold mb-2">
          CodeArena
        </h1>

        <p className="text-gray-400">
          Mejora tus habilidades resolviendo desafíos de programación.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {['Todos', 'Fácil', 'Intermedio'].map((option) => (
          <button
            key={option}
            onClick={() => setFilter(option)}
            className={`px-5 py-2 rounded-lg transition ${
              filter === option
                ? 'bg-violet-600 text-white'
                : 'bg-[#151e33] text-gray-400 hover:bg-gray-700'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

        {filteredChallenges.map((challenge) => (
          <article
            key={challenge.id}
            className="bg-[#151e33] border border-gray-800 rounded-xl p-6 hover:border-violet-500 transition"
          >

            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-violet-400">
                {challenge.category}
              </span>

              <span className="text-xs bg-gray-700 px-3 py-1 rounded-full">
                {challenge.difficulty}
              </span>
            </div>

            <h2 className="text-xl font-bold mb-3">
              {challenge.title}
            </h2>

            <p className="text-gray-400 text-sm mb-6">
              {challenge.description}
            </p>

            <button
              onClick={() => {
                setSelectedChallenge(challenge.id)

                setCodes({
                  ...challenge.starterCodes,
                })
              }}
              className="w-full bg-violet-600 hover:bg-violet-700 py-2 rounded-lg transition"
            >
              Resolver desafío
            </button>

          </article>
        ))}

      </div>
    </div>
  )
}

export default CodeArena
