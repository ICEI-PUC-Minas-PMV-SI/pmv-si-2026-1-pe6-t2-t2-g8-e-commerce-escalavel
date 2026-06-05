import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { paperTheme } from '@/src/theme';
import { CartProvider } from '../contexts/CartContext';
import { AuthProvider } from '@/src/contexts/AuthContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
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
              }}
            >
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="register" options={{ headerShown: false }} />
              <Stack.Screen name="profile" options={{ title: 'Meu Perfil' }} />
              <Stack.Screen name="profile/edit" options={{ title: 'Editar Perfil' }} />
              <Stack.Screen name="profile/password" options={{ title: 'Alterar Senha' }} />
              <Stack.Screen name="admin/users" options={{ title: 'Usuários' }} />
              <Stack.Screen name="stock" options={{ title: 'Estoque' }} />
              <Stack.Screen name="stock/create" options={{ title: 'Novo item', presentation: 'modal' }} />
              <Stack.Screen name="stock/restock" options={{ title: 'Reabastecer', presentation: 'modal' }} />
              <Stack.Screen name="stock/adjust" options={{ title: 'Ajustar', presentation: 'modal' }} />
              <Stack.Screen name="stock/history" options={{ title: 'Histórico' }} />
              <Stack.Screen name="order/cart/cart" options={{ title: 'Carrinho' }}/>
              <Stack.Screen name="order/checkout/checkout" options={{ title: 'Checkout' }}/>
              <Stack.Screen name="order/purchasedOrders/purchasedOrders" options={{ title: 'Meus Pedidos' }}/>
            </Stack>
          </CartProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}