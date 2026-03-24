import { apiGet, apiPut } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import CustomTextInput from '@/components/CustomTextInput';
import Header from '@/components/Header';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { useProfile } from '@/context/ProfileContext';
import ChangePasswordModal from '@/modals/ChangePasswordModal';
import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface VendorProfile {
    id: number;
    user_name: string;
    user_role: string;
    profile_photo: string;
    business_name: string;
    email: string;
    phone_number: string;
    business_address: string;
    business_description: string;
    business_type: string;
    created_at: string;
    updated_at: string;
}

const { width: screenWidth } = Dimensions.get('window');

export default function VendorSettings() {
    const { from } = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState<'Profile' | 'Security' | 'Notifications'>('Profile');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [profileData, setProfileData] = useState<VendorProfile | null>(null);
    const [localImagePath, setLocalImagePath] = useState<string | null>(null);

    // Form State
    const [companyName, setCompanyName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [description, setDescription] = useState("");
    // Notifications state
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [smsAlerts, setSmsAlerts] = useState(false);
    const [pushNotifications, setPushNotifications] = useState(false);
    const [weeklySummary, setWeeklySummary] = useState(false);

    const { refreshProfile } = useProfile();


    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                if (from === 'grow-business') {
                    router.navigate('/(root)/(drawer)/grow-business');
                } else {
                    router.navigate('/(root)/(drawer)/Home');
                }
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => subscription.remove();
        }, [from])
    );

    useEffect(() => {
        fetchVendorProfile();
    }, []);
    const handleProfileUpdate = async () => {
        if (!profileData) return;

        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('business_name', companyName);
            formData.append('email', email);
            formData.append('phone_number', phone);
            formData.append('business_address', address);
            formData.append('business_description', description || "");
            formData.append('business_type', profileData.business_type);

            console.log("formData in handleProfileUpdate:", formData);

            const response = await apiPut(ApiConstants.VENDOR_PROFILE, formData, { isFormData: true });
            console.log("response in handleProfileUpdate:", response.data);

            if (response.status === 200 || response.status === 201) {
                Alert.alert("Success", "Profile updated successfully");
                refreshProfile();
                setIsEditing(false);
            } else {
                Alert.alert("Error", "Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating vendor profile:", error);
            Alert.alert("Error", "An error occurred while updating the profile");
        } finally {
            setIsSaving(false);
        }
    };

    const fetchVendorProfile = async () => {
        setLoading(true);
        try {
            const response = await apiGet(ApiConstants.VENDOR_PROFILE);
            console.log("response in. fetchVendorProfile:", response.data);

            if (response.data) {
                const data: VendorProfile = response.data;
                setProfileData(data);
                setCompanyName(data.business_name);
                setEmail(data.email);
                setPhone(data.phone_number);
                setAddress(data.business_address);
                setDescription(data.business_description);
                setLocalImagePath(null); // Reset local image on fetch
                setIsEditing(false); // Reset edit mode on refresh
            }
        } catch (error) {
            console.error("Error fetching vendor profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });
        console.log("result in pickImage:", result);


        if (!result.canceled) {
            setLocalImagePath(result.assets[0].uri);
            uploadProfileImage(result.assets[0]);
        }
    };

    const uploadProfileImage = async (imageAsset: ImagePicker.ImagePickerAsset) => {
        setIsUploading(true);
        try {
            const formData = new FormData();
            const fileName = imageAsset.uri.split('/').pop() || 'profile.jpg';
            const match = /\.(\w+)$/.exec(fileName);
            const type = match ? `image/${match[1]}` : `image`;

            formData.append('profile_photo', {
                uri: imageAsset.uri,
                name: fileName,
                type: imageAsset.mimeType || type,
            } as any);

            // console.log("Photo metadata:", { uri: imageAsset.uri, name: fileName, type: imageAsset.mimeType || type });

            const response = await apiPut(ApiConstants.VENDOR_PROFILE, formData, { isFormData: true });
            console.log("Upload response status:", response.status);
            console.log("Upload response data:", response.data);

            if (response.status === 200 || response.status === 201) {
                Alert.alert("Success", "Profile photo updated successfully");
                fetchVendorProfile();
                refreshProfile();
            } else {
                Alert.alert("Error", `Failed to upload photo (Status: ${response.status})`);
                setLocalImagePath(null);
            }
        } catch (error: any) {
            console.error("Error uploading profile photo:", error?.response?.data || error.message);
            Alert.alert("Error", "An error occurred: " + (error?.response?.data?.detail || "Could not upload photo"));
            setLocalImagePath(null);
        } finally {
            setIsUploading(false);
        }
    };

    // console.log("profileData", profileData);

    const getProfileImageUri = () => {
        if (localImagePath) {
            return localImagePath
        }

        if (profileData?.profile_photo) {
            return `${ApiConstants.MEDIA_URL}${profileData.profile_photo}`;
        }

        return null;
    };

    const getInitials = (name: string) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };



    const renderTabButton = (tab: 'Profile' | 'Security' | 'Notifications') => {
        const isActive = activeTab === tab;
        return (
            <TouchableOpacity
                style={[styles.tabButton, isActive && styles.activeTabButton]}
                onPress={() => setActiveTab(tab)}
            >
                <Text style={[styles.tabText, isActive && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
        );
    };


    const renderProfile = () => (
        <View style={styles.card}>
            <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                    {isUploading ? (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <ActivityIndicator color={ColorConstants.PRIMARY_BROWN} />
                        </View>
                    ) : getProfileImageUri() ? (
                        <Image
                            source={{ uri: getProfileImageUri()! }}
                            style={styles.avatar}
                        />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Text style={styles.avatarInitials}>
                                {getInitials(profileData?.user_name || 'Vendor')}
                            </Text>
                        </View>
                    )}
                    <TouchableOpacity style={styles.editAvatarBtn} onPress={pickImage}>
                        <Image source={Icons.ic_edit_pen} />
                    </TouchableOpacity>
                </View>
                <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>{profileData?.user_name || 'Vendor'}</Text>
                    <Text style={styles.profileRole}>{profileData?.user_role || 'Role'}</Text>
                </View>
                {!isEditing && (
                    <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
                        <Image source={Icons.ic_edit} style={styles.editBtnSmallIcon} />
                        <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.form}>
                <CustomTextInput
                    label="Company Name"
                    value={companyName}
                    onChangeText={setCompanyName}
                    placeholder="Enter company name"
                    editable={isEditing}
                />

                <CustomTextInput
                    label="Business Email"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter business email"
                    keyboardType="email-address"
                    leftIcon={Icons.ic_mail}
                    editable={isEditing}
                />

                <CustomTextInput
                    label="Phone Number"
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                    maxLength={13}
                    editable={isEditing}
                />

                <CustomTextInput
                    label="Address"
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Enter address"
                    editable={isEditing}
                />

                <CustomTextInput
                    label="Business Description"
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Enter business description"
                    multiline
                    multiStyles={styles.textArea}
                    editable={isEditing}
                />
            </View>

            {isEditing && (
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => {
                            // Reset values
                            if (profileData) {
                                setCompanyName(profileData.business_name);
                                setEmail(profileData.email);
                                setPhone(profileData.phone_number);
                                setAddress(profileData.business_address);
                                setDescription(profileData.business_description);
                            }
                            setIsEditing(false);
                        }}
                    >
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
                        onPress={handleProfileUpdate}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color={ColorConstants.WHITE} />
                        ) : (
                            <Text style={styles.saveBtnText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    const renderSecurity = () => (
        <View style={styles.card}>
            <Text style={styles.tabTitle}>Security Settings</Text>
            <Text style={styles.tabSubtitle}>Manage your account security</Text>

            {/* <TouchableOpacity style={styles.securityOption}>
                <Image source={Icons.ic_info} style={styles.securityIcon} />
                <Text style={styles.securityText}>Enable Two-Factor Authentication</Text>
            </TouchableOpacity> */}

            <TouchableOpacity style={styles.securityOption} onPress={() => setShowPasswordModal(true)}>
                <Image source={Icons.ic_permissions} style={styles.securityIcon} />
                <Text style={styles.securityText}>Change Password</Text>
            </TouchableOpacity>
        </View>
    );

    const renderNotifications = () => (
        <View style={styles.card}>
            <Text style={styles.tabTitle}>Notification Preferences</Text>
            <Text style={styles.tabSubtitle}>Control how you receive updates</Text>

            <View style={styles.notificationItem}>
                <Text style={styles.notificationLabel}>Email notifications for new messages</Text>
                <Switch
                    trackColor={{ false: '#E5E5EA', true: ColorConstants.PRIMARY_BROWN }}
                    thumbColor="#FFFFFF"
                    value={emailNotifications}
                    onValueChange={setEmailNotifications}
                />
            </View>

            <View style={styles.notificationItem}>
                <Text style={styles.notificationLabel}>SMS alerts for service reminders</Text>
                <Switch
                    trackColor={{ false: '#E5E5EA', true: ColorConstants.PRIMARY_BROWN }}
                    thumbColor="#FFFFFF"
                    value={smsAlerts}
                    onValueChange={setSmsAlerts}
                />
            </View>

            <View style={styles.notificationItem}>
                <Text style={styles.notificationLabel}>Push notifications for booking requests</Text>
                <Switch
                    trackColor={{ false: '#E5E5EA', true: ColorConstants.PRIMARY_BROWN }}
                    thumbColor="#FFFFFF"
                    value={pushNotifications}
                    onValueChange={setPushNotifications}
                />
            </View>

            <View style={styles.notificationItem}>
                <Text style={styles.notificationLabel}>Weekly performance summary</Text>
                <Switch
                    trackColor={{ false: '#E5E5EA', true: ColorConstants.PRIMARY_BROWN }}
                    thumbColor="#FFFFFF"
                    value={weeklySummary}
                    onValueChange={setWeeklySummary}
                />
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <Header
                title="Company Profile"
                subtitle="Update your business information"
                showBackArrow={false}
                containerStyle={{ paddingTop: 10 }}
            />
            <View style={{ flex: 1, paddingHorizontal: 20 }}>
                <View style={styles.tabBar}>
                    {renderTabButton('Profile')}
                    {renderTabButton('Security')}
                    {renderTabButton('Notifications')}
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                    {loading ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
                            <ActivityIndicator size="large" color={ColorConstants.PRIMARY_BROWN} />
                        </View>
                    ) : (
                        <>
                            {activeTab === 'Profile' && renderProfile()}
                            {activeTab === 'Security' && renderSecurity()}
                            {activeTab === 'Notifications' && renderNotifications()}
                        </>
                    )}
                </ScrollView>
            </View>

            <ChangePasswordModal
                visible={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                onSuccess={() => {
                    console.log('Password Changed');
                    setShowPasswordModal(false);
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorConstants.WHITE,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        padding: 3,
        marginTop: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 5,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeTabButton: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
    },
    tabText: {
        fontSize: 15,
        fontFamily: Fonts.ManropeMedium,
        color: '#535B69',
    },
    activeTabText: {
        color: ColorConstants.WHITE,
    },
    card: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        padding: 20,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 76,
        height: 76,
        borderRadius: 38,
    },


    avatarPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: ColorConstants.GRAY3,
    },

    avatarInitials: {
        fontSize: 28,
        fontWeight: '600',
        color: ColorConstants.PRIMARY_BROWN,
    },
    editAvatarBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: ColorConstants.WHITE,
    },

    profileInfo: {
        marginLeft: 15,
        flex: 1,
    },
    profileName: {
        fontSize: 20,
        fontFamily: Fonts.ManropeBold,
        color: ColorConstants.BLACK2,
    },
    profileRole: {
        fontSize: 14,
        fontFamily: Fonts.mulishRegular,
        color: ColorConstants.DARK_CYAN,
        marginTop: 2,
    },
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    editBtnSmallIcon: {
        width: 14,
        height: 14,
        tintColor: ColorConstants.WHITE,
        marginRight: 6,
    },
    editBtnText: {
        fontSize: 14,
        fontFamily: Fonts.mulishBold,
        color: ColorConstants.WHITE,
    },
    form: {
        marginTop: 5,
    },
    textArea: {
        minHeight: 80,
    },
    footer: {
        flexDirection: 'row',
        marginTop: 10,
        justifyContent: 'flex-end',
        gap: 20,
    },
    cancelBtn: {
        borderWidth: 1,
        borderColor: '#D7D7D8',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        minWidth: 100,
        alignItems: 'center',
    },
    cancelBtnText: {
        fontSize: 15,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.DARK_CYAN,
    },
    saveBtn: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        minWidth: 120,
        alignItems: 'center',
    },
    saveBtnText: {
        fontSize: 15,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.WHITE,
    },
    tabTitle: {
        fontSize: 20,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.BLACK2,
    },
    tabSubtitle: {
        fontSize: 14,
        fontFamily: Fonts.mulishRegular,
        color: ColorConstants.DARK_CYAN,
        marginTop: 4,
        marginBottom: 25,
    },
    securityOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 12,
        marginBottom: 15,
    },

    securityIcon: {
        width: 20,
        height: 20,
        tintColor: ColorConstants.DARK_CYAN,
        resizeMode: 'contain',
        marginRight: 6
    },
    securityText: {
        fontSize: 15,
        fontFamily: Fonts.mulishSemiBold,
        color: ColorConstants.BLACK2,
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 12,
        marginBottom: 12,
    },
    notificationLabel: {
        fontSize: 14,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.BLACK2,
        flex: 1,
        marginRight: 10,
    },
});
