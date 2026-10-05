import { useMemo, useState } from 'react';
import { aAFD, cierre, colocar, delta, desdeCompacto, estadosMinimo, iniciales, mover, subconjuntos, vacio } from '../../automata/nucleo';
import { Automata, Transicion } from '../../automata/tipos';
import { FiguraConTabla, VistaAutomata } from '../../editor/Dibujo';
import { Editor } from '../../editor/Editor';
import { Informe, LineaInforme, Probador, TablaDelta } from '../../editor/Herramientas';
import { EjAFNaAFD } from '../../ejercicios/tipos';
import { useBorrador } from '../../progreso';
import { comprobarAutomata, mismoConjunto, parsearConjunto, Seccion, textoConjunto } from '../comun';

interface Fila {
  conj: string;
  dest: string[];
  acepta: boolean;
}

type Marca = 'ok' | 'mal' | '';

export function AFNaAFD({ ej, onResuelto }: { ej: EjAFNaAFD; onResuelto: () => void }) {
  const afn = useMemo(() => desdeCompacto(ej.dado), [ej]);
  const S = afn.alfabeto;
  const filaVacia = (): Fila => ({ conj: '', dest: S.map(() => ''), acepta: false });
  const [filas, setFilas] = useBorrador<Fila[]>(ej.id, 'tabla', () => [filaVacia()]);
  const [afd, setAfd, reiniciar] = useBorrador<Automata>(ej.id, 'afd', () => vacio(S));
  const [nMin, setNMin] = useBorrador(ej.id, 'nmin', () => '');
  const [hechos, setHechos] = useBorrador<string[]>(ej.id, 'hechos', () => []);
  const [marcas, setMarcas] = useState<{ conj: Marca; dest: Marca[]; acepta: Marca; msg?: string }[]>([]);
  const [infTabla, setInfTabla] = useState<LineaInforme[]>([]);
  const [infAfd, setInfAfd] = useState<LineaInforme[]>([]);
  const [infMin, setInfMin] = useState<LineaInforme[]>([]);
  const [activos, setActivos] = useState<Set<string> | null>(null);

  const pasos = ['tabla', 'afd', ...(ej.pedirMinimo ? ['minimo'] : [])];
  const hecho = (p: string, ok: boolean) => {
    const h = ok ? [...new Set([...hechos, p])] : hechos.filter((x) => x !== p);
    setHechos(h);
    if (pasos.every((x) => h.includes(x))) onResuelto();
  };

  const cambiarFila = (i: number, f: Partial<Fila>) => {
    const n = filas.map((x, j) => (j === i ? { ...x, ...f } : x));
    setFilas(n);
    setMarcas([]);
    setInfTabla([]);
  };

  const comprobarTabla = () => {
    const d = delta(afn);
    const F = new Set(afn.estados.filter((e) => e.final).map((e) => e.id));
    const alcanzables = subconjuntos(afn).filas.map((f) => f.R);
    const lineas: LineaInforme[] = [];
    const conjuntosFila: (Set<string> | null)[] = [];
    let todoBien = true;
    const m = filas.map((f, i) => {
      const p = parsearConjunto(f.conj, afn);
      if ('error' in p) {
        todoBien = false;
        conjuntosFila.push(null);
        return { conj: 'mal' as Marca, dest: S.map(() => '' as Marca), acepta: '' as Marca, msg: p.error };
      }
      const R = p.ids;
      conjuntosFila.push(R);
      let conj: Marca = 'ok';
      let msg: string | undefined;
      if (i === 0 && !mismoConjunto(R, cierre(d, iniciales(afn)))) {
        conj = 'mal';
        msg = 'La primera fila es el cierre ε del estado inicial';
        todoBien = false;
      } else if (!alcanzables.some((x) => mismoConjunto(x, R))) {
        conj = 'mal';
        msg = 'Este conjunto no se alcanza';
        todoBien = false;
      }
      const dest = S.map((s, k) => {
        const q = parsearConjunto(f.dest[k], afn);
        if ('error' in q) return 'mal' as Marca;
        return (mismoConjunto(q.ids, cierre(d, mover(d, R, s))) ? 'ok' : 'mal') as Marca;
      });
      if (dest.includes('mal')) todoBien = false;
      const debe = [...R].some((q) => F.has(q));
      const acepta: Marca = f.acepta === debe ? 'ok' : 'mal';
      if (acepta === 'mal') todoBien = false;
      return { conj, dest, acepta, msg };
    });
    // filas repetidas
    for (let i = 0; i < conjuntosFila.length; i++)
      for (let j = i + 1; j < conjuntosFila.length; j++) {
        const x = conjuntosFila[i];
        const y = conjuntosFila[j];
        if (x && y && mismoConjunto(x, y)) {
          todoBien = false;
          lineas.push({ nivel: 'aviso', titulo: `El conjunto ${textoConjunto(x, afn)} aparece en dos filas.` });
        }
      }
    // conjuntos que aparecen como destino (bien calculados) y no tienen fila
    const faltan = new Map<string, Set<string>>();
    filas.forEach((f, i) =>
      S.forEach((_, k) => {
        if (m[i].dest[k] !== 'ok') return;
        const q = parsearConjunto(f.dest[k], afn);
        if ('error' in q) return;
        if (!conjuntosFila.some((x) => x && mismoConjunto(x, q.ids))) faltan.set(textoConjunto(q.ids, afn), q.ids);
      }),
    );
    if (faltan.size) {
      todoBien = false;
      lineas.push({
        nivel: 'mal',
        titulo: `Faltan filas: ${[...faltan.keys()].join(', ')}.`,
        detalle: 'Cada conjunto nuevo que aparece en una casilla es un estado del AFD y necesita su propia fila (también ∅, para que el AFD esté completo).',
      });
    }
    const malas = m.reduce((n, x) => n + x.dest.filter((y) => y === 'mal').length + (x.conj === 'mal' ? 1 : 0) + (x.acepta === 'mal' ? 1 : 0), 0);
    if (malas) lineas.unshift({ nivel: 'mal', titulo: `Hay ${malas} ${malas === 1 ? 'casilla mal' : 'casillas mal'} (en rojo).`, detalle: 'Cada casilla es E(mover(R, símbolo)): primero a dónde se llega con el símbolo y luego su cierre ε.' });
    if (todoBien) lineas.push({ nivel: 'ok', titulo: `Tabla correcta: el AFD tiene ${filas.length} estados.` });
    setMarcas(m);
    setInfTabla(lineas);
    hecho('tabla', todoBien);
  };

  const desdeTabla = () => {
    const nombres = filas.map((f) => {
      const p = parsearConjunto(f.conj, afn);
      return 'ids' in p ? textoConjunto(p.ids, afn) : f.conj;
    });
    const pos = colocar(nombres);
    const estados = filas.map((f, i) => ({ id: `f${i}`, nombre: nombres[i], x: pos[i].x, y: pos[i].y, inicial: i === 0, final: f.acepta }));
    const mapa = new Map<string, Transicion>();
    filas.forEach((f, i) =>
      S.forEach((s, k) => {
        const p = parsearConjunto(f.dest[k], afn);
        if (!('ids' in p)) return;
        const j = filas.findIndex((g) => {
          const q = parsearConjunto(g.conj, afn);
          return 'ids' in q && mismoConjunto(q.ids, p.ids);
        });
        if (j < 0) return;
        const key = `f${i}-f${j}`;
        if (!mapa.has(key)) mapa.set(key, { id: `t${key}`, de: `f${i}`, a: `f${j}`, simbolos: [] });
        mapa.get(key)!.simbolos.push(s);
      }),
    );
    setAfd({ alfabeto: [...S], estados, transiciones: [...mapa.values()] });
    setInfAfd([]);
  };

  const comprobarAfd = () => {
    const r = comprobarAutomata(afd, aAFD(afn));
    setInfAfd(r.lineas.filter((l) => !l.titulo.startsWith('Tu AFD tiene')));
    hecho('afd', r.resuelto);
  };

  const comprobarMin = () => {
    const n = estadosMinimo(aAFD(afn));
    const ok = Number(nMin) === n;
    setInfMin([ok ? { nivel: 'ok', titulo: `Sí: el mínimo tiene ${n} estados.` } : { nivel: 'mal', titulo: 'No es ese número.', detalle: 'Busca estados inaccesibles y parejas de estados equivalentes en tu AFD (tema 1.2).' }]);
    hecho('minimo', ok);
  };

  return (
    <>
      <Seccion titulo="El AFN">
        <FiguraConTabla automata={afn} tabla={<TablaDelta automata={afn} marcarHuecos={false} />}>
<VistaAutomata automata={afn} />
</FiguraConTabla>
      </Seccion>

      <Seccion titulo="Tabla de subconjuntos" n={1}>
        <p className="nota">
          Escribe los conjuntos así: {'{s0, s1}'}. El vacío es ∅ o {'{}'}. La primera fila es el estado inicial del AFD. Marca «acepta» si el conjunto contiene
          algún estado final del AFN.
        </p>
        <div className="tabla-scroll">
          <table className="tabla-entrada subconj">
            <thead>
              <tr>
                <th>R</th>
                {S.map((s) => (
                  <th key={s}>{s}</th>
                ))}
                <th>acepta</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filas.map((f, i) => (
                <tr key={i}>
                  <td className={marcas[i]?.conj}>
                    <span className="flecha-ini">{i === 0 ? '→' : ''}</span>
                    <input className="mono" value={f.conj} onChange={(e) => cambiarFila(i, { conj: e.target.value })} aria-label={`Conjunto de la fila ${i + 1}`} />
                    {marcas[i]?.msg && <span className="error-celda">{marcas[i].msg}</span>}
                  </td>
                  {S.map((s, k) => (
                    <td key={s} className={marcas[i]?.dest[k]}>
                      <input
                        className="mono"
                        value={f.dest[k]}
                        onChange={(e) => {
                          const dd = [...f.dest];
                          dd[k] = e.target.value;
                          cambiarFila(i, { dest: dd });
                        }}
                        aria-label={`Destino con ${s} de la fila ${i + 1}`}
                      />
                    </td>
                  ))}
                  <td className={marcas[i]?.acepta}>
                    <input type="checkbox" checked={f.acepta} onChange={(e) => cambiarFila(i, { acepta: e.target.checked })} />
                  </td>
                  <td>
                    {filas.length > 1 && (
                      <button className="btn-texto peligro" onClick={() => { setFilas(filas.filter((_, j) => j !== i)); setMarcas([]); }} title="Borrar fila">
                        ✕
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="acciones">
          <button className="btn-texto" onClick={() => { setFilas([...filas, filaVacia()]); setMarcas([]); }}>
            + Añadir fila
          </button>
          <button className="btn" onClick={comprobarTabla}>
            Comprobar la tabla
          </button>
          {hechos.includes('tabla') && <span className="sello">Paso resuelto</span>}
        </div>
        <Informe lineas={infTabla} />
      </Seccion>

      <Seccion titulo="Dibuja el AFD" n={2}>
        <Editor valor={afd} onChange={(x) => { setAfd(x); setInfAfd([]); }} activos={activos ?? undefined} />
        <div className="dos-col">
          <Probador automata={afd} onActivos={setActivos} />
          <TablaDelta automata={afd} />
        </div>
        <div className="acciones">
          <button className="btn" onClick={comprobarAfd}>
            Comprobar el AFD
          </button>
          <button className="btn-texto" disabled={!hechos.includes('tabla')} onClick={desdeTabla} title={hechos.includes('tabla') ? '' : 'Primero, la tabla correcta'}>
            Colocar los estados desde mi tabla
          </button>
          <button className="btn-texto" onClick={() => { reiniciar(); setInfAfd([]); }}>
            Empezar de cero
          </button>
          {hechos.includes('afd') && <span className="sello">Paso resuelto</span>}
        </div>
        <Informe lineas={infAfd} />
      </Seccion>

      {ej.pedirMinimo && (
        <Seccion titulo="Y después, simplificar" n={3}>
          <div className="pregunta">
            <span>¿Cuántos estados tiene el AFD mínimo (completo)?</span>
            <input type="number" min={1} value={nMin} onChange={(e) => setNMin(e.target.value)} style={{ width: 80 }} />
            <button className="btn" onClick={comprobarMin}>
              Comprobar
            </button>
            {hechos.includes('minimo') && <span className="sello">Paso resuelto</span>}
          </div>
          <Informe lineas={infMin} />
        </Seccion>
      )}
    </>
  );
}
