import Constants from 'expo-constants';

const fromEnv = process.env.EXPO_PUBLIC_API_URL;
const fromExtra = (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl;

// Fallback genérico. Para dispositivo físico, defina EXPO_PUBLIC_API_URL no .env
// com o IP da máquina na rede local (ex: http://192.168.x.x:7000/api).
const DEFAULT_API_URL = 'http://localhost:7000/api';

export const API_URL = fromEnv ?? fromExtra ?? DEFAULT_API_URL;
