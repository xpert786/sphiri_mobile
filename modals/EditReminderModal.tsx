import { apiGet } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import CustomTextInput from '@/components/CustomTextInput';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import CustomDatePicker from '@/components/CustomDatePicker';
import React, { useEffect, useState } from 'react';
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

interface EditReminderModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    reminder: any;
}

const PRIORITY_OPTIONS = ['High Priority', 'Medium Priority', 'Low Priority'];

const EditReminderModal: React.FC<EditReminderModalProps> = ({
    visible,
    onClose,
    onSave,
    reminder
}) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        time: '',
        priority: '',
        category: '',
        categoryId: null as number | null
    });

    console.log(' in EditReminderModal');

    const [openDropdown, setOpenDropdown] = useState<'priority' | 'category' | null>(null);
    const [apiCategories, setApiCategories] = useState<{ id: number, name: string, color: string, icon: string }[]>([]);

    // Date/Time picker states
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [dateValue, setDateValue] = useState(new Date());
    const [timeValue, setTimeValue] = useState(new Date());

    useEffect(() => {
        if (visible) {
            fetchCategories();
        }
    }, [visible]);

    const fetchCategories = async () => {
        try {
            const res = await apiGet(ApiConstants.FORM_OPTIONS);
            if (res.status === 200 || res.status === 201) {
                setApiCategories(res.data.categories || []);
            }
        } catch (error) {
            console.error('Error fetching categories in EditReminderModal:', error);
        }
    };

    useEffect(() => {
        if (reminder) {
            console.log("reminder in EditReminder modal:", reminder);

            setFormData({
                title: reminder.title || '',
                description: reminder.description || '',
                dueDate: reminder.displayDate || reminder.date || '',
                time: reminder.time || '',
                priority: reminder.priority || '',
                category: reminder.category || '',
                categoryId: reminder.categoryId || null
            });

            // Initialize date and time values for pickers
            if (reminder.date) {
                const dateObj = new Date(reminder.date);
                setDateValue(!isNaN(dateObj.getTime()) ? dateObj : new Date());
            } else {
                setDateValue(new Date());
            }
            if (reminder.reminder_time) {
                const [hours, minutes] = reminder.reminder_time.split(':');
                const t = new Date();
                t.setHours(parseInt(hours, 10));
                t.setMinutes(parseInt(minutes, 10));
                setTimeValue(t);
            }
        }
    }, [reminder]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSelectOption = (field: 'priority' | 'category', value: string) => {
        if (field === 'category') {
            const selectedCat = apiCategories.find(c => c.name === value);
            setFormData(prev => ({ ...prev, category: value, categoryId: selectedCat ? selectedCat.id : null }));
        } else {
            handleInputChange(field, value);
        }
        setOpenDropdown(null);
    };

    const formatDate = (date: Date) => {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        // Matching expectation in index.tsx's formatDateToYMD (MM/DD/YYYY)
        return `${month}/${day}/${year}`;
    };

    const formatDateUI = (date: Date) => {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

    const formatTime = (date: Date) => {
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const strHours = String(hours).padStart(2, '0');
        return `${strHours}:${minutes} ${ampm}`;
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        if (selectedDate) {
            setDateValue(selectedDate);
            handleInputChange('dueDate', formatDate(selectedDate));
        }
    };

    const onTimeChange = (event: any, selectedTime?: Date) => {
        if (selectedTime) {
            setTimeValue(selectedTime);
            handleInputChange('time', formatTime(selectedTime));
        }
    };

    const renderDropdown = (type: 'priority' | 'category') => {
        if (openDropdown !== type) return null;

        const options = type === 'priority' ? PRIORITY_OPTIONS : apiCategories.map(c => c.name);

        return (
            <View style={styles.dropdownList}>
                <ScrollView nestedScrollEnabled >
                    {options.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.dropdownItem,
                                index === options.length - 1 && { borderBottomWidth: 0 }
                            ]}
                            onPress={() => handleSelectOption(type, option)}
                        >
                            <Text style={[
                                styles.dropdownItemText,
                                formData[type] === option && { fontFamily: Fonts.ManropeSemiBold, color: ColorConstants.PRIMARY_BROWN }
                            ]}>
                                {option}
                            </Text>
                            {formData[type] === option && (
                                <Image source={Icons.ic_check_circle2} style={styles.checkIcon} />
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
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
                        <Text style={styles.title}>Edit Reminder</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Image source={Icons.ic_cross} style={styles.closeIcon} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={[
                            styles.scrollContent,
                            openDropdown ? { paddingBottom: 280 } : null
                        ]}
                    >
                        {/* Task Title */}
                        <CustomTextInput
                            label="Task Title"
                            value={formData.title}
                            onChangeText={(t) => handleInputChange('title', t)}
                            placeholder="Enter task title"
                        />

                        {/* Description */}
                        <CustomTextInput
                            label="Description"
                            value={formData.description}
                            onChangeText={(t) => handleInputChange('description', t)}
                            placeholder="Enter description details..."
                            multiline
                            inputStyles={{ height: 100, alignItems: 'flex-start' }}
                        />

                        <Text style={styles.sectionHeader}>Schedule</Text>

                        <View style={styles.row}>
                            <View style={styles.col}>
                                <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.8}>
                                    <View pointerEvents="none">
                                        <CustomTextInput
                                            label="Due Date"
                                            value={formatDateUI(dateValue)}
                                            onChangeText={() => { }}
                                            placeholder="MM/DD/YYYY"
                                            rightIcon={Icons.ic_calendar_outline}
                                            rightIconStyle={styles.timeIcon}
                                            editable={false}
                                        />
                                    </View>
                                </TouchableOpacity>

                                <CustomDatePicker
                                    show={showDatePicker}
                                    value={dateValue}
                                    onChange={onDateChange}
                                    onClose={() => setShowDatePicker(false)}
                                    maximumDate={new Date(2100, 11, 31)}
                                />
                            </View>
                            <View style={[styles.col, { marginLeft: 12 }]}>
                                <TouchableOpacity onPress={() => setShowTimePicker(true)} activeOpacity={0.8}>
                                    <View pointerEvents="none">
                                        <CustomTextInput
                                            label="Time"
                                            value={formData.time}
                                            onChangeText={() => { }}
                                            placeholder="--:--"
                                            rightIcon={Icons.ic_clock}
                                            rightIconStyle={styles.timeIcon}
                                            editable={false}
                                        />
                                    </View>
                                </TouchableOpacity>

                                <CustomDatePicker
                                    show={showTimePicker}
                                    value={timeValue}
                                    mode="time"
                                    onChange={onTimeChange}
                                    onClose={() => setShowTimePicker(false)}
                                />
                            </View>
                        </View>

                        <View style={[styles.row, { zIndex: 10 }]}>
                            {/* Priority Dropdown */}
                            <View style={styles.col}>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => setOpenDropdown(openDropdown === 'priority' ? null : 'priority')}
                                >
                                    <View pointerEvents="none">
                                        <CustomTextInput
                                            label="Priority"
                                            value={formData.priority}
                                            onChangeText={() => { }}
                                            placeholder="Select priority"
                                            rightIcon={Icons.ic_down_arrow}
                                            editable={false}
                                        />
                                    </View>
                                </TouchableOpacity>
                                {renderDropdown('priority')}
                            </View>

                            {/* Category Dropdown */}
                            <View style={[styles.col, { marginLeft: 12 }]}>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => setOpenDropdown(openDropdown === 'category' ? null : 'category')}
                                >
                                    <View pointerEvents="none">
                                        <CustomTextInput
                                            label="Category"
                                            value={formData.category}
                                            onChangeText={() => { }}
                                            placeholder="Select category"
                                            rightIcon={Icons.ic_down_arrow}
                                            editable={false}
                                        />
                                    </View>
                                </TouchableOpacity>
                                {renderDropdown('category')}
                            </View>
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={() => {
                                const { title, description, dueDate, time, priority, category } = formData;
                                if (!title || !description || !dueDate || !time || !priority || !category) {
                                    Toast.show({
                                        type: 'error',
                                        text1: 'Required Fields',
                                        text2: 'Please fill in all fields before saving.',
                                    });
                                    return;
                                }
                                onSave(formData);
                            }}>
                                <Text style={styles.saveText}>Save Changes</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
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
        paddingVertical: 50,
        paddingHorizontal: 20
    },
    container: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 16,
        maxHeight: '90%',
        overflow: 'hidden' // Be careful with overflow hidden if dropdowns need to go outside, but here dropdowns are inside scrollview
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    title: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 20,
        color: ColorConstants.BLACK2
    },
    closeBtn: {
        padding: 8,
        backgroundColor: '#F5F5F5',
        borderRadius: 20
    },
    closeIcon: {
        width: 12,
        height: 12,
        tintColor: ColorConstants.GRAY5
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40
    },
    sectionHeader: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 18,
        color: ColorConstants.BLACK2,
        marginBottom: 12,
        marginTop: 8
    },
    timeIcon: {
        width: 14,
        height: 14,
        tintColor: ColorConstants.DARK_CYAN,
        resizeMode: 'contain'
    },
    row: {
        flexDirection: 'row',
        marginBottom: 4
    },
    col: {
        flex: 1,
        position: 'relative' // For dropdown positioning context
    },
    dropdownList: {
        position: 'absolute',
        top: 72,
        left: 0,
        right: 0,
        backgroundColor: ColorConstants.WHITE,
        borderWidth: 1,
        borderColor: '#EFEFEF',
        borderRadius: 12,
        zIndex: 1000,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F7F7F7'
    },
    dropdownItemText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        flex: 1
    },
    checkIcon: {
        width: 16,
        height: 16,
        tintColor: ColorConstants.PRIMARY_BROWN,
        marginLeft: 8
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 8,
        gap: 12,
        zIndex: -1 // Ensure dropdowns render over footer if updated layout
    },
    cancelBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0'
    },
    cancelText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: '#666'
    },
    saveBtn: {
        backgroundColor: '#A87268', // Brown
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8
    },
    saveText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.WHITE
    }
});

export default EditReminderModal;
