import React, { useState, useEffect } from 'react';
import { 
  Search, MessageSquare, User, Crown, RefreshCw, Circle, 
  ExternalLink, ArrowLeft, Pin, CheckCheck, Clock
} from 'lucide-react';
import { API_BASE, safeFetchJson } from '../../config';
import { KingdomChatBox } from './KingdomChatBox';
import { useNavigate } from 'react-router-dom';

export function KingdomAdminChatView({ token, initialSelectedMemberId = null }) {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState(initialSelectedMemberId);

  const fetchConversations = async () => {
    if (!token) return;
    try {
      const data = await safeFetchJson(`${API_BASE}/api/kingdom/admin/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (Array.isArray(data)) {
        setConversations(data);
        // Si no hay ninguno seleccionado y estamos en desktop, seleccionar el primero por defecto
        if (!selectedMemberId && data.length > 0 && window.innerWidth >= 768) {
          setSelectedMemberId(data[0].memberId);
        }
      }
    } catch (err) {
      console.error('[Fetch Conversations Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 15000);
    return () => clearInterval(interval);
  }, [token]);

  const filteredConversations = conversations.filter(c => {
    const q = searchTerm.toLowerCase();
    return (
      c.alias?.toLowerCase().includes(q) ||
      c.memberNumber?.toLowerCase().includes(q) ||
      c.internalName?.toLowerCase().includes(q)
    );
  });

  const selectedConversation = conversations.find(c => c.memberId === selectedMemberId);

  return (
    <div className="w-full bg-[#080205] border border-gold-500/25 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[750px]">
      
      {/* ========================================================================= */}
      {/* COLUMNA IZQUIERDA: LISTA DE CONVERSACIONES                              */}
      {/* ========================================================================= */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-gold-500/20 bg-[#0e0409] flex flex-col shrink-0 ${
        selectedMemberId ? 'hidden md:flex' : 'flex'
      }`}>
        
        {/* Cabecera de la lista */}
        <div className="p-4 border-b border-gold-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gold-400" />
              <h2 className="font-brand font-bold text-base text-gold-200">Mensajería del Reino</h2>
            </div>
            <button
              onClick={fetchConversations}
              disabled={loading}
              className="p-1.5 rounded-lg border border-gray-800 text-gray-400 hover:text-gold-300 hover:border-gold-500/40 transition-colors"
              title="Actualizar lista de chats"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar sumiso por alias o #..."
              className="w-full bg-[#170810] border border-gold-500/20 focus:border-gold-400 text-xs text-[#f5ebe1] placeholder-gray-500 rounded-xl pl-9 pr-3 py-2 outline-none"
            />
          </div>
        </div>

        {/* Lista scrolleable de chats */}
        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-[#220d18]">
          {loading && conversations.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-gray-500">
              Cargando conversaciones...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-gray-500">
              No hay conversaciones registradas
            </div>
          ) : (
            filteredConversations.map((c) => {
              const isSelected = c.memberId === selectedMemberId;
              const hasUnread = c.unreadCount > 0;

              return (
                <div
                  key={c.memberId}
                  onClick={() => setSelectedMemberId(c.memberId)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-all border-l-2 ${
                    isSelected
                      ? 'bg-[#1e0a15] border-gold-400 text-white shadow-inner'
                      : 'hover:bg-[#15060f] border-transparent text-gray-300'
                  }`}
                >
                  {/* Avatar con presencia */}
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full border border-gold-500/30 bg-[#1f0b17] flex items-center justify-center font-serif text-sm font-bold text-gold-300">
                      {c.avatarUrl ? (
                        <img src={c.avatarUrl} alt={c.alias} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        c.alias?.charAt(0).toUpperCase() || 'S'
                      )}
                    </div>
                    {/* Indicador en línea */}
                    <span 
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#0e0409] ${
                        c.isOnline ? 'bg-emerald-500 shadow-sm shadow-emerald-500/80 animate-pulse' : 'bg-gray-600'
                      }`}
                      title={c.isOnline ? 'En línea' : 'Desconectado'}
                    />
                  </div>

                  {/* Datos del sumiso y último mensaje */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-brand font-bold text-xs truncate text-gold-300">
                        {c.memberNumber} {c.alias}
                      </span>
                      {c.lastMessage && (
                        <span className="text-[10px] font-mono text-gray-500 shrink-0">
                          {new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>

                    <p className={`text-xs truncate font-sans leading-snug ${hasUnread ? 'text-white font-semibold' : 'text-gray-400'}`}>
                      {c.lastMessage ? (
                        c.lastMessage.senderRole === 'ADMIN' ? `Tú: ${c.lastMessage.content}` : c.lastMessage.content
                      ) : (
                        <span className="italic text-gray-600">Sin mensajes aún</span>
                      )}
                    </p>

                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-gray-500">
                        {c.groupName || 'Sin Grupo'}
                      </span>
                      {hasUnread && (
                        <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-white font-mono text-[10px] font-bold shadow-sm shadow-red-700/50">
                          {c.unreadCount} nuevo{c.unreadCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* COLUMNA DERECHA: VENTANA DE CHAT ACTIVA                                 */}
      {/* ========================================================================= */}
      <div className={`flex-1 flex flex-col bg-[#050103] ${
        !selectedMemberId ? 'hidden md:flex' : 'flex'
      }`}>
        {selectedMemberId && selectedConversation ? (
          <div className="flex-1 flex flex-col h-full">
            {/* Barra superior con navegación móvil y botón de ir a CRM */}
            <div className="bg-[#12070c] border-b border-gold-500/25 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedMemberId(null)}
                  className="md:hidden p-1.5 rounded-lg border border-gold-500/30 text-gold-400 hover:text-white"
                  title="Volver a lista de chats"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono text-gold-300">
                  Canal Directo: <strong>{selectedConversation.memberNumber} {selectedConversation.alias}</strong>
                </span>
              </div>

              <button
                onClick={() => navigate(`/admin/crm/${selectedConversation.memberId}`)}
                className="px-2.5 py-1 rounded-lg bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/30 text-gold-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
                title="Abrir expediente completo en el CRM"
              >
                <span>Ver Ficha CRM</span>
                <ExternalLink className="w-3 h-3 text-gold-400" />
              </button>
            </div>

            {/* Componente ChatBox en modo Admin */}
            <div className="flex-1 min-h-0">
              <KingdomChatBox
                key={selectedMemberId}
                memberId={selectedMemberId}
                token={token}
                userRole="ADMIN"
                memberInfo={selectedConversation}
                heightClass="h-full"
                showQuickReplies={false}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500 space-y-3">
            <div className="w-16 h-16 rounded-2xl border border-gold-500/20 bg-[#12070c] flex items-center justify-center text-gold-400 shadow-xl">
              <Crown className="w-8 h-8 text-gold-400" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-lg text-gold-200">Panel de Mensajería del Reino</h3>
              <p className="text-xs font-mono text-gray-400 max-w-sm">
                Selecciona a un sumiso de la lista para emitir órdenes en tiempo real, auditar reportes o revisar mandatos.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
