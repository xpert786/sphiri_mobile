import { Icons } from '@/assets';
import CustomTextInput from '@/components/CustomTextInput';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import CustomDatePicker from '@/components/CustomDatePicker';
import React, { useState } from 'react';
import {
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface CreateReminderModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (formData: any) => void;
}

const CreateReminderModal: React.FC<CreateReminderModalProps> = ({
    visible,
    onClose,
    onSave,
}) => {
    const [formData, setFormData] = useState({
        reminderTitle: '',
        description: '',
        dueDate: new Date(),
        time: new Date(),
        recurring: false,
        repeatEvery: '1 week',
        endDate: new Date(),
        linkToContact: 'Select Category',
        linkToDocument: 'Select Category',
        homeMaintenanceCategory: true,
        familyMedicalCategory: false,
        financialCategory: true,
        legalCategory: false,
        emailNotification: true,
        advanceNotice: '1 week before',
        pushNotification: false,
    });

    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [datePickerMode, setDatePickerMode] = useState<'dueDate' | 'endDate'>('dueDate');

    const repeatOptions = ['1 week', '2 weeks', '1 month', '3 months', '6 months', '1 year'];
    const advanceNoticeOptions = ['1 day before', '3 days before', '1 week before', '2 weeks before'];
    const categoryOptions = ['Select Category', 'Category 1', 'Category 2', 'Category 3'];

    // Helper functions for formatting
    const formatDate = (date: Date) => {
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
        return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (selectedDate) {
            if (datePickerMode === 'dueDate') {
                handleInputChange('dueDate', selectedDate);
            } else {
                handleInputChange('endDate', selectedDate);
            }
        }
    };

    const handleTimeChange = (event: any, selectedTime?: Date) => {
        if (selectedTime) {
            handleInputChange('time', selectedTime);
        }
    };

    const toggleDropdown = (key: string) => {
        setOpenDropdown(prev => (prev === key ? null : key));
    };

    const selectOption = (field: string, value: string) => {
        handleInputChange(field, value);
        setOpenDropdown(null);
    };

    const renderDropdown = (
        label: string,
        fieldKey: string,
        value: string,
        options: string[],
        zIndexVal: number
    ) => (
        <View style={[styles.inputContainer, { zIndex: zIndexVal }]}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => toggleDropdown(fieldKey)}
                activeOpacity={0.8}
            >
                <Text style={[styles.inputText, value === 'Select Category' && { color: ColorConstants.GRAY_50 }]}>
                    {value}
                </Text>
                <Image source={Icons.ic_down_arrow} style={styles.arrowIcon} />
            </TouchableOpacity>

            {openDropdown === fieldKey && (
                <View style={styles.dropdownList}>
                    {options.map((opt, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={styles.dropdownItem}
                            onPress={() => selectOption(fieldKey, opt)}
                        >
                            <Text style={styles.dropdownItemText}>{opt}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );

    const renderCategoryToggle = (label: string, fieldKey: string) => (
        <View style={styles.categoryRow}>
            <Switch
                trackColor={{ false: '#E0E0E0', true: ColorConstants.PRIMARY_BROWN }}
                thumbColor={ColorConstants.WHITE}
                onValueChange={(val) => handleInputChange(fieldKey, val)}
                value={formData[fieldKey as keyof typeof formData] as boolean}
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
            <Text style={styles.categoryLabel}>{label}</Text>
        </View>
    );

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Create New Reminder</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Image source={Icons.ic_cross} style={styles.closeIcon} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {/* Reminder Title */}
                        <CustomTextInput
                            label="Reminder Title *"
                            value={formData.reminderTitle}
                            onChangeText={(t) => handleInputChange('reminderTitle', t)}
                            placeholder="What needs to be done ?"
                        />

                        {/* Description */}
                        <CustomTextInput
                            label="Description"
                            value={formData.description}
                            onChangeText={(t) => handleInputChange('description', t)}
                            placeholder="Add description"
                            multiline
                            inputStyles={{ height: 80, alignItems: 'flex-start' }}
                        />

                        {/* Schedule Section */}
                        <Text style={styles.sectionHeader}>Schedule</Text>

                        {/* Due Date */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Due Date</Text>
                            <TouchableOpacity
                                style={styles.dropdownButton}
                                onPress={() => {
                                    setDatePickerMode('dueDate');
                                    setShowDatePicker(true);
                                }}
                            >
                                <Text style={styles.inputText}>{formatDate(formData.dueDate)}</Text>
                                <Image source={Icons.ic_calendar_outline} style={styles.inputIcon} />
                            </TouchableOpacity>
                        </View>

                        {/* Time */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Time</Text>
                            <TouchableOpacity
                                style={styles.dropdownButton}
                                onPress={() => setShowTimePicker(true)}
                            >
                                <Text style={styles.inputText}>{formatTime(formData.time)}</Text>
                                <Image source={Icons.ic_clock} style={styles.inputIcon} />
                            </TouchableOpacity>
                        </View>

                        {/* Recurring Toggle */}
                        <View style={styles.rowToggle}>
                            <Switch
                                trackColor={{ false: '#E0E0E0', true: ColorConstants.PRIMARY_BROWN }}
                                thumbColor={ColorConstants.WHITE}
                                onValueChange={(val) => handleInputChange('recurring', val)}
                                value={formData.recurring}
                                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                            />
                            <Text style={styles.toggleLabel}>Make this a recurring task</Text>
                        </View>

                        {/* Recurring Task Fields */}
                        {formData.recurring && (
                            <>
                                {renderDropdown('Repeat Every', 'repeatEvery', formData.repeatEvery, repeatOptions, 20)}

                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>End Date</Text>
                                    <TouchableOpacity
                                        style={styles.dropdownButton}
                                        onPress={() => {
                                            setDatePickerMode('endDate');
                                            setShowEndDatePicker(true);
                                        }}
                                    >
                                        <Text style={styles.inputText}>{formatDate(formData.endDate)}</Text>
                                        <Image source={Icons.ic_calendar_outline} style={styles.inputIcon} />
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}

                        {/* Associations Section */}
                        <Text style={styles.sectionHeader}>Associations</Text>
                        {renderDropdown('Link to Contact', 'linkToContact', formData.linkToContact, categoryOptions, 19)}
                        {renderDropdown('Link to Document', 'linkToDocument', formData.linkToDocument, categoryOptions, 18)}

                        {/* Category Section */}
                        <Text style={styles.sectionHeader}>Category</Text>
                        <View style={styles.categoryContainer}>
                            {renderCategoryToggle('Home Maintenance', 'homeMaintenanceCategory')}
                            {renderCategoryToggle('Family & Medical', 'familyMedicalCategory')}
                            {renderCategoryToggle('Financial', 'financialCategory')}
                            {renderCategoryToggle('legal', 'legalCategory')}
                        </View>

                        {/* Notifications Section */}
                        <Text style={styles.sectionHeader}>Notifications</Text>
                        <Text style={styles.notifyViaLabel}>Notify Via</Text>

                        <View style={styles.notificationRow}>
                            <Switch
                                trackColor={{ false: '#E0E0E0', true: ColorConstants.PRIMARY_BROWN }}
                                thumbColor={ColorConstants.WHITE}
                                onValueChange={(val) => handleInputChange('emailNotification', val)}
                                value={formData.emailNotification}
                                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                            />
                            <Text style={styles.notificationLabel}>Email</Text>
                        </View>

                        {/* Advance Notice Dropdown */}
                        <View style={[styles.inputContainer, { zIndex: 17 }]}>
                            <Text style={styles.label}>Advance Notice</Text>
                            <TouchableOpacity
                                style={styles.dropdownButton}
                                onPress={() => toggleDropdown('advanceNotice')}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.inputText}>{formData.advanceNotice}</Text>
                                <Image source={Icons.ic_down_arrow} style={styles.arrowIcon} />
                            </TouchableOpacity>

                            {openDropdown === 'advanceNotice' && (
                                <View style={styles.dropdownListUpward}>
                                    {advanceNoticeOptions.map((opt, idx) => (
                                        <TouchableOpacity
                                            key={idx}
                                            style={styles.dropdownItem}
                                            onPress={() => selectOption('advanceNotice', opt)}
                                        >
                                            <Text style={styles.dropdownItemText}>{opt}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        <View style={styles.notificationRow}>
                            <Switch
                                trackColor={{ false: '#E0E0E0', true: ColorConstants.PRIMARY_BROWN }}
                                thumbColor={ColorConstants.WHITE}
                                onValueChange={(val) => handleInputChange('pushNotification', val)}
                                value={formData.pushNotification}
                                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                            />
                            <Text style={styles.notificationLabel}>Push Notification</Text>
                        </View>

                        {/* Footer Actions */}
                        <View style={styles.footer}>
                            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={() => onSave(formData)}>
                                <Text style={styles.saveButtonText}>Create Reminder</Text>
                            </TouchableOpacity>
                        </View>

                        <CustomDatePicker
                            show={showDatePicker}
                            value={formData.dueDate}
                            onChange={handleDateChange}
                            onClose={() => setShowDatePicker(false)}
                        />

                        <CustomDatePicker
                            show={showEndDatePicker}
                            value={formData.endDate}
                            onChange={handleDateChange}
                            onClose={() => setShowEndDatePicker(false)}
                        />

                        <CustomDatePicker
                            show={showTimePicker}
                            value={formData.time}
                            mode="time"
                            onChange={handleTimeChange}
                            onClose={() => setShowTimePicker(false)}
                        />
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20
    },
    modalContainer: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 16,
        maxHeight: '90%',
        overflow: 'hidden'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0'
    },
    headerTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 20,
        color: ColorConstants.BLACK2
    },
    closeButton: {
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
        padding: 20
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
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: ColorConstants.WHITE
    },
    inputText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 13,
        color: ColorConstants.BLACK
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
        tintColor: ColorConstants.GRAY,
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
    dropdownListUpward: {
        position: 'absolute',
        bottom: '100%',
        left: 0,
        right: 0,
        backgroundColor: ColorConstants.WHITE,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        marginBottom: 4,
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
    sectionHeader: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.BLACK2,
        marginTop: 8,
        marginBottom: 8
    },
    rowToggle: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    toggleLabel: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    categoryContainer: {
        gap: 10,
        marginBottom: 18
    },
    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: -10
    },
    categoryLabel: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        marginLeft: 4
    },
    notifyViaLabel: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    notificationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    notificationLabel: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        marginLeft: 8
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 10
    },
    cancelButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginRight: 12
    },
    cancelButtonText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: '#666'
    },
    saveButton: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8
    },
    saveButtonText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.WHITE
    }
});

export default CreateReminderModal;
