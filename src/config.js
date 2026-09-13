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

// Helper seguro para peticiones fetch que devuelven JSON
export async function safeFetchJson(url, options = {}) {
  const res = await fetch(url, options);
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error(`El servidor (${url}) respondió con un formato no válido (${res.status} ${res.statusText}). Comprueba que el backend esté activo.`);
  }
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.message || `Error en la solicitud HTTP (${res.status})`);
  }
  return data;
}
