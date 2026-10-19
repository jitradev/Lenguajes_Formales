// Campo para escribir una expresión regular, con botones para los símbolos que
// no están en el teclado y una vista previa de las primeras palabras que genera.

import { useRef } from 'react';
import { MAS } from '../automata/er';
import { compilarER, primerasPalabras } from '../automata/lenguaje';
import { EPS, VACIO } from '../automata/tipos';

const BOTONES = [EPS, VACIO, '|', '*', MAS, '(', ')'];

export function EntradaER({
  valor,
  onChange,
  alfabeto,
  vistaPrevia = true,
  placeholder,
}: {
  valor: string;
  onChange: (v: string) => void;
  alfabeto: string[];
  vistaPrevia?: boolean;
  placeholder?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const insertar = (c: string) => {
    const el = ref.current;
    const i = el?.selectionStart ?? valor.length;
    const j = el?.selectionEnd ?? valor.length;
    onChange(valor.slice(0, i) + c + valor.slice(j));
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(i + c.length, i + c.length);
    });
  };
  const r = vistaPrevia && valor.trim() ? compilarER(valor, alfabeto) : null;
  return (
    <div className="entrada-er">
      <div className="entrada-er-fila">
        <input
          ref={ref}
          className="mono"
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? (alfabeto.length > 1 ? `p. ej. (${alfabeto[0]}|${alfabeto[1]})*${alfabeto[0]}` : undefined)}
          spellCheck={false}
          autoComplete="off"
          aria-label="Expresión regular"
        />
        <span className="chips">
          {BOTONES.map((b) => (
            <button key={b} type="button" className="chip" onClick={() => insertar(b)} title={b === MAS ? 'Clausura positiva' : undefined}>
              {b}
            </button>
          ))}
        </span>
      </div>
      {r && (
        <p className={`vista-er ${r.ok ? '' : 'mal'}`}>
          {r.ok ? <Genera palabras={primerasPalabras(r.afd, 9)} /> : r.error}
        </p>
      )}
    </div>
  );
}

function Genera({ palabras }: { palabras: string[] }) {
  if (!palabras.length) return <>No genera ninguna palabra: su lenguaje es ∅.</>;
  return (
    <>
      Genera {palabras.slice(0, 8).map((w, i) => <code key={i}>{w || EPS}</code>)}
      {palabras.length > 8 ? ' …' : ''}
    </>
  );
}
