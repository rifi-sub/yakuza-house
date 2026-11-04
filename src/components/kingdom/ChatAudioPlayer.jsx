import React from 'react';

// Los WebM grabados con MediaRecorder en Chrome no traen duración en la cabecera:
// el navegador devuelve Infinity, no muestra el tiempo total y no deja saltar en la barra.
// Saltar al final fuerza al navegador a calcular la duración real; después se vuelve al inicio.
export function fixInfiniteAudioDuration(audio, { resume = false } = {}) {
  if (!audio || (audio.duration !== Infinity && !Number.isNaN(audio.duration))) return;

  const wasPlaying = resume || !audio.paused;
  const restore = () => {
    audio.removeEventListener('timeupdate', restore);
    audio.currentTime = 0;
    if (wasPlaying) audio.play().catch(() => {});
  };
  audio.addEventListener('timeupdate', restore);
  audio.currentTime = 1e101;
}

// <audio controls> con la corrección de duración aplicada. Para los audios nuevos (MP3 convertido en el
// servidor) no hace nada; solo actúa con audios antiguos o sin duración.
export function ChatAudioPlayer({ src, className = '', autoPlay = false, noDownload = false }) {
  return (
    <audio
      src={src}
      controls
      autoPlay={autoPlay}

      controlsList={noDownload ? 'nodownload' : undefined}
      className={className}
      onLoadedMetadata={(e) => fixInfiniteAudioDuration(e.currentTarget, { resume: autoPlay })}
    />
  );
}
