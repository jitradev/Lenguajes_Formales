# Lenguajes Formales · ejercicios interactivos

Aplicación web, **solo frontend** (React + Vite + TypeScript), para que el alumnado resuelva los ejercicios de la asignatura y reciba la corrección al momento. No tiene servidor ni base de datos: el progreso se guarda en el navegador de cada alumno.

## Qué hay (bloque 1)

| Tema | Tipo de ejercicio | Qué comprueba |
|---|---|---|
| 1.1 | **Diseñar** un AFD a partir del enunciado, dibujándolo | Que sea AFD con δ total, que sea **correcto** (no acepta nada que sobre) y **completo** (acepta todo lo que debe), con la palabra más corta que falla en cada caso |
| 1.1 | **Correcto y completo** sobre un autómata dado | Las respuestas sí/no, los contraejemplos del alumno y su versión arreglada |
| 1.2 | **Equivalencia** de dos AFD | La respuesta y que la palabra que los distingue lo haga y sea de las más cortas |
| 1.2 | **Simplificar** | Estados inaccesibles (se marcan sobre el dibujo), parejas de estados equivalentes (si falla, dice qué palabra las distingue) y el AFD mínimo dibujado |
| 1.3 | **Trazar** un AFN y **cierres ε** | Conjunto de estados al terminar, aceptación y E(R) |
| 1.3 | **AFN → AFD** | La tabla de subconjuntos casilla a casilla (incluida la fila ∅), el AFD dibujado y, si se pide, el número de estados del mínimo |

Los ejercicios son los de las tandas de práctica de cada tema (1.1 y extra, 1.2 y 1.3) con los mismos autómatas y enunciados. Además hay un **laboratorio** con lienzo libre, probador de palabras y tabla δ.

### El editor

- Herramientas: **Mover** (M), **Estado** (E), **Transición** (T), **Borrar** (B).
- Transición: arrastrar de un estado a otro, o pulsar uno y luego el otro; pulsar dos veces el mismo estado hace un bucle. Los símbolos se eligen con los botones o con el teclado.
- Doble clic en el lienzo crea un estado; doble clic en un estado lo hace final.
- Ctrl+Z / Ctrl+Shift+Z para deshacer y rehacer; Supr borra lo seleccionado.
- El probador traza una palabra paso a paso y resalta en el dibujo los estados activos (sirve también para AFN).

## Desarrollo

```bash
pnpm install
pnpm dev       # http://localhost:5173
pnpm test      # comprueba los algoritmos y que cada lenguaje de referencia es el del enunciado
pnpm build     # genera dist/
```

## Publicar en Vercel

1. Subir esta carpeta a un repositorio de GitHub (el `.gitignore` ya excluye `node_modules` y `dist`).
2. En Vercel, *Add New Project* e importar el repositorio. Detecta Vite solo; `vercel.json` fija `pnpm build` y la carpeta `dist`.
3. Las rutas van con `#` (`/#/ej/1.1-06`), así que no hace falta configurar reescrituras.

## Cómo añadir ejercicios

Los ejercicios están en `src/ejercicios/bloque1/tema1X.ts`. Cada uno es un objeto con `tipo`, `enunciado` y los datos del tipo. Los autómatas se escriben en forma compacta:

```ts
dado: {
  S: ['a', 'b'],
  estados: [['q0', 110, 150, 'i'], ['q1', 310, 150, 'f']],   // nombre, x, y, banderas (i = inicial, f = final)
  trans: [['q0', 'a', 'q1'], ['q1', 'a, b', 'q1'], ['q0', 'ε', 'q1']],
}
```

En los de **diseñar**, el lenguaje correcto se da con una expresión regular (`{ er: '(0|1)*01' }`, con `|`, `*`, `?` y `ε`), con un AFD de referencia (`{ afd: ... }`) o con el complemento de cualquiera de los dos (`complemento: true`). Al añadir uno, conviene añadir su predicado en `src/automata/nucleo.test.ts` para que `pnpm test` compruebe que la referencia es la buena.

## Bloques 2 y 3

`src/ejercicios/registro.ts` ya tiene los bloques 2 y 3 como «próximamente». Para activarlos:

1. Añadir los tipos nuevos en `src/ejercicios/tipos.ts` (por ejemplo, «escribe la ER de este lenguaje» o «deriva esta palabra con la gramática»).
2. Crear su vista en `src/vistas/tipos/` y enlazarla en `src/vistas/EjercicioPagina.tsx`.
3. Crear `src/ejercicios/bloque2/...` y marcar el bloque como `disponible: true`.

El motor ya tiene lo necesario para el bloque 2: `src/automata/er.ts` convierte una expresión regular en AFN-ε (Thompson) y `nucleo.ts` lo pasa a AFD y compara lenguajes, así que corregir una ER escrita por el alumno es comparar su AFD con el de referencia.

## Limitaciones conocidas

- Al ser todo frontend, las soluciones viajan en el JavaScript. Un alumno con conocimientos podría encontrarlas; para prácticas no importa, para evaluar habría que moverlas a un servidor.
- El progreso es por navegador: si el alumno cambia de ordenador, empieza de cero.
- No hay tabla de Moore interactiva todavía: en equivalencia se corrige la conclusión y el contraejemplo, no la tabla.
