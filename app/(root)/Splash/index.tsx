import { Icons } from '@/assets';
import { StringConstants } from '@/constants/StringConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ImageBackground, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      const token = await AsyncStorage.getItem(StringConstants.ACCESS_TOKEN);

      setTimeout(() => {
        if (token) {
           // @ts-ignore
          router.replace('/(drawer)/Home');
        } else {
          router.replace('/(root)/Welcome');
        }
      }, 2000); // splash duration
    };

    checkAuthAndNavigate();
  }, []);


  return (
    <ImageBackground source={Icons.ic_splash} style={styles.background}>
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        <Text style={styles.welcomeText}>{StringConstants.WELCOME_TO_SPHIRI}</Text>
        <Text style={styles.introText}>{StringConstants.SPHIRI_INTRO}</Text>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'flex-end',
    paddingBottom: 20,
    paddingHorizontal: 20
  },
  safeArea: {
    alignItems: 'flex-start',
  },
  container: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 22,
    fontFamily: 'SFPro-Bold',
    color: '#FFFFFF',
    marginBottom: 6
  },
  introText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF'
  }
});
