// Piezas compartidas por las vistas de ejercicio.

import React from 'react';
import { aAFD, comparar, estadosMinimo, estructura } from '../automata/nucleo';
import { AFD, Automata, EPS, VACIO } from '../automata/tipos';
import { LineaInforme, Palabra } from '../editor/Herramientas';

/** Comprobación completa de un autómata dibujado frente a un lenguaje de referencia. */
export function comprobarAutomata(
  a: Automata,
  referencia: AFD,
  opciones: { permiteAFN?: boolean; maxEstados?: number; exigirMinimo?: boolean } = {},
): { lineas: LineaInforme[]; resuelto: boolean } {
  const lineas: LineaInforme[] = [];
  if (a.estados.length === 0) return { lineas: [{ nivel: 'mal', titulo: 'Todavía no hay ningún estado dibujado.' }], resuelto: false };
  const e = estructura(a);
  let estructuraOk = true;

  if (e.iniciales === 0) {
    lineas.push({ nivel: 'mal', titulo: 'No hay estado inicial.', detalle: 'Selecciona un estado y marca «Inicial».' });
    return { lineas, resuelto: false };
  }
  if (e.iniciales > 1) {
    estructuraOk = false;
    lineas.push({ nivel: 'mal', titulo: 'Hay más de un estado inicial.', detalle: 'Un autómata finito tiene un único estado inicial q₀.' });
  }
  if (e.simbolosFuera.length) {
    estructuraOk = false;
    lineas.push({ nivel: 'mal', titulo: `Hay símbolos que no están en Σ: ${e.simbolosFuera.join(', ')}.` });
  }
  if (e.nombresRepetidos.length) lineas.push({ nivel: 'aviso', titulo: `Hay estados con el mismo nombre: ${e.nombresRepetidos.join(', ')}.` });

  if (opciones.permiteAFN) {
    lineas.push({
      nivel: 'info',
      titulo: e.esAFD ? 'Es un AFD (también vale como AFN).' : `Es un AFN${e.usaEpsilon ? ' con transiciones ε' : ''}.`,
    });
  } else {
    if (e.usaEpsilon) {
      estructuraOk = false;
      lineas.push({ nivel: 'mal', titulo: 'Hay transiciones ε.', detalle: 'Un AFD no tiene transiciones vacías: cada paso consume un símbolo.' });
    }
    if (e.noDeterminista.length) {
      estructuraOk = false;
      lineas.push({
        nivel: 'mal',
        titulo: 'No es determinista.',
        detalle: e.noDeterminista.map((x) => `δ(${x.estado}, ${x.simbolo}) = {${x.destinos.join(', ')}}`).join(' · '),
      });
    }
    if (e.huecos.length) {
      estructuraOk = false;
      lineas.push({
        nivel: 'mal',
        titulo: 'La función de transición no es total (al AFD le faltan flechas).',
        detalle: (
          <>
            Faltan {e.huecos.slice(0, 6).map((h) => `δ(${h.estado}, ${h.simbolo})`).join(', ')}
            {e.huecos.length > 6 ? ` y ${e.huecos.length - 6} más` : ''}. Tiene que haber una transición por cada estado y cada símbolo: si hace
            falta, añade un estado de error del que ya no se sale.
          </>
        ),
      });
    }
    if (estructuraOk) lineas.push({ nivel: 'ok', titulo: 'Es un AFD con δ total.' });
  }

  const alumno = aAFD(a);
  const c = comparar(alumno, referencia);
  lineas.push(
    c.sobra
      ? {
          nivel: 'mal',
          titulo: 'No es correcto: acepta palabras que no debería.',
          detalle: (
            <>
              Por ejemplo, <Palabra w={c.sobra} /> se acepta y no pertenece al lenguaje.
            </>
          ),
        }
      : { nivel: 'ok', titulo: 'Es correcto: todo lo que acepta pertenece al lenguaje.' },
  );
  lineas.push(
    c.falta
      ? {
          nivel: 'mal',
          titulo: 'No es completo: hay palabras del lenguaje que no acepta.',
          detalle: (
            <>
              Por ejemplo, <Palabra w={c.falta} /> pertenece al lenguaje y se rechaza.
            </>
          ),
        }
      : { nivel: 'ok', titulo: 'Es completo: acepta todas las palabras del lenguaje.' },
  );

  const equivalente = !c.sobra && !c.falta;
  const n = a.estados.length;
  const minimo = estadosMinimo(referencia);
  let resuelto = equivalente && estructuraOk;
  if (equivalente) {
    if (opciones.exigirMinimo && n > minimo) {
      resuelto = false;
      lineas.push({ nivel: 'mal', titulo: `Es equivalente, pero tiene ${n} estados y el mínimo tiene ${minimo}.`, detalle: 'Todavía se puede simplificar.' });
    } else if (opciones.maxEstados && n > opciones.maxEstados) {
      lineas.push({ nivel: 'aviso', titulo: `Funciona, pero se puede hacer con ${opciones.maxEstados} estados.` });
    } else if (!opciones.permiteAFN && !opciones.exigirMinimo) {
      lineas.push(
        n > minimo
          ? { nivel: 'info', titulo: `Tu AFD tiene ${n} estados; el mínimo tiene ${minimo}.`, detalle: 'Se puede simplificar con lo del tema 1.2.' }
          : { nivel: 'info', titulo: `Tu AFD tiene ${n} estados, que es el mínimo.` },
      );
    }
  }
  return { lineas, resuelto };
}

/** Lee un conjunto de estados escrito por el alumno: «{s0, s1}», «s0 s1», «∅», «{}». */
export function parsearConjunto(texto: string, a: Automata): { ids: Set<string> } | { error: string } {
  const t = texto.trim().replace(/^\{/, '').replace(/\}$/, '').trim();
  if (t === '' || t === VACIO || t === 'Ø' || t === 'ø' || t.toLowerCase() === 'vacio' || t.toLowerCase() === 'vacío') return { ids: new Set() };
  const nombres = t.split(/[\s,;]+/).filter(Boolean);
  const ids = new Set<string>();
  for (const n of nombres) {
    const e = a.estados.find((x) => x.nombre === n || x.nombre.toLowerCase() === n.toLowerCase());
    if (!e) return { error: `«${n}» no es un estado` };
    ids.add(e.id);
  }
  return { ids };
}

export const mismoConjunto = (x: Set<string>, y: Set<string>) => x.size === y.size && [...x].every((q) => y.has(q));

export function textoConjunto(ids: Set<string>, a: Automata) {
  if (ids.size === 0) return VACIO;
  return `{${a.estados.filter((e) => ids.has(e.id)).map((e) => e.nombre).join(',')}}`;
}

export const vacioTexto = (w: string) => (w === '' ? EPS : w);

export function Seccion({ titulo, children, n }: { titulo: string; n?: number; children: React.ReactNode }) {
  return (
    <section className="seccion">
      <h2>
        {n !== undefined && <span className="num">{n}</span>}
        {titulo}
      </h2>
      {children}
    </section>
  );
}

export function SiNo({ valor, onChange, nombre }: { valor: boolean | null; onChange: (v: boolean) => void; nombre: string }) {
  return (
    <span className="sino" role="radiogroup">
      {[true, false].map((v) => (
        <label key={String(v)} className={`opcion ${valor === v ? 'on' : ''}`}>
          <input type="radio" name={nombre} checked={valor === v} onChange={() => onChange(v)} />
          {v ? 'Sí' : 'No'}
        </label>
      ))}
    </span>
  );
}
