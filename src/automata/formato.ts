// Lectura y escritura de autómatas en el formato de texto de las prácticas:
//
//   inicial q0
//   finales q14 q16 q18
//   q0 a q1
//   q0 b q2
//
// Una transición por línea, lo que va tras # se ignora y los nombres de los
// estados no llevan espacios. Para las transiciones vacías se acepta ε, eps o
// epsilon, y al escribir se usa eps.

import { colocar } from './nucleo';
import { Automata, EPS, Estado, Transicion } from './tipos';

const VACIAS = new Set([EPS, 'eps', 'epsilon']);

/** Nombre sin espacios y distinto de los ya usados. */
function nombreLimpio(nombre: string, usados: Set<string>): string {
  const base = nombre.trim().replace(/\s+/g, '_') || 'q';
  let n = base;
  for (let i = 2; usados.has(n); i++) n = `${base}_${i}`;
  usados.add(n);
  return n;
}

/** Estados en orden de recorrido en anchura desde los iniciales; los inalcanzables, al final. */
function ordenAnchura(a: Automata): Estado[] {
  const vistos = new Set<string>();
  const cola = a.estados.filter((q) => q.inicial).map((q) => q.id);
  cola.forEach((id) => vistos.add(id));
  for (let i = 0; i < cola.length; i++) {
    const salientes = a.transiciones
      .filter((t) => t.de === cola[i])
      .sort((x, y) => a.alfabeto.indexOf(x.simbolos[0]) - a.alfabeto.indexOf(y.simbolos[0]));
    for (const t of salientes)
      if (!vistos.has(t.a)) {
        vistos.add(t.a);
        cola.push(t.a);
      }
  }
  const porId = new Map(a.estados.map((q) => [q.id, q]));
  return [...cola.map((id) => porId.get(id)!), ...a.estados.filter((q) => !vistos.has(q.id))];
}

export function aTexto(a: Automata): string {
  const orden = ordenAnchura(a);
  const usados = new Set<string>();
  const nombre = new Map(orden.map((q) => [q.id, nombreLimpio(q.nombre, usados)]));
  const simbolos = [...a.alfabeto, EPS];
  const lineas = [
    `inicial ${orden.filter((q) => q.inicial).map((q) => nombre.get(q.id)).join(' ')}`.trimEnd(),
    `finales ${orden.filter((q) => q.final).map((q) => nombre.get(q.id)).join(' ')}`.trimEnd(),
  ];
  for (const q of orden)
    for (const s of simbolos)
      for (const t of a.transiciones)
        if (t.de === q.id && t.simbolos.includes(s))
          lineas.push(`${nombre.get(q.id)} ${s === EPS ? 'eps' : s} ${nombre.get(t.a)}`);
  return lineas.join('\n') + '\n';
}

// Lienzo del editor (ANCHO × ALTO en Editor.tsx) y radio de los estados (R en Dibujo.tsx).
const ANCHO = 900;
const ALTO = 440;
const R = 24;

/** Coloca por capas según la distancia desde el inicial; si no caben, en rejilla. */
function disponer(nombres: string[], inicio: string[], trans: [string, string, string][]) {
  if (nombres.length <= 8) return colocar(nombres, ANCHO, ALTO);
  const distancia = new Map<string, number>(inicio.map((q) => [q, 0]));
  const cola = [...inicio];
  for (let i = 0; i < cola.length; i++)
    for (const [de, , a] of trans)
      if (de === cola[i] && !distancia.has(a)) {
        distancia.set(a, distancia.get(de)! + 1);
        cola.push(a);
      }
  const resto = Math.max(0, ...distancia.values()) + 1;
  const capas: string[][] = [];
  for (const q of nombres) (capas[distancia.get(q) ?? resto] ??= []).push(q);
  const llenas = capas.filter(Boolean);
  const margen = R + 16;
  const filas = Math.max(...llenas.map((c) => c.length));
  const caben = (ANCHO - 2 * margen) / Math.max(1, llenas.length - 1) >= 2.4 * R && (ALTO - 2 * margen) / Math.max(1, filas - 1) >= 2.4 * R;
  const pos = new Map<string, { x: number; y: number }>();
  if (caben) {
    const dx = (ANCHO - 2 * margen) / Math.max(1, llenas.length - 1);
    llenas.forEach((capa, i) => {
      const dy = Math.min(110, (ALTO - 2 * margen) / Math.max(1, filas - 1));
      capa.forEach((q, j) => pos.set(q, { x: margen + i * dx, y: ALTO / 2 + (j - (capa.length - 1) / 2) * dy }));
    });
  } else {
    const orden = llenas.flat();
    const cols = Math.ceil(Math.sqrt(orden.length * (ANCHO / ALTO)));
    const nf = Math.ceil(orden.length / cols);
    const dx = (ANCHO - 2 * margen) / Math.max(1, cols - 1);
    const dy = (ALTO - 2 * margen) / Math.max(1, nf - 1);
    orden.forEach((q, i) => pos.set(q, { x: margen + (i % cols) * dx, y: margen + Math.floor(i / cols) * dy }));
  }
  return nombres.map((q) => pos.get(q)!);
}

export function desdeTexto(texto: string): { automata: Automata } | { error: string } {
  let inicio: string[] | null = null;
  let finales: string[] = [];
  const nombres: string[] = [];
  const conocido = new Set<string>();
  const anotar = (q: string) => {
    if (!conocido.has(q)) {
      conocido.add(q);
      nombres.push(q);
    }
  };
  const trans: [string, string, string][] = [];
  const lineas = texto.split(/\r?\n/);
  for (let i = 0; i < lineas.length; i++) {
    const partes = lineas[i].replace(/#.*/, '').trim().split(/\s+/).filter(Boolean);
    if (!partes.length) continue;
    const [clave, ...resto] = partes;
    if (clave === 'inicial') {
      if (inicio) return { error: `Línea ${i + 1}: «inicial» aparece dos veces.` };
      if (!resto.length) return { error: `Línea ${i + 1}: falta el nombre del estado inicial.` };
      inicio = resto;
      resto.forEach(anotar);
    } else if (clave === 'finales') {
      finales = [...finales, ...resto];
      resto.forEach(anotar);
    } else if (partes.length === 3) {
      const [de, s, a] = partes;
      trans.push([de, VACIAS.has(s) ? EPS : s, a]);
      anotar(de);
      anotar(a);
    } else {
      return { error: `Línea ${i + 1}: no se entiende «${lineas[i].trim()}». Se espera «origen símbolo destino».` };
    }
  }
  if (!inicio) return { error: 'Falta la línea «inicial».' };

  const alfabeto = [...new Set(trans.map(([, s]) => s).filter((s) => s !== EPS))].sort();
  const pos = disponer(nombres, inicio, trans);
  const estados: Estado[] = nombres.map((q, i) => ({
    id: q,
    nombre: q,
    x: Math.round(pos[i].x),
    y: Math.round(pos[i].y),
    inicial: inicio!.includes(q),
    final: finales.includes(q),
  }));
  const mapa = new Map<string, Transicion>();
  for (const [de, s, a] of trans) {
    const k = `${de}→${a}`;
    const t = mapa.get(k);
    if (!t) mapa.set(k, { id: `t_${de}_${a}`, de, a, simbolos: [s] });
    else if (!t.simbolos.includes(s)) t.simbolos.push(s);
  }
  return { automata: { alfabeto: alfabeto.length ? alfabeto : ['a', 'b'], estados, transiciones: [...mapa.values()] } };
}
