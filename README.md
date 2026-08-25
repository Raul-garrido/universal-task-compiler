# Universal Semantic Task Compiler

Aplicación de una sola página (HTML/CSS/JS, sin dependencias) que convierte una
petición en lenguaje natural en un **contrato de ejecución canónico** orientado
a objetivos: descompone la petición en subobjetivos, identifica capacidades
necesarias, define criterios de "hecho" (Definition of Done) y valida el
resultado con un motor adversarial.

El núcleo de comprensión intenta primero un análisis semántico real vía la API
de Anthropic (Claude); si no hay API key o la llamada falla, recurre a un
análisis local por heurísticas como red de seguridad, dejando siempre
declarado en el resultado qué fuente se usó (`ai` o `local`).

## Uso

Abre [index.html](index.html) directamente en el navegador, o sírvelo con el
script incluido:

```powershell
./serve.ps1
```

Esto levanta un servidor local en `http://localhost:8123/`.

## Tests

El botón **"Ejecutar Test Framework V401"** de la interfaz corre una batería
de tests internos (forzando el motor local, sin red) contra el pipeline de
comprensión y descomposición de objetivos.
