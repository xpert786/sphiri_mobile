import { apiGet, apiPatch } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import CustomTextInput from '@/components/CustomTextInput';
import Header from '@/components/Header';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { StringConstants } from '@/constants/StringConstants';
import { useProfile } from '@/context/ProfileContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserRole } from '../../Home';

interface FamilyMemberProfile {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    phone_number: string;
    address: string;
    bio: string;
    profile_picture: string;
    role: string;
    role_display: string;
    role_description: string;
    invited_at: string;
    accepted_at: string;
    invited_days_ago: number;
    accepted_days_ago: number;
    can_view_contacts: boolean;
    can_edit_contacts: boolean;
    can_view_documents: boolean;
    can_edit_documents: boolean;
    can_view_reminders: boolean;
    can_edit_reminders: boolean;
    has_emergency_access: boolean;
    profile_picture_url: string;
}

export default function Profile() {
    const { profile, refreshProfile } = useProfile();
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [profileImage, setProfileImage] = useState<string | null>(null);


    const [formData, setFormData] = useState({
        fullName: profile?.full_name || profile?.name || '',
        email: profile?.email || '',
        phone: profile?.phone_number || profile?.phone || '',
        website: profile?.website_address || '',
        address: profile?.address || '',
        bio: profile?.bio || '',
    });



    const [trusteeData, setTrusteeData] = useState<Partial<FamilyMemberProfile>>({
        name: '',
        email: '',
        phone: '',
        address: '',
        bio: '',
        role_display: '',
        role_description: '',
        invited_days_ago: 0,
        accepted_days_ago: 0,
        profile_picture: '',
    });

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                router.navigate('/(root)/(drawer)/Home');
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => subscription.remove();
        }, [])
    );

    useEffect(() => {
        AsyncStorage.getItem(StringConstants.USER_ROLE).then(role => {
            if (role) {
                setUserRole(role as UserRole);
                if (role === 'family_member') {
                    fetchFamilyMemberProfile();
                }
            }
        });
    }, []);

    useEffect(() => {
        if (profile && userRole === 'home_owner') {
            setFormData({
                fullName: profile.full_name || profile.name || '',
                email: profile.email || '',
                phone: profile.phone_number || profile.phone || '',
                website: profile.website_address || '',
                address: profile.address || '',
                bio: profile.bio || '',
            });
            if (profile.profile_picture_url) {
                setProfileImage(ApiConstants.MEDIA_URL + profile.profile_picture_url);
            } else if (profile.profile_picture) {
                setProfileImage(ApiConstants.MEDIA_URL + profile.profile_picture);
            }
        }
    }, [profile, userRole]);

    const saveHomeOwnerProfile = async () => {
        setIsSaving(true);
        try {
            const formDataPayload = new FormData();
            const nameParts = (formData.fullName || '').split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            formDataPayload.append('first_name', firstName);
            formDataPayload.append('last_name', lastName);
            formDataPayload.append('full_name', formData.fullName);
            formDataPayload.append('phone_number', formData.phone);
            formDataPayload.append('website_address', formData.website);
            formDataPayload.append('address', formData.address);
            formDataPayload.append('bio', formData.bio);

            if (selectedImage) {
                const fileName = selectedImage.uri.split('/').pop() || 'profile.jpg';
                const match = /\.(\w+)$/.exec(fileName);
                const type = match ? `image/${match[1]}` : `image`;

                formDataPayload.append('profile_picture', {
                    uri: selectedImage.uri,
                    name: fileName,
                    type: String(selectedImage.mimeType || type),
                } as any);
            }

            const response = await apiPatch(ApiConstants.BASE_URL + ApiConstants.GET_PROFILE, formDataPayload, { isFormData: true });
            console.log('Profile updated successfully:', response.data);
            await refreshProfile();
            setIsEditing(false);
            Alert.alert("Success", "Profile updated successfully");
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert("Error", "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };


    const fetchFamilyMemberProfile = async () => {
        try {
            const response = await apiGet(ApiConstants.BASE_URL + ApiConstants.FAMILY_MEMBER_PROFILE);
            const data: FamilyMemberProfile = response.data;
            setTrusteeData(data);
            if (data.profile_picture_url || data.profile_picture) {
                setProfileImage(ApiConstants.MEDIA_URL + (data.profile_picture_url || data.profile_picture));
            }
        } catch (error) {
            console.error('Error fetching family member profile:', error);
        }
    };

    const saveFamilyMemberProfile = async () => {
        setIsSaving(true);
        try {
            const formData = new FormData();
            const nameParts = (trusteeData.name || '').split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            formData.append('first_name', firstName);
            formData.append('last_name', lastName);
            formData.append('full_name', trusteeData.name || '');
            formData.append('phone', trusteeData.phone || '');
            formData.append('address', trusteeData.address || '');
            formData.append('bio', trusteeData.bio || '');

            const response = await apiPatch(ApiConstants.BASE_URL + ApiConstants.FAMILY_MEMBER_PROFILE, formData, { isFormData: true });
            console.log('Profile updated successfully:', response.data);
            fetchFamilyMemberProfile();
            setIsEditing(false);
            Alert.alert("Success", "Profile updated successfully");
        } catch (error) {
            console.error('Error updating family member profile:', error);
            Alert.alert("Error", "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0]);

            if (userRole === 'family_member') {
                uploadProfileImage(result.assets[0]);
            } else {
                uploadHomeOwnerImage(result.assets[0])
            }

        }
    };


    const uploadProfileImage = async (imageAsset: ImagePicker.ImagePickerAsset) => {
        console.log("imageAsset in uploadProfileImage", imageAsset);

        try {
            const formData = new FormData();
            const fileName = imageAsset.uri.split('/').pop() || 'profile.jpg';
            const match = /\.(\w+)$/.exec(fileName);
            const type = match ? `image/${match[1]}` : `image`;

            formData.append('profile_picture', {
                uri: imageAsset.uri,
                name: fileName,
                type: imageAsset.mimeType || type,
            } as any);

            console.log("Photo metadata:", { uri: imageAsset.uri, name: fileName, type: imageAsset.mimeType || type });

            const response = await apiPatch(ApiConstants.BASE_URL + ApiConstants.FAMILY_MEMBER_PROFILE_PICTURE, formData, { isFormData: true });
            console.log("Upload response status:", response.status);
            console.log("Upload response data:", response.data);

            if (response.status === 200 || response.status === 201) {
                Alert.alert("Success", "Profile photo updated successfully");
                fetchFamilyMemberProfile();
                refreshProfile();
            } else {
                Alert.alert("Error", `Failed to upload photo (Status: ${response.status})`);
                setSelectedImage(null);
            }
        } catch (error: any) {
            console.error("Error uploading profile photo:", error?.response?.data || error.message);
            Alert.alert("Error", "An error occurred: " + (error?.response?.data?.detail || "Could not upload photo"));
            setSelectedImage(null);
        }
    };


    const uploadHomeOwnerImage = async (imageAsset: ImagePicker.ImagePickerAsset) => {
        console.log("imageAsset in uploadHomeOwnerImage", imageAsset);

        try {
            const formData = new FormData();
            const fileName = imageAsset.uri.split('/').pop() || 'profile.jpg';
            const match = /\.(\w+)$/.exec(fileName);
            const type = match ? `image/${match[1]}` : `image`;

            formData.append('profile_picture', {
                uri: imageAsset.uri,
                name: fileName,
                type: imageAsset.mimeType || type,
            } as any);

            console.log("Photo metadata:", { uri: imageAsset.uri, name: fileName, type: imageAsset.mimeType || type });

            const response = await apiPatch(ApiConstants.BASE_URL + ApiConstants.UPLOAD_PROFILE_IMAGE, formData, { isFormData: true });
            console.log("Upload response status:", response.status);
            console.log("Upload response data:", response.data);

            if (response.status === 200 || response.status === 201) {
                Alert.alert("Success", "Profile photo updated successfully");
                refreshProfile();
            } else {
                Alert.alert("Error", `Failed to upload photo (Status: ${response.status})`);
                setSelectedImage(null);
            }
        } catch (error: any) {
            console.error("Error uploading profile photo:", error?.response?.data || error.message);
            Alert.alert("Error", "An error occurred: " + (error?.response?.data?.detail || "Could not upload photo"));
            setSelectedImage(null);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleTrusteeInputChange = (field: string, value: string) => {
        setTrusteeData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title="Profile"
                subtitle={userRole == "home_owner" ? StringConstants.PROFILE_HOME_OWNER : StringConstants.PROFILE_TRUSTEE}
                showBackArrow={false}
                containerStyle={{ paddingTop: 10 }}
            />

            {userRole == "home_owner" ?
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.profileCard}>
                        {/* Profile Header Info */}
                        <View style={styles.profileInfoRow}>
                            <View style={styles.avatarContainer}>
                                <Image
                                    source={profileImage ? { uri: profileImage } : Icons.ic_avatar}
                                    style={profileImage ? {
                                        width: 70, height: 70, borderRadius: 35, borderWidth: 1,
                                        borderColor: ColorConstants.GRAY3,
                                    } : undefined}
                                />
                                <TouchableOpacity style={styles.editAvatarBtn} onPress={pickImage}>
                                    <Image source={Icons.ic_edit_pen} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.nameHeader}>
                                <Text style={styles.profileName}>{formData.fullName}</Text>
                                <Text style={styles.profileRole}>Homeowner</Text>
                            </View>
                            {!isEditing && (
                                <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
                                    <Image source={Icons.ic_edit} style={styles.editIcon} />
                                    <Text style={styles.editBtnText}>Edit</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Form Fields */}
                        <View style={styles.form}>
                            <CustomTextInput
                                label="Full Name"
                                value={formData.fullName}
                                onChangeText={(t) => handleInputChange('fullName', t)}
                                placeholder="Enter full name"
                                editable={isEditing}
                            />

                            <CustomTextInput
                                label="Email Address"
                                value={formData.email}
                                onChangeText={(t) => handleInputChange('email', t)}
                                placeholder="Enter email address"
                                leftIcon={Icons.ic_mail}
                                leftIconStyle={styles.fieldIcon}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={false}
                            />

                            <CustomTextInput
                                label="Phone Number"
                                value={formData.phone}
                                onChangeText={(t) => handleInputChange('phone', t)}
                                placeholder="Enter phone number"
                                keyboardType="phone-pad"
                                editable={isEditing}
                                maxLength={13}
                            />

                            <CustomTextInput
                                label="Website"
                                value={formData.website}
                                onChangeText={(t) => handleInputChange('website', t)}
                                placeholder="Enter website address"
                                editable={isEditing}
                            />

                            <CustomTextInput
                                label="Address"
                                value={formData.address}
                                onChangeText={(t) => handleInputChange('address', t)}
                                placeholder="Enter address"
                                editable={isEditing}
                            />

                            <CustomTextInput
                                label="Bio"
                                value={formData.bio}
                                onChangeText={(t) => handleInputChange('bio', t)}
                                placeholder="Tell us about yourself"
                                multiline
                                inputStyles={{ height: 80, alignItems: 'flex-start' }}
                                editable={isEditing}
                            />
                        </View>

                        {/* Footer Actions */}
                        {isEditing && (
                            <View style={styles.footer}>
                                <TouchableOpacity
                                    style={styles.cancelBtn}
                                    onPress={() => {
                                        setIsEditing(false);
                                        // Reset to original values from profile
                                        if (profile) {
                                            setFormData({
                                                fullName: profile.full_name || profile.name || '',
                                                email: profile.email || '',
                                                phone: profile.phone_number || profile.phone || '',
                                                website: profile.website_address || '',
                                                address: profile.address || '',
                                                bio: profile.bio || '',
                                            });
                                        }
                                    }}
                                >
                                    <Text style={styles.cancelBtnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
                                    onPress={saveHomeOwnerProfile}
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
                </ScrollView> :
                userRole == "family_member" ?
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        <View style={[styles.profileCard, { marginBottom: 10 }]}>
                            {/* Profile Header Info */}
                            <View style={styles.profileInfoRow}>
                                <View style={styles.avatarContainer}>
                                    <Image
                                        source={
                                            selectedImage ? { uri: selectedImage.uri } :
                                                profileImage ? { uri: profileImage } : Icons.ic_avatar}
                                        style={profileImage ? { width: 70, height: 70, borderRadius: 35 } : undefined}
                                    />
                                    <TouchableOpacity style={styles.editAvatarBtn} onPress={pickImage}>
                                        <Image source={Icons.ic_edit_pen} />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.nameHeader}>
                                    <Text style={styles.profileName}>{trusteeData.name}</Text>
                                    <Text style={styles.profileRole}>Co -Manager</Text>
                                </View>
                                {!isEditing && (
                                    <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
                                        <Image source={Icons.ic_edit} style={styles.editIcon} />
                                        <Text style={styles.editBtnText}>Edit</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* Form Fields */}
                            <View style={styles.form}>
                                <CustomTextInput
                                    label="Full Name"
                                    value={trusteeData.name || ''}
                                    onChangeText={(t) => handleTrusteeInputChange('name', t)}
                                    placeholder="Enter full name"
                                    editable={isEditing}
                                />

                                <CustomTextInput
                                    label="Email Address"
                                    value={trusteeData.email || ''}
                                    onChangeText={(t) => handleTrusteeInputChange('email', t)}
                                    placeholder="Enter email address"
                                    leftIcon={Icons.ic_mail}
                                    leftIconStyle={styles.fieldIcon}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={false}
                                />

                                <CustomTextInput
                                    label="Phone Number"
                                    value={trusteeData.phone || ''}
                                    onChangeText={(t) => handleTrusteeInputChange('phone', t)}
                                    placeholder="Enter phone number"
                                    keyboardType="phone-pad"
                                    editable={isEditing}
                                    maxLength={13}
                                />

                                <CustomTextInput
                                    label="Address"
                                    value={trusteeData.address || ''}
                                    onChangeText={(t) => handleTrusteeInputChange('address', t)}
                                    placeholder="Enter address"
                                    editable={isEditing}
                                />

                                <CustomTextInput
                                    label="Bio"
                                    value={trusteeData.bio || ''}
                                    onChangeText={(t) => handleTrusteeInputChange('bio', t)}
                                    placeholder="Tell us about yourself"
                                    multiline
                                    inputStyles={{ height: 80, alignItems: 'flex-start' }}
                                    editable={isEditing}
                                />
                            </View>

                            {/* Footer Actions */}
                            {isEditing && (
                                <View style={styles.footer}>
                                    <TouchableOpacity
                                        style={styles.cancelBtn}
                                        onPress={() => {
                                            setIsEditing(false);
                                            fetchFamilyMemberProfile(); // Re-fetch to reset
                                        }}
                                    >
                                        <Text style={styles.cancelBtnText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
                                        onPress={saveFamilyMemberProfile}
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
                        <View style={styles.profileCard}>
                            <Text style={styles.labels}>Your Access</Text>
                            <Text style={styles.values}>Permissions and access details</Text>
                            <Text style={styles.labels}>Role: {trusteeData.role_display}</Text>
                            <Text style={styles.values}>{trusteeData.role_description}</Text>
                            <Text style={styles.labels}>Invited: {trusteeData.invited_days_ago} days ago</Text>
                            <Text style={styles.values}>You accepted the invitation {trusteeData.accepted_days_ago} days ago.</Text>
                        </View>
                    </ScrollView> : null
            }
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorConstants.WHITE,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    profileCard: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginTop: 10,
    },
    profileInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarContainer: {
        position: 'relative',
        backgroundColor: ColorConstants.GRAY3,
        borderRadius: 40,
        width: 70,
        height: 70,
        alignItems: 'center',
        justifyContent: 'center',

    },

    editAvatarBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: ColorConstants.REDDISH_BROWN,
        borderRadius: 14,
    },

    nameHeader: {
        flex: 1,
        marginLeft: 16,
    },
    profileName: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 20,
        color: ColorConstants.BLACK2,
    },
    profileRole: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 16,
        color: ColorConstants.DARK_CYAN,
        // marginTop: 4,
    },
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
    },
    editIcon: {
        tintColor: ColorConstants.WHITE,
        marginRight: 6,
    },
    editBtnText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.WHITE,
    },
    form: {
        marginBottom: 12,
    },
    fieldIcon: {
        width: 14,
        height: 14,
        resizeMode: 'contain',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 12,
    },
    cancelBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
    },
    cancelBtnText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.DARK_CYAN,
    },
    saveBtn: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        alignItems: 'center',
    },
    saveBtnText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.WHITE,
    },
    labels: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.BLACK2,
        marginBottom: 6
    },
    values: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 13,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 10

    }
});
