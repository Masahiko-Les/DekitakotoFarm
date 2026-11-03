import { DotGothic16_400Regular } from '@expo-google-fonts/dotgothic16';
import { KleeOne_400Regular } from '@expo-google-fonts/klee-one';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

import { C } from '@/lib/constants';
import { initStore } from '@/lib/store';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({ DotGothic16_400Regular, KleeOne_400Regular });
  // 端末内の DB を開いて読み込む（同期）
  const [ready] = useState(() => {
    initStore();
    return true;
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!ready || (!loaded && !error)) return null;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg } }} />;
}
