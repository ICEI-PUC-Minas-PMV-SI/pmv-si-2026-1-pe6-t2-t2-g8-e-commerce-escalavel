// Thin wrapper — the full profile is implemented in app/profile.tsx (Expo Router screen).
// This screen is used by the BottomNavigation SceneMap in app/index.tsx.
import { Redirect } from 'expo-router';

export function ProfileScreen() {
  return <Redirect href="/profile" />;
}
