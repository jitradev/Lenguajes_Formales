import { Lenguaje } from '../ejercicios/tipos';
import { ErrorER, erAAutomata, Nodo, nodoAAutomata, parsearER, simbolosDe } from './er';
import { aAFD, aceptaAFD, desdeCompacto } from './nucleo';
import { AFD } from './tipos';

/** El lenguaje de referencia de un ejercicio, como AFD total. */
export function afdDeLenguaje(l: Lenguaje, alfabeto: string[]): AFD {
  const m = 'er' in l ? aAFD(erAAutomata(l.er, alfabeto)) : aAFD(desdeCompacto(l.afd));
  if (!l.complemento) return m;
  return { ...m, F: m.F.map((f) => !f) };
}

export type ResultadoER = { ok: true; nodo: Nodo; afd: AFD } | { ok: false; error: string; pos?: number };

/** Compila una expresión escrita por el alumno, con mensajes de error para enseñarle. */
export function compilarER(texto: string, alfabeto: string[]): ResultadoER {
  let nodo: Nodo;
  try {
    nodo = parsearER(texto);
  } catch (e) {
    if (e instanceof ErrorER) return { ok: false, error: e.message, pos: e.pos };
    return { ok: false, error: 'Expresión mal formada.' };
  }
  const fuera = [...simbolosDe(nodo)].filter((s) => !alfabeto.includes(s));
  if (fuera.length)
    return {
      ok: false,
      error: `${fuera.map((s) => `«${s}»`).join(', ')} no ${fuera.length > 1 ? 'son símbolos' : 'es un símbolo'} de Σ = {${alfabeto.join(', ')}}.`,
    };
  return { ok: true, nodo, afd: aAFD(nodoAAutomata(nodo, alfabeto)) };
}

/** AFD de una expresión de referencia (de los ficheros de ejercicios: si falla, es un error nuestro). */
export const afdDeER = (er: string, alfabeto: string[]) => aAFD(erAAutomata(er, alfabeto));

export const enER = (m: AFD, w: string) => aceptaAFD(m, [...w]);

/** Estados desde los que se puede llegar a uno de aceptación. */
function utiles(m: AFD): boolean[] {
  const u = [...m.F];
  for (let cambio = true; cambio; ) {
    cambio = false;
    for (let q = 0; q < m.n; q++) if (!u[q] && m.d[q].some((r) => u[r])) u[q] = cambio = true;
  }
  return u;
}

/** Las primeras palabras del lenguaje en orden de longitud y luego alfabético. */
export function primerasPalabras(m: AFD, cuantas = 8, maxLong = 12): string[] {
  const u = utiles(m);
  const res: string[] = [];
  if (!u[m.inicio]) return res;
  let capa: [number, string][] = [[m.inicio, '']];
  for (let n = 0; n <= maxLong && capa.length && res.length < cuantas; n++) {
    for (const [q, w] of capa) if (m.F[q] && res.length < cuantas) res.push(w);
    const sig: [number, string][] = [];
    for (const [q, w] of capa)
      m.S.forEach((s, i) => {
        const r = m.d[q][i];
        if (u[r] && sig.length < 5000) sig.push([r, w + s]);
      });
    capa = sig;
  }
  return res;
}

/** Longitud de la palabra más corta del lenguaje, o null si es vacío. */
export function longitudMinima(m: AFD): number | null {
  const dist = new Array(m.n).fill(-1);
  dist[m.inicio] = 0;
  const cola = [m.inicio];
  while (cola.length) {
    const q = cola.shift()!;
    if (m.F[q]) return dist[q];
    for (const r of m.d[q]) if (dist[r] < 0) (dist[r] = dist[q] + 1), cola.push(r);
  }
  return null;
}

// ------------------------------------------------------------ lenguajes finitos

/** Orden de las palabras: primero por longitud y luego alfabético. */
export const ordenPalabras = (x: string, y: string) => x.length - y.length || (x < y ? -1 : x > y ? 1 : 0);

const conjunto = (ws: Iterable<string>) => [...new Set(ws)].sort(ordenPalabras);

export const union = (A: string[], B: string[]) => conjunto([...A, ...B]);
export const concatenar = (A: string[], B: string[]) => conjunto(A.flatMap((x) => B.map((y) => x + y)));
export const potencia = (A: string[], n: number): string[] => (n === 0 ? [''] : concatenar(potencia(A, n - 1), A));

/** Las palabras de A* de longitud n como mucho. */
export function cierreHasta(A: string[], n: number): string[] {
  let res = new Set(['']);
  for (let cambio = true; cambio; ) {
    cambio = false;
    for (const x of [...res])
      for (const y of A) {
        const w = x + y;
        if (w.length <= n && !res.has(w)) res.add(w), (cambio = true);
      }
  }
  return conjunto(res);
}

/** ¿w está en A*? Se prueba a partir w en trozos de A. */
export function enCierre(A: string[], w: string): boolean {
  const ok = [true];
  for (let i = 1; i <= w.length; i++) ok[i] = A.some((x) => x.length > 0 && x.length <= i && ok[i - x.length] && w.slice(i - x.length, i) === x);
  return ok[w.length];
}
