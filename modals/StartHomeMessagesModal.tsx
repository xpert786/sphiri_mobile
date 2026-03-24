import { apiGet, apiPost } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import CustomTextInput from '@/components/CustomTextInput';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';

interface Vendor {
    id: number;
    name: string;
    business_name?: string;
    email: string;
    category: string;
}

interface StartHomeMessagesModalProps {
    visible: boolean;
    onClose: () => void;
    onStart: (newConversation: any) => void;
}

const StartHomeMessagesModal: React.FC<StartHomeMessagesModalProps> = ({ visible, onClose, onStart }) => {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(false);
    const [starting, setStarting] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [subject, setSubject] = useState('');
    const [initialMessage, setInitialMessage] = useState('')

    useEffect(() => {
        if (visible) {
            fetchVendors();
        } else {
            // Reset state when closing
            setSelectedVendor(null);
            setSubject('');
            setInitialMessage('');
        }
    }, [visible]);

    const fetchVendors = async () => {
        setLoading(true);
        try {
            const response = await apiGet(`${ApiConstants.LIST_OF_VENDORS}`);
            console.log("response in fetchVendors:", response.data);

            if (response.data && response.data.vendors) {
                setVendors(response.data.vendors);
            }
        } catch (error) {
            console.error("Failed to fetch vendors for modal:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStart = async () => {
        console.log("selectedVendor", selectedVendor);

        if (selectedVendor && subject.trim()) {
            setStarting(true);
            try {
                const payload = {
                    vendor_profile_id: selectedVendor.id,
                    subject: subject.trim(),
                    message: initialMessage.trim()
                };
                console.log("payload in handleStart:", payload);

                const response = await apiPost(ApiConstants.START_CONVERSATION, payload);
                console.log("response in handleStart conersation:", response.data);
                if (response.data.message == 'Existing conversation found.') {
                    Toast.show({
                        type: 'error',
                        text1: 'Existing conversation found.',
                    });
                    return;
                }

                if (response.data && response.data.conversation) {
                    onStart(response.data.conversation);
                }
            } catch (error: any) {
                console.error("Failed to start conversation:", error);
                console.log("error?.response?.status", error?.response?.status);

                if (error?.response?.status === 404) {
                    console.log("error?.response", error?.response);

                    const errorMessage = error?.response?.data?.error || "Something went wrong";
                    Toast.show({
                        type: 'error',
                        text1: errorMessage,
                    });
                } else {
                    const errorMessage = error?.response?.data?.message || "Something went wrong";
                    Toast.show({
                        type: 'error',
                        text1: errorMessage,
                    });
                }
            } finally {
                setStarting(false);
            }
        }
    };

    const renderVendorItem = ({ item }: { item: Vendor }) => {
        const isSelected = selectedVendor?.id === item.id;
        return (
            <TouchableOpacity
                style={styles.clientItem}
                onPress={() => setSelectedVendor(item)}
                activeOpacity={0.7}
            >
                <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]}>
                    {isSelected && <View style={styles.radioButtonInner} />}
                </View>
                <View style={styles.clientInfo}>
                    <Text style={styles.clientName}>{item.business_name || item.name}</Text>
                    <Text style={styles.clientEmail}>{item.email}</Text>
                    <Text style={styles.clientPhone}>{item.category}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    style={styles.keyboardView}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.modalContent}>
                            {/* Header */}
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Start New Conversation</Text>
                                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                    <Image source={Icons.ic_cross} style={styles.closeIcon} />
                                </TouchableOpacity>
                            </View>

                            {/* Vendor Selection */}
                            <Text style={styles.label}>Select Vendor *</Text>
                            <View style={styles.clientListContainer}>
                                {loading ? (
                                    <ActivityIndicator size="small" color={ColorConstants.DARK_CYAN} style={{ padding: 20 }} />
                                ) : (
                                    <FlatList
                                        data={vendors}
                                        renderItem={renderVendorItem}
                                        keyExtractor={(item, index) => `${index}`}
                                        showsVerticalScrollIndicator={true}
                                        contentContainerStyle={styles.listContent}
                                    />
                                )}
                            </View>

                            {/* Subject field */}
                            <View style={{ marginTop: 20 }}>
                                <CustomTextInput
                                    label="Subject"
                                    placeholder="What's this about?"
                                    value={subject}
                                    onChangeText={setSubject}
                                />
                            </View>
                            <CustomTextInput
                                label="Initial message"
                                placeholder="Introduce yourself and describe what you need help with.."
                                value={initialMessage}
                                onChangeText={setInitialMessage}
                                multiline
                            />

                            {/* Footer */}
                            <View style={styles.modalFooter}>
                                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.startButton,
                                        (!selectedVendor || !subject.trim() || starting) && styles.startButtonDisabled
                                    ]}
                                    onPress={handleStart}
                                    disabled={!selectedVendor || !subject.trim() || starting}
                                >
                                    {starting ? (
                                        <ActivityIndicator size="small" color={ColorConstants.WHITE} />
                                    ) : (
                                        <Text style={styles.startButtonText}>Start Conversation</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    keyboardView: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContent: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 500,
        // maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 20,
        color: ColorConstants.BLACK2,
    },
    closeButton: {
        padding: 6,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
    },
    closeIcon: {
        width: 12,
        height: 12,
        tintColor: ColorConstants.GRAY,
    },
    label: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.GRAY,
        marginBottom: 8,
    },
    clientListContainer: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        height: 250,
        overflow: 'hidden',
    },
    listContent: {
        padding: 4,
    },
    clientItem: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'flex-start',
    },
    radioButton: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 1,
        borderColor: '#9CA3AF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        marginTop: 4,
    },
    radioButtonSelected: {
        borderColor: ColorConstants.DARK_CYAN,
    },
    radioButtonInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: ColorConstants.DARK_CYAN,
    },
    clientInfo: {
        flex: 1,
    },
    clientName: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 16,
        color: ColorConstants.BLACK,
        marginBottom: 2,
    },
    clientEmail: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 13,
        color: ColorConstants.GRAY,
        marginBottom: 2,
    },
    clientPhone: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: '#9CA3AF',
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: 24,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 16,
        color: ColorConstants.BLACK2,
    },
    startButton: {
        flex: 1.5,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        alignItems: 'center',
    },
    startButtonDisabled: {
        opacity: 0.7,
    },
    startButtonText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 16,
        color: ColorConstants.WHITE,
    },
});

export default StartHomeMessagesModal;
