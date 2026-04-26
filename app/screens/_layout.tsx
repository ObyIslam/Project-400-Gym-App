import { Stack } from 'expo-router';

export default function ScreensLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        title: '',
        headerBackTitleVisible: false,
        headerShadowVisible: false,
      }}
    />
  );
}
