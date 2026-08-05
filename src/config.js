// Configuración de la URL base del Backend para Desarrollo y Producción
export const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://alilyback.duckdns.org' : '');

// Resuelve URLs de media: si la URL es relativa al backend (/api/...) le antepone API_BASE
// para que funcione en producción donde frontend y backend están en dominios distintos.
export function resolveMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  if (url.startsWith('/api/') || url.startsWith('api/')) {
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${API_BASE}${cleanUrl}`;
  }
  return url;
}
