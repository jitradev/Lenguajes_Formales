import { useMemo, useState } from 'react';
import { cierre, delta, desdeCompacto, trazar } from '../../automata/nucleo';
import { EPS } from '../../automata/tipos';
import { FiguraConTabla, VistaAutomata } from '../../editor/Dibujo';
import { TablaDelta } from '../../editor/Herramientas';
import { EjCierres, EjTrazar } from '../../ejercicios/tipos';
import { useBorrador } from '../../progreso';
import { mismoConjunto, parsearConjunto, Seccion, textoConjunto } from '../comun';

type Marca = 'ok' | 'mal' | '';

export function Trazar({ ej, onResuelto }: { ej: EjTrazar; onResuelto: () => void }) {
  const a = useMemo(() => desdeCompacto(ej.dado), [ej]);
  const [conj, setConj] = useBorrador<string[]>(ej.id, 'conjuntos', () => ej.palabras.map(() => ''));
  const [acepta, setAcepta] = useBorrador<boolean[]>(ej.id, 'acepta', () => ej.palabras.map(() => false));
  const [marcas, setMarcas] = useState<{ c: Marca; a: Marca; msg?: string }[]>([]);

  const comprobar = () => {
    const m = ej.palabras.map((w, i) => {
      const t = trazar(a, [...w]);
      const fin = t.pasos[t.pasos.length - 1].estados;
      const p = parsearConjunto(conj[i], a);
      const c: Marca = 'ids' in p && mismoConjunto(p.ids, fin) ? 'ok' : 'mal';
      return { c, a: (acepta[i] === t.acepta ? 'ok' : 'mal') as Marca, msg: 'error' in p ? p.error : undefined };
    });
    setMarcas(m);
    if (m.every((x) => x.c === 'ok' && x.a === 'ok')) onResuelto();
  };

  return (
    <>
      <Seccion titulo="El AFN">
        <FiguraConTabla automata={a} tabla={<TablaDelta automata={a} marcarHuecos={false} />}>
<VistaAutomata automata={a} />
</FiguraConTabla>
      </Seccion>
      <Seccion titulo="Trazas">
        <p className="nota">Escribe los conjuntos así: {'{n0, n1}'}. El conjunto vacío es ∅ o {'{}'}.</p>
        <table className="tabla-entrada">
          <thead>
            <tr>
              <th>Cadena</th>
              <th>Estados al terminar</th>
              <th>¿Se acepta?</th>
            </tr>
          </thead>
          <tbody>
            {ej.palabras.map((w, i) => (
              <tr key={i}>
                <td className="mono">«{w || EPS}»</td>
                <td className={marcas[i]?.c}>
                  <input
                    className="mono"
                    value={conj[i]}
                    onChange={(e) => {
                      const c = [...conj];
                      c[i] = e.target.value;
                      setConj(c);
                      setMarcas([]);
                    }}
                  />
                  {marcas[i]?.msg && <span className="error-celda">{marcas[i].msg}</span>}
                </td>
                <td className={marcas[i]?.a}>
                  <input
                    type="checkbox"
                    checked={acepta[i]}
                    onChange={(e) => {
                      const c = [...acepta];
                      c[i] = e.target.checked;
                      setAcepta(c);
                      setMarcas([]);
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="acciones">
          <button className="btn" onClick={comprobar}>
            Comprobar
          </button>
          {marcas.length > 0 && (
            <span className="nota">
              {marcas.filter((x) => x.c === 'ok' && x.a === 'ok').length} de {marcas.length} filas bien.
            </span>
          )}
        </div>
      </Seccion>
    </>
  );
}

export function Cierres({ ej, onResuelto }: { ej: EjCierres; onResuelto: () => void }) {
  const a = useMemo(() => desdeCompacto(ej.dado), [ej]);
  const [resp, setResp] = useBorrador<string[]>(ej.id, 'cierres', () => ej.conjuntos.map(() => ''));
  const [marcas, setMarcas] = useState<{ m: Marca; msg?: string }[]>([]);

  const comprobar = () => {
    const d = delta(a);
    const m = ej.conjuntos.map((R, i) => {
      const p = parsearConjunto(resp[i], a);
      if ('error' in p) return { m: 'mal' as Marca, msg: p.error };
      return { m: (mismoConjunto(p.ids, cierre(d, R)) ? 'ok' : 'mal') as Marca };
    });
    setMarcas(m);
    if (m.every((x) => x.m === 'ok')) onResuelto();
  };

  return (
    <>
      <Seccion titulo="El AFN-ε">
        <FiguraConTabla automata={a} tabla={<TablaDelta automata={a} marcarHuecos={false} />}>
<VistaAutomata automata={a} />
</FiguraConTabla>
      </Seccion>
      <Seccion titulo="Cierres">
        <p className="nota">E(R) es R más todos los estados a los que se llega desde R solo con transiciones ε, encadenadas.</p>
        <table className="tabla-entrada">
          <thead>
            <tr>
              <th>R</th>
              <th>E(R)</th>
            </tr>
          </thead>
          <tbody>
            {ej.conjuntos.map((R, i) => (
              <tr key={i}>
                <td className="mono">E({textoConjunto(new Set(R), a)})</td>
                <td className={marcas[i]?.m}>
                  <input
                    className="mono"
                    value={resp[i]}
                    onChange={(e) => {
                      const c = [...resp];
                      c[i] = e.target.value;
                      setResp(c);
                      setMarcas([]);
                    }}
                  />
                  {marcas[i]?.msg && <span className="error-celda">{marcas[i].msg}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="acciones">
          <button className="btn" onClick={comprobar}>
            Comprobar
          </button>
        </div>
      </Seccion>
    </>
  );
}
