import { useMemo, useState } from 'react';
import { aAFD, accesibles, desdeCompacto, distingueEstados, paresEquivalentes, vacio } from '../../automata/nucleo';
import { Automata } from '../../automata/tipos';
import { FiguraConTabla, VistaAutomata } from '../../editor/Dibujo';
import { Editor } from '../../editor/Editor';
import { Informe, LineaInforme, Palabra, Probador, TablaDelta } from '../../editor/Herramientas';
import { EjMinimizar, PasoMinimizar } from '../../ejercicios/tipos';
import { useBorrador } from '../../progreso';
import { comprobarAutomata, Seccion } from '../comun';

export function Minimizar({ ej, onResuelto }: { ej: EjMinimizar; onResuelto: () => void }) {
  const dado = useMemo(() => desdeCompacto(ej.dado), [ej]);
  const acc = useMemo(() => accesibles(dado), [dado]);
  const inaccesibles = useMemo(() => new Set(dado.estados.filter((e) => !acc.has(e.id)).map((e) => e.id)), [dado, acc]);
  const equivalentes = useMemo(() => paresEquivalentes(dado), [dado]);
  const nombre = (id: string) => dado.estados.find((e) => e.id === id)!.nombre;

  const [marcados, setMarcados] = useBorrador<string[]>(ej.id, 'inaccesibles', () => []);
  const [pares, setPares] = useBorrador<string[]>(ej.id, 'pares', () => []);
  const [minimo, setMinimo, reiniciar] = useBorrador<Automata>(ej.id, 'minimo', () => vacio(dado.alfabeto));
  const [hechos, setHechos] = useBorrador<PasoMinimizar[]>(ej.id, 'hechos', () => []);
  const [inf, setInf] = useState<Partial<Record<PasoMinimizar, LineaInforme[]>>>({});
  const [activos, setActivos] = useState<Set<string> | null>(null);

  const hecho = (p: PasoMinimizar, ok: boolean) => {
    const h = ok ? [...new Set([...hechos, p])] : hechos.filter((x) => x !== p);
    setHechos(h);
    if (ej.pasos.every((x) => h.includes(x))) onResuelto();
  };

  // Parejas candidatas: entre estados accesibles.
  const candidatos = useMemo(() => {
    const Q = dado.estados.filter((e) => acc.has(e.id));
    const res: [string, string][] = [];
    for (let i = 0; i < Q.length; i++) for (let j = i + 1; j < Q.length; j++) res.push([Q[i].id, Q[j].id]);
    return res;
  }, [dado, acc]);
  const k = (p: [string, string]) => `${p[0]}|${p[1]}`;

  const comprobarInacc = () => {
    const m = new Set(marcados);
    const l: LineaInforme[] = [];
    const sobran = [...m].filter((x) => !inaccesibles.has(x));
    const faltan = [...inaccesibles].filter((x) => !m.has(x));
    if (sobran.length) l.push({ nivel: 'mal', titulo: `${sobran.map(nombre).join(', ')} ${sobran.length > 1 ? 'son accesibles' : 'es accesible'}.`, detalle: 'Se llega desde el estado inicial siguiendo alguna flecha.' });
    if (faltan.length) l.push({ nivel: 'mal', titulo: `Te ${faltan.length > 1 ? 'faltan estados inaccesibles' : 'falta un estado inaccesible'}.`, detalle: 'Recorre el autómata desde el inicial y apunta a qué estados llegas: los demás sobran.' });
    if (!sobran.length && !faltan.length)
      l.push({ nivel: 'ok', titulo: inaccesibles.size ? `Bien: ${[...inaccesibles].map(nombre).join(', ')} no se alcanzan nunca.` : 'Bien: todos los estados son accesibles.' });
    setInf({ ...inf, inaccesibles: l });
    hecho('inaccesibles', !sobran.length && !faltan.length);
  };

  const comprobarPares = () => {
    const elegidos = new Set(pares);
    const ok = new Set(equivalentes.map(k));
    const l: LineaInforme[] = [];
    for (const p of candidatos) {
      const kk = k(p);
      if (elegidos.has(kk) && !ok.has(kk)) {
        const w = distingueEstados(dado, p[0], p[1])!;
        l.push({
          nivel: 'mal',
          titulo: `${nombre(p[0])} y ${nombre(p[1])} no son equivalentes.`,
          detalle: <>Los distingue <Palabra w={w} />: desde uno se acepta y desde el otro no.</>,
        });
      }
    }
    const faltan = equivalentes.filter((p) => !elegidos.has(k(p)));
    if (faltan.length) l.push({ nivel: 'mal', titulo: `Te ${faltan.length > 1 ? `faltan ${faltan.length} parejas` : 'falta una pareja'} de estados equivalentes.` });
    const bien = l.length === 0;
    if (bien)
      l.push({
        nivel: 'ok',
        titulo: equivalentes.length ? `Bien: ${equivalentes.map((p) => `${nombre(p[0])} ≈ ${nombre(p[1])}`).join(', ')}.` : 'Bien: no hay estados equivalentes.',
      });
    setInf({ ...inf, equivalentes: l });
    hecho('equivalentes', bien);
  };

  const comprobarMinimo = () => {
    const r = comprobarAutomata(minimo, aAFD(dado), { exigirMinimo: true });
    setInf({ ...inf, minimo: r.lineas });
    hecho('minimo', r.resuelto);
  };

  const marcadosSet = new Set(marcados);
  let n = 0;

  return (
    <>
      <Seccion titulo="El AFD de partida">
        <FiguraConTabla automata={dado} tabla={<TablaDelta automata={dado} />}>
<VistaAutomata
            automata={dado}
            marcados={ej.pasos.includes('inaccesibles') ? marcadosSet : undefined}
            onEstadoClick={
              ej.pasos.includes('inaccesibles')
                ? (id) => setMarcados(marcadosSet.has(id) ? marcados.filter((x) => x !== id) : [...marcados, id])
                : undefined
            }
          />
</FiguraConTabla>
      </Seccion>

      {ej.pasos.includes('inaccesibles') && (
        <Seccion titulo="Estados inaccesibles" n={++n}>
          <p>
            Pulsa sobre el dibujo los estados a los que <strong>no se llega nunca</strong> desde el inicial. Marcados:{' '}
            <span className="mono">{marcados.length ? marcados.map(nombre).join(', ') : 'ninguno'}</span>
          </p>
          <div className="acciones">
            <button className="btn" onClick={comprobarInacc}>
              Comprobar
            </button>
            {hechos.includes('inaccesibles') && <span className="sello">Paso resuelto</span>}
          </div>
          <Informe lineas={inf.inaccesibles ?? []} />
        </Seccion>
      )}

      {ej.pasos.includes('equivalentes') && (
        <Seccion titulo="Estados equivalentes" n={++n}>
          <p>Marca las parejas de estados (accesibles) que son equivalentes. Usa el teorema de Moore con cada pareja candidata.</p>
          <div className="parejas">
            {candidatos.map((p) => {
              const kk = k(p);
              const on = pares.includes(kk);
              return (
                <label key={kk} className={`pareja ${on ? 'on' : ''}`}>
                  <input type="checkbox" checked={on} onChange={() => setPares(on ? pares.filter((x) => x !== kk) : [...pares, kk])} />
                  <span className="mono">
                    {nombre(p[0])} ≈ {nombre(p[1])}
                  </span>
                </label>
              );
            })}
          </div>
          <div className="acciones">
            <button className="btn" onClick={comprobarPares}>
              Comprobar
            </button>
            {hechos.includes('equivalentes') && <span className="sello">Paso resuelto</span>}
          </div>
          <Informe lineas={inf.equivalentes ?? []} />
        </Seccion>
      )}

      {ej.pasos.includes('minimo') && (
        <Seccion titulo="Dibuja el AFD mínimo" n={++n}>
          <Editor valor={minimo} onChange={(x) => { setMinimo(x); setInf({ ...inf, minimo: [] }); }} activos={activos ?? undefined} />
          <div className="dos-col">
            <Probador automata={minimo} onActivos={setActivos} />
            <TablaDelta automata={minimo} />
          </div>
          <div className="acciones">
            <button className="btn" onClick={comprobarMinimo}>
              Comprobar
            </button>
            <button className="btn-texto" onClick={() => { reiniciar(); setInf({ ...inf, minimo: [] }); }}>
              Empezar de cero
            </button>
            <button
              className="btn-texto"
              onClick={() => {
                const copia = desdeCompacto(ej.dado);
                // escala al lienzo del editor
                const xs = copia.estados.map((e) => e.x);
                const f = Math.min(1, 760 / Math.max(1, Math.max(...xs) - Math.min(...xs)));
                const x0 = Math.min(...xs);
                copia.estados = copia.estados.map((e) => ({ ...e, x: 90 + (e.x - x0) * f, y: 60 + e.y * 0.9 }));
                setMinimo(copia);
                setInf({ ...inf, minimo: [] });
              }}
            >
              Partir del AFD dado
            </button>
            {hechos.includes('minimo') && <span className="sello">Paso resuelto</span>}
          </div>
          <Informe lineas={inf.minimo ?? []} />
        </Seccion>
      )}
    </>
  );
}
