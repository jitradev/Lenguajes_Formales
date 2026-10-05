import { useState } from 'react';
import { estructura, vacio } from '../automata/nucleo';
import { Automata } from '../automata/tipos';
import { Editor } from '../editor/Editor';
import { Probador, TablaDelta } from '../editor/Herramientas';
import { useBorrador } from '../progreso';

export function Laboratorio() {
  const [a, setA] = useBorrador<Automata>('laboratorio', 'automata', () => vacio(['a', 'b']));
  const [sigma, setSigma] = useState(a.alfabeto.join(', '));
  const [activos, setActivos] = useState<Set<string> | null>(null);
  const e = estructura(a);

  const aplicarSigma = (txt: string) => {
    setSigma(txt);
    const S = [...new Set(txt.split(/[\s,]+/).filter((x) => x && x !== 'ε'))];
    if (S.length) setA({ ...a, alfabeto: S });
  };

  return (
    <main className="contenido">
      <nav className="miga">
        <a href="#/">Bloques</a>
      </nav>
      <h1>Laboratorio</h1>
      <p className="entradilla">Dibuja lo que quieras, traza palabras y mira su tabla. Aquí no se corrige nada.</p>
      <div className="pregunta">
        <label>
          Σ ={' '}
          <input className="mono" value={sigma} onChange={(ev) => aplicarSigma(ev.target.value)} style={{ width: 160 }} />
        </label>
        <span className="nota">Símbolos separados por comas. Las transiciones ε se pueden usar siempre.</span>
      </div>
      <Editor valor={a} onChange={setA} permiteEpsilon activos={activos ?? undefined} />
      <div className="dos-col">
        <Probador automata={a} onActivos={setActivos} />
        <div>
          <h3 className="sub">Tabla de transiciones</h3>
          <TablaDelta automata={a} />
          {a.estados.length > 0 && (
            <p className="nota">
              {e.total
                ? 'Es un AFD con δ total.'
                : e.esAFD
                  ? `Es un AFD, pero le faltan ${e.huecos.length} transiciones para que δ sea total.`
                  : e.iniciales !== 1
                    ? 'Tiene que haber exactamente un estado inicial.'
                    : 'Es un AFN.'}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
