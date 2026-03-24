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
    View
} from 'react-native';
import Toast from 'react-native-toast-message';

interface ReplyModalProps {
    visible: boolean;
    ticketId: string;
    onClose: () => void;
    onSubmit: (message: string, attachments: any[]) => void;
}

export default function ReplyModal({ visible, ticketId, onClose, onSubmit }: ReplyModalProps) {
    const [message, setMessage] = useState('');
    const [attachments, setAttachments] = useState<DocumentPicker.DocumentPickerAsset[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddFiles = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                multiple: true,
                type: '*/*',
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

    const handleSendReply = async () => {
        if (!message.trim()) return;

        try {
            setIsSubmitting(true);
            const formData = new FormData();
            formData.append('message', message);

            if (attachments.length > 0) {
                attachments.forEach((file) => {
                    formData.append('attachments', {
                        uri: Platform.OS === 'android' ? file.uri : file.uri.replace('file://', ''),
                        type: file.mimeType || 'application/octet-stream',
                        name: file.name,
                    } as any);
                });
            }

            const response = await apiPost(`${ApiConstants.SUPPORT_TICKETS}${ticketId}${ApiConstants.REPLY_TICKET}`, formData, { isFormData: true });
            console.log("response in reply message:", response.data);


            if (response.status === 200 || response.status === 201) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Reply added successfully',
                });
                onSubmit(message, attachments);
                handleClose();
            }
        } catch (error: any) {
            console.error('Error sending reply:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error?.response?.data?.message || 'Failed to send reply. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setMessage('');
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
                            <Text style={styles.modalTitle}>Reply To Ticket</Text>
                            <Text style={styles.modalSubtitle}>Send your response</Text>
                        </View>
                        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                            <Ionicons name="close" size={20} color={ColorConstants.DARK_CYAN || '#000'} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {/* Message Input */}
                        <CustomTextInput
                            label="Your Message"
                            value={message}
                            onChangeText={setMessage}
                            placeholder="Type your response here..."
                            multiline={true}
                            multiStyles={{ minHeight: 120, paddingTop: 12 }}
                        />

                        {/* Attachments Section */}
                        <View style={styles.attachmentsSection}>
                            <Text style={styles.label}>Attachments</Text>
                            <TouchableOpacity style={styles.uploadButton} onPress={handleAddFiles}>
                                <Ionicons name="attach" size={18} color={ColorConstants.BLACK2 || '#333'} style={{ transform: [{ rotate: '45deg' }] }} />
                                <Text style={styles.uploadButtonText}>Add Attachments</Text>
                            </TouchableOpacity>

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
                                styles.btnReply,
                                (!message.trim() || isSubmitting) && styles.btnReplyDisabled
                            ]}
                            onPress={handleSendReply}
                            disabled={!message.trim() || isSubmitting}
                        >
                            <Text style={styles.btnReplyText}>
                                {isSubmitting ? 'Sending...' : 'Send Reply'}
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
        maxHeight: '80%',
        paddingHorizontal: 20,
        paddingTop: 24,
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
        marginBottom: 8,
        marginTop: 10,
    },
    attachmentsSection: {
        marginTop: 10,
        marginBottom: 20,
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 8,
        alignSelf: 'flex-start',
    },
    uploadButtonText: {
        fontFamily: Fonts.interMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
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
        borderTopColor: ColorConstants.GRAY3,
        paddingTop: 16,
        gap: 12,
    },
    btnCancel: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
    },
    btnCancelText: {
        fontFamily: Fonts.interMedium,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN || '#000',
    },
    btnReply: {
        backgroundColor: ColorConstants.PRIMARY_BROWN, // similar shade to Send Reply in screenshot
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    btnReplyDisabled: {
        opacity: 0.6,
    },
    btnReplyText: {
        fontFamily: Fonts.interMedium,
        fontSize: 14,
        color: ColorConstants.WHITE,
    },
});
