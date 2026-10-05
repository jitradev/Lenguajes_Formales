import { useMemo, useState } from 'react';
import { aAFD, desdeCompacto, diferencia, partirPalabra, trazar, verPalabra } from '../../automata/nucleo';
import { VistaAutomata } from '../../editor/Dibujo';
import { Informe, LineaInforme, Palabra, TablaDelta } from '../../editor/Herramientas';
import { EjEquivalencia } from '../../ejercicios/tipos';
import { useBorrador } from '../../progreso';
import { Seccion, SiNo } from '../comun';

export function Equivalencia({ ej, onResuelto }: { ej: EjEquivalencia; onResuelto: () => void }) {
  const A = useMemo(() => desdeCompacto(ej.A), [ej]);
  const B = useMemo(() => desdeCompacto(ej.B), [ej]);
  const nA = ej.nombreA ?? 'M₁';
  const nB = ej.nombreB ?? 'M₂';
  const distinguen = useMemo(() => {
    const x = diferencia(aAFD(A), aAFD(B));
    const y = diferencia(aAFD(B), aAFD(A));
    if (!x) return y;
    if (!y) return x;
    return x.length <= y.length ? x : y;
  }, [A, B]);

  const [resp, setResp] = useBorrador<boolean | null>(ej.id, 'equivalentes', () => null);
  const [palabra, setPalabra] = useBorrador(ej.id, 'palabra', () => '');
  const [quien, setQuien] = useBorrador<'A' | 'B' | ''>(ej.id, 'quien', () => '');
  const [informe, setInforme] = useState<LineaInforme[]>([]);
  const [prueba, setPrueba] = useState('');

  const comprobar = () => {
    if (resp === null) return setInforme([{ nivel: 'aviso', titulo: 'Decide primero si son equivalentes.' }]);
    const son = distinguen === null;
    if (resp && son) {
      setInforme([{ nivel: 'ok', titulo: 'Sí, son equivalentes: reconocen el mismo lenguaje.', detalle: 'En la tabla de Moore nunca aparece una pareja con un estado de aceptación y otro que no lo es.' }]);
      return onResuelto();
    }
    if (resp && !son)
      return setInforme([{ nivel: 'mal', titulo: 'No son equivalentes.', detalle: 'Hay palabras que uno acepta y el otro no. Sigue la tabla de Moore hasta encontrar una pareja incompatible.' }]);
    if (!resp && son)
      return setInforme([{ nivel: 'mal', titulo: 'Revisa: son equivalentes.', detalle: 'No existe ninguna palabra que acepte uno y rechace el otro.' }]);
    const w = partirPalabra(palabra, A.alfabeto);
    if (!w) return setInforme([{ nivel: 'mal', titulo: 'Escribe la palabra que los distingue (con símbolos de Σ).' }]);
    const ta = trazar(A, w).acepta;
    const tb = trazar(B, w).acepta;
    const l: LineaInforme[] = [{ nivel: 'ok', titulo: 'Bien: no son equivalentes.' }];
    let bien = true;
    if (ta === tb) {
      bien = false;
      l.push({ nivel: 'mal', titulo: 'Esa palabra no los distingue.', detalle: <><Palabra w={w} /> {ta ? 'la aceptan' : 'la rechazan'} los dos.</> });
    } else {
      l.push({ nivel: 'ok', titulo: 'La palabra los distingue.', detalle: <><Palabra w={w} /> la acepta {ta ? nA : nB} y la rechaza {ta ? nB : nA}.</> });
      const acierto = (quien === 'A' && ta) || (quien === 'B' && tb);
      if (!quien) {
        bien = false;
        l.push({ nivel: 'aviso', titulo: 'Indica cuál de los dos la acepta.' });
      } else if (!acierto) {
        bien = false;
        l.push({ nivel: 'mal', titulo: `No: la acepta ${ta ? nA : nB}.` });
      }
      if (w.length > distinguen!.length) {
        bien = false;
        l.push({ nivel: 'aviso', titulo: `Vale como contraejemplo, pero hay una más corta: de longitud ${distinguen!.length}.` });
      } else l.push({ nivel: 'ok', titulo: 'Y es de las más cortas posibles.' });
    }
    setInforme(l);
    if (bien) onResuelto();
  };

  const wp = partirPalabra(prueba, A.alfabeto);

  return (
    <>
      <Seccion titulo="Los dos autómatas">
        <div className="dos-col">
          {[
            [nA, A],
            [nB, B],
          ].map(([n, m]) => (
            <figure key={n as string} className="figura">
              <figcaption>{n as string}</figcaption>
              <VistaAutomata automata={m as typeof A} alto={260} />
              <TablaDelta automata={m as typeof A} />
            </figure>
          ))}
        </div>
        <div className="probador compacto">
          <label>
            Probar una palabra en los dos
            <input className="mono" value={prueba} onChange={(e) => setPrueba(e.target.value)} placeholder="p. ej. 011" />
          </label>
          {prueba && wp && (
            <span className="mono">
              «{verPalabra(wp)}»: {nA} {trazar(A, wp).acepta ? 'acepta' : 'rechaza'} · {nB} {trazar(B, wp).acepta ? 'acepta' : 'rechaza'}
            </span>
          )}
        </div>
      </Seccion>
      <Seccion titulo="Tu respuesta">
        <div className="preguntas">
          <div className="pregunta">
            <span>¿Son equivalentes?</span>
            <SiNo valor={resp} onChange={setResp} nombre="equiv" />
          </div>
          {resp === false && (
            <div className="pregunta">
              <span>Palabra más corta que los distingue</span>
              <input className="mono" value={palabra} onChange={(e) => setPalabra(e.target.value)} placeholder="vacío = ε" />
              <span>la acepta</span>
              <select value={quien} onChange={(e) => setQuien(e.target.value as 'A' | 'B' | '')}>
                <option value="">…</option>
                <option value="A">{nA}</option>
                <option value="B">{nB}</option>
              </select>
            </div>
          )}
        </div>
        <div className="acciones">
          <button className="btn" onClick={comprobar}>
            Comprobar
          </button>
        </div>
        <Informe lineas={informe} />
      </Seccion>
    </>
  );
}
