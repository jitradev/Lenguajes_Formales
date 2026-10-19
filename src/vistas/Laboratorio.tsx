import { useRef, useState } from 'react';
import { aTexto, desdeTexto } from '../automata/formato';
import { estructura, vacio } from '../automata/nucleo';
import { Automata } from '../automata/tipos';
import { Editor } from '../editor/Editor';
import { Probador, TablaDelta } from '../editor/Herramientas';
import { useBorrador } from '../progreso';

export function Laboratorio() {
  const [a, setA] = useBorrador<Automata>('laboratorio', 'automata', () => vacio(['a', 'b']));
  const [sigma, setSigma] = useState(a.alfabeto.join(', '));
  const [activos, setActivos] = useState<Set<string> | null>(null);
  const [errorFichero, setErrorFichero] = useState('');
  const fichero = useRef<HTMLInputElement>(null);
  const e = estructura(a);

  const importar = async (f: File | undefined) => {
    if (!f) return;
    const r = desdeTexto(await f.text());
    if ('error' in r) {
      setErrorFichero(`${f.name}: ${r.error}`);
      return;
    }
    setErrorFichero('');
    setA(r.automata);
    setSigma(r.automata.alfabeto.join(', '));
  };

  const exportar = () => {
    const url = URL.createObjectURL(new Blob([aTexto(a)], { type: 'text/plain' }));
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = 'automata.txt';
    enlace.click();
    URL.revokeObjectURL(url);
  };

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
      <div className="pregunta">
        <button className="btn-texto" onClick={() => fichero.current?.click()}>
          Importar .txt
        </button>
        <button className="btn-texto" onClick={exportar} disabled={!a.estados.length}>
          Exportar .txt
        </button>
        <input
          ref={fichero}
          type="file"
          accept=".txt,text/plain"
          hidden
          onChange={(ev) => {
            importar(ev.target.files?.[0]);
            ev.target.value = '';
          }}
        />
        <span className="nota">
          Formato de la práctica P1a: <code>inicial q0</code>, <code>finales q1 q2</code> y una transición <code>origen símbolo destino</code> por línea.
        </span>
      </div>
      {errorFichero && <p className="nota" style={{ color: 'var(--carmin)' }}>{errorFichero}</p>}
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
