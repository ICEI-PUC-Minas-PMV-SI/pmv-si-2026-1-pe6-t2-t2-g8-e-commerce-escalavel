import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { paperTheme } from '@/src/theme';
import { CartProvider } from '../contexts/CartContext';
import { AuthProvider } from '@/src/contexts/AuthContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#0A0A0A" translucent={false} />
      <PaperProvider theme={paperTheme}>
        <AuthProvider>
          <CartProvider>
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: paperTheme.colors.surface },
                headerTitleStyle: { color: paperTheme.colors.onSurface },
                headerTintColor: paperTheme.colors.onSurface,
                headerShadowVisible: false,
                contentStyle: { backgroundColor: paperTheme.colors.background },
                headerBackTitle: '',
                headerBackButtonDisplayMode: 'minimal',
              }}
            >
              <Stack.Screen name="index"    options={{ headerShown: false }} />
              <Stack.Screen name="login"    options={{ headerShown: false }} />
              <Stack.Screen name="register" options={{ headerShown: false }} />
              <Stack.Screen name="profile"  options={{ title: 'Meu Perfil' }} />
              <Stack.Screen name="profile/edit"     options={{ title: 'Editar Perfil' }} />
              <Stack.Screen name="profile/password" options={{ title: 'Alterar Senha' }} />
              <Stack.Screen name="admin/users" options={{ title: 'Usuários' }} />
              <Stack.Screen name="stock"    options={{ title: 'Estoque' }} />
              <Stack.Screen name="stock/create"  options={{ title: 'Novo item', presentation: 'modal' }} />
              <Stack.Screen name="stock/restock" options={{ title: 'Reabastecer', presentation: 'modal' }} />
              <Stack.Screen name="stock/adjust"  options={{ title: 'Ajustar', presentation: 'modal' }} />
              <Stack.Screen name="stock/history" options={{ title: 'Histórico' }} />

              {/* Catálogo */}
              <Stack.Screen name="catalog/product/[id]"         options={{ title: 'Produto' }} />
              <Stack.Screen name="catalog/categories"           options={{ title: 'Categorias' }} />
              <Stack.Screen name="catalog/products"             options={{ title: 'Produtos' }} />
              <Stack.Screen name="catalog/admin/product-form"   options={{ title: 'Produto', presentation: 'modal' }} />
            </Stack>
          </CartProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
