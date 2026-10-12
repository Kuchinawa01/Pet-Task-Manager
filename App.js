import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';

import MainScreen from './src/screens/MainScreen';
import { colors } from './src/theme.js';

/**
 * Raiz do app. Só infraestrutura: fontes, gestos, safe area.
 * - GestureHandlerRootView é OBRIGATÓRIO para o swipe-to-delete funcionar no Android.
 * - Em produção, segure a splash screen (expo-splash-screen) até `fontsLoaded`
 *   para não haver "pulo" visual.
 * - Quando crescer para múltiplas telas, o navegador (expo-router) entra aqui
 *   e MainScreen vira app/index.js.
 */
export default function App() {
  const [fontsLoaded] = useFonts({ Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold });
  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <MainScreen />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
