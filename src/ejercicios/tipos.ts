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
  /** Etiqueta del tipo en las listas, si no vale la genérica. */
  nombreTipo?: string;
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
  /** Exigir el AFD mínimo para darlo por resuelto. */
  exigirMinimo?: boolean;
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

/** Marcar qué palabras pertenecen al lenguaje de cada expresión. */
export interface EjPertenencia extends Base {
  tipo: 'pertenencia';
  alfabeto: string[];
  expresiones: string[];
  palabras: string[];
}

interface PreguntaBase {
  /** «(a)», «(b)»… */
  etiqueta?: string;
  /** Lo que se pregunta. Admite **negrita** y `código`. */
  texto?: string;
  /** Alfabeto de esta pregunta, si no es el del ejercicio. */
  alfabeto?: string[];
  /** Comentario que se enseña cuando la respuesta es buena. */
  explicacion?: string;
}

/** Las preguntas sueltas de los ejercicios del bloque 2. */
export type Pregunta = PreguntaBase &
  (
    | { k: 'er'; lenguaje: Lenguaje } // escribir una expresión para el lenguaje
    | { k: 'equiv'; r: string; s: string } // ¿r = s? y, si no, la palabra que lo demuestra
    | { k: 'contraejemplo'; er: string; lenguaje: Lenguaje; sentido: 'falta' | 'sobra' } // palabra que refuta la expresión
    | { k: 'palabras'; er: string; dentro: number; fuera: number } // dar palabras que están y que no
    | { k: 'opcion'; opciones: string[]; correcta: number }
    | { k: 'conjunto'; valor: string[] } // un lenguaje finito, escrito como conjunto
    | { k: 'numero'; valor: number }
    | { k: 'sino'; valor: boolean }
    | { k: 'corta'; er: string } // una palabra de longitud mínima
    | { k: 'parentesis'; er: string } // reescribir con los paréntesis que dicen a qué se aplica cada operador
  );

/** Varias preguntas sobre expresiones y lenguajes que se corrigen a la vez. */
export interface EjPreguntas extends Base {
  tipo: 'preguntas';
  alfabeto: string[];
  preguntas: Pregunta[];
}

export type Ejercicio = EjDisenar | EjAnalizar | EjEquivalencia | EjMinimizar | EjTrazar | EjCierres | EjAFNaAFD | EjPertenencia | EjPreguntas;

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
