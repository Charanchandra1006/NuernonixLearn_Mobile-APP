import { Stack } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';

export default function RootLayout() {
  const token = useAuthStore((state) => state.token);

  return (
    <Stack>
      {token == null ? (
        <Stack.Screen name="index" options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="dashboard" />
      )}
    </Stack>
  );
}
