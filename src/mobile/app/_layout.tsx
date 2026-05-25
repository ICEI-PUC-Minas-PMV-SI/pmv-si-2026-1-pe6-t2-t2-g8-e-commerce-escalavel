import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { paperTheme } from '@/src/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: paperTheme.colors.surface },
            headerTitleStyle: { color: paperTheme.colors.onSurface },
            headerTintColor: paperTheme.colors.onSurface,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: paperTheme.colors.background },
          }}
        >
          {/* Shell owns the bottom bar + per-scene headers. */}
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="stock" options={{ title: 'Estoque' }} />
          <Stack.Screen
            name="stock/create"
            options={{ title: 'Novo item', presentation: 'modal' }}
          />
          <Stack.Screen
            name="stock/restock"
            options={{ title: 'Reabastecer', presentation: 'modal' }}
          />
          <Stack.Screen
            name="stock/adjust"
            options={{ title: 'Ajustar', presentation: 'modal' }}
          />
          <Stack.Screen name="stock/history" options={{ title: 'Histórico' }} />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
