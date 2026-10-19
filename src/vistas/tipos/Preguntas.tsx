import React, { useState } from 'react';
import { forma, mostrar, parsearER, sinParentesis } from '../../automata/er';
import { afdDeER, afdDeLenguaje, compilarER, enER, longitudMinima, ordenPalabras } from '../../automata/lenguaje';
import { aceptaAFD, comparar, diferencia } from '../../automata/nucleo';
import { EPS, VACIO } from '../../automata/tipos';
import { Informe, LineaInforme, Rico } from '../../editor/Herramientas';
import { EjPreguntas, Pregunta } from '../../ejercicios/tipos';
import { useBorrador } from '../../progreso';
import { Seccion, SiNo } from '../comun';
import { EntradaER } from '../EntradaER';

type Respuesta = string | number | boolean | null | { eq: boolean | null; w: string } | { si: string; no: string };

const P = ({ w }: { w: string }) => <code className="palabra">{w || EPS}</code>;
const lista = (ws: string[]) =>
  ws.map((w, i) => (
    <React.Fragment key={i}>
      {i > 0 && ', '}
      <P w={w} />
    </React.Fragment>
  ));

/** Lee una lista de palabras: «{a, ab, ε}», «a ab ε», «∅» o «{}». */
export function parsearPalabras(texto: string, alfabeto: string[]): { palabras: string[] } | { error: string } {
  const t = texto.trim().replace(/^\{/, '').replace(/\}$/, '').trim();
  if (t === '' || t === VACIO || t === 'Ø') return { palabras: [] };
  const res: string[] = [];
  for (const x of t.split(/[\s,;]+/).filter(Boolean)) {
    if (x === EPS) {
      res.push('');
      continue;
    }
    if (x.includes(EPS)) return { error: `«${x}»: ε no es un símbolo. Concatenar con ε deja la palabra igual: escribe «${x.split(EPS).join('') || EPS}».` };
    const fuera = [...x].find((c) => !alfabeto.includes(c));
    if (fuera) return { error: `«${x}» tiene «${fuera}», que no está en Σ.` };
    res.push(x);
  }
  return { palabras: res };
}

const palabraValida = (texto: string, alfabeto: string[]): string | null => {
  const t = texto.trim();
  if (t === '' || t === EPS) return '';
  return [...t].every((c) => alfabeto.includes(c)) ? t : null;
};

export interface Correccion {
  ok: boolean;
  lineas: LineaInforme[];
}

