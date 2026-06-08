// Persistência do carrinho — alvo nativo (iOS/Android).
// Backed por SQLite via expo-sqlite/kv-store (API igual ao AsyncStorage).
import Storage from 'expo-sqlite/kv-store';

export const cartStorage = {
  getItem: (key: string): Promise<string | null> => Storage.getItem(key),
  setItem: (key: string, value: string): Promise<void> => Storage.setItem(key, value),
};
