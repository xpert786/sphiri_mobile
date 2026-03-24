import { useFonts } from 'expo-font';

export const useAppFonts = () => {
  return useFonts({
    // Inter
    'Inter-Regular': require('@/assets/fonts/Inter_18pt-Regular.ttf'),
    'Inter-Medium': require('@/assets/fonts/Inter_18pt-Medium.ttf'),
    'Inter-SemiBold': require('@/assets/fonts/Inter_18pt-SemiBold.ttf'),
    'Inter-Bold': require('@/assets/fonts/Inter_18pt-Bold.ttf'),
    'Inter-Light': require('@/assets/fonts/Inter_18pt-Light.ttf'),
    'Inter-BoldItalic': require('@/assets/fonts/Inter_18pt-BoldItalic.ttf'),
    'Inter-ExtraBold': require('@/assets/fonts/Inter_18pt-ExtraBold.ttf'),

    // SF Pro
    'SFPro-Bold': require('@/assets/fonts/SFPro-Bold.otf'),
    'SFPro-LightItalic': require('@/assets/fonts/SFPro-LightItalic.otf'),
    'SFPro-Medium': require('@/assets/fonts/SFPro-Medium.otf'),
    'SFPro-Regular': require('@/assets/fonts/SFPro-Regular.otf'),
    'SFPro-SemiBoldItalic': require('@/assets/fonts/SFPro-SemiBoldItalic.otf'),
    'SFPro-ThinItalic': require('@/assets/fonts/SFPro-ThinItalic.otf'),

    // Montserrat
    'Mon-Bold': require('@/assets/fonts/Montserrat-Bold.ttf'),
    'Mon-ExtraBold': require('@/assets/fonts/Montserrat-ExtraBold.ttf'),
    'Mon-Light': require('@/assets/fonts/Montserrat-Light.ttf'),
    'Mon-Medium': require('@/assets/fonts/Montserrat-Medium.ttf'),
    'Mon-Regular': require('@/assets/fonts/Montserrat-Regular.ttf'),
    'Mon-SemiBold': require('@/assets/fonts/Montserrat-SemiBold.ttf'),
    'Mon-Thin': require('@/assets/fonts/Montserrat-Thin.ttf'),

    // Mulish
    'Mulish-Bold': require('@/assets/fonts/Mulish-Bold.ttf'),
    'Mulish-ExtraBold': require('@/assets/fonts/Mulish-ExtraBold.ttf'),
    'Mulish-Light': require('@/assets/fonts/Mulish-Light.ttf'),
    'Mulish-Medium': require('@/assets/fonts/Mulish-Medium.ttf'),
    'Mulish-Regular': require('@/assets/fonts/Mulish-Regular.ttf'),
    'Mulish-SemiBold': require('@/assets/fonts/Mulish-SemiBold.ttf'),

    //Manrope
    'Manrope-Bold': require('@/assets/fonts/Manrope-Bold.ttf'),
    'Manrope-ExtraBold': require('@/assets/fonts/Manrope-ExtraBold.ttf'),
    'Manrope-Light': require('@/assets/fonts/Manrope-Light.ttf'),
    'Manrope-ExtraLight': require('@/assets/fonts/Manrope-ExtraLight.ttf'),
    'Manrope-Medium': require('@/assets/fonts/Manrope-Medium.ttf'),
    'Manrope-Regular': require('@/assets/fonts/Manrope-Regular.ttf'),
    'Manrope-SemiBold': require('@/assets/fonts/Manrope-SemiBold.ttf'),
  });
};
