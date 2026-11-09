import React from 'react';

// Reproductor de audio del chat. Los audios nuevos se convierten a MP3 en el servidor
// (con duración y barra de progreso correctas en todos los navegadores), por lo que aquí
// basta un <audio> estándar. No se manipula currentTime: forzarlo para "calcular" la duración
// de los WebM antiguos rompía la reproducción en Chrome/Opera.
export function ChatAudioPlayer({ src, className = '', autoPlay = false, noDownload = false }) {
  return (
    <audio
      src={src}
      controls
      autoPlay={autoPlay}
      controlsList={noDownload ? 'nodownload' : undefined}
      className={className}
    />
  );
}
