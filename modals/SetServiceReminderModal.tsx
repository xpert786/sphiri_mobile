import { apiPost } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import CommonButton from '@/components/CommonButton';
import CustomTextInput from '@/components/CustomTextInput';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

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
    const [serviceType, setServiceType] = useState('Select service type');
    const [reminderDate, setReminderDate] = useState(new Date());
    const [notifyDays, setNotifyDays] = useState('7');
    const [recurring, setRecurring] = useState('One-time only');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const serviceTypeOptions = ['Annual Plumbing Inspection', 'Electrical Maintaince', 'HVAC Checkup', 'General Maintaince'];
    const recurringOptions = ['One-time only', 'Quarterly', 'Monthly', 'Annually'];

    const handleSet = async () => {
        if (!clientId) {
            alert('Client ID is missing');
            return;
        }

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
                reminder_date: reminderDate.toISOString().split('T')[0],
                notify_before_days: parseInt(notifyDays) || 7,
                recurring: recurringMap[recurring] || 'one_time',
                notes: notes
            };

            const url = `${ApiConstants.VENDOR_CLIENT_REMINDERS}${clientId}/reminders/`;
            const response = await apiPost(url, payload);

            if (response.data) {
                if (onSetReminder) onSetReminder(response.data);
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
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        if (selectedDate) {
            setReminderDate(selectedDate);
        }
        if (Platform.OS === 'ios' && event.type === 'dismissed') {
            setShowDatePicker(false);
        }
    };

    const toggleDropdown = (key: string) => {
        setOpenDropdown(prev => (prev === key ? null : key));
    };

    const selectOption = (key: string, value: string) => {
        if (key === 'serviceType') setServiceType(value);
        if (key === 'recurring') setRecurring(value);
        setOpenDropdown(null);
    };

    const renderDropdown = (
        label: string,
        key: string,
        value: string,
        options: string[],
        zIndex: number,
        placeholder: string = 'Select option'
    ) => (
        <View style={[styles.inputContainer, { zIndex }]}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => toggleDropdown(key)}
                activeOpacity={0.8}
            >
                <Text style={[styles.inputText, value === placeholder && { color: ColorConstants.GRAY_50 }]}>
                    {value}
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
                        {renderDropdown('Service Type', 'serviceType', serviceType, serviceTypeOptions, 3000, 'Select service type')}

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Reminder Date</Text>
                            <TouchableOpacity
                                style={styles.dropdownButton}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Text style={styles.inputText}>{formatDate(reminderDate)}</Text>
                                <Image source={Icons.ic_calendar_outline} style={styles.inputIcon} />
                            </TouchableOpacity>
                        </View>

                        <CustomTextInput
                            label="Notify Me before (days)"
                            placeholder="7"
                            value={notifyDays}
                            onChangeText={setNotifyDays}
                            keyboardType="numeric"
                        />

                        {renderDropdown('Recurring', 'recurring', recurring, recurringOptions, 2000, 'One-time only')}

                        <CustomTextInput
                            label="Notes"
                            placeholder="Add any specific note for this reminder..."
                            value={notes}
                            onChangeText={setNotes}
                            multiline={true}
                            inputStyles={{ minHeight: 80, alignItems: 'flex-start' }}
                        />

                        {/* Footer Actions */}
                        <View style={styles.footer}>
                            <TouchableOpacity style={styles.draftBtn} onPress={onClose}>
                                <Text style={styles.draftText}>Draft</Text>
                            </TouchableOpacity>
                            <CommonButton
                                title="Set Reminder"
                                onPress={handleSet}
                                containerStyle={styles.sendBtn}
                                loading={loading}
                            />
                        </View>
                    </ScrollView>

                    {showDatePicker && (
                        <DateTimePicker
                            value={reminderDate}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onDateChange}
                        />
                    )}
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
