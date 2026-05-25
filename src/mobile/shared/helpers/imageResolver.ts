import Constants from 'expo-constants';

const ABSOLUTE_URL_RE = /^(https?:|data:|file:)/i;

const fromEnv = process.env.EXPO_PUBLIC_IMAGE_BASE_URL;
const fromExtra = (
  Constants.expoConfig?.extra as { imageBaseUrl?: string } | undefined
)?.imageBaseUrl;

// DB armazena apenas filename/key (ex.: `polo-preta.webp`).
// Resolver prefixa IMAGE_BASE_URL em runtime — mesmo DB serve dev e prod.
// Dev default: gateway proxy → MinIO bucket `products`.
// Prod: override via EXPO_PUBLIC_IMAGE_BASE_URL=https://cdn.<host>/images/products
const DEFAULT_BASE = 'http://localhost:7000/images/products';

export const IMAGE_BASE_URL = (fromEnv ?? fromExtra ?? DEFAULT_BASE).replace(
  /\/+$/,
  ''
);

export function resolveImageUri(raw?: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (ABSOLUTE_URL_RE.test(trimmed)) return trimmed;
  if (!IMAGE_BASE_URL) return null;
  return `${IMAGE_BASE_URL}/${encodeURI(trimmed.replace(/^\/+/, ''))}`;
}
