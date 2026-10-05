// Expresiones regulares mínimas → AFN-ε (construcción de Thompson).
// Sintaxis: símbolos de un carácter, | (unión), * (cierre), ? (opcional),
// paréntesis y ε. La concatenación es la yuxtaposición. Sirve para escribir
// los lenguajes de referencia de los ejercicios y, más adelante, para el bloque 2.

import { Automata, EPS, Transicion } from './tipos';

type Nodo =
  | { t: 'sim'; s: string }
  | { t: 'eps' }
  | { t: 'alt'; a: Nodo; b: Nodo }
  | { t: 'cat'; a: Nodo; b: Nodo }
  | { t: 'star'; a: Nodo }
  | { t: 'opt'; a: Nodo };

export function parsearER(er: string): Nodo {
  const txt = er.replace(/\s+/g, '');
  let i = 0;
  const ver = () => txt[i];
  function alt(): Nodo {
    let n = cat();
    while (ver() === '|') {
      i++;
      n = { t: 'alt', a: n, b: cat() };
    }
    return n;
  }
  function cat(): Nodo {
    let n: Nodo | null = null;
    while (i < txt.length && ver() !== '|' && ver() !== ')') {
      const r = rep();
      n = n ? { t: 'cat', a: n, b: r } : r;
    }
    return n ?? { t: 'eps' };
  }
  function rep(): Nodo {
    let n = atomo();
    while (ver() === '*' || ver() === '?') {
      n = ver() === '*' ? { t: 'star', a: n } : { t: 'opt', a: n };
      i++;
    }
    return n;
  }
  function atomo(): Nodo {
    const c = ver();
    if (c === '(') {
      i++;
      const n = alt();
      if (ver() !== ')') throw new Error(`Falta ')' en ${er}`);
      i++;
      return n;
    }
    if (c === undefined || c === '*' || c === '?') throw new Error(`ER mal formada: ${er}`);
    i++;
    return c === EPS ? { t: 'eps' } : { t: 'sim', s: c };
  }
  const n = alt();
  if (i !== txt.length) throw new Error(`ER mal formada: ${er}`);
  return n;
}

export function erAAutomata(er: string, alfabeto: string[]): Automata {
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
      case 'star': {
        const [a1, a2] = construir(x.a);
        trans.push([i, EPS, a1], [a2, EPS, a1], [a2, EPS, f], [i, EPS, f]);
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
  const [ini, fin] = construir(parsearER(er));
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
