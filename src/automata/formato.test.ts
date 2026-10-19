import { describe, expect, it } from 'vitest';
import { aTexto, desdeTexto } from './formato';
import { aAFD, aceptaAFD, comparar, estructura } from './nucleo';

const PAR_DE_AES = `
# número par de aes
inicial P
finales P
P a I   # cambia de paridad
P b P
I a P
I b I
`;

describe('formato de texto de la P1a', () => {
  it('lee un AFD con comentarios y líneas vacías', () => {
    const r = desdeTexto(PAR_DE_AES);
    if ('error' in r) throw new Error(r.error);
    const a = r.automata;
    expect(a.alfabeto).toEqual(['a', 'b']);
    expect(a.estados.map((q) => q.nombre)).toEqual(['P', 'I']);
    expect(estructura(a).total).toBe(true);
    const m = aAFD(a);
    expect(aceptaAFD(m, ['a', 'b', 'a'])).toBe(true);
    expect(aceptaAFD(m, ['a'])).toBe(false);
  });

  it('exporta y vuelve a importar el mismo lenguaje', () => {
    const r = desdeTexto(PAR_DE_AES);
    if ('error' in r) throw new Error(r.error);
    const texto = aTexto(r.automata);
    expect(texto.split('\n').slice(0, 3)).toEqual(['inicial P', 'finales P', 'P a I']);
    const r2 = desdeTexto(texto);
    if ('error' in r2) throw new Error(r2.error);
    expect(comparar(aAFD(r2.automata), aAFD(r.automata))).toMatchObject({ sobra: null, falta: null });
  });

  it('admite transiciones vacías como eps o ε y las escribe como eps', () => {
    const r = desdeTexto('inicial 0\nfinales 1\n0 eps 1\n1 ε 0\n1 a 1');
    if ('error' in r) throw new Error(r.error);
    expect(r.automata.alfabeto).toEqual(['a']);
    expect(aTexto(r.automata)).toContain('0 eps 1');
  });

  it('cambia los espacios de los nombres al exportar', () => {
    const r = desdeTexto('inicial q\nfinales\nq a q');
    if ('error' in r) throw new Error(r.error);
    r.automata.estados[0].nombre = '{0, 1}';
    expect(aTexto(r.automata)).toContain('{0,_1} a {0,_1}');
  });

  it('indica la línea que no entiende', () => {
    expect(desdeTexto('inicial q0\nq0 a')).toEqual({ error: expect.stringContaining('Línea 2') });
    expect(desdeTexto('q0 a q1')).toEqual({ error: 'Falta la línea «inicial».' });
  });

  it('coloca dentro del lienzo un autómata grande', () => {
    const lineas = ['inicial e0', 'finales e29'];
    for (let i = 0; i < 30; i++) lineas.push(`e${i} a e${(i + 1) % 30}`, `e${i} b e${(i * 7) % 30}`);
    const r = desdeTexto(lineas.join('\n'));
    if ('error' in r) throw new Error(r.error);
    for (const q of r.automata.estados) {
      expect(q.x).toBeGreaterThan(0);
      expect(q.x).toBeLessThan(900);
      expect(q.y).toBeGreaterThan(0);
      expect(q.y).toBeLessThan(440);
    }
  });
});
