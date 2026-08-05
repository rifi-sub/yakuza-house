// Configuración de la URL base del Backend para Desarrollo y Producción
export const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://alilyback.duckdns.org' : '');

// Resuelve URLs de media: si la URL es relativa al backend (/api/...) le antepone API_BASE
// para que funcione en producción donde frontend y backend están en dominios distintos.
export function resolveMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;

  if (url.startsWith('/api/') || url.startsWith('api/') ||
      url.startsWith('/uploads/') || url.startsWith('uploads/') ||
      url.startsWith('/public/') || url.startsWith('public/')) {
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${API_BASE}${cleanUrl}`;
  }

  if (url.includes('/file/') || url.match(/\.(jpg|jpeg|png|webp|gif|svg|avif|bmp|heic|heif|mp4|webm|mov)$/i)) {
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${API_BASE}${cleanUrl}`;
  }

  return url;
}
