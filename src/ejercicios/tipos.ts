// Tipos de ejercicio. Para añadir los bloques 2 y 3 basta con añadir nuevos
// tipos aquí, su vista en src/vistas/tipos y registrarlos en registro.ts.

import { AutomataCompacto } from '../automata/tipos';

/** Cómo se define el lenguaje que hay que reconocer (la solución, oculta al alumno). */
export type Lenguaje =
  | { er: string; complemento?: boolean } // expresión regular
  | { afd: AutomataCompacto; complemento?: boolean }; // autómata de referencia

interface Base {
  id: string;
  titulo: string;
  /** Texto del enunciado. Admite **negrita** y `código`. */
  enunciado: string;
  pistas?: string[];
  /** Comentario que se enseña al resolverlo. */
  alResolver?: string;
}

/** Diseñar un autómata a partir del enunciado y comprobar si es correcto y completo. */
export interface EjDisenar extends Base {
  tipo: 'disenar';
  alfabeto: string[];
  lenguaje: Lenguaje;
  /** Si se permite un AFN (tema 1.3). Por defecto se exige AFD con δ total. */
  permiteAFN?: boolean;
  /** Tope de estados, si el enunciado pide «lo más pequeño posible». */
  maxEstados?: number;
  /** Palabras sugeridas para probar. */
  pruebas?: string[];
  /** Tabla de δ que se da en el enunciado (ejercicios de «de la tabla al dibujo»). */
  tablaDada?: AutomataCompacto;
}

/** Decir si un autómata dado es correcto y completo, dar contraejemplos y arreglarlo. */
export interface EjAnalizar extends Base {
  tipo: 'analizar';
  dado: AutomataCompacto;
  descripcionLenguaje: string;
  lenguaje: Lenguaje;
}

/** Decidir si dos AFD son equivalentes y, si no, dar la palabra que los distingue. */
export interface EjEquivalencia extends Base {
  tipo: 'equivalencia';
  A: AutomataCompacto;
  B: AutomataCompacto;
  nombreA?: string;
  nombreB?: string;
}

export type PasoMinimizar = 'inaccesibles' | 'equivalentes' | 'minimo';

/** Simplificar: estados inaccesibles, estados equivalentes y el AFD mínimo. */
export interface EjMinimizar extends Base {
  tipo: 'minimizar';
  dado: AutomataCompacto;
  pasos: PasoMinimizar[];
}

/** Trazar palabras en un AFN: conjunto de estados al final y si se acepta. */
export interface EjTrazar extends Base {
  tipo: 'trazar';
  dado: AutomataCompacto;
  palabras: string[];
}

/** Calcular cierres ε. */
export interface EjCierres extends Base {
  tipo: 'cierres';
  dado: AutomataCompacto;
  conjuntos: string[][];
}

/** De AFN (o AFN-ε) a AFD: tabla de subconjuntos y dibujo del AFD. */
export interface EjAFNaAFD extends Base {
  tipo: 'afn-afd';
  dado: AutomataCompacto;
  /** Pedir además el AFD mínimo (enlaza con el tema 1.2). */
  pedirMinimo?: boolean;
}

export type Ejercicio = EjDisenar | EjAnalizar | EjEquivalencia | EjMinimizar | EjTrazar | EjCierres | EjAFNaAFD;

export interface Tema {
  id: string; // '1.1'
  titulo: string;
  resumen: string;
  ejercicios: Ejercicio[];
}

export interface Bloque {
  id: string; // '1'
  titulo: string;
  temas: Tema[];
  disponible: boolean;
}
