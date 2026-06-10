import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/contexts/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/theme';

export default function App() {
  useEffect(() => {
    async function configureAndroidNavigationBar() {
      if (Platform.OS !== 'android') {
        return;
      }

      try {
        await NavigationBar.setBackgroundColorAsync(colors.background);
        await NavigationBar.setButtonStyleAsync('light');
      } catch {
        // No Expo Go algumas configurações visuais do sistema podem ser ignoradas.
      }
    }

    configureAndroidNavigationBar();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
        <StatusBar style="light" backgroundColor={colors.background} />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
