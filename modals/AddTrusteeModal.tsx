import { apiGet, apiPatch, apiPost } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import CustomTextInput from '@/components/CustomTextInput';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';

interface AddTrusteeModalProps {
    visible: boolean;
    onClose: () => void;
    onSaveSuccess?: () => void;
    docId: string | number;
    legacyAccessId?: number | null;
    initialValues?: {
        id?: number;
        document?: number;
        name?: string;
        email?: string;
        relation_to_homeowner?: string;
        relation_display?: string;
        role?: string;
        role_display?: string;
        access_trigger?: string;
        access_trigger_display?: string;
        inactivity_days?: number;
    } | null;
}

const AddTrusteeModal: React.FC<AddTrusteeModalProps> = ({
    visible,
    onClose,
    onSaveSuccess,
    docId,
    legacyAccessId = null,
    initialValues = null,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingOptions, setIsFetchingOptions] = useState(false);
    const [options, setOptions] = useState({
        relations: [] as { value: string; label: string }[],
        roles: [] as { value: string; label: string }[],
        access_triggers: [] as { value: string; label: string }[],
    });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        relation: '',
        relation_label: '',
        role: '',
        role_label: '',
        trigger: '',
        trigger_label: '',
        inactivityDays: '',
    });

    const isEditMode = !!legacyAccessId;

    const [showRelationDropdown, setShowRelationDropdown] = useState(false);
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const [showTriggerDropdown, setShowTriggerDropdown] = useState(false);

    const [errors, setErrors] = useState({
        name: '',
        email: '',
        relation: '',
        role: '',
        trigger: '',
        inactivityDays: '',
    });

    React.useEffect(() => {
        if (visible && docId) {
            fetchOptions();
            // Clear errors when opening
            setErrors({
                name: '',
                email: '',
                relation: '',
                role: '',
                trigger: '',
                inactivityDays: '',
            });

            // Prefill values for edit
            if (initialValues) {
                setFormData(prev => ({
                    ...prev,
                    name: initialValues.name || '',
                    email: initialValues.email || '',
                    relation: initialValues.relation_to_homeowner || '',
                    relation_label: initialValues.relation_display || '',
                    role: initialValues.role || '',
                    role_label: initialValues.role_display || '',
                    trigger: initialValues.access_trigger || '',
                    trigger_label: initialValues.access_trigger_display || '',
                    inactivityDays: initialValues.inactivity_days != null ? String(initialValues.inactivity_days) : '',
                }));
            } else {
                // Reset for create
                setFormData({
                    name: '',
                    email: '',
                    relation: '',
                    relation_label: '',
                    role: '',
                    role_label: '',
                    trigger: '',
                    trigger_label: '',
                    inactivityDays: '',
                });
            }
        }
    }, [visible, docId, initialValues, legacyAccessId]);

    const fetchOptions = async () => {
        setIsFetchingOptions(true);
        try {
            const response = await apiGet(`${ApiConstants.HOMEOWNER_DOCUMENTS}${docId}/legacy-access-options/`);
            if (response.status === 200) {
                setOptions({
                    relations: response.data.relations || [],
                    roles: response.data.roles || [],
                    access_triggers: response.data.access_triggers || [],
                });
                if (!isEditMode && response.data.default_inactivity_days) {
                    setFormData(prev => ({
                        ...prev,
                        inactivityDays: String(response.data.default_inactivity_days),
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching trustee options:', error);
        } finally {
            setIsFetchingOptions(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        if (field === 'inactivityDays') {
            const sanitized = value.replace(/[^0-9]/g, '');
            setFormData(prev => ({
                ...prev,
                [field]: sanitized,
            }));
            if (errors[field as keyof typeof errors]) {
                setErrors(prev => ({ ...prev, [field]: '' }));
            }
            return;
        }

        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
        // Clear error when user types
        if (errors[field as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleSave = async () => {
        // Validation
        const inactivityNum = formData.inactivityDays ? Number(formData.inactivityDays) : NaN;
        const newErrors = {
            name: !formData.name ? 'Name is required' : '',
            email: !formData.email ? 'Email is required' : '',
            relation: !formData.relation ? 'Please select a relation' : '',
            role: !formData.role ? 'Please select a role' : '',
            trigger: !formData.trigger ? 'Please select an access trigger' : '',
            inactivityDays:
                formData.trigger === 'inactivity' && (!formData.inactivityDays || !Number.isFinite(inactivityNum) || inactivityNum <= 0)
                    ? 'Inactivity days is required'
                    : '',
        };

        setErrors(newErrors);

        const hasErrors = Object.values(newErrors).some(err => err !== '');
        if (hasErrors) return;

        try {
            setIsLoading(true);
            const days =
                formData.trigger === 'inactivity' && Number.isFinite(inactivityNum) && inactivityNum > 0
                    ? inactivityNum
                    : 30;

            // Backend expects multipart/form-data (per network payload screenshot)
            const uploadData = new FormData();
            uploadData.append('document', String(docId));
            uploadData.append('name', formData.name);
            uploadData.append('email', formData.email);
            uploadData.append('relation_to_homeowner', formData.relation);
            uploadData.append('role', formData.role);
            uploadData.append('access_trigger', formData.trigger);
            uploadData.append('inactivity_days', String(days));

            const url = isEditMode
                ? `${ApiConstants.HOMEOWNER_DOCUMENTS}${docId}/legacy-access/${legacyAccessId}/`
                : `${ApiConstants.HOMEOWNER_DOCUMENTS}${docId}/legacy-access/`;

            const response = isEditMode
                ? await apiPatch(url, uploadData, { isFormData: true })
                : await apiPost(url, uploadData, { isFormData: true });

            console.log("response", response.data);


            if (response.status === 200 || response.status === 201) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: isEditMode ? 'Trustee updated successfully' : 'Trustee added successfully'
                });
                if (onSaveSuccess) onSaveSuccess();
                onClose();
                // Reset form
                setFormData({
                    name: '',
                    email: '',
                    relation: '',
                    relation_label: '',
                    role: '',
                    role_label: '',
                    trigger: '',
                    trigger_label: '',
                    inactivityDays: '',
                });
            }
        } catch (error) {
            console.error('Error adding trustee:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to add trustee. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.headerTitle}>Add Legacy Access</Text>
                            <Text style={styles.headerSubtitle}>
                                Grant a trustee access to this document after a trigger event.
                            </Text>
                        </View>
                        {isFetchingOptions && <ActivityIndicator size="small" color={ColorConstants.PRIMARY_BROWN} />}
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Image source={Icons.ic_cross} style={styles.closeIcon} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {/* Trustee Name */}
                        <CustomTextInput
                            label="Trustee Name"
                            value={formData.name}
                            onChangeText={(t) => handleInputChange('name', t)}
                            placeholder="e.g. John Smith"
                            error={errors.name}
                        />

                        {/* Trustee Email */}
                        <CustomTextInput
                            label="Trustee Email"
                            value={formData.email}
                            onChangeText={(t) => handleInputChange('email', t)}
                            placeholder="executor@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            leftIcon={Icons.ic_mail}
                            error={errors.email}
                        />

                        {/* Relation Dropdown */}
                        <View style={[styles.inputContainer, { zIndex: 3000 }]}>
                            <Text style={styles.label}>Relation to Homeowner</Text>
                            <TouchableOpacity
                                style={styles.dropdownButton}
                                onPress={() => {
                                    setShowRelationDropdown(!showRelationDropdown);
                                    setShowRoleDropdown(false);
                                    setShowTriggerDropdown(false);
                                }}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.inputText, { color: formData.relation_label ? ColorConstants.DARK_CYAN : ColorConstants.GRAY }]}>{formData.relation_label || 'Select Relation'}</Text>
                                <Image source={Icons.ic_down_arrow} style={styles.arrowIcon} />
                            </TouchableOpacity>

                            {showRelationDropdown && (
                                <View style={styles.dropdownList}>
                                    <ScrollView
                                        style={styles.dropdownScroll}
                                        nestedScrollEnabled={true}
                                        showsVerticalScrollIndicator={true}
                                    >
                                        {options.relations.map((opt, idx) => (
                                            <TouchableOpacity
                                                key={idx}
                                                style={styles.dropdownItem}
                                                onPress={() => {
                                                    setFormData(prev => ({ ...prev, relation: opt.value, relation_label: opt.label }));
                                                    setShowRelationDropdown(false);
                                                    setErrors(prev => ({ ...prev, relation: '' }));
                                                }}
                                            >
                                                <Text style={styles.dropdownItemText}>{opt.label}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                            {errors.relation ? <Text style={styles.errorText}>{errors.relation}</Text> : null}
                        </View>

                        {/* Role Dropdown */}
                        <View style={[styles.inputContainer, { zIndex: 2000 }]}>
                            <Text style={styles.label}>Role</Text>
                            <TouchableOpacity
                                style={styles.dropdownButton}
                                onPress={() => {
                                    setShowRoleDropdown(!showRoleDropdown);
                                    setShowRelationDropdown(false);
                                    setShowTriggerDropdown(false);
                                }}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.inputText, { color: formData.role_label ? ColorConstants.DARK_CYAN : ColorConstants.GRAY }]}>{formData.role_label || 'Select Role'}</Text>
                                <Image source={Icons.ic_down_arrow} style={styles.arrowIcon} />
                            </TouchableOpacity>

                            {showRoleDropdown && (
                                <View style={styles.dropdownList}>
                                    <ScrollView
                                        style={styles.dropdownScroll}
                                        nestedScrollEnabled={true}
                                        showsVerticalScrollIndicator={true}
                                    >
                                        {options.roles.map((opt, idx) => (
                                            <TouchableOpacity
                                                key={idx}
                                                style={styles.dropdownItem}
                                                onPress={() => {
                                                    setFormData(prev => ({ ...prev, role: opt.value, role_label: opt.label }));
                                                    setShowRoleDropdown(false);
                                                    setErrors(prev => ({ ...prev, role: '' }));
                                                }}
                                            >
                                                <Text style={styles.dropdownItemText}>{opt.label}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                            {errors.role ? <Text style={styles.errorText}>{errors.role}</Text> : null}
                        </View>

                        {/* Access Trigger Dropdown */}
                        <View style={[styles.inputContainer, { zIndex: 1000 }]}>
                            <Text style={styles.label}>Access Trigger</Text>
                            <TouchableOpacity
                                style={styles.dropdownButton}
                                onPress={() => {
                                    setShowTriggerDropdown(!showTriggerDropdown);
                                    setShowRelationDropdown(false);
                                    setShowRoleDropdown(false);
                                }}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.inputText, { color: formData.trigger_label ? ColorConstants.DARK_CYAN : ColorConstants.GRAY }]}>{formData.trigger_label || 'Select Trigger'}</Text>
                                <Image source={Icons.ic_down_arrow} style={styles.arrowIcon} />
                            </TouchableOpacity>

                            {showTriggerDropdown && (
                                <View style={styles.dropdownList}>
                                    <ScrollView
                                        style={styles.dropdownScroll}
                                        nestedScrollEnabled={true}
                                        showsVerticalScrollIndicator={true}
                                    >
                                        {options.access_triggers.map((opt, idx) => (
                                            <TouchableOpacity
                                                key={idx}
                                                style={styles.dropdownItem}
                                                onPress={() => {
                                                    setFormData(prev => ({ ...prev, trigger: opt.value, trigger_label: opt.label }));
                                                    setShowTriggerDropdown(false);
                                                    setErrors(prev => ({ ...prev, trigger: '' }));
                                                }}
                                            >
                                                <Text style={styles.dropdownItemText}>{opt.label}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                            {errors.trigger ? <Text style={styles.errorText}>{errors.trigger}</Text> : null}
                        </View>

                        {/* Inactivity Days - Initially hidden, show if trigger is inactivity */}
                        {formData.trigger === 'inactivity' && (
                            <CustomTextInput
                                label="Inactivity Days"
                                value={formData.inactivityDays}
                                onChangeText={(t) => handleInputChange('inactivityDays', t)}
                                placeholder="30"
                                keyboardType="numeric"
                                error={errors.inactivityDays}
                            />
                        )}

                        {/* Footer Actions */}
                        <View style={styles.footer}>
                            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.createButton, isLoading && { opacity: 0.7 }]}
                                onPress={handleSave}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color={ColorConstants.WHITE} />
                                ) : (
                                    <Text style={styles.createButtonText}>{isEditMode ? 'Save Changes' : 'Add Trustee'}</Text>
                                )}
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
        borderRadius: 16,
        maxHeight: '90%',
        overflow: 'hidden'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0'
    },
    headerTextContainer: {
        flex: 1,
        paddingRight: 12
    },
    headerTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 20,
        color: ColorConstants.BLACK2,
        marginBottom: 4
    },
    headerSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
        lineHeight: 16
    },
    closeButton: {
        padding: 8,
        backgroundColor: '#F5F5F5',
        borderRadius: 20
    },
    closeIcon: {
        width: 12,
        height: 12,
        tintColor: ColorConstants.GRAY5
    },
    scrollContent: {
        padding: 20
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
        paddingVertical: 12,
        backgroundColor: ColorConstants.WHITE,
        minHeight: 44
    },
    inputText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 13,
        color: ColorConstants.DARK_CYAN
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
        // maxHeight: 180,
        zIndex: 1000,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    dropdownScroll: {
        // maxHeight: 180
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
    errorText: {
        marginTop: 4,
        fontSize: 11,
        color: ColorConstants.RED,
        fontFamily: 'Inter-Regular', // Matching CustomTextInput
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 10,
        gap: 12
    },
    cancelButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: ColorConstants.WHITE
    },
    cancelButtonText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.BLACK2
    },
    createButton: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8
    },
    createButtonText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.WHITE
    }
});

export default AddTrusteeModal;
