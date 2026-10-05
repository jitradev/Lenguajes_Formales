// Tipos básicos de los autómatas que se dibujan en la aplicación.

export const EPS = 'ε';
export const VACIO = '∅';

export interface Estado {
  id: string;
  nombre: string;
  x: number;
  y: number;
  inicial: boolean;
  final: boolean;
}

export interface Transicion {
  id: string;
  de: string;
  a: string;
  simbolos: string[];
}

/** Un autómata tal y como se dibuja: puede ser AFD, AFN o AFN-ε. */
export interface Automata {
  alfabeto: string[];
  estados: Estado[];
  transiciones: Transicion[];
}

/** AFD interno, total, con los estados numerados. Lo usan los algoritmos. */
export interface AFD {
  S: string[];
  n: number;
  inicio: number;
  F: boolean[];
  d: number[][]; // d[q][i] = destino con el símbolo S[i]
  /** Etiqueta legible de cada estado (el nombre o el conjunto de estados). */
  etiquetas: string[];
}

/**
 * Forma compacta para escribir autómatas en los ficheros de ejercicios.
 *   estados: [nombre, x, y, banderas]  con banderas 'i' (inicial) y 'f' (final)
 *   trans:   [origen, 'a, b', destino]  y 'ε' para las transiciones vacías
 */
export interface AutomataCompacto {
  S: string[];
  estados: [string, number, number, string?][];
  trans: [string, string, string][];
}
