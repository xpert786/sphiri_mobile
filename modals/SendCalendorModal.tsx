
import { Icons } from '@/assets';
import AppDropdown from '@/components/AppDropdown';
import CustomTextInput from '@/components/CustomTextInput';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import CustomDatePicker from '@/components/CustomDatePicker';
import React, { useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface SendCalendorModalProps {
    visible: boolean;
    onClose: () => void;
}

const SendCalendorModal: React.FC<SendCalendorModalProps> = ({ visible, onClose }) => {
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [time, setTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [title, setTitle] = useState('Service Appointment');
    const [duration, setDuration] = useState('2 hours');
    const [timezone, setTimezone] = useState('Asia/Dubai local');
    const [location, setLocation] = useState('123 Main St, City');
    const [description, setDescription] = useState('');

    const onDateChange = (event: any, selectedDate?: Date) => {
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const onTimeChange = (event: any, selectedTime?: Date) => {
        if (selectedTime) {
            setTime(selectedTime);
        }
    };

    const formatTime = (time: Date) => {
        return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (date: Date) => {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <View style={styles.modalContainer}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>Send Calendar Invite</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Image source={Icons.ic_cross} style={styles.closeIcon} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.line} />

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                            {/* User Info */}
                            <View style={styles.userInfoContainer}>
                                <Text style={styles.userName}>John Smith</Text>
                                <Text style={styles.userEmail}>john.smith@email.com</Text>
                            </View>

                            {/* Form Fields */}
                            <AppDropdown
                                label="Appointment Title"
                                data={['Service Appointment', 'Consultation', 'Emergency Repair', 'Maintenance Check', 'Site Visit']}
                                value={title}
                                onSelect={setTitle}
                                zIndex={5000}
                            />

                            <View style={{ zIndex: 4000 }}>
                                <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={1}>
                                    <View pointerEvents="none">
                                        <CustomTextInput
                                            label="Date"
                                            value={formatDate(date)}
                                            onChangeText={() => { }}
                                            rightIcon={Icons.ic_calendor || Icons.ic_calender}
                                            rightIconStyle={styles.iconStyle}
                                            parentStyles={styles.inputSpacing}
                                            editable={false}
                                        />
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <CustomDatePicker
                                show={showDatePicker}
                                value={date}
                                onChange={onDateChange}
                                onClose={() => setShowDatePicker(false)}
                            />

                            <View style={{ zIndex: 3000 }}>
                                <TouchableOpacity onPress={() => setShowTimePicker(true)} activeOpacity={1}>
                                    <View pointerEvents="none">
                                        <CustomTextInput
                                            label="Time"
                                            value={formatTime(time)}
                                            onChangeText={() => { }}
                                            rightIcon={Icons.ic_clock}
                                            rightIconStyle={styles.iconStyle}
                                            parentStyles={styles.inputSpacing}
                                            editable={false}
                                        />
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <CustomDatePicker
                                show={showTimePicker}
                                value={time}
                                mode="time"
                                onChange={onTimeChange}
                                onClose={() => setShowTimePicker(false)}
                            />

                            <AppDropdown
                                label="Timezone"
                                data={['Asia/Dubai local', 'UTC', 'EST (UTC-5)', 'PST (UTC-8)', 'GMT (UTC+0)']}
                                value={timezone}
                                onSelect={setTimezone}
                                zIndex={2000}
                            />

                            <AppDropdown
                                label="Duration"
                                data={['30 mins', '1 hour', '2 hours', '3 hours', '4 hours', 'All day']}
                                value={duration}
                                onSelect={setDuration}
                                zIndex={1000}
                            />

                            <CustomTextInput
                                label="Location"
                                value={location}
                                onChangeText={setLocation}
                                parentStyles={styles.inputSpacing}
                            />

                            <CustomTextInput
                                label="Description"
                                value={description}
                                placeholder="Add any detail about the appointment"
                                onChangeText={setDescription}
                                multiline
                                parentStyles={styles.inputSpacing}
                                multiStyles={styles.textArea}
                            />

                            {/* Buttons */}
                            <View style={styles.buttonRow}>
                                <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={onClose} style={styles.sendButton}>
                                    <Text style={styles.sendButtonText}>Send Invite</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    keyboardView: {
        width: '100%',
        height: '80%',
        marginBottom: 40
    },
    modalContainer: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 16,
        padding: 20,
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 22,
        color: ColorConstants.BLACK,
    },
    closeButton: {
        padding: 10,
        backgroundColor: '#F5F5F5',
        borderRadius: 20
    },
    closeIcon: {
        width: 10,
        height: 10,
        tintColor: ColorConstants.BLACK,
        resizeMode: 'contain',
    },
    line: {
        height: 1,
        width: '100%',
        backgroundColor: ColorConstants.GRAY3,

    },
    scrollContent: {
        paddingBottom: 50,
        marginTop: 25
    },
    userInfoContainer: {
        backgroundColor: '#EAEAEA', // Light gray bg
        padding: 16,
        borderRadius: 8,
        marginBottom: 20,
    },
    userName: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK,
        marginBottom: 4,
    },
    userEmail: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.GRAY,
    },
    inputSpacing: {
        marginBottom: 16,
    },
    dropdownIcon: {
        width: 10,
        height: 10,
        tintColor: ColorConstants.GRAY,
    },
    iconStyle: {
        width: 18,
        height: 18,
        tintColor: ColorConstants.GRAY,
    },
    textArea: {
        minHeight: 80,
        alignItems: 'flex-start',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    cancelButton: {
        paddingVertical: 6,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        marginRight: 10,
    },
    cancelText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK,
    },
    sendButton: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        height: 33,
        width: 107,
    },
    sendButtonText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.WHITE,
    },
});

export default SendCalendorModal;
