import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { 
  Send, Crown, Pin, Check, CheckCheck, Sparkles, MessageCircle, 
  Circle, AlertCircle, RefreshCw, PinOff, Shield, User, ChevronDown, ChevronUp
} from 'lucide-react';
import { API_BASE, getSocketUrl, resolveMediaUrl } from '../../config';

const SUMISO_QUICK_RESPONSES = [
  "✦ Sí, Mi Ama.",
  "📜 Orden recibida y acatada.",
  "⚡ Tarea enviada a su revisión.",
  "🙇‍♂️ Agradezco su guía y disciplina.",
  "🕯️ Permanezco a la espera de sus órdenes."
];

export function KingdomChatBox({
  memberId,
  token,
  userRole = 'MEMBER', // 'MEMBER' | 'ADMIN'
  memberInfo = null,
  heightClass = 'h-[580px] md:h-[650px]',
  showQuickReplies = true
}) {
  const [messages, setMessages] = useState([]);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isOtherOnline, setIsOtherOnline] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [showPinnedExpanded, setShowPinnedExpanded] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isComponentMounted = useRef(true);

  // Auto-scroll al final del chat
  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // 1. Cargar historial inicial vía REST
  const fetchMessages = async () => {
    if (!memberId || !token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/chat/${memberId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar mensajes del chat');
      const data = await res.json();
      if (isComponentMounted.current) {
        setMessages(data.messages || []);
        setPinnedMessages(data.pinnedMessages || []);
        setIsOtherOnline(userRole === 'ADMIN' ? data.isMemberOnline : data.isAdminOnline);
        setTimeout(() => scrollToBottom('auto'), 100);
      }
    } catch (err) {
      console.error('[Chat Fetch Error]:', err);
      if (isComponentMounted.current) {
        setErrorMsg('No se pudo cargar el historial del chat');
      }
    } finally {
      if (isComponentMounted.current) setLoading(false);
    }
  };

  // 2. Conectar y gestionar Socket.io
  useEffect(() => {
    isComponentMounted.current = true;
    fetchMessages();

    if (!token || !memberId) return;

    const socketUrl = getSocketUrl();
    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1500
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      if (!isComponentMounted.current) return;
      setSocketConnected(true);
      setErrorMsg('');
      newSocket.emit('join_chat', { memberId });
      // Marcar leídos al conectar
      newSocket.emit('mark_as_read', { memberId });
    });

    newSocket.on('disconnect', () => {
      if (isComponentMounted.current) setSocketConnected(false);
    });

    // Nuevo mensaje entrante
    newSocket.on('new_message', (msg) => {
      if (!isComponentMounted.current) return;
      if (msg.memberId === memberId) {
        setMessages((prev) => {
          // Evitar duplicados si ya existe por id
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });

        if (msg.isPinned) {
          setPinnedMessages((prev) => [msg, ...prev.filter((p) => p.id !== msg.id)]);
        }

        // Si el mensaje es del otro interlocutor, marcar como leído
        const isFromOther = (userRole === 'ADMIN' && msg.senderRole === 'MEMBER') ||
                            (userRole === 'MEMBER' && msg.senderRole === 'ADMIN');
        if (isFromOther) {
          newSocket.emit('mark_as_read', { memberId });
        }

        setTimeout(() => scrollToBottom('smooth'), 100);
      }
    });

    // Notificación de mensajes leídos (doble check ✓✓)
    newSocket.on('messages_read', ({ memberId: mId, readerRole, readAt }) => {
      if (!isComponentMounted.current) return;
      if (mId === memberId) {
        const markedRole = readerRole === 'ADMIN' ? 'MEMBER' : 'ADMIN';
        setMessages((prev) =>
          prev.map((m) =>
            m.senderRole === markedRole && !m.readAt ? { ...m, readAt } : m
          )
        );
      }
    });

    // Indicador de "escribiendo..."
    newSocket.on('user_typing', ({ memberId: mId, senderRole, isTyping }) => {
      if (!isComponentMounted.current) return;
      if (mId === memberId) {
        const isFromOther = (userRole === 'ADMIN' && senderRole === 'MEMBER') ||
                            (userRole === 'MEMBER' && senderRole === 'ADMIN');
        if (isFromOther) {
          setOtherTyping(isTyping);
        }
      }
    });

    // Estado online del otro interlocutor
    if (userRole === 'ADMIN') {
      newSocket.on('member_status', ({ memberId: mId, online }) => {
        if (!isComponentMounted.current) return;
        if (mId === memberId) setIsOtherOnline(online);
      });
    } else {
      newSocket.on('admin_status', ({ online }) => {
        if (!isComponentMounted.current) return;
        setIsOtherOnline(online);
      });
    }

    // Evento de fijado de mensaje
    newSocket.on('message_pinned', ({ messageId, isPinned }) => {
      if (!isComponentMounted.current) return;
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, isPinned } : m))
      );
      if (isPinned) {
        // Recargar o mover a pinned
        fetchMessages();
      } else {
        setPinnedMessages((prev) => prev.filter((p) => p.id !== messageId));
      }
    });

    return () => {
      isComponentMounted.current = false;
      if (newSocket) {
        newSocket.emit('leave_chat', { memberId });
        newSocket.disconnect();
      }
    };
  }, [memberId, token, userRole]);

  // Manejar indicador de escritura local
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (!socketRef.current || !socketConnected) return;

    socketRef.current.emit('typing', { memberId, isTyping: true });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.emit('typing', { memberId, isTyping: false });
      }
    }, 1500);
  };

  // Enviar mensaje
  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || sending) return;

    setSending(true);

    // Cancelar indicador de typing inmediatamente
    if (socketRef.current) {
      socketRef.current.emit('typing', { memberId, isTyping: false });
    }

    const payload = {
      memberId,
      content: text
    };

    if (socketRef.current && socketConnected) {
      socketRef.current.emit('send_message', payload, (res) => {
        if (isComponentMounted.current) {
          setSending(false);
          if (res?.error) {
            setErrorMsg(res.error);
          } else {
            setInputText('');
            setTimeout(() => scrollToBottom('smooth'), 50);
          }
        }
      });
    } else {
      // Fallback REST si el socket no estuviera conectado
      try {
        const res = await fetch(`${API_BASE}/api/kingdom/chat/${memberId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Error al enviar mensaje');
        const newMsg = await res.json();
        if (isComponentMounted.current) {
          setMessages((prev) => [...prev, newMsg]);
          setInputText('');
          setTimeout(() => scrollToBottom('smooth'), 50);
        }
      } catch (err) {
        if (isComponentMounted.current) setErrorMsg('Error al enviar mensaje.');
      } finally {
        if (isComponentMounted.current) setSending(false);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Toggle fijado de mensaje (Sólo Admin)
  const handleTogglePin = (messageId, currentPinned) => {
    if (userRole !== 'ADMIN' || !socketRef.current) return;
    socketRef.current.emit('toggle_pin', { messageId, isPinned: !currentPinned });
  };

  return (
    <div className={`flex flex-col bg-[#080305] border border-gold-500/25 rounded-2xl overflow-hidden shadow-2xl ${heightClass} text-[#f4ebd9]`}>
      
      {/* 1. CABECERA ELEGANTE DEL CHAT */}
      <div className="bg-[#12070c] border-b border-gold-500/30 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full border border-gold-500/40 bg-gradient-to-br from-bordeaux-950 to-dark-950 flex items-center justify-center shadow-md">
              {userRole === 'ADMIN' ? (
                <User className="w-5 h-5 text-gold-400" />
              ) : (
                <Crown className="w-5 h-5 text-gold-400" />
              )}
            </div>
            {/* Indicador de conexión */}
            <span 
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#12070c] ${
                isOtherOnline 
                  ? 'bg-emerald-500 shadow-sm shadow-emerald-500/80 animate-pulse' 
                  : 'bg-gray-600'
              }`} 
              title={isOtherOnline ? 'En línea en este momento' : 'Desconectado'}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-brand font-bold text-sm text-gold-300">
                {userRole === 'ADMIN' 
                  ? `${memberInfo?.memberNumber || '#'} ${memberInfo?.alias || 'Sumiso'}` 
                  : 'Yakuza Princess'}
              </h3>
              <span className="text-[10px] font-mono tracking-widest px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/30 uppercase">
                {userRole === 'ADMIN' ? (memberInfo?.internalName || 'Expediente') : 'Línea del Trono'}
              </span>
            </div>

            <p className="text-[11px] font-mono flex items-center gap-1.5 text-gray-400">
              <span className={`w-1.5 h-1.5 rounded-full ${isOtherOnline ? 'bg-emerald-400' : 'bg-gray-500'}`} />
              <span>
                {userRole === 'ADMIN' 
                  ? (isOtherOnline ? 'Sumiso conectado al Portal' : 'Sumiso desconectado')
                  : (isOtherOnline ? 'La Princesa está en el Trono' : 'La Princesa atenderá su mensaje')}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pinnedMessages.length > 0 && (
            <button
              onClick={() => setShowPinnedExpanded(!showPinnedExpanded)}
              className="px-2.5 py-1 text-xs font-mono rounded-lg border border-gold-500/40 bg-gold-500/10 text-gold-300 hover:bg-gold-500/20 flex items-center gap-1 transition-colors"
              title="Ver órdenes directas fijadas"
            >
              <Pin className="w-3.5 h-3.5 text-gold-400 fill-gold-400/30" />
              <span className="hidden sm:inline">Mandatos ({pinnedMessages.length})</span>
              {showPinnedExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}

          <button
            onClick={fetchMessages}
            disabled={loading}
            className="p-1.5 rounded-lg border border-gray-800 text-gray-400 hover:text-gold-300 hover:border-gold-500/40 transition-colors"
            title="Refrescar mensajes"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. BANNER DE MANDATOS FIJADOS (PINNED DIRECTIVES) */}
      {pinnedMessages.length > 0 && showPinnedExpanded && (
        <div className="bg-[#1b0a13] border-b border-gold-500/40 p-3 space-y-2 animate-fade-in shrink-0">
          <div className="flex items-center justify-between text-[11px] font-mono text-gold-300 uppercase tracking-widest font-bold">
            <span className="flex items-center gap-1.5">
              <Pin className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
              Órdenes y Mandatos Fijados por la Princesa
            </span>
            <span className="text-[10px] text-gray-400">Permanentes hasta revocación</span>
          </div>
          <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
            {pinnedMessages.map((p) => (
              <div 
                key={p.id}
                className="bg-dark-950/90 border border-gold-500/30 rounded-lg p-2 text-xs text-[#f5ebe1] flex items-start justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <p className="font-sans leading-relaxed text-gold-100">{p.content}</p>
                  <span className="text-[10px] font-mono text-gray-500 block">
                    Fijado el {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {userRole === 'ADMIN' && (
                  <button
                    onClick={() => handleTogglePin(p.id, true)}
                    className="text-gray-400 hover:text-red-400 transition-colors p-1"
                    title="Desfijar este mandato"
                  >
                    <PinOff className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. ZONA CENTRAL DE MENSAJES CON SCROLL FLUIDO */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar min-h-0 bg-[#060204]">
        {loading && messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-xs font-mono text-gold-400/70 space-y-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Abriendo conexión segura con la Casa...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-gray-500">
            <div className="w-12 h-12 rounded-full border border-gold-500/20 bg-[#12070c] flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-gold-500/40" />
            </div>
            <div className="space-y-1 max-w-sm">
              <p className="font-serif italic text-sm text-gold-300">«El silencio es el preámbulo de toda devoción.»</p>
              <p className="text-xs font-mono text-gray-500">
                {userRole === 'ADMIN'
                  ? 'Inicia la línea de comunicación directa con este sumiso.'
                  : 'Escribe tu mensaje o reporte a la Princesa. Quedará registrado en tu expediente.'}
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = (userRole === 'ADMIN' && msg.senderRole === 'ADMIN') ||
                         (userRole === 'MEMBER' && msg.senderRole === 'MEMBER');
            const isPrincess = msg.senderRole === 'ADMIN';

            return (
              <div
                key={msg.id || index}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
              >
                {/* Remitente pequeño */}
                <div className="flex items-center gap-1.5 px-2 mb-1">
                  {isPrincess && <Crown className="w-3 h-3 text-gold-400" />}
                  <span className={`text-[10px] font-mono tracking-wider ${isPrincess ? 'text-gold-400 font-bold' : 'text-gray-400'}`}>
                    {msg.senderName || (isPrincess ? 'Yakuza Princess' : 'Sumiso')}
                  </span>
                  <span className="text-[10px] font-mono text-gray-600">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Burbuja del Mensaje */}
                <div
                  className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-2.5 text-xs font-sans leading-relaxed relative shadow-md transition-all ${
                    isPrincess
                      ? 'bg-gradient-to-br from-[#2a0e1b] to-[#180710] border border-gold-500/40 text-gold-100 shadow-bordeaux-950/60'
                      : 'bg-[#181116] border border-gray-800 text-gray-200'
                  } ${msg.isPinned ? 'ring-1 ring-gold-400' : ''}`}
                >
                  {/* Pin badge si está fijado */}
                  {msg.isPinned && (
                    <div className="flex items-center gap-1 text-[10px] font-mono text-gold-400 mb-1 border-b border-gold-500/20 pb-0.5">
                      <Pin className="w-2.5 h-2.5 fill-gold-400" />
                      <span>Orden Directa Fijada</span>
                    </div>
                  )}

                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>

                  {/* Estado de entrega y lectura */}
                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] font-mono">
                    {isMe && (
                      <span title={msg.readAt ? `Leído a las ${new Date(msg.readAt).toLocaleTimeString()}` : 'Enviado'}>
                        {msg.readAt ? (
                          <CheckCheck className="w-3.5 h-3.5 text-gold-400 inline" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-gray-500 inline" />
                        )}
                      </span>
                    )}

                    {/* Botón pin para Admin en hover */}
                    {userRole === 'ADMIN' && (
                      <button
                        onClick={() => handleTogglePin(msg.id, msg.isPinned)}
                        className="opacity-0 group-hover:opacity-100 ml-2 text-gray-400 hover:text-gold-300 transition-opacity"
                        title={msg.isPinned ? 'Desfijar orden' : 'Fijar como orden directa'}
                      >
                        <Pin className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Indicador de "está escribiendo..." */}
        {otherTyping && (
          <div className="flex items-center gap-2 text-xs font-mono text-gold-400/80 animate-pulse px-2">
            <span className="w-2 h-2 rounded-full bg-gold-400 animate-bounce" />
            <span>
              {userRole === 'ADMIN' ? `${memberInfo?.alias || 'El sumiso'} está escribiendo...` : 'La Princesa está redactando una orden...'}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. RESPUESTAS RÁPIDAS CEREMONIALES (SUMISO EN MÓVIL / DESKTOP) */}
      {userRole === 'MEMBER' && showQuickReplies && (
        <div className="bg-[#0f050a] border-t border-gold-500/15 px-3 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[10px] font-mono text-gold-500/70 whitespace-nowrap uppercase tracking-wider">
            ✦ Rápido:
          </span>
          {SUMISO_QUICK_RESPONSES.map((qr, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(qr)}
              disabled={sending}
              className="py-1 px-2.5 rounded-full bg-[#1b0a13] hover:bg-[#2e1020] border border-gold-500/30 hover:border-gold-400 text-gold-200 text-[11px] font-sans whitespace-nowrap transition-all shadow-sm active:scale-95"
            >
              {qr}
            </button>
          ))}
        </div>
      )}

      {/* 5. ZONA DE ENTRADA DE TEXTO ADAPTADA A MÓVIL (100dvh safe) */}
      <div className="bg-[#12070c] border-t border-gold-500/30 p-3 shrink-0">
        {errorMsg && (
          <div className="text-[11px] font-mono text-red-400 mb-2 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              rows={1}
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={
                userRole === 'ADMIN'
                  ? 'Escribe una orden o mensaje al sumiso (Enter para enviar)...'
                  : 'Escribe tu respuesta solemne a la Princesa (Enter para enviar)...'
              }
              className="w-full bg-[#080205] border border-gold-500/30 focus:border-gold-400 text-[#f5ebe1] placeholder-gray-600 rounded-xl px-3.5 py-2.5 text-xs font-sans resize-none focus:outline-none focus:ring-1 focus:ring-gold-400/50 max-h-28 custom-scrollbar leading-relaxed"
            />
          </div>

          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || sending}
            className={`p-3 rounded-xl border flex items-center justify-center transition-all shadow-lg active:scale-95 shrink-0 ${
              inputText.trim() && !sending
                ? 'bg-gradient-to-r from-bordeaux-700 to-bordeaux-600 border-gold-400 text-gold-200 hover:text-white shadow-bordeaux-900/50'
                : 'bg-dark-950 border-gray-800 text-gray-600 cursor-not-allowed'
            }`}
            title="Enviar mensaje"
          >
            <Send className={`w-4 h-4 ${sending ? 'animate-pulse' : ''}`} />
          </button>
        </div>

        {/* Micro-nota de conexión */}
        <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-gray-500">
          <span className="flex items-center gap-1">
            <Circle className={`w-2 h-2 ${socketConnected ? 'fill-emerald-500 text-emerald-500' : 'fill-amber-500 text-amber-500'}`} />
            {socketConnected ? 'Canal encriptado en tiempo real activo' : 'Conectando canal seguro...'}
          </span>
          <span className="hidden sm:inline text-gray-600">Mayús + Enter para salto de línea</span>
        </div>
      </div>

    </div>
  );
}
