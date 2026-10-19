// Expresiones regulares → AFN-ε (construcción de Thompson).
// Sintaxis, la de clase: símbolos de un carácter, | o + (unión), * (cierre),
// ⁺ (clausura positiva), ? (opcional), paréntesis, ε y ∅. La concatenación es
// la yuxtaposición; también se admite el punto centrado · y los espacios se
// ignoran. Sirve para los lenguajes de referencia y para corregir las
// expresiones que escribe el alumno.

import { Automata, EPS, Transicion, VACIO } from './tipos';

export const MAS = '⁺';

export type Nodo = (
  | { t: 'sim'; s: string }
  | { t: 'eps' }
  | { t: 'vacio' }
  | { t: 'alt'; a: Nodo; b: Nodo }
  | { t: 'cat'; a: Nodo; b: Nodo }
  | { t: 'star'; a: Nodo }
  | { t: 'plus'; a: Nodo }
  | { t: 'opt'; a: Nodo }
) & { par?: boolean }; // par: venía entre paréntesis

/** Error de sintaxis con la posición (en caracteres del texto original) donde se detecta. */
export class ErrorER extends Error {
  constructor(
    mensaje: string,
    public pos: number,
  ) {
    super(mensaje);
  }
}

const UNION = new Set(['|', '+']);
const POSTFIJO = new Set(['*', '?', MAS]);

export function parsearER(er: string): Nodo {
  // Se guarda la posición original de cada carácter útil para señalar los errores.
  const txt: string[] = [];
  const pos: number[] = [];
  [...er].forEach((c, k) => {
    if (/\s/.test(c) || c === '·') return;
    txt.push(c);
    pos.push(k);
  });
  let i = 0;
  const ver = () => txt[i];
  const aqui = () => (i < pos.length ? pos[i] : er.length);

  function alt(): Nodo {
    let n = cat();
    while (ver() !== undefined && UNION.has(ver())) {
      i++;
      n = { t: 'alt', a: n, b: cat() };
    }
    return n;
  }
  function cat(): Nodo {
    let n: Nodo | null = null;
    while (i < txt.length && !UNION.has(ver()) && ver() !== ')') {
      const r = rep();
      n = n ? { t: 'cat', a: n, b: r } : r;
    }
    if (!n) {
      const c = ver();
      throw new ErrorER(
        c === undefined ? 'Falta una expresión al final.' : c === ')' ? 'Falta una expresión antes de «)».' : `Falta una expresión antes de «${c}».`,
        aqui(),
      );
    }
    return n;
  }
  function rep(): Nodo {
    let n = atomo();
    while (ver() !== undefined && POSTFIJO.has(ver())) {
      const c = ver();
      n = c === '*' ? { t: 'star', a: n } : c === '?' ? { t: 'opt', a: n } : { t: 'plus', a: n };
      i++;
    }
    return n;
  }
  function atomo(): Nodo {
    const c = ver();
    if (c === '(') {
      const abre = aqui();
      i++;
      const n = alt();
      if (ver() !== ')') throw new ErrorER('Hay un «(» sin cerrar.', abre);
      i++;
      return { ...n, par: true };
    }
    if (c !== undefined && POSTFIJO.has(c)) throw new ErrorER(`«${c}» no se aplica a nada: va detrás de una expresión.`, aqui());
    i++;
    if (c === EPS) return { t: 'eps' };
    if (c === VACIO || c === 'Ø' || c === 'ø') return { t: 'vacio' };
    return { t: 'sim', s: c };
  }
  if (txt.length === 0) throw new ErrorER('La expresión está vacía. Para la palabra vacía escribe ε.', 0);
  const n = alt();
  if (i !== txt.length) throw new ErrorER(ver() === ')' ? 'Sobra un «)».' : 'Expresión mal formada.', aqui());
  return n;
}

/** Símbolos que aparecen en la expresión. */
export function simbolosDe(n: Nodo, res = new Set<string>()): Set<string> {
  if (n.t === 'sim') res.add(n.s);
  if ('a' in n) simbolosDe(n.a, res);
  if ('b' in n) simbolosDe(n.b, res);
  return res;
}

