import { apiPost } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import CustomTextInput from '@/components/CustomTextInput';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';

interface RaiseTicketModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit?: (data: any) => void;
}

export default function RaiseTicketModal({ visible, onClose, onSubmit }: RaiseTicketModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [showPriorityOptions, setShowPriorityOptions] = useState(false);
    const [attachments, setAttachments] = useState<DocumentPicker.DocumentPickerAsset[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const priorities = ['Low', 'Medium', 'High'];

    const handleAddFiles = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                multiple: true, // Allow multiple file selection
                type: '*/*', // Allow all file types (images, docs, etc.)
            });

            if (!result.canceled && result.assets) {
                setAttachments([...attachments, ...result.assets]);
            }
        } catch (error) {
            console.log('Error picking document:', error);
        }
    };

    const removeAttachment = (indexToRemove: number) => {
        setAttachments(attachments.filter((_, index) => index !== indexToRemove));
    };

    const handleCreateTicket = async () => {
        if (!title.trim() || !description.trim()) return;

        try {
            setIsSubmitting(true);
            const formData = new FormData();
            formData.append('ticket_title', title);
            formData.append('description', description);
            formData.append('priority', priority.toLowerCase());

            if (attachments.length > 0) {
                // Using the first attachment as the API seems to expect 'attachment' (singular) 
                // but usually handled as a list in multipart if multiple keys are same or backend logic allows.
                // Assuming singular based on payload keys provided.
                const file = attachments[0];
                formData.append('attachment', {
                    uri: Platform.OS === 'android' ? file.uri : file.uri.replace('file://', ''),
                    type: file.mimeType || 'application/octet-stream',
                    name: file.name,
                } as any);
            }

            const response = await apiPost(ApiConstants.RAISE_TICKET, formData, { isFormData: true });

            if (response.status === 201 || response.status === 200) {
                Toast.show({
                    type: 'success',
                    text1: 'Ticket Raised',
                    text2: 'Your support ticket has been created successfully.',
                });

                if (onSubmit) {
                    onSubmit(response.data);
                }
                handleClose();
            }
        } catch (error: any) {
            console.error('Error raising ticket:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error?.response?.data?.message || 'Failed to raise ticket. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        // Reset states
        setTitle('');
        setDescription('');
        setPriority('Medium');
        setAttachments([]);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.modalOverlay}
            >
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.modalTitle}>Raise Support Ticket</Text>
                            <Text style={styles.modalSubtitle}>Submit a new support request</Text>
                        </View>
                        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                            <Ionicons name="close" size={20} color={ColorConstants.DARK_CYAN} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {/* Title Input */}
                        <CustomTextInput
                            label="Ticket Title *"
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Enter ticket title..."
                        />

                        {/* Priority Selection */}
                        <View style={styles.prioritySection}>
                            <Text style={styles.label}>Priority</Text>
                            <TouchableOpacity
                                style={styles.dropdownButton}
                                onPress={() => setShowPriorityOptions(!showPriorityOptions)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.dropdownText}>{priority}</Text>
                                <Ionicons name="chevron-down" size={20} color={ColorConstants.GRAY} style={{ marginTop: 2 }} />
                            </TouchableOpacity>

                            {/* Dropdown Options */}
                            {showPriorityOptions && (
                                <View style={styles.optionsContainer}>
                                    {priorities.map((item) => (
                                        <TouchableOpacity
                                            key={item}
                                            style={styles.optionItem}
                                            onPress={() => {
                                                setPriority(item);
                                                setShowPriorityOptions(false);
                                            }}
                                        >
                                            <Text style={[styles.optionText, priority === item && styles.optionTextSelected]}>{item}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* Description Input */}
                        <CustomTextInput
                            label="Description *"
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Describe your issue or request..."
                            multiline={true}
                            multiStyles={{ minHeight: 120, paddingTop: 12 }}
                        />

                        {/* Attachments Section */}
                        <View style={styles.attachmentsSection}>
                            <Text style={styles.label}>Attachments (Optional)</Text>
                            <View style={styles.attachmentActionRow}>
                                <TouchableOpacity style={styles.uploadButton} onPress={handleAddFiles}>
                                    <Ionicons name="add" size={18} color={ColorConstants.PRIMARY_BROWN} />
                                    <Text style={styles.uploadButtonText}>Add Files</Text>
                                </TouchableOpacity>
                                <Text style={styles.uploadHint}>Upload images or documents</Text>
                            </View>

                            {/* Selected Files Preview */}
                            {attachments.length > 0 && (
                                <View style={styles.fileList}>
                                    {attachments.map((file, index) => (
                                        <View key={index} style={styles.fileItem}>
                                            <Ionicons name="document-text-outline" size={16} color={ColorConstants.GRAY} />
                                            <Text style={styles.fileName} numberOfLines={1}>
                                                {file.name}
                                            </Text>
                                            <TouchableOpacity onPress={() => removeAttachment(index)} style={styles.removeFileBtn}>
                                                <Ionicons name="close-circle" size={16} color={ColorConstants.GRAY} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    </ScrollView>

                    {/* Footer Actions */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.btnCancel} onPress={handleClose}>
                            <Text style={styles.btnCancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.btnCreate,
                                (!title.trim() || !description.trim() || isSubmitting) && styles.btnCreateDisabled
                            ]}
                            onPress={handleCreateTicket}
                            disabled={!title.trim() || !description.trim() || isSubmitting}
                        >
                            <Text style={styles.btnCreateText}>
                                {isSubmitting ? 'Creating...' : 'Create Ticket'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 20,
        width: '90%',
        maxHeight: '75%',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: ColorConstants.GRAY3,
        paddingBottom: 16,
        marginBottom: 20,
    },
    headerTextContainer: {
        flex: 1,
    },
    modalTitle: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 20,
        color: ColorConstants.BLACK2,
    },
    modalSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.GRAY,
        marginTop: 4,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: ColorConstants.GRAY6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    label: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        marginBottom: 6,
    },
    prioritySection: {
        marginBottom: 12,
        zIndex: 10, // To ensure dropdown options appear above other elements if necessary
    },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 12,
        backgroundColor: ColorConstants.WHITE,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    dropdownText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
    },
    optionsContainer: {
        backgroundColor: ColorConstants.WHITE,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 12,
        marginTop: 4,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    optionItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: ColorConstants.GRAY6,
    },
    optionText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    optionTextSelected: {
        fontFamily: Fonts.ManropeBold,
        color: ColorConstants.PRIMARY_BROWN,
    },
    attachmentsSection: {
        marginBottom: 20,
    },
    attachmentActionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: ColorConstants.PRIMARY_BROWN,
        borderStyle: 'dashed',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 6,
    },
    uploadButtonText: {
        fontFamily: Fonts.interMedium,
        fontSize: 14,
        color: ColorConstants.PRIMARY_BROWN,
    },
    uploadHint: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 13,
        color: ColorConstants.GRAY,
    },
    fileList: {
        marginTop: 12,
        gap: 8,
    },
    fileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ColorConstants.GRAY6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 8,
    },
    fileName: {
        flex: 1,
        fontFamily: Fonts.mulishRegular,
        fontSize: 13,
        color: ColorConstants.DARK_CYAN,
    },
    removeFileBtn: {
        padding: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: ColorConstants.GRAY6,
        paddingTop: 16,
        gap: 12,
    },
    btnCancel: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
    },
    btnCancelText: {
        fontFamily: Fonts.interMedium,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
    },
    btnCreate: {
        backgroundColor: ColorConstants.PRIMARY_BROWN, // Muted version of PRIMARY_BROWN since the screenshot button looks a bit faded
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    btnCreateDisabled: {
        opacity: 0.6,
    },
    btnCreateText: {
        fontFamily: Fonts.interMedium,
        fontSize: 14,
        color: ColorConstants.WHITE,
    },
});
