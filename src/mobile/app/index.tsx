import { useState } from 'react';
import { BottomNavigation } from 'react-native-paper';
import { Redirect, useRouter } from 'expo-router';

import { ServicesDrawer } from '@/src/components/ServicesDrawer';
import { CatalogScreen } from '@/src/screens/CatalogScreen';
import { useAuth } from '@/src/contexts/AuthContext';

type RouteKey = 'home' | 'profile' | 'menu';

const ROUTES: { key: RouteKey; title: string; focusedIcon: string; unfocusedIcon?: string }[] = [
  { key: 'home',    title: 'Início',  focusedIcon: 'home',    unfocusedIcon: 'home-outline' },
  { key: 'profile', title: 'Perfil',  focusedIcon: 'account', unfocusedIcon: 'account-outline' },
  { key: 'menu',    title: 'Menu',    focusedIcon: 'menu' },
];

const renderScene = BottomNavigation.SceneMap({
  home:    CatalogScreen,
  profile: () => null,
  menu:    () => null,
});

export default function AppShell() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [index, setIndex]           = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!isAuthenticated) return <Redirect href="/login" />;

  const onIndexChange = (next: number) => {
    const key = ROUTES[next].key;
    if (key === 'menu') {
      setDrawerOpen(true);
      return;
    }
    if (key === 'profile') {
      router.push('/profile');
      return;
    }
    setIndex(next);
  };

  return (
    <>
      <BottomNavigation
        navigationState={{ index, routes: ROUTES }}
        onIndexChange={onIndexChange}
        renderScene={renderScene}
      />
      <ServicesDrawer visible={drawerOpen} onDismiss={() => setDrawerOpen(false)} />
    </>
  );
}
