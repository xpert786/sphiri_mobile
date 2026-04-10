import { apiGet, apiPatch, apiPost } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import CustomDatePicker from '@/components/CustomDatePicker';
import CustomTextInput from '@/components/CustomTextInput';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { StringConstants } from '@/constants/StringConstants';
import * as DocumentPicker from 'expo-document-picker';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';

interface UploadDocumentProps {
    visible: boolean;
    onClose: () => void;
    onUploadSuccess?: () => void;
    handleUpload?: (formData: any) => void;
    documentId?: number;
    initialDetails?: any | null;
}

interface Contact {
    id: number;
    name: string;
    relationship?: string;
    company?: string;
}

interface Tag {
    id: number;
    name: string;
}

const UploadDocumentModal: React.FC<UploadDocumentProps> = ({
    visible,
    onClose,
    onUploadSuccess,
    handleUpload,
    documentId,
    initialDetails,
}) => {
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        category_id: null as number | null,
        folder: '',
        folder_id: null as number | null,
        property: '',
        property_id: null as number | null,
        issueDate: '',
        expirationDate: '',
        tags: [] as number[],
        linked_contacts: [] as number[],
        linked_personal_contacts: [] as number[],
        linked_professional_contacts: [] as number[],
        note: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [customFolders, setCustomFolders] = useState<any[]>([]);
    const [defaultCategories, setDefaultCategories] = useState<any[]>([]);
    const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [fileUploaded, setFileUploaded] = useState(false);

    // Dropdown states
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [showFolderDropdown, setShowFolderDropdown] = useState(false);
    const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
    const [showTagDropdown, setShowTagDropdown] = useState(false);
    const [showContactDropdown, setShowContactDropdown] = useState(false);
    const [showPersonalContactDropdown, setShowPersonalContactDropdown] = useState(false);
    const [showProfessionalContactDropdown, setShowProfessionalContactDropdown] = useState(false);
    const [showCustomFolderModal, setShowCustomFolderModal] = useState(false);

    // Date picker states
    const [showIssueDatePicker, setShowIssueDatePicker] = useState(false);
    const [showExpirationDatePicker, setShowExpirationDatePicker] = useState(false);
    const [issueDate, setIssueDate] = useState<Date | null>(null);
    const [expirationDate, setExpirationDate] = useState<Date | null>(null);

    // API data states
    const [apiTags, setApiTags] = useState<Tag[]>([]);
    const [apiProperties, setApiProperties] = useState<any[]>([]);
    const [linkedContacts, setLinkedContacts] = useState<Contact[]>([]);
    const [personalContacts, setPersonalContacts] = useState<Contact[]>([]);
    const [professionalContacts, setProfessionalContacts] = useState<Contact[]>([]);

    // Selected items display
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
    const [selectedPersonalContacts, setSelectedPersonalContacts] = useState<Contact[]>([]);
    const [selectedProfessionalContacts, setSelectedProfessionalContacts] = useState<Contact[]>([]);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    // Search query states
    const [contactSearchQuery, setContactSearchQuery] = useState('');
    const [personalContactSearchQuery, setPersonalContactSearchQuery] = useState('');
    const [professionalContactSearchQuery, setProfessionalContactSearchQuery] = useState('');

    const isEditMode = !!documentId;

    useEffect(() => {
        if (!visible) return;
        fetchCustomFolders();
        fetchDefaultCategories();
        fetchProperties();
        fetchTags();
        fetchLinkedContacts();
        fetchPersonalContacts();
        fetchProfessionalContacts();

        setValidationErrors([]);

        if (!isEditMode) {
            // Fresh state for create mode
            setFormData({
                title: '',
                category: '',
                category_id: null,
                property: '',
                property_id: null,
                folder: '',
                folder_id: null,
                issueDate: '',
                expirationDate: '',
                tags: [],
                linked_contacts: [],
                linked_personal_contacts: [],
                linked_professional_contacts: [],
                note: '',
            });
            setSelectedTags([]);
            setSelectedContacts([]);
            setSelectedPersonalContacts([])
            setSelectedProfessionalContacts([]);
            setContactSearchQuery('');
            setPersonalContactSearchQuery('');
            setProfessionalContactSearchQuery('');
            setSelectedFile(null);
            setFileUploaded(false);
            setIssueDate(null);
            setExpirationDate(null);
        }
    }, [visible, isEditMode]);

    // Hydrate form for edit mode once we have initialDetails and supporting lists
    useEffect(() => {
        if (!visible || !isEditMode || !initialDetails) return;

        const categoryName = initialDetails.category_name || initialDetails.category?.name;
        const folderName = initialDetails.folder_name || initialDetails.folder?.name;

        const categoryObj = defaultCategories.find(c => c.name === categoryName);
        const folderObj = customFolders.find((f: any) => f.name === folderName);

        const tagNames: string[] =
            Array.isArray(initialDetails.tag_names) && initialDetails.tag_names.length > 0
                ? initialDetails.tag_names
                : (typeof initialDetails.tags === 'string'
                    ? initialDetails.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
                    : []);

        const matchedTags = apiTags.filter(tag =>
            tagNames.some(name => name.toLowerCase() === tag.name.toLowerCase())
        );

        const linkedIds: number[] = (initialDetails as any).linked_family_members_ids || [];
        const matchedContacts = linkedContacts.filter(c => linkedIds.includes(c.id));

        setFormData({
            title: initialDetails.title || '',
            property: initialDetails.property_name || '',
            property_id: initialDetails.property_id ?? null,
            category: categoryObj?.name || '',
            category_id: categoryObj?.id ?? null,
            folder: folderObj?.name || '',
            folder_id: folderObj?.id ?? null,
            issueDate: initialDetails.issue_date || '',
            expirationDate: initialDetails.expiration_date || '',
            tags: matchedTags.map(t => t.id),
            linked_contacts: matchedContacts.map(c => c.id),
            // TODO: Extract linked_personal_contacts from initialDetails if backend provides it
            linked_personal_contacts: [],
            linked_professional_contacts: [],
            note: initialDetails.description || '',
        });

        setSelectedTags(matchedTags);
        setSelectedContacts(matchedContacts);
        // TODO: Map selectedPersonalContacts if initialDetails provides the linked IDs
        setSelectedPersonalContacts([]);
        setSelectedProfessionalContacts([]);

        if (initialDetails.issue_date) {
            const dateObj = new Date(initialDetails.issue_date);
            setIssueDate(!isNaN(dateObj.getTime()) ? dateObj : new Date());
        } else {
            setIssueDate(new Date());
        }
        if (initialDetails.expiration_date) {
            const dateObj = new Date(initialDetails.expiration_date);
            setExpirationDate(!isNaN(dateObj.getTime()) ? dateObj : new Date());
        } else {
            setExpirationDate(new Date());
        }

        // Existing file is already uploaded; keep preview-only until user picks a new one
        setSelectedFile(null);
        setFileUploaded(false);
    }, [visible, isEditMode, initialDetails, defaultCategories, customFolders, apiTags, linkedContacts]);

    const fetchTags = async () => {
        try {
            const res = await apiGet(ApiConstants.DOCUMENT_TAGS);
            if (res.status === 200 || res.status === 201) {
                setApiTags(res.data.results || []);
            }
        } catch (error) {
            console.error('Error fetching tags in modal:', error);
        }
    };

    const fetchLinkedContacts = async () => {
        try {
            const res = await apiGet(ApiConstants.LINKED_CONTACTS);
            if (res.status === 200 || res.status === 201) {
                setLinkedContacts(res.data || []);
            }
        } catch (error) {
            console.error('Error fetching linked contacts:', error);
        }
    };


    const fetchPersonalContacts = async () => {
        try {
            const res = await apiGet(ApiConstants.PERSONAL_CONTACTS_LIST);
            if (res.status === 200 || res.status === 201) {
                setPersonalContacts(res.data || []);
            }
        } catch (error) {
            console.error('Error fetching personal contacts:', error);
        }
    };

    const fetchProfessionalContacts = async () => {
        try {
            const res = await apiGet(ApiConstants.VENDORS_LIST_CONTACTS);
            if (res.status === 200 || res.status === 201) {
                setProfessionalContacts(res.data || []);
            }
        } catch (error) {
            console.error('Error fetching professional contacts:', error);
        }
    };



    const fetchCustomFolders = async () => {
        try {
            const response = await apiGet(ApiConstants.MY_FOLDERS_LIST);
            const dataArr = Array.isArray(response.data) ? response.data : (response.data?.results || []);
            setCustomFolders(dataArr);
        } catch (error) {
            console.error('Error fetching custom folders:', error);
        }
    };

    const fetchDefaultCategories = async () => {
        try {
            const response = await apiGet(ApiConstants.DEFAULT_CATEGORIES);
            const dataArr = Array.isArray(response.data) ? response.data : (response.data?.results || []);
            console.log("dataArr in fetchDefaultCategories:", dataArr);

            setDefaultCategories(dataArr);
        } catch (error) {
            console.error('Error fetching default categories:', error);
        }
    };

    const fetchProperties = async () => {
        try {
            const response = await apiGet(ApiConstants.PROPERTIES);
            const dataArr = Array.isArray(response.data) ? response.data : (response.data?.results || []);
            setApiProperties(dataArr);
        } catch (error) {
            console.error('Error fetching properties:', error);
        }
    };


    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/png'],
                copyToCacheDirectory: true,
            });
            console.log("results in pickDocument:", result);


            if (!result.canceled && result.assets && result.assets.length > 0) {
                console.log("result.assets[0]", result.assets[0]);

                setSelectedFile(result.assets[0]);
                setFileUploaded(true);
            }
        } catch (err) {
            console.error('Error picking document:', err);
        }
    };



    // Format date to MM/DD/YYYY
    const formatDate = (date: Date): string => {
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

    // Handle issue date change
    const onIssueDateChange = (event: any, selectedDate?: Date) => {
        if (selectedDate) {
            setIssueDate(selectedDate);
            const formattedDate = formatDate(selectedDate);
            setFormData(prev => ({ ...prev, issueDate: formattedDate }));
        }
    };

    // Handle expiration date change
    const onExpirationDateChange = (event: any, selectedDate?: Date) => {
        if (selectedDate) {
            setExpirationDate(selectedDate);
            const formattedDate = formatDate(selectedDate);
            setFormData(prev => ({ ...prev, expirationDate: formattedDate }));
        }
    };

    // Show issue date picker
    const showIssueDatepicker = () => {
        setShowIssueDatePicker(true);
    };

    // Show expiration date picker
    const showExpirationDatepicker = () => {
        setShowExpirationDatePicker(true);
    };

    const toggleTag = (tag: Tag) => {
        setSelectedTags(prev => {
            const exists = prev.find(t => t.id === tag.id);
            if (exists) {
                return prev.filter(t => t.id !== tag.id);
            } else {
                return [...prev, tag];
            }
        });

        setFormData(prev => {
            const tagIds = selectedTags.some(t => t.id === tag.id)
                ? prev.tags.filter(id => id !== tag.id)
                : [...prev.tags, tag.id];
            return { ...prev, tags: tagIds };
        });
    };

    const toggleContact = (contact: Contact) => {
        setSelectedContacts(prev => {
            const exists = prev.find(c => c.id === contact.id);
            if (exists) {
                return prev.filter(c => c.id !== contact.id);
            } else {
                return [...prev, contact];
            }
        });

        setFormData(prev => {
            const contactIds = selectedContacts.some(c => c.id === contact.id)
                ? prev.linked_contacts.filter(id => id !== contact.id)
                : [...prev.linked_contacts, contact.id];
            return { ...prev, linked_contacts: contactIds };
        });
    };

    const togglePersonalContact = (contact: Contact) => {
        setSelectedPersonalContacts(prev => {
            const exists = prev.find(c => c.id === contact.id);
            if (exists) {
                return prev.filter(c => c.id !== contact.id);
            } else {
                return [...prev, contact];
            }
        });

        setFormData(prev => {
            const contactIds = selectedPersonalContacts.some(c => c.id === contact.id)
                ? prev.linked_personal_contacts.filter(id => id !== contact.id)
                : [...prev.linked_personal_contacts, contact.id];
            return { ...prev, linked_personal_contacts: contactIds };
        });
    };

    const toggleProfessionalContact = (contact: Contact) => {
        setSelectedProfessionalContacts(prev => {
            const exists = prev.find(c => c.id === contact.id);
            if (exists) {
                return prev.filter(c => c.id !== contact.id);
            } else {
                return [...prev, contact];
            }
        });

        setFormData(prev => {
            const contactIds = selectedProfessionalContacts.some(c => c.id === contact.id)
                ? prev.linked_professional_contacts.filter(id => id !== contact.id)
                : [...prev.linked_professional_contacts, contact.id];
            return { ...prev, linked_professional_contacts: contactIds };
        });
    };

    const formatDateForAPI = (dateString: string): string => {
        // If the date is in MM/DD/YYYY format, convert to YYYY-MM-DD
        if (dateString.includes('/')) {
            const [month, day, year] = dateString.split('/');
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        // If it's already in some other format, return as is or handle accordingly
        return dateString;
    };

    const handleUploadInternal = async () => {
        // Validation for required fields (excluding issueDate and expirationDate)
        const requiredFields = [
            { field: formData.title, name: 'Title', fieldName: 'title' },
            { field: formData.property_id, name: 'Property', fieldName: 'property' },
            { field: formData.folder, name: 'Folder', fieldName: 'folder' },
            { field: formData.tags.length > 0, name: 'Tags', fieldName: 'tags' },
            { field: formData.folder_id || formData.category_id, name: 'Folder or Category', fieldName: 'category' },
            { field: formData.linked_contacts.length > 0, name: 'Linked Family Member', fieldName: 'linked_contacts' },
            { field: formData.linked_personal_contacts.length > 0, name: 'Linked Personal Contact', fieldName: 'linked_personal_contacts' },
            { field: formData.linked_professional_contacts.length > 0, name: 'Linked Professional Contact', fieldName: 'linked_professional_contacts' },
            { field: formData.note, name: 'Note', fieldName: 'note' },
            // File is required only when creating a new document
            { field: isEditMode ? true : selectedFile, name: 'Document File', fieldName: 'file' },
        ];

        const missingFields = requiredFields
            .filter(item => !item.field)
            .map(item => item.name);

        if (missingFields.length > 0) {
            // Show Alert
            Alert.alert(
                'Missing Required Fields',
                `Please fill in all required fields:\n${missingFields.join('\n')}`,
                [{ text: 'OK', onPress: () => setValidationErrors([]) }]
            );
            setValidationErrors(missingFields);
            return;
        }

        if (!isEditMode && !selectedFile) return;

        setIsLoading(true);
        try {
            const uploadData = new FormData();
            uploadData.append('title', formData.title);

            // Priority: folder (custom) ID, then category (default) ID
            const categoryId = formData.folder_id || formData.category_id;
            if (categoryId) {
                uploadData.append('category', categoryId.toString());
            }

            if (formData.property_id) {
                uploadData.append('property', formData.property_id.toString());
            }

            if (selectedFile) {
                uploadData.append('file', {
                    uri: selectedFile.uri,
                    name: selectedFile.name,
                    type: selectedFile.mimeType || 'application/octet-stream',
                } as any);
            }

            uploadData.append('description', formData.note);

            // Tags as comma separated string
            if (formData.tags.length > 0) {
                uploadData.append('tags', formData.tags.join(','));
            }

            // Append linked contacts individually as linked_family_members
            if (formData.linked_contacts.length > 0) {
                formData.linked_contacts.forEach(contactId => {
                    uploadData.append('linked_family_members', contactId.toString());
                });
            }

            // Append linked personal contacts
            // Adjust the key ('linked_personal_contacts') based on what the backend expects
            if (formData.linked_personal_contacts && formData.linked_personal_contacts.length > 0) {
                formData.linked_personal_contacts.forEach(contactId => {
                    uploadData.append('linked_personal_contacts', contactId.toString());
                });
            }

            // Append linked professional contacts
            if (formData.linked_professional_contacts && formData.linked_professional_contacts.length > 0) {
                formData.linked_professional_contacts.forEach(contactId => {
                    uploadData.append('linked_vendors', contactId.toString());
                });
            }

            // Only append issue_date if it exists and is not empty
            if (formData.issueDate && formData.issueDate.trim() !== '') {
                const apiFormattedDate = formatDateForAPI(formData.issueDate);
                uploadData.append('issue_date', apiFormattedDate);
            }

            // Only append expiration_date if it exists and is not empty
            if (formData.expirationDate && formData.expirationDate.trim() !== '') {
                const apiFormattedDate = formatDateForAPI(formData.expirationDate);
                uploadData.append('expiration_date', apiFormattedDate);
            }

            console.log("uploadData in handleUploadInternal:", uploadData);

            const response = isEditMode && documentId
                ? await apiPatch(`${ApiConstants.HOMEOWNER_DOCUMENTS}${documentId}/`, uploadData, { isFormData: true })
                : await apiPost(ApiConstants.BASE_URL + ApiConstants.HOMEOWNER_DOCUMENTS, uploadData, { isFormData: true });

            console.log('Document saved successfully:', response.data);

            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: isEditMode ? 'Document updated successfully' : 'Document uploaded successfully',
            });

            if (onUploadSuccess) onUploadSuccess();
            onClose();
            // Reset form
            setFormData({
                title: '',
                category: '',
                category_id: null,
                folder: '',
                folder_id: null,
                property: '',
                property_id: null,
                issueDate: '',
                expirationDate: '',
                tags: [],
                linked_contacts: [],
                linked_personal_contacts: [],
                linked_professional_contacts: [],
                note: '',
            });
            setSelectedTags([]);
            setSelectedContacts([]);
            setSelectedPersonalContacts([]);
            setSelectedProfessionalContacts([]);
            setContactSearchQuery('');
            setPersonalContactSearchQuery('');
            setProfessionalContactSearchQuery('');
            setSelectedFile(null);
            setFileUploaded(false);
            setIssueDate(new Date());
            setExpirationDate(new Date());
            setValidationErrors([]);
        } catch (error) {
            console.error('Error uploading document:', error);
            alert('Failed to upload document. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };



    const renderValidationErrors = () => {
        if (validationErrors.length === 0) return null;

        return (
            <View style={styles.errorContainer}>
                <Image source={Icons.ic_warn} style={styles.errorIcon} />
                <Text style={styles.errorText}>
                    Please fill in: {validationErrors.join(', ')}
                </Text>
            </View>
        );
    };


    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const renderSelectedTags = () => {
        if (selectedTags.length === 0) return null;
        return (
            <View style={styles.selectedItemsContainer}>
                {selectedTags.map(tag => (
                    <View key={tag.id} style={styles.selectedItem}>
                        <Text style={styles.selectedItemText}>{tag.name}</Text>
                        <TouchableOpacity onPress={() => toggleTag(tag)}>
                            <Image source={Icons.ic_cross} style={styles.removeIcon} />
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        );
    };

    const renderSelectedContacts = () => {
        if (selectedContacts.length === 0) return null;
        return (
            <View style={styles.selectedItemsContainer}>
                {selectedContacts.map(contact => (
                    <View key={contact.id} style={styles.selectedItem}>
                        <Text style={styles.selectedItemText}>{contact.name}</Text>
                        <TouchableOpacity onPress={() => toggleContact(contact)}>
                            <Image source={Icons.ic_cross} style={styles.removeIcon} />
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        );
    };

    const renderSelectedPersonalContacts = () => {
        if (selectedPersonalContacts.length === 0) return null;
        return (
            <View style={styles.selectedItemsContainer}>
                {selectedPersonalContacts.map(contact => (
                    <View key={contact.id} style={styles.selectedItem}>
                        <Text style={styles.selectedItemText}>{contact.name}</Text>
                        <TouchableOpacity onPress={() => togglePersonalContact(contact)}>
                            <Image source={Icons.ic_cross} style={styles.removeIcon} />
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        );
    };

    const renderSelectedProfessionalContacts = () => {
        if (selectedProfessionalContacts.length === 0) return null;
        return (
            <View style={styles.selectedItemsContainer}>
                {selectedProfessionalContacts.map(contact => (
                    <View key={contact.id} style={styles.selectedItem}>
                        <Text style={styles.selectedItemText}>{contact.name}</Text>
                        <TouchableOpacity onPress={() => toggleProfessionalContact(contact)}>
                            <Image source={Icons.ic_cross} style={styles.removeIcon} />
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        );
    };

    const renderCustomFolderModal = () => {
        if (!showCustomFolderModal) return null;

        return (
            <View style={styles.customModalOverlay}>
                <View style={styles.customModalContainer}>
                    <View style={styles.customModalHeader}>
                        <View>
                            <Text style={styles.customModalTitle}>Create New Folder</Text>
                            <Text style={styles.customModalSubtitle}>Create a new custom folder for this document</Text>
                        </View>
                        <TouchableOpacity style={styles.closeBtn} onPress={() => setShowCustomFolderModal(false)}>
                            <Image source={Icons.ic_cross} style={styles.closeIcon} />
                        </TouchableOpacity>
                    </View>


                    <CustomTextInput
                        label="Folder Name"
                        placeholder="e.g., My Custom Folder"
                        value=""
                        onChangeText={() => { }}
                    />

                    <View style={styles.customModalFooter}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCustomFolderModal(false)}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.uploadBtn} onPress={() => setShowCustomFolderModal(false)}>
                            <Text style={styles.uploadBtnText}>Create & Use</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}
            >
                <View style={styles.modalContainer}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>

                        {/* Header */}
                        <View style={styles.header}>
                            <View>
                                <Text style={styles.modalTitle}>
                                    {isEditMode ? 'Edit Document' : StringConstants.UPLOAD_DOCUMENT}
                                </Text>
                                <Text style={styles.modalSubtitle}>
                                    {isEditMode
                                        ? 'Update document details and linked contacts.'
                                        : 'Add a new document to your secure archive.'}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <Image source={Icons.ic_cross} style={styles.closeIcon} />
                            </TouchableOpacity>
                        </View>
                        {/* Validation Errors */}
                        {renderValidationErrors()}

                        {/* Document Title */}
                        <CustomTextInput
                            label="Document Title"
                            placeholder="e.g., Home Insurance Policy"
                            value={formData.title}
                            onChangeText={(t) => handleInputChange('title', t)}
                        />


                        {/* Category & Custom Folder Row */}
                        <View style={[styles.row, { zIndex: 1000 }]}>
                            {/* Category */}
                            <View style={[styles.col, { marginRight: 10 }]}>
                                <Text style={styles.label}>Category</Text>
                                <TouchableOpacity
                                    style={styles.dropdown}
                                    onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                >
                                    <Text style={[styles.dropdownText, !formData.category && { color: ColorConstants.GRAY }]}>
                                        {formData.category || 'Select Category'}
                                    </Text>
                                    <Image source={Icons.ic_down_arrow} style={styles.arrowIcon} />
                                </TouchableOpacity>

                                {showCategoryDropdown && (
                                    <View style={styles.dropdownMenu}>
                                        <ScrollView nestedScrollEnabled >
                                            {defaultCategories.map((cat) => (
                                                <TouchableOpacity
                                                    key={cat.id}
                                                    style={styles.dropdownMenuItem}
                                                    onPress={() => {
                                                        setFormData(prev => ({ ...prev, category: cat.name, category_id: cat.id, folder: '', folder_id: null }));
                                                        setShowCategoryDropdown(false);
                                                    }}
                                                >
                                                    <Text style={styles.dropdownMenuText}>{cat.name}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}
                            </View>

                            {/* Folder */}
                            <View style={styles.col}>
                                <Text style={styles.label}>Custom Folder</Text>
                                <TouchableOpacity
                                    style={styles.dropdown}
                                    onPress={() => setShowFolderDropdown(!showFolderDropdown)}
                                >
                                    <Text style={[styles.dropdownText, !formData.folder && { color: ColorConstants.GRAY }]}>
                                        {formData.folder || 'Select Folder'}
                                    </Text>
                                    <Image source={Icons.ic_down_arrow} style={styles.arrowIcon} />
                                </TouchableOpacity>

                                {showFolderDropdown && (
                                    <View style={styles.dropdownMenu}>
                                        <ScrollView nestedScrollEnabled>
                                            {customFolders.map((cat) => (
                                                <TouchableOpacity
                                                    key={cat.id}
                                                    style={styles.dropdownMenuItem}
                                                    onPress={() => {
                                                        setFormData(prev => ({ ...prev, folder: cat.name, folder_id: cat.id, category: '', category_id: null }));
                                                        setShowFolderDropdown(false);
                                                    }}
                                                >
                                                    <Text style={styles.dropdownMenuText}>{cat.name}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}
                            </View>
                        </View>


                        {/* Property Dropdown */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Property</Text>
                            <TouchableOpacity
                                style={styles.dropdown}
                                onPress={() => setShowPropertyDropdown(!showPropertyDropdown)}
                            >
                                <Text style={[styles.dropdownText, !formData.property && { color: ColorConstants.GRAY }]}>
                                    {formData.property || 'Select Property'}
                                </Text>
                                <Image source={Icons.ic_down_arrow} style={styles.arrowIcon} />
                            </TouchableOpacity>

                            {showPropertyDropdown && (
                                <View style={styles.dropdownMenu}>
                                    <ScrollView nestedScrollEnabled>
                                        {apiProperties.map((prop) => (
                                            <TouchableOpacity
                                                key={prop.id}
                                                style={styles.dropdownMenuItem}
                                                onPress={() => {
                                                    setFormData(prev => ({ ...prev, property: prop.name, property_id: prop.id }));
                                                    setShowPropertyDropdown(false);
                                                }}
                                            >
                                                <Text style={styles.dropdownMenuText}>{prop.name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </View>


                        {/* Dates Row with DateTimePicker */}
                        <View style={styles.row}>
                            <View style={[styles.col, { marginRight: 10 }]}>
                                <Text style={styles.label}>Issue Date</Text>
                                <TouchableOpacity
                                    style={styles.datePickerButton}
                                    onPress={showIssueDatepicker}
                                >
                                    <Text style={[styles.datePickerText, !formData.issueDate && { color: ColorConstants.GRAY }]}>
                                        {formData.issueDate || 'Select Date'}
                                    </Text>
                                    <Image source={Icons.ic_calendar_outline} style={styles.calendarIcon} />
                                </TouchableOpacity>

                                <CustomDatePicker
                                    show={showIssueDatePicker}
                                    value={issueDate}
                                    onChange={onIssueDateChange}
                                    onClose={() => setShowIssueDatePicker(false)}
                                    maximumDate={new Date(2100, 11, 31)}
                                />
                            </View>

                            <View style={styles.col}>
                                <Text style={styles.label}>Expiration Date</Text>
                                <TouchableOpacity
                                    style={styles.datePickerButton}
                                    onPress={showExpirationDatepicker}
                                >
                                    <Text style={[styles.datePickerText, !formData.expirationDate && { color: ColorConstants.GRAY }]}>
                                        {formData.expirationDate || 'Select Date'}
                                    </Text>
                                    <Image source={Icons.ic_calendar_outline} style={styles.calendarIcon} />
                                </TouchableOpacity>

                                <CustomDatePicker
                                    show={showExpirationDatePicker}
                                    value={expirationDate}
                                    onChange={onExpirationDateChange}
                                    onClose={() => setShowExpirationDatePicker(false)}
                                    maximumDate={new Date(2100, 11, 31)}
                                />
                            </View>
                        </View>

                        {/* Tags - Multi-select Dropdown */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Tags</Text>
                            <TouchableOpacity
                                style={styles.dropdown}
                                onPress={() => setShowTagDropdown(!showTagDropdown)}
                            >
                                <Text style={[styles.dropdownText, selectedTags.length === 0 && { color: ColorConstants.GRAY }]}>
                                    {selectedTags.length > 0
                                        ? `${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''} selected`
                                        : 'Select tags...'}
                                </Text>
                                <Image source={Icons.ic_down_arrow} style={styles.arrowIcon} />
                            </TouchableOpacity>

                            {renderSelectedTags()}

                            {showTagDropdown && (
                                <View style={styles.dropdownMenu}>
                                    <ScrollView nestedScrollEnabled>
                                        {apiTags.map((tag) => (
                                            <TouchableOpacity
                                                key={tag.id}
                                                style={[
                                                    styles.dropdownMenuItem,
                                                    selectedTags.some(t => t.id === tag.id) && styles.selectedMenuItem
                                                ]}
                                                onPress={() => toggleTag(tag)}
                                            >
                                                <Text style={styles.dropdownMenuText}>{tag.name}</Text>
                                                {selectedTags.some(t => t.id === tag.id) && (
                                                    <Image source={Icons.ic_check} style={styles.checkIcon} />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </View>

                        {/* Linked Contact - Multi-select Dropdown */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Linked Family Member</Text>
                            <TouchableOpacity
                                style={styles.dropdown}
                                onPress={() => setShowContactDropdown(!showContactDropdown)}
                            >
                                <Text style={[styles.dropdownText, selectedContacts.length === 0 && { color: ColorConstants.GRAY }]}>
                                    {selectedContacts.length > 0
                                        ? `${selectedContacts.length} contact${selectedContacts.length > 1 ? 's' : ''} selected`
                                        : 'Select contacts...'}
                                </Text>
                                <Image source={Icons.ic_down_arrow} style={styles.arrowIcon} />
                            </TouchableOpacity>

                            {renderSelectedContacts()}

                            {showContactDropdown && (
                                <View style={styles.dropdownMenu}>
                                    <View style={styles.searchContainer}>
                                        <TextInput
                                            style={styles.searchInput}
                                            placeholder="Search contacts"
                                            value={contactSearchQuery}
                                            onChangeText={setContactSearchQuery}
                                            placeholderTextColor={ColorConstants.GRAY}
                                        />
                                    </View>
                                    <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
                                        {(() => {
                                            const filteredContacts = linkedContacts.filter(c => c.name.toLowerCase().includes(contactSearchQuery.toLowerCase()));
                                            if (filteredContacts.length === 0) {
                                                return <Text style={styles.noMatchText}>No matches found</Text>;
                                            }
                                            return filteredContacts.map((contact) => (
                                                <TouchableOpacity
                                                    key={contact.id}
                                                    style={[
                                                        styles.dropdownMenuItem,
                                                        selectedContacts.some(c => c.id === contact.id) && styles.selectedMenuItem
                                                    ]}
                                                    onPress={() => toggleContact(contact)}
                                                >
                                                    <View>
                                                        <Text style={styles.dropdownMenuText}>{contact.name}</Text>
                                                        {/* {contact.relationship && (
                                                            <Text style={styles.relationshipText}>{contact.relationship}</Text>
                                                        )} */}
                                                    </View>
                                                    {selectedContacts.some(c => c.id === contact.id) && (
                                                        <Image source={Icons.ic_check} style={styles.checkIcon} />
                                                    )}
                                                </TouchableOpacity>
                                            ));
                                        })()}
                                    </ScrollView>
                                </View>
                            )}
                        </View>


                        {/* Linked Personal - Multi-select Dropdown */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Linked Personal Contact</Text>
                            <TouchableOpacity
                                style={styles.dropdown}
                                onPress={() => setShowPersonalContactDropdown(!showPersonalContactDropdown)}
                            >
                                <Text style={[styles.dropdownText, selectedPersonalContacts.length === 0 && { color: ColorConstants.GRAY }]}>
                                    {selectedPersonalContacts.length > 0
                                        ? `${selectedPersonalContacts.length} contact${selectedPersonalContacts.length > 1 ? 's' : ''} selected`
                                        : 'Select contacts...'}
                                </Text>
                                <Image source={Icons.ic_down_arrow} style={styles.arrowIcon} />
                            </TouchableOpacity>

                            {renderSelectedPersonalContacts()}

                            {showPersonalContactDropdown && (
                                <View style={styles.dropdownMenu}>
                                    <View style={styles.searchContainer}>
                                        <TextInput
                                            style={styles.searchInput}
                                            placeholder="Search personal contact"
                                            value={personalContactSearchQuery}
                                            onChangeText={setPersonalContactSearchQuery}
                                            placeholderTextColor={ColorConstants.GRAY}
                                        />
                                    </View>
                                    <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
                                        {(() => {
                                            const filteredContacts = personalContacts.filter(c => c.name.toLowerCase().includes(personalContactSearchQuery.toLowerCase()));
                                            if (filteredContacts.length === 0) {
                                                return <Text style={styles.noMatchText}>No matches found</Text>;
                                            }
                                            return filteredContacts.map((contact) => (
                                                <TouchableOpacity
                                                    key={contact.id}
                                                    style={[
                                                        styles.dropdownMenuItem,
                                                        selectedPersonalContacts.some(c => c.id === contact.id) && styles.selectedMenuItem
                                                    ]}
                                                    onPress={() => togglePersonalContact(contact)}
                                                >
                                                    <View>
                                                        <Text style={styles.dropdownMenuText}>{contact.name}</Text>
                                                        {contact.relationship && (
                                                            <Text style={styles.relationshipText}>{contact.relationship}</Text>
                                                        )}
                                                    </View>
                                                    {selectedPersonalContacts.some(c => c.id === contact.id) && (
                                                        <Image source={Icons.ic_check} style={styles.checkIcon} />
                                                    )}
                                                </TouchableOpacity>
                                            ));
                                        })()}
                                    </ScrollView>
                                </View>
                            )}
                        </View>

                        {/* Linked Professional Contact - Multi-select Dropdown */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Linked Professional Contact</Text>
                            <TouchableOpacity
                                style={styles.dropdown}
                                onPress={() => setShowProfessionalContactDropdown(!showProfessionalContactDropdown)}
                            >
                                <Text style={[styles.dropdownText, selectedProfessionalContacts.length === 0 && { color: ColorConstants.GRAY }]}>
                                    {selectedProfessionalContacts.length > 0
                                        ? `${selectedProfessionalContacts.length} contact${selectedProfessionalContacts.length > 1 ? 's' : ''} selected`
                                        : 'Select contacts...'}
                                </Text>
                                <Image source={Icons.ic_down_arrow} style={styles.arrowIcon} />
                            </TouchableOpacity>

                            {renderSelectedProfessionalContacts()}

                            {showProfessionalContactDropdown && (
                                <View style={styles.dropdownMenu}>
                                    <View style={styles.searchContainer}>
                                        <TextInput
                                            style={styles.searchInput}
                                            placeholder="Search vendors"
                                            value={professionalContactSearchQuery}
                                            onChangeText={setProfessionalContactSearchQuery}
                                            placeholderTextColor={ColorConstants.GRAY}
                                        />
                                    </View>
                                    <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
                                        {(() => {
                                            const query = professionalContactSearchQuery.toLowerCase();
                                            const filteredContacts = professionalContacts.filter(c =>
                                                c.name.toLowerCase().includes(query) ||
                                                (c.company && c.company.toLowerCase().includes(query))
                                            );
                                            if (filteredContacts.length === 0) {
                                                return <Text style={styles.noMatchText}>No matches found</Text>;
                                            }
                                            return filteredContacts.map((contact) => (
                                                <TouchableOpacity
                                                    key={contact.id}
                                                    style={[
                                                        styles.dropdownMenuItem,
                                                        selectedProfessionalContacts.some(c => c.id === contact.id) && styles.selectedMenuItem
                                                    ]}
                                                    onPress={() => toggleProfessionalContact(contact)}
                                                >
                                                    <View>
                                                        <Text style={styles.dropdownMenuText}>{contact.name}</Text>
                                                        {contact.company && (
                                                            <Text style={styles.relationshipText}>{contact.company}</Text>
                                                        )}
                                                    </View>
                                                    {selectedProfessionalContacts.some(c => c.id === contact.id) && (
                                                        <Image source={Icons.ic_check} style={styles.checkIcon} />
                                                    )}
                                                </TouchableOpacity>
                                            ));
                                        })()}
                                    </ScrollView>
                                </View>
                            )}
                        </View>

                        {/* Note */}
                        <CustomTextInput
                            label="Note"
                            placeholder="Add Note..."
                            value={formData.note}
                            onChangeText={(t) => handleInputChange('note', t)}
                            multiline={true}
                            inputStyles={{ height: 80, alignItems: 'flex-start' }}
                        />

                        {/* Upload Area */}
                        {!fileUploaded ? (
                            <TouchableOpacity style={styles.uploadArea} onPress={pickDocument}>
                                <Image source={Icons.ic_upload} style={styles.uploadAreaIcon} />
                                <Text style={styles.uploadAreaTitle}>Click here To Browse</Text>
                                <Text style={styles.uploadAreaSubtitle}>PDF, DOC, XLS, JPG, PNG up to 10MB</Text>
                            </TouchableOpacity>
                        ) : (
                            <>
                                <View style={styles.fileCard}>
                                    <View style={styles.fileInfoRow}>
                                        <View style={styles.fileIconWrapper}>
                                            <Image source={Icons.ic_file_corner} style={styles.fileIcon} />
                                        </View>
                                        <View style={styles.fileDetails}>
                                            <Text style={styles.fileName}>{selectedFile?.name || 'document.pdf'}</Text>
                                            <Text style={styles.fileSize}>{(selectedFile?.size || 0 / 1024).toFixed(2)} KB • Selected</Text>
                                        </View>
                                        <View style={styles.fileActions}>
                                            <TouchableOpacity onPress={() => {
                                                setSelectedFile(null);
                                                setFileUploaded(false);
                                            }}>
                                                <Image source={Icons.ic_cross_square} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    {isLoading && (
                                        <View style={styles.progressBarBg}>
                                            <View style={[styles.progressBarFill, { width: '50%' }]} />
                                        </View>
                                    )}
                                </View>
                            </>
                        )}

                        {/* Footer Buttons */}
                        <View style={styles.footer}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.uploadBtn, isLoading && { opacity: 0.7 }]}
                                onPress={handleUploadInternal}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color={ColorConstants.WHITE} />
                                ) : (
                                    <Text style={styles.uploadBtnText}>
                                        {isEditMode ? 'Save Changes' : 'Upload'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>

                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
            {/* {renderCustomFolderModal()} */}
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 16,
        padding: 20,
        maxHeight: Dimensions.get('window').height * 0.9,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    modalTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 20,
        color: ColorConstants.BLACK2,
        marginBottom: 4,
    },
    modalSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: '#666',
    },
    closeBtn: {
        padding: 4,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeIcon: {
        resizeMode: 'contain',
        tintColor: ColorConstants.BLACK2,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    col: {
        flex: 1,
    },
    dropdown: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 48,
        backgroundColor: ColorConstants.WHITE,
    },
    dropdownText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 13,
        color: ColorConstants.BLACK,
    },
    arrowIcon: {
        width: 12,
        height: 12,
        resizeMode: 'contain',
        tintColor: '#666',
    },
    datePickerButton: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 48,
        backgroundColor: ColorConstants.WHITE,
    },
    datePickerText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 13,
        color: ColorConstants.BLACK,
    },
    calendarIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
        tintColor: '#666',
    },
    dropdownMenu: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: ColorConstants.WHITE,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        marginTop: 4,
        zIndex: 999,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    dropdownMenuItem: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectedMenuItem: {
        backgroundColor: '#F3F4F6',
    },
    dropdownMenuText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.BLACK,
    },
    searchContainer: {
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    searchInput: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 13,
        color: ColorConstants.BLACK,
        backgroundColor: '#F9FAFB',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        height: 36,
    },
    noMatchText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        paddingVertical: 16,
    },
    relationshipText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    checkIcon: {
        width: 16,
        height: 16,
        tintColor: ColorConstants.PRIMARY_BROWN,
    },
    selectedItemsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        gap: 8,
    },
    selectedItem: {
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    selectedItemText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 13,
        color: ColorConstants.BLACK,
    },
    removeIcon: {
        width: 10,
        height: 10,
        tintColor: '#666',
    },
    customBtn: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        borderRadius: 6,
        paddingVertical: 8,
        alignItems: 'center',
        marginTop: 8,
        width: 70
    },
    customBtnText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 13,
        color: 'white',
    },
    uploadArea: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        borderRadius: 12,
        backgroundColor: '#FFF9F9',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 24,
        marginBottom: 20,
        marginTop: 10
    },
    uploadAreaIcon: {
        width: 28,
        height: 28,
        resizeMode: 'contain',
        tintColor: '#2D2F33',
        marginBottom: 12,
    },
    uploadAreaTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        marginBottom: 4,
        textAlign: 'center',
    },
    uploadAreaSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    fileCard: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 12,
        marginBottom: 20,
        marginTop: 10
    },
    fileInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    fileIconWrapper: {
        width: 36,
        height: 36,
        backgroundColor: '#E0AB9B',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    fileIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
        tintColor: 'white',
    },
    fileDetails: {
        flex: 1,
    },
    fileName: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    fileSize: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: '#666',
    },
    fileActions: {
        flexDirection: 'row',
        gap: 8,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: '#F3F4F6',
        borderRadius: 3,
        marginBottom: 6,
    },
    progressBarFill: {
        width: '100%',
        height: '100%',
        backgroundColor: '#34C759',
        borderRadius: 3,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    cancelBtn: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
    },
    cancelBtnText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
    },
    uploadBtn: {
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 8,
        backgroundColor: ColorConstants.PRIMARY_BROWN,
    },
    uploadBtnText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.WHITE,
    },
    customModalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: 20,
    },
    customModalContainer: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 16,
        padding: 20,
        width: '100%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    customModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    customModalTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 20,
        color: ColorConstants.BLACK2,
        marginBottom: 4,
    },
    customModalSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: '#666',
        maxWidth: 250,
    },
    customModalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        marginTop: 20,
    },
    errorContainer: {
        backgroundColor: '#FEE2E2',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FCA5A5',
    },
    errorIcon: {
        width: 20,
        height: 20,
        tintColor: '#DC2626',
        marginRight: 8,
    },
    errorText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 13,
        color: '#DC2626',
        flex: 1,
    },
});

export default UploadDocumentModal;