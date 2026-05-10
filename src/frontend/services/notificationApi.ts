const BASE = 'http://localhost:5000/api';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info';
  isRead: boolean;
  createdAt: string;
}

export async function fetchNotifications(): Promise<Notification[]> {
  const res = await fetch(`${BASE}/notifications`);
  if (!res.ok) throw new Error('Erro ao buscar notificações');
  return res.json();
}

export async function fetchUnreadCount(): Promise<number> {
  const res = await fetch(`${BASE}/notifications/unread-count`);
  if (!res.ok) throw new Error('Erro ao buscar contador');
  const data = await res.json();
  return data.count;
}

export async function markAsRead(id: number): Promise<void> {
  const res = await fetch(`${BASE}/notifications/${id}/read`, { method: 'PATCH' });
  if (!res.ok) throw new Error('Erro ao marcar como lida');
}
