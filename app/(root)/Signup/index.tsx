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
import React, { useState } from 'react';
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

type FormData = {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
};

export default function Signup() {
  const { setRole, resetProfile } = useProfile()
  const { role } = useLocalSearchParams<{ role?: string }>();

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');

  const handleChange = (key: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  // 🔍 VALIDATION
  const validate = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;



    const nameParts = formData.fullName.trim().split(' ');
    if (nameParts.length < 2) {
      newErrors.fullName = 'Please enter full name (first & last name)';
    }

    if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phoneNumber.length !== 10) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }

    if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        'Password must be at least 8 characters, include uppercase, lowercase & special character';
    }

    if (formData.confirmPassword.length == 0) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🚀 SIGNUP API
  const restApiToSignup = async () => {
    if (!validate()) return;

    const nameParts = formData.fullName.trim().split(' ');
    const first_name = nameParts[0];
    const last_name = nameParts.slice(1).join(' ');

    const payload = {
      email: formData.email.toLowerCase(),
      password: formData.password,
      confirm_password: formData.confirmPassword,
      first_name,
      last_name,
      full_name: formData.fullName,
      phone_number: formData.phoneNumber,
      role: role,
    };
    console.log("payload in restApiToSignup:", payload);


    try {
      setLoading(true);

      const response = await apiPost(
        ApiConstants.SIGNUP,
        payload,
      );

      console.log('response in restApiToSignup:', response.data);
      if (response?.status === 200 || response?.status === 201) {
        const accessToken = response?.data?.tokens?.access
        const refreshToken = response?.data?.tokens?.refresh
        console.log("accesstoken in restApiToSignup:", accessToken)

        resetProfile();
        await saveAuthTokens(accessToken, refreshToken);

        if (role) {
          setRole(role); // context update
        }

        if (role == 'vendor') {
          router.push({
            pathname: '/SignupVendor',
            params: { role },
          })
        } else {
          // @ts-ignorexs
          router.replace('/(drawer)/Home');
        }

      } else {
        setAlertTitle('Something went wrong. Please try again.');
        setShowModal(true);
      }

    } catch (error: any) {
      console.log('error in restApiToSignup:', error?.response?.data);
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.email[0] ||
        error?.response?.data?.password[0] ||
        'Signup failed. Please try again later.';

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

          <TouchableOpacity onPress={() => router.back()} style={styles.topLeftArrow}>
            <Image source={Icons.ic_left_arrow} />
          </TouchableOpacity>

          <Image source={Icons.ic_logo} style={styles.logo} resizeMode="contain" />

          <Text style={styles.welcomeTitle}>{StringConstants.SIGN_UP}</Text>
          <Text style={styles.subtitle}>
            {StringConstants.YOUR_DIGITAL_COMMAND_CENTER}
          </Text>

          <View style={styles.divider}>
            <CustomTextInput
              label={StringConstants.FULL_NAME}
              value={formData.fullName}
              onChangeText={(t) => handleChange('fullName', t)}
              placeholder={StringConstants.ENTER_FULL_NAME}
              autoCapitalize="words"
              error={errors.fullName}
            />

            <CustomTextInput
              label={StringConstants.EMAIL_ADDRESS}
              value={formData.email}
              onChangeText={(t) => handleChange('email', t)}
              keyboardType="email-address"
              placeholder="Enter your email"
              autoCapitalize="none"
              error={errors.email}
            />

            <CustomTextInput
              label={StringConstants.PHONE_NUMBER}
              value={formData.phoneNumber}
              onChangeText={(t) => handleChange('phoneNumber', t)}
              keyboardType="numeric"
              maxLength={10}
              placeholder={StringConstants.ENTER_PHONE_NUMBER}
              error={errors.phoneNumber}
            />

            <CustomTextInput
              label={StringConstants.PASSWORD}
              value={formData.password}
              onChangeText={(t) => handleChange('password', t)}
              secureTextEntry
              showPasswordToggle
              placeholder={StringConstants.ENTER_PASSWORD}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              error={errors.password}
            />

            <CustomTextInput
              label={StringConstants.CONFIRM_PASSWORD}
              value={formData.confirmPassword}
              onChangeText={(t) => handleChange('confirmPassword', t)}
              secureTextEntry
              showPasswordToggle
              placeholder={StringConstants.ENTER_CONFIRM_PASSWORD}
              showPassword={showConfirmPassword}
              onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
              error={errors.confirmPassword}
            />

            <CommonButton
              title={StringConstants.SIGN_UP}
              onPress={restApiToSignup}
              disabled={loading}
              loading={loading}
            />

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>
                {StringConstants.ALREADY_HAVE_AN_ACCOUNT}{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/LoginScreen')}>
                <Text style={styles.signupLink}>{StringConstants.LOGIN}</Text>
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

