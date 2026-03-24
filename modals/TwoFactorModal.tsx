import { apiGet } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import CustomTextInput from '@/components/CustomTextInput';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Clipboard,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface TwoFactorModalProps {
    visible: boolean;
    onClose: () => void;
    onEnable: () => void;
}

const TwoFactorModal: React.FC<TwoFactorModalProps> = ({
    visible,
    onClose,
    onEnable
}) => {
    const [step, setStep] = useState(1);
    const [verificationCode, setVerificationCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [manualCode, setManualCode] = useState('');

    useEffect(() => {
        if (visible) {
            fetch2FASetup();
        }
    }, [visible]);

    const fetch2FASetup = async () => {
        try {
            setLoading(true);
            const response = await apiGet(ApiConstants.SETUP_2FA);
            if (response.data && response.data.success) {
                setQrCode(response.data.qr_code_base64);
                setManualCode(response.data.manual_code);
            } else {
                Alert.alert('Error', 'Failed to initialize 2FA setup');
            }
        } catch (error) {
            console.error('Error fetching 2FA setup:', error);
            Alert.alert('Error', 'Something went wrong while setting up 2FA');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        Clipboard.setString(manualCode);
        Alert.alert('Copied', 'Manual code copied to clipboard');
    };

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);
    const handleClose = () => {
        setStep(1);
        onClose();
    };

    const renderSetupView = () => (
        <View style={styles.viewContainer}>
            <View style={styles.header}>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>Set Up Two-Factor Authentication</Text>
                    <Text style={styles.headerSubtitle}>Add an extra layer of security to your account with 2FA</Text>
                </View>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                    <Image source={Icons.ic_cross} style={styles.closeIcon} />
                </TouchableOpacity>
            </View>

            <View style={styles.warningBox}>
                <Image source={Icons.ic_info} style={styles.warningIcon} />
                <Text style={styles.warningText}>
                    Save your backup codes in a safe place. You'll need them if you lose access to your authenticator app.
                </Text>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.continueBtn} onPress={handleNext}>
                    <Text style={styles.continueBtnText}>Continue</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderScanQRView = () => (
        <View style={styles.viewContainer}>
            <View style={styles.header}>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>Scan QR Code</Text>
                    <Text style={styles.headerSubtitle}>Use an authenticator app like Google Authenticator or Authy</Text>
                </View>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                    <Image source={Icons.ic_cross} style={styles.closeIcon} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={[styles.qrContainer, { height: 180, width: 180 }]}>
                    <ActivityIndicator size="large" color={ColorConstants.PRIMARY_BROWN} />
                </View>
            ) : (
                <View style={styles.qrContainer}>
                    <Image source={{ uri: qrCode }} style={styles.qrImage} />
                </View>
            )}

            <View style={styles.manualEntryContainer}>
                <Text style={styles.manualLabel}>Or enter this code manually</Text>
                <View style={styles.manualInputRow}>
                    <View style={styles.manualInput}>
                        {loading ? (
                            <ActivityIndicator size="small" color={ColorConstants.PRIMARY_BROWN} />
                        ) : (
                            <Text style={styles.manualEntryCode} numberOfLines={1}>{manualCode}</Text>
                        )}
                    </View>
                    <TouchableOpacity style={styles.copyBtn} onPress={copyToClipboard} disabled={loading}>
                        <Image source={Icons.ic_copy} style={styles.copyIcon} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.cancelBtn} onPress={handleBack}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.continueBtn} onPress={handleNext} disabled={loading || !qrCode}>
                    <Text style={styles.continueBtnText}>Next</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderVerifyCodeView = () => (
        <View style={styles.viewContainer}>
            <View style={styles.header}>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>Verify Code</Text>
                    <Text style={styles.headerSubtitle}>Enter the 6-digit code from your authenticator app</Text>
                </View>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                    <Image source={Icons.ic_cross} style={styles.closeIcon} />
                </TouchableOpacity>
            </View>

            <View style={styles.verifyContainer}>
                <CustomTextInput
                    label="Verification Code"
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    placeholder="0 0 0 0 0 0"
                    keyboardType="numeric"
                    maxLength={6}
                    inputStyles={{ textAlign: 'center', letterSpacing: 8, fontSize: 18 }}
                />
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.cancelBtn} onPress={handleBack}>
                    <Text style={styles.cancelBtnText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.verifyBtn} onPress={onEnable}>
                    <Text style={styles.verifyBtnText}>Verify & Enable</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    {step === 1 && renderSetupView()}
                    {step === 2 && renderScanQRView()}
                    {step === 3 && renderVerifyCodeView()}
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
        overflow: 'hidden',
    },
    viewContainer: {
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
    warningBox: {
        flexDirection: 'row',
        backgroundColor: ColorConstants.ORANGE10,
        borderWidth: 1,
        borderColor: ColorConstants.ORANGE,
        borderRadius: 14,
        padding: 16,
        marginBottom: 24,
    },
    warningIcon: {
        width: 18,
        height: 18,
        tintColor: ColorConstants.GRAY,
        marginRight: 12,
        marginTop: 2,
    },
    warningText: {
        flex: 1,
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
        lineHeight: 20,
    },
    qrContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
        padding: 15,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        borderRadius: 12,
        alignSelf: 'center',
    },
    qrImage: {
        width: 150,
        height: 150,
    },
    manualEntryContainer: {
        marginBottom: 24,
    },
    manualLabel: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        marginBottom: 10,
    },
    manualInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    manualInput: {
        flex: 1,
        height: 42,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 10,
        paddingHorizontal: 12,
        justifyContent: 'center',
    },
    manualEntryCode: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.GRAY,
    },
    copyBtn: {
        width: 44,
        height: 40,
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    copyIcon: {
        width: 18,
        height: 18,
        tintColor: ColorConstants.WHITE,
    },
    verifyContainer: {
        marginBottom: 24,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    cancelBtn: {
        height: 44,
        paddingHorizontal: 20,
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
    continueBtn: {
        height: 44,
        paddingHorizontal: 24,
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    continueBtnText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.WHITE,
    },
    verifyBtn: {
        height: 44,
        paddingHorizontal: 24,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    verifyBtnText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.DARK_CYAN,
    },
});

export default TwoFactorModal;
