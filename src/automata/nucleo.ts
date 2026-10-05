// Algoritmos sobre autómatas finitos: simulación, cierre ε, construcción de
// subconjuntos, accesibles, teorema de Moore / refinamiento de particiones y
// búsqueda de la palabra más corta que distingue dos lenguajes.

import { AFD, Automata, AutomataCompacto, EPS, Estado, Transicion, VACIO } from './tipos';

// ------------------------------------------------------------ construcción

let contador = 0;
export const nuevoId = (p = 'x') => `${p}${Date.now().toString(36)}${(contador++).toString(36)}`;

export function desdeCompacto(c: AutomataCompacto): Automata {
  const estados: Estado[] = c.estados.map(([nombre, x, y, b = '']) => ({
    id: nombre,
    nombre,
    x,
    y,
    inicial: b.includes('i'),
    final: b.includes('f'),
  }));
  const mapa = new Map<string, Transicion>();
  for (const [de, sims, a] of c.trans) {
    const lista = sims.split(',').map((s) => s.trim()).filter(Boolean);
    const k = `${de}→${a}`;
    const t = mapa.get(k);
    if (t) t.simbolos.push(...lista.filter((s) => !t.simbolos.includes(s)));
    else mapa.set(k, { id: `t_${de}_${a}`, de, a, simbolos: lista });
  }
  return { alfabeto: [...c.S], estados, transiciones: [...mapa.values()] };
}

export function copiar(a: Automata): Automata {
  return JSON.parse(JSON.stringify(a));
}

export function vacio(alfabeto: string[]): Automata {
  return { alfabeto: [...alfabeto], estados: [], transiciones: [] };
}

// ------------------------------------------------------------ δ como mapa

export type Delta = Map<string, Map<string, Set<string>>>;

export function delta(a: Automata): Delta {
  const d: Delta = new Map();
  for (const e of a.estados) d.set(e.id, new Map());
  for (const t of a.transiciones) {
    const fila = d.get(t.de);
    if (!fila) continue;
    for (const s of t.simbolos) {
      if (!fila.has(s)) fila.set(s, new Set());
      fila.get(s)!.add(t.a);
    }
  }
  return d;
}

export function nombreDe(a: Automata, id: string): string {
  return a.estados.find((e) => e.id === id)?.nombre ?? id;
}

export function cierre(d: Delta, R: Iterable<string>): Set<string> {
  const res = new Set(R);
  const pila = [...res];
  while (pila.length) {
    const q = pila.pop()!;
    for (const r of d.get(q)?.get(EPS) ?? []) {
      if (!res.has(r)) {
        res.add(r);
        pila.push(r);
      }
    }
  }
  return res;
}

export function mover(d: Delta, R: Iterable<string>, s: string): Set<string> {
  const res = new Set<string>();
  for (const q of R) for (const r of d.get(q)?.get(s) ?? []) res.add(r);
  return res;
}

export function iniciales(a: Automata): string[] {
  return a.estados.filter((e) => e.inicial).map((e) => e.id);
}

// ------------------------------------------------------------ simulación

export interface Paso {
  simbolo: string | null; // null en el paso 0
  estados: Set<string>;
}

/** Traza una palabra. Sirve para AFD y AFN (con ε): en cada paso, el conjunto de estados. */
export function trazar(a: Automata, palabra: string[]): { pasos: Paso[]; acepta: boolean } {
  const d = delta(a);
  let R = cierre(d, iniciales(a));
  const pasos: Paso[] = [{ simbolo: null, estados: R }];
  for (const s of palabra) {
    R = cierre(d, mover(d, R, s));
    pasos.push({ simbolo: s, estados: R });
  }
  const F = new Set(a.estados.filter((e) => e.final).map((e) => e.id));
  return { pasos, acepta: [...R].some((q) => F.has(q)) };
}

/** Parte una palabra escrita por el alumno en símbolos del alfabeto. */
export function partirPalabra(texto: string, alfabeto: string[]): string[] | null {
  const t = texto.trim();
  if (t === '' || t === EPS || t === 'ε' || t === 'eps') return [];
  if (/[\s,]/.test(t)) {
    const trozos = t.split(/[\s,]+/).filter(Boolean);
    return trozos.every((x) => alfabeto.includes(x)) ? trozos : null;
  }
  // símbolos de un carácter o, si los hay más largos, el más largo primero
  const orden = [...alfabeto].sort((x, y) => y.length - x.length);
  const res: string[] = [];
  let i = 0;
  while (i < t.length) {
    const s = orden.find((x) => t.startsWith(x, i));
    if (!s) return null;
    res.push(s);
    i += s.length;
  }
  return res;
}

