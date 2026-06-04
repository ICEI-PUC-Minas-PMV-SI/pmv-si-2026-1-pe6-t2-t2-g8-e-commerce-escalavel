import { useState } from 'react';
import { BottomNavigation } from 'react-native-paper';
import { useRouter } from 'expo-router';

import { ServicesDrawer } from '@/src/components/ServicesDrawer';
import { CatalogScreen } from '@/src/screens/CatalogScreen';

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
  const router = useRouter();
  const [index, setIndex]           = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
        barStyle={{ backgroundColor: '#0A0A0A' }}
        inactiveColor="rgba(255,255,255,0.55)"
        activeColor="#FFFFFF"
      />
      <ServicesDrawer visible={drawerOpen} onDismiss={() => setDrawerOpen(false)} />
    </>
  );
}
