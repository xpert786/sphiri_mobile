import { apiGet } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import CustomTextInput from '@/components/CustomTextInput';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import React, { useEffect, useState } from 'react';
import {
    Image,
    Modal,
    Platform,
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

const EditDocumentModal: React.FC<EditDocumentModalProps> = ({
    visible,
    onClose,
    onSave,
    initialData,
}) => {
    const [formData, setFormData] = useState({
        documentTitle: '',
        category: '',
        customFolder: '',
        property: '',
        property_id: null as number | null,
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


    const [tags, setTags] = useState<{ id: number; name: string }[]>([]);
    const [availableTags, setAvailableTags] = useState<{ id: number; name: string }[]>([]);
    const [availableCategories, setAvailableCategories] = useState<{ id: number; name: string }[]>([]);
    const [folders, setFolders] = useState<{ id: number; name: string }[]>([]);
    const [apiProperties, setApiProperties] = useState<any[]>([]);
    const [availableLinkedContacts, setAvailableLinkedContacts] = useState<{ id: number; name: string }[]>([]);
    const [personalContacts, setPersonalContacts] = useState<{ id: number; name: string; relationship?: string }[]>([]);
    const [professionalContacts, setProfessionalContacts] = useState<{ id: number; name: string; company?: string }[]>([]);

    const [selectedContacts, setSelectedContacts] = useState<{ id: number; name: string }[]>([]);
    const [selectedPersonalContacts, setSelectedPersonalContacts] = useState<{ id: number; name: string }[]>([]);
    const [selectedProfessionalContacts, setSelectedProfessionalContacts] = useState<{ id: number; name: string }[]>([]);

    const [contactSearchQuery, setContactSearchQuery] = useState('');
    const [personalContactSearchQuery, setPersonalContactSearchQuery] = useState('');
    const [professionalContactSearchQuery, setProfessionalContactSearchQuery] = useState('');

    const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [fileUploaded, setFileUploaded] = useState(false);

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

    const fetchLinkedContacts = async () => {
        try {
            const response = await apiGet(ApiConstants.LINKED_CONTACTS);
            if (response.data && Array.isArray(response.data.results)) {
                setAvailableLinkedContacts(response.data.results);
            } else if (Array.isArray(response.data)) {
                setAvailableLinkedContacts(response.data);
            }
        } catch (error) {
            console.error("Error fetching linked contacts:", error);
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

    useEffect(() => {
        // Avoid fetching when modal isn't visible (prevents noisy errors on screens that mount this modal)
        if (!visible) return;
        fetchTags();
        fetchFolders();
        fetchCategories();
        fetchProperties();
        fetchLinkedContacts();
        fetchPersonalContacts();
        fetchProfessionalContacts();
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
                if (typeof tagName === 'object' && tagName !== null && (tagName.id || tagName.pk)) {
                    return { id: tagName.id || tagName.pk, name: tagName.name || tagName.title };
                }
                const nameStr = typeof tagName === 'string' ? tagName.trim() : '';
                if (!nameStr) return null;

                // Try to find in availableTags
                const found = availableTags.find(t => t.name.toLowerCase() === nameStr.toLowerCase());
                if (found) return found;

                // Fallback: create a tag object so it shows as a chip
                return { id: -(index + 1), name: nameStr };
            }).filter((t: any): t is { id: number; name: string } => t !== null);
            setTags(mappedTags);

            setFormData({
                documentTitle: initialData.title || '',
                category: initialData.category || '',
                customFolder: initialData.folder || '',
                property: initialData.property || '', // Fallback if name is passed
                property_id: initialData.property_id || null,
                issueDate: initialData.issueDate ? new Date(initialData.issueDate) : new Date(),
                expirationDate: initialData.expirationDate ? new Date(initialData.expirationDate) : new Date(),
                note: initialData.note || '',
                uploadedBy: initialData.uploadedBy || '',
                uploadedDate: initialData.uploadedDate || '',
                fileSize: initialData.fileSize || '',
                status: initialData.status || '',
                fileType: initialData.fileType || '',
            });

            // Handle linked family members initialization
            if (Array.isArray(initialData.linked_family_members) && initialData.linked_family_members.length > 0) {
                const contactIds = Array.isArray(initialData.linked_family_members_ids) ? initialData.linked_family_members_ids : [];
                setSelectedContacts(initialData.linked_family_members.map((c: any, idx: number) => {
                    if (typeof c === 'object' && c !== null) {
                        return { id: c.id || c.pk, name: c.name || c.first_name || c.title || '' };
                    }
                    return { id: contactIds[idx] || -(idx + 1), name: typeof c === 'string' ? c : String(c) };
                }));
            } else {
                setSelectedContacts([]);
            }

            // Use requested: Linked personal contact me linked_contacts array
            if (Array.isArray(initialData.linked_contacts) && initialData.linked_contacts.length > 0) {
                const contactIds = Array.isArray(initialData.linked_contacts_ids) ? initialData.linked_contacts_ids : [];
                setSelectedPersonalContacts(initialData.linked_contacts.map((c: any, idx: number) => {
                    if (typeof c === 'object' && c !== null) {
                        return { id: c.id || c.pk, name: c.name || '' };
                    }
                    return { id: contactIds[idx] || -(idx + 1), name: typeof c === 'string' ? c : String(c) };
                }));
            } else if (Array.isArray(initialData.linked_personal_contacts) && initialData.linked_personal_contacts.length > 0) {
                const contactIds = Array.isArray(initialData.linked_personal_contacts_ids) ? initialData.linked_personal_contacts_ids : [];
                setSelectedPersonalContacts(initialData.linked_personal_contacts.map((c: any, idx: number) => {
                    if (typeof c === 'object' && c !== null) {
                        return { id: c.id || c.pk, name: c.name || '' };
                    }
                    return { id: contactIds[idx] || -(idx + 1), name: typeof c === 'string' ? c : String(c) };
                }));
            } else {
                setSelectedPersonalContacts([]);
            }

            if (Array.isArray(initialData.linked_vendors) && initialData.linked_vendors.length > 0) {
                const contactIds = Array.isArray(initialData.linked_vendors_ids) ? initialData.linked_vendors_ids : [];
                setSelectedProfessionalContacts(initialData.linked_vendors.map((c: any, idx: number) => {
                    if (typeof c === 'object' && c !== null) {
                        return { id: c.id || c.pk, name: c.name || '' };
                    }
                    return { id: contactIds[idx] || -(idx + 1), name: typeof c === 'string' ? c : String(c) };
                }));
            } else {
                setSelectedProfessionalContacts([]);
            }

            if (initialData.file_url) {
                const fileName = initialData.file_name || initialData.file_url.split('/').pop() || 'document.pdf';
                // Parse existing size string like "120 KB"
                let sizeNum = 0;
                if (initialData.fileSize) {
                    const parsed = parseFloat(initialData.fileSize);
                    if (!isNaN(parsed)) sizeNum = parsed * 1024; // approx bytes
                }
                setSelectedFile({
                    name: fileName,
                    uri: initialData.file_url,
                    size: sizeNum
                } as any);
                setFileUploaded(true);
            } else {
                setSelectedFile(null);
                setFileUploaded(false);
            }

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

    const handleRemoveTag = (tagId: number) => {
        setTags(tags.filter(tag => tag.id !== tagId));
    };

    const handleToggleContact = (contact: { id: number; name: string }) => {
        setSelectedContacts(prev => {
            const exists = prev.find(c => c.id === contact.id);
            if (exists) {
                return prev.filter(c => c.id !== contact.id);
            } else {
                return [...prev, contact];
            }
        });
    };

    const handleRemoveContact = (contactId: number) => {
        setSelectedContacts(selectedContacts.filter(c => c.id !== contactId));
    };

    const handleTogglePersonalContact = (contact: { id: number; name: string }) => {
        setSelectedPersonalContacts(prev => {
            const exists = prev.find(c => c.id === contact.id);
            if (exists) {
                return prev.filter(c => c.id !== contact.id);
            } else {
                return [...prev, contact];
            }
        });
    };

    const handleRemovePersonalContact = (contactId: number) => {
        setSelectedPersonalContacts(selectedPersonalContacts.filter(c => c.id !== contactId));
    };

    const handleToggleProfessionalContact = (contact: { id: number; name: string }) => {
        setSelectedProfessionalContacts(prev => {
            const exists = prev.find(c => c.id === contact.id);
            if (exists) {
                return prev.filter(c => c.id !== contact.id);
            } else {
                return [...prev, contact];
            }
        });
    };

    const handleRemoveProfessionalContact = (contactId: number) => {
        setSelectedProfessionalContacts(selectedProfessionalContacts.filter(c => c.id !== contactId));
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/png'],
                copyToCacheDirectory: true,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
                setSelectedFile(result.assets[0]);
                setFileUploaded(true);
            }
        } catch (err) {
            console.error('Error picking document:', err);
        }
    };

    const toggleDropdown = (key: string) => {
        setOpenDropdown(prev => (prev === key ? null : key));
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
                        <View>
                            <Text style={styles.headerTitle}>Edit Document</Text>
                            <Text style={styles.headerSubtitle}>Update document information and details</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Image source={Icons.ic_cross} style={styles.closeIcon} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {/* Document Title */}
                        <View style={{ marginBottom: titleError ? 0 : 0 }}>
                            <CustomTextInput
                                label="Document Title"
                                value={formData.documentTitle}
                                onChangeText={(t) => handleInputChange('documentTitle', t)}
                                placeholder="Enter document title"
                                parentStyles={{ marginBottom: titleError ? 4 : 16 }}
                            />
                            {titleError ? <Text style={[styles.errorText, { marginBottom: 12 }]}>{titleError}</Text> : null}
                        </View>

                        {/* Category Dropdown */}
                        <View style={[styles.inputContainer, { zIndex: 3000 }]}>
                            <Text style={styles.label}>Category</Text>
                            <TouchableOpacity
                                style={styles.dropdownButton}
                                onPress={() => toggleDropdown('category')}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.inputText}>{formData.category}</Text>
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
                            {/* <TouchableOpacity style={styles.customAddButton} activeOpacity={0.7}>
                                <Image source={Icons.ic_plus} style={styles.plusIcon} />
                                <Text style={styles.customAddText}>Custom</Text>
                            </TouchableOpacity> */}
                        </View>

                        {/* Custom Folder Dropdown */}
                        <View style={[styles.inputContainer, { zIndex: 2000 }]}>
                            <Text style={styles.label}>Custom Folder</Text>
                            <TouchableOpacity
                                style={styles.dropdownButton}
                                onPress={() => toggleDropdown('folder')}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.inputText}>{formData.customFolder}</Text>
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
                            {/* <TouchableOpacity style={styles.customAddButton} activeOpacity={0.7}>
                                <Image source={Icons.ic_plus} style={styles.plusIcon} />
                                <Text style={styles.customAddText}>New</Text>
                            </TouchableOpacity> */}
                        </View>

                        {/* Property Dropdown */}
                        <View style={[styles.inputContainer, { zIndex: 1500 }]}>
                            <Text style={styles.label}>Property</Text>
                            <TouchableOpacity
                                style={styles.dropdownButton}
                                onPress={() => toggleDropdown('property')}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.inputText}>
                                    {formData.property || 'Select Property'}
                                </Text>
                                <Image source={Icons.ic_down_arrow} style={styles.arrowIcon} />
                            </TouchableOpacity>

                            {openDropdown === 'property' && (
                                <View style={styles.dropdownList}>
                                    <ScrollView nestedScrollEnabled>
                                        {apiProperties.map((prop, index) => (
                                            <TouchableOpacity
                                                key={prop.id}
                                                style={[
                                                    styles.dropdownItem,
                                                    index === apiProperties.length - 1 && { borderBottomWidth: 0 }
                                                ]}
                                                onPress={() => {
                                                    setFormData(prev => ({ ...prev, property: prop.name, property_id: prop.id }));
                                                    setOpenDropdown(null);
                                                }}
                                            >
                                                <Text style={styles.dropdownItemText}>{prop.name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </View>

                        {/* Issue Date */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Issue Date</Text>
                            <TouchableOpacity
                                style={styles.dateInputButton}
                                onPress={() => setShowIssueDatePicker(true)}
                            >
                                <Text style={styles.inputText}>{formatDate(formData.issueDate)}</Text>
                                <Image source={Icons.ic_calendar_outline} style={styles.calendarIcon} />
                            </TouchableOpacity>
                        </View>

                        {/* Expiration Date */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Expiration Date</Text>
                            <TouchableOpacity
                                style={styles.dateInputButton}
                                onPress={() => setShowExpirationDatePicker(true)}
                            >
                                <Text style={styles.inputText}>{formatDate(formData.expirationDate)}</Text>
                                <Image source={Icons.ic_calendar_outline} style={styles.calendarIcon} />
                            </TouchableOpacity>
                            {dateError ? <Text style={styles.errorText}>{dateError}</Text> : null}
                        </View>

                        {/* Tags Dropdown */}
                        <View style={[styles.inputContainer, { zIndex: 1000 }]}>
                            <Text style={styles.label}>Tags</Text>
                            <TouchableOpacity
                                style={styles.dropdownButton}
                                onPress={() => toggleDropdown('tags')}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.inputText}>
                                    {tags.length > 0 ? `${tags.length} tags selected` : 'Select tags'}
                                </Text>
                                <Image source={Icons.ic_down_arrow} style={styles.arrowIcon} />
                            </TouchableOpacity>

                            {openDropdown === 'tags' && (
                                <View style={[styles.dropdownList]}>
                                    <ScrollView nestedScrollEnabled>
                                        {availableTags.map((tag, index) => {
                                            const isSelected = tags.some(t => t.id === tag.id);
                                            return (
                                                <TouchableOpacity
                                                    key={tag.id}
                                                    style={[
                                                        styles.dropdownItem,
                                                        isSelected && { backgroundColor: ColorConstants.PRIMARY_10 },
                                                        index === availableTags.length - 1 && { borderBottomWidth: 0 }
                                                    ]}
                                                    onPress={() => handleToggleTag(tag)}
                                                >
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Text style={[
                                                            styles.dropdownItemText,
                                                            isSelected && { fontFamily: Fonts.ManropeSemiBold, color: ColorConstants.PRIMARY_BROWN }
                                                        ]}>
                                                            {tag.name}
                                                        </Text>
                                                        {isSelected && (
                                                            <View style={styles.selectedCheck}>
                                                                <Image source={Icons.ic_check} style={styles.checkIcon} />
                                                            </View>
                                                        )}
                                                    </View>
                                                </TouchableOpacity>
                                            )
                                        })}
                                    </ScrollView>
                                </View>
                            )}

                            <View style={styles.tagsDisplayRow}>
                                {tags.map((tag) => (
                                    <View key={tag.id} style={styles.tagChip}>
                                        <Text style={styles.tagText}>{tag.name}</Text>
                                        <TouchableOpacity onPress={() => handleRemoveTag(tag.id)} style={styles.removeTagBtn}>
                                            <Image source={Icons.ic_cross} style={styles.removeTagIcon} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                            {tagsError ? <Text style={styles.errorText}>{tagsError}</Text> : null}
                        </View>

                        {/* Linked Family Member Dropdown */}
                        <View style={[styles.inputContainer, { zIndex: 500 }]}>
                            <Text style={styles.label}>Linked Family Member</Text>
                            <TouchableOpacity
                                style={styles.dropdownButton}
                                onPress={() => toggleDropdown('linkedContact')}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.inputText}>
                                    {selectedContacts.length > 0 ? `${selectedContacts.length} contacts selected` : 'Select contacts'}
                                </Text>
                                <Image source={Icons.ic_down_arrow} style={styles.arrowIcon} />
                            </TouchableOpacity>

                            {openDropdown === 'linkedContact' && (
                                <View style={[styles.dropdownList]}>
                                    <View style={{ padding: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
                                        <TextInput
                                            style={{ fontFamily: Fonts.mulishRegular, fontSize: 13, color: ColorConstants.BLACK, backgroundColor: '#F9FAFB', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8, height: 36 }}
                                            value={contactSearchQuery}
                                            onChangeText={setContactSearchQuery}
                                            placeholder="Search contacts"
                                            placeholderTextColor={ColorConstants.GRAY}
                                        />
                                    </View>
                                    <ScrollView nestedScrollEnabled style={{ maxHeight: 220 }}>
                                        {(() => {
                                            const filteredContacts = availableLinkedContacts.filter(c => c.name.toLowerCase().includes(contactSearchQuery.toLowerCase()));
                                            if (filteredContacts.length === 0) {
                                                return <Text style={{ padding: 16, textAlign: 'center', color: '#666' }}>No matches found</Text>;
                                            }
                                            return filteredContacts.map((contact, index) => {
                                                const isSelected = selectedContacts.some(c => c.id === contact.id);
                                                return (
                                                    <TouchableOpacity
                                                        key={contact.id}
                                                        style={[
                                                            styles.dropdownItem,
                                                            isSelected && { backgroundColor: ColorConstants.PRIMARY_10 },
                                                            index === filteredContacts.length - 1 && { borderBottomWidth: 0 }
                                                        ]}
                                                        onPress={() => handleToggleContact(contact)}
                                                    >
                                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Text style={[
                                                                styles.dropdownItemText,
                                                                isSelected && { fontFamily: Fonts.ManropeSemiBold, color: ColorConstants.PRIMARY_BROWN }
                                                            ]}>
                                                                {contact.name}
                                                            </Text>
                                                            {isSelected && (
                                                                <View style={styles.selectedCheck}>
                                                                    <Image source={Icons.ic_check} style={styles.checkIcon} />
                                                                </View>
                                                            )}
                                                        </View>
                                                    </TouchableOpacity>
                                                )
                                            })
                                        })()}
                                    </ScrollView>
                                </View>
                            )}

                            <View style={styles.tagsDisplayRow}>
                                {selectedContacts.map((contact) => (
                                    <View key={contact.id} style={styles.familyChip}>
                                        <Text style={styles.familyText}>{contact.name}</Text>
                                        <TouchableOpacity onPress={() => handleRemoveContact(contact.id)} style={styles.removeTagBtn}>
                                            <Image source={Icons.ic_cross} style={styles.removeFamilyIcon} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Linked Personal Contact Dropdown */}
                        <View style={[styles.inputContainer, { zIndex: 400 }]}>
                            <Text style={styles.label}>Linked Personal Contact</Text>
                            <TouchableOpacity
                                style={styles.dropdownButton}
                                onPress={() => toggleDropdown('linkedPersonalContact')}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.inputText}>
                                    {selectedPersonalContacts.length > 0 ? `${selectedPersonalContacts.length} contacts selected` : 'Select contacts'}
                                </Text>
                                <Image source={Icons.ic_down_arrow} style={styles.arrowIcon} />
                            </TouchableOpacity>

                            {openDropdown === 'linkedPersonalContact' && (
                                <View style={[styles.dropdownList]}>
                                    <View style={{ padding: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
                                        <TextInput
                                            style={{ fontFamily: Fonts.mulishRegular, fontSize: 13, color: ColorConstants.BLACK, backgroundColor: '#F9FAFB', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8, height: 36 }}
                                            value={personalContactSearchQuery}
                                            onChangeText={setPersonalContactSearchQuery}
                                            placeholder="Search personal contact"
                                            placeholderTextColor={ColorConstants.GRAY}
                                        />
                                    </View>
                                    <ScrollView nestedScrollEnabled style={{ maxHeight: 220 }}>
                                        {(() => {
                                            const filteredContacts = personalContacts.filter(c => c.name.toLowerCase().includes(personalContactSearchQuery.toLowerCase()));
                                            if (filteredContacts.length === 0) {
                                                return <Text style={{ padding: 16, textAlign: 'center', color: '#666' }}>No matches found</Text>;
                                            }
                                            return filteredContacts.map((contact, index) => {
                                                const isSelected = selectedPersonalContacts.some(c => c.id === contact.id);
                                                return (
                                                    <TouchableOpacity
                                                        key={contact.id}
                                                        style={[
                                                            styles.dropdownItem,
                                                            isSelected && { backgroundColor: ColorConstants.PRIMARY_10 },
                                                            index === filteredContacts.length - 1 && { borderBottomWidth: 0 }
                                                        ]}
                                                        onPress={() => handleTogglePersonalContact(contact)}
                                                    >
                                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <View>
                                                                <Text style={[
                                                                    styles.dropdownItemText,
                                                                    isSelected && { fontFamily: Fonts.ManropeSemiBold, color: ColorConstants.PRIMARY_BROWN }
                                                                ]}>
                                                                    {contact.name}
                                                                </Text>
                                                                {contact.relationship && (
                                                                    <Text style={{ fontFamily: Fonts.mulishRegular, fontSize: 12, color: '#666', marginTop: 2 }}>{contact.relationship}</Text>
                                                                )}
                                                            </View>
                                                            {isSelected && (
                                                                <View style={styles.selectedCheck}>
                                                                    <Image source={Icons.ic_check} style={styles.checkIcon} />
                                                                </View>
                                                            )}
                                                        </View>
                                                    </TouchableOpacity>
                                                )
                                            })
                                        })()}
                                    </ScrollView>
                                </View>
                            )}

                            <View style={styles.tagsDisplayRow}>
                                {selectedPersonalContacts.map((contact) => (
                                    <View key={contact.id} style={styles.personalChip}>
                                        <Text style={styles.personalText}>{contact.name}</Text>
                                        <TouchableOpacity onPress={() => handleRemovePersonalContact(contact.id)} style={styles.removeTagBtn}>
                                            <Image source={Icons.ic_cross} style={styles.removePersonalIcon} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Linked Professional Contact Dropdown */}
                        <View style={[styles.inputContainer, { zIndex: 300 }]}>
                            <Text style={styles.label}>Linked Professional Contact</Text>
                            <TouchableOpacity
                                style={styles.dropdownButton}
                                onPress={() => toggleDropdown('linkedProfessionalContact')}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.inputText}>
                                    {selectedProfessionalContacts.length > 0 ? `${selectedProfessionalContacts.length} contacts selected` : 'Select contacts'}
                                </Text>
                                <Image source={Icons.ic_down_arrow} style={styles.arrowIcon} />
                            </TouchableOpacity>

                            {openDropdown === 'linkedProfessionalContact' && (
                                <View style={[styles.dropdownList]}>
                                    <View style={{ padding: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
                                        <TextInput
                                            style={{ fontFamily: Fonts.mulishRegular, fontSize: 13, color: ColorConstants.BLACK, backgroundColor: '#F9FAFB', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8, height: 36 }}
                                            value={professionalContactSearchQuery}
                                            onChangeText={setProfessionalContactSearchQuery}
                                            placeholder="Search vendors"
                                            placeholderTextColor={ColorConstants.GRAY}
                                        />
                                    </View>
                                    <ScrollView nestedScrollEnabled style={{ maxHeight: 235 }}>
                                        {(() => {
                                            const query = professionalContactSearchQuery.toLowerCase();
                                            const filteredContacts = professionalContacts.filter(c =>
                                                c.name.toLowerCase().includes(query) ||
                                                (c.company && c.company.toLowerCase().includes(query))
                                            );
                                            if (filteredContacts.length === 0) {
                                                return <Text style={{ padding: 16, textAlign: 'center', color: '#666' }}>No matches found</Text>;
                                            }
                                            return filteredContacts.map((contact, index) => {
                                                const isSelected = selectedProfessionalContacts.some(c => c.id === contact.id);
                                                return (
                                                    <TouchableOpacity
                                                        key={contact.id}
                                                        style={[
                                                            styles.dropdownItem,
                                                            isSelected && { backgroundColor: ColorConstants.PRIMARY_10 },
                                                            index === filteredContacts.length - 1 && { borderBottomWidth: 0 }
                                                        ]}
                                                        onPress={() => handleToggleProfessionalContact(contact)}
                                                    >
                                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <View>
                                                                <Text style={[
                                                                    styles.dropdownItemText,
                                                                    isSelected && { fontFamily: Fonts.ManropeSemiBold, color: ColorConstants.PRIMARY_BROWN }
                                                                ]}>
                                                                    {contact.name}
                                                                </Text>
                                                                {contact.company && (
                                                                    <Text style={{ fontFamily: Fonts.mulishRegular, fontSize: 12, color: '#666', marginTop: 2 }}>{contact.company}</Text>
                                                                )}
                                                            </View>
                                                            {isSelected && (
                                                                <View style={styles.selectedCheck}>
                                                                    <Image source={Icons.ic_check} style={styles.checkIcon} />
                                                                </View>
                                                            )}
                                                        </View>
                                                    </TouchableOpacity>
                                                )
                                            })
                                        })()}
                                    </ScrollView>
                                </View>
                            )}

                            <View style={styles.tagsDisplayRow}>
                                {selectedProfessionalContacts.map((contact) => (
                                    <View key={contact.id} style={styles.professionalChip}>
                                        <Text style={styles.professionalText}>{contact.name}</Text>
                                        <TouchableOpacity onPress={() => handleRemoveProfessionalContact(contact.id)} style={styles.removeTagBtn}>
                                            <Image source={Icons.ic_cross} style={styles.removeProfessionalIcon} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Note */}
                        <CustomTextInput
                            label="Note"
                            value={formData.note}
                            onChangeText={(t) => handleInputChange('note', t)}
                            placeholder="Add note"
                            multiline
                            inputStyles={{ height: 100, alignItems: 'flex-start' }}
                        />

                        {/* Upload Area */}
                        <Text style={styles.label}>Document File</Text>
                        {!fileUploaded ? (
                            <TouchableOpacity style={[styles.inputContainer, { borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed', borderRadius: 8, padding: 20, alignItems: 'center' }]} onPress={pickDocument}>
                                <Image source={Icons.ic_upload} style={{ width: 40, height: 40, marginBottom: 10 }} />
                                <Text style={{ fontFamily: Fonts.ManropeSemiBold, fontSize: 16, color: ColorConstants.BLACK2 }}>Click here To Browse</Text>
                                <Text style={{ fontFamily: Fonts.mulishRegular, fontSize: 12, color: '#666', marginTop: 4 }}>PDF, DOC, XLS, JPG, PNG up to 10MB</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.documentWrapper}>
                                <View style={styles.documentIconBox}>
                                    <Image source={Icons.ic_file_corner} style={styles.documentIcon} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.documentName}>{selectedFile?.name || 'document.pdf'}</Text>
                                    <Text style={styles.documentSize}>{((selectedFile?.size || 0) / 1024).toFixed(2)} KB • Selected</Text>
                                </View>
                                <TouchableOpacity onPress={() => { setSelectedFile(null); setFileUploaded(false); }}>
                                    <Image source={Icons.ic_cross_square} style={{ width: 24, height: 24 }} />
                                </TouchableOpacity>
                            </View>
                        )}



                        {/* Footer Buttons */}
                        <View style={styles.footer}>
                            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={() => {
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

                                // Find selected category ID
                                const selectedCategory = availableCategories.find(c => c.name === formData.category);

                                // Format dates as YYYY-MM-DD
                                const formatDateToYMD = (date: Date) => {
                                    return date.toISOString().split('T')[0];
                                };

                                const formattedTags = tags.map(t => t.name).join(',');

                                const payload = new FormData();
                                payload.append('title', formData.documentTitle);
                                if (selectedCategory) payload.append('category', selectedCategory.id.toString());
                                // Custom folder logic mapping
                                if (formData.customFolder) {
                                    const cF = folders.find(f => f.name === formData.customFolder);
                                    if (cF) payload.append('folder', cF.id.toString());
                                    else payload.append('folder', formData.customFolder);
                                }
                                if (formData.property_id) payload.append('property', formData.property_id.toString());
                                payload.append('issue_date', formatDateToYMD(formData.issueDate));
                                payload.append('expiration_date', formatDateToYMD(formData.expirationDate));
                                if (formattedTags) payload.append('tags', formattedTags);

                                if (selectedContacts.length > 0) {
                                    selectedContacts.forEach(c => payload.append('linked_family_members', c.id.toString()));
                                }
                                if (selectedPersonalContacts.length > 0) {
                                    selectedPersonalContacts.forEach(c => payload.append('linked_personal_contacts', c.id.toString()));
                                }
                                if (selectedProfessionalContacts.length > 0) {
                                    selectedProfessionalContacts.forEach(c => payload.append('linked_vendors', c.id.toString()));
                                }
                                payload.append('description', formData.note);

                                if (selectedFile && selectedFile.uri && !selectedFile.uri.startsWith('http')) {
                                    payload.append('file', {
                                        uri: selectedFile.uri,
                                        name: selectedFile.name,
                                        type: selectedFile.mimeType || 'application/octet-stream',
                                    } as any);
                                }

                                onSave(payload);
                            }}>
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Date Pickers */}
                        {showIssueDatePicker && (
                            <DateTimePicker
                                value={formData.issueDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={(event, date) => {
                                    setShowIssueDatePicker(Platform.OS === 'ios');
                                    if (date) handleInputChange('issueDate', date);
                                }}
                            />
                        )}
                        {showExpirationDatePicker && (
                            <DateTimePicker
                                value={formData.expirationDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={(event, date) => {
                                    setShowExpirationDatePicker(Platform.OS === 'ios');
                                    if (date) handleInputChange('expirationDate', date);
                                }}
                            />
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};


export default EditDocumentModal;


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
    scrollContent: {
        padding: 20,
    },
    label: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        marginBottom: 8,
    },
    inputContainer: {
        marginBottom: 16,
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
        marginTop: 12,
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
    familyChip: {
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
    familyText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 12,
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
    removeTagBtn: {
        padding: 2,
    },
    removeTagIcon: {
        width: 8,
        height: 8,
        tintColor: ColorConstants.PRIMARY_BROWN,
    },
    removeFamilyIcon: {
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
    },
    saveButtonText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.WHITE,
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