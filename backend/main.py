
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="DevForge API",
    description="Backend de la plataforma DevForge",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Modelo de datos para CodeGuardian
class CodeAnalysisRequest(BaseModel):
    code: str
    language: str = "python"


# Página principal
@app.get("/")
def home():
    return {
        "message": "Bienvenido a DevForge",
        "status": "API funcionando correctamente"
    }


# Estado del servidor
@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


# Obtener retos de CodeArena
@app.get("/api/challenges")
def get_challenges():
    challenges = [
        {
            "id": 1,
            "title": "Suma de dos números",
            "difficulty": "Fácil",
            "category": "Fundamentos",
            "description": "Crea una función que reciba dos números y devuelva su suma."
        },
        {
            "id": 2,
            "title": "Palíndromo",
            "difficulty": "Intermedio",
            "category": "Cadenas",
            "description": "Comprueba si una palabra se lee igual de izquierda a derecha que de derecha a izquierda."
        },
        {
            "id": 3,
            "title": "Encontrar número mayor",
            "difficulty": "Fácil",
            "category": "Listas",
            "description": "Encuentra el número más grande dentro de una lista."
        }
    ]

    return {
        "total": len(challenges),
        "challenges": challenges
    }


# Analizador estático de CodeGuardian
@app.post("/api/codeguardian/analyze")
def analyze_code(request: CodeAnalysisRequest):

    findings = []
    lines = request.code.splitlines()

    for index, line in enumerate(lines):
        trimmed = line.strip()

        if "TODO" in trimmed.upper():
            findings.append({
                "title": "Tarea pendiente",
                "description": "Se encontró una marca TODO en el código.",
                "recommendation": "Completa la tarea pendiente o elimina el comentario.",
                "severity": "Baja",
                "line": index + 1
            })

        if "console.log(" in trimmed or trimmed.startswith("print("):
            findings.append({
                "title": "Mensaje de depuración",
                "description": "Se encontró una instrucción de impresión o depuración.",
                "recommendation": "Revisa si necesitas conservar este mensaje en la versión final.",
                "severity": "Baja",
                "line": index + 1
            })

        if trimmed == "pass" or 'throw new Error("Not implemented")' in trimmed:
            findings.append({
                "title": "Implementación incompleta",
                "description": "Se encontró una instrucción que puede indicar código pendiente.",
                "recommendation": "Implementa la lógica correspondiente antes de entregar el proyecto.",
                "severity": "Media",
                "line": index + 1
            })

    return {
        "language": request.language,
        "total_findings": len(findings),
        "findings": findings,
        "message": (
            "Análisis completado."
            if findings
            else "No se encontraron problemas en las reglas revisadas."
        )
    }
