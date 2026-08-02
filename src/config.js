// Configuración de la URL base del Backend para Desarrollo y Producción
export const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://alilyback.duckdns.org' : '');

// Resuelve URLs de media: si la URL es relativa al backend (/api/...) le antepone API_BASE
// para que funcione en producción donde frontend y backend están en dominios distintos.
export function resolveMediaUrl(url) {
  if (!url) return url;
  // Si ya es una URL absoluta (http/https), no tocar
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // Si es una ruta relativa al API del backend, anteponer API_BASE
  if (url.startsWith('/api/')) return `${API_BASE}${url}`;
  return url;
}