/** Corrige una pregunta. Es una función pura para poder probarla. */
export function corregir(p: Pregunta, alfabeto: string[], r: Respuesta | undefined): Correccion {
  const S = p.alfabeto ?? alfabeto;
  const mal = (titulo: string, detalle?: React.ReactNode): Correccion => ({ ok: false, lineas: [{ nivel: 'mal', titulo, detalle }] });
  const vacia = (titulo = 'Falta la respuesta.'): Correccion => ({ ok: false, lineas: [{ nivel: 'aviso', titulo }] });
  const bien = (titulo: string, detalle?: React.ReactNode): Correccion => ({
    ok: true,
    lineas: [{ nivel: 'ok', titulo, detalle: detalle ?? (p.explicacion ? <Rico texto={p.explicacion} /> : undefined) }],
  });

  switch (p.k) {
    case 'er': {
      const t = typeof r === 'string' ? r : '';
      if (!t.trim()) return vacia('Escribe una expresión.');
      const c = compilarER(t, S);
      if (!c.ok) return mal('La expresión no se puede leer.', c.error);
      const cmp = comparar(c.afd, afdDeLenguaje(p.lenguaje, S));
      const lineas: LineaInforme[] = [];
      if (cmp.sobra) lineas.push({ nivel: 'mal', titulo: 'Genera palabras que no debería.', detalle: <>Por ejemplo, <P w={cmp.sobra.join('')} />, que no pertenece al lenguaje.</> });
      if (cmp.falta) lineas.push({ nivel: 'mal', titulo: 'Se deja palabras del lenguaje.', detalle: <>Por ejemplo, <P w={cmp.falta.join('')} />, que pertenece y no la genera.</> });
      if (lineas.length) return { ok: false, lineas };
      return bien('Correcta: describe exactamente el lenguaje.');
    }
    case 'equiv': {
      const x = (r ?? { eq: null, w: '' }) as { eq: boolean | null; w: string };
      if (x.eq === null) return vacia('Decide si son equivalentes.');
      const A = afdDeER(p.r, S);
      const B = afdDeER(p.s, S);
      const d1 = diferencia(A, B);
      const d2 = diferencia(B, A);
      const son = !d1 && !d2;
      if (x.eq && son) return bien('Sí, son equivalentes.');
      if (x.eq) return mal('No son equivalentes.', 'Busca una palabra corta que esté en una y no en la otra.');
      if (son) return mal('Sí que son equivalentes.', 'Generan exactamente las mismas palabras: busca la propiedad que lo explica.');
      const w = palabraValida(x.w, S);
      if (w === null) return vacia('Escribe la palabra que lo demuestra, con símbolos de Σ.');
      const enR = enER(A, w);
      const enS = enER(B, w);
      if (enR === enS) return mal('Esa palabra no las distingue.', <><P w={w} /> {enR ? 'está en las dos' : 'no está en ninguna'}.</>);
      const corta = [d1, d2].filter(Boolean).map((v) => v!.length);
      const lineas: LineaInforme[] = [
        { nivel: 'ok', titulo: 'Bien: no son equivalentes.', detalle: <><P w={w} /> está en {enR ? 'la de la izquierda' : 'la de la derecha'} y no en la otra.</> },
      ];
      if (w.length > Math.min(...corta)) lineas.push({ nivel: 'info', titulo: `Hay una más corta, de longitud ${Math.min(...corta)}.` });
      return { ok: true, lineas };
    }
    case 'contraejemplo': {
      const w = palabraValida(typeof r === 'string' ? r : '', S);
      if (typeof r !== 'string' || !r.trim()) return vacia('Escribe una palabra.');
      if (w === null) return mal('Esa palabra tiene símbolos que no están en Σ.');
      const enL = aceptaAFD(afdDeLenguaje(p.lenguaje, S), [...w]);
      const enE = enER(afdDeER(p.er, S), w);
      if (p.sentido === 'falta') {
        if (enL && !enE) return bien('Contraejemplo válido.', <><P w={w} /> pertenece al lenguaje y la expresión no la genera.</>);
        return mal('Esa palabra no refuta la expresión.', <><P w={w} /> {enL ? 'pertenece al lenguaje' : 'no pertenece al lenguaje'} y la expresión {enE ? 'la genera' : 'no la genera'}.</>);
      }
      if (enE && !enL) return bien('Contraejemplo válido.', <><P w={w} /> la genera la expresión y no pertenece al lenguaje.</>);
      return mal('Esa palabra no refuta la expresión.', <><P w={w} /> {enL ? 'pertenece al lenguaje' : 'no pertenece al lenguaje'} y la expresión {enE ? 'la genera' : 'no la genera'}.</>);
    }
    case 'palabras': {
      const x = (r ?? { si: '', no: '' }) as { si: string; no: string };
      const a = parsearPalabras(x.si, S);
      const b = parsearPalabras(x.no, S);
      if ('error' in a) return mal(a.error);
      if ('error' in b) return mal(b.error);
      const m = afdDeER(p.er, S);
      const si = [...new Set(a.palabras)];
      const no = [...new Set(b.palabras)];
      const lineas: LineaInforme[] = [];
      const malSi = si.filter((w) => !enER(m, w));
      const malNo = no.filter((w) => enER(m, w));
      if (malSi.length) lineas.push({ nivel: 'mal', titulo: 'Hay palabras que no están en el lenguaje.', detalle: lista(malSi) });
      if (malNo.length) lineas.push({ nivel: 'mal', titulo: 'Hay palabras que sí están en el lenguaje.', detalle: lista(malNo) });
      if (si.length < p.dentro) lineas.push({ nivel: 'aviso', titulo: `Faltan palabras que estén: ${p.dentro} distintas.` });
      if (no.length < p.fuera) lineas.push({ nivel: 'aviso', titulo: `Faltan palabras que no estén: ${p.fuera} distintas.` });
      if (lineas.length) return { ok: false, lineas };
      return bien('Bien: todas las palabras están donde dices.');
    }
    case 'opcion':
      if (typeof r !== 'number') return vacia('Elige una opción.');
      return r === p.correcta ? bien('Correcto.') : mal('No es esa.', 'Prueba la descripción con un par de palabras cortas.');
    case 'conjunto': {
      const t = typeof r === 'string' ? r : '';
      if (!t.trim()) return vacia('Escribe el conjunto (∅ si es vacío).');
      const a = parsearPalabras(t, S);
      if ('error' in a) return mal(a.error);
      const dado = new Set(a.palabras);
      const sobran = [...dado].filter((w) => !p.valor.includes(w)).sort(ordenPalabras);
      const faltan = p.valor.filter((w) => !dado.has(w));
      const lineas: LineaInforme[] = [];
      if (sobran.length) lineas.push({ nivel: 'mal', titulo: `${sobran.length > 1 ? 'Sobran palabras' : 'Sobra una palabra'}.`, detalle: lista(sobran) });
      if (faltan.length) lineas.push({ nivel: 'mal', titulo: faltan.length > 1 ? `Faltan ${faltan.length} palabras.` : 'Falta una palabra.' });
      if (lineas.length) return { ok: false, lineas };
      const rep = a.palabras.length - dado.size;
      return bien(
        `Correcto: ${p.valor.length} ${p.valor.length === 1 ? 'elemento' : 'elementos'}.`,
        rep ? 'Has escrito alguna palabra repetida: en un conjunto cuenta una sola vez.' : p.explicacion ? <Rico texto={p.explicacion} /> : undefined,
      );
    }
    case 'numero': {
      const t = typeof r === 'string' ? r.trim() : '';
      if (!t) return vacia('Escribe un número.');
      return Number(t) === p.valor ? bien('Correcto.') : mal('No es ese número.');
    }
    case 'sino':
      if (typeof r !== 'boolean') return vacia('Contesta sí o no.');
      return r === p.valor ? bien('Correcto.') : mal(p.valor ? 'Sí que está.' : 'No está.');
    case 'corta': {
      if (typeof r !== 'string' || !r.trim()) return vacia('Escribe una palabra (ε para la vacía).');
      const w = palabraValida(r, S);
      if (w === null) return mal('Esa palabra tiene símbolos que no están en Σ.');
      const m = afdDeER(p.er, S);
      if (!enER(m, w)) return mal('Esa palabra no la genera la expresión.');
      const min = longitudMinima(m)!;
      if (w.length > min) return mal(`La genera, pero no es de las más cortas: hay una de longitud ${min}.`);
      return bien('Correcto: es de las más cortas.');
    }
    case 'parentesis': {
      const t = typeof r === 'string' ? r : '';
      if (!t.trim()) return vacia('Escribe la expresión con sus paréntesis.');
      const c = compilarER(t, S);
      if (!c.ok) return mal('La expresión no se puede leer.', c.error);
      if (forma(c.nodo) !== forma(parsearER(p.er)))
        return mal('Has cambiado la expresión.', 'Tiene que decir lo mismo que la original, con los mismos operadores en el mismo orden: solo se añaden paréntesis.');
      const faltan = sinParentesis(c.nodo);
      if (faltan.length)
        return mal('Es la misma expresión, pero faltan paréntesis.', <>Todavía no queda claro a qué se aplica el operador en: {faltan.map((x, i) => <React.Fragment key={i}>{i > 0 && ', '}<code>{x}</code></React.Fragment>)}.</>);
      return bien('Correcto: queda claro a qué se aplica cada operador.', <>Con los paréntesis mínimos se escribe <code>{mostrar(c.nodo)}</code>.</>);
    }
  }
}

