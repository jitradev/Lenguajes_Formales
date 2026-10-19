import { tema11 } from './bloque1/tema11';
import { tema12 } from './bloque1/tema12';
import { tema13 } from './bloque1/tema13';
import { tema21 } from './bloque2/tema21';
import { Bloque, Ejercicio, Tema } from './tipos';

export const BLOQUES: Bloque[] = [
  { id: '1', titulo: 'Autómatas finitos', temas: [tema11, tema12, tema13], disponible: true },
  { id: '2', titulo: 'Expresiones regulares', temas: [tema21], disponible: true },
  { id: '3', titulo: 'Gramáticas', temas: [], disponible: false },
];

export function buscarEjercicio(id: string): { bloque: Bloque; tema: Tema; ejercicio: Ejercicio; indice: number } | null {
  for (const bloque of BLOQUES)
    for (const tema of bloque.temas) {
      const indice = tema.ejercicios.findIndex((e) => e.id === id);
      if (indice >= 0) return { bloque, tema, ejercicio: tema.ejercicios[indice], indice };
    }
  return null;
}