export const verPalabra = (w: string[]) => (w.length === 0 ? EPS : w.join(''));

// ------------------------------------------------------------ estructura

export interface InformeEstructura {
  iniciales: number;
  simbolosFuera: string[];
  usaEpsilon: boolean;
  noDeterminista: { estado: string; simbolo: string; destinos: string[] }[];
  huecos: { estado: string; simbolo: string }[];
  nombresRepetidos: string[];
  esAFD: boolean; // un inicial, sin ε, sin no determinismo (puede tener huecos)
  total: boolean; // además, sin huecos
}

export function estructura(a: Automata): InformeEstructura {
  const d = delta(a);
  const simbolosFuera = new Set<string>();
  let usaEpsilon = false;
  for (const t of a.transiciones)
    for (const s of t.simbolos) {
      if (s === EPS) usaEpsilon = true;
      else if (!a.alfabeto.includes(s)) simbolosFuera.add(s);
    }
  const noDeterminista: InformeEstructura['noDeterminista'] = [];
  const huecos: InformeEstructura['huecos'] = [];
  for (const e of a.estados) {
    for (const s of a.alfabeto) {
      const dest = d.get(e.id)?.get(s);
      if (!dest || dest.size === 0) huecos.push({ estado: e.nombre, simbolo: s });
      else if (dest.size > 1)
        noDeterminista.push({ estado: e.nombre, simbolo: s, destinos: [...dest].map((x) => nombreDe(a, x)) });
    }
  }
  const vistos = new Set<string>();
  const rep = new Set<string>();
  for (const e of a.estados) {
    if (vistos.has(e.nombre)) rep.add(e.nombre);
    vistos.add(e.nombre);
  }
  const ini = iniciales(a).length;
  const esAFD = ini === 1 && !usaEpsilon && noDeterminista.length === 0 && simbolosFuera.size === 0;
  return {
    iniciales: ini,
    simbolosFuera: [...simbolosFuera],
    usaEpsilon,
    noDeterminista,
    huecos,
    nombresRepetidos: [...rep],
    esAFD,
    total: esAFD && huecos.length === 0,
  };
}

// ------------------------------------------------------------ subconjuntos

const clave = (R: Set<string>, orden: string[]) => orden.filter((q) => R.has(q)).join('|');

export function etiquetaConjunto(R: Iterable<string>, a?: Automata): string {
  const nombres = [...R].map((q) => (a ? nombreDe(a, q) : q));
  if (nombres.length === 0) return VACIO;
  const orden = a ? a.estados.map((e) => e.nombre) : [];
  nombres.sort((x, y) => (a ? orden.indexOf(x) - orden.indexOf(y) : x.localeCompare(y)));
  return `{${nombres.join(',')}}`;
}

export interface FilaSubconjuntos {
  R: Set<string>;
  destinos: Set<string>[]; // uno por símbolo
  acepta: boolean;
}

/**
 * Construcción de subconjuntos con cierre ε. Devuelve la tabla con los conjuntos
 * alcanzables (incluido ∅ si aparece) y el AFD total que resulta.
 */
export function subconjuntos(a: Automata): { filas: FilaSubconjuntos[]; afd: AFD } {
  const d = delta(a);
  const orden = a.estados.map((e) => e.id);
  const F = new Set(a.estados.filter((e) => e.final).map((e) => e.id));
  const S = a.alfabeto;
  const inicio = cierre(d, iniciales(a));
  const indice = new Map<string, number>();
  const conjuntos: Set<string>[] = [];
  const alta = (R: Set<string>) => {
    const k = clave(R, orden);
    if (!indice.has(k)) {
      indice.set(k, conjuntos.length);
      conjuntos.push(R);
    }
    return indice.get(k)!;
  };
  alta(inicio);
  const tabla: number[][] = [];
  for (let i = 0; i < conjuntos.length; i++) {
    tabla.push(S.map((s) => alta(cierre(d, mover(d, conjuntos[i], s)))));
  }
  const acepta = conjuntos.map((R) => [...R].some((q) => F.has(q)));
  const filas = conjuntos.map((R, i) => ({ R, destinos: tabla[i].map((j) => conjuntos[j]), acepta: acepta[i] }));
  return {
    filas,
    afd: { S: [...S], n: conjuntos.length, inicio: 0, F: acepta, d: tabla, etiquetas: conjuntos.map((R) => etiquetaConjunto(R, a)) },
  };
}

