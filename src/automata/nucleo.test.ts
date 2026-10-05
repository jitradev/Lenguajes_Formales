import { BLOQUES } from '../ejercicios/registro';
import { EjDisenar } from '../ejercicios/tipos';
import { afdDeLenguaje } from './lenguaje';
import {
  aAFD,
  aceptaAFD,
  accesibles,
  cierre,
  comparar,
  delta,
  desdeCompacto,
  diferencia,
  estadosMinimo,
  estructura,
  paresEquivalentes,
  subconjuntos,
  trazar,
} from './nucleo';

function todas(S: string[], max: number): string[][] {
  const res: string[][] = [[]];
  let capa: string[][] = [[]];
  for (let n = 1; n <= max; n++) {
    capa = capa.flatMap((w) => S.map((s) => [...w, s]));
    res.push(...capa);
  }
  return res;
}

// Los predicados escritos a mano, para comprobar que cada lenguaje de referencia es el del enunciado.
const PRED: Record<string, (w: string) => boolean> = {
  '1.1-04': (w) => w.includes('11'),
  '1.1-06': (w) => w.endsWith('01'),
  '1.1-07': (w) => !w.includes('aa'),
  '1.1-08': (w) => [...w].filter((c) => c === '0').length % 2 === 0 && [...w].filter((c) => c === '1').length % 2 === 1,
  '1.1-10': (w) => (w === '' ? 0 : parseInt(w, 2)) % 3 === 0,
  '1.1-e01': (w) => w.startsWith('ab'),
  '1.1-e02': (w) => w.length === 4,
  '1.1-e03': (w) => w[2] === '1',
  '1.1-e04': (w) => w.includes('aba'),
  '1.1-e05': (w) => !w.includes('ab'),
  '1.1-e06': (w) => w.length >= 2 && w[w.length - 2] === '0',
  '1.1-e07': (w) => w.length > 0 && w[0] === w[w.length - 1],
  '1.1-e08': (w) => w.length % 2 === 0 && w.endsWith('b'),
  '1.1-e09': (w) => /^[l_][ld_]*$/.test(w) && !w.endsWith('_'),
  '1.1-e10': (w) => /^s?d+(\.d+)?$/.test(w),
  '1.1-e11': (w) => [...w].filter((c) => c === 'a').length % 3 === 0,
  '1.1-e12': (w) => w.endsWith('aa') || w.endsWith('bb'),
  '1.1-e13': (w) => w.length % 3 === 0,
  '1.1-e14': (w) => [...w].filter((c) => c === '1').length <= 2,
  '1.1-e15': (w) => !/a(?!b)/.test(w),
  '1.1-e16': (w) => w.endsWith('a'),
  '1.1-e17': (w) => w.length >= 2 && w[0] === '1' && w.endsWith('0'),
  '1.1-e18': (w) => [...w].filter((c) => c === 'a').length === 2,
  '1.1-e19': (w) => [...w].filter((c) => c === '1').length >= 3,
  '1.1-e20': (w) => w.length % 2 === 1,
  '1.1-e21': (w) => w.length <= 3,
  '1.1-e22': (w) => !w.includes('111'),
  '1.1-e23': (w) => w.includes('101'),
  '1.1-e24': (w) => w.endsWith('abb'),
  '1.1-e25': (w) => [...w].filter((c) => c === 'a').length % 2 === 0 && w.endsWith('b'),
  '1.1-e26': (w) => w.length > 0 && w[0] !== w[w.length - 1],
  '1.1-e27': (w) => !w.includes('00') && !w.includes('11'),
  '1.1-e28': (w) => (w === '' ? 0 : parseInt(w, 2)) % 4 === 0,
  '1.1-e29': (w) => (w === '' ? 0 : parseInt(w, 2)) % 3 === 1,
  '1.1-e30': (w) => w.endsWith('1'),
  '1.1-e31': (w) => w === 'ddddlll',
  '1.1-e32': (w) => /^l+@l+(\.l+)+$/.test(w),
  '1.1-e33': (w) => /^(0|d[0d]*)$/.test(w),
  '1.3-08': (w) => w.endsWith('ab'),
  '1.3-15': (w) => w.length >= 3 && w[w.length - 3] === '1',
  '1.3-16': (w) => w.includes('aa') || w.includes('bb'),
  '1.3-28': (w) => w.includes('abab'),
  '1.3-29': (w) => w.endsWith('aa') || w.endsWith('bab'),
  '1.3-30': (w) => w.startsWith('a') || w.endsWith('b'),
};

