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
          <Stack.Screen name="index" options={{ title: 'Loja' }} />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
