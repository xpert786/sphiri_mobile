import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface CustomDatePickerProps {
    value: Date | null;
    onChange: (event: any, date?: Date) => void;
    show: boolean;
    onClose: () => void;
    mode?: 'date' | 'time' | 'datetime';
    minimumDate?: Date;
    maximumDate?: Date;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
    value,
    onChange,
    show,
    onClose,
    mode = 'date',
    minimumDate,
    maximumDate,
}) => {
    // Defensive check to ensure we always have a valid Date object
    // We treat 1970-01-01 (Epoch 0) as an invalid default for this app's context
    const getValidDate = (d: any) => {
        if (d instanceof Date && !isNaN(d.getTime()) && d.getTime() !== 0) {
            return d;
        }
        return new Date();
    };

    const validValue = getValidDate(value);
    
    // We default to a very wide range if none is provided, to ensure pickers aren't locked to 1970
    const defaultMinDate = new Date(1920, 0, 1);
    const defaultMaxDate = new Date(2100, 11, 31);

    const validMinDate = (minimumDate instanceof Date && !isNaN(minimumDate.getTime())) ? minimumDate : defaultMinDate;
    const validMaxDate = (maximumDate instanceof Date && !isNaN(maximumDate.getTime())) ? maximumDate : defaultMaxDate;

    // For iOS, we keep a temp date while the user is scrolling
    const [tempDate, setTempDate] = React.useState(validValue);

    // Sync tempDate with value ONLY when the actual timestamp changes
    // This prevents the picker from jumping back during re-renders if value is new Date()
    const valueTimestamp = validValue.getTime();
    React.useEffect(() => {
        if (show) {
            setTempDate(new Date(valueTimestamp));
        }
    }, [valueTimestamp, show]);

    if (!show) return null;

    if (Platform.OS === 'android') {
        return (
            <DateTimePicker
                value={validValue}
                mode={mode}
                display="default"
                onChange={(event, date) => {
                    if (event.type === 'set' || event.type === 'dismissed') {
                        onClose();
                    }
                    onChange(event, date);
                }}
                minimumDate={validMinDate}
                maximumDate={validMaxDate}
            />
        );
    }

    // iOS Implementation with a Modal and Done button
    const handleDone = () => {
        onChange({ type: 'set' }, tempDate);
        onClose();
    };

    return (
        <Modal
            transparent={true}
            animationType="fade"
            visible={show}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <TouchableOpacity
                    style={styles.flexibleSpace}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <View style={styles.pickerContainer}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.headerButton}>
                            <Text style={[styles.buttonText, { color: ColorConstants.RED }]}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDone} style={styles.headerButton}>
                            <Text style={[styles.buttonText, { color: ColorConstants.PRIMARY_BROWN }]}>Done</Text>
                        </TouchableOpacity>
                    </View>
                    <DateTimePicker
                        value={tempDate}
                        mode={mode}
                        display="spinner"
                        onChange={(event, date) => {
                            if (date) setTempDate(date);
                        }}
                        minimumDate={validMinDate}
                        maximumDate={validMaxDate}
                        textColor={ColorConstants.BLACK}
                    />
                </View>
                <TouchableOpacity
                    style={styles.flexibleSpace}
                    activeOpacity={1}
                    onPress={onClose}
                />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    flexibleSpace: {
        flex: 1,
        width: '100%',
    },
    pickerContainer: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 24,
        paddingBottom: 20,
        width: '100%',
        maxWidth: 400,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F2',
    },
    headerButton: {
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    buttonText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 16,
    },
});

export default CustomDatePicker;