describe('lenguajes de referencia', () => {
  const ejs = BLOQUES.flatMap((b) => b.temas.flatMap((t) => t.ejercicios)).filter((e): e is EjDisenar => e.tipo === 'disenar');
  for (const e of ejs) {
    it(`${e.id} coincide con su predicado`, () => {
      const p = PRED[e.id];
      expect(p).toBeDefined();
      const m = afdDeLenguaje(e.lenguaje, e.alfabeto);
      for (const w of todas(e.alfabeto, e.alfabeto.length > 2 ? 6 : 9)) expect(aceptaAFD(m, w)).toBe(p(w.join('')));
    });
  }
  it('1.1-09: el autómata dado no es correcto ni completo', () => {
    const e = BLOQUES[0].temas[0].ejercicios.find((x) => x.id === '1.1-09')!;
    if (e.tipo !== 'analizar') throw new Error();
    const c = comparar(aAFD(desdeCompacto(e.dado)), afdDeLenguaje(e.lenguaje, e.dado.S));
    expect(c.sobra).toEqual([]); // ε
    expect(c.falta).not.toBeNull();
  });
  it('1.1-11 y 1.1-12: fallos de los autómatas dados', () => {
    const cmp = (id: string) => {
      const e = BLOQUES[0].temas[0].ejercicios.find((x) => x.id === id)!;
      if (e.tipo !== 'analizar') throw new Error();
      return comparar(aAFD(desdeCompacto(e.dado)), afdDeLenguaje(e.lenguaje, e.dado.S));
    };
    const c11 = cmp('1.1-11');
    expect(c11.sobra).toEqual(['b', 'a']);
    expect(c11.falta).toBeNull();
    const c12 = cmp('1.1-12');
    expect(c12.sobra).toEqual(['a', 'b']);
    expect(c12.falta).not.toBeNull();
    const c13 = cmp('1.1-13');
    expect(c13.sobra).toBeNull();
    expect(c13.falta).toEqual(['a', 'a', 'b']);
    const c14 = cmp('1.1-14');
    expect(c14.sobra).toEqual(['1']);
    expect(c14.falta).not.toBeNull();
    const c15 = cmp('1.1-15');
    expect(c15.sobra).toEqual(['b', 'a']);
    expect(c15.falta).toBeNull();
    const c16 = cmp('1.1-16');
    expect(c16.sobra).toBeNull();
    expect(c16.falta).toEqual(['0', '0', '1']);
    const c17 = cmp('1.1-17');
    expect(c17.sobra).toEqual(['b', 'b', 'a']);
    expect(c17.falta).toBeNull();
  });
});

