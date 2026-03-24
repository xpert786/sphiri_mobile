import { Icons } from '@/assets';
import CustomTextInput from '@/components/CustomTextInput';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { StringConstants } from '@/constants/StringConstants';
import React, { useState } from 'react';
import {
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

interface InviteFamilyMemberModalProps {
    visible: boolean;
    onClose: () => void;
    onNext: (data: any) => void;
}

const ROLES = [
    {
        id: 'viewer',
        title: 'Viewer',
        description: 'Can view shared information only',
        icon: Icons.ic_eye_filled
    },
    {
        id: 'editor',
        title: 'Editor',
        description: 'Can view and edit shared content',
        icon: Icons.ic_edit
    },
    {
        id: 'co_manager',
        title: 'Co-manager',
        description: 'Full access to manage household',
        icon: Icons.ic_crown
    }
];

const RELATIONSHIPS = ['Parent', 'Spouse', 'Child', 'Sibling', 'Other'];

const PERMISSIONS = [
    { id: 'can_view_contacts', title: 'View Contacts', sub: 'Access to vendor and family contacts' },
    { id: 'can_create_contacts', title: 'Create Contacts', sub: 'Add new contacts to the household' },
    { id: 'can_edit_contacts', title: 'Edit Contacts', sub: 'Modify existing contact information' },
    { id: 'can_delete_contacts', title: 'Delete Contacts', sub: 'Remove contacts from the household' },
    { id: 'can_view_documents', title: 'View Documents', sub: 'View and download shared documents' },
    { id: 'can_upload_documents', title: 'Upload Documents', sub: 'Add new documents to shared folders' },
    { id: 'can_edit_documents', title: 'Edit Documents', sub: 'Modify document details and versions' },
    { id: 'can_delete_documents', title: 'Delete Documents', sub: 'Remove documents from shared folders' },
    { id: 'can_view_reminders', title: 'View Reminders', sub: 'Access to shared reminders and tasks' },
    { id: 'can_create_reminders', title: 'Create Reminders', sub: 'Set new reminders and tasks' },
    { id: 'can_edit_reminders', title: 'Edit Reminders', sub: 'Modify existing reminders and tasks' },
    { id: 'can_delete_reminders', title: 'Delete Reminders', sub: 'Remove reminders and tasks' },
    { id: 'has_emergency_access', title: 'Emergency Access', sub: 'Access critical info during emergencies' },
];

const MOCK_EXISTING_MEMBERS = [
    { id: 1, name: 'Sarah Mitchell', role: 'Co-Manager', relation: 'Spouse', status: 'Active' },
    { id: 2, name: 'Sarah Mitchell', role: 'Co-Manager', relation: 'Spouse', status: 'Active' },
    { id: 3, name: 'Sarah Mitchell', role: 'Co-Manager', relation: 'Spouse', status: 'Pending' },
];

const InviteFamilyMemberModal: React.FC<InviteFamilyMemberModalProps> = ({
    visible,
    onClose,
    onNext
}) => {
    const [step, setStep] = useState(1);

    // Step 1 Form Data
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        relationship: 'Parent',
        role: 'viewer'
    });

    // Step 2 Permissions & Message
    const [permissions, setPermissions] = useState({
        can_view_contacts: true,
        can_create_contacts: false,
        can_edit_contacts: true,
        can_delete_contacts: true,
        can_view_documents: false,
        can_upload_documents: false,
        can_edit_documents: true,
        can_delete_documents: true,
        can_view_reminders: false,
        can_create_reminders: false,
        can_edit_reminders: true,
        can_delete_reminders: true,
        has_emergency_access: false
    });
    const [personalMessage, setPersonalMessage] = useState('');

    const [openDropdown, setOpenDropdown] = useState(false);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSelectRole = (roleId: string) => {
        handleInputChange('role', roleId);
    };

    const handleSelectRelationship = (value: string) => {
        handleInputChange('relationship', value);
        setOpenDropdown(false);
    };

    const handleTogglePermission = (key: string) => {
        setPermissions(prev => ({ ...prev, [key as keyof typeof prev]: !prev[key as keyof typeof prev] }));
    };

    const handleNext = () => {
        // Validate Step 1 if needed
        setStep(2);
    };

    const handleSendInvite = () => {
        const payload = {
            first_name: formData.firstName,
            last_name: formData.lastName,
            invitee_email: formData.email,
            relationship: formData.relationship.toLowerCase(),
            role: formData.role,
            nickname: '',
            invitation_message: personalMessage,
            ...permissions
        };
        onNext(payload);
    };

    const handleClose = () => {
        setStep(1); // Reset step on close
        onClose();
    };

    // --- Renderers ---

    const renderStep1 = () => (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {/* First Name */}
                <CustomTextInput
                    label="First Name *"
                    value={formData.firstName}
                    onChangeText={(t) => handleInputChange('firstName', t)}
                    placeholder="Enter first name"
                    parentStyles={{ width: '48%' }}
                />

                {/* Last Name */}
                <CustomTextInput
                    label="Last Name *"
                    value={formData.lastName}
                    onChangeText={(t) => handleInputChange('lastName', t)}
                    placeholder="Enter last name"
                    parentStyles={{ width: '48%' }}
                />
            </View>

            {/* Email Address */}
            <CustomTextInput
                label="Email Address *"
                value={formData.email}
                onChangeText={(t) => handleInputChange('email', t)}
                placeholder="family.member@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                rightIcon={Icons.ic_mail}
                rightIconStyle={styles.emailIcon}
            />

            {/* Relationship Dropdown */}
            <View style={[styles.inputContainer, { zIndex: 100 }]}>
                <Text style={styles.label}>Relationship</Text>
                <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setOpenDropdown(!openDropdown)}
                    activeOpacity={0.8}
                >
                    <Text style={styles.inputText}>{formData.relationship}</Text>
                    <Image source={Icons.ic_down_arrow} style={styles.arrowIcon} />
                </TouchableOpacity>

                {openDropdown && (
                    <View style={styles.dropdownList}>
                        {RELATIONSHIPS.map((rel, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.dropdownItem}
                                onPress={() => handleSelectRelationship(rel)}
                            >
                                <Text style={styles.dropdownItemText}>{rel}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            {/* Assign Role */}
            <Text style={styles.sectionHeader}>Assign Role</Text>
            <View style={styles.rolesContainer}>
                {ROLES.map((role) => {
                    const isSelected = formData.role === role.id;
                    return (
                        <TouchableWithoutFeedback key={role.id} onPress={() => handleSelectRole(role.id)}>
                            <View style={[
                                styles.roleCard,
                                isSelected && styles.roleCardSelected
                            ]}>
                                <View style={[
                                    styles.roleIconContainer,
                                    isSelected ? styles.roleIconContainerSelected : styles.roleIconContainerDefault
                                ]}>
                                    <Image
                                        source={role.icon}
                                        style={[
                                            styles.roleIcon,
                                            isSelected ? { tintColor: ColorConstants.WHITE } : { tintColor: ColorConstants.BLACK2 }
                                        ]}
                                    />
                                </View>
                                <Text style={styles.roleTitle}>{role.title}</Text>
                                <Text style={styles.roleDescription}>{role.description}</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    );
                })}
            </View>

            {/* Footer Buttons */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                    <Text style={styles.cancelButtonText}>{StringConstants.CANCEL}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                    <Text style={styles.nextButtonText}>{StringConstants.NEXT}</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    const renderStep2 = () => (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

            {/* Access Permissions */}
            <Text style={[styles.step2Header, { marginTop: 0 }]}>Access Permissions</Text>
            <View style={styles.permissionsContainer}>
                {PERMISSIONS.map((perm) => (
                    <View key={perm.id} style={styles.permissionRow}>
                        <View style={{ flex: 1, paddingRight: 10 }}>
                            <Text style={styles.permissionTitle}>{perm.title}</Text>
                            <Text style={styles.permissionSub}>{perm.sub}</Text>
                        </View>
                        <Switch
                            trackColor={{ false: '#E0E0E0', true: ColorConstants.PRIMARY_BROWN }}
                            thumbColor={ColorConstants.WHITE}
                            onValueChange={() => handleTogglePermission(perm.id)}
                            value={permissions[perm.id as keyof typeof permissions]}
                            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                        />
                    </View>
                ))}
            </View>

            {/* Personal Message */}
            <CustomTextInput
                label="Personal Message (Optional)"
                value={personalMessage}
                onChangeText={setPersonalMessage}
                placeholder="Add a personal note to your invitation..."
                multiline
                inputStyles={{ height: 80, alignItems: 'flex-start' }}
            />

            {/* Family Members Header */}
            <View style={styles.familyHeaderRow}>
                <Text style={styles.step2Header}>Family Members</Text>
                <Text style={styles.slotsUsedText}>3 of 5 slots used</Text>
            </View>

            <View style={styles.membersList}>
                {MOCK_EXISTING_MEMBERS.map((member) => (
                    <View key={member.id} style={styles.memberCard}>
                        {/* Avatar */}
                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarText}>SM</Text>
                        </View>

                        {/* Info */}
                        <View style={styles.memberInfo}>
                            <Text style={styles.memberName}>{member.name}</Text>
                            <View style={styles.memberRoleRow}>
                                <Text style={styles.memberRelation}>{member.relation}</Text>
                                <View style={styles.roleBadgeLight}>
                                    <Text style={styles.roleBadgeText}>{member.role}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Status & Actions */}
                        <View style={styles.memberActions}>
                            <View style={[
                                styles.statusBadge,
                                member.status === 'Active' ? styles.statusActive : styles.statusPending
                            ]}>
                                <Text style={[
                                    styles.statusText,
                                    member.status === 'Active' ? styles.statusTextActive : styles.statusTextPending
                                ]}>
                                    {member.status}
                                </Text>
                            </View>

                            <View style={styles.actionIconsRow}>
                                <TouchableOpacity style={styles.iconBtn}>
                                    <Image source={member.status === 'Pending' ? Icons.ic_refresh : Icons.ic_edit} style={styles.actionIcon} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.iconBtn}>
                                    <Image source={Icons.ic_profile_group} style={styles.actionIcon} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))}
            </View>


            {/* Footer Buttons */}
            <View style={styles.footerStep2}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                    <Text style={styles.cancelButtonText}>{StringConstants.CANCEL}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.nextButton, styles.sendButton]} onPress={handleSendInvite}>
                    <Image source={Icons.ic_send_invite} style={styles.sendIcon} />
                    <Text style={styles.nextButtonText}>Send Invite</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>
    );

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, step === 2 && styles.modalContainerStep2]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Invite Family Members</Text>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <Image source={Icons.ic_cross} style={styles.closeIcon} />
                        </TouchableOpacity>
                    </View>

                    {step === 1 ? renderStep1() : renderStep2()}
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
        paddingVertical: 50,
        paddingHorizontal: 16
    },
    modalContainer: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 16,
        maxHeight: '90%',
        overflow: 'hidden',
        width: '100%'
    },
    modalContainerStep2: {
        // Adjust for step 2 if needed
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 20,
        color: ColorConstants.BLACK2
    },
    closeButton: {
        padding: 8,
        backgroundColor: ColorConstants.GRAY3,
        borderRadius: 20
    },
    closeIcon: {
        width: 12,
        height: 12,
        tintColor: ColorConstants.GRAY5
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 30
    },
    emailIcon: {
        height: 14,
        width: 14,
        resizeMode: 'contain'
    },
    inputContainer: {
        marginBottom: 16
    },
    label: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        marginBottom: 8
    },
    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12, // Adjusted to match CustomTextInput height roughly
        backgroundColor: ColorConstants.WHITE,
        minHeight: 48 // Ensure consistency
    },
    inputText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 13, // Matched with CustomTextInput
        color: ColorConstants.DARK_CYAN // Matched with CustomTextInput
    },
    arrowIcon: {
        width: 12,
        height: 12,
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
        borderColor: '#E0E0E0',
        borderRadius: 8,
        marginTop: 4,
        zIndex: 1000,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0'
    },
    dropdownItemText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.BLACK
    },
    sectionHeader: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.BLACK2,
        marginTop: 8,
        marginBottom: 12
    },
    rolesContainer: {
        gap: 12,
        marginBottom: 24
    },
    roleCard: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        backgroundColor: ColorConstants.WHITE
    },
    roleCardSelected: {
        borderColor: ColorConstants.PRIMARY_BROWN,
        backgroundColor: '#FCF9F9'
    },
    roleIconContainer: {
        width: 30,
        height: 30,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8
    },
    roleIconContainerDefault: {
        backgroundColor: '#F5F5F5'
    },
    roleIconContainerSelected: {
        backgroundColor: ColorConstants.PRIMARY_BROWN
    },
    roleIcon: {
        width: 16,
        height: 16,
        resizeMode: 'contain'
    },
    roleTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.BLACK2,
        marginBottom: 4
    },
    roleDescription: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: '#666',
        textAlign: 'center'
    },

    // Step 2 Styles
    step2Header: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 18,
        color: ColorConstants.BLACK2,
        marginBottom: 12,
        marginTop: 10
    },
    permissionsContainer: {
        marginBottom: 12
    },
    permissionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 6,
        marginBottom: 10
    },
    permissionTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2
    },
    permissionSub: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.GRAY,
        marginTop: 2
    },
    familyHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: ColorConstants.GRAY3
    },
    slotsUsedText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN
    },
    membersList: {
        gap: 12,
        marginBottom: 20
    },
    memberCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12
    },
    avatarCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: ColorConstants.REDDISH_BROWN,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12
    },
    avatarText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2
    },
    memberInfo: {
        flex: 1
    },
    memberName: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.BLACK2
    },
    memberRoleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4
    },
    memberRelation: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.BLACK2,
        marginRight: 8
    },
    roleBadgeLight: {
        backgroundColor: ColorConstants.ORANGE10,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12
    },
    roleBadgeText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 11,
        color: ColorConstants.ORANGE
    },
    memberActions: {
        alignItems: 'flex-end',
        gap: 6
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginBottom: 4
    },
    statusActive: {
        backgroundColor: ColorConstants.GREEN10
    },
    statusPending: {
        backgroundColor: ColorConstants.ORANGE10
    },
    statusText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 11
    },
    statusTextActive: {
        color: ColorConstants.GREEN2
    },
    statusTextPending: {
        color: ColorConstants.ORANGE
    },
    actionIconsRow: {
        flexDirection: 'row',
        gap: 8
    },
    iconBtn: {
        backgroundColor: ColorConstants.GRAY3,
        borderRadius: 4,
        width: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionIcon: {
        width: 10,
        height: 10,
        tintColor: ColorConstants.BLACK2,
        resizeMode: 'contain'
    },

    // Footer
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 10
    },
    footerStep2: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    cancelButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        marginRight: 12
    },
    cancelButtonText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.DARK_CYAN
    },
    nextButton: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8
    },
    sendButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ColorConstants.PRIMARY_BROWN // Slightly darker brown for send
    },
    sendIcon: {
        marginRight: 4,
    },
    nextButtonText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.WHITE
    }
});

export default InviteFamilyMemberModal;
