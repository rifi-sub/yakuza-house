import React, { useState, useEffect, useRef } from 'react';
import { Shield, Eye, Flame, AlertTriangle, X, Lock } from 'lucide-react';
import { API_BASE, resolveMediaUrl } from '../../config';

export function SecureMediaViewer({
  message,
  token,
  viewerRole = 'MEMBER',
  viewerAlias = 'Devoto',
  memberNumber = '#000',
  onClose,
  onBurned
}) {
  const [isHolding, setIsHolding] = useState(false);
  const [timeLeft, setTimeLeft] = useState(message.mediaType === 'VIDEO' ? 30 : 10);
  const [totalTime] = useState(message.mediaType === 'VIDEO' ? 30 : 10);
  const [isBurned, setIsBurned] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [securityAlert, setSecurityAlert] = useState(false);
  const [mediaBlobUrl, setMediaBlobUrl] = useState(null);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [loadError, setLoadError] = useState('');

  const timerRef = useRef(null);
  const videoRef = useRef(null);
  const burnedRef = useRef(false);

  // 1. Cargar archivo multimedia en memoria RAM cifrada (sin exponer URL directa)
  useEffect(() => {
    let active = true;
    const fetchProtectedStream = async () => {
      try {
        setLoadingMedia(true);
        const fullUrl = resolveMediaUrl(message.mediaUrl);
        const res = await fetch(fullUrl, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
          if (res.status === 410) {
            throw new Error('Este contenido efímero ya ha sido visto y destruido.');
          }
          throw new Error('Error al acceder a la bóveda segura');
        }

        const blob = await res.blob();
        if (active) {
          const blobUrl = URL.createObjectURL(blob);
          setMediaBlobUrl(blobUrl);
          setLoadingMedia(false);
        }
      } catch (err) {
        if (active) {
          setLoadError(err.message || 'Error cargando archivo');
          setLoadingMedia(false);
        }
      }
    };

    fetchProtectedStream();

    return () => {
      active = false;
      if (mediaBlobUrl) {
        URL.revokeObjectURL(mediaBlobUrl);
      }
    };
  }, [message.id, message.mediaUrl, token]);

  // 2. Destruir / Quemar archivo definitivamente
  const burnAndClose = async (reason = 'timer') => {
    if (burnedRef.current) return;
    burnedRef.current = true;
    setIsBurned(true);

    if (timerRef.current) clearInterval(timerRef.current);

    try {
      await fetch(`${API_BASE}/api/kingdom/chat/media/${message.id}/burn`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      console.error('[Burn Error]:', e);
    }

    onBurned?.(message.id);
    setTimeout(() => {
      onClose?.();
    }, 1200);
  };

  // 3. Sensor de Seguridad Anti-Captura / Grabación (Desenfoque al perder el foco)
  useEffect(() => {
    const handleSecurityViolation = () => {
      if (hasStarted && !burnedRef.current) {
        setSecurityAlert(true);
        setIsHolding(false);
        burnAndClose('security_blur');
      }
    };

    const handleKeyDown = (e) => {
      // Bloquear teclas de captura (PrintScreen, F12, atajos Mac Cmd+Shift+3/4)
      if (
        e.key === 'PrintScreen' ||
        (e.metaKey && e.shiftKey) ||
        (e.ctrlKey && e.shiftKey) ||
        e.key === 'F12'
      ) {
        e.preventDefault();
        handleSecurityViolation();
      }
    };

    window.addEventListener('blur', handleSecurityViolation);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) handleSecurityViolation();
    });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('blur', handleSecurityViolation);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasStarted]);

  // 4. Control de pulsación mantenida (Hold to reveal)
  const handleStartHold = () => {
    if (isBurned || loadingMedia || loadError) return;
    setIsHolding(true);
    if (!hasStarted) setHasStarted(true);

    if (message.mediaType === 'VIDEO' && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }

    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            burnAndClose('timeout');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleEndHold = () => {
    setIsHolding(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (message.mediaType === 'VIDEO' && videoRef.current) {
      videoRef.current.pause();
    }
  };

  // 5. Marca de agua dinámica con fecha y hora actual
  const nowStr = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const watermarkText = `YAKUZA REINO · ${viewerAlias} (${memberNumber}) · ${nowStr}`;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center select-none overflow-hidden"
      onContextMenu={(e) => e.preventDefault()}
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {/* Barra Superior con Estado y Botón de Salir */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-gold-400" />
          <span className="text-xs font-mono tracking-widest text-gold-300 uppercase font-bold">
            Bóveda de Seguridad Yakuza
          </span>
        </div>

        <button
          onClick={() => burnAndClose('user_close')}
          className="py-1 px-3 rounded-full bg-dark-900 border border-gray-800 text-gray-400 hover:text-white text-xs font-mono flex items-center gap-1.5"
        >
          <X className="w-3.5 h-3.5" />
          <span>Cerrar y Destruir</span>
        </button>
      </div>

      {/* Alerta de violación de seguridad si hubo intento de captura */}
      {securityAlert && (
        <div className="absolute inset-0 bg-red-950/90 z-[60] flex flex-col items-center justify-center p-6 text-center space-y-3">
          <AlertTriangle className="w-16 h-16 text-red-400 animate-bounce" />
          <h3 className="font-serif font-bold text-xl text-white">Violación de Seguridad Detectada</h3>
          <p className="text-xs font-mono text-red-200 max-w-sm">
            Se ha detectado un cambio de foco o intento de captura de pantalla. El archivo ha sido destruido de forma inmediata.
          </p>
        </div>
      )}

      {/* Estado: Ya quemado / Destruido */}
      {isBurned && (
        <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 animate-in fade-in zoom-in-95">
          <div className="w-20 h-20 rounded-full border border-gold-500/40 bg-dark-950 flex items-center justify-center shadow-2xl shadow-gold-500/20">
            <Flame className="w-10 h-10 text-gold-400 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-xl text-gold-200">Contenido Destruido</h3>
            <p className="text-xs font-mono text-gray-400 max-w-xs">
              La visualización única ha finalizado. El contenido ya no es accesible.
            </p>
          </div>
        </div>
      )}

      {/* Estado: Error de carga (Ej. ya fue visto antes) */}
      {!isBurned && loadError && (
        <div className="flex flex-col items-center justify-center text-center p-8 space-y-3">
          <Lock className="w-12 h-12 text-red-400" />
          <h3 className="font-serif font-bold text-lg text-white">Acceso Denegado</h3>
          <p className="text-xs font-mono text-red-300 max-w-xs">{loadError}</p>
          <button
            onClick={onClose}
            className="mt-4 py-2 px-6 rounded-xl bg-dark-900 border border-gray-800 text-xs text-gray-300 hover:text-white"
          >
            Volver al Chat
          </button>
        </div>
      )}

      {/* Estado: Cargando archivo */}
      {!isBurned && !loadError && loadingMedia && (
        <div className="flex flex-col items-center justify-center text-center p-8 space-y-3">
          <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-gold-400">Descifrando bytes en memoria segura...</span>
        </div>
      )}

      {/* ZONA DE VISUALIZACIÓN ACTIVA */}
      {!isBurned && !loadError && !loadingMedia && (
        <div 
          className="relative w-full max-w-4xl h-[70vh] flex flex-col items-center justify-center"
          onMouseDown={handleStartHold}
          onMouseUp={handleEndHold}
          onMouseLeave={handleEndHold}
          onTouchStart={handleStartHold}
          onTouchEnd={handleEndHold}
        >
          {/* Capa de Protección / Blackout si no está manteniendo presionado */}
          {!isHolding && (
            <div className="absolute inset-0 z-30 bg-black/90 border border-gold-500/30 rounded-3xl flex flex-col items-center justify-center text-center p-6 space-y-4 cursor-pointer backdrop-blur-md">
              <div className="w-16 h-16 rounded-full border border-gold-400/50 bg-[#12070c] flex items-center justify-center shadow-lg shadow-gold-500/20 animate-pulse">
                <Eye className="w-8 h-8 text-gold-300" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-base text-gold-100">
                  {hasStarted ? 'Visualización en Pausa' : 'Contenido de 1 Sola Visualización'}
                </h4>
                <p className="text-xs font-mono text-gray-400 max-w-xs leading-relaxed">
                  {hasStarted
                    ? 'Mantén pulsado con el dedo o ratón para reanudar el tiempo restante.'
                    : 'Mantén pulsado sobre la pantalla para revelar. Al soltar o agotarse el tiempo se destruirá.'}
                </p>
              </div>
              <div className="py-2 px-5 rounded-full bg-gold-500/20 border border-gold-400/40 text-gold-300 text-xs font-mono uppercase tracking-widest font-bold">
                👆 Mantén presionado para ver
              </div>
            </div>
          )}

          {/* Renderizado Seguro del Archivo */}
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl bg-black">
            {message.mediaType === 'VIDEO' ? (
              <video
                ref={videoRef}
                src={mediaBlobUrl}
                playsInline
                controls={false}
                disablePictureInPicture
                controlsList="nodownload nofullscreen noremoteplayback"
                onLoadedMetadata={(e) => {
                  if (e.target.duration && isFinite(e.target.duration)) {
                    setTimeLeft(Math.max(10, Math.ceil(e.target.duration)));
                  }
                }}
                onEnded={() => burnAndClose('video_ended')}
                className={`max-w-full max-h-full object-contain pointer-events-none transition-all duration-300 ${
                  isHolding ? 'opacity-100 filter-none' : 'opacity-0 blur-2xl'
                }`}
              />
            ) : (
              <img
                src={mediaBlobUrl}
                alt="Contenido protegido"
                draggable={false}
                className={`max-w-full max-h-full object-contain pointer-events-none transition-all duration-300 ${
                  isHolding ? 'opacity-100 filter-none' : 'opacity-0 blur-2xl'
                }`}
              />
            )}

            {/* MARCA DE AGUA FORENSE EN TIEMPO REAL */}
            {isHolding && (
              <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-around opacity-25 overflow-hidden">
                <div className="rotate-[-25deg] text-center font-mono text-xs font-bold text-white whitespace-nowrap tracking-wider">
                  {watermarkText}
                </div>
                <div className="rotate-[-25deg] text-center font-mono text-xs font-bold text-white whitespace-nowrap tracking-wider">
                  {watermarkText}
                </div>
                <div className="rotate-[-25deg] text-center font-mono text-xs font-bold text-white whitespace-nowrap tracking-wider">
                  {watermarkText}
                </div>
              </div>
            )}
          </div>

          {/* Contador Inferior Circular */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-dark-950/80 border border-gold-500/30 px-4 py-1.5 rounded-full backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-mono text-gold-200">
              Autodestrucción en: <strong className="text-white text-sm">{timeLeft}s</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
