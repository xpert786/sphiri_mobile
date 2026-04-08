import { Icons } from '@/assets';
import AppDropdown from '@/components/AppDropdown';
import CommonButton from '@/components/CommonButton';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import * as DocumentPicker from 'expo-document-picker';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface UploadClientDocumentModalProps {
    visible: boolean;
    onClose: () => void;
    onUpload: (data: any) => void;
}

const UploadClientDocumentModal: React.FC<UploadClientDocumentModalProps> = ({
    visible,
    onClose,
    onUpload,
}) => {
    const [docType, setDocType] = useState('');
    const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            setDocType('');
            setSelectedFile(null);
        }
    }, [visible]);

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'image/jpeg',
                    'image/png'
                ],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setSelectedFile(result.assets[0]);
            }
        } catch (err) {
            console.error('Error picking document:', err);
        }
    };

    const handleUpload = () => {
        if (!docType) {
            Alert.alert('Error', 'Please select a document type');
            return;
        }
        if (!selectedFile) {
            Alert.alert('Error', 'Please select a file to upload');
            return;
        }
        onUpload({ docType, selectedFile });
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.headerTitle}>Upload Documents</Text>
                            <Text style={styles.headerSubtitle}>Upload service reports, invoices, or warranties for John Smith</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Image source={Icons.ic_cross} style={styles.closeIcon} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ zIndex: 3000, marginBottom: 20 }}>
                        <AppDropdown
                            label="Document Type"
                            placeholder="Select document type"
                            data={['Service Report', 'Invoice', 'Warranty', 'Receipt', 'Agreement', 'Other']}
                            value={docType}
                            onSelect={setDocType}
                            zIndex={3000}
                        />
                    </View>

                    {/* Upload Area */}
                    {!selectedFile ? (
                        <TouchableOpacity style={styles.uploadArea} onPress={pickDocument}>
                            <Image source={Icons.ic_upload2} style={styles.uploadIcon} />
                            <Text style={styles.uploadTitle}>Click To Upload</Text>
                            <Text style={styles.uploadSubtitle}>PDF, DOC, XLS, JPG, PNG up to 10MB each</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.fileCard}>
                            <View style={styles.fileInfoRow}>
                                <View style={styles.fileIconWrapper}>
                                    <Image source={Icons.ic_file_corner} style={styles.fileIcon} />
                                </View>
                                <View style={styles.fileDetails}>
                                    <Text style={styles.fileName} numberOfLines={1}>{selectedFile.name}</Text>
                                    <Text style={styles.fileSize}>{(selectedFile.size || 0 / 1024).toFixed(2)} KB</Text>
                                </View>
                                <TouchableOpacity onPress={() => setSelectedFile(null)} style={styles.removeFileBtn}>
                                    <Image source={Icons.ic_cross} style={styles.removeFileIcon} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Footer Actions */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <CommonButton
                            title="Upload Files" // Changed color in styles to match screenshot (light brownish)
                            onPress={handleUpload}
                            containerStyle={styles.uploadBtn}
                        // Using a custom style for "Upload Files" to match screenshot if it's different from primary
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20
    },
    container: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 16,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    headerTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 20,
        color: ColorConstants.BLACK2,
    },
    headerSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.GRAY,
        marginTop: 4,
    },
    closeBtn: {
        padding: 10,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        marginLeft: 10,
    },
    closeIcon: {
        width: 12,
        height: 12,
        tintColor: ColorConstants.GRAY5,
    },
    uploadArea: {
        borderWidth: 2,
        borderColor: ColorConstants.GRAY2,
        borderStyle: 'dashed',
        borderRadius: 12,
        backgroundColor: ColorConstants.LIGHT_PEACH3, // Light gray background
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        marginBottom: 20,
    },
    uploadIcon: {
        width: 40,
        height: 40,
        marginBottom: 16,
        tintColor: ColorConstants.BLACK2
    },
    uploadTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.BLACK2,
        marginBottom: 8,
        textAlign: 'center'
    },
    uploadSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
        textAlign: 'center'
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 12,
    },
    cancelBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        height: 36,
        justifyContent: 'center'
    },
    cancelText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    uploadBtn: {
        marginTop: 0,
        marginBottom: 0,
        width: undefined,
        paddingHorizontal: 20,
        backgroundColor: '#A07E6E', // Lighter brown from screenshot
    },
    fileCard: {
        borderWidth: 1,
        borderColor: ColorConstants.GRAY2,
        borderRadius: 12,
        padding: 12,
        marginBottom: 20,
        backgroundColor: '#F9FAFB',
    },
    fileInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    fileIconWrapper: {
        width: 32,
        height: 32,
        backgroundColor: ColorConstants.LIGHT_PEACH3,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fileIcon: {
        width: 16,
        height: 16,
        tintColor: ColorConstants.PRIMARY_BROWN,
    },
    fileDetails: {
        flex: 1,
        marginLeft: 12,
    },
    fileName: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    fileSize: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.GRAY,
        marginTop: 2,
    },
    removeFileBtn: {
        padding: 8,
    },
    removeFileIcon: {
        width: 10,
        height: 10,
        tintColor: ColorConstants.GRAY5,
    },
});

export default UploadClientDocumentModal;
