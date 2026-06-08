import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter, usePathname, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ServicesDrawer } from './ServicesDrawer';

type Item = {
  key: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  path?: Href;
};

const ITEMS: Item[] = [
  { key: 'home',    label: 'Início',   icon: 'home',    path: '/' },
  { key: 'profile', label: 'Perfil',   icon: 'account', path: '/profile' },
  { key: 'cart',    label: 'Carrinho', icon: 'cart',    path: '/order/cart/cart' },
  { key: 'menu',    label: 'Menu',     icon: 'menu' },
];

// Barra de navegação inferior compartilhada por todas as telas autenticadas.
export function BottomMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (path?: Href) => {
    if (typeof path !== 'string') return false;
    return path === '/' ? pathname === '/' : pathname.startsWith(path);
  };

  return (
    <>
      <View style={[styles.bar, { paddingBottom: insets.bottom || 8 }]}>
        {ITEMS.map((item) => {
          const active = item.key === 'menu' ? false : isActive(item.path);
          const color = active ? '#FFFFFF' : 'rgba(255,255,255,0.55)';
          return (
            <Pressable
              key={item.key}
              style={styles.item}
              onPress={() => {
                if (item.key === 'menu') {
                  setDrawerOpen(true);
                  return;
                }
                if (item.path) router.push(item.path);
              }}
            >
              <MaterialCommunityIcons name={item.icon} size={24} color={color} />
              <Text style={[styles.label, { color }]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <ServicesDrawer visible={drawerOpen} onDismiss={() => setDrawerOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#0A0A0A',
    paddingTop: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
});
