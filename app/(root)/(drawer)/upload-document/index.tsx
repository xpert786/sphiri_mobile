import { ColorConstants } from '@/constants/ColorConstants';
import { StringConstants } from '@/constants/StringConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeOwnerDoc from './HomeOnwerDoc';
import TrusteeDoc from './TrusteeDoc';

export type UserRole = 'home_owner' | 'family_member' | 'vendor';

export default function UploadDocument() {
    const [userRole, setUserRole] = useState<UserRole | null>(null);

    useEffect(() => {
        AsyncStorage.getItem(StringConstants.USER_ROLE).then(role => {
            if (role) setUserRole(role as UserRole);
        });
    }, []);

    if (!userRole) return null;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: ColorConstants.WHITE }}>
            <StatusBar backgroundColor={ColorConstants.WHITE} barStyle="dark-content" />
            {userRole === 'home_owner' ? <HomeOwnerDoc /> : userRole === 'family_member' ? <TrusteeDoc /> : null}
        </SafeAreaView>
    );
}



