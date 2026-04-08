import { Icons } from '@/assets';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import CustomDatePicker from '@/components/CustomDatePicker';
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

interface SnoozeReminderModalProps {
    visible: boolean;
    onClose: () => void;
    onSnooze: (data: { quick_option?: string, custom_date?: string, notify: boolean }) => void;
    reminderTitle?: string;
    reminderDate?: string;
}

const SnoozeReminderModal: React.FC<SnoozeReminderModalProps> = ({
    visible,
    onClose,
    onSnooze,
    reminderTitle,
    reminderDate
}) => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [customDate, setCustomDate] = useState('');
    const getValidSnoozeDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return (!isNaN(d.getTime()) && d.getTime() !== 0) ? d : new Date();
    };
    const [notify, setNotify] = useState(true);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleSnoozePress = () => {
        const payload: any = { notify };

        if (selectedOption && selectedOption !== 'custom') {
            const mapping: any = {
                'tomorrow': 'tomorrow',
                '3days': '3_days',
                'nextWeek': 'next_week',
                '2weeks': '2_weeks'
            };
            payload.quick_option = mapping[selectedOption];
        } else if (selectedOption === 'custom' || (!selectedOption && customDate)) {
            payload.custom_date = customDate;
        }

        onSnooze(payload);
    };

    const formatDateToMDY = (dateStr: string) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        const [year, month, day] = parts;
        return `${month}/${day}/${year}`;
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        if (selectedDate) {
            const formattedDate = selectedDate.toISOString().split('T')[0];
            setCustomDate(formattedDate);
            setSelectedOption('custom');
        }
    };

    const OPTIONS = [
        { id: 'tomorrow', label: 'Tomorrow' },
        { id: '3days', label: 'In 3 days' },
        { id: 'nextWeek', label: 'Next week' },
        { id: '2weeks', label: 'In 2 weeks' },
    ];

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
                        <Text style={styles.title}>Snooze Reminder</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Image source={Icons.ic_cross} style={styles.closeIcon} />
                        </TouchableOpacity>
                    </View>

                    {/* Reminder Info */}
                    <Text style={styles.reminderTitle}>{reminderTitle}</Text>
                    <Text style={styles.reminderDate}>Due: {reminderDate}</Text>

                    <View style={{ maxHeight: 400 }}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.sectionTitle}>Snooze Until</Text>

                            {/* Options */}
                            <View style={styles.optionsList}>
                                {OPTIONS.map((opt) => {
                                    const isSelected = selectedOption === opt.id;
                                    return (
                                        <TouchableOpacity
                                            key={opt.id}
                                            style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                                            onPress={() => setSelectedOption(opt.id)}
                                        >
                                            <Text style={styles.optionLabel}>{opt.label}</Text>
                                        </TouchableOpacity>
                                    )
                                })}
                            </View>

                            {/* Custom Date */}
                            <Text style={styles.customLabel}>Or choose custom date:</Text>
                            <TouchableOpacity style={styles.customDateInput} onPress={() => setShowDatePicker(true)}>
                                <Text style={styles.customDateText}>{formatDateToMDY(customDate)}</Text>
                                <Image source={Icons.ic_calendar_outline} style={styles.calendarIcon} />
                            </TouchableOpacity>

                            <CustomDatePicker
                                show={showDatePicker}
                                value={getValidSnoozeDate(customDate)}
                                onChange={onDateChange}
                                onClose={() => setShowDatePicker(false)}
                            />

                            {/* Notification Checkbox */}
                            <View style={styles.notifyRow}>
                                <TouchableOpacity
                                    style={[styles.checkbox, notify && styles.checkboxChecked]}
                                    onPress={() => setNotify(!notify)}
                                >
                                    {notify && <Image source={Icons.ic_checkbox_tick} style={{ width: 16, height: 16, tintColor: ColorConstants.WHITE }} />}
                                </TouchableOpacity>
                                <Text style={styles.notifyText}>Send notification when snooze period ends</Text>
                            </View>
                        </ScrollView>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.snoozeBtn}
                            onPress={handleSnoozePress}
                        >
                            <Text style={styles.snoozeText}>Snooze Reminders</Text>
                        </TouchableOpacity>
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
        alignItems: 'center',
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        paddingBottom: 12
    },
    title: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 20,
        color: ColorConstants.BLACK2
    },
    closeBtn: {
        padding: 10,
        backgroundColor: '#F5F5F5',
        borderRadius: 20
    },
    closeIcon: {
        width: 12,
        height: 12,
        tintColor: ColorConstants.GRAY5
    },
    reminderTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        marginTop: 10,
        marginBottom: 2
    },
    reminderDate: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.BLACK2,
        marginBottom: 16
    },
    sectionTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.BLACK2,
        marginBottom: 12
    },
    optionsList: {
        gap: 12,
        marginBottom: 20
    },
    optionCard: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center'
    },
    optionCardSelected: {
        borderColor: ColorConstants.PRIMARY_BROWN, // Or specific brown from screenshot
        backgroundColor: ColorConstants.LIGHT_PEACH3 // Verify color constant
    },
    optionLabel: {
        fontFamily: Fonts.mulishMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        marginBottom: 4
    },
    optionSub: {
        fontFamily: Fonts.ManropeRegular,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN
    },
    customLabel: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        marginBottom: 8
    },
    customDateInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 20
    },
    customDateText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.GRAY
    },
    calendarIcon: {
        width: 16,
        height: 16,
        tintColor: ColorConstants.DARK_CYAN
    },
    notifyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24
    },
    checkbox: {
        width: 16,
        height: 16,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: ColorConstants.BLACK2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        backgroundColor: ColorConstants.WHITE
    },
    checkboxChecked: {
        backgroundColor: ColorConstants.BLACK2, // Dark background for check
        borderColor: ColorConstants.BLACK2
    },
    notifyText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12
    },
    cancelBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3
    },
    cancelText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.DARK_CYAN
    },
    snoozeBtn: {
        backgroundColor: ColorConstants.PRIMARY_BROWN, // Brown matching screen
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8
    },
    snoozeText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.WHITE
    }
});

export default SnoozeReminderModal;
