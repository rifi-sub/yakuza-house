import React, { useState, useRef } from 'react';
import { X, Paperclip, Film, Volume2, Image as ImageIcon, Loader2, Maximize2, Trash2 } from 'lucide-react';
import { API_BASE, resolveMediaUrl } from '../../config';
import { ChatAudioPlayer } from './ChatAudioPlayer';

export function parseTaskMedia(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function TaskMediaGallery({ media, label, onRemove, compact = false }) {
  const items = parseTaskMedia(media);
  const [lightboxItem, setLightboxItem] = useState(null);

  if (items.length === 0) return null;

  return (
    <div className="space-y-1.5">
      {label && (
        <span className="text-[10px] font-mono uppercase tracking-wider text-gold-400/90 font-bold flex items-center gap-1">
          <Paperclip className="w-3 h-3" /> {label} ({items.length})
        </span>
      )}

      <div className={`grid ${compact ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3'} gap-2`}>
        {items.map((item, idx) => {
          const fullUrl = resolveMediaUrl(item.url);
          const isVideo = item.type === 'VIDEO' || item.mimeType?.startsWith('video/') || /\.(mp4|webm|mov|avi|mkv)$/i.test(item.url || '');
          const isAudio = item.type === 'AUDIO' || item.mimeType?.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(item.url || '');

          return (
            <div
              key={`${item.url}-${idx}`}
              className={`relative group rounded-xl overflow-hidden border border-gold-500/30 bg-black/60 ${
                isAudio ? 'col-span-2 sm:col-span-3 p-2.5' : ''
              }`}
            >
              {isAudio ? (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gold-500/15 border border-gold-400/40 flex items-center justify-center shrink-0">
                    <Volume2 className="w-4 h-4 text-gold-300" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    {item.name && (
                      <p className="text-[10px] font-mono text-gray-300 truncate">{item.name}</p>
                    )}
                    <ChatAudioPlayer src={fullUrl} className="w-full h-8" />
                  </div>
                </div>
              ) : isVideo ? (
                <div className="relative">
                  <video
                    src={fullUrl}
                    controls
                    preload="metadata"
                    className={`w-full ${compact ? 'h-24' : 'h-32'} object-cover bg-black`}
                  />
                  <button
                    type="button"
                    onClick={() => setLightboxItem({ ...item, fullUrl, isVideo: true })}
                    className="absolute top-1.5 left-1.5 p-1 rounded-lg bg-black/70 text-gold-300 hover:bg-black/90 opacity-80 group-hover:opacity-100 transition-opacity"
                    title="Ver vídeo en grande"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div
                  className="relative cursor-pointer"
                  onClick={() => setLightboxItem({ ...item, fullUrl, isVideo: false })}
                >
                  <img
                    src={fullUrl}
                    alt={item.name || 'Adjunto multimedia'}
                    className={`w-full ${compact ? 'h-24' : 'h-32'} object-cover hover:opacity-95 transition-opacity`}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                    <Maximize2 className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                  </div>
                </div>
              )}

              {onRemove && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(idx);
                  }}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-600/90 hover:bg-red-500 text-white shadow-md transition-colors z-10"
                  title="Eliminar adjunto"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxItem(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxItem(null)}
              className="absolute -top-10 right-0 p-2 rounded-full bg-dark-900 border border-gold-500/40 text-gold-300 hover:text-white"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
            {lightboxItem.isVideo ? (
              <video
                src={lightboxItem.fullUrl}
                controls
                autoPlay
                className="max-h-[82vh] max-w-full rounded-xl border border-gold-500/40 bg-black shadow-2xl"
              />
            ) : (
              <img
                src={lightboxItem.fullUrl}
                alt={lightboxItem.name || 'Vista ampliada'}
                className="max-h-[82vh] max-w-full rounded-xl border border-gold-500/40 object-contain shadow-2xl"
              />
            )}
            {lightboxItem.name && (
              <p className="mt-2 text-xs font-mono text-gray-300">{lightboxItem.name}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function TaskMediaUploader({
  token,
  endpoint,
  mediaList = [],
  onChange,
  label = 'Adjuntar archivos multimedia (fotos, vídeos o audios)',
  compact = false
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleSelectFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      for (const f of files) {
        if (f.size > 100 * 1024 * 1024) {
          throw new Error(`El archivo "${f.name}" supera el límite de 100MB.`);
        }
        formData.append('files', f);
      }

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Error al subir archivos multimedia');

      const uploaded = Array.isArray(data.media) ? data.media : [];
      onChange([...parseTaskMedia(mediaList), ...uploaded]);
    } catch (err) {
      setError(err.message || 'Error subiendo archivo');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = (index) => {
    const next = parseTaskMedia(mediaList).filter((_, i) => i !== index);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="text-[10px] font-mono text-gold-300 uppercase flex items-center gap-1.5">
          <Paperclip className="w-3 h-3" /> {label}
        </label>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*,audio/*"
          multiple
          onChange={handleSelectFiles}
          className="hidden"
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="py-1.5 px-3 rounded-lg bg-gold-500/15 hover:bg-gold-500/25 border border-gold-500/40 text-gold-200 text-[11px] font-mono font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Subiendo...</span>
            </>
          ) : (
            <>
              <ImageIcon className="w-3.5 h-3.5" />
              <Film className="w-3.5 h-3.5" />
              <span>Añadir archivos</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <p className="text-[11px] font-mono text-red-400">{error}</p>
      )}

      <TaskMediaGallery
        media={mediaList}
        onRemove={handleRemove}
        compact={compact}
      />
    </div>
  );
}
