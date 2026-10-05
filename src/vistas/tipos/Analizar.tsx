import { useMemo, useState } from 'react';
import { afdDeLenguaje } from '../../automata/lenguaje';
import { aAFD, aceptaAFD, comparar, copiar, desdeCompacto, partirPalabra, trazar } from '../../automata/nucleo';
import { Automata } from '../../automata/tipos';
import { FiguraConTabla, VistaAutomata } from '../../editor/Dibujo';
import { Editor } from '../../editor/Editor';
import { Informe, LineaInforme, Palabra, Probador, TablaDelta } from '../../editor/Herramientas';
import { EjAnalizar } from '../../ejercicios/tipos';
import { useBorrador } from '../../progreso';
import { comprobarAutomata, Seccion, SiNo } from '../comun';

export function Analizar({ ej, onResuelto }: { ej: EjAnalizar; onResuelto: () => void }) {
  const dado = useMemo(() => desdeCompacto(ej.dado), [ej]);
  const ref = useMemo(() => afdDeLenguaje(ej.lenguaje, ej.dado.S), [ej]);
  const real = useMemo(() => comparar(aAFD(dado), ref), [dado, ref]);

  const [correcto, setCorrecto] = useBorrador<boolean | null>(ej.id, 'correcto', () => null);
  const [completo, setCompleto] = useBorrador<boolean | null>(ej.id, 'completo', () => null);
  const [pSobra, setPSobra] = useBorrador(ej.id, 'sobra', () => '');
  const [pFalta, setPFalta] = useBorrador(ej.id, 'falta', () => '');
  const [arreglo, setArreglo, reiniciar] = useBorrador<Automata>(ej.id, 'arreglo', () => copiar(dado));
  const [inf1, setInf1] = useState<LineaInforme[]>([]);
  const [inf2, setInf2] = useState<LineaInforme[]>([]);
  const [ok1, setOk1] = useBorrador(ej.id, 'ok1', () => false);
  const [ok2, setOk2] = useBorrador(ej.id, 'ok2', () => false);
  const [activos, setActivos] = useState<Set<string> | null>(null);

  const comprobarPalabra = (texto: string, debeAceptar: boolean): LineaInforme | null => {
    const w = partirPalabra(texto, dado.alfabeto);
    if (!w) return { nivel: 'mal', titulo: `«${texto}» tiene símbolos fuera de Σ.` };
    const acepta = trazar(dado, w).acepta;
    const enL = aceptaAFD(ref, w);
    if (debeAceptar) {
      // palabra que acepta y no debería
      if (acepta && !enL) return { nivel: 'ok', titulo: 'Contraejemplo válido.', detalle: <><Palabra w={w} /> se acepta y no pertenece al lenguaje.</> };
      return {
        nivel: 'mal',
        titulo: 'Ese contraejemplo no vale.',
        detalle: <><Palabra w={w} /> {acepta ? 'se acepta' : 'se rechaza'} y {enL ? 'sí' : 'no'} pertenece al lenguaje.</>,
      };
    }
    if (!acepta && enL) return { nivel: 'ok', titulo: 'Contraejemplo válido.', detalle: <><Palabra w={w} /> pertenece al lenguaje y se rechaza.</> };
    return {
      nivel: 'mal',
      titulo: 'Ese contraejemplo no vale.',
      detalle: <><Palabra w={w} /> {acepta ? 'se acepta' : 'se rechaza'} y {enL ? 'sí' : 'no'} pertenece al lenguaje.</>,
    };
  };

  const comprobar1 = () => {
    const l: LineaInforme[] = [];
    let bien = true;
    const esCorrecto = real.sobra === null;
    const esCompleto = real.falta === null;
    if (correcto === null || completo === null) {
      setInf1([{ nivel: 'aviso', titulo: 'Contesta las dos preguntas.' }]);
      return;
    }
    if (correcto !== esCorrecto) {
      bien = false;
      l.push({ nivel: 'mal', titulo: correcto ? 'Revisa: ¿de verdad no acepta nada que sobre?' : 'Revisa: ¿qué palabra acepta que no debería?' });
    } else if (!correcto) {
      const r = comprobarPalabra(pSobra, true)!;
      if (r.nivel !== 'ok') bien = false;
      l.push({ ...r, titulo: `Correcto: no. ${r.titulo}` });
    } else l.push({ nivel: 'ok', titulo: 'Sí, es correcto.' });
    if (completo !== esCompleto) {
      bien = false;
      l.push({ nivel: 'mal', titulo: completo ? 'Revisa: ¿de verdad acepta todas las del lenguaje?' : 'Revisa: ¿qué palabra del lenguaje rechaza?' });
    } else if (!completo) {
      const r = comprobarPalabra(pFalta, false)!;
      if (r.nivel !== 'ok') bien = false;
      l.push({ ...r, titulo: `Completo: no. ${r.titulo}` });
    } else l.push({ nivel: 'ok', titulo: 'Sí, es completo.' });
    setInf1(l);
    setOk1(bien);
    if (bien && ok2) onResuelto();
  };

  const comprobar2 = () => {
    const r = comprobarAutomata(arreglo, ref);
    setInf2(r.lineas);
    setOk2(r.resuelto);
    if (r.resuelto && ok1) onResuelto();
  };

  return (
    <>
      <Seccion titulo="El autómata dado" n={1}>
        <p>
          Pretende reconocer <strong>{ej.descripcionLenguaje}</strong>.
        </p>
        <FiguraConTabla automata={dado} tabla={<TablaDelta automata={dado} />}>
          <VistaAutomata automata={dado} />
        </FiguraConTabla>
        <div className="preguntas">
          <div className="pregunta">
            <span>¿Es correcto? (no acepta ninguna palabra que no debería)</span>
            <SiNo valor={correcto} onChange={setCorrecto} nombre="correcto" />
            {correcto === false && (
              <input className="mono" value={pSobra} onChange={(e) => setPSobra(e.target.value)} placeholder="palabra que acepta y no debería" />
            )}
          </div>
          <div className="pregunta">
            <span>¿Es completo? (acepta todas las palabras del lenguaje)</span>
            <SiNo valor={completo} onChange={setCompleto} nombre="completo" />
            {completo === false && (
              <input className="mono" value={pFalta} onChange={(e) => setPFalta(e.target.value)} placeholder="palabra que debería aceptar y no acepta" />
            )}
          </div>
        </div>
        <div className="acciones">
          <button className="btn" onClick={comprobar1}>
            Comprobar respuestas
          </button>
          {ok1 && <span className="sello">Parte resuelta</span>}
        </div>
        <Informe lineas={inf1} />
      </Seccion>

      <Seccion titulo="Arréglalo cambiando lo mínimo" n={2}>
        <Editor valor={arreglo} onChange={(x) => { setArreglo(x); setInf2([]); }} activos={activos ?? undefined} />
        <div className="dos-col">
          <Probador automata={arreglo} onActivos={setActivos} />
          <TablaDelta automata={arreglo} />
        </div>
        <div className="acciones">
          <button className="btn" onClick={comprobar2}>
            Comprobar el arreglo
          </button>
          <button className="btn-texto" onClick={() => { reiniciar(); setInf2([]); }}>
            Volver al autómata original
          </button>
          {ok2 && <span className="sello">Parte resuelta</span>}
        </div>
        <Informe lineas={inf2} />
      </Seccion>
    </>
  );
}
