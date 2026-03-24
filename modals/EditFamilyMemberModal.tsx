import { Icons } from '@/assets';
import CustomTextInput from '@/components/CustomTextInput';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import React, { useEffect, useState } from 'react';
import {
    Image,
    Modal,
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

    useEffect(() => {
        if (member) {
            setFormData({
                name: member.invitee_name || `${member.first_name} ${member.last_name}` || member.name || '',
                email: member.invitee_email || member.email || '',
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
    };

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

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
                                style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }}
                            />
                        </View>

                        {/* Footer Actions */}
                        <View style={styles.footer}>
                            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                <Text style={styles.saveButtonText}>Send Invitation</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
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
    }
});

export default EditFamilyMemberModal;
