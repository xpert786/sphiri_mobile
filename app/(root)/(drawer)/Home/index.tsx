import CommonLoader from '@/components/CommonLoader';
import { ColorConstants } from '@/constants/ColorConstants';
import { StringConstants } from '@/constants/StringConstants';
import { useProfile } from '@/context/ProfileContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeOwnerView from './HomeOwnerView';
import TrusteeView from './TrusteeView';
import VendorView from './VendorView';

export type UserRole = 'home_owner' | 'family_member' | 'vendor';

export default function Home() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const { profile, loading } = useProfile();

  useEffect(() => {
    AsyncStorage.getItem(StringConstants.USER_ROLE).then(role => {
      if (role) setUserRole(role as UserRole);
    });
    // AsyncStorage.getItem(StringConstants.ACCESS_TOKEN).then(accessToken => {
    //   if (accessToken) console.log("Access Token in Home:", accessToken)
    // });
  }, []);

  if (loading || !userRole) {
    return (
      <CommonLoader visible={loading} />
    );
  }


  return (
    <SafeAreaView style={styles.rootContainer}>
      <StatusBar backgroundColor={ColorConstants.WHITE} barStyle="dark-content" />
      {userRole === 'home_owner' && <HomeOwnerView userData={profile} />}
      {userRole === 'family_member' && <TrusteeView userData={profile} />}
      {userRole === 'vendor' && <VendorView userData={profile} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: ColorConstants.WHITE
  },
  loaderWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})