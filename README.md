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

- **ID de modelo de IA inválido**: `aiUnderstanding` llamaba a la API con
  `model: "claude-sonnet-4-6"`, que no existe. Cada llamada fallaba y el
  pipeline caía silenciosamente al motor local (comportamiento correcto por
  diseño, pero la ruta de IA real nunca llegaba a ejecutarse aunque el
  usuario pusiera su key). Corregido a `claude-sonnet-5`.

### Nota de contexto de despliegue (2026-08-25)

En el entorno donde se usa habitualmente esta herramienta, la red está
siempre disponible. Se evaluó cambiar el motor por defecto de local a IA
(con la key recordada entre sesiones) para aprovecharlo, pero se decidió
**mantener el diseño local-first actual sin cambios de comportamiento**: la
API de Anthropic es de pago por uso (no hay plan gratuito de volumen), y el
motor local ya cumple el objetivo del proyecto sin ese coste ni la
dependencia de red. La vía de IA real sigue existiendo tal cual (opt-in,
pegando una API key en "Avanzado") y ahora al menos funciona correctamente
tras el fix del ID de modelo — por si se decide reabrir esta opción más
adelante.

### Corregido (bucle de mejora continua, v405-v409)

- **Taxonomía de dominio ampliada** de 7 a 11 categorías: + legal, salud,
  finanzas, industrial/mecánica — con subobjetivos, capacidades y objetivo
  inferido propios. Sigue habiendo materias fuera de la taxonomía (cocina,
  jardinería...), pero ya no penaliza al usuario por ello (check informativo,
  no bloqueante).
- **`hasAnalysis` nunca tenía sus propios subobjetivos ni capacidades**
  (bug desde v401): una petición de puro análisis ("analiza", "revisa"...)
  se quedaba con solo 3 subobjetivos genéricos y la fase `ANALYZE_OR_DESIGN`
  del contrato salía vacía. Corregido.
- **`hasFormato` confundía "el documento" (objeto a analizar) con una
  petición de formato de salida** ("un informe"): ahora solo cuenta como
  formato pedido si va con artículo indefinido, el patrón real de "quiero un
  X".
- **ID de modelo de IA inválido**: `aiUnderstanding` llamaba a la API con
  `model: "claude-sonnet-4-6"`, que no existe. Corregido a `claude-sonnet-5`.
- **Nombre de capacidad inconsistente**: `hasAnalysis` generaba
  `RISK_ASSESSMENT`, pero `DefinitionOfDoneEngine` solo reacciona a
  `RISK_ANALYSIS` — las peticiones de análisis nunca activaban el criterio de
  "riesgos identificados explícitamente" pese a tener esa capacidad.
  Unificado a `RISK_ANALYSIS`.
- **`hasEjemplos` (falso positivo de alto impacto)**: la palabra suelta
  "como" — una de las más comunes del español (verbo comer, comparativo,
  "cómo" sin tilde) — se interpretaba como "el usuario dio un ejemplo",
  ocultando indebidamente la pregunta por una referencia real. Ahora exige
  "como el/la/los/las/un/una" (patrón real de "algo como X").
- **`hasAudiencia` demasiado estrecha**: solo reconocía "para
  (mi/un/niños/...)". Ahora también reconoce "dirigido a", "orientado a",
  "audiencia:", "público:".
- **Petición de aprendizaje sin entregable propio**: caía en el fallback
  genérico "Informe / Recomendación estructurada" — tono equivocado para
  "explícame cómo funciona X". Ahora usa "Explicación clara / Guía
  didáctica".
- **Sin tests automatizados para `SerializerSystem`**: añadidos tests que
  verifican XML bien formado (con caracteres especiales) y cobertura
  completa de secciones en AKI.
- **El campo de petición traía un valor de ejemplo precargado real** (no un
  placeholder), con riesgo de que el usuario mezclara su texto con el
  ejemplo. Movido a `placeholder`, `<textarea>` vacío por defecto.
- **Los campos "Artefacto Técnico Base" y "Artefacto Modificado" (v1/v2) no
  hacían nada**: `compilarV401` recibía `artifactText`/`modifiedText` como
  parámetros pero nunca los usaba — el usuario podía pegar código base y
  modificado esperando una comparación, y el contrato los ignoraba en
  silencio. Ahora, si hay ambos, se añade un subobjetivo/capacidad de
  comparación de diff (`DIFF_ANALYSIS`) y el contenido aparece en el
  contrato serializado (todos los adapters salvo `LOCAL`, que solo declara
  su presencia por ser el formato compacto); si solo hay base, se activa
  comprensión de código base (`CODE_COMPREHENSION`).

Verificado en cada fix con el Test Framework V401 (33/33 tests) y pruebas
manuales en el navegador.

