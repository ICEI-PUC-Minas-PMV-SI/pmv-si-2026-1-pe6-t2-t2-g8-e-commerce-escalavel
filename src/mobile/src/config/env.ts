import Constants from 'expo-constants';

const fromEnv = process.env.EXPO_PUBLIC_API_URL;
const fromExtra = (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl;

// Em dev com dispositivo físico, usar o IP da máquina na rede local.
// Altere o IP abaixo se mudar de rede.
const DEV_LAN_URL = 'http://192.168.0.4:7000/api';

export const API_URL = fromEnv ?? fromExtra ?? DEV_LAN_URL;
