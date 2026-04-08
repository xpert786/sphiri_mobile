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
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface LogEngagementModalProps {
    visible: boolean;
    onClose: () => void;
    onUpload: (formData: any) => void;
}

const LogEngagementModal: React.FC<LogEngagementModalProps> = ({
    visible,
    onClose,
    onUpload,
}) => {
    const [formData, setFormData] = useState({
        title: '',
        date: null as Date | null,
        type: '',
        notes: '',
        rating: '',
        invoiceUrl: '',
        nextAppointment: null as Date | null,
    });

    const [errors, setErrors] = useState<any>({});
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showNextAppointmentPicker, setShowNextAppointmentPicker] = useState(false);
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);

    const typeOptions = ['Service', 'Payment', 'Inspection'];

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user changes a field
        if (errors[field]) {
            setErrors((prev: any) => ({ ...prev, [field]: '' }));
        }
    };

    const getFormattedDate = (date: Date | null) => {
        if (!date) return 'MM/DD/YYYY';
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (selectedDate) {
            handleInputChange('date', selectedDate);
        }
    };

    const handleNextAppointmentChange = (event: any, selectedDate?: Date) => {
        if (selectedDate) {
            handleInputChange('nextAppointment', selectedDate);
        }
    };

    const validate = (): boolean => {
        const newErrors: any = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }
        if (!formData.date) {
            newErrors.date = 'Date is required';
        }
        if (!formData.type) {
            newErrors.type = 'Type is required';
        }
        if (!formData.notes.trim()) {
            newErrors.notes = 'Notes are required';
        }
        if (!formData.rating) {
            newErrors.rating = 'Rating is required';
        }
        if (!formData.invoiceUrl.trim()) {
            newErrors.invoiceUrl = 'Invoice URL is required';
        } else if (!formData.invoiceUrl.startsWith('http://') && !formData.invoiceUrl.startsWith('https://')) {
            newErrors.invoiceUrl = 'Invoice URL must start with http:// or https://';
        }
        if (!formData.nextAppointment) {
            newErrors.nextAppointment = 'Next Appointment is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleUpload = () => {
        if (validate()) {
            onUpload(formData);
        }
    };

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
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.headerTitle}>Log Engagement</Text>
                            <Text style={styles.headerSubtitle}>
                                Record service history, documents, and ratings.
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Image source={Icons.ic_cross} style={styles.closeIcon} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {/* Title */}
                        <CustomTextInput
                            label="Title *"
                            value={formData.title}
                            onChangeText={(t) => handleInputChange('title', t)}
                            placeholder="HVAC Maintenance"
                            error={errors.title}
                        />

                        {/* Date & Type Row */}
                        <View style={styles.twoColumnRow}>
                            {/* Date */}
                            <View style={[styles.inputContainer, { zIndex: 1 }]}>
                                <Text style={styles.label}>Date *</Text>
                                <TouchableOpacity
                                    style={[styles.dropdownButton, errors.date && styles.inputError]}
                                    onPress={() => {
                                        setShowDatePicker(true);
                                        setErrors((prev: any) => ({ ...prev, date: '' }));
                                    }}
                                >
                                    <Text style={[styles.inputText, !formData.date && styles.placeholderText]}>
                                        {getFormattedDate(formData.date)}
                                    </Text>
                                    <Image source={Icons.ic_calendar_outline} style={styles.calendarIcon} />
                                </TouchableOpacity>
                                {errors.date ? <Text style={styles.errorText}>{errors.date}</Text> : null}
                            </View>

                            {/* Type Dropdown */}
                            <View style={[styles.inputContainer, { zIndex: 100 }]}>
                                <Text style={styles.label}>Type *</Text>
                                <TouchableOpacity
                                    style={[styles.dropdownButton, errors.type && styles.inputError]}
                                    onPress={() => {
                                        setShowTypeDropdown(!showTypeDropdown);
                                        setErrors((prev: any) => ({ ...prev, type: '' }));
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.inputText, !formData.type && styles.placeholderText]}>
                                        {formData.type || 'Select type'}
                                    </Text>
                                    <Image source={Icons.ic_down_arrow} style={styles.arrowIcon} />
                                </TouchableOpacity>
                                {errors.type ? <Text style={styles.errorText}>{errors.type}</Text> : null}

                                {showTypeDropdown && (
                                    <View style={styles.dropdownList}>
                                        <ScrollView
                                            nestedScrollEnabled={true}
                                            showsVerticalScrollIndicator={true}
                                        >
                                            {typeOptions.map((opt, idx) => (
                                                <TouchableOpacity
                                                    key={idx}
                                                    style={styles.dropdownItem}
                                                    onPress={() => {
                                                        handleInputChange('type', opt);
                                                        setShowTypeDropdown(false);
                                                    }}
                                                >
                                                    <Text style={styles.dropdownItemText}>{opt}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Notes */}
                        <CustomTextInput
                            label="Notes *"
                            value={formData.notes}
                            onChangeText={(t) => handleInputChange('notes', t)}
                            placeholder="Work performed, parts, etc."
                            multiline
                            inputStyles={{ height: 100, alignItems: 'flex-start' }}
                            error={errors.notes}
                        />

                        {/* Rating - 1 to 5 boxes */}
                        <View style={styles.ratingContainer}>
                            <Text style={styles.label}>Rating *</Text>
                            <View style={styles.ratingBoxesRow}>
                                {[1, 2, 3, 4, 5].map((num) => (
                                    <TouchableOpacity
                                        key={num}
                                        style={[
                                            styles.ratingBox,
                                            formData.rating === String(num) && styles.ratingBoxSelected
                                        ]}
                                        onPress={() => handleInputChange('rating', String(num))}
                                    >
                                        <Text style={[
                                            styles.ratingBoxText,
                                            formData.rating === String(num) && styles.ratingBoxTextSelected
                                        ]}>
                                            {num}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            {errors.rating ? <Text style={styles.errorText}>{errors.rating}</Text> : null}
                        </View>

                        {/* Invoice URL */}
                        <CustomTextInput
                            label="Invoice URL *"
                            value={formData.invoiceUrl}
                            onChangeText={(t) => handleInputChange('invoiceUrl', t)}
                            placeholder="https://..."
                            autoCapitalize="none"
                            error={errors.invoiceUrl}
                        />

                        {/* Next Appointment */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Next Appointment *</Text>
                            <TouchableOpacity
                                style={[styles.dropdownButton, errors.nextAppointment && styles.inputError]}
                                onPress={() => {
                                    setShowNextAppointmentPicker(true);
                                    setErrors((prev: any) => ({ ...prev, nextAppointment: '' }));
                                }}
                            >
                                <Text style={[styles.inputText, !formData.nextAppointment && styles.placeholderText]}>
                                    {getFormattedDate(formData.nextAppointment)}
                                </Text>
                                <Image source={Icons.ic_calendar_outline} style={styles.calendarIcon} />
                            </TouchableOpacity>
                            {errors.nextAppointment ? <Text style={styles.errorText}>{errors.nextAppointment}</Text> : null}
                        </View>

                        {/* Footer Actions */}
                        <View style={styles.footer}>
                            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
                                <Text style={styles.uploadButtonText}>Upload</Text>
                            </TouchableOpacity>
                        </View>

                        <CustomDatePicker
                            show={showDatePicker}
                            value={formData.date}
                            onChange={handleDateChange}
                            onClose={() => setShowDatePicker(false)}
                        />

                        <CustomDatePicker
                            show={showNextAppointmentPicker}
                            value={formData.nextAppointment}
                            onChange={handleNextAppointmentChange}
                            onClose={() => setShowNextAppointmentPicker(false)}
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
        alignItems: 'flex-start',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0'
    },
    headerTextContainer: {
        flex: 1,
        paddingRight: 12
    },
    headerTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 20,
        color: ColorConstants.BLACK2,
        marginBottom: 4
    },
    headerSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.GRAY,
        lineHeight: 16
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
    twoColumnRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 0
    },
    inputContainer: {
        marginBottom: 16,
        flex: 1
    },
    label: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        marginBottom: 8
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
        backgroundColor: ColorConstants.WHITE,
        minHeight: 44
    },
    inputError: {
        borderColor: ColorConstants.RED,
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
    calendarIcon: {
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
    // Rating 1-5 boxes
    ratingContainer: {
        marginBottom: 16,
    },
    ratingBoxesRow: {
        flexDirection: 'row',
        gap: 10,
    },
    ratingBox: {
        width: 44,
        height: 44,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: ColorConstants.WHITE,
    },
    ratingBoxSelected: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        borderColor: ColorConstants.PRIMARY_BROWN,
    },
    ratingBoxText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.BLACK2,
    },
    ratingBoxTextSelected: {
        color: ColorConstants.WHITE,
    },
    // Error
    errorText: {
        marginTop: 4,
        fontSize: 11,
        color: ColorConstants.RED,
        fontFamily: 'Inter-Regular',
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
    uploadButton: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8
    },
    uploadButtonText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.WHITE
    },
    placeholderText: {
        color: ColorConstants.GRAY,
    }
});

export default LogEngagementModal;
