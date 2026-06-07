import { useEffect, useState, useCallback } from 'react';
import { Stack } from 'expo-router'; 
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

const API = 'http://localhost:5000/api';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const TYPE_COLORS: Record<string, string> = {
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${API}/notifications`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Notification[] = await res.json();
      setNotifications(data);
      setLastUpdated(new Date().toLocaleTimeString('pt-BR'));
      setError(null);
    } catch {
      setError('Sem conexão com o servidor. Tentando reconectar...');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Busca inicial + polling a cada 5 segundos
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAllRead = async () => {
    try {
      await fetch(`${API}/notifications/mark-all-read`, { method: 'PUT' });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // silencioso
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: '#6b7280', marginTop: 12 }}>Carregando notificações...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000', padding: 16 }}>
      <Stack.Screen options={{ title: 'Notificações' }} />  {}

      {/* Cabeçalho */}
      <View style={{ marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#1f2937', paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff' }}>
            Notificações
          </Text>
          {unreadCount > 0 && (
            <Pressable
              onPress={markAllRead}
              style={{
                borderWidth: 1,
                borderColor: '#374151',
                borderRadius: 6,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Text style={{ color: '#9ca3af', fontSize: 12 }}>
                Marcar lidas ({unreadCount})
              </Text>
            </Pressable>
          )}
        </View>
        {lastUpdated && (
          <Text style={{ color: '#4b5563', fontSize: 11, marginTop: 4 }}>
            Atualizado às {lastUpdated} · atualiza a cada 5s
          </Text>
        )}
      </View>

      {/* Erro */}
      {error && (
        <View style={{
          backgroundColor: '#1a0000',
          borderWidth: 1,
          borderColor: '#7f1d1d',
          borderRadius: 6,
          padding: 10,
          marginBottom: 12,
        }}>
          <Text style={{ color: '#f87171', fontSize: 13 }}>⚠ {error}</Text>
        </View>
      )}

      {/* Lista vazia */}
      {notifications.length === 0 && !error && (
        <View style={{
          backgroundColor: '#111827',
          borderWidth: 1,
          borderColor: '#1f2937',
          borderRadius: 8,
          padding: 24,
          alignItems: 'center',
        }}>
          <Text style={{ color: '#6b7280' }}>Nenhuma notificação encontrada.</Text>
        </View>
      )}

      {/* Lista de notificações */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
        renderItem={({ item }) => (
          <View style={{
            marginBottom: 10,
            padding: 14,
            backgroundColor: '#111827',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#1f2937',
            borderLeftWidth: 4,
            borderLeftColor: TYPE_COLORS[item.type] ?? '#6b7280',
            opacity: item.isRead ? 0.6 : 1,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                {!item.isRead && (
                  <View style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: '#3b82f6',
                  }} />
                )}
                <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 14, flex: 1 }}>
                  {item.title}
                </Text>
              </View>
              <View style={{
                backgroundColor: item.type === 'success' ? '#052e16' :
                                  item.type === 'warning' ? '#1c1000' :
                                  item.type === 'error'   ? '#1a0000' : '#0c1a3a',
                borderRadius: 999,
                paddingHorizontal: 8,
                paddingVertical: 2,
                marginLeft: 8,
              }}>
                <Text style={{
                  fontSize: 10,
                  fontWeight: '600',
                  color: TYPE_COLORS[item.type] ?? '#9ca3af',
                }}>
                  {item.type}
                </Text>
              </View>
            </View>

            <Text style={{ color: '#9ca3af', fontSize: 13 }}>{item.message}</Text>
            <Text style={{ color: '#4b5563', fontSize: 11, marginTop: 6 }}>
              {new Date(item.createdAt).toLocaleString('pt-BR')}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
