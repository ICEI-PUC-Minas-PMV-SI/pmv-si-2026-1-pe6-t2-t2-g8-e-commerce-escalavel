import { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

const API = 'http://localhost:5000/api';

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch(`${API}/notifications/unread-count`);
        if (!res.ok) return;
        const data = await res.json();
        setCount(data.count ?? 0);
      } catch {
        // backend fora do ar — mantém o último valor
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Pressable
      onPress={() => router.push('/notification')}
      style={{ position: 'relative', padding: 4 }}
      accessibilityLabel={`Notificações${count > 0 ? `, ${count} não lidas` : ''}`}
    >
      <Text style={{ fontSize: 22 }}>🔔</Text>

      {count > 0 && (
        <View style={{
          position: 'absolute',
          top: 0,
          right: 0,
          backgroundColor: 'red',
          borderRadius: 999,
          minWidth: 18,
          height: 18,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 4,
        }}>
          <Text style={{
            color: 'white',
            fontSize: 10,
            fontWeight: 'bold',
          }}>
            {count > 99 ? '99+' : count}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