describe('tema 1.2', () => {
  const t = BLOQUES[0].temas[1];
  const get = (id: string) => t.ejercicios.find((e) => e.id === id)!;
  it('equivalencias', () => {
    const res = ['1.2-01', '1.2-03', '1.2-04', '1.2-10'].map((id) => {
      const e = get(id);
      if (e.tipo !== 'equivalencia') throw new Error();
      const A = aAFD(desdeCompacto(e.A));
      const B = aAFD(desdeCompacto(e.B));
      return diferencia(A, B) ?? diferencia(B, A);
    });
    expect(res[0]).not.toBeNull();
    expect(res[1]).toBeNull();
    expect(res[2]).toEqual(['a', 'a']);
    expect(res[3]).toBeNull();
  });
  it('equivalencias nuevas', () => {
    const dif = (id: string) => {
      const e = get(id);
      if (e.tipo !== 'equivalencia') throw new Error();
      const A = aAFD(desdeCompacto(e.A));
      const B = aAFD(desdeCompacto(e.B));
      return diferencia(A, B) ?? diferencia(B, A);
    };
    expect(dif('1.2-11')).toBeNull();
    expect(dif('1.2-12')?.length).toBe(2);
    expect(dif('1.2-15')).toBeNull();
    expect(dif('1.2-16')?.length).toBe(1);
    expect(dif('1.2-17')?.length).toBe(3);
    expect(dif('1.2-18')).toBeNull();
    expect(dif('1.2-19')?.length).toBe(4);
    expect(dif('1.2-20')).toBeNull();
  });
  it('minimizaciones nuevas', () => {
    const w = desdeCompacto((get('1.2-13') as any).dado);
    expect([...accesibles(w)].sort()).toEqual(['w0', 'w1', 'w2']);
    expect(paresEquivalentes(w)).toEqual([['w1', 'w2']]);
    expect(estadosMinimo(aAFD(w))).toBe(2);
    const z = desdeCompacto((get('1.2-14') as any).dado);
    expect(paresEquivalentes(z)).toEqual([['z0', 'z3'], ['z1', 'z4'], ['z2', 'z5']]);
    expect(estadosMinimo(aAFD(z))).toBe(3);
    const o = desdeCompacto((get('1.2-21') as any).dado);
    expect([...accesibles(o)].sort()).toEqual(['o0', 'o1']);
    expect(estadosMinimo(aAFD(o))).toBe(2);
    const p = desdeCompacto((get('1.2-22') as any).dado);
    expect(paresEquivalentes(p)).toEqual([['p1', 'p2'], ['p1', 'p3'], ['p2', 'p3']]);
    expect(estadosMinimo(aAFD(p))).toBe(2);
    const c = desdeCompacto((get('1.2-23') as any).dado);
    expect([...accesibles(c)].sort()).toEqual(['c0', 'c1', 'c2', 'c3']);
    expect(paresEquivalentes(c)).toEqual([['c0', 'c3']]);
    expect(estadosMinimo(aAFD(c))).toBe(3);
    const d = desdeCompacto((get('1.2-24') as any).dado);
    expect(paresEquivalentes(d)).toEqual([['d0', 'd2'], ['d1', 'd3']]);
    expect(estadosMinimo(aAFD(d))).toBe(2);
    const s = desdeCompacto((get('1.2-25') as any).dado);
    expect(accesibles(s).size).toBe(3);
    expect(paresEquivalentes(s)).toEqual([]);
    expect(estadosMinimo(aAFD(s))).toBe(3);
    const g = desdeCompacto((get('1.2-26') as any).dado);
    expect(paresEquivalentes(g)).toEqual([['g3', 'g4'], ['g3', 'g5'], ['g4', 'g5']]);
    expect(estadosMinimo(aAFD(g))).toBe(4);
  });
  it('mínimos e inaccesibles como en las soluciones', () => {
    const r = desdeCompacto((get('1.2-05') as any).dado);
    expect([...accesibles(r)].sort()).toEqual(['r0', 'r1', 'r2']);
    expect(estadosMinimo(aAFD(r))).toBe(3);
    const u = desdeCompacto((get('1.2-08') as any).dado);
    expect(estadosMinimo(aAFD(u))).toBe(3);
    expect(paresEquivalentes(u)).toEqual([['u1', 'u2'], ['u3', 'u4']]);
    const v = desdeCompacto((get('1.2-09') as any).dado);
    expect([...accesibles(v)].sort()).toEqual(['v0', 'v1', 'v2', 'v3']);
    expect(paresEquivalentes(v)).toEqual([['v2', 'v3']]);
    expect(estadosMinimo(aAFD(v))).toBe(3);
    const tt = desdeCompacto((get('1.2-07') as any).dado);
    expect(paresEquivalentes(tt)).toEqual([['t0', 't1'], ['t2', 't3']]);
  });
});

