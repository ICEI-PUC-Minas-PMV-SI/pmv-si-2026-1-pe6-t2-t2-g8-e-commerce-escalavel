import { useState } from 'react';
import { BottomNavigation } from 'react-native-paper';

import { ServicesDrawer } from '@/src/components/ServicesDrawer';
import { CatalogScreen } from '@/src/screens/CatalogScreen';

type RouteKey = 'home' | 'menu';

const ROUTES: { key: RouteKey; title: string; focusedIcon: string; unfocusedIcon?: string }[] = [
  { key: 'home', title: 'Início', focusedIcon: 'home', unfocusedIcon: 'home-outline' },
  { key: 'menu', title: 'Menu', focusedIcon: 'menu' },
];

// `menu` never owns a scene — tapping it opens the services drawer and the
// active tab stays on `home`. SceneMap still needs an entry, so it gets a noop.
const renderScene = BottomNavigation.SceneMap({
  home: CatalogScreen,
  menu: () => null,
});

export default function AppShell() {
  const [index, setIndex] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const onIndexChange = (next: number) => {
    if (ROUTES[next].key === 'menu') {
      setDrawerOpen(true);
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
