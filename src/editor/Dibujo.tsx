// Dibujo SVG de un autómata. Lo usan el editor y las vistas de solo lectura.

import React from 'react';
import { Automata, Estado, Transicion } from '../automata/tipos';

export const R = 24;

export interface Geometria {
  d: string;
  lx: number;
  ly: number;
}

function ordenar(simbolos: string[], alfabeto: string[]) {
  return [...simbolos].sort((a, b) => {
    const ia = alfabeto.indexOf(a);
    const ib = alfabeto.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
}

/** Ángulo (radianes, SVG) hacia el que sale el bucle de un estado: el hueco más grande entre sus aristas. */
function anguloBucle(a: Automata, e: Estado): number {
  const angulos: number[] = [];
  for (const t of a.transiciones) {
    if (t.de === t.a) continue;
    const otro = t.de === e.id ? t.a : t.a === e.id ? t.de : null;
    if (!otro) continue;
    const o = a.estados.find((x) => x.id === otro);
    if (o) angulos.push(Math.atan2(o.y - e.y, o.x - e.x));
  }
  if (e.inicial) angulos.push(Math.PI);
  const candidatos = [-Math.PI / 2, Math.PI / 2, 0, Math.PI, -Math.PI / 4, (-3 * Math.PI) / 4, Math.PI / 4, (3 * Math.PI) / 4];
  let mejor = candidatos[0];
  let mejorDist = -1;
  for (const c of candidatos) {
    let dmin = Math.PI;
    for (const x of angulos) {
      let d = Math.abs(c - x) % (2 * Math.PI);
      if (d > Math.PI) d = 2 * Math.PI - d;
      dmin = Math.min(dmin, d);
    }
    if (dmin > mejorDist + 0.3) {
      mejor = c;
      mejorDist = dmin;
    }
  }
  return mejor;
}

export function geometria(a: Automata, t: Transicion): Geometria | null {
  const p = a.estados.find((e) => e.id === t.de);
  const q = a.estados.find((e) => e.id === t.a);
  if (!p || !q) return null;
  if (p.id === q.id) {
    const ang = anguloBucle(a, p);
    const rot = (x: number, y: number) => {
      // coordenadas locales con el bucle «hacia arriba» (-y) → rotadas
      const th = ang + Math.PI / 2;
      return [p.x + x * Math.cos(th) - y * Math.sin(th), p.y + x * Math.sin(th) + y * Math.cos(th)];
    };
    const [x1, y1] = rot(-11, -R + 3);
    const [c1x, c1y] = rot(-38, -R - 52);
    const [c2x, c2y] = rot(38, -R - 52);
    const [x2, y2] = rot(11, -R + 1);
    const [lx, ly] = rot(0, -R - 50);
    return { d: `M${x1},${y1} C${c1x},${c1y} ${c2x},${c2y} ${x2},${y2}`, lx, ly: ly + 5 };
  }
  const dx = q.x - p.x;
  const dy = q.y - p.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const nx = uy; // normal a la izquierda de quien va de p a q
  const ny = -ux;
  const reciproca = a.transiciones.some((o) => o.de === t.a && o.a === t.de);
  // ¿La recta pasaría por encima de otro estado? Entonces se curva.
  const tapa = a.estados.some((o) => {
    if (o.id === p.id || o.id === q.id) return false;
    const k = ((o.x - p.x) * ux + (o.y - p.y) * uy) / len;
    if (k <= 0 || k >= 1) return false;
    return Math.abs((o.x - p.x) * nx + (o.y - p.y) * ny) < R + 10;
  });
  if (!reciproca && !tapa) {
    const sx = p.x + ux * R;
    const sy = p.y + uy * R;
    const ex = q.x - ux * (R + 2);
    const ey = q.y - uy * (R + 2);
    const mx = (p.x + q.x) / 2;
    const my = (p.y + q.y) / 2;
    return { d: `M${sx},${sy} L${ex},${ey}`, lx: mx + nx * 13, ly: my + ny * 13 + 5 };
  }
  const off = tapa ? Math.min(90, Math.max(50, len / 5)) : Math.min(34, len / 3);
  const mx = (p.x + q.x) / 2;
  const my = (p.y + q.y) / 2;
  const cx = mx + nx * off * 2;
  const cy = my + ny * off * 2;
  const hacia = (ox: number, oy: number, d: number) => {
    const vx = cx - ox;
    const vy = cy - oy;
    const l = Math.hypot(vx, vy) || 1;
    return [ox + (vx / l) * d, oy + (vy / l) * d];
  };
  const [sx, sy] = hacia(p.x, p.y, R);
  const [ex, ey] = hacia(q.x, q.y, R + 2);
  return { d: `M${sx},${sy} Q${cx},${cy} ${ex},${ey}`, lx: mx + nx * (off + 13), ly: my + ny * (off + 13) + 5 };
}

export function cajaDe(a: Automata, margen = 95): [number, number, number, number] {
  if (a.estados.length === 0) return [0, 0, 400, 200];
  const xs = a.estados.map((e) => e.x);
  const ys = a.estados.map((e) => e.y);
  const x0 = Math.min(...xs) - margen - 30;
  const y0 = Math.min(...ys) - margen - 20;
  const x1 = Math.max(...xs) + margen;
  const y1 = Math.max(...ys) + margen;
  return [x0, y0, x1 - x0, y1 - y0];
}

export interface PropsDibujo {
  automata: Automata;
  /** Estados activos (probador). */
  activos?: Set<string>;
  /** Estados seleccionados o marcados por el alumno. */
  marcados?: Set<string>;
  /** Estados que se muestran apagados (p. ej. inaccesibles ya quitados). */
  apagados?: Set<string>;
  seleccionEstado?: string | null;
  seleccionTransicion?: string | null;
  onEstadoDown?: (e: React.PointerEvent, id: string) => void;
  onEstadoUp?: (e: React.PointerEvent, id: string) => void;
  onEstadoDoble?: (id: string) => void;
  onTransicionClick?: (e: React.PointerEvent, id: string) => void;
  /** Contenido extra (líneas de previsualización del editor). */
  children?: React.ReactNode;
  idMarcador?: string;
}

export function CapaAutomata({
  automata: a,
  activos,
  marcados,
  apagados,
  seleccionEstado,
  seleccionTransicion,
  onEstadoDown,
  onEstadoUp,
  onEstadoDoble,
  onTransicionClick,
  children,
  idMarcador = 'flecha',
}: PropsDibujo) {
  return (
    <g className="automata">
      <defs>
        <marker id={idMarcador} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0.8 L10,5 L0,9.2 z" className="punta" />
        </marker>
        <marker id={`${idMarcador}-sel`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0.8 L10,5 L0,9.2 z" className="punta sel" />
        </marker>
      </defs>
      {a.estados
        .filter((e) => e.inicial)
        .map((e) => (
          <path
            key={`ini-${e.id}`}
            d={`M${e.x - R - 38},${e.y} L${e.x - R - 3},${e.y}`}
            className={`arista ${apagados?.has(e.id) ? 'apagada' : ''}`}
            markerEnd={`url(#${idMarcador})`}
          />
        ))}
      {a.transiciones.map((t) => {
        const g = geometria(a, t);
        if (!g) return null;
        const sel = t.id === seleccionTransicion;
        const apagada = apagados?.has(t.de) || apagados?.has(t.a);
        return (
          <g key={t.id} className={`transicion ${sel ? 'sel' : ''} ${apagada ? 'apagada' : ''}`}>
            <path d={g.d} className="arista" markerEnd={`url(#${sel ? `${idMarcador}-sel` : idMarcador})`} />
            <path
              d={g.d}
              className="arista-toque"
              onPointerDown={onTransicionClick ? (ev) => onTransicionClick(ev, t.id) : undefined}
            />
            <text
              x={g.lx}
              y={g.ly}
              className="etiqueta"
              onPointerDown={onTransicionClick ? (ev) => onTransicionClick(ev, t.id) : undefined}
            >
              {ordenar(t.simbolos, a.alfabeto).join(', ') || '?'}
            </text>
          </g>
        );
      })}
      {children}
      {a.estados.map((e) => {
        const clases = ['estado'];
        if (activos?.has(e.id)) clases.push('activo');
        if (marcados?.has(e.id)) clases.push('marcado');
        if (apagados?.has(e.id)) clases.push('apagado');
        if (seleccionEstado === e.id) clases.push('sel');
        if (e.final) clases.push('final');
        const largo = e.nombre.length > 4;
        return (
          <g
            key={e.id}
            className={clases.join(' ')}
            onPointerDown={onEstadoDown ? (ev) => onEstadoDown(ev, e.id) : undefined}
            onPointerUp={onEstadoUp ? (ev) => onEstadoUp(ev, e.id) : undefined}
            onDoubleClick={onEstadoDoble ? () => onEstadoDoble(e.id) : undefined}
          >
            <circle cx={e.x} cy={e.y} r={R} className="disco" />
            {e.final && <circle cx={e.x} cy={e.y} r={R - 5} className="anillo" />}
            <text x={e.x} y={e.y + 5} className={`nombre ${largo ? 'largo' : ''}`}>
              {e.nombre}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** Vista de solo lectura, con la caja ajustada al autómata. */
export function VistaAutomata(props: Omit<PropsDibujo, 'onEstadoDown' | 'onEstadoUp' | 'onEstadoDoble' | 'onTransicionClick'> & {
  onEstadoClick?: (id: string) => void;
  alto?: number;
}) {
  const caja = cajaDe(props.automata);
  const id = React.useId().replace(/:/g, '');
  return (
    <svg
      className={`lienzo solo-lectura ${props.onEstadoClick ? 'clicable' : ''}`}
      viewBox={caja.join(' ')}
      style={{ maxHeight: props.alto ?? 320 }}
      role="img"
    >
      <CapaAutomata
        {...props}
        idMarcador={`f${id}`}
        onEstadoDown={props.onEstadoClick ? (_e, x) => props.onEstadoClick!(x) : undefined}
      />
    </svg>
  );
}

/** Figura y tabla δ lado a lado; si el autómata es muy ancho, la tabla va debajo. */
export function FiguraConTabla({ automata, tabla, children }: { automata: Automata; tabla: React.ReactNode; children?: React.ReactNode }) {
  const [, , w, h] = cajaDe(automata);
  const ancho = w / h > 2.6;
  return (
    <div className={`fig-tabla ${ancho ? 'apilada' : ''}`}>
      <div>{children}</div>
      <div className="tabla-scroll">{tabla}</div>
    </div>
  );
}
