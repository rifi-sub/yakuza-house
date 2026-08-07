import React, { useEffect, useState } from 'react';
import { X, Check, Image as ImageIcon, Film, Upload, Loader2 } from 'lucide-react';
import { API_BASE, resolveMediaUrl } from '../config';

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelectUrl,
  onSelectUrls,
  multiple = false,
  token,
  title = 'Seleccionar Contenido Multimedia'
}) {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('library');
  const [selectedUrls, setSelectedUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const fetchMedia = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/store/admin/media`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setMediaItems(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
      setSelectedUrls([]);
      setUploadError('');
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  const toggleSelectUrl = (url) => {
    if (!multiple) {
      if (onSelectUrl) onSelectUrl(url);
      if (onSelectUrls) onSelectUrls([url]);
      onClose();
      return;
    }

    if (selectedUrls.includes(url)) {
      setSelectedUrls(selectedUrls.filter((u) => u !== url));
    } else {
      setSelectedUrls([...selectedUrls, url]);
    }
  };

  const handleConfirmMultiple = () => {
    if (selectedUrls.length > 0) {
      if (onSelectUrls) onSelectUrls(selectedUrls);
      if (onSelectUrl) onSelectUrl(selectedUrls[0]);
    }
    onClose();
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError('');

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const res = await fetch(`${API_BASE}/api/store/admin/media/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al subir archivos');

      if (data.urls && Array.isArray(data.urls) && data.urls.length > 0) {
        if (multiple && onSelectUrls) {
          onSelectUrls(data.urls);
        } else if (onSelectUrl) {
          onSelectUrl(data.urls[0]);
        }
        onClose();
      } else {
        await fetchMedia();
        setActiveTab('library');
      }
    } catch (err) {
      setUploadError(err.message || 'Error en la subida');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-dark-950 border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden text-gray-100">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-dark-900/50">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-gold-400" />
            <h3 className="font-sans font-bold text-base text-white">{title}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-gray-800 px-4 gap-4 bg-dark-900/30 text-xs font-mono">
          <button
            onClick={() => setActiveTab('library')}
            className={`py-3 px-3 font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'library' ? 'border-crimson-500 text-white' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Biblioteca de Medios ({mediaItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-3 font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'upload' ? 'border-crimson-500 text-white' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Subir Archivo Nuevo desde Dispositivo</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'upload' ? (
            <div className="border-2 border-dashed border-gray-700 hover:border-crimson-500/50 rounded-xl p-8 text-center bg-dark-900/40 relative">
              <input
                type="file"
                multiple={multiple}
                accept="image/*,video/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center gap-2 pointer-events-none">
                {uploading ? (
                  <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
                ) : (
                  <Upload className="w-8 h-8 text-gold-400" />
                )}
                <div className="text-sm font-bold text-white">
                  {uploading ? 'Subiendo archivos...' : 'Haz clic o arrastra imágenes / vídeos aquí'}
                </div>
                <div className="text-xs text-gray-400">
                  Admite PNG, JPG, WEBP, GIF, MP4, WEBM (Hasta 200MB)
                </div>
              </div>
              {uploadError && (
                <div className="mt-3 text-xs text-crimson-400">{uploadError}</div>
              )}
            </div>
          ) : loading ? (
            <div className="text-center p-12 text-gray-400 font-mono text-xs">Cargando biblioteca de medios...</div>
          ) : mediaItems.length === 0 ? (
            <div className="text-center p-12 text-gray-400 font-mono text-xs space-y-2">
              <ImageIcon className="w-10 h-10 mx-auto opacity-40" />
              <div>No hay archivos guardados en la biblioteca. ¡Sube uno nuevo!</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {mediaItems.map((item) => {
                const isSelected = selectedUrls.includes(item.url);
                const isVideo = item.mimeType?.startsWith('video/') || item.url?.match(/\.(mp4|webm|mov|mkv)$/i);
                const mediaSrc = resolveMediaUrl(item.url);

                return (
                  <div
                    key={item.id || item.url}
                    onClick={() => toggleSelectUrl(item.url)}
                    className={`relative aspect-square rounded-xl overflow-hidden bg-dark-900 border cursor-pointer transition-all ${
                      isSelected ? 'border-crimson-500 ring-2 ring-crimson-500/50 scale-[1.02]' : 'border-gray-800 hover:border-gray-600'
                    }`}
                  >
                    {isVideo ? (
                      <div className="w-full h-full relative bg-black flex items-center justify-center">
                        <video src={mediaSrc} className="w-full h-full object-cover" muted />
                        <Film className="w-5 h-5 text-gold-400 absolute top-2 left-2 drop-shadow" />
                      </div>
                    ) : (
                      <img src={mediaSrc} alt="" className="w-full h-full object-cover" />
                    )}

                    <div
                      className={`absolute inset-0 bg-crimson-600/30 flex items-center justify-center transition-opacity ${
                        isSelected ? 'opacity-100' : 'opacity-0 hover:opacity-40'
                      }`}
                    >
                      <div className="bg-crimson-600 text-white rounded-full p-1">
                        <Check className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer for Multiple Selection */}
        {multiple && activeTab === 'library' && (
          <div className="p-4 border-t border-gray-800 flex justify-between items-center bg-dark-900/50 font-mono text-xs">
            <span className="text-gray-300">
              {selectedUrls.length} elemento(s) seleccionado(s)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-3 rounded-lg border border-gray-800 text-gray-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmMultiple}
                disabled={selectedUrls.length === 0}
                className="py-2 px-4 rounded-lg bg-crimson-600 hover:bg-crimson-500 text-white font-bold disabled:opacity-50"
              >
                Añadir Seleccionados ({selectedUrls.length})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
