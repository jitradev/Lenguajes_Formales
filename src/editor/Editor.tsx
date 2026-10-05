// Editor gráfico de autómatas: estados, transiciones, inicial y finales.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { nuevoId } from '../automata/nucleo';
import { Automata, EPS } from '../automata/tipos';
import { CapaAutomata, R } from './Dibujo';

export const ANCHO = 900;
export const ALTO = 440;

type Herramienta = 'mover' | 'estado' | 'transicion' | 'borrar';
type Seleccion = { tipo: 'estado'; id: string } | { tipo: 'transicion'; id: string } | null;

const AYUDA: Record<Herramienta, string> = {
  mover: 'Arrastra los estados para colocarlos. Pulsa un estado o una flecha para editarlo. Doble clic en el lienzo crea un estado; doble clic en un estado lo hace final.',
  estado: 'Pulsa en el lienzo para añadir un estado. El primero que crees será el inicial.',
  transicion: 'Arrastra desde un estado hasta otro (o pulsa uno y luego el otro). Para un bucle, pulsa dos veces el mismo estado. Después elige los símbolos.',
  borrar: 'Pulsa un estado o una flecha para borrarlo.',
};

export interface PropsEditor {
  valor: Automata;
  onChange: (a: Automata) => void;
  permiteEpsilon?: boolean;
  activos?: Set<string>;
}