/** Cualquier autómata dibujado → AFD total equivalente (si ya es AFD, sale el mismo con el sumidero ∅ si hace falta). */
export function aAFD(a: Automata): AFD {
  return subconjuntos(a).afd;
}

// ------------------------------------------------------------ accesibles y mínimo

export function accesibles(a: Automata): Set<string> {
  const d = delta(a);
  const vistos = new Set(iniciales(a));
  const pila = [...vistos];
  while (pila.length) {
    const q = pila.pop()!;
    for (const dest of d.get(q)?.values() ?? [])
      for (const r of dest)
        if (!vistos.has(r)) {
          vistos.add(r);
          pila.push(r);
        }
  }
  return vistos;
}

/** Clases de equivalencia de estados (refinamiento de particiones) de un AFD interno. */
export function clasesAFD(m: AFD, solo?: number[]): number[] {
  const Q = solo ?? [...Array(m.n).keys()];
  let clase = new Array(m.n).fill(-1);
  for (const q of Q) clase[q] = m.F[q] ? 1 : 0;
  for (;;) {
    const firma = new Map<string, number>();
    const nueva = new Array(m.n).fill(-1);
    for (const q of Q) {
      const f = `${clase[q]}:${m.d[q].map((r) => clase[r]).join(',')}`;
      if (!firma.has(f)) firma.set(f, firma.size);
      nueva[q] = firma.get(f)!;
    }
    const antes = new Set(Q.map((q) => clase[q])).size;
    clase = nueva;
    if (firma.size === antes) return clase;
  }
}

export function alcanzablesAFD(m: AFD): number[] {
  const v = new Set([m.inicio]);
  const pila = [m.inicio];
  while (pila.length) {
    const q = pila.pop()!;
    for (const r of m.d[q])
      if (!v.has(r)) {
        v.add(r);
        pila.push(r);
      }
  }
  return [...v].sort((x, y) => x - y);
}

/** Número de estados del AFD mínimo (total) equivalente a m. */
export function estadosMinimo(m: AFD): number {
  const Q = alcanzablesAFD(m);
  const c = clasesAFD(m, Q);
  return new Set(Q.map((q) => c[q])).size;
}

/**
 * Parejas de estados equivalentes de un AFD dibujado (que debe ser AFD total),
 * limitándose a los estados accesibles, como se hace en clase.
 */
export function paresEquivalentes(a: Automata): [string, string][] {
  const m = aAFDDirecto(a);
  const acc = accesibles(a);
  const ids = a.estados.map((e) => e.id);
  const Q = ids.map((_, i) => i).filter((i) => acc.has(ids[i]));
  const c = clasesAFD(m, Q);
  const res: [string, string][] = [];
  for (let i = 0; i < Q.length; i++)
    for (let j = i + 1; j < Q.length; j++) if (c[Q[i]] === c[Q[j]]) res.push([ids[Q[i]], ids[Q[j]]]);
  return res;
}

/** AFD dibujado (total) → AFD interno respetando los estados tal cual, sin construir subconjuntos. */
export function aAFDDirecto(a: Automata): AFD {
  const ids = a.estados.map((e) => e.id);
  const d = delta(a);
  let sumidero = -1;
  const tabla = ids.map((q) =>
    a.alfabeto.map((s) => {
      const r = [...(d.get(q)?.get(s) ?? [])][0];
      if (r === undefined) {
        if (sumidero < 0) sumidero = ids.length;
        return sumidero;
      }
      return ids.indexOf(r);
    }),
  );
  const F = a.estados.map((e) => e.final);
  const etiquetas = a.estados.map((e) => e.nombre);
  if (sumidero >= 0) {
    tabla.push(a.alfabeto.map(() => sumidero));
    F.push(false);
    etiquetas.push(VACIO);
  }
  const ini = Math.max(0, a.estados.findIndex((e) => e.inicial));
  return { S: [...a.alfabeto], n: tabla.length, inicio: ini, F, d: tabla, etiquetas };
}

// ------------------------------------------------------------ comparar lenguajes

