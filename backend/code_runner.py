
import docker
import requests
import json

from typing import Any


PYTHON_IMAGE = "python:3.12-alpine"
MAX_CODE_LENGTH = 20000
MAX_EXECUTION_TIME = 5
MEMORY_LIMIT = 128 * 1024 * 1024


CHALLENGES = {
    1: {
        "title": "Suma de dos números",
        "tests": [
            {"input": "2 3\n", "expected": "5"},
            {"input": "10 20\n", "expected": "30"},
            {"input": "-5 5\n", "expected": "0"},
        ],
    },
    2: {
        "title": "Palíndromo",
        "tests": [
            {"input": "oso\n", "expected": "True"},
            {"input": "radar\n", "expected": "True"},
            {"input": "python\n", "expected": "False"},
        ],
    },
    3: {
        "title": "Encontrar número mayor",
        "tests": [
            {"input": "1 5 3\n", "expected": "5"},
            {"input": "10 20 15\n", "expected": "20"},
            {"input": "-5 -2 -9\n", "expected": "-2"},
        ],
    },
}


def run_python_code(
    code: str,
    stdin_data: str = ""
) -> dict[str, Any]:

    if not isinstance(code, str) or not code.strip():
        return {
            "success": False,
            "output": "",
            "error": "Debes escribir código Python.",
            "exit_code": None,
        }

    if len(code) > MAX_CODE_LENGTH:
        return {
            "success": False,
            "output": "",
            "error": "El código supera el tamaño máximo permitido.",
            "exit_code": None,
        }

    client = None
    container = None

    try:
        client = docker.from_env(timeout=MAX_EXECUTION_TIME + 3)
        client.ping()

        # Preparar entrada estándar sin utilizar sockets de Docker.
        wrapped_code = (
            "import sys, io\n"
            f"sys.stdin = io.StringIO({json.dumps(stdin_data)})\n"
            f"exec(compile({json.dumps(code)}, '<student>', 'exec'))\n"
        )

        container = client.containers.run(
            image=PYTHON_IMAGE,
            command=[
                "python",
                "-I",
                "-B",
                "-c",
                wrapped_code
            ],
            detach=True,
            user="1000:1000",
            network_disabled=True,
            read_only=True,
            mem_limit=MEMORY_LIMIT,
            memswap_limit=MEMORY_LIMIT,
            nano_cpus=500_000_000,
            pids_limit=32,
            cap_drop=["ALL"],
            security_opt=["no-new-privileges:true"],
            tmpfs={
                "/tmp": "rw,noexec,nosuid,size=16m"
            },
            stdin_open=False,
            tty=False,
        )

        try:
            result = container.wait(
                timeout=MAX_EXECUTION_TIME + 1
            )

        except requests.exceptions.Timeout:
            container.kill()

            return {
                "success": False,
                "output": "",
                "error": "Tiempo máximo de ejecución excedido.",
                "exit_code": None,
            }

        stdout = container.logs(
            stdout=True,
            stderr=False
        ).decode("utf-8", errors="replace")

        stderr = container.logs(
            stdout=False,
            stderr=True
        ).decode("utf-8", errors="replace")

        exit_code = result.get("StatusCode", 1)

        return {
            "success": exit_code == 0,
            "output": stdout,
            "error": stderr,
            "exit_code": exit_code,
        }

    except docker.errors.DockerException as error:
        return {
            "success": False,
            "output": "",
            "error": f"Error de Docker: {str(error)}",
            "exit_code": None,
        }

    finally:
        if container is not None:
            try:
                container.remove(force=True)
            except docker.errors.DockerException:
                pass

        if client is not None:
            client.close()


def evaluate_challenge(
    challenge_id: int,
    code: str
) -> dict[str, Any]:

    challenge = CHALLENGES.get(challenge_id)

    if challenge is None:
        return {
            "success": False,
            "message": "Reto no encontrado.",
            "score": 0,
            "passed_tests": 0,
            "total_tests": 0,
            "results": [],
        }

    results = []
    passed = 0

    for index, test in enumerate(
        challenge["tests"],
        start=1
    ):

        execution = run_python_code(
            code,
            test["input"]
        )

        actual = execution["output"].strip()
        expected = test["expected"]

        passed_test = (
            execution["success"]
            and actual == expected
        )

        if passed_test:
            passed += 1

        results.append({
            "test": index,
            "input": test["input"].rstrip("\\n"),
            "passed": passed_test,
            "expected": expected,
            "actual": actual,
            "error": execution["error"],
        })

    total = len(challenge["tests"])
    score = round((passed / total) * 100)

    return {
        "success": passed == total,
        "challenge": challenge["title"],
        "score": score,
        "passed_tests": passed,
        "total_tests": total,
        "results": results,
        "message": (
            "¡Reto superado!"
            if passed == total
            else "Hay pruebas que todavía no se han superado."
        ),
    }