const vacioDe = (p: Pregunta): Respuesta =>
  p.k === 'equiv' ? { eq: null, w: '' } : p.k === 'palabras' ? { si: '', no: '' } : p.k === 'opcion' || p.k === 'sino' ? null : '';

export function Preguntas({ ej, onResuelto }: { ej: EjPreguntas; onResuelto: () => void }) {
  const [resp, setResp] = useBorrador<Respuesta[]>(ej.id, 'respuestas', () => ej.preguntas.map(vacioDe));
  const [corr, setCorr] = useState<(Correccion | null)[]>(() => ej.preguntas.map(() => null));
  const valor = (i: number) => resp[i] ?? vacioDe(ej.preguntas[i]);
  const cambiar = (i: number, v: Respuesta) => {
    setResp(ej.preguntas.map((_, j) => (j === i ? v : valor(j))));
    setCorr(corr.map((c, j) => (j === i ? null : c)));
  };

  const comprobar = () => {
    const c = ej.preguntas.map((p, i) => corregir(p, ej.alfabeto, valor(i)));
    setCorr(c);
    if (c.every((x) => x.ok)) onResuelto();
  };
  const hechas = corr.filter((c) => c?.ok).length;

  return (
    <Seccion titulo="Tus respuestas">
      {ej.preguntas.some((p) => !p.alfabeto) && (
        <p className="sigma">
          Σ = {'{'}
          {ej.alfabeto.join(', ')}
          {'}'}
        </p>
      )}
      <ol className="lista-preguntas">
        {ej.preguntas.map((p, i) => (
          <li key={i} className={`pregunta-er ${corr[i] ? (corr[i]!.ok ? 'ok' : 'mal') : ''}`}>
            <div className="pregunta-texto">
              {p.etiqueta && <strong className="etiqueta-preg">{p.etiqueta}</strong>}
              <TextoPregunta p={p} />
              {p.alfabeto && <span className="sigma-preg">Σ = {'{'}{p.alfabeto.join(', ')}{'}'}</span>}
            </div>
            <Campo p={p} valor={valor(i)} onChange={(v) => cambiar(i, v)} alfabeto={p.alfabeto ?? ej.alfabeto} />
            {corr[i] && <Informe lineas={corr[i]!.lineas} titulo="" />}
          </li>
        ))}
      </ol>
      <div className="acciones">
        <button className="btn" onClick={comprobar}>
          Comprobar
        </button>
        {corr.some(Boolean) && (
          <span className="nota">
            {hechas} de {ej.preguntas.length} bien
          </span>
        )}
      </div>
    </Seccion>
  );
}

