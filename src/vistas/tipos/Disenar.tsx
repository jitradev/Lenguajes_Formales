import { useMemo, useState } from 'react';
import { afdDeLenguaje } from '../../automata/lenguaje';
import { desdeCompacto, vacio } from '../../automata/nucleo';
import { Automata } from '../../automata/tipos';
import { Editor } from '../../editor/Editor';
import { Informe, LineaInforme, Probador, TablaDelta } from '../../editor/Herramientas';
import { EjDisenar } from '../../ejercicios/tipos';
import { useBorrador } from '../../progreso';
import { comprobarAutomata, Seccion } from '../comun';

export function Disenar({ ej, onResuelto }: { ej: EjDisenar; onResuelto: () => void }) {
  const [a, setA, reiniciar] = useBorrador<Automata>(ej.id, 'automata', () => vacio(ej.alfabeto));
  const [activos, setActivos] = useState<Set<string> | null>(null);
  const [informe, setInforme] = useState<LineaInforme[]>([]);
  const referencia = useMemo(() => afdDeLenguaje(ej.lenguaje, ej.alfabeto), [ej]);
  const tabla = useMemo(() => (ej.tablaDada ? desdeCompacto(ej.tablaDada) : null), [ej]);

  const comprobar = () => {
    const r = comprobarAutomata(a, referencia, { permiteAFN: ej.permiteAFN, maxEstados: ej.maxEstados });
    setInforme(r.lineas);
    if (r.resuelto) onResuelto();
  };

  return (
    <>
      {tabla && (
        <Seccion titulo="La tabla del enunciado">
          <TablaDelta automata={tabla} />
        </Seccion>
      )}
      <Seccion titulo={ej.permiteAFN ? 'Dibuja tu autómata (vale un AFN)' : 'Dibuja tu AFD'}>
        <p className="sigma">
          Σ = {'{'}
          {ej.alfabeto.join(', ')}
          {'}'}
        </p>
        <Editor
          valor={a}
          onChange={(x) => {
            setA(x);
            setInforme([]);
          }}
          permiteEpsilon={ej.permiteAFN}
          activos={activos ?? undefined}
        />
        <div className="dos-col">
          <Probador automata={a} pruebas={ej.pruebas} onActivos={setActivos} />
          <div>
            <h3 className="sub">Tabla de transiciones</h3>
            {a.estados.length ? <TablaDelta automata={a} /> : <p className="nota">Aparecerá al dibujar.</p>}
          </div>
        </div>
        <div className="acciones">
          <button className="btn" onClick={comprobar}>
            Comprobar
          </button>
          <button
            className="btn-texto"
            onClick={() => {
              reiniciar();
              setInforme([]);
            }}
          >
            Empezar de cero
          </button>
        </div>
        <Informe lineas={informe} />
      </Seccion>
    </>
  );
}
