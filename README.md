# DevForge

**Plataforma inteligente para desarrollo y evaluación de habilidades de software.**

*Practica. Analiza. Mejora. Demuestra.*

## Estado de esta entrega

Esta carpeta reúne una versión integrada del prototipo. Incluye autenticación Supabase, catálogo de retos, editor CodeMirror, evaluación de retos Python mediante Docker, análisis estático CodeGuardian e historial básico. El Dashboard consulta datos del usuario, y AI Coach presenta recomendaciones basadas en reglas y en actividad registrada.

No se debe describir esta versión como un producto de producción ni como una plataforma con IA generativa. Los módulos XP/IEP dependen de datos que deben generarse desde un proceso confiable; el panel docente muestra cursos existentes y depende de la asignación correcta de roles y políticas RLS.

## Funcionalidades disponibles

- Registro e inicio de sesión con Supabase Auth.
- Perfil básico y rol consultados desde `public.profiles`.
- Retos publicados consultados desde `public.challenges`.
- Editor de Python, JavaScript, Java y C++.
- Evaluación automática de Python para los tres retos de demostración mediante Docker.
- Persistencia de intentos en `public.attempts`.
- Análisis estático mediante reglas en FastAPI.
- Persistencia de análisis en `public.code_analyses`.
- Dashboard con intentos, promedio, análisis, XP registrado e IEP si existe una instantánea.
- Recomendaciones de estudio basadas en reglas (no IA generativa).
- Panel docente de lectura de cursos para perfiles `teacher` o `admin`.

## Requisitos

- Windows 10/11, macOS o Linux.
- Node.js 20 o superior y npm.
- Python 3.10 o superior.
- Docker Desktop instalado y en ejecución para evaluar código Python.
- Proyecto Supabase con el esquema DevForge y sus políticas RLS configuradas.

## Configuración de Supabase

1. En `frontend`, copia `.env.example` como `.env`.
2. Completa `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con la URL del proyecto y la clave pública publishable/anon.
3. Nunca uses una clave `service_role` en el frontend ni la subas al repositorio.
4. Comprueba que existan las tablas `profiles`, `challenges`, `attempts`, `code_analyses`, `xp_transactions`, `iep_snapshots` y `courses`, con RLS y políticas apropiadas.
5. Los perfiles docentes deben recibir su rol desde un proceso administrativo confiable; no permitas que el usuario se asigne ese rol desde el navegador.

## Ejecución local en Windows

Abre dos terminales.

### Terminal 1: backend

```powershell
cd DevForge\backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
py -m pip install -r requirements.txt
py -m uvicorn main:app --reload
```

El backend queda en `http://127.0.0.1:8000`. Documentación: `http://127.0.0.1:8000/docs`.

Docker Desktop debe estar abierto. Verifica la conexión:

```powershell
docker run hello-world
```

El evaluador descarga `python:3.12-alpine` si no está disponible localmente.

### Terminal 2: frontend

```powershell
cd DevForge\frontend
Copy-Item .env.example .env
# Edita .env y agrega las credenciales públicas de Supabase
npm install
npm run dev
```

Abre la URL que Vite muestre en la terminal, normalmente `http://localhost:5173`.

## Retos incluidos

| ID | Reto | Entrada esperada | Salida esperada |
|---:|---|---|---|
| 1 | Suma de dos números | Dos enteros separados por espacio | La suma |
| 2 | Palíndromo | Una palabra | `True` o `False` |
| 3 | Encontrar número mayor | Tres enteros separados por espacio | El mayor |

El motor de evaluación actual solo ejecuta Python. Los otros lenguajes se muestran en el editor, pero todavía no cuentan con motores de ejecución conectados.

## API

| Método | Ruta | Propósito |
|---|---|---|
| GET | `/` | Estado general |
| GET | `/health` | Salud del servicio |
| GET | `/api/challenges` | Retos de demostración |
| POST | `/api/codearena/run` | Ejecutar Python |
| POST | `/api/codearena/evaluate` | Evaluar un reto Python |
| POST | `/api/codeguardian/analyze` | Análisis estático |

## Pruebas básicas de aceptación

1. Registrar una cuenta y confirmar el correo si Supabase lo solicita.
2. Iniciar sesión.
3. Verificar que el indicador de backend diga `Conectado`.
4. Abrir CodeArena y cargar el reto de suma.
5. En Python, ejecutar:

```python
a, b = map(int, input().split())
print(a + b)
```

6. En Swagger, comprobar `POST /api/codearena/evaluate` con `challenge_id: 1`.
7. Abrir CodeGuardian, analizar código con `TODO` o `pass` y comprobar que aparezcan hallazgos.
8. Confirmar que los intentos y análisis se guarden en Supabase.
9. Revisar que el Dashboard refleje los registros.

## Limitaciones conocidas y seguridad

- **Evaluación Docker:** la ejecución de código arbitrario sigue siendo un riesgo incluso dentro de un contenedor. La configuración actual sirve para demostración local controlada, no para exponer públicamente a usuarios. Antes de un despliegue real se requiere aislamiento reforzado (por ejemplo, workers en VM/gVisor/Firecracker), límites de salida, autenticación y autorización del backend, rate limiting, monitorización y pruebas de seguridad.
- **Puntuación:** el prototipo registra la puntuación enviada desde el frontend a Supabase. Un usuario técnicamente avanzado podría manipular esa petición. Para métricas institucionales reales, el backend debe validar el JWT de Supabase y escribir el resultado desde un entorno servidor confiable.
- **CodeGuardian:** aplica heurísticas estáticas simples; no es una IA ni una auditoría de seguridad completa.
- **AI Coach:** produce recomendaciones determinísticas a partir de los resultados disponibles; no usa un modelo de IA.
- **XP e IEP:** el Dashboard solo lee transacciones XP e instantáneas IEP existentes. No concede XP ni genera automáticamente el IEP.
- **Panel docente:** depende de que el perfil tenga rol `teacher` o `admin` y de las políticas RLS de cursos.
- **Lenguajes:** solo Python está conectado al evaluador automático.

## Estructura

```text
DevForge/
├── backend/
│   ├── main.py
│   ├── code_runner.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── package-lock.json
│   └── .env.example
└── README.md
```
