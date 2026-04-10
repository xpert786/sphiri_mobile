import { apiPost } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import CustomTextInput from '@/components/CustomTextInput';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import React, { useEffect, useState } from 'react';
import {
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface EditFamilyMemberModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (formData: any) => void;
    member?: any;
}

const EditFamilyMemberModal: React.FC<EditFamilyMemberModalProps> = ({
    visible,
    onClose,
    onSave,
    member,
}) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'Co-Manager (Full control)',
        isEmergency: false,
    });

    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const roleOptions = ['Co-Manager (Full control)', 'Editor (View & Edit)', 'Viewer (View only)'];

    // Emergency Config States
    const [showEmergencyConfig, setShowEmergencyConfig] = useState(false);
    const [triggerType, setTriggerType] = useState<'inactivity_timer' | 'manual_unlock'>('inactivity_timer');
    const [inactivityDays, setInactivityDays] = useState('90');
    const [openTriggerDropdown, setOpenTriggerDropdown] = useState(false);
    const [configLoading, setConfigLoading] = useState(false);

    useEffect(() => {
        if (member) {
            console.log("member details in edit modal:", member);

            setFormData({
                name: member.invitee_name || `${member.first_name} ${member.last_name}` || '',
                email: member.invitee_email || '',
                role: member.role_display || member.role || 'Co-Manager (Full control)',
                isEmergency: member.has_emergency_access || member.isEmergency || false,
            });
        }
    }, [member, visible]);

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));

        if (field === 'isEmergency' && value === true) {
            setShowEmergencyConfig(true);
        }
    };

    const handleSaveEmergencyConfig = async () => {
        try {
            if (!member || !member.id) return;
            setConfigLoading(true);

            const url = `${ApiConstants.MEMBERS}${member.id}${ApiConstants.MEMBER_EMERGENCY_ACCESS}`;

            const payload = {
                member_id: member.id,
                trigger_type: triggerType,
                inactivity_days: triggerType === 'inactivity_timer' ? inactivityDays : "0"
            };
            console.log("payload in handleSaveEmergencyConfig (Edit):", payload);

            const res = await apiPost(url, payload);
            console.log("res in handleSaveEmergencyConfig (Edit):", res.data);

            setShowEmergencyConfig(false);
        } catch (error: any) {
            console.error('Error saving emergency config (Edit):', error);
            setShowEmergencyConfig(false);
        } finally {
            setConfigLoading(false);
        }
    };

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    const renderEmergencyConfig = () => (
        <View style={styles.emergencyOverlay}>
            <View style={styles.emergencyContainer}>
                {/* Header */}
                <View style={styles.emergencyHeader}>
                    <Text style={styles.emergencyHeaderTitle} numberOfLines={1}>Emergency Access Configuration</Text>
                    <TouchableOpacity onPress={() => setShowEmergencyConfig(false)} style={styles.emergencyCloseBtn}>
                        <Image source={Icons.ic_cross} style={styles.emergencyCloseIcon} />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <ScrollView contentContainerStyle={styles.emergencyScroll}>
                    <Text style={styles.emergencySubHeader}>Define when this member gains full access to all content</Text>

                    {/* Alert Box */}
                    <View style={styles.emergencyAlertBox}>
                        <View style={styles.emergencyAlertIconContainer}>
                            <Image source={Icons.ic_info} style={styles.emergencyAlertIcon} />
                        </View>
                        <View style={styles.emergencyAlertTextContainer}>
                            <Text style={styles.emergencyAlertTitle}>Dead Man's Switch</Text>
                            <Text style={styles.emergencyAlertSub}>This member will automatically gain full access if triggered.</Text>
                        </View>
                    </View>

                    {/* Trigger Type Dropdown */}
                    <View style={[styles.inputContainer, { zIndex: 1000 }]}>
                        <Text style={styles.label}>Trigger Type</Text>
                        <TouchableOpacity
                            style={styles.dropdownButton}
                            onPress={() => setOpenTriggerDropdown(!openTriggerDropdown)}
                        >
                            <Text style={styles.inputText}>
                                {triggerType === 'inactivity_timer' ? 'Inactivity Timer' : 'Manual Unlock'}
                            </Text>
                            <Image source={Icons.ic_down_arrow} style={styles.arrowIcon} />
                        </TouchableOpacity>

                        {openTriggerDropdown && (
                            <View style={styles.dropdownList}>
                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    onPress={() => {
                                        setTriggerType('inactivity_timer');
                                        setOpenTriggerDropdown(false);
                                    }}
                                >
                                    <Text style={styles.dropdownItemText}>Inactivity Timer</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    onPress={() => {
                                        setTriggerType('manual_unlock');
                                        setOpenTriggerDropdown(false);
                                    }}
                                >
                                    <Text style={styles.dropdownItemText}>Manual Unlock</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Days of Inactivity */}
                    {triggerType === 'inactivity_timer' && (
                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { marginBottom: 10 }]}>Days of Inactivity</Text>
                            <CustomTextInput
                                label=""
                                value={inactivityDays}
                                onChangeText={setInactivityDays}
                                placeholder="--"
                                keyboardType="numeric"
                                maxLength={3}
                            />
                            <Text style={styles.inactivityInfoText}>Access will be granted after {inactivityDays} days without login.</Text>
                        </View>
                    )}

                    {/* Footer */}
                    <View style={styles.emergencyFooter}>
                        <TouchableOpacity
                            style={styles.emergencyCancelBtn}
                            onPress={() => setShowEmergencyConfig(false)}
                        >
                            <Text style={styles.emergencyCancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.emergencySaveBtn}
                            onPress={handleSaveEmergencyConfig}
                        >
                            {configLoading ? (
                                <View style={{ paddingHorizontal: 20 }}>
                                    <View style={{ transform: [{ scale: 0.8 }] }}>
                                        <Text style={styles.emergencySaveText}>Saving...</Text>
                                    </View>
                                </View>
                            ) : (
                                <Text style={styles.emergencySaveText}>Save Configuration</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </View>
    );

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType='fade'
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.headerTitle}>Edit Family Member</Text>
                            <Text style={styles.headerSubtitle}>
                                Update family member details and manage their role or permissions
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Image source={Icons.ic_cross} style={styles.closeIcon} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {/* Full Name */}
                        <CustomTextInput
                            label="Full Name"
                            value={formData.name}
                            onChangeText={(t) => handleInputChange('name', t)}
                            placeholder="Sarah Johnson"
                        />

                        {/* Email Address */}
                        <CustomTextInput
                            label="Email Address"
                            value={formData.email}
                            onChangeText={(t) => handleInputChange('email', t)}
                            placeholder="sarah@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            leftIcon={Icons.ic_mail}
                            leftIconStyle={styles.emailIcon}
                        />

                        {/* Role Dropdown */}
                        <View style={[styles.inputContainer, { zIndex: 1000 }]}>
                            <Text style={styles.label}>Role</Text>
                            <TouchableOpacity
                                style={styles.dropdownButton}
                                onPress={() => setShowRoleDropdown(!showRoleDropdown)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.inputText}>{formData.role}</Text>
                                <Image source={Icons.ic_down_arrow} style={styles.arrowIcon} />
                            </TouchableOpacity>

                            {showRoleDropdown && (
                                <View style={styles.dropdownList}>
                                    <ScrollView
                                        nestedScrollEnabled={true}
                                        showsVerticalScrollIndicator={true}
                                    >
                                        {roleOptions.map((opt, idx) => (
                                            <TouchableOpacity
                                                key={idx}
                                                style={styles.dropdownItem}
                                                onPress={() => {
                                                    handleInputChange('role', opt);
                                                    setShowRoleDropdown(false);
                                                }}
                                            >
                                                <Text style={styles.dropdownItemText}>{opt}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </View>

                        {/* Emergency Access Switch */}
                        <View style={styles.switchContainer}>
                            <Text style={styles.switchLabel}>Grant Emergency Access</Text>
                            <Switch
                                value={formData.isEmergency}
                                onValueChange={(v) => handleInputChange('isEmergency', v)}
                                trackColor={{ false: '#E0E0E0', true: ColorConstants.PRIMARY_BROWN }}
                                thumbColor={ColorConstants.WHITE}
                                style={{ transform: [{ scaleX: Platform.OS === 'ios' ? 0.8 : 1.2 }, { scaleY: Platform.OS === 'ios' ? 0.8 : 1.2 }] }}
                            />
                        </View>

                        {/* Footer Actions */}
                        <View style={styles.footer}>
                            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>

                {showEmergencyConfig && renderEmergencyConfig()}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20
    },
    modalContainer: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 24,
        maxHeight: '90%',
        overflow: 'hidden'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6'
    },
    headerTextContainer: {
        flex: 1,
        paddingRight: 12
    },
    headerTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 24,
        color: ColorConstants.BLACK2,
        marginBottom: 6
    },
    headerSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
        lineHeight: 20
    },
    closeButton: {
        padding: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 20
    },
    closeIcon: {
        width: 12,
        height: 12,
        tintColor: ColorConstants.GRAY5
    },
    scrollContent: {
        padding: 24
    },
    inputContainer: {
        marginBottom: 20
    },
    label: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.BLACK2,
        marginBottom: 10
    },
    emailIcon: {
        height: 14,
        width: 14,
        resizeMode: 'contain',
    },
    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: ColorConstants.WHITE,
        minHeight: 52
    },
    inputText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 15,
        color: ColorConstants.BLACK
    },
    arrowIcon: {
        width: 14,
        height: 14,
        tintColor: ColorConstants.GRAY,
        resizeMode: 'contain'
    },
    dropdownList: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: ColorConstants.WHITE,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        marginTop: 6,
        zIndex: 1000,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8
    },
    dropdownItem: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6'
    },
    dropdownItemText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 15,
        color: ColorConstants.BLACK
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        marginBottom: 32
    },
    switchLabel: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 16
    },
    cancelButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center'
    },
    cancelButtonText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.DARK_CYAN
    },
    saveButton: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
        alignItems: 'center'
    },
    saveButtonText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.WHITE
    },
    // Emergency Overlay Styles
    emergencyOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        zIndex: 10000,
        justifyContent: 'center',
        padding: 16
    },
    emergencyContainer: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 16,
        maxHeight: '90%',
        overflow: 'hidden'
    },
    emergencyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    emergencyHeaderTitle: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 20,
        color: ColorConstants.BLACK2,
        flex: 1
    },
    emergencyCloseBtn: {
        padding: 8,
        backgroundColor: ColorConstants.GRAY3,
        borderRadius: 20,
        marginLeft: 10
    },
    emergencyCloseIcon: {
        width: 12,
        height: 12,
        tintColor: ColorConstants.GRAY5
    },
    emergencyScroll: {
        padding: 20
    },
    emergencySubHeader: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.GRAY,
        marginBottom: 20
    },
    emergencyAlertBox: {
        flexDirection: 'row',
        backgroundColor: '#FFF7ED',
        borderWidth: 1,
        borderColor: '#FFEDD5',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24
    },
    emergencyAlertIconContainer: {
        marginRight: 12,
        marginTop: 6
    },
    emergencyAlertIcon: {
        width: 16,
        height: 16,
        tintColor: '#F97316'
    },
    emergencyAlertTextContainer: {
        flex: 1
    },
    emergencyAlertTitle: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 16,
        color: '#9A3412',
        marginBottom: 2
    },
    emergencyAlertSub: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 13,
        color: '#C2410C'
    },
    inactivityInfoText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.GRAY,
        marginTop: 4
    },
    emergencyFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        marginTop: 20
    },
    emergencyCancelBtn: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB'
    },
    emergencyCancelText: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 16,
        color: '#374151'
    },
    emergencySaveBtn: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        backgroundColor: ColorConstants.PRIMARY_BROWN
    },
    emergencySaveText: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 16,
        color: ColorConstants.WHITE
    }
});

export default EditFamilyMemberModal;
