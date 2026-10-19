import { useMemo, useState } from 'react';
import { afdDeER, enER } from '../../automata/lenguaje';
import { EPS } from '../../automata/tipos';
import { Informe, LineaInforme } from '../../editor/Herramientas';
import { EjPertenencia } from '../../ejercicios/tipos';
import { useBorrador } from '../../progreso';
import { Seccion } from '../comun';

export function Pertenencia({ ej, onResuelto }: { ej: EjPertenencia; onResuelto: () => void }) {
  const real = useMemo(() => ej.expresiones.map((er) => {
    const m = afdDeER(er, ej.alfabeto);
    return ej.palabras.map((w) => enER(m, w));
  }), [ej]);
  const [marcas, setMarcas] = useBorrador<boolean[][]>(ej.id, 'marcas', () => ej.expresiones.map(() => ej.palabras.map(() => false)));
  const [corregido, setCorregido] = useState(false);
  const [informe, setInforme] = useState<LineaInforme[]>([]);

  const cambiar = (i: number, j: number) => {
    setMarcas(marcas.map((fila, a) => (a === i ? fila.map((v, b) => (b === j ? !v : v)) : fila)));
    setCorregido(false);
    setInforme([]);
  };

  const comprobar = () => {
    let fallos = 0;
    real.forEach((fila, i) => fila.forEach((v, j) => (fallos += marcas[i][j] !== v ? 1 : 0)));
    setCorregido(true);
    if (fallos === 0) {
      setInforme([{ nivel: 'ok', titulo: 'Todas las casillas están bien.' }]);
      onResuelto();
    } else
      setInforme([
        {
          nivel: 'mal',
          titulo: `Hay ${fallos} ${fallos > 1 ? 'casillas mal' : 'casilla mal'}, marcadas en rojo.`,
          detalle: 'Para cada una, parte la palabra según las piezas de la expresión y mira si encaja.',
        },
      ]);
  };

  return (
    <Seccion titulo="Marca las palabras que pertenecen">
      <p className="sigma">
        Σ = {'{'}
        {ej.alfabeto.join(', ')}
        {'}'}
      </p>
      <div className="tabla-scroll">
        <table className="tabla-entrada pertenencia">
          <thead>
            <tr>
              <th>Expresión</th>
              {ej.palabras.map((w) => (
                <th key={w}>{w || EPS}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ej.expresiones.map((er, i) => (
              <tr key={er}>
                <th className="mono">{er}</th>
                {ej.palabras.map((w, j) => (
                  <td key={w} className={corregido ? (marcas[i][j] === real[i][j] ? 'ok' : 'mal') : ''}>
                    <label className="casilla">
                      <input
                        type="checkbox"
                        checked={marcas[i][j]}
                        onChange={() => cambiar(i, j)}
                        aria-label={`${w || EPS} pertenece a ${er}`}
                      />
                    </label>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="acciones">
        <button className="btn" onClick={comprobar}>
          Comprobar
        </button>
      </div>
      <Informe lineas={informe} />
    </Seccion>
  );
}
