// import { Icons } from '@/assets';
// import { StringConstants } from '@/constants/StringConstants';
// import { useRouter } from 'expo-router';
// import { ImageBackground, StyleSheet, Text } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';

// export default function Splash() {
//   const router = useRouter();

//   // useEffect(() => {
//   //   const checkAuthAndNavigate = async () => {
//   //     const token = await AsyncStorage.getItem(StringConstants.ACCESS_TOKEN);

//   //     setTimeout(() => {
//   //       if (token) {
//   //         // @ts-ignore
//   //         router.replace('/(drawer)/Home');
//   //       } else {
//   //         router.replace('/(root)/Welcome');
//   //       }
//   //     }, 2000); // splash duration
//   //   };

//   //   checkAuthAndNavigate();
//   // }, []);


//   return (
//     <ImageBackground source={Icons.ic_splash_new} style={styles.background}>
//       <SafeAreaView edges={['bottom']} style={styles.safeArea}>
//         <Text style={styles.welcomeText}>{StringConstants.WELCOME_TO_SPHIRI}</Text>
//         <Text style={styles.introText}>{StringConstants.SPHIRI_INTRO}</Text>
//       </SafeAreaView>
//     </ImageBackground>
//   );
// }

// const styles = StyleSheet.create({
//   background: {
//     flex: 1,
//     resizeMode: 'cover',
//     justifyContent: 'flex-end',
//     paddingBottom: 20,
//     paddingHorizontal: 20,

//   },
//   safeArea: {
//     alignItems: 'flex-start',
//   },
//   container: {
//     flex: 1,
//   },
//   welcomeText: {
//     fontSize: 22,
//     fontFamily: 'SFPro-Bold',
//     color: '#FFFFFF',
//     marginBottom: 6
//   },
//   introText: {
//     fontSize: 14,
//     fontFamily: 'Inter-Regular',
//     color: '#FFFFFF'
//   }
// });


import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icons } from '@/assets';
import { StringConstants } from '@/constants/StringConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    <View style={styles.container}>

      {/* 🔥 Background (full fill) */}
      <ImageBackground
        source={Icons.ic_splash_new}
        style={styles.background}
        blurRadius={15}
      />

      {/* 🔥 Main Image (NO CROP) */}
      <Image
        source={Icons.ic_splash_new}
        style={styles.image}
        resizeMode="contain"
      />

      {/* 🔥 Text Content */}
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.welcomeText}>
          {StringConstants.WELCOME_TO_SPHIRI}
        </Text>
        <Text style={styles.introText}>
          {StringConstants.SPHIRI_INTRO}
        </Text>
      </SafeAreaView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // fallback color
  },

  background: {
    ...StyleSheet.absoluteFillObject,
  },

  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },

  safeArea: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 60,
  },

  welcomeText: {
    fontSize: 22,
    fontFamily: 'SFPro-Bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },

  introText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
  },
});