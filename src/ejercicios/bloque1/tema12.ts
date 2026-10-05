import { AutomataCompacto } from '../../automata/tipos';
import { Tema } from '../tipos';

// Tema 1.2 · Equivalencia y simplificación. Autómatas de la tanda de práctica.

const EJ1_A: AutomataCompacto = {
  S: ['0', '1'],
  estados: [['a0', 105, 125, 'i'], ['a1', 300, 125, 'f']],
  trans: [['a0', '0', 'a0'], ['a1', '1', 'a1'], ['a0', '1', 'a1'], ['a1', '0', 'a0']],
};
const EJ1_B: AutomataCompacto = {
  S: ['0', '1'],
  estados: [['b0', 105, 130, 'i'], ['b1', 300, 130, 'f'], ['b2', 495, 130]],
  trans: [['b0', '0', 'b0'], ['b0', '1', 'b1'], ['b1', '0', 'b0'], ['b1', '1', 'b2'], ['b2', '0', 'b0'], ['b2', '1', 'b1']],
};
const EJ3_M: AutomataCompacto = {
  S: ['a', 'b'],
  estados: [['m0', 105, 125, 'if'], ['m1', 300, 125]],
  trans: [['m0', 'b', 'm0'], ['m1', 'b', 'm1'], ['m0', 'a', 'm1'], ['m1', 'a', 'm0']],
};
const EJ3_N: AutomataCompacto = {
  S: ['a', 'b'],
  estados: [['n0', 135, 115, 'if'], ['n1', 360, 115], ['n2', 135, 285, 'f'], ['n3', 360, 285]],
  trans: [['n0', 'a', 'n1'], ['n1', 'a', 'n0'], ['n0', 'b', 'n2'], ['n2', 'b', 'n0'], ['n1', 'b', 'n3'], ['n3', 'b', 'n1'], ['n2', 'a', 'n3'], ['n3', 'a', 'n2']],
};
const EJ4_P: AutomataCompacto = {
  S: ['a', 'b'],
  estados: [['p0', 105, 125, 'if'], ['p1', 300, 125]],
  trans: [['p0', 'b', 'p0'], ['p1', 'b', 'p1'], ['p0', 'a', 'p1'], ['p1', 'a', 'p0']],
};
const EJ4_Q: AutomataCompacto = {
  S: ['a', 'b'],
  estados: [['q0', 115, 125, 'if'], ['q1', 315, 125], ['q2', 515, 125]],
  trans: [['q0', 'b', 'q0'], ['q1', 'b', 'q1'], ['q2', 'b', 'q2'], ['q0', 'a', 'q1'], ['q1', 'a', 'q2'], ['q2', 'a', 'q0']],
};
const EJ10_X: AutomataCompacto = {
  S: ['0', '1'],
  estados: [['x0', 110, 150, 'if'], ['x1', 320, 150], ['x3', 530, 150], ['x2', 320, 330, 'f']],
  trans: [['x0', '1', 'x1'], ['x1', '1', 'x3'], ['x3', '1', 'x1'], ['x0', '0', 'x2'], ['x1', '0', 'x2'], ['x2', '1', 'x1'], ['x3', '0', 'x2'], ['x2', '0', 'x2']],
};
const EJ10_Y: AutomataCompacto = {
  S: ['0', '1'],
  estados: [['y0', 110, 125, 'if'], ['y1', 305, 125]],
  trans: [['y0', '0', 'y0'], ['y1', '1', 'y1'], ['y0', '1', 'y1'], ['y1', '0', 'y0']],
};

