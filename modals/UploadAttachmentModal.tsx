import { apiGet } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface UploadAttachmentProps {
    visible: boolean;
    onClose: () => void;
    onUpload: (formData: any) => void;
}

const UploadAttachmentModal: React.FC<UploadAttachmentProps> = ({
    visible,
    onClose,
    onUpload,
}) => {
    const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [isMedical, setIsMedical] = useState(false);
    const [propertyId, setPropertyId] = useState<number | null>(null);
    const [propertyName, setPropertyName] = useState('');
    const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
    const [properties, setProperties] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (visible) {
            fetchProperties();
            // Reset fields on open
            setSelectedFile(null);
            setIsMedical(false);
            setPropertyId(null);
            setPropertyName('');
            setIsProcessing(false);
        }
    }, [visible]);

    const fetchProperties = async () => {
        setIsLoading(true);
        try {
            const res = await apiGet(ApiConstants.PROPERTIES);
            if (res.status === 200 || res.status === 201) {
                setProperties(res.data.results || []);
            }
        } catch (error) {
            console.error('Error fetching properties:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'],
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setSelectedFile(result.assets[0]);
            }
        } catch (err) {
            console.error('Error picking document:', err);
        }
    };

    const handleUploadInternal = () => {
        if (!selectedFile) return;

        setIsProcessing(true);
        const formData = {
            file: selectedFile,
            is_medical: isMedical,
            property_id: propertyId,
        };
        onUpload(formData);
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.modalTitle}>Add Attachment</Text>
                            <Text style={styles.modalSubtitle}>Upload a file to attach to this contact</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <MaterialIcons name="close" size={20} color={ColorConstants.DARK_CYAN} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}>
                        {/* Choose File Section */}
                        <Text style={styles.inputLabel}>
                            Choose File <Text style={{ color: ColorConstants.RED }}>*</Text>
                        </Text>
                        <TouchableOpacity style={styles.dashedUploadArea} onPress={pickDocument}>
                            <MaterialIcons name="cloud-upload" size={32} color={ColorConstants.DARK_CYAN} style={{ opacity: 0.6 }} />
                            <Text style={styles.uploadTextBold}>
                                {selectedFile ? selectedFile.name : 'Click to upload'}
                            </Text>
                            <Text style={styles.uploadTextSmall}>
                                PDF, DOC, DOCX, JPG, PNG up to 10MB
                            </Text>
                        </TouchableOpacity>

                        {/* Mark as Medical Document Checkbox */}
                        <TouchableOpacity
                            style={styles.checkboxRow}
                            onPress={() => setIsMedical(!isMedical)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.checkboxBase, isMedical && styles.checkboxChecked]}>
                                {isMedical && <MaterialIcons name="check" size={14} color={ColorConstants.WHITE} />}
                            </View>
                            <Text style={styles.checkboxLabel}>Mark as Medical Document</Text>
                        </TouchableOpacity>

                        {/* Tag to Property Dropdown */}
                        <Text style={styles.inputLabel}>Tag to Property (Optional)</Text>
                        <TouchableOpacity
                            style={styles.dropdown}
                            onPress={() => setShowPropertyDropdown(!showPropertyDropdown)}
                        >
                            <Text style={[styles.dropdownText, !propertyName && { color: ColorConstants.GRAY }]}>
                                {propertyName || 'Select a property'}
                            </Text>
                            <MaterialIcons name={showPropertyDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={20} color={ColorConstants.DARK_CYAN} />
                        </TouchableOpacity>

                        {showPropertyDropdown && (
                            <View style={styles.dropdownMenu}>
                                <ScrollView nestedScrollEnabled style={{ maxHeight: 150 }}>
                                    {isLoading ? (
                                        <ActivityIndicator size="small" color={ColorConstants.PRIMARY_BROWN} style={{ margin: 10 }} />
                                    ) : (
                                        properties.map((prop) => (
                                            <TouchableOpacity
                                                key={prop.id}
                                                style={styles.dropdownItem}
                                                onPress={() => {
                                                    setPropertyId(prop.id);
                                                    setPropertyName(prop.name);
                                                    setShowPropertyDropdown(false);
                                                }}
                                            >
                                                <Text style={styles.dropdownItemText}>{prop.name}</Text>
                                            </TouchableOpacity>
                                        ))
                                    )}
                                </ScrollView>
                            </View>
                        )}
                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.uploadButton, !selectedFile && { opacity: 0.5 }]}
                            onPress={handleUploadInternal}
                            disabled={!selectedFile || isProcessing}
                        >
                            {isProcessing ? (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <ActivityIndicator size="small" color={ColorConstants.WHITE} />
                                    <Text style={[styles.uploadButtonText, { marginLeft: 8 }]}>Processing...</Text>
                                </View>
                            ) : (
                                <Text style={styles.uploadButtonText}>Upload Attachment</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        overflow: 'hidden',
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: ColorConstants.GRAY3,
    },
    modalTitle: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 18,
        color: ColorConstants.BLACK,
    },
    modalSubtitle: {
        fontFamily: Fonts.ManropeRegular,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
        marginTop: 4,
    },
    closeBtn: {
        padding: 4,
        backgroundColor: ColorConstants.GRAY3,
        borderRadius: 12,
    },
    inputLabel: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
        marginTop: 20,
        marginBottom: 8,
    },
    dashedUploadArea: {
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: ColorConstants.GRAY2,
        borderRadius: 8,
        padding: 24,
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    uploadTextBold: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
        marginTop: 7,
        textAlign: 'center'
    },
    uploadTextSmall: {
        fontFamily: Fonts.ManropeRegular,
        fontSize: 12,
        color: ColorConstants.GRAY,
        marginTop: 4,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
    },
    checkboxBase: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    checkboxChecked: {
        backgroundColor: ColorConstants.DARK_CYAN,
        borderColor: ColorConstants.DARK_CYAN,
    },
    checkboxLabel: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
    },
    dropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 48,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY2,
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    dropdownText: {
        fontFamily: Fonts.ManropeRegular,
        fontSize: 14,
        color: ColorConstants.BLACK,
    },
    dropdownMenu: {
        backgroundColor: ColorConstants.WHITE,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY2,
        borderRadius: 8,
        marginTop: 4,
        overflow: 'hidden',
    },
    dropdownItem: {
        padding: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: ColorConstants.GRAY3,
    },
    dropdownItemText: {
        fontFamily: Fonts.ManropeRegular,
        fontSize: 14,
        color: ColorConstants.BLACK,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: ColorConstants.GRAY3,
        gap: 12,
    },
    cancelButton: {
        height: 40,
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY2,
    },
    cancelButtonText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
    },
    uploadButton: {
        height: 40,
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: '#7F9394', // Match the gray-blue shade from screenshot
    },
    uploadButtonText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.WHITE,
    },
});

export default UploadAttachmentModal;
