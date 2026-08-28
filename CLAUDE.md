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

`index.html`: **Universal Semantic Task Compiler**, aplicación de una sola
página (HTML/CSS/JS sin dependencias) que convierte una petición en
lenguaje natural en un contrato de ejecución canónico orientado a
objetivos. Ver `README.md` para más detalle.

`recetas-asados-guisos-cazuela-barro.html`: página independiente de una
sola pieza (HTML/CSS/JS sin dependencias) con una colección de recetas
para horno de gas tipo Fontana Maestro — asados y guisos en cazuela de
barro, y también panes, masas y pizza (para lo que este tipo de horno está
más pensado). No mezcles el código de este archivo con el de `index.html`:
son dos proyectos independientes que conviven en el mismo repositorio.

`versiones/`: carpeta de snapshots de versiones anteriores de `index.html`.
No es necesario mantener snapshots equivalentes para el archivo de
recetas salvo que el usuario lo pida.
