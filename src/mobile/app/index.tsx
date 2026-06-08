import { CatalogScreen } from '@/src/screens/CatalogScreen';

// Tela inicial = catálogo, acessível sem login. A barra inferior é global (ver app/_layout.tsx).
export default function AppShell() {
  return <CatalogScreen />;
}
