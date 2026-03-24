import { apiPost } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import CommonButton from '@/components/CommonButton';
import CustomTextInput from '@/components/CustomTextInput'; // Adjust path as needed
import { ColorConstants } from '@/constants/ColorConstants';
import { StringConstants } from '@/constants/StringConstants';
import ValidationModal from '@/modals/ValidationModal';
import { router } from 'expo-router';
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

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');



  // 🔍 VALIDATION
  const validate = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (email.trim() === '') {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const restApiToForgotPassword = async () => {
    if (!validate()) return;

    const payload = {
      email: email.toLowerCase().trim(),
    };
    console.log("payload in restApiToForgotPassword:", payload);

    try {
      setLoading(true);

      const response = await apiPost(
        ApiConstants.FORGOT_PASSWORD,
        payload,
      );


      if (response?.status === 200 || response?.status === 201) {
        console.log('response in restApiToForgotPassword:', response.data);
        const reset_token = response?.data?.reset_token;
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: response.data.message,
        });
        setEmail('')
        router.push({
          pathname: '/NewPassword',
          params: { reset_token },
        });


      } else {
        setAlertTitle('Something went wrong, Please try again later.');
        setShowModal(true);
      }

    } catch (error: any) {
      console.log("error in restApiToForgotPassword:", error.response?.data);
      const message = error?.response?.data?.email?.[0] ||
        'Something went wrong, Please try again later';

      setAlertTitle(message);
      setShowModal(true);
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.welcomeTitle}>{StringConstants.FORGOT_YOUR_PASSWORD}</Text>
          <Text style={styles.subtitle}>{StringConstants.FORGOT_YOUR_PASSWORD_DESC}</Text>

          {/* Outer border Line */}
          <View style={styles.divider}>
            <CustomTextInput
              label={StringConstants.EMAIL_ADDRESS}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors(prev => ({ ...prev, email: '' }));
              }}
              placeholder={StringConstants.ENTER_EMAIL_ADDRESS}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />
            <CommonButton
              title={StringConstants.VERIFY_EMAIL}
              onPress={() => { restApiToForgotPassword() }}
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
    marginBottom: 17,
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

export default ForgotPassword;