function TextoPregunta({ p }: { p: Pregunta }) {
  if (p.texto) return <Rico texto={p.texto} />;
  if (p.k === 'equiv')
    return (
      <span className="mono">
        {p.r} = {p.s}
      </span>
    );
  if (p.k === 'parentesis' || p.k === 'corta') return <code>{p.er}</code>;
  return null;
}

function Campo({ p, valor, onChange, alfabeto }: { p: Pregunta; valor: Respuesta; onChange: (v: Respuesta) => void; alfabeto: string[] }) {
  const texto = typeof valor === 'string' ? valor : '';
  switch (p.k) {
    case 'er':
      return <EntradaER valor={texto} onChange={onChange} alfabeto={alfabeto} />;
    case 'parentesis':
      return <EntradaER valor={texto} onChange={onChange} alfabeto={alfabeto} vistaPrevia={false} placeholder="la misma expresión, con paréntesis" />;
    case 'equiv': {
      const x = valor as { eq: boolean | null; w: string };
      return (
        <div className="pregunta">
          <span>¿Son equivalentes?</span>
          <SiNo valor={x.eq} onChange={(eq) => onChange({ ...x, eq })} nombre={`eq-${p.r}-${p.s}`} />
          {x.eq === false && (
            <>
              <span>Palabra que lo demuestra</span>
              <input className="mono corto" value={x.w} onChange={(e) => onChange({ ...x, w: e.target.value })} placeholder="vacío = ε" />
            </>
          )}
        </div>
      );
    }
    case 'palabras': {
      const x = valor as { si: string; no: string };
      return (
        <div className="pregunta">
          <label>
            Están ({p.dentro}) <input className="mono" value={x.si} onChange={(e) => onChange({ ...x, si: e.target.value })} placeholder="p. ej. ab, aab" />
          </label>
          <label>
            No están ({p.fuera}) <input className="mono" value={x.no} onChange={(e) => onChange({ ...x, no: e.target.value })} placeholder="p. ej. ε, ba" />
          </label>
        </div>
      );
    }
    case 'opcion':
      return (
        <div className="opciones" role="radiogroup">
          {p.opciones.map((o, j) => (
            <label key={j} className={`opcion-larga ${valor === j ? 'on' : ''}`}>
              <input type="radio" checked={valor === j} onChange={() => onChange(j)} />
              <Rico texto={o} />
            </label>
          ))}
        </div>
      );
    case 'sino':
      return <SiNo valor={typeof valor === 'boolean' ? valor : null} onChange={onChange} nombre={`sino-${p.texto}`} />;
    case 'numero':
      return <input className="mono corto" inputMode="numeric" value={texto} onChange={(e) => onChange(e.target.value)} aria-label="Número" />;
    case 'conjunto':
      return (
        <div className="pregunta">
          <input className="mono ancho" value={texto} onChange={(e) => onChange(e.target.value)} placeholder="p. ej. {ε, a, ab}" aria-label="Conjunto" />
          <span className="chips">
            {[EPS, VACIO].map((b) => (
              <button key={b} type="button" className="chip" onClick={() => onChange(texto + b)}>
                {b}
              </button>
            ))}
          </span>
        </div>
      );
    case 'corta':
    case 'contraejemplo':
      return <input className="mono corto" value={texto} onChange={(e) => onChange(e.target.value)} placeholder="ε para la vacía" aria-label="Palabra" />;
  }
}
