// Progreso y borradores del alumno, guardados en el navegador (localStorage).
// Es solo una comodidad: si el navegador no deja guardar, la aplicación sigue funcionando.

import { useCallback, useEffect, useState } from 'react';

const CLAVE = 'lf-ejercicios-v1';
const EVENTO = 'lf-progreso';

interface Registro {
  resuelto?: boolean;
  datos?: Record<string, unknown>;
}

function leer(): Record<string, Registro> {
  try {
    return JSON.parse(localStorage.getItem(CLAVE) || '{}');
  } catch {
    return {};
  }
}

function escribir(todo: Record<string, Registro>) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(todo));
  } catch {
    /* sin almacenamiento: no pasa nada */
  }
  window.dispatchEvent(new Event(EVENTO));
}

export function marcarResuelto(id: string) {
  const todo = leer();
  if (todo[id]?.resuelto) return;
  todo[id] = { ...todo[id], resuelto: true };
  escribir(todo);
}

export function borrarProgreso() {
  escribir({});
}

export function useResueltos(): Set<string> {
  const calc = () => new Set(Object.entries(leer()).filter(([, r]) => r.resuelto).map(([k]) => k));
  const [s, setS] = useState(calc);
  useEffect(() => {
    const f = () => setS(calc());
    window.addEventListener(EVENTO, f);
    window.addEventListener('storage', f);
    return () => {
      window.removeEventListener(EVENTO, f);
      window.removeEventListener('storage', f);
    };
  }, []);
  return s;
}

/** Estado de React que se guarda como borrador del ejercicio. */
export function useBorrador<T>(ejercicio: string, campo: string, inicial: () => T): [T, (v: T) => void, () => void] {
  const [v, setV] = useState<T>(() => {
    const d = leer()[ejercicio]?.datos?.[campo];
    return d === undefined ? inicial() : (d as T);
  });
  const set = useCallback(
    (nuevo: T) => {
      setV(nuevo);
      const todo = leer();
      todo[ejercicio] = { ...todo[ejercicio], datos: { ...todo[ejercicio]?.datos, [campo]: nuevo } };
      try {
        localStorage.setItem(CLAVE, JSON.stringify(todo));
      } catch {
        /* nada */
      }
    },
    [ejercicio, campo],
  );
  const reiniciar = useCallback(() => set(inicial()), [set]); // eslint-disable-line
  return [v, set, reiniciar];
}
