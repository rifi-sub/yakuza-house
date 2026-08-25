import { useEffect } from 'react';

/**
 * Parallax suave: actualiza la variable CSS --parallax con el scroll Y.
 * Úselo en conjunción con la clase .hero-image (CSS).
 * @param {React.MutableRefObject} scrollRef - ref del contenedor héroe.
 */
export function useParallax(scrollRef) {
  useEffect(() => {
    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const el = scrollRef?.current;
        if (el) {
          const y = window.scrollY * 0.35;
          el.style.setProperty('--parallax', y.toFixed(1));
        }
        raf = null;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [scrollRef]);
}
