import { apiPost } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import CustomTextInput from '@/components/CustomTextInput';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface ChangePasswordModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
    visible,
    onClose,
    onSuccess
}) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [currentPasswordError, setCurrentPasswordError] = useState('');
    const [newPasswordError, setNewPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const handleClose = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setCurrentPasswordError('');
        setNewPasswordError('');
        setConfirmPasswordError('');
        onClose();
    };

    const handleChangePassword = async () => {
        // Reset errors
        setCurrentPasswordError('');
        setNewPasswordError('');
        setConfirmPasswordError('');

        let hasError = false;

        if (!currentPassword) {
            setCurrentPasswordError('Current password is required');
            hasError = true;
        }

        if (!newPassword) {
            setNewPasswordError('New password is required');
            hasError = true;
        } else {
            let passwordErrors = [];
            if (newPassword.length < 8) passwordErrors.push('At least 8 characters');
            if (!/[A-Z]/.test(newPassword)) passwordErrors.push('One uppercase letter');
            if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) passwordErrors.push('One special character');

            if (passwordErrors.length > 0) {
                setNewPasswordError(passwordErrors.join('\n'));
                hasError = true;
            }
        }

        if (!confirmPassword) {
            setConfirmPasswordError('Please confirm your password');
            hasError = true;
        } else if (newPassword !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
            hasError = true;
        }

        if (hasError) return;

        setIsSubmitting(true);
        try {
            const payload = {
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword,
            };

            const response = await apiPost(ApiConstants.CHANGE_PASSWORD, payload);
            if (response.status === 200 || response.status === 201) {
                Alert.alert('Success', 'Password changed successfully');
                onSuccess();
                handleClose();
            } else {
                Alert.alert('Error', 'Failed to change password');
            }
        } catch (error: any) {
            console.error('Error changing password:', error);
            const errorMessage = error.response?.data?.message || 'An error occurred while changing your password';

            if (errorMessage.toLowerCase().includes('current password')) {
                setCurrentPasswordError(errorMessage);
            } else {
                Alert.alert('Error', errorMessage);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <ScrollView bounces={false}>
                        <View style={styles.content}>
                            <View style={styles.header}>
                                <View style={styles.headerTextContainer}>
                                    <Text style={styles.headerTitle}>Change Password</Text>
                                    <Text style={styles.headerSubtitle}>Update your password to keep your account secure</Text>
                                </View>
                                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                                    <Image source={Icons.ic_cross} style={styles.closeIcon} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.form}>
                                <CustomTextInput
                                    label="Current Password"
                                    value={currentPassword}
                                    onChangeText={(text) => {
                                        setCurrentPassword(text);
                                        setCurrentPasswordError('');
                                    }}
                                    placeholder="Enter your current password"
                                    secureTextEntry
                                    parentStyles={styles.inputSpacing}
                                    error={currentPasswordError}
                                />

                                <CustomTextInput
                                    label="New password"
                                    value={newPassword}
                                    onChangeText={(text) => {
                                        setNewPassword(text);
                                        setNewPasswordError('');
                                    }}
                                    placeholder="Enter your new password"
                                    secureTextEntry
                                    parentStyles={styles.inputSpacing}
                                    error={newPasswordError}
                                />

                                <CustomTextInput
                                    label="Confirm New Password"
                                    value={confirmPassword}
                                    onChangeText={(text) => {
                                        setConfirmPassword(text);
                                        setConfirmPasswordError('');
                                    }}
                                    placeholder="Confirm your new password"
                                    secureTextEntry
                                    parentStyles={styles.inputSpacing}
                                    error={confirmPasswordError}
                                />
                            </View>

                            {/* <View style={styles.requirementsSection}>
                                <Text style={styles.requirementsTitle}>Password requirements:</Text>
                                <View style={styles.requirementRow}>
                                    <View style={styles.dot} />
                                    <Text style={styles.requirementText}>At least 8 characters long</Text>
                                </View>
                                <View style={styles.requirementRow}>
                                    <View style={styles.dot} />
                                    <Text style={styles.requirementText}>Different from your current password</Text>
                                </View>
                                <View style={styles.requirementRow}>
                                    <View style={styles.dot} />
                                    <Text style={styles.requirementText}>Passwords must match</Text>
                                </View>
                            </View> */}

                            <View style={styles.footer}>
                                <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                                    <Text style={styles.cancelBtnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
                                    onPress={handleChangePassword}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator size="small" color={ColorConstants.WHITE} />
                                    ) : (
                                        <Text style={styles.submitBtnText}>Change password</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
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
        paddingHorizontal: 20,
    },
    modalContainer: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 24,
        maxHeight: '90%',
    },
    content: {
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    headerTextContainer: {
        flex: 1,
        paddingRight: 10,
    },
    headerTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 22,
        color: ColorConstants.BLACK2,
    },
    headerSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 13,
        color: ColorConstants.BLACK2,
        marginTop: 4,
    },
    closeButton: {
        padding: 8,
        backgroundColor: ColorConstants.GRAY_SHADE,
        borderRadius: 20,
    },
    closeIcon: {
        width: 12,
        height: 12,
        tintColor: ColorConstants.BLACK2,
    },
    form: {
        marginBottom: 20,
    },
    inputSpacing: {
        marginBottom: 16,
    },
    requirementsSection: {
        marginBottom: 30,
    },
    requirementsTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 12,
    },
    requirementRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        paddingLeft: 8,
    },
    dot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: ColorConstants.DARK_CYAN,
        marginRight: 10,
    },
    requirementText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    cancelBtn: {
        height: 36,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtnText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.DARK_CYAN,
    },
    submitBtn: {
        height: 36,
        paddingHorizontal: 12,
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitBtnText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.WHITE,
    },
});

export default ChangePasswordModal;
