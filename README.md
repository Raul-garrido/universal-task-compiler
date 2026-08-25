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

## Estado del análisis (2026-08-25)

Auditoría funcional de `localHeuristicUnderstanding` (detección de dominio) y
`SerializerSystem` (formato de salida por modelo destino), probando con una
petición real de un usuario sin conocimientos de IA.

### Corregido

- **Detección de dominio con falsos positivos**: "mejor" (dentro de "la mejor
  calidad posible") y "organiz\w\*" (dentro de "organizado en pasos") activaban
  por error los dominios de compra/comparación y planificación de
  viajes/eventos, aunque la petición no tenía nada que ver con eso.
- **Detección de dominio con falsos negativos**: las reglas de "análisis" y
  "comparación" usaban palabras sueltas sin conjugar (`analiza`, `revisa`,
  `compar`), así que no reconocían conjugaciones normales del español
  (`analices`, `revises`, `comparar`). Ahora usan comodín (`analiz\w*`,
  `revis\w*`, `compar\w*`), igual que ya hacían las reglas de escritura y
  aprendizaje.
- **Serializadores idénticos entre sí**: Claude, ChatGPT y Local generaban
  literalmente el mismo texto plano (Claude solo con una etiqueta XML
  envolviendo todo). Ahora cada adapter tiene su propio formato real y
  completo: Claude → XML con una etiqueta por dato (validado con parser XML),
  ChatGPT → Markdown real (encabezados, checklist, cita), Local → una línea
  por campo, AKI → bloques `:: SECCIÓN` / `> dato`. Los cinco parten del mismo
  contrato (IR) y no pierden información entre ellos.
- **AKI incompleto**: antes solo exponía 4 de los ~12 campos del contrato
  (descartaba asunciones, preguntas pendientes, subobjetivos, fases, DoD y
  validación). Ahora expone el contrato completo, igual que el resto de
  adapters.
- Texto de ejemplo del campo de petición actualizado (antes era el ejemplo de
  "depósito de agua"; ahora es un caso más complejo, de revisión/análisis).

Verificado tras cada cambio con el Test Framework V401 (15/15) y pruebas
manuales de los 5 adapters con la misma petición.

### Pendiente (detectado pero no corregido aún)

- **El campo de petición trae un valor de ejemplo precargado real** (no un
  placeholder): si el usuario hace clic dentro y escribe sin seleccionar todo
  primero, su texto puede mezclarse con el ejemplo en vez de sustituirlo.
  Arreglo sencillo: mover el ejemplo a `placeholder` y dejar el `<textarea>`
  vacío por defecto.
- **`hasAudiencia` es demasiado estrecha**: solo reconoce el patrón "para
  (mi/un/niños/...)". No reconoce otras formas habituales de indicar
  audiencia como "Dirigido a: X" o "público: X" — en ese caso ignora lo que
  el usuario ya especificó y lo sustituye por una asunción genérica (que
  puede coincidir por casualidad, pero no por detección real).
- **Taxonomía de dominio fija (~7 categorías)**: peticiones fuera de esas
  categorías (cocina, salud, finanzas, legal, ingeniería de prompts...) caen
  siempre en el mismo fallback genérico sin subobjetivos ni capacidades
  específicas de esa materia. Es un comportamiento reconocido y documentado
  en el propio código (no genera falsa alarma al usuario), pero limita cuánto
  de "autónomo e inteligente" puede parecer el motor local fuera de esas 7
  categorías.
- **Sin tests automatizados para `SerializerSystem`**: el Test Framework V401
  solo cubre `localHeuristicUnderstanding`. La corrección de los 5 adapters
  se verificó manualmente en el navegador, no queda como regresión
  automática si alguien vuelve a romperlos.