describe('tema 1.3', () => {
  const t = BLOQUES[0].temas[2];
  const get = (id: string) => desdeCompacto((t.ejercicios.find((e) => e.id === id) as any).dado);
  it('trazas del ejercicio 1', () => {
    const n = get('1.3-01');
    expect(trazar(n, ['a', 'b']).acepta).toBe(true);
    expect(trazar(n, ['b', 'a']).acepta).toBe(false);
    expect([...trazar(n, ['a', 'b', 'a']).pasos[3].estados].sort()).toEqual(['n0', 'n1', 'n2']);
  });
  it('cierres', () => {
    const p = get('1.3-03');
    expect([...cierre(delta(p), ['p0'])].sort()).toEqual(['p0', 'p1', 'p2']);
    expect([...cierre(delta(p), ['p3'])].sort()).toEqual(['p1', 'p2', 'p3']);
  });
  it('número de conjuntos de cada tabla', () => {
    expect(subconjuntos(get('1.3-04')).filas.length).toBe(4);
    expect(subconjuntos(get('1.3-05')).filas.map((f) => f.R.size)).toContain(0);
    expect(subconjuntos(get('1.3-10')).filas.length).toBe(4);
    expect(estadosMinimo(aAFD(get('1.3-09')))).toBe(2);
    expect(subconjuntos(get('1.3-13')).filas.length).toBe(4);
    expect(estadosMinimo(aAFD(get('1.3-13')))).toBe(3);
    expect(subconjuntos(get('1.3-14')).filas.length).toBe(3);
    expect(subconjuntos(get('1.3-23')).filas.length).toBe(3);
    expect(subconjuntos(get('1.3-24')).filas.map((f) => f.R.size)).toContain(0);
    expect(subconjuntos(get('1.3-25')).filas.length).toBe(4);
    expect(estadosMinimo(aAFD(get('1.3-25')))).toBe(3);
    expect(subconjuntos(get('1.3-26')).filas.length).toBe(4);
    expect(subconjuntos(get('1.3-27')).filas.length).toBe(8);
    expect(estadosMinimo(aAFD(get('1.3-27')))).toBe(8);
  });
  it('ejercicios nuevos de trazar y cierres', () => {
    const m = get('1.3-11');
    expect(trazar(m, ['1', '0', '0']).acepta).toBe(true);
    expect(trazar(m, ['0', '1', '0']).acepta).toBe(false);
    const r = get('1.3-12');
    expect([...cierre(delta(r), ['r0'])].sort()).toEqual(['r0', 'r1', 'r2', 'r3']);
    expect([...cierre(delta(r), ['r2'])].sort()).toEqual(['r2', 'r3']);
    expect(trazar(get('1.3-17'), [...'aabb']).acepta).toBe(true);
    expect(trazar(get('1.3-17'), [...'abab']).acepta).toBe(false);
    expect(trazar(get('1.3-18'), [...'ba']).acepta).toBe(false);
    expect(trazar(get('1.3-18'), [...'aab']).acepta).toBe(true);
    expect(trazar(get('1.3-19'), [...'ba']).acepta).toBe(false);
    expect(trazar(get('1.3-19'), [...'aba']).acepta).toBe(true);
    expect([...cierre(delta(get('1.3-20')), ['c1'])].sort()).toEqual(['c0', 'c1', 'c2']);
    expect([...cierre(delta(get('1.3-21')), ['g0'])].sort()).toEqual(['g0', 'g1', 'g4']);
    expect([...cierre(delta(get('1.3-21')), ['g2'])].sort()).toEqual(['g2', 'g3', 'g4']);
    expect([...cierre(delta(get('1.3-22')), ['h0'])]).toEqual(['h0']);
    expect([...cierre(delta(get('1.3-22')), ['h1'])].sort()).toEqual(['h1', 'h2', 'h3']);
  });
  it('estructura detecta no determinismo y ε', () => {
    const e = estructura(get('1.3-07'));
    expect(e.usaEpsilon).toBe(true);
    expect(e.esAFD).toBe(false);
    expect(estructura(get('1.3-04')).noDeterminista.length).toBe(1);
  });
});
