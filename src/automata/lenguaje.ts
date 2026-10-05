import { Lenguaje } from '../ejercicios/tipos';
import { erAAutomata } from './er';
import { aAFD, desdeCompacto } from './nucleo';
import { AFD } from './tipos';

/** El lenguaje de referencia de un ejercicio, como AFD total. */
export function afdDeLenguaje(l: Lenguaje, alfabeto: string[]): AFD {
  const m = 'er' in l ? aAFD(erAAutomata(l.er, alfabeto)) : aAFD(desdeCompacto(l.afd));
  if (!l.complemento) return m;
  return { ...m, F: m.F.map((f) => !f) };
}
