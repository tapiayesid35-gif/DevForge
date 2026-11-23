# DevForge

**Plataforma inteligente para desarrollo y evaluación de habilidades de software.**

*Practica. Analiza. Mejora. Demuestra.*

## 1. Descripción del proyecto

DevForge es una plataforma orientada al aprendizaje y evaluación de habilidades de programación. Integra retos de código y herramientas de análisis estático para ayudar a los usuarios a identificar oportunidades de mejora en sus programas.

## 2. Módulos principales

### CodeArena
- Catálogo de retos de programación.
- Clasificación por dificultad y categoría.
- Editor de código con soporte para varios lenguajes.

### CodeGuardian
- Análisis estático de código.
- Identificación de tareas pendientes.
- Detección de instrucciones de depuración.
- Identificación de posibles implementaciones incompletas.
- Recomendaciones para mejorar el código.

### AI Coach
Módulo contemplado para ofrecer recomendaciones personalizadas de aprendizaje.

### Mi perfil
Módulo contemplado para mostrar el progreso y las habilidades del usuario.

## 3. Tecnologías utilizadas

**Frontend**
- React
- TypeScript
- Vite
- Tailwind CSS
- CodeMirror

**Backend**
- Python
- FastAPI
- Uvicorn
- Pydantic

## 4. Arquitectura

DevForge utiliza una arquitectura cliente-servidor:

- El frontend presenta la interfaz y gestiona la interacción.
- El backend proporciona servicios mediante una API REST.
- FastAPI procesa las solicitudes y devuelve respuestas en formato JSON.

## 5. Estructura del proyecto

```text
DevForge/
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── CodeArena.tsx
│   │   ├── CodeGuardian.tsx
│   │   └── BackendStatus.tsx
│   └── package.json
│
├── backend/
│   ├── main.py
│   └── venv/
│
└── README.md
```

## 6. Instalación y ejecución

### Backend

Desde la carpeta `backend`, activar el entorno virtual:

```powershell
.\venv\Scripts\Activate.ps1
```

Instalar dependencias si es necesario:

```powershell
python -m pip install fastapi "uvicorn[standard]"
```

Iniciar el servidor:

```powershell
python -m uvicorn main:app --reload
```

El backend estará disponible en:

`http://127.0.0.1:8000`

Documentación interactiva:

`http://127.0.0.1:8000/docs`

### Frontend

Desde la carpeta `frontend`:

```powershell
npm install
npm run dev
```

La aplicación estará disponible en:

`http://localhost:5173`

## 7. Endpoints disponibles

| Método | Endpoint | Función |
|---|---|---|
| GET | `/` | Verificar la API |
| GET | `/health` | Comprobar el estado del backend |
| GET | `/api/challenges` | Consultar retos |
| POST | `/api/codeguardian/analyze` | Analizar código |

## 8. Estado actual

- [x] Interfaz principal y navegación.
- [x] Integración frontend-backend.
- [x] Catálogo de retos conectado a FastAPI.
- [x] Editor de código.
- [x] Análisis estático mediante CodeGuardian.
- [x] Visualización de hallazgos y recomendaciones.
- [ ] Ejecución real y aislada de código.
- [ ] AI Coach personalizado.
- [ ] Perfil de habilidades persistente.
- [ ] Base de datos y autenticación.

## 9. Consideraciones

La versión actual es un prototipo funcional. El análisis de CodeGuardian utiliza reglas estáticas básicas y no representa una auditoría completa de seguridad o calidad. La ejecución de código y los módulos pendientes requieren desarrollo adicional.

## 10. Objetivo

Construir una plataforma que integre práctica de programación, análisis técnico y seguimiento del aprendizaje en un mismo entorno.