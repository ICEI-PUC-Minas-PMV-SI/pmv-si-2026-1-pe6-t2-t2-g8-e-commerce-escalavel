import React, { useEffect, useState, useCallback } from 'react';

const API = 'http://localhost:5000/api';

const TYPE_STYLES: Record<string, string> = {
  success: 'border-l-green-500',
  warning: 'border-l-yellow-400',
  error:   'border-l-red-500',
  info:    'border-l-blue-400',
};

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [lastUpdated, setLastUpdated]     = useState<Date | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${API}/notifications`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Notification[] = await res.json();
      setNotifications(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.warn('Backend indisponível — mantendo dados anteriores.');
      setError('Sem conexão com o servidor. Tentando reconectar...');
    } finally {
      setLoading(false);
    }
  }, []);

  // Busca inicial + polling a cada 5 segundos
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllRead = async () => {
    try {
      await fetch(`${API}/notifications/mark-all-read`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {
      // silencioso
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-black p-8 text-white">
      <div className="max-w-2xl mx-auto">

        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Histórico de Notificações</h1>
            {lastUpdated && (
              <p className="text-xs text-gray-500 mt-1">
                Atualizado às {lastUpdated.toLocaleTimeString()} · atualiza a cada 5s
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-gray-400 border border-gray-700 px-3 py-1.5 rounded hover:bg-gray-800 transition-colors"
            >
              Marcar todas como lidas ({unreadCount})
            </button>
          )}
        </div>

        {/* Estado de erro (não esconde as notificações anteriores) */}
        {error && (
          <div className="mb-4 px-4 py-2 rounded bg-red-950 border border-red-800 text-red-400 text-sm">
            ⚠ {error}
          </div>
        )}

        {/* Loading inicial */}
        {loading && (
          <div className="text-center text-gray-500 py-12">Carregando notificações...</div>
        )}

        {/* Lista vazia */}
        {!loading && notifications.length === 0 && !error && (
          <div className="bg-gray-900 p-6 rounded border border-gray-800 text-center text-gray-500">
            Nenhuma notificação encontrada.
          </div>
        )}

        {/* Lista de notificações */}
        {notifications.map(n => (
          <div
            key={n.id}
            className={`mb-3 p-4 border-l-4 rounded bg-gray-900 shadow-sm border border-gray-800
              ${TYPE_STYLES[n.type] ?? 'border-l-gray-500'}
              ${n.isRead ? 'opacity-60' : ''}`}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className={`font-bold text-white text-sm ${!n.isRead ? 'flex items-center gap-2' : ''}`}>
                {!n.isRead && (
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                )}
                {n.title}
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium
                ${n.type === 'success' ? 'bg-green-950 text-green-400' :
                  n.type === 'warning' ? 'bg-yellow-950 text-yellow-400' :
                  n.type === 'error'   ? 'bg-red-950 text-red-400' :
                                         'bg-blue-950 text-blue-400'}`}>
                {n.type}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-1">{n.message}</p>
            <span className="text-xs text-gray-600 mt-2 block">
              {new Date(n.createdAt).toLocaleString('pt-BR')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationPage;
