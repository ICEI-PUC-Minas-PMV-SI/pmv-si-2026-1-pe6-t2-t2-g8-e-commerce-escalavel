// Persistência da sessão (token + user) — alvo nativo (iOS/Android).
// Backed por SQLite via expo-sqlite/kv-store (API igual ao AsyncStorage),
// mesmo padrão do carrinho (ver contexts/cartStorage.ts).
import Storage from 'expo-sqlite/kv-store';

export const authStorage = {
  getItem: (key: string): Promise<string | null> => Storage.getItem(key),
  setItem: (key: string, value: string): Promise<void> => Storage.setItem(key, value),
  removeItem: (key: string): Promise<void> => Storage.removeItem(key),
};
