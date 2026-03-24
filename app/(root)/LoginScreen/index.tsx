import { apiPost } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import CommonButton from '@/components/CommonButton';
import CustomTextInput from '@/components/CustomTextInput';
import { ColorConstants } from '@/constants/ColorConstants';
import { StringConstants } from '@/constants/StringConstants';
import { useProfile } from '@/context/ProfileContext';
import ValidationModal from '@/modals/ValidationModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const { setRole, resetProfile } = useProfile()
  const { role } = useLocalSearchParams<{ role?: string }>();
  console.log("role in LoginScreen", role);


  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');


  useEffect(() => {
    const saveRole = async () => {
      if (role) {
        await AsyncStorage.setItem(StringConstants.USER_ROLE, role);
      }
    };
    saveRole();
  }, [role]);


  useEffect(() => {
    const loadRememberedCredentials = async () => {
      const savedEmail = await AsyncStorage.getItem(
        StringConstants.REMEMBER_EMAIL
      );
      const savedPassword = await AsyncStorage.getItem(
        StringConstants.REMEMBER_PASSWORD
      );

      if (savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    };

    loadRememberedCredentials();
  }, []);


  // 🔍 VALIDATION
  const validate = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password.trim()) {
      newErrors.password = 'Please enter your password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🚀 LOGIN API
  const restApiToLogin = async () => {
    if (!validate()) return;

    let finalRole: string | null | undefined = role;

    // 👇 if role is not in params , then take from async
    if (!finalRole) {
      finalRole = await AsyncStorage.getItem(
        StringConstants.USER_ROLE
      );
      console.log("finalRole:", finalRole);

    }

    const payload = {
      email: email.toLowerCase().trim(),
      password: password,
      expected_role: finalRole || '',
    };
    console.log("payload in restApiToLogin:", payload);

    try {
      setLoading(true);

      const response = await apiPost(
        ApiConstants.LOGIN,
        payload,
      );


      if (response?.status === 200 || response?.status === 201) {
        console.log('response in restApiToLogin:', response.data);
        const accessToken = response?.data?.access;
        const refreshToken = response?.data?.refresh;
        console.log("accessToken in restApiToLogin:", accessToken);

        resetProfile();
        await saveAuthTokens(accessToken, refreshToken);
        if (finalRole) {
          setRole(finalRole); // context update
        }

        // ✅ REMEMBER ME LOGIC
        if (rememberMe) {
          await AsyncStorage.multiSet([
            [StringConstants.REMEMBER_EMAIL, email],
            [StringConstants.REMEMBER_PASSWORD, password]
          ]);
        } else {
          await AsyncStorage.multiRemove([
            StringConstants.REMEMBER_EMAIL,
            StringConstants.REMEMBER_PASSWORD
          ]);
        }

        // @ts-ignorexs
        router.replace('/(drawer)/Home');
        return;
      } else {
        setAlertTitle('Login failed. Please try again.');
        setShowModal(true);
      }

    } catch (error: any) {
      console.log("error in restApiToLogin:", error.response?.data);
      const message = error?.response?.data?.email?.[0] ||
        error?.response?.data?.password?.[0] ||
        error?.response?.data?.expected_role?.[0] ||
        'Login failed. Please try again later.';

      setAlertTitle(message);
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };


  const saveAuthTokens = async (
    accessToken: string,
    refreshToken: string
  ) => {
    try {
      await AsyncStorage.multiSet([
        [StringConstants.ACCESS_TOKEN, accessToken],
        [StringConstants.REFRESH_TOKEN, refreshToken],
      ]);
    } catch (error) {
      console.log('Error saving tokens:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ValidationModal
            visible={showModal}
            onClose={() => setShowModal(false)}
            alertTitle={alertTitle}
          />

          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.topLeftArrow}
          >
            <Image source={Icons.ic_left_arrow} />
          </TouchableOpacity>

          <Image
            source={Icons.ic_logo}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.welcomeTitle}>
            {StringConstants.WELCOME_TO_SPHIRI}
          </Text>
          <Text style={styles.subtitle}>
            {StringConstants.YOUR_DIGITAL_COMMAND_CENTER}
          </Text>

          <View style={styles.divider}>
            <CustomTextInput
              label={StringConstants.EMAIL_ADDRESS}
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setErrors(prev => ({ ...prev, email: '' }));
              }}
              placeholder={StringConstants.ENTER_EMAIL_ADDRESS}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <CustomTextInput
              label={StringConstants.PASSWORD}
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setErrors(prev => ({ ...prev, password: '' }));
              }}
              placeholder={StringConstants.ENTER_PASSWORD}
              secureTextEntry
              showPasswordToggle
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              error={errors.password}
            />

            <View style={styles.passwordOptions}>
              <TouchableOpacity
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={styles.checkbox}>
                  {rememberMe && (
                    <Image source={Icons.ic_checkbox_tick} />
                  )}
                </View>
                <Text style={styles.rememberMeText}>
                  {StringConstants.REMEMBER_ME}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/ForgotPassword')}
              >
                <Text style={styles.forgotPasswordText}>
                  {StringConstants.FORGOT_PASSWORD}
                </Text>
              </TouchableOpacity>
            </View>

            <CommonButton
              title={StringConstants.LOGIN}
              onPress={restApiToLogin}
              loading={loading}
              disabled={loading}
            />

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>
                {StringConstants.DONT_HAVE_AN_ACCOUNT}{' '}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  router.push({
                    pathname: '/Signup',
                    params: { role },
                  })

                }}
              >
                <Text style={styles.signupLink}>
                  {StringConstants.SIGN_UP}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorConstants.WHITE,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  topLeftArrow: {
    paddingVertical: 20,
  },
  logo: {
    width: 200,
    height: 120,
    alignSelf: 'center',
    marginBottom: 20,
  },
  welcomeTitle: {
    fontFamily: 'SFPro-Bold',
    fontSize: 18,
    color: ColorConstants.PRIMARY_BROWN,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: ColorConstants.GRAY,
    marginBottom: 20,
  },
  divider: {
    borderWidth: 1,
    borderColor: ColorConstants.GRAY3,
    borderRadius: 10,
    padding: 20,
  },
  passwordOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: ColorConstants.GRAY,
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rememberMeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: ColorConstants.GRAY_50,
  },
  forgotPasswordText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: ColorConstants.PRIMARY_BROWN,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  signupText: {
    fontFamily: 'Inter-Regular',
    color: ColorConstants.GRAY_50,
  },
  signupLink: {
    fontFamily: 'Inter-Medium',
    color: ColorConstants.PRIMARY_BROWN,
  },
});