const EJ11_E: AutomataCompacto = {
  S: ['a', 'b'],
  estados: [['e0', 110, 125, 'i'], ['e1', 310, 125, 'f']],
  trans: [['e0', 'b', 'e0'], ['e1', 'a', 'e1'], ['e0', 'a', 'e1'], ['e1', 'b', 'e0']],
};
const EJ11_F: AutomataCompacto = {
  S: ['a', 'b'],
  estados: [['f0', 120, 115, 'i'], ['f1', 360, 115, 'f'], ['f2', 360, 300, 'f'], ['f3', 120, 300]],
  trans: [['f0', 'a', 'f1'], ['f0', 'b', 'f3'], ['f1', 'a', 'f2'], ['f1', 'b', 'f0'], ['f2', 'a', 'f1'], ['f2', 'b', 'f3'], ['f3', 'a', 'f2'], ['f3', 'b', 'f0']],
};
const EJ12_G: AutomataCompacto = {
  S: ['0', '1'],
  estados: [['g0', 110, 125, 'if'], ['g1', 310, 125]],
  trans: [['g0', '0, 1', 'g1'], ['g1', '0, 1', 'g0']],
};
const EJ12_H: AutomataCompacto = {
  S: ['0', '1'],
  estados: [['h0', 120, 115, 'if'], ['h1', 340, 115], ['h2', 340, 300], ['h3', 120, 300]],
  trans: [['h0', '0, 1', 'h1'], ['h1', '0, 1', 'h2'], ['h2', '0, 1', 'h3'], ['h3', '0, 1', 'h0']],
};

const EJ15_A: AutomataCompacto = {
  S: ['a', 'b'],
  estados: [['a0', 110, 130, 'i'], ['a1', 320, 70, 'f'], ['a2', 320, 230]],
  trans: [['a0', 'a', 'a1'], ['a0', 'b', 'a2'], ['a1', 'a, b', 'a1'], ['a2', 'a, b', 'a2']],
};
const EJ15_B: AutomataCompacto = {
  S: ['a', 'b'],
  estados: [['c0', 110, 130, 'i'], ['c1', 320, 70, 'f'], ['c2', 320, 250], ['c3', 530, 250]],
  trans: [['c0', 'a', 'c1'], ['c0', 'b', 'c2'], ['c1', 'a, b', 'c1'], ['c2', 'a', 'c3'], ['c2', 'b', 'c2'], ['c3', 'a, b', 'c2']],
};
const EJ16_A: AutomataCompacto = {
  S: ['0', '1'],
  estados: [['u0', 110, 125, 'if'], ['u1', 310, 125]],
  trans: [['u0', '0', 'u0'], ['u0', '1', 'u1'], ['u1', '0', 'u1'], ['u1', '1', 'u0']],
};
const EJ16_B: AutomataCompacto = {
  S: ['0', '1'],
  estados: [['c0', 110, 125, 'if'], ['c1', 310, 125]],
  trans: [['c0', '1', 'c0'], ['c0', '0', 'c1'], ['c1', '1', 'c1'], ['c1', '0', 'c0']],
};
const EJ17_A: AutomataCompacto = {
  S: ['a', 'b'],
  estados: [['k0', 110, 125, 'i'], ['k1', 300, 125], ['k2', 490, 125, 'f']],
  trans: [['k0', 'b', 'k0'], ['k0', 'a', 'k1'], ['k1', 'b', 'k0'], ['k1', 'a', 'k2'], ['k2', 'a, b', 'k2']],
};
const EJ17_B: AutomataCompacto = {
  S: ['a', 'b'],
  estados: [['t0', 110, 125, 'i'], ['t1', 300, 125], ['t2', 490, 125, 'f']],
  trans: [['t0', 'b', 't0'], ['t0', 'a', 't1'], ['t1', 'b', 't0'], ['t1', 'a', 't2'], ['t2', 'a', 't2'], ['t2', 'b', 't0']],
};
const EJ18_A: AutomataCompacto = {
  S: ['0', '1'],
  estados: [['r0', 110, 150, 'if'], ['r1', 310, 150], ['r2', 510, 150]],
  trans: [['r0', '0', 'r0'], ['r0', '1', 'r1'], ['r1', '0', 'r2'], ['r1', '1', 'r0'], ['r2', '0', 'r1'], ['r2', '1', 'r2']],
};
const EJ18_B: AutomataCompacto = {
  S: ['0', '1'],
  estados: [['s0', 110, 110, 'if'], ['s1', 320, 110], ['s2', 530, 110], ['s3', 110, 300, 'f'], ['s4', 320, 300], ['s5', 530, 300]],
  trans: [['s0', '0', 's0'], ['s0', '1', 's1'], ['s1', '0', 's2'], ['s1', '1', 's3'], ['s2', '0', 's4'], ['s2', '1', 's5'], ['s3', '0', 's0'], ['s3', '1', 's1'], ['s4', '0', 's2'], ['s4', '1', 's3'], ['s5', '0', 's4'], ['s5', '1', 's5']],
};
const EJ19_A: AutomataCompacto = {
  S: ['a', 'b'],
  estados: [['k0', 110, 125, 'i'], ['k1', 300, 125], ['k2', 490, 125, 'f']],
  trans: [['k0', 'b', 'k0'], ['k0', 'a', 'k1'], ['k1', 'a', 'k1'], ['k1', 'b', 'k2'], ['k2', 'a', 'k1'], ['k2', 'b', 'k0']],
};
const EJ19_B: AutomataCompacto = {
  S: ['a', 'b'],
  estados: [['l0', 110, 125, 'i'], ['l1', 300, 125], ['l2', 490, 125, 'f']],
  trans: [['l0', 'b', 'l0'], ['l0', 'a', 'l1'], ['l1', 'a', 'l1'], ['l1', 'b', 'l2'], ['l2', 'a', 'l0'], ['l2', 'b', 'l0']],
};
const EJ20_A: AutomataCompacto = {
  S: ['a', 'b'],
  estados: [['p0', 110, 125, 'i'], ['p1', 310, 125, 'f']],
  trans: [['p0', 'a', 'p0'], ['p0', 'b', 'p1'], ['p1', 'a, b', 'p1']],
};
const EJ20_B: AutomataCompacto = {
  S: ['a', 'b'],
  estados: [['m0', 110, 200, 'i'], ['m1', 310, 90], ['m2', 470, 220, 'f']],
  trans: [['m0', 'a', 'm1'], ['m1', 'a', 'm0'], ['m0', 'b', 'm2'], ['m1', 'b', 'm2'], ['m2', 'a, b', 'm2']],
};

