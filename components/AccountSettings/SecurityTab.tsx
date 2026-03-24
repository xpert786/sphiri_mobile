import { apiGet, apiPost } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import CustomTextInput from '@/components/CustomTextInput';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import ChangePasswordModal from '@/modals/ChangePasswordModal';
import DeactivateEmergencyAccessModal from '@/modals/DeactivateEmergencyAccessModal';
import DeleteConfirmationModal from '@/modals/DeleteConfirmationModal';
import TwoFactorModal from '@/modals/TwoFactorModal';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';

const SHARED_CONTENT = [
    { id: 'legal', label: 'Legal Documents' },
    { id: 'medical', label: 'Medical Records' },
    { id: 'emergency', label: 'Emergency Contacts' },
    { id: 'notes', label: 'Notes' },
];

const TRIGGER_OPTIONS = ['Manual unlock only', 'Inactivity Timer', 'Admin Confirmation'];

const SecurityTab = () => {
    const router = useRouter();
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showAddInventoryModal, setShowAddInventoryModal] = useState(false);
    const [triggerType, setTriggerType] = useState('Inactivity Timer');
    const [showTriggerDropdown, setShowTriggerDropdown] = useState(false);
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [daysInactivity, setDaysInactivity] = useState('10');
    const [selectedMembers, setSelectedMembers] = useState(['1']);
    const [familyMembers, setFamilyMembers] = useState<any[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(true);
    const [loadingInventory, setLoadingInventory] = useState(true);
    const [sharedContent, setSharedContent] = useState({
        legal: true,
        medical: false,
        emergency: false,
        notes: false,
    });
    const [emergencyData, setEmergencyData] = useState<any>(null);
    const [notifications, setNotifications] = useState({
        warning: true,
        triggered: true,
    });
    const [inventoryItems, setInventoryItems] = useState<any[]>([]);

    useEffect(() => {
        // fetchMembers(); // User wants to show only authorized_members from emergency access
        fetchEmergencyAccess();
        fetchInventory();
    }, []);

    const fetchMembers = async () => {
        try {
            setLoadingMembers(true);
            const response = await apiGet(ApiConstants.MEMBERS);
            if (response.data && response.data.results) {
                setFamilyMembers(response.data.results);
            }
        } catch (error) {
            console.error('Error fetching members in security tab:', error);
        } finally {
            setLoadingMembers(false);
        }
    };

    const fetchEmergencyAccess = async () => {
        try {
            setLoadingMembers(true);
            const response = await apiGet(ApiConstants.EMERGENCY_ACCESS);
            if (response.data) {
                setEmergencyData(response.data);
                // Extract authorized members
                if (response.data.authorized_members) {
                    setFamilyMembers(response.data.authorized_members);
                    // Pre-select them if needed, or manage via API update later
                    setSelectedMembers(response.data.authorized_members.map((m: any) => m.id.toString()));
                }
                // Update other fields based on response
                setTriggerType(response.data.trigger_type_display || 'Inactivity Timer');
                setDaysInactivity(response.data.emergency_inactivity_days?.toString() || '10');
                setSharedContent({
                    legal: response.data.emergency_share_legal_docs,
                    medical: response.data.emergency_share_medical,
                    emergency: response.data.emergency_share_contacts,
                    notes: response.data.emergency_share_notes,
                });
                setNotifications({
                    warning: response.data.emergency_warning_email,
                    triggered: response.data.emergency_confirmation_email,
                });
            }
        } catch (error) {
            console.error('Error fetching emergency access:', error);
        } finally {
            setLoadingMembers(false);
        }
    };

    const handleDeactivate = async () => {
        try {
            setLoadingMembers(true);
            const response = await apiPost(ApiConstants.DEACTIVATE_EMERYGENCY_ACCESS, {});
            if (response.data && response.data.message) {
                Toast.show({
                    type: 'info',
                    text1: 'Emergency Access',
                    text2: response.data.message,
                });
            }
            setShowDeactivateModal(false);
            fetchEmergencyAccess(); // Refresh data
        } catch (error) {
            console.error('Error deactivating emergency access:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to deactivate emergency access',
            });
        } finally {
            setLoadingMembers(false);
        }
    };

    const fetchInventory = async () => {
        try {
            setLoadingInventory(true);
            const response = await apiGet(ApiConstants.HOME_INVENTORY);
            if (response.data && response.data.results) {
                setInventoryItems(response.data.results);
            }
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setLoadingInventory(false);
        }
    };

    const toggleMember = (id: string) => {
        setSelectedMembers(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    const toggleSharedContent = (id: string) => {
        setSharedContent(prev => ({ ...prev, [id]: !prev[id as keyof typeof prev] }));
    };

    return (
        <View style={styles.tabContent}>
            {/* Two-Factor Authentication */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Two-Factor Authentication</Text>
                <Text style={styles.cardSubtitle}>Add an extra layer of security to your account</Text>

                <View style={styles.alertBox}>
                    <View style={styles.alertHeader}>
                        <Image source={Icons.ic_info} style={styles.alertIcon} />
                        <View>
                            <Text style={styles.alertTitle}>2FA is not enabled</Text>
                            <Text style={styles.alertText}>Enable 2FA to protect your account</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => setShow2FAModal(true)}
                >
                    <Text style={styles.actionBtnText}>Enable 2FA</Text>
                </TouchableOpacity>

                <TwoFactorModal
                    visible={show2FAModal}
                    onClose={() => setShow2FAModal(false)}
                    onEnable={() => {
                        console.log('2FA Enabled');
                        setShow2FAModal(false);
                    }}
                />
            </View>

            {/* Emergency Access Protocol */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Emergency Access Protocol</Text>
                <Text style={styles.cardSubtitle}>Configure what happens if you become inactive or unavailable</Text>

                <View style={[styles.fieldGroup, { zIndex: 1000 }]}>
                    <Text style={styles.label}>Trigger Type</Text>
                    <TouchableOpacity
                        style={styles.dropdown}
                        onPress={() => setShowTriggerDropdown(!showTriggerDropdown)}
                    >
                        <Text style={styles.dropdownText}>{triggerType}</Text>
                        <Image source={Icons.ic_down_arrow} style={styles.dropdownIcon} />
                    </TouchableOpacity>

                    {showTriggerDropdown && (
                        <View style={styles.dropdownList}>
                            {TRIGGER_OPTIONS.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.dropdownItem}
                                    onPress={() => {
                                        setTriggerType(option);
                                        setShowTriggerDropdown(false);
                                    }}
                                >
                                    <Text style={styles.dropdownItemText}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                <View style={styles.fieldGroup}>
                    <CustomTextInput
                        label="Days of Inactivity"
                        value={daysInactivity}
                        onChangeText={setDaysInactivity}
                        placeholder="10"
                        keyboardType="numeric"
                        parentStyles={{ marginBottom: 4 }}
                    />
                    <Text style={styles.infoText}>Access will be granted after 10 days without login.</Text>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Select Authorized Family Members</Text>
                </View>
                {loadingMembers ? (
                    <ActivityIndicator size="small" color={ColorConstants.PRIMARY_BROWN} />
                ) : familyMembers.map(member => (
                    <TouchableOpacity
                        key={member.id.toString()}
                        style={styles.memberItem}
                        onPress={() => toggleMember(member.id.toString())}
                    >
                        <View style={styles.checkbox}>
                            {selectedMembers.includes(member.id.toString()) && (
                                <Image source={Icons.ic_checkbox_selected} style={styles.checkIcon} />
                            )}
                        </View>
                        <Text style={styles.memberName}>{member.invitee_name || member.name || `${member.first_name || ''} ${member.last_name || ''}`.trim() || member.invitee_email}</Text>
                        <View style={styles.roleLabel}>
                            <Text style={styles.roleText}>{member.role_display || member.role}</Text>
                        </View>
                    </TouchableOpacity>
                ))}

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Select Shared Content</Text>
                </View>
                {SHARED_CONTENT.map(content => (
                    <View key={content.id} style={styles.toggleItem}>
                        <Text style={styles.toggleLabel}>{content.label}</Text>
                        <Switch
                            value={sharedContent[content.id as keyof typeof sharedContent]}
                            onValueChange={() => toggleSharedContent(content.id)}
                            trackColor={{ false: '#E5E7EB', true: ColorConstants.PRIMARY_BROWN }}
                            thumbColor={ColorConstants.WHITE}
                        />
                    </View>
                ))}
                <Text style={[styles.infoText, { marginTop: 4 }]}>Access expires after 7 days.</Text>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Notifications</Text>
                </View>
                <View style={styles.toggleItem}>
                    <Text style={styles.toggleLabel}>Send warning email before activation</Text>
                    <Switch
                        value={notifications.warning}
                        onValueChange={(val) => setNotifications(prev => ({ ...prev, warning: val }))}
                        trackColor={{ false: '#E5E7EB', true: ColorConstants.PRIMARY_BROWN }}
                        thumbColor={ColorConstants.WHITE}
                    />
                </View>
                <View style={styles.toggleItem}>
                    <Text style={styles.toggleLabel}>Send confirmation once triggered</Text>
                    <Switch
                        value={notifications.triggered}
                        onValueChange={(val) => setNotifications(prev => ({ ...prev, triggered: val }))}
                        trackColor={{ false: '#E5E7EB', true: ColorConstants.PRIMARY_BROWN }}
                        thumbColor={ColorConstants.WHITE}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.actionBtn, { marginTop: 12, alignSelf: 'flex-end', }]}
                    onPress={() => setShowDeactivateModal(true)}
                >
                    <Text style={styles.actionBtnText}>Deactivate Emergency Access</Text>
                </TouchableOpacity>
            </View>

            {/* Biometric Login */}
            {/* <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Biometric Login</Text>
                    <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>Active</Text>
                    </View>
                </View>
                <Text style={styles.cardSubtitle}>Use fingerprint or face recognition to sign in</Text>

                <View style={styles.toggleItemCard}>
                    <View style={styles.toggleTextContainer}>
                        <Text style={styles.toggleLabelLarge}>Biometric Authentication</Text>
                        <Text style={styles.toggleSubText}>Enabled on this device</Text>
                    </View>
                    <Switch
                        value={biometricEnabled}
                        onValueChange={setBiometricEnabled}
                        trackColor={{ false: '#E5E7EB', true: ColorConstants.PRIMARY_BROWN }}
                        thumbColor={ColorConstants.WHITE}
                    />
                </View>
            </View> */}

            {/* Password */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Password</Text>
                <Text style={styles.cardSubtitle}>Change your password regularly to keep your account secure</Text>
                <TouchableOpacity
                    style={styles.outlineBtn}
                    onPress={() => setShowPasswordModal(true)}
                >
                    <Text style={styles.outlineBtnText}>Change Password</Text>
                </TouchableOpacity>

                <ChangePasswordModal
                    visible={showPasswordModal}
                    onClose={() => setShowPasswordModal(false)}
                    onSuccess={() => {
                        console.log('Password Changed');
                        setShowPasswordModal(false);
                    }}
                />
            </View>

            {/* Danger Zone */}
            <View style={styles.dangerZoneCard}>
                <View style={styles.dangerZoneContent}>
                    <View style={styles.dangerZoneHeader}>
                        <Text style={styles.dangerZoneTitle}>Danger Zone</Text>
                        <Text style={styles.dangerZoneSubtitle}>Permanent actions that cannot be undone</Text>
                    </View>

                    <View style={styles.dangerItemRow}>
                        <View style={styles.dangerItemInfo}>
                            <Text style={styles.dangerItemTitle}>Delete Account</Text>
                            <Text style={styles.dangerItemSubtitle}>Permanently remove your account and all associated data from Sphiri.</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.deleteAccountBtn}
                            onPress={() => setShowDeleteAccountModal(true)}
                        >
                            <Text style={styles.deleteAccountBtnText}>Delete Account</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <Image source={Icons.ic_warn} style={styles.dangerWatermark} />
            </View>

            <DeleteConfirmationModal
                visible={showDeleteAccountModal}
                onClose={() => setShowDeleteAccountModal(false)}
                onDelete={async () => {
                    try {
                        const response = await apiPost(ApiConstants.DELETE_ACCOUNT, { role: 'home_owner' });
                        if (response.status === 200 || response.status === 204) {
                            Toast.show({
                                type: 'success',
                                text1: 'Account Deleted',
                                text2: 'Your account has been deleted successfully.',
                            });
                            setShowDeleteAccountModal(false);
                            // Navigate to Splash screen
                            router.replace('/(root)/Splash');
                        }
                    } catch (error) {
                        console.error('Error deleting account:', error);
                        Toast.show({
                            type: 'error',
                            text1: 'Error',
                            text2: 'Failed to delete account. Please try again.',
                        });
                    }
                }}
                title="Are you sure you want to delete your account?"
            />

            <DeactivateEmergencyAccessModal
                visible={showDeactivateModal}
                onClose={() => setShowDeactivateModal(false)}
                onDeactivate={handleDeactivate}
            />




        </View>
    );
};

export default SecurityTab;

const styles = StyleSheet.create({
    tabContent: {
        paddingHorizontal: 20,
    },
    card: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    cardTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 16,
        color: ColorConstants.BLACK2,
    },
    cardSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 16,
    },
    alertBox: {
        backgroundColor: ColorConstants.WHITE,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    alertHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    alertIcon: {
        width: 16,
        height: 16,
        tintColor: ColorConstants.GRAY,
        marginRight: 12,
    },
    alertTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 13,
        color: ColorConstants.BLACK2,
    },
    alertText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 11,
        color: ColorConstants.DARK_CYAN,
    },
    actionBtn: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    actionBtnText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 13,
        color: ColorConstants.WHITE,
    },
    fieldGroup: {
        marginBottom: 16,
    },
    label: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 13,
        color: ColorConstants.BLACK2,
        marginBottom: 8,
    },
    dropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    dropdownText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 13,
        color: ColorConstants.DARK_CYAN,
    },
    dropdownIcon: {
        width: 12,
        height: 12,
        tintColor: ColorConstants.GRAY,
    },
    dropdownList: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: ColorConstants.WHITE,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 8,
        marginTop: 4,
        zIndex: 1001,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: ColorConstants.GRAY3,
    },
    dropdownItemText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 13,
        color: ColorConstants.BLACK2,
    },
    infoText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 11,
        color: ColorConstants.DARK_CYAN,
    },
    sectionHeader: {
        marginVertical: 16,
    },
    sectionTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 16,
        color: ColorConstants.BLACK2,
    },
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: ColorConstants.PRIMARY_BROWN,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkIcon: {
        width: 18,
        height: 18,
    },
    memberName: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
        flex: 1,
    },
    roleLabel: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        backgroundColor: ColorConstants.PRIMARY_BROWN,
    },
    roleText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 10,
        color: ColorConstants.WHITE,
    },
    toggleItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 8,
        marginBottom: 8,
    },
    toggleLabel: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 13,
        color: ColorConstants.DARK_CYAN,
        flex: 1,
    },
    activeBadge: {
        backgroundColor: ColorConstants.GREEN2,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    activeBadgeText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 10,
        color: ColorConstants.WHITE,
    },
    toggleItemCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 12,
        marginTop: 8,
    },
    toggleTextContainer: {
        flex: 1,
    },
    toggleLabelLarge: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    toggleSubText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 11,
        color: ColorConstants.DARK_CYAN,
        marginTop: 2,
    },
    outlineBtn: {
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    outlineBtnText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 13,
        color: ColorConstants.BLACK2,
    },
    sessionCard: {
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 12,
        padding: 12,
    },
    sessionInfo: {
        marginBottom: 12,
    },
    sessionTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    sessionSubText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 11,
        color: ColorConstants.DARK_CYAN,
    },
    signOutBtn: {
        backgroundColor: '#F44336',
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    signOutText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 13,
        color: ColorConstants.WHITE,
    },
    inventorySection: {
        marginTop: 8,
        marginBottom: 24,
    },
    inventoryTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 20,
        color: ColorConstants.BLACK2,
        marginBottom: 4,
    },
    inventorySubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 20,
    },
    uploadBtn: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 20,
    },
    uploadBtnText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.WHITE,
    },
    inventoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    inventoryCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        width: '48.5%',
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    inventoryImage: {
        width: 48,
        height: 48,
        borderRadius: 8,
        marginRight: 10,
        backgroundColor: ColorConstants.GRAY3,
    },
    inventoryItemName: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        flex: 1,
    },
    deleteIconContainer: {
        padding: 4,
    },
    deleteIcon: {
        width: 16,
        height: 16,
        tintColor: '#9CA3AF',
    },
    loaderContainer: {
        width: '100%',
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 13,
        color: ColorConstants.DARK_CYAN,
        textAlign: 'center',
        width: '100%',
        padding: 20,
    },
    dangerZoneCard: {
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FEE2E2',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
    },
    dangerZoneContent: {
        zIndex: 1,
    },
    dangerZoneHeader: {
        marginBottom: 20,
    },
    dangerZoneTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 20,
        color: '#B91C1C',
        marginBottom: 6,
    },
    dangerZoneSubtitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 14,
        color: '#EF4444',
    },
    dangerItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    dangerItemInfo: {
        flex: 1,
        marginRight: 16,
    },
    dangerItemTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        marginBottom: 4,
    },
    dangerItemSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: '#6B7280',
        lineHeight: 18,
    },
    deleteAccountBtn: {
        backgroundColor: '#EF4444',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
    },
    deleteAccountBtnText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 13,
        color: ColorConstants.WHITE,
    },
    dangerWatermark: {
        position: 'absolute',
        right: -10,
        top: 10,
        width: 120,
        height: 120,
        opacity: 0.05,
        tintColor: '#B91C1C',
        zIndex: 0,
        transform: [{ rotate: '15deg' }],
    },
});
