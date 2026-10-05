import { useEffect, useState } from 'react';
import { Rico } from '../editor/Herramientas';
import { buscarEjercicio } from '../ejercicios/registro';
import { Ejercicio } from '../ejercicios/tipos';
import { marcarResuelto, useResueltos } from '../progreso';
import { AFNaAFD } from './tipos/AFNaAFD';
import { Analizar } from './tipos/Analizar';
import { Disenar } from './tipos/Disenar';
import { Equivalencia } from './tipos/Equivalencia';
import { Minimizar } from './tipos/Minimizar';
import { Cierres, Trazar } from './tipos/TrazarCierres';

export const NOMBRE_TIPO: Record<Ejercicio['tipo'], string> = {
  disenar: 'Diseñar',
  analizar: 'Correcto y completo',
  equivalencia: 'Equivalencia',
  minimizar: 'Simplificar',
  trazar: 'Trazar',
  cierres: 'Cierres ε',
  'afn-afd': 'AFN → AFD',
};

function Cuerpo({ ej, onResuelto }: { ej: Ejercicio; onResuelto: () => void }) {
  switch (ej.tipo) {
    case 'disenar':
      return <Disenar ej={ej} onResuelto={onResuelto} />;
    case 'analizar':
      return <Analizar ej={ej} onResuelto={onResuelto} />;
    case 'equivalencia':
      return <Equivalencia ej={ej} onResuelto={onResuelto} />;
    case 'minimizar':
      return <Minimizar ej={ej} onResuelto={onResuelto} />;
    case 'trazar':
      return <Trazar ej={ej} onResuelto={onResuelto} />;
    case 'cierres':
      return <Cierres ej={ej} onResuelto={onResuelto} />;
    case 'afn-afd':
      return <AFNaAFD ej={ej} onResuelto={onResuelto} />;
  }
}

export function EjercicioPagina({ id }: { id: string }) {
  const r = buscarEjercicio(id);
  const resueltos = useResueltos();
  const [pistas, setPistas] = useState(0);
  const [celebrar, setCelebrar] = useState(false);
  useEffect(() => {
    setPistas(0);
    setCelebrar(false);
    window.scrollTo(0, 0);
  }, [id]);
  if (!r) return <p className="contenido">No existe ese ejercicio. <a href="#/">Volver</a></p>;
  const { tema, ejercicio: ej, indice } = r;
  const anterior = tema.ejercicios[indice - 1];
  const siguiente = tema.ejercicios[indice + 1];
  const resuelto = resueltos.has(ej.id);

  return (
    <main className="contenido ejercicio">
      <nav className="miga">
        <a href="#/">Bloques</a> <span>/</span> <a href={`#/tema/${tema.id}`}>Tema {tema.id} · {tema.titulo}</a>
      </nav>
      <header className="cabecera-ej">
        <div>
          <span className="etiqueta-tipo">{NOMBRE_TIPO[ej.tipo]}</span>
          <h1>
            <span className="num-ej">{ej.id}</span> {ej.titulo}
          </h1>
        </div>
        {resuelto && <span className="sello grande">Resuelto</span>}
      </header>
      <p className="enunciado">
        <Rico texto={ej.enunciado} />
      </p>
      {ej.pistas && ej.pistas.length > 0 && (
        <div className="pistas">
          {ej.pistas.slice(0, pistas).map((p, i) => (
            <p key={i} className="pista">
              <strong>Pista {i + 1}.</strong> <Rico texto={p} />
            </p>
          ))}
          {pistas < ej.pistas.length && (
            <button className="btn-texto" onClick={() => setPistas(pistas + 1)}>
              {pistas === 0 ? 'Ver una pista' : 'Otra pista'}
            </button>
          )}
        </div>
      )}

      <Cuerpo
        key={ej.id}
        ej={ej}
        onResuelto={() => {
          marcarResuelto(ej.id);
          setCelebrar(true);
        }}
      />

      {celebrar && (
        <div className="aviso-resuelto" role="status">
          <strong>¡Ejercicio resuelto!</strong>
          {ej.alResolver && (
            <p>
              <Rico texto={ej.alResolver} />
            </p>
          )}
          {siguiente && (
            <a className="btn" href={`#/ej/${siguiente.id}`}>
              Siguiente ejercicio →
            </a>
          )}
        </div>
      )}

      <nav className="pie-nav">
        {anterior ? <a href={`#/ej/${anterior.id}`}>← {anterior.titulo}</a> : <span />}
        {siguiente ? <a href={`#/ej/${siguiente.id}`}>{siguiente.titulo} →</a> : <span />}
      </nav>
    </main>
  );
}
