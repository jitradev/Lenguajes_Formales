import { tema21 } from '../ejercicios/bloque2/tema21';
import { EjPertenencia, EjPreguntas, Pregunta } from '../ejercicios/tipos';
import { corregir } from '../vistas/tipos/Preguntas';
import { ErrorER, forma, parsearER, sinParentesis } from './er';
import { afdDeER, afdDeLenguaje, cierreHasta, compilarER, concatenar, enCierre, enER, longitudMinima, potencia, primerasPalabras, union } from './lenguaje';
import { aceptaAFD, estadosMinimo } from './nucleo';

function todas(S: string[], max: number): string[] {
  const res = [''];
  let capa = [''];
  for (let n = 1; n <= max; n++) {
    capa = capa.flatMap((w) => S.map((s) => w + s));
    res.push(...capa);
  }
  return res;
}

const ej = (id: string) => tema21.ejercicios.find((e) => e.id === id)!;
const preguntas = (id: string) => (ej(id) as EjPreguntas).preguntas;
const cuenta = (w: string, c: string) => [...w].filter((x) => x === c).length;

describe('sintaxis de las expresiones', () => {
  const S = ['a', 'b'];
  const igual = (r: string, s: string) => {
    const A = afdDeER(r, S);
    const B = afdDeER(s, S);
    return todas(S, 7).every((w) => enER(A, w) === enER(B, w));
  };
  it('+ en la línea es la unión, como |', () => expect(igual('a+b', 'a|b')).toBe(true));
  it('⁺ es la clausura positiva', () => expect(igual('a⁺', 'aa*')).toBe(true));
  it('∅ no genera nada, y ∅* es ε', () => {
    expect(primerasPalabras(afdDeER('∅', S))).toEqual([]);
    expect(primerasPalabras(afdDeER('∅*', S))).toEqual(['']);
  });
  it('· y los espacios se ignoran', () => expect(igual('a · b (a | b)', 'ab(a|b)')).toBe(true));
  it('errores con la posición', () => {
    for (const mal of ['(ab', 'ab)', '*a', 'a|', '', 'a||b', '()']) expect(() => parsearER(mal)).toThrow(ErrorER);
    const r = compilarER('a(b|c)', S);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain('«c»');
  });
  it('primeras palabras en orden y longitud mínima', () => {
    expect(primerasPalabras(afdDeER('(a|b)c⁺', ['a', 'b', 'c']), 4)).toEqual(['ac', 'bc', 'acc', 'bcc']);
    expect(longitudMinima(afdDeER('(ab|c)*d', ['a', 'b', 'c', 'd']))).toBe(1);
  });
});

describe('paréntesis', () => {
  it('las soluciones de la tanda tienen todos los que hacen falta', () => {
    for (const [er, sol] of [
      ['ab|cd*', '(ab) | (c(d*))'],
      ['a|b*c', 'a | ((b*)c)'],
      ['(ab|c)*d', '((ab) | c)* d'],
    ]) {
      expect(forma(parsearER(sol))).toBe(forma(parsearER(er)));
      expect(sinParentesis(parsearER(sol))).toEqual([]);
      expect(sinParentesis(parsearER(er)).length).toBeGreaterThan(0);
    }
  });
  it('detecta que se ha cambiado la expresión', () => {
    expect(forma(parsearER('a(b|c)d*'))).not.toBe(forma(parsearER('ab|cd*')));
  });
  it('corregir acepta la solución y rechaza la original', () => {
    const p = preguntas('2.1-08')[0];
    expect(corregir(p, ['a', 'b', 'c', 'd'], '(ab) | (c(d*))').ok).toBe(true);
    expect(corregir(p, ['a', 'b', 'c', 'd'], 'ab|cd*').ok).toBe(false);
  });
});

describe('lenguajes finitos, como en las soluciones', () => {
  it('actividad 3 del deck', () => {
    const A = ['a', 'ab'];
    const B = ['b', ''];
    expect(concatenar(A, B)).toEqual(['a', 'ab', 'abb']);
    expect(concatenar(B, A)).toEqual(['a', 'ab', 'ba', 'bab']);
    expect(union(A, B)).toEqual(['', 'a', 'b', 'ab']);
    expect(enCierre(A, 'aab')).toBe(true);
    expect(enCierre(A, 'abb')).toBe(false);
  });
  it('ejercicio 6 de la tanda', () => {
    const A = ['a', 'ba'];
    const B = ['', 'b'];
    expect(concatenar(A, B).length).toBe(4);
    expect(concatenar(B, A).length).toBe(3);
    expect(potencia(A, 3).length).toBe(8);
  });
  it('ejercicio 7 de la tanda', () => {
    expect(cierreHasta(['0', '01'], 4)).toEqual(['', '0', '00', '01', '000', '001', '010', '0000', '0001', '0010', '0100', '0101']);
  });
});

