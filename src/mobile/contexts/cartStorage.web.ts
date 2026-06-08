// Persistência do carrinho — alvo web (expo start --web).
// Usa localStorage para evitar o worker WASM do expo-sqlite no bundle web.
export const cartStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // storage indisponível (modo privado / quota) — ignora.
    }
  },
};
