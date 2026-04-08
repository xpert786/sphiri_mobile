import { StringConstants } from '@/constants/StringConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiConstants } from './endpoints';
import { axiosInstance } from './axiosInstance';

type ApiOptions = {
  isFormData?: boolean;
};

const getHeaders = () => {
  return { 'Content-Type': 'application/json' };
};

/**
 * For FormData requests, we use fetch() instead of Axios.
 * Axios 1.x in React Native has a known bug where it strips the
 * multipart/form-data boundary from the Content-Type header,
 * causing "Network Error" on every FormData POST/PUT/PATCH.
 * fetch() natively handles FormData and auto-sets the correct boundary.
 */
const fetchFormData = async (method: string, url: string, data: any) => {
  const token = await AsyncStorage.getItem(StringConstants.ACCESS_TOKEN);
  const fullUrl = url.startsWith('http') ? url : ApiConstants.BASE_URL + url;

  console.log(`[API ${method}] ${fullUrl}`);
  // console.log(`[API Token] ${token}`);

  try {
    const response = await fetch(fullUrl, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json', // Ensure we request JSON from the server
      },
      body: data,
    });

    const contentType = response.headers.get('content-type');
    let respData;

    if (contentType && contentType.includes('application/json')) {
      respData = await response.json();
    } else {
      // If not JSON, capture as text to debug HTML errors (like 404/500 pages)
      const textData = await response.text();
      console.log(`[API Error Response Body]: ${textData}`);
      respData = { message: 'Non-JSON response received', body: textData };
    }

    if (!response.ok) {
      console.log(`[API Error Status]: ${response.status}`);
      const error: any = new Error(`API Error ${response.status}`);
      error.response = { status: response.status, data: respData };
      throw error;
    }

    return { data: respData, status: response.status };
  } catch (err) {
    console.log(`[API Fetch Catch]:`, err);
    throw err;
  }
};

export const apiGet = async (url: string, params?: any) => {
  return axiosInstance.get(url, { params });
};

export const apiPost = async (
  url: string,
  data?: any,
  options?: ApiOptions
) => {
  if (options?.isFormData) return fetchFormData('POST', url, data);
  return axiosInstance.post(url, data, {
    headers: getHeaders(),
  });
};

export const apiPut = async (
  url: string,
  data?: any,
  options?: ApiOptions
) => {
  if (options?.isFormData) return fetchFormData('PUT', url, data);
  return axiosInstance.put(url, data, {
    headers: getHeaders(),
  });
};

export const apiPatch = async (
  url: string,
  data?: any,
  options?: ApiOptions
) => {
  if (options?.isFormData) return fetchFormData('PATCH', url, data);
  return axiosInstance.patch(url, data, {
    headers: getHeaders(),
  });
};

export const apiDelete = async (
  url: string,
  data?: any,
  options?: ApiOptions
) => {
  return axiosInstance.delete(url, {
    data,
    headers: getHeaders(),
  });
};
