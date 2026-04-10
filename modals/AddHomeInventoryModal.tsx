import { apiGet, apiPost } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import CustomDatePicker from '@/components/CustomDatePicker';
import CustomTextInput from '@/components/CustomTextInput';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';

interface AddHomeInventoryModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddHomeInventoryModal: React.FC<AddHomeInventoryModalProps> = ({
    visible,
    onClose,
    onSuccess
}) => {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [categoryName, setCategoryName] = useState('');
    const [location, setLocation] = useState('');
    const [purchaseDate, setPurchaseDate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [estimatedValue, setEstimatedValue] = useState('');
    const [serialNumber, setSerialNumber] = useState('');
    const [description, setDescription] = useState('');
    const [specialOption, setSpecialOption] = useState<string | null>(null); // insured, high value, or heirloom
    const [vendor, setVendor] = useState<string | number>('');
    const [vendorName, setVendorName] = useState('');

    const [showVendorDropdown, setShowVendorDropdown] = useState(false);

    const [vendorsList, setVendorsList] = useState<any[]>([]);
    const [rawCategories, setRawCategories] = useState<any[]>([]);
    const [selectedParentCategory, setSelectedParentCategory] = useState<any>(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState<any>(null);
    const [selectedDetailedCategory, setSelectedDetailedCategory] = useState<any>(null);

    const [selectedFiles, setSelectedFiles] = useState<DocumentPicker.DocumentPickerAsset[]>([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (visible) {
            fetchOptions();
        }
    }, [visible]);

    const fetchOptions = async () => {
        try {
            const [contactsRes, categoriesRes] = await Promise.all([
                apiGet(ApiConstants.VENDORS_LIST_CONTACTS),
                apiGet(ApiConstants.HOME_INVENTORY_CATEGORIES)
            ]);
            if (contactsRes.data) {
                setVendorsList(contactsRes.data || []);
            }
            if (categoriesRes.data) {
                const data = Array.isArray(categoriesRes.data) ? categoriesRes.data : categoriesRes.data.results || [];
                setRawCategories(data);
            }
        } catch (error) {
            console.error('Error fetching options in HomeInventoryModal:', error);
        }
    };



    const specialSelections = [
        { label: 'Insured', value: 'insured' },
        { label: 'High Value', value: 'high_value' },
        { label: 'Heirloom', value: 'heirloom' },
    ];

    const pickFiles = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['*/*'],
                copyToCacheDirectory: true,
                multiple: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setSelectedFiles(prev => [...prev, ...result.assets]);
            }
        } catch (err) {
            console.error('Error picking file:', err);
        }
    };

    const handleRemoveFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSpecialOptionSelect = (option: string) => {
        setSpecialOption(prev => prev === option ? null : option);
        if (errors.specialOption) {
            setErrors(prev => ({ ...prev, specialOption: '' }));
        }
    };

    const handleCategorySelect = (item: any, level: number) => {
        // Toggle logic
        const currentSelected = [selectedParentCategory, selectedSubCategory, selectedDetailedCategory][level - 1];
        if (currentSelected?.id === item.id) {
            if (level === 1) {
                setSelectedParentCategory(null);
                setSelectedSubCategory(null);
                setSelectedDetailedCategory(null);
            } else if (level === 2) {
                setSelectedSubCategory(null);
                setSelectedDetailedCategory(null);
            } else {
                setSelectedDetailedCategory(null);
            }
            setCategory('');
            setCategoryName('');
            return;
        }

        // Selection logic
        if (level === 1) {
            setSelectedParentCategory(item);
            setSelectedSubCategory(null);
            setSelectedDetailedCategory(null);
        } else if (level === 2) {
            setSelectedSubCategory(item);
            setSelectedDetailedCategory(null);
        } else {
            setSelectedDetailedCategory(item);
        }

        if (!item.subcategories || item.subcategories.length === 0) {
            setCategory(item.id.toString());
            setCategoryName(item.name);
        } else {
            setCategory('');
            setCategoryName('');
        }
    };

    const renderCategorySelection = () => {
        const categoriesToRender = Array.isArray(rawCategories) ? rawCategories : [];

        return (
            <>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Category</Text>
                    <View style={styles.categoryGridContainer}>
                        {categoriesToRender.map((cat, idx) => {
                            const isLastItem = idx === categoriesToRender.length - 1;
                            const isOddCount = categoriesToRender.length % 2 !== 0;
                            return (
                                <TouchableOpacity
                                    key={idx}
                                    style={[
                                        styles.categoryGridItem,
                                        isLastItem && isOddCount && styles.fullWidthGridItem,
                                        selectedParentCategory?.id === cat.id && styles.selectedCategoryGridItem
                                    ]}
                                    onPress={() => handleCategorySelect(cat, 1)}
                                >
                                    <Text style={[
                                        styles.categoryGridText,
                                        selectedParentCategory?.id === cat.id && styles.selectedCategoryGridText
                                    ]}>
                                        {cat.name}
                                    </Text>
                                    {selectedParentCategory?.id === cat.id && (
                                        <View>
                                            <Image source={Icons.ic_check} style={styles.checkIconSmall} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                    {errors.category ? <Text style={styles.errorText}>{errors.category}</Text> : null}
                </View>

                {selectedParentCategory && selectedParentCategory.subcategories && selectedParentCategory.subcategories.length > 0 && (
                    <View style={styles.subcategoryWrapper}>
                        <Text style={styles.subcategoryTitle}>Subcategory for {selectedParentCategory.name}</Text>
                        <View style={styles.subcategoryBox}>
                            <View style={styles.subcategoryChipRow}>
                                {selectedParentCategory.subcategories.map((sub: any, idx: number) => (
                                    <TouchableOpacity
                                        key={idx}
                                        style={[
                                            styles.subCatChip,
                                            selectedSubCategory?.id === sub.id && styles.activeSubCatChip
                                        ]}
                                        onPress={() => handleCategorySelect(sub, 2)}
                                    >
                                        <Text style={[
                                            styles.subCatChipText,
                                            selectedSubCategory?.id === sub.id && styles.activeSubCatChipText
                                        ]}>
                                            {sub.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {selectedSubCategory && selectedSubCategory.subcategories && selectedSubCategory.subcategories.length > 0 && (
                                <View style={styles.detailedCatRow}>
                                    {selectedSubCategory.subcategories.map((detailed: any, idx: number) => (
                                        <TouchableOpacity
                                            key={idx}
                                            style={[
                                                styles.detailedCatChip,
                                                selectedDetailedCategory?.id === detailed.id && styles.activeDetailedCatChip
                                            ]}
                                            onPress={() => handleCategorySelect(detailed, 3)}
                                        >
                                            <Text style={[
                                                styles.detailedCatChipText,
                                                selectedDetailedCategory?.id === detailed.id && styles.activeDetailedCatChipText
                                            ]}>
                                                {detailed.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {(selectedParentCategory || selectedSubCategory || selectedDetailedCategory) && (
                    <View style={styles.selectedPathBox}>
                        <Image source={Icons.ic_check} style={styles.pathCheckIcon} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.pathLabel}>
                                Selected: <Text style={styles.pathValue}>
                                    {[
                                        selectedParentCategory?.name,
                                        selectedSubCategory?.name,
                                        selectedDetailedCategory?.name
                                    ].filter(Boolean).join(' / ')}
                                </Text>
                            </Text>
                        </View>
                    </View>
                )}
            </>
        );
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!name.trim()) newErrors.name = 'Item name is required';
        if (!categoryName) {
            if (!selectedParentCategory) {
                newErrors.category = 'Please select a category';
            } else if (selectedParentCategory.subcategories?.length > 0 && !selectedSubCategory) {
                newErrors.category = 'Please select a subcategory';
            } else if (selectedSubCategory?.subcategories?.length > 0 && !selectedDetailedCategory) {
                newErrors.category = 'Please select a detailed category';
            } else {
                newErrors.category = 'Please select a category';
            }
        }
        if (!purchaseDate) newErrors.purchaseDate = 'Please select purchase date';
        if (!estimatedValue.trim()) newErrors.estimatedValue = 'Estimated value is required';
        if (!serialNumber.trim()) newErrors.serialNumber = 'Serial / Model # is required';
        if (!vendor) newErrors.vendor = 'Please select a vendor';
        if (!specialOption) newErrors.specialOption = 'Please select a classification';
        if (selectedFiles.length === 0) newErrors.files = 'Please select at least one file';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleUpload = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            const formData = new FormData();

            // Append each selected file appropriately
            selectedFiles.forEach((file, index) => {
                const fileToAppend = {
                    uri: file.uri,
                    name: file.name || `file_${index}`,
                    type: file.mimeType || 'application/octet-stream',
                };

                const mimeType = file.mimeType || '';

                if (mimeType.startsWith('video/')) {
                    formData.append('video_url', fileToAppend as any);
                } else if (
                    mimeType.includes('pdf') ||
                    mimeType.includes('doc') ||
                    mimeType.includes('msword') ||
                    mimeType.includes('officedocument') ||
                    mimeType.includes('text')
                ) {
                    formData.append('receipt_url', fileToAppend as any);
                } else {
                    formData.append('photo_url', fileToAppend as any);
                }
            });

            formData.append('name', name);
            formData.append('category', selectedParentCategory?.name || '');
            formData.append('category_id', selectedParentCategory?.id?.toString() || '');
            formData.append('subcategory', selectedDetailedCategory?.name || selectedSubCategory?.name || '');
            formData.append('subcategory_id', selectedDetailedCategory?.id?.toString() || selectedSubCategory?.id?.toString() || '');
            formData.append('room', location);

            // Format date as YYYY-MM-DD
            if (purchaseDate) {
                const year = purchaseDate.getFullYear();
                const month = String(purchaseDate.getMonth() + 1).padStart(2, '0');
                const day = String(purchaseDate.getDate()).padStart(2, '0');
                formData.append('purchase_date', `${year}-${month}-${day}`);
            }

            formData.append('current_value', estimatedValue);
            formData.append('serial_number', serialNumber);
            formData.append('notes', description);
            formData.append('vendor', vendor.toString());
            formData.append('is_insured', String(specialOption === 'insured'));
            formData.append('is_high_value', String(specialOption === 'high_value'));
            formData.append('is_heirloom', String(specialOption === 'heirloom'));

            const response = await apiPost(ApiConstants.HOME_INVENTORY, formData, { isFormData: true });
            console.log('Home inventory item added:', response.data);

            if (response.data) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Home inventory item added successfully',
                });
            }

            resetForm();
            onSuccess();
        } catch (error) {
            console.error('Error uploading home inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setName('');
        setCategory('');
        setCategoryName('');
        setSelectedParentCategory(null);
        setSelectedSubCategory(null);
        setSelectedDetailedCategory(null);
        setLocation('');
        setPurchaseDate(null);
        setEstimatedValue('');
        setSerialNumber('');
        setDescription('');
        setSpecialOption(null);
        // setServiceAgreement('');
        // setServiceAgreementName('');
        setVendor('');
        setVendorName('');
        setSelectedFiles([]);
        setErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.viewContainer}>
                        <View style={styles.header}>
                            <View style={styles.headerTextContainer}>
                                <Text style={styles.headerTitle}>Add Home Inventory</Text>
                                <Text style={styles.headerSubtitle}>Capture and store important assets or documents of your home.</Text>
                            </View>
                            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                                <Image source={Icons.ic_cross} style={styles.closeIcon} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                            <View style={styles.formContainer}>
                                <CustomTextInput
                                    label="Item Name / Title"
                                    value={name}
                                    onChangeText={(text) => {
                                        setName(text);
                                        if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                                    }}
                                    placeholder="e.g., HVAC System, Kitchen Appliances"
                                    parentStyles={{ marginBottom: 16 }}
                                    error={errors.name}
                                />

                                {renderCategorySelection()}

                                <CustomTextInput
                                    label="Location/Room"
                                    value={location}
                                    onChangeText={setLocation}
                                    placeholder="e.g., Kitchen, Master Bedroom"
                                    parentStyles={{ marginBottom: 16 }}
                                />

                                {/* Purchase Date */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Purchase Date</Text>
                                    <TouchableOpacity
                                        style={styles.datePickerButton}
                                        onPress={() => setShowDatePicker(true)}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[styles.inputText, { color: purchaseDate ? ColorConstants.BLACK2 : ColorConstants.GRAY }]}>
                                            {purchaseDate ? `${String(purchaseDate.getMonth() + 1).padStart(2, '0')}/${String(purchaseDate.getDate()).padStart(2, '0')}/${purchaseDate.getFullYear()}` : 'MM/DD/YYYY'}
                                        </Text>
                                        <Image source={Icons.ic_calendar_outline} style={styles.calendarIcon} />
                                    </TouchableOpacity>
                                    <CustomDatePicker
                                        show={showDatePicker}
                                        value={purchaseDate || new Date()}
                                        onChange={(event, selectedDate) => {
                                            if (selectedDate) {
                                                setPurchaseDate(selectedDate);
                                                if (errors.purchaseDate) setErrors(prev => ({ ...prev, purchaseDate: '' }));
                                            }
                                        }}
                                        onClose={() => setShowDatePicker(false)}
                                    />
                                    {errors.purchaseDate ? <Text style={styles.errorText}>{errors.purchaseDate}</Text> : null}
                                </View>

                                <View style={styles.row}>
                                    <View style={{ flex: 0.45 }}>
                                        <CustomTextInput
                                            label="Estimated Value ($)"
                                            value={estimatedValue}
                                            onChangeText={(text) => {
                                                setEstimatedValue(text);
                                                if (errors.estimatedValue) setErrors(prev => ({ ...prev, estimatedValue: '' }));
                                            }}
                                            placeholder="0.00"
                                            keyboardType="numeric"
                                            parentStyles={{ marginBottom: 16 }}
                                            error={errors.estimatedValue}
                                            labelsStyles={{ fontSize: 12 }}
                                        />
                                    </View>
                                    <View style={{ flex: 0.55 }}>
                                        <CustomTextInput
                                            label="Serial / Model #"
                                            value={serialNumber}
                                            onChangeText={(text) => {
                                                setSerialNumber(text);
                                                if (errors.serialNumber) setErrors(prev => ({ ...prev, serialNumber: '' }));
                                            }}
                                            placeholder="Enter serial number"
                                            parentStyles={{ marginBottom: 16 }}
                                            error={errors.serialNumber}
                                            labelsStyles={{ fontSize: 12 }}
                                        />
                                    </View>
                                </View>



                                {/* Related Service Agreement Dropdown */}
                                {/* <View style={[styles.inputContainer, { zIndex: 900 }]}>
                                    <Text style={styles.label}>Service Agreement</Text>
                                    <TouchableOpacity
                                        style={styles.dropdownButton}
                                        onPress={() => setShowServiceAgreementDropdown(!showServiceAgreementDropdown)}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[styles.inputText, { color: serviceAgreementName ? ColorConstants.BLACK2 : ColorConstants.GRAY }]}>
                                            {serviceAgreementName || 'Select Service Agreement'}
                                        </Text>
                                        <Image source={Icons.ic_down_arrow} style={styles.arrowIcon} />
                                    </TouchableOpacity>

                                    {showServiceAgreementDropdown && (
                                        <View style={styles.dropdownList}>
                                            <ScrollView
                                                style={styles.dropdownScroll}
                                                nestedScrollEnabled={true}
                                                showsVerticalScrollIndicator={true}
                                            >
                                                {serviceAgreementsList.map((opt, idx) => (
                                                    <TouchableOpacity
                                                        key={idx}
                                                        style={styles.dropdownItem}
                                                        onPress={() => {
                                                            setServiceAgreement(opt.id);
                                                            setServiceAgreementName(opt.title || opt.name);
                                                            setShowServiceAgreementDropdown(false);
                                                        }}
                                                    >
                                                        <Text style={styles.dropdownItemText}>{opt.title || opt.name}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                                {serviceAgreementsList.length === 0 && (
                                                    <View style={styles.dropdownItem}>
                                                        <Text style={[styles.dropdownItemText, { color: ColorConstants.GRAY }]}>No agreements available</Text>
                                                    </View>
                                                )}
                                            </ScrollView>
                                        </View>
                                    )}
                                </View> */}

                                {/* Vendor Dropdown */}
                                <View style={[styles.inputContainer, { zIndex: 800 }]}>
                                    <Text style={styles.label}>Vendor</Text>
                                    <TouchableOpacity
                                        style={styles.dropdownButton}
                                        onPress={() => setShowVendorDropdown(!showVendorDropdown)}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[styles.inputText, { color: vendorName ? ColorConstants.BLACK2 : ColorConstants.GRAY }]}>
                                            {vendorName || 'Select Vendor'}
                                        </Text>
                                        <Image source={Icons.ic_down_arrow} style={styles.arrowIcon} />
                                    </TouchableOpacity>

                                    {showVendorDropdown && (
                                        <View style={styles.dropdownList}>
                                            <ScrollView
                                                style={styles.dropdownScroll}
                                                nestedScrollEnabled={true}
                                                showsVerticalScrollIndicator={true}
                                            >
                                                {vendorsList.map((opt, idx) => (
                                                    <TouchableOpacity
                                                        key={idx}
                                                        style={styles.dropdownItem}
                                                        onPress={() => {
                                                            setVendor(opt.id);
                                                            setVendorName(opt.email);
                                                            setShowVendorDropdown(false);
                                                            if (errors.vendor) setErrors(prev => ({ ...prev, vendor: '' }));
                                                        }}
                                                    >
                                                        <Text style={styles.dropdownItemText}>{opt.email}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                                {vendorsList.length === 0 && (
                                                    <View style={styles.dropdownItem}>
                                                        <Text style={[styles.dropdownItemText, { color: ColorConstants.GRAY }]}>No vendors available</Text>
                                                    </View>
                                                )}
                                            </ScrollView>
                                        </View>
                                    )}
                                    {errors.vendor ? <Text style={styles.errorText}>{errors.vendor}</Text> : null}
                                </View>

                                <CustomTextInput
                                    label="Notes / Story (Optional)"
                                    value={description}
                                    onChangeText={setDescription}
                                    placeholder="Add any story or details about this item..."
                                    multiline={true}
                                    inputStyles={{ height: 100 }}
                                    multiStyles={{ paddingTop: 12 }}
                                    parentStyles={{ marginBottom: 16 }}
                                />

                                {/* Special Options */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Special Classifications</Text>
                                    <View style={styles.specialOptionsRow}>
                                        {specialSelections.map((opt, idx) => {
                                            const isSelected = specialOption === opt.value;
                                            return (
                                                <TouchableOpacity
                                                    key={idx}
                                                    style={[styles.specialOptionChip, isSelected && styles.specialOptionChipSelected]}
                                                    onPress={() => handleSpecialOptionSelect(opt.value)}
                                                    activeOpacity={0.7}
                                                >
                                                    <Text style={[styles.specialOptionText, isSelected && styles.specialOptionTextSelected]}>{opt.label}</Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                    {errors.specialOption ? <Text style={styles.errorText}>{errors.specialOption}</Text> : null}
                                </View>

                                {/* Photo / Document Upload */}
                                <View style={styles.inputContainer}>
                                    <TouchableOpacity style={styles.uploadBox} onPress={() => {
                                        pickFiles();
                                        if (errors.files) setErrors(prev => ({ ...prev, files: '' }));
                                    }} activeOpacity={0.7}>
                                        <Image source={Icons.ic_gallery} style={styles.uploadIcon} />
                                        <Text style={styles.uploadBoxText}>Select Files</Text>
                                        <Text style={styles.uploadBoxSubText}>Supporting Images, Videos, PDFs, DOCs</Text>
                                    </TouchableOpacity>
                                    {errors.files ? <Text style={styles.errorText}>{errors.files}</Text> : null}

                                    {/* Selected Files List */}
                                    {selectedFiles.length > 0 && (
                                        <View style={styles.selectedFilesList}>
                                            {selectedFiles.map((file, index) => (
                                                <View key={index} style={styles.fileItem}>
                                                    <View style={styles.fileInfo}>
                                                        <MaterialIcons
                                                            name={file.mimeType?.startsWith('image/') ? 'image' : 'insert-drive-file'}
                                                            size={24}
                                                            color={ColorConstants.PRIMARY_BROWN}
                                                        />
                                                        <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                                                    </View>
                                                    <TouchableOpacity onPress={() => handleRemoveFile(index)}>
                                                        <Image source={Icons.ic_cross} style={styles.removeFileIcon} />
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            </View>
                        </ScrollView>

                        <View style={styles.footer}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose} disabled={loading}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.uploadBtn, loading && styles.uploadBtnDisabled]}
                                onPress={handleUpload}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color={ColorConstants.WHITE} />
                                ) : (
                                    <Text style={styles.uploadBtnText}>Upload Files</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    modalContainer: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 24,
        overflow: 'hidden',
        maxHeight: Dimensions.get('window').height * 0.85,
    },
    viewContainer: {
        padding: 24,
        flexShrink: 1, // Enable shrinking to parent's maxHeight
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    headerTextContainer: {
        flex: 1,
        paddingRight: 10,
    },
    headerTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 22,
        color: ColorConstants.BLACK2,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
        marginTop: 4,
        textAlign: 'center',
    },
    closeButton: {
        position: 'absolute',
        right: -8,
        top: -8,
        padding: 8,
    },
    closeIcon: {
        width: 14,
        height: 14,
        tintColor: ColorConstants.BLACK2,
    },
    formContainer: {
        marginBottom: 24,
    },
    uploadArea: {
        marginTop: 8,
    },
    uploadBox: {
        height: 180,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderStyle: 'dashed',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
    },
    uploadIcon: {
        width: 48,
        height: 48,
        tintColor: '#9CA3AF',
        marginBottom: 12,
    },
    uploadBoxText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.BLACK2,
        marginBottom: 4,
    },
    uploadBoxSubText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
    },
    previewImage: {
        width: '100%',
        height: '100%',
        borderRadius: 16,
        resizeMode: 'cover',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    cancelBtn: {
        height: 48,
        paddingHorizontal: 24,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        width: '48%',
    },
    cancelBtnText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.DARK_CYAN,
    },
    uploadBtn: {
        height: 48,
        paddingHorizontal: 24,
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        width: '48%',
    },
    uploadBtnDisabled: {
        backgroundColor: ColorConstants.GRAY3,
    },
    uploadBtnText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 13,
        color: ColorConstants.WHITE,
    },
    filePreviewContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    fileIcon: {
        width: 30,
        height: 30,
        tintColor: ColorConstants.PRIMARY_BROWN,
        marginBottom: 10,
        resizeMode: 'contain'
    },
    fileNameText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        textAlign: 'center',
    },
    fileSizeText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
        marginTop: 4,
    },
    scrollContent: {
        paddingBottom: 24,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        marginBottom: 8,
    },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 46,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    inputText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
    },
    arrowIcon: {
        width: 12,
        height: 12,
        tintColor: ColorConstants.GRAY,
        resizeMode: 'contain',
    },
    calendarIcon: {
        width: 17,
        height: 17,
        tintColor: ColorConstants.GRAY,
        resizeMode: 'contain',
    },
    dropdownList: {
        marginTop: 4,
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        maxHeight: 200,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    dropdownScroll: {
        paddingVertical: 8,
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    dropdownItemText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 46,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    categoryGridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
    },
    categoryGridItem: {
        width: '46.5%',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    fullWidthGridItem: {
        width: '100%',
    },
    selectedCategoryGridItem: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        borderColor: ColorConstants.PRIMARY_BROWN,
    },
    categoryGridText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 11,
        color: '#374151',
    },
    selectedCategoryGridText: {
        color: ColorConstants.WHITE,
    },
    checkIconSmall: {
        width: 14,
        height: 14,
        tintColor: ColorConstants.WHITE,
    },
    subcategoryWrapper: {
    },
    subcategoryTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 16,
        color: '#1F2937',
        marginBottom: 12,
    },
    subcategoryBox: {
        padding: 16,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderStyle: 'dashed',
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
    },
    subcategoryChipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    subCatChip: {
        paddingVertical: 7,
        paddingHorizontal: 12,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        backgroundColor: ColorConstants.WHITE,
    },
    activeSubCatChip: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        borderColor: ColorConstants.WHITE,
        borderWidth: 2,
    },
    subCatChipText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 11,
        color: '#4B5563',
    },
    activeSubCatChipText: {
        color: ColorConstants.WHITE,
        fontFamily: Fonts.ManropeBold,
    },
    detailedCatRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 16,
        paddingLeft: 12,
        borderLeftWidth: 2,
        borderLeftColor: '#FBBF24',
    },
    detailedCatChip: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        backgroundColor: '#FFFBEB',
        borderWidth: 1,
        borderColor: '#FEF3C7',
    },
    activeDetailedCatChip: {
        backgroundColor: '#FDE68A',
        borderColor: '#FBBF24',
    },
    detailedCatChipText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 12,
        color: '#92400E',
        textTransform: 'uppercase',
    },
    activeDetailedCatChipText: {
        color: '#78350F',
    },
    selectedPathBox: {
        marginTop: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 12,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 20,
    },
    pathCheckIcon: {
        width: 16,
        height: 16,
        marginRight: 10,
        tintColor: '#0F343F',
        marginTop: 2,
    },
    pathLabel: {
        fontFamily: Fonts.ManropeRegular,
        fontSize: 13,
        color: '#374151',
    },
    pathValue: {
        fontFamily: Fonts.ManropeBold,
        color: '#0F343F',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    specialOptionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    specialOptionChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    specialOptionChipSelected: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        borderColor: ColorConstants.PRIMARY_BROWN,
    },
    specialOptionText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 12,
        color: '#4B5563',
    },
    specialOptionTextSelected: {
        color: ColorConstants.WHITE,
    },
    selectedFilesList: {
        marginTop: 12,
        gap: 8,
    },
    fileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    fileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 10,
    },
    fileName: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        flex: 1,
    },
    errorText: {
        marginTop: 4,
        fontSize: 11,
        color: ColorConstants.RED,
        fontFamily: 'Inter-Regular',
    },
    removeFileIcon: {
        width: 16,
        height: 16,
        tintColor: ColorConstants.GRAY,
    },
});

export default AddHomeInventoryModal;