export function nodoAAutomata(raiz: Nodo, alfabeto: string[]): Automata {
  const trans: [number, string, number][] = [];
  let n = 0;
  const nuevo = () => n++;
  function construir(x: Nodo): [number, number] {
    const i = nuevo();
    const f = nuevo();
    switch (x.t) {
      case 'sim':
        trans.push([i, x.s, f]);
        break;
      case 'eps':
        trans.push([i, EPS, f]);
        break;
      case 'vacio':
        break;
      case 'alt': {
        const [a1, a2] = construir(x.a);
        const [b1, b2] = construir(x.b);
        trans.push([i, EPS, a1], [i, EPS, b1], [a2, EPS, f], [b2, EPS, f]);
        break;
      }
      case 'cat': {
        const [a1, a2] = construir(x.a);
        const [b1, b2] = construir(x.b);
        trans.push([i, EPS, a1], [a2, EPS, b1], [b2, EPS, f]);
        break;
      }
      case 'star':
      case 'plus': {
        const [a1, a2] = construir(x.a);
        trans.push([i, EPS, a1], [a2, EPS, a1], [a2, EPS, f]);
        if (x.t === 'star') trans.push([i, EPS, f]);
        break;
      }
      case 'opt': {
        const [a1, a2] = construir(x.a);
        trans.push([i, EPS, a1], [a2, EPS, f], [i, EPS, f]);
        break;
      }
    }
    return [i, f];
  }
  const [ini, fin] = construir(raiz);
  const transiciones: Transicion[] = trans.map(([p, s, q], k) => ({ id: `e${k}`, de: `n${p}`, a: `n${q}`, simbolos: [s] }));
  return {
    alfabeto: [...alfabeto],
    estados: [...Array(n).keys()].map((k) => ({
      id: `n${k}`,
      nombre: `n${k}`,
      x: 0,
      y: 0,
      inicial: k === ini,
      final: k === fin,
    })),
    transiciones,
  };
}

export function erAAutomata(er: string, alfabeto: string[]): Automata {
  return nodoAAutomata(parsearER(er), alfabeto);
}

// ------------------------------------------------------------ estructura y paréntesis

const atomico = (n: Nodo) => n.t === 'sim' || n.t === 'eps' || n.t === 'vacio';
const postfijo = (n: Nodo) => n.t === 'star' || n.t === 'plus' || n.t === 'opt';

/** Forma canónica de la estructura, sin paréntesis y con la concatenación y la unión aplanadas. */
export function forma(n: Nodo): string {
  const hojas = (x: Nodo, t: 'cat' | 'alt'): Nodo[] => (x.t === t ? [...hojas(x.a, t), ...hojas(x.b, t)] : [x]);
  switch (n.t) {
    case 'sim':
      return n.s;
    case 'eps':
      return EPS;
    case 'vacio':
      return VACIO;
    case 'cat':
      return `cat(${hojas(n, 'cat').map(forma).join(',')})`;
    case 'alt':
      return `alt(${hojas(n, 'alt').map(forma).join(',')})`;
    default:
      return `${n.t}(${forma(n.a)})`;
  }
}

/**
 * Subexpresiones que, para que la expresión diga sin ambigüedad a qué se aplica
 * cada operador, tienen que ir entre paréntesis y no van. Es el criterio de las
 * soluciones de clase: (ab) | (c(d*)) y ((ab) | c)* d. Una operación postfija
 * cuyo operando ya va entre paréntesis se delimita sola y no hace falta envolverla.
 */
export function sinParentesis(raiz: Nodo): string[] {
  const res: string[] = [];
  const visitar = (n: Nodo, padre: Nodo | null) => {
    const hijos = 'b' in n ? [n.a, n.b] : 'a' in n ? [n.a] : [];
    // Dentro de una cadena de concatenaciones o uniones del mismo tipo no hacen falta paréntesis intermedios.
    const mismaCadena = padre && padre.t === n.t && (n.t === 'cat' || n.t === 'alt') && !n.par;
    const exige = padre && !mismaCadena && !atomico(n) && !(postfijo(n) && !atomico((n as { a: Nodo }).a));
    if (exige && !n.par) res.push(mostrar(n));
    hijos.forEach((h) => visitar(h, n));
  };
  visitar(raiz, null);
  return res;
}

/** La expresión escrita con los paréntesis mínimos. */
export function mostrar(n: Nodo): string {
  const prec = (x: Nodo) => (x.t === 'alt' ? 1 : x.t === 'cat' ? 2 : 3);
  const envolver = (x: Nodo, min: number) => (prec(x) < min ? `(${mostrar(x)})` : mostrar(x));
  switch (n.t) {
    case 'sim':
      return n.s;
    case 'eps':
      return EPS;
    case 'vacio':
      return VACIO;
    case 'alt':
      return `${mostrar(n.a)} | ${mostrar(n.b)}`;
    case 'cat':
      return `${envolver(n.a, 2)}${envolver(n.b, 2)}`;
    case 'star':
      return `${envolver(n.a, 3)}*`;
    case 'plus':
      return `${envolver(n.a, 3)}${MAS}`;
    case 'opt':
      return `${envolver(n.a, 3)}?`;
  }
}
