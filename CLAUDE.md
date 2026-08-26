# Instrucciones para Claude Code en este repositorio

## Modo económico por defecto

Por defecto, trabaja de forma económica en tokens y llamadas a herramientas:

- Lee solo los archivos o fragmentos que realmente necesites para la tarea,
  no el repo entero "por si acaso".
- Agrupa verificaciones relacionadas en vez de comprobar de una en una.
- No lances subagentes (Agent/Task) para cosas que puedes resolver
  directamente con Read/Grep/Glob/Bash en pocos pasos.
- No repitas lecturas de un archivo que ya has leído en la misma sesión
  salvo que haya cambiado.
- Prioriza respuestas y cambios concisos frente a explicaciones largas o
  documentación no pedida.

## Excepción: profundidad cuando importa

Esta economía nunca debe sacrificar corrección. Si una tarea es compleja,
ambigua, afecta a varios archivos, toca seguridad/datos del usuario, o el
usuario indica que quiere una verificación exhaustiva, deja el modo
económico de lado para esa tarea: lee lo que haga falta, verifica a fondo,
usa subagentes si aporta valor real. Vuelve al modo económico en cuanto esa
tarea concreta esté resuelta.

El usuario puede pedir explícitamente "modo completo" o "sin restricciones"
para una tarea puntual; en ese caso, ignora la economía por defecto para esa
tarea.

## Sobre este repositorio

Este repositorio contiene un único proyecto de una sola página (HTML/CSS/JS
sin dependencias ni backend):

- `index.html` (raíz): **Universal Semantic Task Compiler** — convierte
  peticiones en lenguaje natural en contratos de ejecución. Ver `README.md`.

Si en el futuro se añade otro proyecto independiente aquí, debe vivir en su
propia carpeta claramente identificada; no mezclar código de proyectos
distintos en el mismo archivo salvo que se indique lo contrario.
