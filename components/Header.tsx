import { apiGet } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import { UserRole } from '@/config/drawerConfig';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { StringConstants } from '@/constants/StringConstants';
import { useProfile } from '@/context/ProfileContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerActions } from '@react-navigation/native';
import { router, useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    DeviceEventEmitter,
    Image,
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';


type CommonHeaderProps = {
    /** Main welcome text */
    title?: string;

    /** Subtitle text below title */
    subtitle?: string;

    /** Show menu icon or not */
    showMenu?: boolean;

    /** Profile image source (optional) */
    profileImage?: any;

    /** Optional container style override */
    containerStyle?: StyleProp<ViewStyle>;

    showBackArrow?: boolean;
    tapOnBack?: () => void;
    titleStyles?: StyleProp<TextStyle>;
    renderRight?: () => React.ReactNode;
};

const Header: React.FC<CommonHeaderProps> = ({
    title,
    subtitle,
    showMenu = true,
    containerStyle,
    showBackArrow = true,
    tapOnBack,
    titleStyles,
    renderRight
}) => {
    const navigation = useNavigation();
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const { profile, isAccessBlocked } = useProfile();
    const [hasProposals, setHasProposals] = useState(false);
    const [messageCount, setMessageCount] = useState(0);
    const [notifyCount, setNotifyCount] = useState(0);

    useEffect(() => {
        let isRoleHomeOwner = false;

        AsyncStorage.getItem(StringConstants.USER_ROLE).then(role => {
            if (role) {
                setUserRole(role as UserRole);
                if (role === 'home_owner') {
                    isRoleHomeOwner = true;
                    fetchProposals();
                    fetchUnreadNotifications()
                }
                if (role === 'vendor') {
                    fetchVendorNotifications();
                }
            }
        });

        const refreshListener = DeviceEventEmitter.addListener('refreshProposals', () => {
            // Instantly clear the badge for a snappy UI
            console.log("Refresh proposals", messageCount);
            setHasProposals(false);
            setMessageCount(0);
        });

        return () => {
            refreshListener.remove();
        };

    }, [userRole]);

    const fetchProposals = async () => {
        try {
            const response = await apiGet(ApiConstants.VENDOR_PROPOSALS);
            if (response.data) {
                const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
                const unreadProposals = data.filter((item: any) => item.is_read === false);
                setHasProposals(unreadProposals.length > 0);
                setMessageCount(unreadProposals.length);
                // console.log("Unread proposals length:", unreadProposals.length);
            }
        } catch (error) {
            console.error('Error fetching proposals in Header:', error);
        }
    };


    const fetchVendorNotifications = async () => {
        try {
            const notifResponse = await apiGet(ApiConstants.VENDOR_NOTIFICATIONS_API);
            let count = notifResponse.data.unread_count
            setNotifyCount(count);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const fetchUnreadNotifications = async () => {
        try {
            const notifResponse = await apiGet(ApiConstants.UNREAD_COUNT);
            // console.log("notifResponse in fetchUnreadNotifications", notifResponse.data);

            let count = notifResponse.data.unread_count
            setNotifyCount(count);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };



    const profileImageSource = profile?.profile_picture ? { uri: ApiConstants.MEDIA_URL + profile.profile_picture } :
        profile?.profile_photo ? { uri: ApiConstants.MEDIA_URL + profile.profile_photo } :
            profile?.profile_picture_url ? { uri: ApiConstants.MEDIA_URL + profile.profile_picture_url } :
                null


    const getInitials = (name?: string) => {
        let initial;
        if (userRole === 'vendor') {
            initial = 'V';
        } else if (userRole === 'family_member') {
            initial = 'F';
        } else if (userRole === 'home_owner') {
            initial = 'H';
        }

        if (!name) return initial;
        const initials = name
            .split(' ')
            .map((n) => n[0] || '')
            .join('')
            .toUpperCase();
        return initials || initial;
    };

    return (
        <>
            {showBackArrow && <TouchableOpacity onPress={tapOnBack} style={styles.topLeftArrow}>
                <Image source={Icons.ic_left_arrow} />
            </TouchableOpacity>}

            <View style={[styles.header, containerStyle]}>
                {/* LEFT SIDE */}
                <View style={styles.welcomeContainer}>
                    <Text style={[styles.welcomeText, titleStyles]}>{title}</Text>
                    {!!subtitle && (
                        <Text style={styles.subtitle}>{subtitle}</Text>
                    )}
                </View>

                {/* RIGHT SIDE */}
                <View style={[styles.headerActions]}>
                    {renderRight && renderRight()}

                    {showMenu && (
                        <TouchableOpacity
                            onPress={() => { navigation.dispatch(DrawerActions.toggleDrawer()) }}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            style={{ padding: 4 }}
                        >
                            <Image source={Icons.ic_menu} />
                        </TouchableOpacity>
                    )}
                    <View style={{ position: 'relative' }}>
                        <Pressable
                            onPress={() => { router.push('/(root)/(drawer)/notifications'); }}
                        >
                            <Image source={Icons.ic_notification2} style={styles.notificationIcon} />
                        </Pressable>
                        {notifyCount > 0 && <View style={styles.unreadCount}>
                            <Text style={styles.countText}>{notifyCount}</Text>
                        </View>}
                    </View>

                    {userRole === 'home_owner' && (
                        <View style={{ position: 'relative' }}>
                            <TouchableOpacity style={styles.messageIconWrapper}
                                onPress={() => { router.push('/(root)/(drawer)/proposals'); }}
                            >
                                <Image source={Icons.ic_mail} style={styles.messageIcon} />
                            </TouchableOpacity>
                            {messageCount > 0 && (
                                <View style={styles.unreadCount}>
                                    <Text style={styles.countText}>{messageCount}</Text>
                                </View>
                            )}
                        </View>
                    )}

                    <TouchableOpacity
                        disabled={userRole === 'vendor' || isAccessBlocked}
                        onPress={() => {
                            if (userRole !== 'vendor' && !isAccessBlocked) {
                                router.push('/(root)/(drawer)/(profile)/profile');
                            }
                        }}
                    >
                        {profileImageSource ? (
                            <Image
                                source={profileImageSource}
                                style={styles.profileImage}
                            />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.initials}>{getInitials(profile?.full_name || profile?.user_name)}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    topLeftArrow: {
        alignSelf: 'flex-start',
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    welcomeContainer: {
        flex: 1,
        paddingRight: 12,
    },
    welcomeText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 18,
        color: ColorConstants.PRIMARY_BROWN,
        marginBottom: 4,
    },
    subtitle: {
        fontFamily: 'Inter-Regular',
        fontSize: 12,
        color: ColorConstants.GRAY,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
    },
    profileImage: {
        width: 25,
        height: 25,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: ColorConstants.DARK_CYAN
    },
    notificationIcon: {
        height: 27,
        width: 27,
        resizeMode: 'contain'
    },
    unreadCount: {
        backgroundColor: ColorConstants.BLACK2,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: -5,
        right: -2,
        borderRadius: 15,
        height: 14,
        width: 14
    },
    countText: {
        fontSize: 8,
        color: ColorConstants.WHITE,
    },
    avatarPlaceholder: {
        width: 25,
        height: 25,
        borderRadius: 20,
        backgroundColor: ColorConstants.LIGHT_PEACH2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    initials: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 11,
        color: ColorConstants.PRIMARY_BROWN,
    },
    messageIconWrapper: {
        width: 26,
        height: 26,
        borderRadius: 20,
        backgroundColor: ColorConstants.REDDISH_BROWN,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageIcon: {
        height: 12,
        width: 12,
        resizeMode: 'contain',
        tintColor: ColorConstants.WHITE,
    },
});

export default Header;
