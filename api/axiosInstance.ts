import { StringConstants } from '@/constants/StringConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import { ApiConstants } from './endpoints';
let isLoggingOut = false;

export const axiosInstance = axios.create({
  baseURL: ApiConstants.BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔐 Request Interceptor (Bearer Token)
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(StringConstants.ACCESS_TOKEN);
    console.log("token in axiosInstance:", token);


    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // For FormData, explicitly set multipart/form-data and let React Native handle the boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ❌ Response Interceptor (401 → Logout)
axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const status = error?.response?.status;

    if (status === 401 && !isLoggingOut) {
      isLoggingOut = true;

      console.log('401 detected → logging out');

      await AsyncStorage.multiRemove([
        StringConstants.ACCESS_TOKEN,
        StringConstants.REFRESH_TOKEN,
        StringConstants.USER_ROLE,
      ]);

      router.replace('/(root)/Welcome');

      // optional: reset after navigation
      setTimeout(() => {
        isLoggingOut = false;
      }, 1000);
    }

    return Promise.reject(error);
  },
);

// ❌ Response Interceptor (optional)
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     //global error handled here
//     return Promise.reject(error);
//   }
// );
