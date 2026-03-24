import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { Icons } from '@/assets';
import { DRAWER_CONFIG, UserRole } from '@/config/drawerConfig';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { StringConstants } from '@/constants/StringConstants';
import { useProfile } from '@/context/ProfileContext';
import { usePathname } from 'expo-router';


const CustomDrawerContent = (props: any) => {
    const router = useRouter();
    const pathname = usePathname();
    const { resetProfile } = useProfile()

    const [userRole, setUserRole] = useState<UserRole>('home_owner');


    useEffect(() => {
        const getRole = async () => {
            const storedRole = await AsyncStorage.getItem(
                StringConstants.USER_ROLE
            );
            if (storedRole) {
                setUserRole(storedRole as UserRole);
            }
        };

        getRole();
    }, []);

    const drawerItems = DRAWER_CONFIG[userRole] || [];

    const normalizeRoute = (route: string) => {
        return route
            .replace(/\(.*?\)\//g, '') // remove (root)/(drawer)/(family)
            .replace(/\/+/g, '/');
    };


    const handleLogout = async () => {
        await AsyncStorage.multiRemove(
            [StringConstants.ACCESS_TOKEN,
            StringConstants.REFRESH_TOKEN,
            StringConstants.USER_ROLE
            ]);
        resetProfile();
        props.navigation.closeDrawer();
        setTimeout(() => {
            router.replace('/(root)/Welcome');
        }, 500);
    };


    return (
        <DrawerContentScrollView
            {...props}
            contentContainerStyle={styles.container}
        >
            {/* Header */}
            <View style={styles.header}>
                <Image source={Icons.ic_logo} style={styles.logo} />
                <TouchableOpacity
                    onPress={() => props.navigation.closeDrawer()}
                    style={styles.closeButton}
                >
                    <Image
                        source={Icons.ic_cross}
                        style={styles.closeIcon}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            {/* Drawer Items */}
            {drawerItems.map((item, index) => {
                const isActive = item.route && normalizeRoute(pathname) === normalizeRoute(item.route);

                return (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.drawerItem,
                            isActive && styles.activeItem,
                        ]}

                        onPress={() => {
                            props.navigation.closeDrawer();
                            router.push(item.route);
                            //  props.navigation.navigate(item.route);
                        }}
                    >
                        {item.isVectorIcon ? (
                            <MaterialCommunityIcons
                                name={item.icon}
                                size={15}
                                color={isActive ? ColorConstants.PRIMARY_BROWN : ColorConstants.DARK_CYAN}
                                style={styles.vectorIcon}
                            />
                        ) : (
                            <Image
                                source={item.icon}
                                style={[
                                    styles.icon,
                                    isActive && styles.activeIcon,
                                ]}
                            />
                        )}
                        <Text
                            style={[
                                styles.label,
                                isActive && styles.activeLabel,
                            ]}
                        >
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
            <View style={styles.logoutContainer}>
                <TouchableOpacity
                    style={styles.logoutRow}
                    onPress={handleLogout}
                >
                    <Image source={Icons.ic_logout}
                    />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </DrawerContentScrollView>
    );
};

export default CustomDrawerContent;


const styles = StyleSheet.create({
    container: {
        paddingTop: 60,
        flexGrow: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingBottom: 10,
    },
    logo: {
        height: 50,
        width: 120,
        marginLeft: -20,
    },
    closeButton: {
        padding: 8,
    },
    closeIcon: {
        width: 14,
        height: 14,
        resizeMode: 'contain',
    },
    drawerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    divider: {
        height: 1,
        backgroundColor: ColorConstants.GRAY_SHADE,
        marginBottom: 10,
    },
    icon: {
        width: 15,
        height: 15,
        resizeMode: 'contain',
        tintColor: ColorConstants.DARK_CYAN,
    },
    vectorIcon: {
        width: 15,
        height: 15,
    },
    label: {
        marginLeft: 8,
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        color: ColorConstants.DARK_CYAN,
    },
    activeItem: {
        backgroundColor: ColorConstants.LIGHT_PEACH,
    },
    activeIcon: {
        tintColor: ColorConstants.PRIMARY_BROWN,
    },
    activeLabel: {
        fontFamily: 'Inter-Medium',
        color: ColorConstants.PRIMARY_BROWN
    },
    logoutContainer: {
        marginTop: 'auto',
        paddingBottom: 20,
        marginHorizontal: 10
    },
    logoutText: {
        marginLeft: 8,
        fontSize: 14,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.WHITE,
    },
    logoutRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // 👈 right end icon
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: ColorConstants.DARK_CYAN,
        borderRadius: 8
    },
});

