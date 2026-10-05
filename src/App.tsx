import { useEffect, useState } from 'react';
import { EjercicioPagina } from './vistas/EjercicioPagina';
import { Inicio, TemaPagina } from './vistas/Inicio';
import { Laboratorio } from './vistas/Laboratorio';

// Enrutado con # para que funcione en cualquier alojamiento estático (Vercel incluido).
function useRuta() {
  const [ruta, setRuta] = useState(() => window.location.hash.slice(1) || '/');
  useEffect(() => {
    const f = () => setRuta(window.location.hash.slice(1) || '/');
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  return ruta;
}

export function App() {
  const ruta = useRuta();
  let pagina;
  const partes = ruta.split('/').filter(Boolean);
  if (partes[0] === 'ej' && partes[1]) pagina = <EjercicioPagina id={decodeURIComponent(partes[1])} />;
  else if (partes[0] === 'tema' && partes[1]) pagina = <TemaPagina id={decodeURIComponent(partes[1])} />;
  else if (partes[0] === 'lab') pagina = <Laboratorio />;
  else pagina = <Inicio />;
  return (
    <>
      <header className="cabecera">
        <a href="#/" className="marca">
          <svg width="26" height="26" viewBox="0 0 64 64" aria-hidden>
            <circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" strokeWidth="5" />
            <circle cx="32" cy="32" r="14" fill="none" stroke="currentColor" strokeWidth="4" />
          </svg>
          <span>
            Lenguajes Formales <em>· ejercicios</em>
          </span>
        </a>
        <nav>
          <a href="#/">Bloques</a>
          <a href="#/lab">Laboratorio</a>
        </nav>
      </header>
      {pagina}
    </>
  );
}