### Corregido (bucle de mejora continua, v410)

- **`escXml` no escapaba comillas** pero se usa para valores de ATRIBUTO XML
  (`primary_goal="..."`) — con el motor local nunca se disparaba (los
  `inferredGoal` fijos no llevan comillas), pero con el motor de IA (ya
  funcional tras el fix del ID de modelo) un objetivo generado por el LLM
  con comillas habría producido XML malformado. Ahora escapa `"` y `'`
  también.
- **Vallas de código Markdown de longitud fija** para los artefactos
  técnicos: si el propio artefacto pegado ya contenía una secuencia de 3+
  backticks, la valla se cerraba antes de tiempo y rompía el formato. Ahora
  usa una valla más larga que la mayor racha de backticks presente en el
  contenido (convención estándar de Markdown).
- **La API key no se borraba del campo tras compilar**: `wizard.html` sí lo
  hacía (defensa en profundidad), `index.html` no, quedando inconsistente.
  Unificado.

Verificado con el Test Framework V401 (36/36 tests) y pruebas manuales
(incluida la limpieza del campo de API key tras compilar).

### Corregido (bucle de mejora continua, v411)

- **`hasSoftware` nunca reconocía conjugaciones de "programar"/"gestionar"**
  (mismo bug que v404 corrigió en otros dominios, pero nunca se aplicó aquí):
  una petición tan directa como "quiero programar una calculadora" no
  activaba el dominio software en absoluto — cero subobjetivos ni
  capacidades específicas de software. Corregido, junto con el mismo tipo de
  gap en `hasLegal` ("denuncia"→"denunciar") y `hasFinanzas`
  ("ahorrar"→"ahorro").

Verificado con el Test Framework V401 (39/39 tests) y prueba manual directa
del caso reportado ("programar una calculadora").

### Pendiente (detectado pero no corregido aún)

- **Gaps de conjugación menores y de menor impacto** identificados pero no
  corregidos por baja prioridad (tienen señales redundantes en la mayoría de
  peticiones reales, a diferencia del caso de `hasSoftware`): `hasLearning`
  usa "entender" en infinitivo (no cubre "entiendo"/"entiende", verbo
  irregular); `hasHardwareSystem` usa "control" (no cubre
  "controla"/"controlando").
- **`hasLegal` puede activarse por el sentido técnico de "contrato"** (p. ej.
  "el contrato de la función debe validar el input", terminología de
  diseño por contrato) en vez del sentido legal — aditivo, no bloqueante
  (en el peor caso añade un subobjetivo/capacidad legal irrelevante junto a
  los correctos), así que no se ha priorizado.

### Corregido (bucle de mejora continua, v412)

- **`OutcomeContractEngine` calculaba un `completionCriteria` que ningún
  serializador ni vista de depuración leía nunca** (código muerto desde al
  menos v401), y cuyo contenido duplicaba en espíritu lo que
  `DefinitionOfDoneEngine.completionCriteria` ya expone en la sección 6 del
  contrato. Eliminado.

Verificado con el Test Framework V401 (40/40 tests) y compilación manual
completa (secciones de éxito/entregables intactas).

### Corregido (bucle de mejora continua, v413)

- **T-04 ("Anti-Shallowness Enforcer") era un test tautológico**:
  `DefinitionOfDoneEngine` siempre devuelve al menos 3 criterios base
  incondicionalmente, así que la aserción original (`completionCriteria.length
  > 0`) era cierta para *cualquier* compilación exitosa — no podía fallar
  pasara lo que pasara, el mismo antipatrón que el propio código critica en
  `AdversarialValidationEngine` (fix v401). Ahora verifica de verdad que se
  añaden criterios específicos de dominio (comprobado: con la petición
  original la aserción vieja pasaba incluso para una petición de
  planificación sin relación con comparaciones; la nueva la distingue
  correctamente).

### Corregido (bucle de mejora continua, v414 — primera pasada con pruebas de tema aleatorio)

A partir de esta iteración, la verificación de cada pasada del bucle incluye
compilar con varias peticiones de temas variados (no solo el caso puntual
del fix), para detectar huecos en toda la superficie de dominios. Esta
primera pasada con el método nuevo encontró dos bugs reales de inmediato:

- **`hasIndustrial` no reconocía "el coche no arranca"**, la forma más
  natural y común de describir una avería — solo cubría frases más técnicas
  ("motor diésel", "avería mecánica"...). Con la petición real de prueba
  ("Es urgente, mi coche no arranca...") solo se detectaba "viaje"
  (planificación), ignorando por completo el problema mecánico.