export function Editor({ valor, onChange, permiteEpsilon, activos }: PropsEditor) {
  const [herr, setHerr] = useState<Herramienta>(valor.estados.length === 0 ? 'estado' : 'mover');
  const [sel, setSel] = useState<Seleccion>(null);
  const [origen, setOrigen] = useState<string | null>(null);
  const [raton, setRaton] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const cajaRef = useRef<HTMLDivElement>(null);
  const arrastre = useRef<{ id: string; dx: number; dy: number; movido: boolean; x0: number; y0: number } | null>(null);
  const pasado = useRef<Automata[]>([]);
  const futuro = useRef<Automata[]>([]);
  const actual = useRef(valor);
  actual.current = valor;
  const clicOrigen = useRef<{ x: number; y: number } | null>(null);

  const cambiar = useCallback(
    (nuevo: Automata, registrar = true) => {
      if (registrar) {
        pasado.current.push(actual.current);
        if (pasado.current.length > 100) pasado.current.shift();
        futuro.current = [];
      }
      onChange(nuevo);
    },
    [onChange],
  );

  const deshacer = () => {
    const p = pasado.current.pop();
    if (!p) return;
    futuro.current.push(actual.current);
    setSel(null);
    onChange(p);
  };
  const rehacer = () => {
    const f = futuro.current.pop();
    if (!f) return;
    pasado.current.push(actual.current);
    setSel(null);
    onChange(f);
  };

  // Las transiciones que se quedan sin símbolos al cambiar la selección se borran.
  const seleccionar = (s: Seleccion) => {
    const a = actual.current;
    if (sel?.tipo === 'transicion' && (s?.tipo !== 'transicion' || s.id !== sel.id)) {
      const t = a.transiciones.find((x) => x.id === sel.id);
      if (t && t.simbolos.length === 0) cambiar({ ...a, transiciones: a.transiciones.filter((x) => x.id !== t.id) }, false);
    }
    setSel(s);
  };

  const punto = (ev: { clientX: number; clientY: number }) => {
    const svg = svgRef.current!;
    const pt = svg.createSVGPoint();
    pt.x = ev.clientX;
    pt.y = ev.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    return { x: Math.max(R + 4, Math.min(ANCHO - R - 4, p.x)), y: Math.max(R + 4, Math.min(ALTO - R - 4, p.y)) };
  };

  const estadoEn = (x: number, y: number) => actual.current.estados.find((e) => Math.hypot(e.x - x, e.y - y) <= R + 4);

  const siguienteNombre = () => {
    const usados = new Set(actual.current.estados.map((e) => e.nombre));
    let i = 0;
    while (usados.has(`q${i}`)) i++;
    return `q${i}`;
  };

  const anadirEstado = (x: number, y: number) => {
    const a = actual.current;
    const id = nuevoId('e');
    const nuevo = { id, nombre: siguienteNombre(), x, y, inicial: !a.estados.some((e) => e.inicial), final: false };
    cambiar({ ...a, estados: [...a.estados, nuevo] });
    setSel({ tipo: 'estado', id });
  };

  const borrarEstado = (id: string) => {
    const a = actual.current;
    const quedan = a.estados.filter((e) => e.id !== id);
    if (a.estados.find((e) => e.id === id)?.inicial && quedan.length && !quedan.some((e) => e.inicial)) quedan[0] = { ...quedan[0], inicial: true };
    cambiar({ ...a, estados: quedan, transiciones: a.transiciones.filter((t) => t.de !== id && t.a !== id) });
    setSel(null);
  };

  const borrarTransicion = (id: string) => {
    const a = actual.current;
    cambiar({ ...a, transiciones: a.transiciones.filter((t) => t.id !== id) });
    setSel(null);
  };

  const crearTransicion = (de: string, a_: string) => {
    const a = actual.current;
    const existe = a.transiciones.find((t) => t.de === de && t.a === a_);
    if (existe) {
      setSel({ tipo: 'transicion', id: existe.id });
      return;
    }
    const id = nuevoId('t');
    cambiar({ ...a, transiciones: [...a.transiciones, { id, de, a: a_, simbolos: [] }] });
    setSel({ tipo: 'transicion', id });
  };

  // ---------------------------------------------------------------- ratón

  const onFondoDown = (ev: React.PointerEvent) => {
    cajaRef.current?.focus();
    const p = punto(ev);
    if (herr === 'estado') anadirEstado(p.x, p.y);
    else {
      seleccionar(null);
      setOrigen(null);
    }
  };

  const onFondoDoble = (ev: React.MouseEvent) => {
    if (herr !== 'mover') return;
    if ((ev.target as Element).closest('.estado, .transicion')) return;
    const p = punto(ev);
    anadirEstado(p.x, p.y);
  };

  const onEstadoDown = (ev: React.PointerEvent, id: string) => {
    ev.stopPropagation();
    cajaRef.current?.focus();
    const a = actual.current;
    const e = a.estados.find((x) => x.id === id)!;
    if (herr === 'borrar') return borrarEstado(id);
    if (herr === 'transicion') {
      if (origen) {
        crearTransicion(origen, id);
        setOrigen(null);
        setRaton(null);
        return;
      }
      setOrigen(id);
      clicOrigen.current = { x: ev.clientX, y: ev.clientY };
      setRaton(punto(ev));
      svgRef.current?.setPointerCapture(ev.pointerId);
      return;
    }
    seleccionar({ tipo: 'estado', id });
    const p = punto(ev);
    arrastre.current = { id, dx: e.x - p.x, dy: e.y - p.y, movido: false, x0: e.x, y0: e.y };
    svgRef.current?.setPointerCapture(ev.pointerId);
  };

  const onMove = (ev: React.PointerEvent) => {
    const p = punto(ev);
    if (arrastre.current) {
      const d = arrastre.current;
      const a = actual.current;
      if (!d.movido) {
        pasado.current.push(a);
        futuro.current = [];
        d.movido = true;
      }
      onChange({ ...a, estados: a.estados.map((e) => (e.id === d.id ? { ...e, x: p.x + d.dx, y: p.y + d.dy } : e)) });
    } else if (origen) setRaton(p);
  };

  const onUp = (ev: React.PointerEvent) => {
    if (arrastre.current) {
      arrastre.current = null;
      return;
    }
    if (origen && clicOrigen.current) {
      const movido = Math.hypot(ev.clientX - clicOrigen.current.x, ev.clientY - clicOrigen.current.y) > 6;
      clicOrigen.current = null;
      if (!movido) return; // modo clic-clic: se espera al segundo estado
      const p = punto(ev);
      const destino = estadoEn(p.x, p.y);
      if (destino) crearTransicion(origen, destino.id);
      setOrigen(null);
      setRaton(null);
    }
  };

  const onTransicionClick = (ev: React.PointerEvent, id: string) => {
    ev.stopPropagation();
    cajaRef.current?.focus();
    if (herr === 'borrar') return borrarTransicion(id);
    if (herr === 'transicion' && origen) return;
    seleccionar({ tipo: 'transicion', id });
  };

  const onEstadoDoble = (id: string) => {
    if (herr !== 'mover') return;
    const a = actual.current;
    cambiar({ ...a, estados: a.estados.map((e) => (e.id === id ? { ...e, final: !e.final } : e)) });
  };

  // ---------------------------------------------------------------- teclado

  const simbolos = [...valor.alfabeto, ...(permiteEpsilon ? [EPS] : [])];

  const alternarSimbolo = (tid: string, s: string) => {
    const a = actual.current;
    cambiar({
      ...a,
      transiciones: a.transiciones.map((t) =>
        t.id === tid ? { ...t, simbolos: t.simbolos.includes(s) ? t.simbolos.filter((x) => x !== s) : [...t.simbolos, s] } : t,
      ),
    });
  };

  const onKey = (ev: React.KeyboardEvent) => {
    if ((ev.target as HTMLElement).tagName === 'INPUT') return;
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'z') {
      ev.preventDefault();
      if (ev.shiftKey) rehacer();
      else deshacer();
      return;
    }
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'y') {
      ev.preventDefault();
      rehacer();
      return;
    }
    if (ev.key === 'Escape') {
      setOrigen(null);
      setRaton(null);
      seleccionar(null);
      return;
    }
    if (ev.key === 'Delete' || ev.key === 'Backspace') {
      if (sel?.tipo === 'estado') borrarEstado(sel.id);
      else if (sel?.tipo === 'transicion') borrarTransicion(sel.id);
      ev.preventDefault();
      return;
    }
    if (sel?.tipo === 'transicion' && simbolos.includes(ev.key)) {
      alternarSimbolo(sel.id, ev.key);
      return;
    }
    if (sel?.tipo === 'transicion' && permiteEpsilon && (ev.key === 'e' || ev.key === 'E') && !simbolos.includes('e')) {
      alternarSimbolo(sel.id, EPS);
      return;
    }
    if (!ev.ctrlKey && !ev.metaKey && !sel) {
      const atajo: Record<string, Herramienta> = { m: 'mover', e: 'estado', t: 'transicion', b: 'borrar' };
      if (atajo[ev.key]) setHerr(atajo[ev.key]);
    }
  };

  useEffect(() => {
    if (herr !== 'transicion') {
      setOrigen(null);
      setRaton(null);
    }
  }, [herr]);

  // ---------------------------------------------------------------- panel

  const estadoSel = sel?.tipo === 'estado' ? valor.estados.find((e) => e.id === sel.id) : undefined;
  const transSel = sel?.tipo === 'transicion' ? valor.transiciones.find((t) => t.id === sel.id) : undefined;
  const nombre = (id: string) => valor.estados.find((e) => e.id === id)?.nombre ?? '?';

  const setEstado = (id: string, cambios: Partial<{ nombre: string; inicial: boolean; final: boolean }>, registrar = true) => {
    const a = actual.current;
    cambiar(
      {
        ...a,
        estados: a.estados.map((e) => {
          if (e.id === id) return { ...e, ...cambios };
          if (cambios.inicial) return { ...e, inicial: false };
          return e;
        }),
      },
      registrar,
    );
  };

  const origenEstado = origen ? valor.estados.find((e) => e.id === origen) : undefined;

  return (
    <div className="editor" ref={cajaRef} tabIndex={0} onKeyDown={onKey}>
      <div className="barra">
        <div className="grupo-herr" role="toolbar" aria-label="Herramientas">
          {(
            [
              ['mover', 'Mover', 'M'],
              ['estado', 'Estado', 'E'],
              ['transicion', 'Transición', 'T'],
              ['borrar', 'Borrar', 'B'],
            ] as [Herramienta, string, string][]
          ).map(([h, txt, k]) => (
            <button key={h} className={`herr ${herr === h ? 'activa' : ''}`} onClick={() => setHerr(h)} title={`${txt} (${k})`}>
              <IconoHerr h={h} /> {txt}
            </button>
          ))}
        </div>
        <div className="grupo-herr">
          <button className="herr" onClick={deshacer} title="Deshacer (Ctrl+Z)" disabled={!pasado.current.length}>
            ↶
          </button>
          <button className="herr" onClick={rehacer} title="Rehacer (Ctrl+Shift+Z)" disabled={!futuro.current.length}>
            ↷
          </button>
          <button
            className="herr"
            onClick={() => {
              if (valor.estados.length === 0) return;
              cambiar({ ...valor, estados: [], transiciones: [] });
              setSel(null);
              setHerr('estado');
            }}
            title="Vaciar el lienzo (se puede deshacer)"
          >
            Vaciar
          </button>
        </div>
      </div>

      <div className="lienzo-caja">
        <svg
          ref={svgRef}
          className={`lienzo herr-${herr}`}
          viewBox={`0 0 ${ANCHO} ${ALTO}`}
          onPointerDown={onFondoDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onDoubleClick={onFondoDoble}
        >
          <rect x={0} y={0} width={ANCHO} height={ALTO} className="fondo" />
          <CapaAutomata
            automata={valor}
            activos={activos}
            seleccionEstado={estadoSel?.id ?? origen}
            seleccionTransicion={transSel?.id}
            onEstadoDown={onEstadoDown}
            onEstadoDoble={onEstadoDoble}
            onTransicionClick={onTransicionClick}
            idMarcador="flecha-editor"
          >
            {origenEstado && raton && (
              <line x1={origenEstado.x} y1={origenEstado.y} x2={raton.x} y2={raton.y} className="prevista" />
            )}
          </CapaAutomata>
          {valor.estados.length === 0 && (
            <text x={ANCHO / 2} y={ALTO / 2} className="vacio-texto">
              Pulsa en el lienzo para crear el primer estado
            </text>
          )}
        </svg>
      </div>

      <div className="panel-prop">
        {estadoSel ? (
          <div className="prop-fila">
            <label>
              Nombre
              <input
                value={estadoSel.nombre}
                onChange={(e) => setEstado(estadoSel.id, { nombre: e.target.value }, false)}
                onFocus={() => {
                  pasado.current.push(actual.current);
                }}
                size={8}
              />
            </label>
            <label className="check">
              <input type="checkbox" checked={estadoSel.inicial} onChange={(e) => setEstado(estadoSel.id, { inicial: e.target.checked })} />
              Inicial
            </label>
            <label className="check">
              <input type="checkbox" checked={estadoSel.final} onChange={(e) => setEstado(estadoSel.id, { final: e.target.checked })} />
              Final (acepta)
            </label>
            <button className="btn-texto peligro" onClick={() => borrarEstado(estadoSel.id)}>
              Borrar estado
            </button>
          </div>
        ) : transSel ? (
          <div className="prop-fila">
            <span className="mono">
              δ({nombre(transSel.de)}, ·) → {nombre(transSel.a)}
            </span>
            <span className="chips">
              {simbolos.map((s) => (
                <button key={s} className={`chip ${transSel.simbolos.includes(s) ? 'on' : ''}`} onClick={() => alternarSimbolo(transSel.id, s)}>
                  {s}
                </button>
              ))}
            </span>
            <span className="nota">
              {transSel.simbolos.length === 0 ? 'Elige al menos un símbolo (también con el teclado).' : 'Puedes pulsar las teclas de los símbolos.'}
            </span>
            <button className="btn-texto peligro" onClick={() => borrarTransicion(transSel.id)}>
              Borrar flecha
            </button>
          </div>
        ) : (
          <p className="ayuda">{origen ? 'Ahora pulsa el estado de destino (o el mismo para un bucle). Esc cancela.' : AYUDA[herr]}</p>
        )}
      </div>
    </div>
  );
}

function IconoHerr({ h }: { h: Herramienta }) {
  const c = { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6 } as const;
  if (h === 'mover')
    return (
      <svg {...c}>
        <path d="M3 2 L3 13 L6 10 L8.5 14.5 L10.3 13.6 L7.8 9.2 L12 9 Z" />
      </svg>
    );
  if (h === 'estado')
    return (
      <svg {...c}>
        <circle cx="8" cy="8" r="5.5" />
      </svg>
    );
  if (h === 'transicion')
    return (
      <svg {...c}>
        <path d="M2 12 Q8 2 14 8" />
        <path d="M11 8.5 L14 8 L13.2 5" />
      </svg>
    );
  return (
    <svg {...c}>
      <path d="M3 3 L13 13 M13 3 L3 13" />
    </svg>
  );
}
