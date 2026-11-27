# Lista de verificación para la entrega

## Verificado durante la preparación de esta carpeta
- Se revisó la estructura y los archivos fuente recibidos.
- Se excluyeron `.git`, `node_modules`, entornos virtuales, `dist` y archivos `.env` del ZIP de entrega.
- Se corrigió el campo `input` que necesita la interfaz para mostrar cada caso de prueba.
- Se conectó CodeGuardian al guardado de análisis en Supabase.
- Se añadieron consultas de datos reales para el Dashboard y perfil.
- Se configuró la URL de FastAPI mediante `VITE_API_URL`.
- Se actualizaron instrucciones de instalación y limitaciones de seguridad.

## Pendiente de comprobar en el equipo del usuario
- Copiar `.env.example` a `.env` y completar las variables públicas de Supabase.
- Ejecutar `npm install` y `npm run build` en Windows.
- Ejecutar `py -m pip install -r requirements.txt` y arrancar FastAPI.
- Probar registro, login, CodeArena, CodeGuardian y persistencia en Supabase.
- Comprobar las políticas RLS de cada tabla.
- Ejecutar pruebas de usabilidad y rendimiento requeridas por el proyecto académico.

## No declarar como terminado todavía
- Ejecución automática de JavaScript, Java y C++.
- Aislamiento de producción del código de estudiantes.
- Escrituras seguras de puntuaciones desde backend autenticado.
- Otorgamiento confiable de XP y generación automática del IEP.
- Panel docente completo con gestión y reportes de cohortes.
- Integración de IA generativa.
- Despliegue público seguro.