- **`hasLegal` no reconocía "despiden"**, conjugación irregular de
  "despedir" (raíz cambia entre desped-/despid- según la forma) — solo
  "despido" sin comodín. Una pregunta tan directa como "¿Cuáles son mis
  derechos si me despiden sin previo aviso?" no activaba el dominio legal en
  absoluto.

Verificado con el Test Framework V401 (42/42 tests) y una batería de ~19
peticiones de temas variados (bricolaje, música, telefonía, presentaciones,
legal, finanzas, jardinería, deporte, diseño, mascotas, negocio...) sin
errores ni resultados inesperados salvo los dos corregidos.

### Corregido (bucle de mejora continua, v415)

- **`hasSoftware` no reconocía "app"** — la forma coloquial de "aplicación",
  más habitual todavía que la formal en el habla cotidiana. Encontrado con
  una petición multi-dominio ("Necesito un contrato de arrendamiento y una
  app que lleve la contabilidad del alquiler"): solo se detectaba el
  dominio legal, la parte de software quedaba completamente ignorada.
  Verificado que no introduce falsos positivos con palabras parecidas
  ("aprender", "apoyo", "apto").

Verificado con el Test Framework V401 (43/43 tests), el caso multi-dominio
real, y una batería adicional de ~15 peticiones (incluyendo casos límite:
un solo carácter, solo espacios, texto sin sentido) sin errores.

### Corregido (bucle de mejora continua, v416)

Una misma batería de pruebas de tema aleatorio encontró tres huecos
relacionados de detección de dominio:

- **`hasSoftware` no reconocía "Python", "backend", "base de datos" ni
  "web"**: "Quiero automatizar el backend de mi tienda con Python y una
  base de datos" no activaba el dominio software en absoluto pese a ser una
  petición de desarrollo evidente.
- **`hasPurchaseCompare`'s "comprar\\w\*" solo casaba con formas que
  empiezan literalmente por las 7 letras "comprar"** (infinitivo, futuro) —
  las conjugaciones más comunes del día a día (compro, compra, comprando,
  compré...) no coincidían. No se generalizó a "compr\\w\*" a secas porque
  colisionaría con "comprender"/"comprendo" (verificado que la exclusión
  funciona: "no comprendo cómo funciona esto" ya no dispara el dominio de
  compra).
- **`hasWriting` se disparaba con "carta" en el sentido de "carta del
  restaurante" (menú)**, no solo "escribir una carta": la petición de la
  web de un restaurante con "carta y reservas online" se clasificaba como
  encargo de escritura en vez de desarrollo software. Ahora solo cuenta con
  artículo indefinido ("una carta"), mismo criterio ya usado para
  "documento"/"informe".

Verificado con el Test Framework V401 (47/47 tests) y 5 comprobaciones
dirigidas adicionales (incluida la exclusión de "comprender").

### Añadido (v417): motor local multi-idioma

A petición del usuario: "¿sería posible dedicarle un apartado para
introducir idiomas si fuera necesario?". Sin IA no hay comprensión real en
ningún idioma — sigue siendo la misma heurística de palabras clave, ahora
en más de un diccionario.

- **`LANG_PACKS`**: un diccionario por idioma (regex de dominio,
  ingredientes universales de un prompt eficaz, y todos los textos
  generados: objetivo inferido, subobjetivos, asunciones por defecto,
  preguntas pendientes, entregables). El algoritmo
  (`buildUnderstandingFromPack`) está escrito UNA sola vez y es compartido
  por todos los idiomas — añadir un idioma nuevo en el futuro es rellenar
  un `LANG_PACKS.xx` con la misma forma que `es`/`en`, no tocar el motor.
- **Paquete de inglés completo**, con las mismas lecciones ya aprendidas en
  español aplicadas desde el principio (nunca palabra suelta de alto riesgo
  de colisión; verbos irregulares — "buy"→"bought", "write"→"wrote"/
  "written" — cubiertos a mano).
- **Auto-detección de idioma** (`detectLanguage`): cuenta palabras
  funcionales frecuentes de cada paquete (el/la/de... vs the/a/is...); en
  empate o texto vacío gana español, el idioma nativo de la herramienta.
  Selector manual en la UI (Auto-detectar / Español / English) para cuando
  la petición mezcla idiomas o la detección falla.
- **Transparencia**: el idioma usado se declara siempre en el contrato
  (sección 0, junto a la fuente del análisis semántico) en los 5 adapters —
  igual que `source: ai|local`, nunca en silencio.

Verificado con el Test Framework V401 (53/53 tests: 6 tests nuevos cubren
auto-detección ES/EN, selección manual, paridad de dominios industrial/legal
en inglés, y XML válido con contenido en inglés) y una batería mixta de ~15
peticiones en ambos idiomas sin errores.