// Predicados escritos a mano para cada pregunta «escribe la expresión» y cada contraejemplo.
const PRED: Record<string, (w: string) => boolean> = {
  '2.1-10:0': (w) => w.length >= 2 && w[0] === '1' && w.endsWith('0'),
  '2.1-10:1': (w) => w.includes('101'),
  '2.1-10:2': (w) => w.length <= 2,
  '2.1-10:3': (w) => cuenta(w, '0') % 2 === 0,
  '2.1-10:4': (w) => !w.includes('11'),
  '2.1-11:0': (w) => /^(0|n[0n]*)$/.test(w),
  '2.1-11:1': (w) => /^(0|n[0n]*)(\.[0n]+)?$/.test(w),
  '2.1-11:2': (w) => /^[l_][ld_]*$/.test(w),
  '2.1-12:0': (w) => cuenta(w, 'b') === 1,
  '2.1-12:1': (w) => w.length >= 2 && w[0] === 'a' && w.endsWith('b'),
  '2.1-12:2': (w) => w.length % 2 === 1,
  '2.1-12:3': (w) => cuenta(w, 'a') <= 1,
  '2.1-12:4': (w) => !w.includes('ab'),
  '2.1-13:0': (w) => cuenta(w, 'a') >= 2,
  '2.1-13:1': (w) => cuenta(w, 'b') % 3 === 0,
  '2.1-13:2': (w) => w.endsWith('ab') || w.endsWith('ba'),
  '2.1-13:3': (w) => /^a+b+$/.test(w),
  '2.1-13:4': (w) => !w.includes('aa') && !w.includes('bb'),
  '2.1-14:0': (w) => w === 'ddddddddl',
  '2.1-14:1': (w) => w === 'dd:dd',
  '2.1-14:2': (w) => w === 'ddddlll',
  '2.1-14:3': (w) => /^l+@l+(\.l+)+$/.test(w),
  '2.1-16:4': (w) => !w.includes('a'),
  '2.1-18:6': (w) => !w.includes('1'),
  '2.1-22:0': (w) => !w.includes('11'),
  '2.1-22:1': (w) => cuenta(w, '0') % 2 === 0,
  '2.1-22:2': (w) => w.endsWith('ab'),
  '2.1-22:3': (w) => w.includes('a'),
  '2.1-23:1': (w) => cuenta(w, 'a') % 2 === 0,
  '2.1-23:2': (w) => cuenta(w, 'a') % 2 === 0,
};

