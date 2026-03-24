import { Icons } from '@/assets';
import CustomTextInput from '@/components/CustomTextInput';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
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

interface HomeDocumentModalProps {
    visible: boolean;
    onClose: () => void;
    onUpload: (formData: any) => void;
}

const HomeDocumentModal: React.FC<HomeDocumentModalProps> = ({
    visible,
    onClose,
    onUpload,
}) => {
    const [formData, setFormData] = useState({
        documentCategory: 'Select Category',
        documentTitle: '',
        issueDate: new Date(),
        expirationDate: new Date(),
        linkToContact: 'ABC Insurance Company',
        description: '',
        uploadedFile: null as any,
    });

    const [tags, setTags] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState('');

    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [showIssueDatePicker, setShowIssueDatePicker] = useState(false);
    const [showExpirationDatePicker, setShowExpirationDatePicker] = useState(false);

    const categoryOptions = ['Select Category', 'Insurance', 'Legal', 'Financial', 'Medical', 'Property'];
    const contactOptions = ['ABC Insurance Company', 'XYZ Legal Services', 'John Doe', 'Jane Smith'];

    // Helper function for formatting dates
    const formatDate = (date: Date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleDropdown = (key: string) => {
        setOpenDropdown(prev => (prev === key ? null : key));
    };

    const selectOption = (field: string, value: string) => {
        handleInputChange(field, value);
        setOpenDropdown(null);
    };

    const handleIssueDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowIssueDatePicker(false);
        }
        if (selectedDate) {
            handleInputChange('issueDate', selectedDate);
        }
        if (Platform.OS === 'ios' && event.type === 'dismissed') {
            setShowIssueDatePicker(false);
        }
    };

    const handleExpirationDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowExpirationDatePicker(false);
        }
        if (selectedDate) {
            handleInputChange('expirationDate', selectedDate);
        }
        if (Platform.OS === 'ios' && event.type === 'dismissed') {
            setShowExpirationDatePicker(false);
        }
    };

    const handleFilePick = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/png'],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                handleInputChange('uploadedFile', result.assets[0]);
            }
        } catch (err) {
            console.error('Error picking document:', err);
        }
    };

    const handleAddTag = () => {
        if (currentTag.trim() && !tags.includes(currentTag.trim())) {
            setTags([...tags, currentTag.trim()]);
            setCurrentTag('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const renderDropdown = (
        label: string,
        fieldKey: string,
        value: string,
        options: string[],
        zIndexVal: number,
        isRequired = false
    ) => (
        <View style={[styles.inputContainer, { zIndex: zIndexVal }]}>
            <Text style={styles.label}>
                {label} {isRequired && <Text style={styles.required}>*</Text>}
            </Text>
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
                    <ScrollView
                        style={styles.dropdownScroll}
                        nestedScrollEnabled={true}
                        showsVerticalScrollIndicator={true}
                    >
                        {options.map((opt, idx) => (
                            <TouchableOpacity
                                key={idx}
                                style={styles.dropdownItem}
                                onPress={() => selectOption(fieldKey, opt)}
                            >
                                <Text style={styles.dropdownItemText}>{opt}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
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
                        <Text style={styles.headerTitle}>Upload Document</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Image source={Icons.ic_cross} style={styles.closeIcon} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {/* File Upload Area */}
                        <TouchableOpacity style={styles.uploadArea} onPress={handleFilePick} activeOpacity={0.7}>
                            <Image source={Icons.ic_upload} style={styles.uploadIcon} />
                            <Text style={styles.uploadTitle}>Drop Files Here Or Click To Browse</Text>
                            <Text style={styles.uploadSubtitle}>Supports PDF, DOC, XLS, JPG, PNG (Max 25MB each)</Text>
                            {formData.uploadedFile && (
                                <Text style={styles.uploadedFileName}>📄 {formData.uploadedFile.name}</Text>
                            )}
                        </TouchableOpacity>

                        {/* Document Category & Title Row */}
                        <View style={styles.twoColumnRow}>
                            {renderDropdown('Document Category', 'documentCategory', formData.documentCategory, categoryOptions, 20, true)}

                            <View style={[styles.inputContainer, { zIndex: 1 }]}>
                                <CustomTextInput
                                    label="Document Title *"
                                    value={formData.documentTitle}
                                    onChangeText={(t) => handleInputChange('documentTitle', t)}
                                    placeholder="Enter document title"
                                />
                            </View>
                        </View>

                        {/* Issue Date & Expiration Date Row */}
                        <View style={styles.twoColumnRow}>
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Issue Date</Text>
                                <TouchableOpacity
                                    style={styles.dropdownButton}
                                    onPress={() => setShowIssueDatePicker(true)}
                                >
                                    <Text style={styles.inputText}>{formatDate(formData.issueDate)}</Text>
                                    <Image source={Icons.ic_calendar_outline} style={styles.calendarIcon} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Expiration Date</Text>
                                <TouchableOpacity
                                    style={styles.dropdownButton}
                                    onPress={() => setShowExpirationDatePicker(true)}
                                >
                                    <Text style={styles.inputText}>{formatDate(formData.expirationDate)}</Text>
                                    <Image source={Icons.ic_calendar_outline} style={styles.calendarIcon} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Link to Contact */}
                        {renderDropdown('Link to Contact', 'linkToContact', formData.linkToContact, contactOptions, 19)}

                        {/* Tags */}
                        <View style={styles.inputContainer}>
                            <View style={styles.tagInputRow}>
                                <View style={{ flex: 1 }}>
                                    <CustomTextInput
                                        label="Tags"
                                        value={currentTag}
                                        onChangeText={setCurrentTag}
                                        placeholder="Add tags"
                                        parentStyles={{ marginBottom: 0 }}
                                    />
                                </View>
                                <TouchableOpacity
                                    style={styles.addTagButton}
                                    onPress={handleAddTag}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.addTagButtonText}>Add</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Display Tags */}
                            {tags.length > 0 && (
                                <View style={styles.tagsContainer}>
                                    {tags.map((tag, index) => (
                                        <View key={index} style={styles.tagChip}>
                                            <Text style={styles.tagText}>{tag}</Text>
                                            <TouchableOpacity
                                                onPress={() => handleRemoveTag(tag)}
                                                style={styles.removeTagButton}
                                            >
                                                <Image source={Icons.ic_cross} style={styles.removeTagIcon} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* Description */}
                        <CustomTextInput
                            label="Description"
                            value={formData.description}
                            onChangeText={(t) => handleInputChange('description', t)}
                            placeholder="Add description"
                            multiline
                            inputStyles={{ height: 100, alignItems: 'flex-start' }}
                        />

                        {/* Footer Actions */}
                        <View style={styles.footer}>
                            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.uploadButton} onPress={() => onUpload(formData)}>
                                <Text style={styles.uploadButtonText}>Upload Document</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Date Pickers */}
                        {showIssueDatePicker && (
                            <DateTimePicker
                                value={formData.issueDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={handleIssueDateChange}
                            />
                        )}

                        {showExpirationDatePicker && (
                            <DateTimePicker
                                value={formData.expirationDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={handleExpirationDateChange}
                            />
                        )}
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
    uploadArea: {
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: ColorConstants.GRAY2,
        borderRadius: 12,
        paddingVertical: 40,
        paddingHorizontal: 20,
        alignItems: 'center',
        backgroundColor: ColorConstants.LIGHT_PEACH3,
        marginBottom: 20
    },
    uploadIcon: {
        width: 44,
        height: 44,
        tintColor: ColorConstants.BLACK2,
        marginBottom: 16,
        resizeMode: 'contain'
    },
    uploadTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.BLACK2,
        marginBottom: 8
    },
    uploadSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 11,
        color: ColorConstants.DARK_CYAN,
        textAlign: 'center'
    },
    uploadedFileName: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 13,
        color: ColorConstants.PRIMARY_BROWN,
        marginTop: 12
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
    required: {
        color: '#FF0000'
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
    inputText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 13,
        color: ColorConstants.BLACK
    },
    inputTextPlaceholder: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 13,
        color: ColorConstants.GRAY_50
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
        maxHeight: 180,
        zIndex: 1000,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    dropdownScroll: {
        maxHeight: 180
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
    descriptionInput: {
        minHeight: 100,
        alignItems: 'flex-start',
        paddingVertical: 12
    },
    tagInputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8
    },
    addTagButton: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        paddingHorizontal: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        height: 40
    },
    addTagButtonText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.WHITE
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12
    },
    tagChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ColorConstants.GRAY3,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        gap: 6
    },
    tagText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 13,
        color: ColorConstants.BLACK2
    },
    removeTagButton: {
        padding: 2
    },
    removeTagIcon: {
        width: 10,
        height: 10,
        tintColor: ColorConstants.GRAY5
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
    }
});

export default HomeDocumentModal;
