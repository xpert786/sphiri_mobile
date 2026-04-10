import { ProfileProvider } from '@/context/ProfileContext';
import { useAppFonts } from '@/hooks/useAppFonts';
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { LogBox } from 'react-native';
import 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';


export default function RootLayout() {
  const [fontsLoaded] = useAppFonts();

  useEffect(() => {
    LogBox.ignoreLogs([
      'VirtualizedLists should never be nested',
    ]);
  }, []);

  if (!fontsLoaded) {
    return null;
  }



  return (
    <ProfileProvider>
      <Stack screenOptions={{ headerShown: false }} />
      <Toast topOffset={60} />
    </ProfileProvider>
  );
}


