import { apiPost } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import CommonButton from '@/components/CommonButton';
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
    View,
} from 'react-native';

interface SendProposalModalProps {
    visible: boolean;
    onClose: () => void;
    onSend?: () => void;
    clientId?: number;
    clientName?: string;
}

const SendProposalModal: React.FC<SendProposalModalProps> = ({
    visible,
    onClose,
    onSend,
    clientId,
    clientName
}) => {
    // New fields based on design
    const [serviceTitle, setServiceTitle] = useState('');
    const [description, setDescription] = useState('');
    const [estimatedAmount, setEstimatedAmount] = useState('');
    const [validForDays, setValidForDays] = useState(''); // Default based on image
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleInputChange = (field: string, value: string) => {
        if (field === 'serviceTitle') setServiceTitle(value);
        if (field === 'description') setDescription(value);
        if (field === 'estimatedAmount') setEstimatedAmount(value);
        if (field === 'validForDays') setValidForDays(value);

        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!serviceTitle.trim()) newErrors.serviceTitle = 'Service title is required';
        if (!description.trim()) newErrors.description = 'Description is required';
        if (!estimatedAmount.trim()) newErrors.estimatedAmount = 'Estimated amount is required';
        if (!validForDays.trim()) newErrors.validForDays = 'Valid days is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSend = async () => {
        if (!clientId) {
            Alert.alert("Error", "Client ID is missing.");
            return;
        }

        if (!validate()) {
            return;
        }

        setLoading(true);

        // We need to map the new UI fields to the existing API payload structure:
        // {
        //     "service_type": string,
        //     "reminder_date": YYYY-MM-DD,
        //     "notify_before_days": number,
        //     "recurring": string,
        //     "notes": string
        // }

        // Calculate reminder date based on "Valid For" days
        // Assuming reminder date is today + validForDays
        const days = parseInt(validForDays, 10) || 14;
        const today = new Date();
        const reminderDate = new Date(today);
        reminderDate.setDate(today.getDate() + days);
        const formattedDate = reminderDate.toISOString().split('T')[0];

        // Combine description and amount into notes for now, or just use description
        // If the backend doesn't support 'amount', we'll append it to notes.
        let detailedNotes = description;
        if (estimatedAmount) {
            detailedNotes += `\nEstimated Amount: ${estimatedAmount}`;
        }

        const payload = {
            service_type: serviceTitle, // Map Service Title to service_type
            reminder_date: formattedDate, // Map Valid For to reminder_date (expiration)
            notify_before_days: days, // Map Valid For to notify_before_days
            recurring: 'one_time', // Fixed value
            notes: detailedNotes // Map Description (+ Amount) to notes
        };

        try {
            const url = `${ApiConstants.VENDOR_CLIENT_REMINDERS}${clientId}/reminders/`;
            const response = await apiPost(url, payload);

            if (response.status === 200 || response.status === 201) {
                Alert.alert("Success", "Proposal sent successfully.");
                if (onSend) onSend();
                onClose();
            } else {
                Alert.alert("Error", "Failed to send proposal.");
            }
        } catch (error) {
            console.error("API Error:", error);
            Alert.alert("Error", "An error occurred while sending the proposal.");
        } finally {
            setLoading(false);
        }
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
                            <Text style={styles.headerTitle}>Send Service Proposal</Text>
                            <Text style={styles.headerSubtitle}>Create and send a proposal to {clientName || 'Client'}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Image source={Icons.ic_cross} style={styles.closeIcon} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>

                        <CustomTextInput
                            label="Service Title"
                            placeholder="e.g., Annual Plumbing Inspection"
                            value={serviceTitle}
                            onChangeText={(val) => handleInputChange('serviceTitle', val)}
                            error={errors.serviceTitle}
                        />

                        <CustomTextInput
                            label="Description"
                            placeholder="Detailed Description on the service proposal..."
                            value={description}
                            onChangeText={(val) => handleInputChange('description', val)}
                            multiline={true}
                            inputStyles={{ minHeight: 120, textAlignVertical: 'top' }}
                            error={errors.description}
                        />

                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 10 }}>
                                <CustomTextInput
                                    label="Estimated Amount"
                                    placeholder="0.00"
                                    value={estimatedAmount}
                                    onChangeText={(val) => handleInputChange('estimatedAmount', val)}
                                    keyboardType="numeric"
                                    error={errors.estimatedAmount}
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <CustomTextInput
                                    label="Valid For (days)"
                                    placeholder="Enter days"
                                    value={validForDays}
                                    onChangeText={(val) => handleInputChange('validForDays', val)}
                                    keyboardType="numeric"
                                    error={errors.validForDays}
                                />
                            </View>
                        </View>

                        {/* Footer Actions */}
                        <View style={styles.footer}>
                            <TouchableOpacity style={styles.draftBtn} onPress={onClose}>
                                <Text style={styles.draftText}>Cancel</Text>
                            </TouchableOpacity>
                            <CommonButton
                                title={loading ? "Sending..." : "Send Proposal"}
                                onPress={handleSend}
                                containerStyle={styles.sendBtn}
                            />
                        </View>
                    </ScrollView>
                </View>
            </View>
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={ColorConstants.PRIMARY_BROWN} />
                </View>
            )}
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
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        zIndex: 10,
    },
    container: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 16,
        padding: 20,
        maxHeight: '90%',
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
        fontSize: 14,
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
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 12,
        marginTop: 20,
    },
    draftBtn: {
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        height: 48,
        justifyContent: 'center'
    },
    draftText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.BLACK2,
    },
    sendBtn: {
        marginTop: 0,
        marginBottom: 0,
        width: undefined,
        paddingHorizontal: 24,
        height: 48,
        borderRadius: 8,
    },
});

export default SendProposalModal;
