import { Icons } from '@/assets';
import CustomTextInput from '@/components/CustomTextInput';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
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
const CATEGORY_OPTIONS = ['Financial', 'Home Maintenance', 'Family', 'Legal', 'Work', 'Health'];

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
        category: ''
    });

    console.log(' in EditReminderModal');

    const [openDropdown, setOpenDropdown] = useState<'priority' | 'category' | null>(null);

    useEffect(() => {
        if (reminder) {
            setFormData({
                title: reminder.title || '',
                description: reminder.description || '',
                dueDate: reminder.displayDate || reminder.date || '',
                time: reminder.time || '',
                priority: reminder.priority || '',
                category: reminder.category || ''
            });
        }
    }, [reminder]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSelectOption = (field: 'priority' | 'category', value: string) => {
        handleInputChange(field, value);
        setOpenDropdown(null);
    };

    const renderDropdown = (type: 'priority' | 'category', options: string[]) => {
        if (openDropdown !== type) return null;

        return (
            <View style={styles.dropdownList}>
                {options.map((option, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.dropdownItem}
                        onPress={() => handleSelectOption(type, option)}
                    >
                        <Text style={styles.dropdownItemText}>{option}</Text>
                    </TouchableOpacity>
                ))}
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
                                <CustomTextInput
                                    label="Due Date"
                                    value={formData.dueDate}
                                    onChangeText={(t) => handleInputChange('dueDate', t)}
                                    placeholder="DD/MM/YYYY"
                                    rightIcon={Icons.ic_calendar_outline}
                                    rightIconStyle={styles.timeIcon}
                                />
                            </View>
                            <View style={[styles.col, { marginLeft: 12 }]}>
                                <CustomTextInput
                                    label="Time"
                                    value={formData.time}
                                    onChangeText={(t) => handleInputChange('time', t)}
                                    placeholder="--:--"
                                    rightIcon={Icons.ic_clock}
                                    rightIconStyle={styles.timeIcon}
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
                                {renderDropdown('priority', PRIORITY_OPTIONS)}
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
                                {renderDropdown('category', CATEGORY_OPTIONS)}
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
        top: 70, // Adjust based on input height
        left: 0,
        right: 0,
        backgroundColor: ColorConstants.WHITE,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        zIndex: 1000,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        maxHeight: 200
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
