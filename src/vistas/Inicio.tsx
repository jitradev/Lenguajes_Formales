import { BLOQUES } from '../ejercicios/registro';
import { borrarProgreso, useResueltos } from '../progreso';
import { nombreTipo } from './EjercicioPagina';

export function Inicio() {
  const resueltos = useResueltos();
  return (
    <main className="contenido">
      <section className="portada">
        <p className="antetitulo">Lenguajes Formales · Universidad San Jorge</p>
        <h1>Ejercicios interactivos</h1>
        <p className="entradilla">
          Dibuja autómatas, compruébalos al momento y descubre la palabra que falla. Tu progreso se guarda en este navegador.
        </p>
      </section>
      {BLOQUES.map((b) => {
        const total = b.temas.reduce((n, t) => n + t.ejercicios.length, 0);
        const hechos = b.temas.reduce((n, t) => n + t.ejercicios.filter((e) => resueltos.has(e.id)).length, 0);
        return (
          <section key={b.id} className={`bloque ${b.disponible ? '' : 'proximamente'}`}>
            <header>
              <h2>
                <span className="num">Bloque {b.id}</span> {b.titulo}
              </h2>
              {b.disponible ? (
                <span className="progreso">
                  {hechos} / {total}
                  <span className="barra-prog">
                    <span style={{ width: `${total ? (100 * hechos) / total : 0}%` }} />
                  </span>
                </span>
              ) : (
                <span className="progreso">Próximamente</span>
              )}
            </header>
            {b.disponible && (
              <div className="temas">
                {b.temas.map((t) => {
                  const h = t.ejercicios.filter((e) => resueltos.has(e.id)).length;
                  return (
                    <a key={t.id} className="tarjeta-tema" href={`#/tema/${t.id}`}>
                      <span className="num-tema">{t.id}</span>
                      <strong>{t.titulo}</strong>
                      <span className="resumen">{t.resumen}</span>
                      <span className="cuenta">
                        {h} de {t.ejercicios.length} resueltos
                      </span>
                    </a>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
      <section className="bloque lab-link">
        <a href="#/lab" className="tarjeta-tema ancha">
          <strong>Laboratorio</strong>
          <span className="resumen">Un lienzo libre para dibujar cualquier autómata, trazar palabras y ver su tabla.</span>
        </a>
      </section>
      <p className="nota pie">
        <button
          className="btn-texto"
          onClick={() => {
            if (confirmar()) borrarProgreso();
          }}
        >
          Borrar mi progreso
        </button>
      </p>
    </main>
  );
}

function confirmar() {
  try {
    return window.confirm('¿Borrar todo el progreso y los borradores guardados en este navegador?');
  } catch {
    return false;
  }
}

export function TemaPagina({ id }: { id: string }) {
  const resueltos = useResueltos();
  const tema = BLOQUES.flatMap((b) => b.temas).find((t) => t.id === id);
  if (!tema) return <p className="contenido">No existe ese tema.</p>;
  return (
    <main className="contenido">
      <nav className="miga">
        <a href="#/">Bloques</a>
      </nav>
      <h1>
        <span className="num-ej">Tema {tema.id}</span> {tema.titulo}
      </h1>
      <p className="entradilla">{tema.resumen}</p>
      <ol className="lista-ej">
        {tema.ejercicios.map((e) => (
          <li key={e.id}>
            <a href={`#/ej/${e.id}`} className={resueltos.has(e.id) ? 'resuelto' : ''}>
              <span className="check" aria-label={resueltos.has(e.id) ? 'resuelto' : 'pendiente'}>
                {resueltos.has(e.id) ? '✓' : ''}
              </span>
              <span className="num-ej">{e.id}</span>
              <span className="tit">{e.titulo}</span>
              <span className="etiqueta-tipo">{nombreTipo(e)}</span>
            </a>
          </li>
        ))}
      </ol>
    </main>
  );
}
