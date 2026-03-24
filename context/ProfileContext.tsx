import { apiGet } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { StringConstants } from '@/constants/StringConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

type ProfileContextType = {
  profile: any;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  setRole: (role: string) => void;
  resetProfile: () => void;
  isAccessBlocked: boolean;
};

const ProfileContext = createContext<ProfileContextType | null>(null);

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [isAccessBlocked, setIsAccessBlocked] = useState(false);

  useEffect(() => {
    getInitialData();
  }, []);

  useEffect(() => {
    if (role) {
      fetchProfile(role);
    }
  }, [role]);


  const getInitialData = async () => {
    try {
      if (role) return;

      const token = await AsyncStorage.getItem(StringConstants.ACCESS_TOKEN);
      const storedRole = await AsyncStorage.getItem(StringConstants.USER_ROLE);

      if (token && storedRole) {
        setRole(storedRole);
      }
    } catch (error) {
      console.log('Error getting initial data:', error);
    }
  };


  const fetchProfile = async (role: string) => {
    try {
      setLoading(true);
      const url = role === 'vendor' ? ApiConstants.VENDOR_PROFILE :
        role === 'family_member' ? ApiConstants.FAMILY_MEMBER_PROFILE :
          ApiConstants.GET_PROFILE;
      const response = await apiGet(url);
      // console.log("response in fetchProfile:", JSON.stringify(response.data));

      if (response?.status === 200 || response?.status === 201) {
        setProfile(response.data);
        setIsAccessBlocked(false);
      } else if (response?.status === 403) {
        setIsAccessBlocked(true);
      }
    } catch (error: any) {
      if (error?.response?.status === 403) {
        setIsAccessBlocked(true);
      } else {
        console.log('Error fetching profile:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetProfile = () => {
    setProfile(null);
    setRole(null);
  };

  const refreshProfile = async () => {
    if (role) {
      await fetchProfile(role);
    }
  };


  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        refreshProfile,
        setRole,
        resetProfile,
        isAccessBlocked,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

// custom hook 
export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used inside ProfileProvider');
  }
  return context;
};
