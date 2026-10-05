// Probador de palabras, tabla δ e informe de comprobaciones.

import React, { useEffect, useMemo, useState } from 'react';
import { delta, nombreDe, partirPalabra, trazar, verPalabra } from '../automata/nucleo';
import { Automata, EPS } from '../automata/tipos';

// ------------------------------------------------------------ probador

export function Probador({
  automata,
  pruebas = [],
  onActivos,
}: {
  automata: Automata;
  pruebas?: string[];
  onActivos?: (s: Set<string> | null) => void;
}) {
  const [texto, setTexto] = useState('');
  const [paso, setPaso] = useState<number | null>(null);
  const palabra = partirPalabra(texto, automata.alfabeto);
  const traza = useMemo(() => (palabra && automata.estados.length ? trazar(automata, palabra) : null), [automata, texto]); // eslint-disable-line
  const ultimo = traza ? traza.pasos.length - 1 : 0;
  const pasoVisto = paso === null ? ultimo : Math.min(paso, ultimo);

  useEffect(() => {
    if (!onActivos) return;
    if (traza && texto !== '') onActivos(traza.pasos[pasoVisto].estados);
    else onActivos(null);
  }, [traza, pasoVisto, texto, paso]); // eslint-disable-line

  useEffect(() => () => onActivos?.(null), []); // eslint-disable-line

  const conjunto = (s: Set<string>) => {
    const n = [...s].map((q) => nombreDe(automata, q));
    if (n.length === 1) return n[0];
    return n.length === 0 ? '∅' : `{${n.join(',')}}`;
  };

  return (
    <div className="probador">
      <div className="probador-entrada">
        <label htmlFor="palabra">Probar una palabra</label>
        <input
          id="palabra"
          value={texto}
          placeholder="p. ej. 0101 (vacío = ε)"
          onChange={(e) => {
            setTexto(e.target.value);
            setPaso(null);
          }}
          className="mono"
          autoComplete="off"
        />
        {pruebas.length > 0 && (
          <span className="chips">
            {pruebas.map((p) => (
              <button
                key={p}
                className="chip"
                onClick={() => {
                  setTexto(p === 'ε' ? ' ' : p);
                  setPaso(null);
                }}
              >
                {p || EPS}
              </button>
            ))}
          </span>
        )}
      </div>
      {texto !== '' && !palabra && <p className="mal">Hay símbolos que no están en Σ = {`{${automata.alfabeto.join(', ')}}`}.</p>}
      {traza && texto !== '' && (
        <div className="traza">
          <div className="traza-pasos mono">
            {traza.pasos.map((p, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="traza-sim">—{p.simbolo}→</span>}
                <button className={`traza-estado ${i === pasoVisto ? 'on' : ''}`} onClick={() => setPaso(i)}>
                  {conjunto(p.estados)}
                </button>
              </React.Fragment>
            ))}
          </div>
          <div className="traza-pie">
            <span className="mono">«{verPalabra(palabra!)}»</span>
            <span className={`veredicto ${traza.acepta ? 'si' : 'no'}`}>{traza.acepta ? 'Se acepta' : 'Se rechaza'}</span>
            <span className="traza-nav">
              <button className="btn-texto" disabled={pasoVisto === 0} onClick={() => setPaso(Math.max(0, pasoVisto - 1))}>
                ← paso
              </button>
              <button className="btn-texto" disabled={pasoVisto === ultimo} onClick={() => setPaso(Math.min(ultimo, pasoVisto + 1))}>
                paso →
              </button>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------ tabla δ

export function TablaDelta({ automata, marcarHuecos = true }: { automata: Automata; marcarHuecos?: boolean }) {
  const d = delta(automata);
  const usaEps = automata.transiciones.some((t) => t.simbolos.includes(EPS));
  const cols = [...automata.alfabeto, ...(usaEps ? [EPS] : [])];
  if (automata.estados.length === 0) return null;
  return (
    <table className="tabla-delta">
      <thead>
        <tr>
          <th>δ</th>
          {cols.map((s) => (
            <th key={s}>{s}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {automata.estados.map((e) => (
          <tr key={e.id}>
            <th>
              {e.inicial ? '→ ' : ''}
              {e.final ? '* ' : ''}
              {e.nombre}
            </th>
            {cols.map((s) => {
              const dest = [...(d.get(e.id)?.get(s) ?? [])].map((q) => nombreDe(automata, q));
              const hueco = dest.length === 0 && s !== EPS;
              return (
                <td key={s} className={hueco && marcarHuecos ? 'hueco' : dest.length > 1 ? 'varios' : ''}>
                  {dest.length === 0 ? (s === EPS ? '' : '—') : dest.length === 1 ? dest[0] : `{${dest.join(',')}}`}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ------------------------------------------------------------ informe

export type Nivel = 'ok' | 'mal' | 'aviso' | 'info';
export interface LineaInforme {
  nivel: Nivel;
  titulo: string;
  detalle?: React.ReactNode;
}

export function Informe({ lineas, titulo = 'Comprobación' }: { lineas: LineaInforme[]; titulo?: string }) {
  if (!lineas.length) return null;
  return (
    <div className="informe" aria-live="polite">
      <h3>{titulo}</h3>
      <ul>
        {lineas.map((l, i) => (
          <li key={i} className={`linea ${l.nivel}`}>
            <span className="icono" aria-hidden>
              {l.nivel === 'ok' ? '✓' : l.nivel === 'mal' ? '✗' : l.nivel === 'aviso' ? '!' : 'i'}
            </span>
            <div>
              <strong>{l.titulo}</strong>
              {l.detalle && <div className="detalle">{l.detalle}</div>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Texto con **negrita** y `código`, sin HTML. */
export function Rico({ texto }: { texto: string }) {
  const partes = texto.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {partes.map((p, i) =>
        p.startsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : p.startsWith('`') ? <code key={i}>{p.slice(1, -1)}</code> : <React.Fragment key={i}>{p}</React.Fragment>,
      )}
    </>
  );
}

export const Palabra = ({ w }: { w: string[] }) => <code className="palabra">{verPalabra(w)}</code>;
