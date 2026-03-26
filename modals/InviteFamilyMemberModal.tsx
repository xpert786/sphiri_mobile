import { apiGet, apiPost } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import CustomTextInput from '@/components/CustomTextInput';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { StringConstants } from '@/constants/StringConstants';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
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
    { id: 'can_view_reminders', title: 'Manage Tasks', sub: 'Create and edit reminders and tasks' },
    { id: 'can_view_documents', title: 'Access Documents', sub: 'View and download shared documents' },
    { id: 'can_upload_documents', title: 'Upload Documents', sub: 'Add new documents to shared folders' },
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
        relationship: '',
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
    const [membersList, setMembersList] = useState<any[]>([]);
    const [membersCount, setMembersCount] = useState(0);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Emergency Config States
    const [showEmergencyConfig, setShowEmergencyConfig] = useState(false);
    const [triggerType, setTriggerType] = useState<'inactivity_timer' | 'manual_unlock'>('inactivity_timer');
    const [inactivityDays, setInactivityDays] = useState('90');
    const [openTriggerDropdown, setOpenTriggerDropdown] = useState(false);

    // Member ID state for newly created invitee
    const [memberId, setMemberId] = useState<number | null>(null);
    const [configLoading, setConfigLoading] = useState(false);

    const [openDropdown, setOpenDropdown] = useState(false);

    useEffect(() => {
        if (visible) {
            setStep(1);
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                relationship: '',
                role: 'viewer'
            });
            setPermissions({
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
            setPersonalMessage('');
            setMemberId(null);
            setErrors({});
            setShowEmergencyConfig(false);
        }
    }, [visible]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleSelectRole = (roleId: string) => {
        handleInputChange('role', roleId);
    };

    const handleSelectRelationship = (value: string) => {
        handleInputChange('relationship', value);
        if (errors.relationship) {
            setErrors(prev => ({ ...prev, relationship: '' }));
        }
        setOpenDropdown(false);
    };

    const handleTogglePermission = (key: string) => {
        const newValue = !permissions[key as keyof typeof permissions];
        setPermissions(prev => ({ ...prev, [key as keyof typeof prev]: newValue }));

        if (key === 'has_emergency_access' && newValue) {
            setShowEmergencyConfig(true);
        }
    };

    const handleSaveEmergencyConfig = async () => {
        try {
            if (!memberId) return;

            const url = `${ApiConstants.MEMBERS}${memberId}${ApiConstants.MEMBER_EMERGENCY_ACCESS}`;

            const payload = {
                member_id: memberId,
                trigger_type: triggerType,
                inactivity_days: triggerType === 'inactivity_timer' ? inactivityDays : "0"
            };
            console.log("payload in handleSaveEmergencyConfig:", payload);

            // User specifically requested GET method with payload
            const res = await apiPost(url, payload);
            console.log("res in handleSaveEmergencyConfig:", res.data);


            setShowEmergencyConfig(false);
        } catch (error: any) {
            const status = error.response?.status;
            const errorData = error.response?.data;
            console.error('Error saving emergency config:', {
                message: error.message,
                status: status,
                data: errorData
            });
            setShowEmergencyConfig(false);
        }
    };

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email address is required';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                newErrors.email = 'Please enter a valid email address';
            }
        }
        if (!formData.relationship) newErrors.relationship = 'Please select a relationship';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    useEffect(() => {
        if (visible) {
            fetchMembers();
        }
    }, [visible]);

    const fetchMembers = async () => {
        try {
            const res = await apiGet(ApiConstants.MEMBERS);
            if (res.data) {
                setMembersList(res.data.results || []);
                setMembersCount(res.data.count || 0);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    };

    const getInitials = (name: string) => {
        if (!name) return '??';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return parts[0].substring(0, 2).toUpperCase();
    };

    const handleNext = async () => {
        if (validateStep1()) {
            try {
                setConfigLoading(true);
                const payload = {
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    invitee_email: formData.email,
                    relationship: formData.relationship.toLowerCase(),
                    role: formData.role,
                    personal_message: personalMessage,
                    can_view_contacts: true,
                    can_create_contacts: true,
                    can_view_reminders: true,
                    can_create_reminders: true,
                    can_view_documents: true,
                    can_upload_documents: true,
                    emergency_access: permissions.has_emergency_access,
                    trigger_type: triggerType,
                    inactivity_days: inactivityDays
                };

                const res = await apiPost(ApiConstants.MEMBERS, payload);
                if (res.data && res.data.id) {
                    setMemberId(res.data.id);
                    setStep(2);
                }
            } catch (error: any) {
                const status = error.response?.status;
                const errorData = error.response?.data;
                console.error("Error creating member invite:", {
                    message: error.message,
                    status: status,
                    data: errorData
                });
            } finally {
                setConfigLoading(false);
            }
        }
    };

    const handleSendInvite = () => {
        const payload = {
            member_id: memberId,
            first_name: formData.firstName,
            last_name: formData.lastName,
            invitee_email: formData.email,
            relationship: formData.relationship.toLowerCase(),
            role: formData.role,
            nickname: '',
            invitation_message: personalMessage,
            ...permissions,
            emergency_access: permissions.has_emergency_access,
        };
        console.log("payload in handleSendInvite", payload);
        onNext(payload);
    };

    const handleClose = () => {
        setStep(1); // Reset step on close
        onClose();
    };

    const renderEmergencyConfig = () => (
        <View style={styles.emergencyOverlay}>
            <View style={styles.emergencyContainer}>
                {/* Header */}
                <View style={styles.emergencyHeader}>
                    <Text style={styles.emergencyHeaderTitle}>Emergency Access Configuration</Text>
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
                            <Text style={[styles.label, { marginBottom: -20 }]}>Days of Inactivity</Text>
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
                            <Text style={styles.emergencySaveText}>Save Configuration</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </View>
    );

    // --- Renderers ---

    const renderStep1 = () => (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {/* First Name */}
                <CustomTextInput
                    label="First Name"
                    value={formData.firstName}
                    onChangeText={(t) => handleInputChange('firstName', t)}
                    placeholder="Enter first name"
                    parentStyles={{ width: '48%' }}
                    error={errors.firstName}
                />

                {/* Last Name */}
                <CustomTextInput
                    label="Last Name"
                    value={formData.lastName}
                    onChangeText={(t) => handleInputChange('lastName', t)}
                    placeholder="Enter last name"
                    parentStyles={{ width: '48%' }}
                    error={errors.lastName}
                />
            </View>

            {/* Email Address */}
            <CustomTextInput
                label="Email Address"
                value={formData.email}
                onChangeText={(t) => handleInputChange('email', t)}
                placeholder="family.member@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                rightIcon={Icons.ic_mail}
                rightIconStyle={styles.emailIcon}
                error={errors.email}
            />

            {/* Relationship Dropdown */}
            <View style={[styles.inputContainer, { zIndex: 100 }]}>
                <Text style={styles.label}>Relationship</Text>
                <TouchableOpacity
                    style={[styles.dropdownButton, errors.relationship && { borderColor: ColorConstants.RED }]}
                    onPress={() => setOpenDropdown(!openDropdown)}
                    activeOpacity={0.8}
                >
                    <Text style={[
                        styles.inputText,
                        !formData.relationship && { color: ColorConstants.GRAY }
                    ]}>
                        {formData.relationship || 'Choose Relationship'}
                    </Text>
                    <Image source={Icons.ic_down_arrow} style={styles.arrowIcon} />
                </TouchableOpacity>

                {errors.relationship ? <Text style={styles.errorText}>{errors.relationship}</Text> : null}

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
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleClose}
                    disabled={configLoading}
                >
                    <Text style={styles.cancelButtonText}>{StringConstants.CANCEL}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.nextButton, configLoading && { opacity: 0.7 }]}
                    onPress={handleNext}
                    disabled={configLoading}
                >
                    {configLoading ? (
                        <ActivityIndicator color={ColorConstants.WHITE} size="small" />
                    ) : (
                        <Text style={styles.nextButtonText}>{StringConstants.NEXT}</Text>
                    )}
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
                {/* <Text style={styles.slotsUsedText}>{membersCount} of 5 slots used</Text> */}
            </View>

            <View style={styles.membersList}>
                {membersList.map((member) => (
                    <View key={member.id} style={styles.memberCard}>
                        {/* Avatar */}
                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarText}>{getInitials(member.invitee_name)}</Text>
                        </View>

                        {/* Info */}
                        <View style={styles.memberInfo}>
                            <Text style={styles.memberName}>{member.invitee_name}</Text>
                            <View style={styles.memberRoleRow}>
                                <Text style={styles.memberRelation}>{member.relationship_display}</Text>
                                <View style={styles.roleBadgeContainer}>
                                    <Text style={[
                                        styles.memberRoleBadgeText,
                                        member.role === 'editor' && { color: ColorConstants.ORANGE },
                                        member.role === 'co_manager' && { color: ColorConstants.PRIMARY_BROWN },
                                        member.role === 'viewer' && { color: ColorConstants.DARK_CYAN }
                                    ]}>
                                        {member.role_display}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Status & Actions */}
                        <View style={styles.memberStatusCol}>
                            <View style={[
                                styles.statusBadge,
                                (member.status === 'active' || member.status === 'accepted') ? styles.statusActive : styles.statusPending
                            ]}>
                                <Text style={[
                                    styles.statusBadgeText,
                                    (member.status === 'active' || member.status === 'accepted') ? styles.statusActiveText : styles.statusPendingText
                                ]}>
                                    {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                                </Text>
                            </View>

                            <View style={styles.memberActionsRow}>
                                {/* <TouchableOpacity style={styles.memberActionBtn}>
                                    <Image source={Icons.ic_edit} style={styles.memberActionIcon} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.memberActionBtn}>
                                    <Image source={Icons.ic_profile_group} style={styles.memberActionIcon} />
                                </TouchableOpacity> */}
                                {member.status === 'active' && (
                                    <TouchableOpacity style={styles.memberActionBtn}>
                                        <Image source={Icons.ic_delete} style={[styles.memberActionIcon, { tintColor: ColorConstants.RED }]} />
                                    </TouchableOpacity>
                                )}
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
    errorText: {
        marginTop: 4,
        fontSize: 11,
        color: ColorConstants.RED,
        fontFamily: 'Inter-Regular',
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
        backgroundColor: '#F3F4F6',
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
        fontFamily: Fonts.ManropeMedium,
        fontSize: 12,
        color: ColorConstants.GRAY,
        marginRight: 8
    },
    roleBadgeContainer: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12
    },
    memberRoleBadgeText: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 12,
        color: ColorConstants.ORANGE
    },
    memberStatusCol: {
        alignItems: 'flex-end',
        gap: 8
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center'
    },
    statusActive: {
        backgroundColor: '#ECFDF5', // Light green shade
    },
    statusPending: {
        backgroundColor: ColorConstants.ORANGE10,
    },
    statusBadgeText: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 11, // Reduced by 2px
    },
    statusActiveText: {
        color: '#10B981', // Green shade
    },
    statusPendingText: {
        color: ColorConstants.ORANGE,
    },
    memberActionsRow: {
        flexDirection: 'row',
        gap: 8
    },
    memberActionBtn: {
        backgroundColor: '#F3F4F6',
        borderRadius: 4,
        padding: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    memberActionIcon: {
        width: 14,
        height: 14,
        tintColor: ColorConstants.GRAY,
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

export default InviteFamilyMemberModal;
