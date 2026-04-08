import { apiPost } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import CustomTextInput from '@/components/CustomTextInput';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { StringConstants } from '@/constants/StringConstants';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';
import ValidationModal from './ValidationModal';

interface AddClientModalProps {
    visible: boolean;
    onClose: () => void;
    onAdd: (clientData: any) => void;
}

const AddClientModal: React.FC<AddClientModalProps> = ({ visible, onClose, onAdd }) => {
    const [newClient, setNewClient] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
        status: 'active'
    });
    const [loading, setLoading] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [showValidationModal, setShowValidationModal] = useState(false);

    const handleAdd = async () => {
        if (!newClient.name || !newClient.email || !newClient.phone || !newClient.address || !newClient.notes) {
            setAlertTitle('Please fill in required fields');
            setShowValidationModal(true);
            return;
        }
        Keyboard.dismiss();

        setLoading(true);
        try {
            const response = await apiPost(ApiConstants.VENDOR_CLIENTS, newClient);
            console.log("response in VENDOR_CLIENTS:", response.data);

            if (response.status === 201 || response.status === 200) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Client added successfully',
                });
                onAdd(response.data);
                setNewClient({ name: '', email: '', phone: '', address: '', notes: '', status: 'active' });
                onClose();
            } else {
                setAlertTitle(response.data?.message || 'Failed to add client.');
                setShowValidationModal(true);
            }
        } catch (error: any) {
            let errorMessage = 'Something went wrong. Please try again later.';
            const serverData = error.response?.data;
            if (serverData) {
                if (typeof serverData === 'string') errorMessage = serverData;
                else if (typeof serverData === 'object') {
                    errorMessage = Object.entries(serverData)
                        .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                        .join('\n');
                }
            }
            setAlertTitle(errorMessage);
            setShowValidationModal(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <ValidationModal
                visible={showValidationModal}
                onClose={() => setShowValidationModal(false)}
                alertTitle={alertTitle}
            />

            <View style={styles.modalOverlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    style={styles.keyboardView}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.modalContent}>
                            {/* Header */}
                            <View style={styles.modalHeader}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.modalTitle}>Add New Client</Text>
                                    <Text style={styles.modalSubtitle}>Enter client information to add them to your directory</Text>
                                </View>
                                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                    <Image source={Icons.ic_cross} style={styles.closeIcon} />
                                </TouchableOpacity>
                            </View>

                            {/* Scrollable Form */}
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                            >
                                <CustomTextInput
                                    label="Name"
                                    placeholder="Client name"
                                    value={newClient.name}
                                    onChangeText={(text) => setNewClient({ ...newClient, name: text })}
                                />
                                <CustomTextInput
                                    label="Email"
                                    placeholder="Enter your email"
                                    value={newClient.email}
                                    onChangeText={(text) => setNewClient({ ...newClient, email: text })}
                                    keyboardType="email-address"
                                    leftIcon={Icons.ic_mail}
                                />
                                <CustomTextInput
                                    label="Phone"
                                    placeholder="+1(555) 123-4567"
                                    value={newClient.phone}
                                    onChangeText={(text) => setNewClient({ ...newClient, phone: text })}
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                />
                                <CustomTextInput
                                    label="Address"
                                    placeholder="123 Main St, City"
                                    value={newClient.address}
                                    onChangeText={(text) => setNewClient({ ...newClient, address: text })}
                                />
                                <CustomTextInput
                                    label="Notes"
                                    placeholder="Any additional notes....."
                                    value={newClient.notes}
                                    onChangeText={(text) => setNewClient({ ...newClient, notes: text })}
                                    multiline={true}
                                    multiStyles={{ height: 100, textAlignVertical: 'top' }}
                                />
                            </ScrollView>

                            {/* Footer */}
                            <View style={styles.modalFooter}>
                                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.addButton, loading && { opacity: 0.7 }]}
                                    onPress={handleAdd}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color={ColorConstants.WHITE} size="small" />
                                    ) : (
                                        <Text style={styles.addButtonText}>{StringConstants.ADD_CLIENT}</Text>
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
        justifyContent: 'center', // Vertical center
        alignItems: 'center', // Horizontal center
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
        padding: 20,
        width: '100%',
        // maxWidth: 500,
        maxHeight: '95%', // Limit height to 80%
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    modalTitle: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 20,
        color: ColorConstants.BLACK2,
        marginBottom: 4,
    },
    modalSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.GRAY,
        maxWidth: '90%',
    },
    closeButton: {
        padding: 6,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
    },
    closeIcon: {
        width: 10,
        height: 10,
        tintColor: ColorConstants.BLACK2,
    },

    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 15,
    },
    cancelButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
    },
    cancelButtonText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    addButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: '#986054',
        minWidth: 100,
        alignItems: 'center',
    },
    addButtonText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.WHITE,
    },
});

export default AddClientModal;