export const tema12: Tema = {
  id: '1.2',
  titulo: 'Equivalencia y simplificación',
  resumen: 'Decidir si dos AFD son equivalentes, quitar estados inaccesibles y equivalentes y llegar al mínimo.',
  ejercicios: [
    {
      id: '1.2-01',
      tipo: 'equivalencia',
      titulo: 'La palabra más corta que los distingue',
      enunciado:
        'Estos dos AFD sobre {0, 1} **no son equivalentes**. Encontrad la palabra más corta que uno acepta y el otro no, y decid cuál de los dos la acepta.',
      A: EJ1_A,
      B: EJ1_B,
      pistas: ['Id por longitudes: primero ε, luego las de un símbolo, luego las de dos…'],
    },
    {
      id: '1.2-03',
      tipo: 'equivalencia',
      titulo: 'Moore hasta el final',
      enunciado: 'Aplicad el teorema de Moore a estos dos AFD sobre {a, b} y decidid si son equivalentes.',
      A: EJ3_M,
      B: EJ3_N,
      alResolver: 'Los dos reconocen las palabras con un número par de aes: en N las bes no cambian nada que importe.',
    },
    {
      id: '1.2-04',
      tipo: 'equivalencia',
      titulo: 'Moore que salta a la segunda fila',
      enunciado:
        'Aplicad el teorema de Moore y decidid. Si no son equivalentes, dad la **palabra más corta** que los distingue.',
      A: EJ4_P,
      B: EJ4_Q,
    },
    {
      id: '1.2-10',
      tipo: 'equivalencia',
      titulo: 'Comparar sin usar Moore',
      enunciado:
        'Simplificad los dos autómatas por separado, comparad los mínimos y decid si X e Y son equivalentes.',
      A: EJ10_X,
      B: EJ10_Y,
      nombreA: 'X',
      nombreB: 'Y',
    },
    {
      id: '1.2-05',
      tipo: 'minimizar',
      titulo: 'Quién sobra sin hacer ninguna cuenta',
      enunciado:
        '**(a)** Marcad los estados inaccesibles de este AFD. **(b)** Dibujad el autómata que queda al quitarlos, que en este caso ya es el mínimo.',
      dado: {
        S: ['0', '1'],
        estados: [['r0', 110, 150, 'i'], ['r1', 310, 150, 'f'], ['r2', 510, 150], ['r3', 710, 150], ['r4', 890, 150, 'f']],
        trans: [['r0', '1', 'r0'], ['r0', '0', 'r1'], ['r1', '1', 'r1'], ['r1', '0', 'r2'], ['r2', '0, 1', 'r0'], ['r3', '0', 'r4'], ['r3', '1', 'r2'], ['r4', '0', 'r3'], ['r4', '1', 'r4']],
      },
      pasos: ['inaccesibles', 'minimo'],
    },
    {
      id: '1.2-07',
      tipo: 'minimizar',
      titulo: '¿Son equivalentes estos dos estados?',
      enunciado:
        'En este AFD, decidid con el teorema de Moore qué parejas de estados son equivalentes (en particular, **t2 y t3**) y dibujad el mínimo.',
      dado: {
        S: ['a', 'b'],
        estados: [['t0', 110, 195, 'i'], ['t1', 310, 115], ['t2', 310, 285, 'f'], ['t3', 520, 195, 'f']],
        trans: [['t0', 'a', 't1'], ['t0', 'b', 't2'], ['t1', 'a', 't1'], ['t1', 'b', 't3'], ['t2', 'b', 't2'], ['t2', 'a', 't3'], ['t3', 'a', 't3'], ['t3', 'b', 't2']],
      },
      pasos: ['equivalentes', 'minimo'],
    },
    {
      id: '1.2-08',
      tipo: 'minimizar',
      titulo: 'El mínimo, entero',
      enunciado: 'Simplificad del todo este AFD de cinco estados y dibujad el autómata mínimo.',
      dado: {
        S: ['0', '1'],
        estados: [['u0', 110, 195, 'i'], ['u1', 320, 115], ['u2', 320, 285], ['u3', 530, 115, 'f'], ['u4', 530, 285, 'f']],
        trans: [['u0', '0', 'u1'], ['u0', '1', 'u2'], ['u1', '0', 'u1'], ['u1', '1', 'u3'], ['u2', '0', 'u2'], ['u2', '1', 'u4'], ['u3', '0, 1', 'u3'], ['u4', '0, 1', 'u4']],
      },
      pasos: ['inaccesibles', 'equivalentes', 'minimo'],
    },
    {
      id: '1.2-09',
      tipo: 'minimizar',
      titulo: 'Las dos cosas a la vez',
      enunciado:
        'Este AFD tiene estados inaccesibles **y** estados equivalentes. Simplificadlo del todo: primero los inaccesibles, luego los equivalentes, y dibujad el mínimo.',
      dado: {
        S: ['a', 'b'],
        estados: [['v0', 100, 150, 'i'], ['v1', 275, 150], ['v2', 450, 150, 'f'], ['v3', 625, 150, 'f'], ['v4', 800, 150], ['v5', 970, 150]],
        trans: [['v0', 'b', 'v0'], ['v0', 'a', 'v1'], ['v1', 'b', 'v1'], ['v1', 'a', 'v2'], ['v2', 'a', 'v2'], ['v2', 'b', 'v3'], ['v3', 'b', 'v2'], ['v3', 'a', 'v3'], ['v4', 'a', 'v5'], ['v4', 'b', 'v3'], ['v5', 'a', 'v4'], ['v5', 'b', 'v5']],
      },
      pasos: ['inaccesibles', 'equivalentes', 'minimo'],
    },
    {
      id: '1.2-11',
      tipo: 'equivalencia',
      titulo: 'Más estados, mismo lenguaje',
      enunciado: 'E tiene dos estados y F cuatro. ¿Reconocen el mismo lenguaje? Si no, dad la palabra más corta que los distingue.',
      A: EJ11_E,
      B: EJ11_F,
      nombreA: 'E',
      nombreB: 'F',
      alResolver: 'Son equivalentes: los dos aceptan las palabras que acaban en a. En F, f₁ y f₂ hacen el mismo papel, y f₀ y f₃ también.',
    },
    {
      id: '1.2-12',
      tipo: 'equivalencia',
      titulo: 'Contar longitudes',
      enunciado: 'G y H solo miran la longitud de la palabra. Decidid si son equivalentes y, si no, dad la palabra más corta que los distingue.',
      A: EJ12_G,
      B: EJ12_H,
      nombreA: 'G',
      nombreB: 'H',
      alResolver: 'G acepta longitud par y H longitud múltiplo de 4: cualquier palabra de longitud 2 los distingue.',
    },
    {
      id: '1.2-13',
      tipo: 'minimizar',
      titulo: 'Acabar en uno, con sobras',
      enunciado: 'Simplificad del todo este AFD: marcad los inaccesibles, decidid qué estados son equivalentes y dibujad el mínimo.',
      dado: {
        S: ['0', '1'],
        estados: [['w0', 110, 195, 'i'], ['w1', 320, 115, 'f'], ['w2', 320, 285, 'f'], ['w3', 540, 195], ['w4', 750, 195]],
        trans: [['w0', '0', 'w0'], ['w0', '1', 'w1'], ['w1', '0', 'w0'], ['w1', '1', 'w2'], ['w2', '0', 'w0'], ['w2', '1', 'w1'], ['w3', '0', 'w4'], ['w3', '1', 'w2'], ['w4', '0, 1', 'w3']],
      },
      pasos: ['inaccesibles', 'equivalentes', 'minimo'],
      alResolver: 'El mínimo tiene dos estados y reconoce las palabras que acaban en 1.',
    },
    {
      id: '1.2-14',
      tipo: 'minimizar',
      titulo: 'Un hexágono que se pliega',
      enunciado:
        'Este AFD cuenta las aes módulo 6, pero solo le importa una cosa. Encontrad todas las parejas de estados equivalentes y dibujad el mínimo.',
      dado: {
        S: ['a', 'b'],
        estados: [['z0', 330, 90, 'if'], ['z1', 530, 90], ['z2', 650, 220], ['z3', 530, 350, 'f'], ['z4', 330, 350], ['z5', 210, 220]],
        trans: [['z0', 'a', 'z1'], ['z1', 'a', 'z2'], ['z2', 'a', 'z3'], ['z3', 'a', 'z4'], ['z4', 'a', 'z5'], ['z5', 'a', 'z0'], ['z0', 'b', 'z0'], ['z1', 'b', 'z1'], ['z2', 'b', 'z2'], ['z3', 'b', 'z3'], ['z4', 'b', 'z4'], ['z5', 'b', 'z5']],
      },
      pasos: ['equivalentes', 'minimo'],
      alResolver: 'Solo importa el número de aes módulo 3: zᵢ y zᵢ₊₃ son equivalentes y el mínimo tiene tres estados.',
    },
    {
      id: '1.2-15',
      tipo: 'equivalencia',
      titulo: 'Dos estados de error',
      enunciado: 'El segundo autómata tiene un estado de error «de más». Decidid si los dos son equivalentes.',
      A: EJ15_A,
      B: EJ15_B,
      alResolver: 'Son equivalentes: los dos aceptan las palabras que empiezan por a. c₂ y c₃ no llevan nunca a un final.',
    },
    {
      id: '1.2-16',
      tipo: 'equivalencia',
      titulo: 'Unos frente a ceros',
      enunciado: 'Los dos autómatas tienen la misma forma, pero con los símbolos cambiados. ¿Son equivalentes? Dad la palabra más corta que los distingue.',
      A: EJ16_A,
      B: EJ16_B,
      alResolver: 'El primero cuenta la paridad de los unos y el segundo la de los ceros: `0` o `1` ya los distingue.',
    },
    {
      id: '1.2-17',
      tipo: 'equivalencia',
      titulo: 'Contener o acabar',
      enunciado: 'Uno de estos AFD acepta las palabras que **contienen aa** y el otro las que **acaban en aa**. Encontrad la palabra más corta que los distingue.',
      A: EJ17_A,
      B: EJ17_B,
      pistas: ['Hasta longitud 2 aceptan lo mismo. ¿Qué pasa si después de `aa` viene algo más?'],
    },
    {
      id: '1.2-18',
      tipo: 'equivalencia',
      titulo: 'Resto módulo 3 y módulo 6',
      enunciado:
        'El primero calcula el resto de un número binario entre 3; el segundo, entre 6, y acepta los restos 0 y 3. Aplicad Moore y decidid si son equivalentes.',
      A: EJ18_A,
      B: EJ18_B,
      alResolver: 'Son equivalentes: un número es múltiplo de 3 justo cuando su resto entre 6 es 0 o 3.',
    },
    {
      id: '1.2-19',
      tipo: 'equivalencia',
      titulo: 'Una flecha cambiada',
      enunciado: 'Estos dos AFD solo se diferencian en una flecha. Encontrad la palabra más corta que los distingue y decid cuál la acepta.',
      A: EJ19_A,
      B: EJ19_B,
      pistas: ['Fijaos en la flecha con la a que sale del estado final.'],
    },
    {
      id: '1.2-20',
      tipo: 'equivalencia',
      titulo: 'Contar aes para nada',
      enunciado: 'El segundo autómata lleva la paridad de las aes hasta ver la primera b. ¿Sirve de algo? Decidid si son equivalentes.',
      A: EJ20_A,
      B: EJ20_B,
      alResolver: 'Son equivalentes: los dos aceptan las palabras con al menos una b. m₀ y m₁ son equivalentes.',
    },
    {
      id: '1.2-21',
      tipo: 'minimizar',
      titulo: 'Islas',
      enunciado: 'Marcad los estados inaccesibles de este AFD y dibujad el autómata que queda, que ya es el mínimo.',
      dado: {
        S: ['a', 'b'],
        estados: [['o0', 110, 130, 'i'], ['o1', 330, 130, 'f'], ['o2', 110, 310], ['o3', 330, 310]],
        trans: [['o0', 'a', 'o1'], ['o1', 'a', 'o0'], ['o0', 'b', 'o0'], ['o1', 'b', 'o1'], ['o2', 'a', 'o3'], ['o3', 'a', 'o2'], ['o2', 'b', 'o0'], ['o3', 'b', 'o3']],
      },
      pasos: ['inaccesibles', 'minimo'],
      alResolver: 'Que o₂ lleve a o₀ no lo hace accesible: lo que cuenta es poder llegar a él desde el inicial.',
    },
    {
      id: '1.2-22',
      tipo: 'minimizar',
      titulo: 'Tres finales que son uno',
      enunciado: 'Encontrad todas las parejas de estados equivalentes de este AFD y dibujad el mínimo.',
      dado: {
        S: ['0', '1'],
        estados: [['p0', 110, 195, 'i'], ['p1', 320, 195, 'f'], ['p2', 530, 100, 'f'], ['p3', 530, 290, 'f']],
        trans: [['p0', '0', 'p0'], ['p0', '1', 'p1'], ['p1', '0', 'p2'], ['p1', '1', 'p3'], ['p2', '0', 'p3'], ['p2', '1', 'p1'], ['p3', '0, 1', 'p3']],
      },
      pasos: ['equivalentes', 'minimo'],
      alResolver: 'p₁, p₂ y p₃ son finales y de ellos no se sale a un no final: los tres son el mismo estado. Reconoce «contiene algún 1».',
    },
    {
      id: '1.2-23',
      tipo: 'minimizar',
      titulo: 'Contiene 11, con ruido',
      enunciado: 'Simplificad del todo: inaccesibles, parejas equivalentes y el AFD mínimo.',
      dado: {
        S: ['0', '1'],
        estados: [['c0', 110, 195, 'i'], ['c1', 320, 115], ['c3', 320, 290], ['c2', 540, 115, 'f'], ['c4', 750, 115]],
        trans: [['c0', '0', 'c0'], ['c0', '1', 'c1'], ['c1', '0', 'c3'], ['c1', '1', 'c2'], ['c3', '0', 'c0'], ['c3', '1', 'c1'], ['c2', '0, 1', 'c2'], ['c4', '0', 'c2'], ['c4', '1', 'c4']],
      },
      pasos: ['inaccesibles', 'equivalentes', 'minimo'],
      alResolver: 'c₄ es inaccesible y c₀ ≈ c₃. El mínimo tiene tres estados.',
    },
    {
      id: '1.2-24',
      tipo: 'minimizar',
      titulo: 'Un ciclo de cuatro',
      enunciado: 'Este AFD da vueltas a un ciclo de cuatro estados. Decidid qué parejas son equivalentes y dibujad el mínimo.',
      dado: {
        S: ['a', 'b'],
        estados: [['d0', 120, 110, 'if'], ['d1', 360, 110], ['d2', 360, 300, 'f'], ['d3', 120, 300]],
        trans: [['d0', 'a, b', 'd1'], ['d1', 'a, b', 'd2'], ['d2', 'a, b', 'd3'], ['d3', 'a, b', 'd0']],
      },
      pasos: ['equivalentes', 'minimo'],
      alResolver: 'd₀ ≈ d₂ y d₁ ≈ d₃: el mínimo tiene dos estados y reconoce la longitud par.',
    },
    {
      id: '1.2-25',
      tipo: 'minimizar',
      titulo: '¿Ya es mínimo?',
      enunciado:
        'Simplificad este AFD. A veces la respuesta es que **no sobra nada**: comprobadlo con cuidado antes de quitar estados.',
      dado: {
        S: ['0', '1'],
        estados: [['s0', 110, 150, 'i'], ['s1', 310, 150], ['s2', 510, 150, 'f']],
        trans: [['s0', '1', 's0'], ['s0', '0', 's1'], ['s1', '0', 's1'], ['s1', '1', 's2'], ['s2', '0', 's1'], ['s2', '1', 's0']],
      },
      pasos: ['inaccesibles', 'equivalentes', 'minimo'],
      alResolver: 'No hay inaccesibles ni equivalentes: es el AFD mínimo de «termina en 01».',
    },
    {
      id: '1.2-26',
      tipo: 'minimizar',
      titulo: 'Tres sumideros',
      enunciado: 'Este AFD acepta una sola palabra, pero tiene varios estados de error. Encontrad las parejas equivalentes y dibujad el mínimo.',
      dado: {
        S: ['a', 'b'],
        estados: [['g0', 110, 195, 'i'], ['g1', 310, 110], ['g2', 510, 110, 'f'], ['g3', 310, 290], ['g4', 510, 290], ['g5', 710, 110]],
        trans: [['g0', 'a', 'g1'], ['g0', 'b', 'g3'], ['g1', 'b', 'g2'], ['g1', 'a', 'g4'], ['g2', 'a, b', 'g5'], ['g3', 'a, b', 'g3'], ['g4', 'a, b', 'g4'], ['g5', 'a, b', 'g5']],
      },
      pasos: ['equivalentes', 'minimo'],
      alResolver: 'g₃, g₄ y g₅ son el mismo estado de error. El mínimo tiene cuatro estados y solo acepta `ab`.',
    },
  ],
};
