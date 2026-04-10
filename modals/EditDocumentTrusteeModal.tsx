import { apiGet } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import CustomDatePicker from '@/components/CustomDatePicker';
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
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface EditDocumentModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initialData?: any;
}

const EditDocumentTrusteeModal: React.FC<EditDocumentModalProps> = ({
    visible,
    onClose,
    onSave,
    initialData,
}) => {
    const [formData, setFormData] = useState({
        documentTitle: '',
        category: '',
        customFolder: '',
        issueDate: new Date(),
        expirationDate: new Date(),
        note: '',
        uploadedBy: '',
        uploadedDate: '',
        fileSize: '',
        status: '',
        fileType: '',
    });
    console.log("initialData-->>>", initialData);
    const [isEditMode, setIsEditMode] = useState(false);

    const [tags, setTags] = useState<{ id: number; name: string }[]>([]);
    const [availableTags, setAvailableTags] = useState<{ id: number; name: string }[]>([]);
    const [availableCategories, setAvailableCategories] = useState<{ id: number; name: string }[]>([]);
    const [folders, setFolders] = useState<{ id: number; name: string }[]>([]);

    const [showIssueDatePicker, setShowIssueDatePicker] = useState(false);
    const [showExpirationDatePicker, setShowExpirationDatePicker] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [dateError, setDateError] = useState('');
    const [titleError, setTitleError] = useState('');
    const [tagsError, setTagsError] = useState('');

    const fetchTags = async () => {
        try {
            const response = await apiGet(ApiConstants.DOCUMENT_TAGS);
            if (response.data && Array.isArray(response.data.results)) {
                setAvailableTags(response.data.results);
            } else if (Array.isArray(response.data)) {
                setAvailableTags(response.data);
            }
        } catch (error) {
            console.error("Error fetching tags:", error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await apiGet(ApiConstants.HOMEOWNER_DOCUMENT_CATEGORIES);
            if (response.data && Array.isArray(response.data.results)) {
                setAvailableCategories(response.data.results);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const fetchFolders = async () => {
        try {
            // Use homeowner folders endpoint (family-member shared folders can return 403 for homeowners)
            const response = await apiGet(ApiConstants.MY_FOLDERS_LIST);
            const data = response.data;
            const list = Array.isArray(data)
                ? data
                : (data && Array.isArray(data.results) ? data.results : []);

            setFolders(
                list
                    .map((f: any) => ({
                        id: typeof f?.id === 'number' ? f.id : Number(f?.id),
                        name: f?.name ?? f?.title ?? '',
                    }))
                    .filter((f: any) => Number.isFinite(f.id) && !!f.name)
            );
        } catch (error) {
            console.error("Error fetching folders:", error);
        }
    };



    useEffect(() => {
        // Avoid fetching when modal isn't visible (prevents noisy errors on screens that mount this modal)
        if (!visible) return;
        fetchTags();
        fetchFolders();
        fetchCategories();
        setIsEditMode(false); // Reset to View Mode whenever modal opens
    }, [visible]);

    // Reset form when initialData changes or modal opens
    useEffect(() => {
        if (visible && initialData) {
            let initialTagsDisplay = [];
            if (Array.isArray(initialData.tags)) {
                initialTagsDisplay = initialData.tags;
            } else if (typeof initialData.tags === 'string') {
                initialTagsDisplay = initialData.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
            }

            // Map initial tag names to IDs from availableTags; create fallback objects for unmatched names
            const mappedTags = initialTagsDisplay.map((tagName: any, index: number) => {
                // Already an object with id
                if (typeof tagName === 'object' && tagName !== null) {
                    const id = tagName.id || tagName.pk;
                    const name = tagName.name || tagName.title;
                    if (id && name) return { id, name };
                }

                const nameStr = typeof tagName === 'string' ? tagName.trim() : '';
                if (!nameStr) return null;

                // Try to find in availableTags by name
                const found = availableTags.find(t => t.name.toLowerCase() === nameStr.toLowerCase());
                if (found) return found;

                // Try to find in availableTags if nameStr is actually an ID
                const foundById = availableTags.find(t => String(t.id) === nameStr);
                if (foundById) return foundById;

                // Fallback: create a tag object so it shows as a chip (but keep original name)
                return { id: -(index + 1), name: nameStr };
            }).filter((t: any): t is { id: number; name: string } => t !== null);
            setTags(mappedTags);

            setFormData({
                documentTitle: initialData.title || '',
                category: initialData.category || '',
                customFolder: initialData.folder || '',
                issueDate: initialData.issueDate ? new Date(initialData.issueDate) : new Date(),
                expirationDate: initialData.expirationDate ? new Date(initialData.expirationDate) : new Date(),
                note: initialData.note || '',
                uploadedBy: initialData.uploadedBy || '',
                uploadedDate: initialData.uploadedDate || '',
                fileSize: initialData.fileSize || '',
                status: initialData.status || '',
                fileType: initialData.fileType || '',
            });

            setDateError('');
            setTitleError('');
            setTagsError('');
        }
    }, [visible, initialData, availableTags]);

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (field === 'issueDate' || field === 'expirationDate') {
            setDateError('');
        }
        if (field === 'documentTitle') {
            setTitleError('');
        }
    };

    const formatDate = (date: Date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

    const handleToggleTag = (tag: { id: number; name: string }) => {
        setTags(prev => {
            const exists = prev.find(t => t.id === tag.id);
            if (exists) {
                return prev.filter(t => t.id !== tag.id);
            } else {
                setTagsError('');
                return [...prev, tag];
            }
        });
    };

    const toggleDropdown = (key: string) => {
        setOpenDropdown(prev => (prev === key ? null : key));
    };

    const renderViewMode = () => {
        return (
            <View>
                <View style={styles.inputContainer}>
                    <Text style={styles.labelView}>Document Title</Text>
                    <View style={styles.valueBox}>
                        <Text style={styles.valueText}>{formData.documentTitle || '- -'}</Text>
                    </View>
                </View>
                <View style={[styles.inputContainer]}>
                    <Text style={styles.labelView}>Category</Text>
                    <View style={styles.valueBox}>
                        <Text style={styles.valueText}>{formData.category || '- -'}</Text>
                    </View>
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.labelView}>Custom Folder</Text>
                    <View style={styles.valueBox}>
                        <Text style={styles.valueText}>{formData.customFolder || '- -'}</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                    <View style={[styles.inputContainer, { flex: 1 }]}>
                        <Text style={styles.labelView}>Issue Date</Text>
                        <View style={styles.valueBox}>
                            <Text style={styles.valueText}>{formatDate(formData.issueDate)}</Text>
                        </View>
                    </View>
                    <View style={[styles.inputContainer, { flex: 1 }]}>
                        <Text style={styles.labelView}>Expiration Date</Text>
                        <View style={styles.valueBox}>
                            <Text style={styles.valueText}>{formatDate(formData.expirationDate)}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.labelView}>Tags</Text>
                    <View style={styles.tagsDisplayRow}>
                        {tags.length > 0 ? tags.map(tag => (
                            <View key={tag.id} style={styles.tagChipView}>
                                <Text style={styles.tagText}>{tag.name}</Text>
                            </View>
                        )) : <Text style={styles.emptyText}>No tags selected</Text>}
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.labelView}>Note</Text>
                    <View style={styles.notesBox}>
                        <Text style={styles.valueText}>{formData.note || 'No notes added'}</Text>
                    </View>
                </View>
            </View>
        );
    };

    const renderEditMode = () => {
        return (
            <View>
                <CustomTextInput
                    label="Document Title"
                    value={formData.documentTitle}
                    onChangeText={(t) => handleInputChange('documentTitle', t)}
                    placeholder="Enter document title"
                />
                {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}

                {/* Category Dropdown */}
                <View style={[styles.inputContainer, { zIndex: 3000 }]}>
                    <Text style={styles.label}>Category</Text>
                    <TouchableOpacity
                        style={styles.dropdownButton}
                        onPress={() => toggleDropdown('category')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.inputText}>{formData.category || 'Select Category'}</Text>
                        <Image source={Icons.ic_down_arrow} style={styles.arrowIcon} />
                    </TouchableOpacity>

                    {openDropdown === 'category' && (
                        <View style={styles.dropdownList}>
                            <ScrollView nestedScrollEnabled >
                                {availableCategories.map((opt, index) => (
                                    <TouchableOpacity
                                        key={opt.id}
                                        style={[
                                            styles.dropdownItem,
                                            index === availableCategories.length - 1 && { borderBottomWidth: 0 }
                                        ]}
                                        onPress={() => {
                                            handleInputChange('category', opt.name);
                                            setOpenDropdown(null);
                                        }}
                                    >
                                        <Text style={styles.dropdownItemText}>{opt.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>

                {/* Custom Folder Dropdown */}
                <View style={[styles.inputContainer, { zIndex: 2000 }]}>
                    <Text style={styles.label}>Custom Folder</Text>
                    <TouchableOpacity
                        style={styles.dropdownButton}
                        onPress={() => toggleDropdown('folder')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.inputText}>{formData.customFolder || 'Select Folder'}</Text>
                        <Image source={Icons.ic_down_arrow} style={styles.arrowIcon} />
                    </TouchableOpacity>

                    {openDropdown === 'folder' && (
                        <View style={styles.dropdownList}>
                            <ScrollView nestedScrollEnabled>
                                {folders.map((opt, index) => (
                                    <TouchableOpacity
                                        key={opt.id}
                                        style={[
                                            styles.dropdownItem,
                                            index === folders.length - 1 && { borderBottomWidth: 0 }
                                        ]}
                                        onPress={() => {
                                            handleInputChange('customFolder', opt.name);
                                            setOpenDropdown(null);
                                        }}
                                    >
                                        <Text style={styles.dropdownItemText}>{opt.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>

                {/* Dates Row */}
                <View style={{ flexDirection: 'row', gap: 16, zIndex: 1200 }}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Issue Date</Text>
                        <TouchableOpacity style={styles.dateControl} onPress={() => setShowIssueDatePicker(true)}>
                            <Text style={styles.inputText}>{formatDate(formData.issueDate)}</Text>
                            <Image source={Icons.ic_calender} style={styles.calendarIcon} />
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Expiration Date</Text>
                        <TouchableOpacity style={styles.dateControl} onPress={() => setShowExpirationDatePicker(true)}>
                            <Text style={styles.inputText}>{formatDate(formData.expirationDate)}</Text>
                            <Image source={Icons.ic_calender} style={styles.calendarIcon} />
                        </TouchableOpacity>
                    </View>
                </View>
                {dateError ? <Text style={[styles.errorText, { marginTop: 4, marginBottom: 12 }]}>{dateError}</Text> : null}

                {/* Tags Dropdown */}
                <View style={[styles.inputContainer, { zIndex: 1000, marginTop: 10 }]}>
                    <Text style={styles.label}>Tags</Text>
                    <TouchableOpacity
                        style={styles.dropdownButton}
                        onPress={() => toggleDropdown('tags')}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.inputText, tags.length === 0 && { color: ColorConstants.GRAY }]}>
                            {tags.length > 0 ? tags.map(t => t.name).join(', ') : 'Select Tags'}
                        </Text>
                        <Image source={Icons.ic_down_arrow} style={styles.arrowIcon} />
                    </TouchableOpacity>

                    {openDropdown === 'tags' && (
                        <View style={styles.dropdownList}>
                            <ScrollView nestedScrollEnabled>
                                {availableTags.map((tag, index) => (
                                    <TouchableOpacity
                                        key={tag.id}
                                        style={[
                                            styles.dropdownItem,
                                            index === availableTags.length - 1 && { borderBottomWidth: 0 }
                                        ]}
                                        onPress={() => handleToggleTag(tag)}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Text style={styles.dropdownItemText}>{tag.name}</Text>
                                            {tags.find(t => t.id === tag.id) && (
                                                <Image source={Icons.ic_checkbox_tick2} style={styles.checkIcon} />
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                    {tagsError ? <Text style={styles.errorText}>{tagsError}</Text> : null}
                </View>

                {/* Note */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Note</Text>
                    <TextInput
                        style={styles.notesInput}
                        value={formData.note}
                        onChangeText={(t) => handleInputChange('note', t)}
                        placeholder="Add a note"
                        multiline
                    />
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={() => {
                        let hasError = false;

                        if (!formData.documentTitle.trim()) {
                            setTitleError('Document title is required');
                            hasError = true;
                        } else {
                            setTitleError('');
                        }

                        if (formData.expirationDate <= formData.issueDate) {
                            setDateError('Expiration date must be greater than issue date');
                            hasError = true;
                        } else {
                            setDateError('');
                        }

                        if (tags.length === 0) {
                            setTagsError('At least one tag is required');
                            hasError = true;
                        } else {
                            setTagsError('');
                        }

                        if (hasError) return;

                        const selectedCategory = availableCategories.find(c => c.name === formData.category);

                        const formatDateToYMD = (date: Date) => {
                            return date.toISOString().split('T')[0];
                        };

                        const formattedTags = tags.filter(t => t.id > 0).map(t => t.id).join(',');

                        const payload = new FormData();
                        payload.append('title', formData.documentTitle);
                        if (selectedCategory) payload.append('category', selectedCategory.id.toString());
                        // Custom folder logic mapping
                        if (formData.customFolder) {
                            const cF = folders.find(f => f.name === formData.customFolder);
                            if (cF) payload.append('folder', cF.id.toString());
                            else payload.append('folder', formData.customFolder);
                        }
                        if (formattedTags) payload.append('tags', formattedTags);

                        payload.append('description', formData.note);

                        onSave(payload);
                    }}>
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>

                <CustomDatePicker
                    show={showIssueDatePicker}
                    value={formData.issueDate}
                    onChange={(event, date) => {
                        if (date) handleInputChange('issueDate', date);
                    }}
                    onClose={() => setShowIssueDatePicker(false)}
                />

                <CustomDatePicker
                    show={showExpirationDatePicker}
                    value={formData.expirationDate}
                    onChange={(event, date) => {
                        if (date) handleInputChange('expirationDate', date);
                    }}
                    onClose={() => setShowExpirationDatePicker(false)}
                />
            </View>
        );
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
                        <View style={{ flex: 1 }}>
                            <Text style={styles.headerTitle}>
                                {isEditMode ? 'Edit Document' : 'Document Details'}
                            </Text>
                            <Text style={styles.headerSubtitle}>
                                {isEditMode
                                    ? 'Update document information and details'
                                    : 'Viewing document information.'}
                            </Text>
                        </View>

                        {!isEditMode && !initialData?.error && (
                            <TouchableOpacity
                                style={styles.editInfoButton}
                                onPress={() => setIsEditMode(true)}
                            >
                                <Image source={Icons.ic_edit2} style={styles.editInfoIcon} />
                                <Text style={styles.editInfoText}>Edit Info</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Image source={Icons.ic_cross} style={styles.closeIcon} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {initialData?.error && (
                            <View style={styles.errorBanner}>
                                <Text style={styles.errorBannerText}>{initialData.error}</Text>
                            </View>
                        )}
                        {isEditMode ? renderEditMode() : renderViewMode()}
                    </ScrollView>

                    {/* Footer for View Mode */}
                    {!isEditMode && (
                        <View style={styles.viewModeFooter}>
                            <TouchableOpacity style={styles.closeButtonFull} onPress={onClose}>
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};


export default EditDocumentTrusteeModal;


const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        paddingHorizontal: 20
    },
    modalContainer: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        height: '80%',
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 22,
        color: ColorConstants.BLACK2,
    },
    headerSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
        marginTop: 2,
    },
    closeButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeIcon: {
        width: 12,
        height: 12,
        tintColor: ColorConstants.BLACK2,
    },
    editInfoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ColorConstants.DARK_CYAN,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginRight: 10,
        alignSelf: 'center'
        // marginTop: 6
    },
    editInfoIcon: {
        width: 14,
        height: 14,
        tintColor: ColorConstants.WHITE,
        marginRight: 6,
    },
    editInfoText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 12,
        color: ColorConstants.WHITE,
    },
    scrollContent: {
        padding: 20,
    },
    label: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        marginBottom: 8,
    },
    labelView: {
        fontFamily: Fonts.mulishBold,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    valueBox: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 48,
        justifyContent: 'center',
        marginBottom: 16,
    },
    valueText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.BLACK2,
    },
    emptyText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.GRAY,
    },
    notesBox: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 16,
        justifyContent: 'center',
        marginBottom: 16,
        paddingVertical: 15
    },
    notesText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.BLACK2,
    },
    inputContainer: {
        marginBottom: 10,
        position: 'relative',

    },
    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 48,
        backgroundColor: ColorConstants.WHITE,
    },
    dateInputButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 48,
        backgroundColor: ColorConstants.WHITE,
    },
    inputText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 13,
        color: ColorConstants.BLACK2,
    },
    arrowIcon: {
        width: 12,
        height: 12,
        tintColor: ColorConstants.GRAY,
        resizeMode: 'contain',
    },
    calendarIcon: {
        width: 18,
        height: 18,
        tintColor: ColorConstants.GRAY,
        resizeMode: 'contain',
    },
    dateControl: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 48,
        backgroundColor: ColorConstants.WHITE,
    },
    dropdownList: {
        position: 'absolute',
        top: 76,
        left: 0,
        right: 0,
        backgroundColor: ColorConstants.WHITE,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 12,
        zIndex: 5000,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    dropdownItemText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    searchIcon: {
        width: 16,
        height: 16,
        tintColor: ColorConstants.GRAY,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        padding: 0,
    },
    customAddButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    plusIcon: {
        width: 12,
        height: 12,
        tintColor: ColorConstants.WHITE,
        marginRight: 6,
    },
    customAddText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 13,
        color: ColorConstants.WHITE,
    },
    tagInputParent: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    addTagActionButton: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 8,
        marginTop: 10,
        alignSelf: 'flex-start',
    },
    addTagButtonText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.WHITE,
    },
    tagsDisplayRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        marginBottom: 12,
        gap: 8,
    },
    tagChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ColorConstants.LIGHT_PEACH3,
        borderWidth: 1,
        borderColor: ColorConstants.BROWN20,
        paddingVertical: 5,
        paddingHorizontal: 12,
        borderRadius: 20,
        gap: 6,
    },
    tagText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 11,
        color: ColorConstants.PRIMARY_BROWN,
    },

    personalChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ColorConstants.LIGHT_PEACH3,
        borderWidth: 1,
        borderColor: ColorConstants.BROWN20,
        paddingVertical: 5,
        paddingHorizontal: 12,
        borderRadius: 20,
        gap: 6,
    },
    personalText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 12,
        color: ColorConstants.PRIMARY_BROWN,
    },
    professionalChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ColorConstants.LIGHT_PEACH3,
        borderWidth: 1,
        borderColor: ColorConstants.BROWN20,
        paddingVertical: 5,
        paddingHorizontal: 12,
        borderRadius: 20,
        gap: 6,
    },
    professionalText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 12,
        color: ColorConstants.PRIMARY_BROWN,
    },
    tagChipView: {
        backgroundColor: ColorConstants.LIGHT_PEACH3,
        borderWidth: 1,
        borderColor: ColorConstants.BROWN20,
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 20,
    },

    professionalChipView: {
        backgroundColor: ColorConstants.LIGHT_PEACH3,
        borderWidth: 1,
        borderColor: ColorConstants.BROWN20,
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    personalChipView: {
        backgroundColor: ColorConstants.LIGHT_PEACH3,
        borderWidth: 1,
        borderColor: ColorConstants.BROWN20,
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    removeTagBtn: {
        padding: 2,
    },
    removeTagIcon: {
        width: 8,
        height: 8,
        tintColor: ColorConstants.PRIMARY_BROWN,
    },

    removePersonalIcon: {
        width: 8,
        height: 8,
        tintColor: ColorConstants.PRIMARY_BROWN,
    },
    removeProfessionalIcon: {
        width: 8,
        height: 8,
        tintColor: ColorConstants.PRIMARY_BROWN,
    },
    selectedCheck: {
        width: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkIcon: {
        width: 18,
        height: 18,
        resizeMode: 'contain',
    },
    errorText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.RED,
        marginTop: 4,
    },
    errorBanner: {
        backgroundColor: '#FEE2E2',
        borderWidth: 1,
        borderColor: '#FECACA',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    errorBannerText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 14,
        color: '#B91C1C',
        textAlign: 'center',
    },
    summaryBox: {
        backgroundColor: '#E9ECF0',
        borderRadius: 16,
        padding: 20,
        marginTop: 24,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    summaryCol: {
        flex: 1,
    },
    summaryLabel: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 4,
    },
    summaryValue: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    statusBadge: {
        backgroundColor: ColorConstants.WHITE,
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusBadgeText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 12,
        color: ColorConstants.BLACK2,
    },
    fileTypeBadge: {
        backgroundColor: '#E0C8C1',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    fileTypeText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 12,
        color: ColorConstants.BLACK2,
    },
    viewModeFooter: {
        paddingHorizontal: 20,
        paddingBottom: 24,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    closeButtonFull: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        height: 42,
        width: 100,
        alignSelf: 'flex-end',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 16,
        color: ColorConstants.WHITE,
    },
    previewButton: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    previewButtonText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 12,
        color: ColorConstants.WHITE,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingTop: 32,
        paddingBottom: 12,
        gap: 16,
    },
    cancelButton: {
        height: 35,
        width: 88,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.DARK_CYAN,
    },
    saveButton: {
        height: 35,
        width: 140,
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-end',
        marginTop: 10
    },
    saveButtonText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.WHITE,
    },
    notesInput: {
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 100,
        textAlignVertical: 'top',
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        backgroundColor: ColorConstants.WHITE,
    },
    documentWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        padding: 10,
        borderRadius: 8,
        position: 'relative',
    },
    documentIconBox: {
        backgroundColor: '#E0E7FF',
        padding: 12,
        borderRadius: 8,
        marginRight: 12
    },
    documentIcon: {
        width: 24,
        height: 24,
        tintColor: '#4F46E5'
    },
    documentName: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 14,
        color: ColorConstants.BLACK2
    },
    documentSize: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: '#666',
        marginTop: 2
    }
});