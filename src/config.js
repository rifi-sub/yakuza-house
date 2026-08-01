// Configuración de la URL base del Backend para Desarrollo y Producción
export const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://alilyback.duckdns.org' : '');
