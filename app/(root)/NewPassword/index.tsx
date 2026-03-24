import { apiPost } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import CommonButton from '@/components/CommonButton';
import CustomTextInput from '@/components/CustomTextInput'; // Adjust path as needed
import { ColorConstants } from '@/constants/ColorConstants';
import { StringConstants } from '@/constants/StringConstants';
import ValidationModal from '@/modals/ValidationModal';
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
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
type FormData = {
  password: string;
  confirmPassword: string;
};


export default function NewPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');

  const { reset_token } = useLocalSearchParams<{
    reset_token?: string;
  }>();
  console.log('reset_token in NewPassword:', reset_token);



  // 🔍 VALIDATION
  const validate = () => {
    const newErrors: Record<string, string> = {};
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;

    if (formData.password.trim() === '') {
      newErrors.password = 'Enter your new password';
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        'Password must be at least 8 characters, include uppercase, lowercase & special character';
    }

    if (formData.confirmPassword.trim() === '') {
      newErrors.confirmPassword = 'Confirm your password';
    }
    else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🚀 LOGIN API
  const restApiToResetPassword = async () => {
    if (!validate()) return;

    const payload = {
      reset_token: reset_token,
      new_password: formData.password,
      confirm_password: formData.confirmPassword
    };
    console.log("payload in restApiToResetPassword:", payload);

    try {
      setLoading(true);

      const response = await apiPost(
        ApiConstants.RESET_PASSWORD,
        payload,
      );


      if (response?.status === 200 || response?.status === 201) {
        console.log('response in restApiToResetPassword:', response.data);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: response.data.message,
        });
        setFormData({ password: '', confirmPassword: '' });
        router.replace('/LoginScreen');
      } else {
        setAlertTitle('Reset password failed. Please try again.');
        setShowModal(true);
      }

    } catch (error: any) {
      console.log("error in restApiToResetPassword:", error?.response?.data);
      const message = error?.response?.data?.password?.[0] ||
        'Reset password failed. Please try again later.';

      setAlertTitle(message);
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };


  const handleChange = (key: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };


  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
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

          {/* Logo/Header */}
          <Image source={Icons.ic_logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.welcomeTitle}>{StringConstants.CREATE_NEW_PASSWORD}</Text>
          <Text style={styles.subtitle}>{StringConstants.YOUR_DIGITAL_COMMAND_CENTER}</Text>

          {/* Outer border Line */}
          <View style={styles.divider}>
            <CustomTextInput
              label={StringConstants.NEW_PASSWORD}
              value={formData.password}
              onChangeText={(t) => handleChange('password', t)}
              placeholder={StringConstants.ENTER_NEW_PASSWORD}
              secureTextEntry
              showPasswordToggle
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              autoCapitalize="none"
              error={errors.password}
            />

            <CustomTextInput
              label={StringConstants.CONFIRM_NEW_PASSWORD}
              value={formData.confirmPassword}
              onChangeText={(t) => handleChange('confirmPassword', t)}
              placeholder={StringConstants.ENTER_CONFIRM_NEW_PASSWORD}
              secureTextEntry
              showPasswordToggle
              showPassword={showConfirmPassword}
              onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
              autoCapitalize="none"
              error={errors.confirmPassword}
            />

            <CommonButton
              title={StringConstants.CONTINUE}
              onPress={() => { restApiToResetPassword(); }}
              loading={loading}
              disabled={loading}
            />

            {/* Signup Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>{StringConstants.DONT_HAVE_AN_ACCOUNT} </Text>
              <TouchableOpacity onPress={() => router.push('/Signup')}>
                <Text style={styles.signupLink}>{StringConstants.SIGN_UP}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorConstants.WHITE,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 10,
  },
  topLeftArrow: {
    alignSelf: 'flex-start',
    paddingVertical: 20,
    paddingRight: 20
  },
  logo: {
    width: 200,
    height: 120,
    marginBottom: 20,
    alignSelf: 'center',
  },
  welcomeTitle: {
    fontFamily: 'SFPro-Bold',
    fontSize: 18,
    color: ColorConstants.PRIMARY_BROWN,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: ColorConstants.GRAY,
    marginBottom: 20,
  },
  divider: {
    backgroundColor: ColorConstants.WHITE,
    padding: 20,
    borderColor: ColorConstants.GRAY3,
    borderWidth: 1,
    borderRadius: 10,
  },

  loginButton: {
    backgroundColor: ColorConstants.PRIMARY_BROWN,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 18,
    height: 36,
  },
  loginButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: ColorConstants.WHITE,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: ColorConstants.GRAY_50,
  },
  signupLink: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: ColorConstants.PRIMARY_BROWN,
  },
});
