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
      <div className="lab-cabecera">
        <div className="pregunta">
          <label>
            Σ ={' '}
            <input className="mono" value={sigma} onChange={(ev) => aplicarSigma(ev.target.value)} style={{ width: 160 }} />
          </label>
          <span className="nota">Símbolos separados por comas. Las transiciones ε se pueden usar siempre.</span>
        </div>
        <div className="grupo-fichero" title="Formato de la práctica P1a: «inicial q0», «finales q1 q2» y una transición «origen símbolo destino» por línea">
          <button className="btn-borde" onClick={() => fichero.current?.click()}>
            <IconoFichero subir /> Importar .txt
          </button>
          <button className="btn-borde" onClick={exportar} disabled={!a.estados.length}>
            <IconoFichero /> Exportar .txt
          </button>
        </div>
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
      </div>
      {errorFichero && <p className="error-fichero">{errorFichero}</p>}
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

function IconoFichero({ subir = false }: { subir?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 10.5 V13 H13.5 V10.5" />
      {subir ? <path d="M8 10 V2.5 M5 5.5 L8 2.5 L11 5.5" /> : <path d="M8 2.5 V10 M5 7 L8 10 L11 7" />}
    </svg>
  );
}
