
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from code_runner import run_python_code, evaluate_challenge


app = FastAPI(
    title="DevForge API",
    description="Backend de la plataforma DevForge",
    version="1.2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv(
            "DEVFORGE_CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174"
        ).split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CodeAnalysisRequest(BaseModel):
    code: str
    language: str = "python"


class CodeExecutionRequest(BaseModel):
    source_code: str = Field(min_length=1, max_length=20000)
    language: str = "python"


class ChallengeEvaluationRequest(BaseModel):
    challenge_id: int
    source_code: str = Field(min_length=1, max_length=20000)


@app.get("/")
def home():
    return {
        "message": "Bienvenido a DevForge",
        "status": "API funcionando correctamente"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/api/challenges")
def get_challenges():
    challenges = [
        {
            "id": 1,
            "title": "Suma de dos números",
            "difficulty": "Fácil",
            "category": "Fundamentos",
            "description": "Crea un programa que lea dos números y muestre su suma."
        },
        {
            "id": 2,
            "title": "Palíndromo",
            "difficulty": "Intermedio",
            "category": "Cadenas",
            "description": "Lee una palabra y muestra True si es palíndromo o False si no lo es."
        },
        {
            "id": 3,
            "title": "Encontrar número mayor",
            "difficulty": "Fácil",
            "category": "Listas",
            "description": "Lee tres números y muestra el número mayor."
        }
    ]

    return {
        "total": len(challenges),
        "challenges": challenges
    }


@app.post("/api/codearena/run")
def execute_code(request: CodeExecutionRequest):

    if request.language.lower() != "python":
        raise HTTPException(
            status_code=400,
            detail="Por ahora, CodeArena solo permite ejecutar Python."
        )

    result = run_python_code(request.source_code)
    if result.get("error", "").startswith("Error de Docker:"):
        raise HTTPException(status_code=503, detail=result["error"])
    return result


@app.post("/api/codearena/evaluate")
def evaluate_code(request: ChallengeEvaluationRequest):

    result = evaluate_challenge(
        request.challenge_id,
        request.source_code
    )

    if result["total_tests"] == 0:
        raise HTTPException(
            status_code=404,
            detail=result["message"]
        )

    return result


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