/** Palabra más corta (y la primera en orden del alfabeto) que A acepta y B no. null si no hay. */
export function diferencia(A: AFD, B: AFD): string[] | null {
  const S = A.S;
  const iB = S.map((s) => B.S.indexOf(s));
  const k = (p: number, q: number) => p * (B.n + 1) + q;
  const previo = new Map<number, [number, number, string] | null>();
  const cola: [number, number][] = [[A.inicio, B.inicio]];
  previo.set(k(A.inicio, B.inicio), null);
  while (cola.length) {
    const [p, q] = cola.shift()!;
    if (A.F[p] && !(q < B.n && B.F[q])) {
      const w: string[] = [];
      let cur: [number, number] = [p, q];
      for (;;) {
        const pr = previo.get(k(cur[0], cur[1]));
        if (!pr) break;
        w.unshift(pr[2]);
        cur = [pr[0], pr[1]];
      }
      return w;
    }
    S.forEach((s, i) => {
      const p2 = A.d[p][i];
      const q2 = q < B.n && iB[i] >= 0 ? B.d[q][iB[i]] : B.n; // B.n = sumidero implícito
      const kk = k(p2, q2);
      if (!previo.has(kk)) {
        previo.set(kk, [p, q, s]);
        cola.push([p2, q2]);
      }
    });
  }
  return null;
}

export function aceptaAFD(m: AFD, w: string[]): boolean {
  let q = m.inicio;
  for (const s of w) {
    const i = m.S.indexOf(s);
    if (i < 0) return false;
    q = m.d[q][i];
  }
  return m.F[q];
}

export interface Comparacion {
  /** Palabra que el alumno acepta y no debería (null: es correcto). */
  sobra: string[] | null;
  /** Palabra que debería aceptar y no acepta (null: es completo). */
  falta: string[] | null;
}

export function comparar(alumno: AFD, referencia: AFD): Comparacion {
  return { sobra: diferencia(alumno, referencia), falta: diferencia(referencia, alumno) };
}

// ------------------------------------------------------------ disposición automática

/** Coloca en círculo (o en fila si son pocos) los estados de un autómata sin posiciones. */
export function colocar(nombres: string[], ancho = 820, alto = 420): { x: number; y: number }[] {
  const n = nombres.length;
  if (n <= 4) {
    const paso = Math.min(200, (ancho - 160) / Math.max(1, n - 1));
    const x0 = (ancho - paso * (n - 1)) / 2;
    return nombres.map((_, i) => ({ x: x0 + i * paso, y: alto / 2 }));
  }
  const cx = ancho / 2;
  const cy = alto / 2;
  const rx = ancho / 2 - 110;
  const ry = alto / 2 - 80;
  return nombres.map((_, i) => {
    const t = Math.PI + (2 * Math.PI * i) / n;
    return { x: cx + rx * Math.cos(t), y: cy + ry * Math.sin(t) };
  });
}

/** AFD interno → autómata dibujable (para mostrar soluciones). */
export function dibujarAFD(m: AFD, quitarVacio = false): Automata {
  const Q = [...Array(m.n).keys()].filter((q) => !(quitarVacio && m.etiquetas[q] === VACIO));
  const pos = colocar(Q.map((q) => m.etiquetas[q]));
  const estados: Estado[] = Q.map((q, i) => ({
    id: `s${q}`,
    nombre: m.etiquetas[q],
    x: pos[i].x,
    y: pos[i].y,
    inicial: q === m.inicio,
    final: m.F[q],
  }));
  const mapa = new Map<string, Transicion>();
  for (const q of Q)
    m.S.forEach((s, i) => {
      const r = m.d[q][i];
      if (!Q.includes(r)) return;
      const k = `s${q}→s${r}`;
      if (!mapa.has(k)) mapa.set(k, { id: `t${k}`, de: `s${q}`, a: `s${r}`, simbolos: [] });
      mapa.get(k)!.simbolos.push(s);
    });
  return { alfabeto: [...m.S], estados, transiciones: [...mapa.values()] };
}

/** Palabra más corta que distingue dos estados de un AFD dibujado (null si son equivalentes). */
export function distingueEstados(a: Automata, p: string, q: string): string[] | null {
  const m = aAFDDirecto(a);
  const ip = a.estados.findIndex((e) => e.id === p);
  const iq = a.estados.findIndex((e) => e.id === q);
  const A = { ...m, inicio: ip };
  const B = { ...m, inicio: iq };
  const x = diferencia(A, B);
  const y = diferencia(B, A);
  if (!x) return y;
  if (!y) return x;
  return x.length <= y.length ? x : y;
}
