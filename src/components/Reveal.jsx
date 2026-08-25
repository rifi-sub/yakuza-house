import React, { useEffect, useRef } from 'react';

/**
 * Wrapper de scroll-reveal: añade la clase .reveal y observa
 * cuándo entra en viewport para activar .is-visible.
 * Props: variant ('' | 'reveal-left' | 'reveal-scale'), delay (ms), className, as.
 */
export default function Reveal({ children, variant = '', delay = 0, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transitionDelay = `${delay}ms`;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          observer.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`reveal ${variant} ${className}`}>
      {children}
    </div>
  );
}