describe('datos del tema 2.1', () => {
  const ejs = tema21.ejercicios.filter((e): e is EjPreguntas => e.tipo === 'preguntas');
  for (const e of ejs)
    e.preguntas.forEach((p: Pregunta, i) => {
      const S = p.alfabeto ?? e.alfabeto;
      if (p.k === 'er' || p.k === 'contraejemplo')
        it(`${e.id}:${i} lenguaje de referencia`, () => {
          const pred = PRED[`${e.id}:${i}`];
          expect(pred).toBeDefined();
          const m = afdDeLenguaje(p.lenguaje, S);
          for (const w of todas(S, S.length > 2 ? 6 : 9)) expect(aceptaAFD(m, [...w])).toBe(pred(w));
        });
      if (p.k === 'contraejemplo')
        it(`${e.id}:${i} la expresión propuesta está mal`, () => {
          const m = afdDeLenguaje(p.lenguaje, S);
          const E = afdDeER(p.er, S);
          expect(todas(S, 9).some((w) => (p.sentido === 'falta' ? aceptaAFD(m, [...w]) && !enER(E, w) : enER(E, w) && !aceptaAFD(m, [...w])))).toBe(true);
        });
      for (const er of 'er' in p ? [p.er] : p.k === 'equiv' ? [p.r, p.s] : [])
        it(`${e.id}:${i} «${er}» se lee`, () => expect(compilarER(er, S).ok).toBe(true));
    });

  it('soluciones alternativas de la tanda', () => {
    const ok = (id: string, i: number, r: string) => expect(corregir(preguntas(id)[i], ['0', '1'], r).ok).toBe(true);
    ok('2.1-10', 3, '(1|01*0)*');
    ok('2.1-10', 4, '(0|10)*(1|ε)');
    ok('2.1-10', 2, 'ε | 0 | 1 | (0|1)(0|1)');
    expect(corregir(preguntas('2.1-10')[4], ['0', '1'], '(0|10)*').ok).toBe(false);
    expect(corregir(preguntas('2.1-12')[4], ['a', 'b'], 'b*a*').ok).toBe(true);
    expect(corregir(preguntas('2.1-13')[4], ['a', 'b'], '(b|ε)(ab)*(a|ε)').ok).toBe(true);
    expect(corregir(preguntas('2.1-23')[2], ['a', 'b'], '(b|ab*a)*').ok).toBe(true);
    expect(corregir(preguntas('2.1-11')[1], [], 'n(0|n)*.(0|n)⁺').ok).toBe(false); // sin el 0 ni la parte opcional
  });

  it('el contraejemplo de la tanda vale y es el más corto', () => {
    const p = preguntas('2.1-23')[1];
    expect(corregir(p, ['a', 'b'], 'aabaa').ok).toBe(true);
    if (p.k !== 'contraejemplo') throw new Error();
    const m = afdDeLenguaje(p.lenguaje, ['a', 'b']);
    const E = afdDeER(p.er, ['a', 'b']);
    expect(todas(['a', 'b'], 4).every((w) => aceptaAFD(m, [...w]) === enER(E, w))).toBe(true);
  });

  it('equivalencias como en las soluciones', () => {
    const esperado: Record<string, boolean[]> = {
      '2.1-19': [true, false, true, true, false],
      '2.1-20': [true, true, false, true, true, false, true, true],
      '2.1-21': [true, false, true, true, false, true],
    };
    for (const [id, v] of Object.entries(esperado)) {
      const ps = preguntas(id);
      expect(ps.length).toBe(v.length);
      ps.forEach((p, i) => {
        if (p.k !== 'equiv') throw new Error();
        const A = afdDeER(p.r, ['a', 'b']);
        const B = afdDeER(p.s, ['a', 'b']);
        expect(todas(['a', 'b'], 8).every((w) => enER(A, w) === enER(B, w))).toBe(v[i]);
      });
    }
    // Los contraejemplos más cortos de las soluciones.
    const p = preguntas('2.1-19');
    expect(corregir(p[1], ['a', 'b'], { eq: false, w: 'ab' }).lineas.length).toBe(1);
    expect(corregir(p[4], ['a', 'b'], { eq: false, w: 'a' }).ok).toBe(true);
    expect(corregir(p[4], ['a', 'b'], { eq: false, w: 'b' }).ok).toBe(false);
  });

  it('las descripciones correctas lo son', () => {
    const casos: [string, number, string, string[], (w: string) => boolean][] = [
      ['2.1-01', 0, '(a|b)*abb', ['a', 'b'], (w) => w.endsWith('abb')],
      ['2.1-06', 0, '(a|b)*a', ['a', 'b'], (w) => w.endsWith('a')],
      ['2.1-06', 1, 'b*ab*ab*', ['a', 'b'], (w) => cuenta(w, 'a') === 2],
      ['2.1-06', 2, '(b|ab)*', ['a', 'b'], (w) => !/a(?!b)/.test(w)],
      ['2.1-06', 4, '((a|b)(a|b))*', ['a', 'b'], (w) => w.length % 2 === 0],
      ['2.1-06', 5, 'a(a|b)*a | a', ['a', 'b'], (w) => w.length > 0 && w[0] === 'a' && w.endsWith('a')],
      ['2.1-07', 0, '0*10*', ['0', '1'], (w) => cuenta(w, '1') === 1],
      ['2.1-07', 1, '(0|1)*00', ['0', '1'], (w) => w.endsWith('00')],
      ['2.1-07', 2, '(1|01)*', ['0', '1'], (w) => !/0(?!1)/.test(w)],
      ['2.1-07', 3, '(0|1)(0|1)(0|1)(0|1)*', ['0', '1'], (w) => w.length >= 3],
      ['2.1-17', 4, '(0|01)*', ['0', '1'], (w) => w === '' || (w[0] === '0' && !w.includes('11'))],
    ];
    for (const [id, i, er, S, pred] of casos) {
      const p = preguntas(id)[i];
      if (p.k !== 'opcion') throw new Error(`${id}:${i}`);
      const m = afdDeER(er, S);
      for (const w of todas(S, 9)) expect(enER(m, w)).toBe(pred(w));
    }
  });

  it('pertenencia como en las soluciones', () => {
    const marcadas = (id: string) => {
      const e = ej(id) as EjPertenencia;
      return e.expresiones.map((er) => {
        const m = afdDeER(er, e.alfabeto);
        return e.palabras.filter((w) => enER(m, w));
      });
    };
    expect(marcadas('2.1-02')).toEqual([['abc', 'abcc'], ['ab', 'abc', 'abcc'], ['ab'], ['ab', 'abc', 'abcc', 'acb', 'a']]);
    expect(marcadas('2.1-04')).toEqual([['aba', 'abba'], ['', 'ab'], ['aba', 'abba'], ['', 'ab', 'aba', 'bab']]);
  });

  it('respuestas sí/no y números de la tanda y el deck', () => {
    const valor = (id: string, i: number) => {
      const p = preguntas(id)[i];
      return p.k === 'sino' || p.k === 'numero' ? p.valor : undefined;
    };
    expect([valor('2.1-17', 1), valor('2.1-17', 2), valor('2.1-17', 3)]).toEqual([true, true, false]);
    expect(valor('2.1-16', 5)).toBe(8);
    expect(valor('2.1-18', 4)).toBe(true);
    expect(valor('2.1-18', 5)).toBe(false);
  });

  it('estados del AFD mínimo como en las soluciones', () => {
    const esperado: Record<string, number> = { '2.1-24': 3, '2.1-25': 2, '2.1-26': 3, '2.1-27': 4, '2.1-28': 4, '2.1-29': 4, '2.1-30': 2, '2.1-31': 4 };
    for (const [id, n] of Object.entries(esperado)) {
      const e = ej(id);
      if (e.tipo !== 'disenar') throw new Error(id);
      expect(estadosMinimo(afdDeLenguaje(e.lenguaje, e.alfabeto))).toBe(n);
    }
  });
});
