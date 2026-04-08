import { apiPost } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import CommonButton from '@/components/CommonButton';
import CustomDatePicker from '@/components/CustomDatePicker';
import CustomTextInput from '@/components/CustomTextInput';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import React, { useState } from 'react';
import {
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';

interface SetServiceReminderModalProps {
    visible: boolean;
    onClose: () => void;
    onSetReminder?: (data: any) => void;
    clientId: number;
}

const SetServiceReminderModal: React.FC<SetServiceReminderModalProps> = ({
    visible,
    onClose,
    onSetReminder,
    clientId,
}) => {
    const [serviceType, setServiceType] = useState('');
    const [reminderDate, setReminderDate] = useState<Date | null>(null);
    const [notifyDays, setNotifyDays] = useState('');
    const [recurring, setRecurring] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const clearError = (field: string) => {
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const serviceTypeOptions = ['Annual Plumbing Inspection', 'Electrical Maintaince', 'HVAC Checkup', 'General Maintaince'];
    const recurringOptions = ['One-time only', 'Quarterly', 'Monthly', 'Annually'];

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!serviceType) newErrors.serviceType = 'Service type is required';
        if (!reminderDate) newErrors.reminderDate = 'Reminder date is required';
        if (!notifyDays.trim()) newErrors.notifyDays = 'Notify days is required';
        if (!recurring) newErrors.recurring = 'Recurrence is required';
        if (!notes.trim()) newErrors.notes = 'Notes are required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSet = async () => {
        if (!clientId) {
            alert('Client ID is missing');
            return;
        }

        if (!validate()) return;
        setLoading(true);
        try {
            const recurringMap: { [key: string]: string } = {
                'One-time only': 'one_time',
                'Quarterly': 'quarterly',
                'Monthly': 'monthly',
                'Annually': 'annually'
            };

            const payload = {
                service_type: serviceType,
                reminder_date: reminderDate?.toISOString().split('T')[0],
                notify_before_days: parseInt(notifyDays) || 7,
                recurring: recurringMap[recurring] || 'one_time',
                notes: notes
            };

            const url = `${ApiConstants.VENDOR_CLIENT_REMINDERS}${clientId}/reminders/`;
            const response = await apiPost(url, payload);

            if (response.data) {
                if (onSetReminder) onSetReminder(response.data);
                Toast.show({
                    type: 'success',
                    text1: 'Reminder set successfully',
                });
                onClose();
            }
        } catch (error) {
            console.error('Failed to set reminder:', error);
            alert('Failed to set reminder. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: Date) => {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        if (selectedDate) {
            setReminderDate(selectedDate);
            clearError('reminderDate');
        }
    };

    const toggleDropdown = (key: string) => {
        setOpenDropdown(prev => (prev === key ? null : key));
    };

    const selectOption = (key: string, value: string) => {
        if (key === 'serviceType') setServiceType(value);
        if (key === 'recurring') setRecurring(value);
        clearError(key);
        setOpenDropdown(null);
    };

    const renderDropdown = (
        label: string,
        key: string,
        value: string,
        options: string[],
        zIndex: number,
        placeholder: string = 'Select option',
        error?: string
    ) => (
        <View style={[styles.inputContainer, { zIndex }]}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => toggleDropdown(key)}
                activeOpacity={0.8}
            >
                <Text style={[styles.inputText, !value && { color: ColorConstants.GRAY_50 }]}>
                    {value || placeholder}
                </Text>
                <Image source={Icons.ic_down_arrow} style={styles.arrowIcon} />
            </TouchableOpacity>

            {openDropdown === key && (
                <View style={styles.dropdownList}>
                    {options.map((opt, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={styles.dropdownItem}
                            onPress={() => selectOption(key, opt)}
                        >
                            <Text style={styles.dropdownItemText}>{opt}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );

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
                            <Text style={styles.headerTitle}>Set Service Reminder</Text>
                            <Text style={styles.headerSubtitle}>Schedule a reminder for John Smith's upcoming service</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Image source={Icons.ic_cross} style={styles.closeIcon} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                        {renderDropdown('Service Type', 'serviceType', serviceType, serviceTypeOptions, 3000, 'Select service type', errors.serviceType)}

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Reminder Date</Text>
                            <TouchableOpacity
                                style={styles.dropdownButton}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Text style={[styles.inputText, !reminderDate && { color: ColorConstants.GRAY_50 }]}>
                                    {reminderDate ? formatDate(reminderDate) : 'MM/DD/YYYY'}
                                </Text>
                                <Image source={Icons.ic_calendar_outline} style={styles.inputIcon} />
                            </TouchableOpacity>
                            {errors.reminderDate ? <Text style={styles.errorText}>{errors.reminderDate}</Text> : null}
                        </View>

                        <CustomTextInput
                            label="Notify Me before (days)"
                            placeholder="Enter number of days"
                            value={notifyDays}
                            onChangeText={(val) => {
                                setNotifyDays(val);
                                clearError('notifyDays');
                            }}
                            keyboardType="numeric"
                            error={errors.notifyDays}
                        />

                        {renderDropdown('Recurring', 'recurring', recurring, recurringOptions, 2000, 'Select recurrence', errors.recurring)}

                        <CustomTextInput
                            label="Notes"
                            placeholder="Add any specific note for this reminder..."
                            value={notes}
                            onChangeText={(val) => {
                                setNotes(val);
                                clearError('notes');
                            }}
                            multiline={true}
                            inputStyles={{ minHeight: 80, alignItems: 'flex-start' }}
                            error={errors.notes}
                        />

                        {/* Footer Actions */}
                        <View style={styles.footer}>
                            <TouchableOpacity style={styles.draftBtn} onPress={onClose}>
                                <Text style={styles.draftText}>Cancel</Text>
                            </TouchableOpacity>
                            <CommonButton
                                title={"Set Reminder"}
                                onPress={handleSet}
                                containerStyle={styles.sendBtn}
                                loading={loading}
                            />
                        </View>
                    </ScrollView>

                    <CustomDatePicker
                        show={showDatePicker}
                        value={reminderDate}
                        onChange={onDateChange}
                        onClose={() => setShowDatePicker(false)}
                    />
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
    inputContainer: {
        marginBottom: 16
    },
    label: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        marginBottom: 5
    },
    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3, // Using standard gray border
        borderRadius: 12, // Matching CustomTextInput
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: ColorConstants.WHITE,
        height: 48 // Ensure consistent height
    },
    errorText: {
        marginTop: 4,
        fontSize: 11,
        color: ColorConstants.RED,
        fontFamily: 'Inter-Regular',
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
    inputIcon: {
        width: 16,
        height: 16,
        tintColor: ColorConstants.GRAY, // Matching CustomTextInput icon color
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
        zIndex: 1000,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
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
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 12,
        marginTop: 10,
    },
    draftBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        height: 36,
        justifyContent: 'center'
    },
    draftText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    sendBtn: {
        marginTop: 0,
        marginBottom: 0,
        width: undefined,
        paddingHorizontal: 20,
    },
});

export default SetServiceReminderModal;
