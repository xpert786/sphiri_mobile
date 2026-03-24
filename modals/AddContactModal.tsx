import { apiGet, apiPost } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import CustomTextInput from '@/components/CustomTextInput';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import React, { useEffect, useState } from 'react';
import {
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';

interface AddContactModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (formData?: any) => void;
    isEdit?: boolean;
    contactData?: any;
    activeTabText: string
}

const AddContactModal: React.FC<AddContactModalProps> = ({
    visible,
    onClose,
    onSave,
    isEdit = false,
    contactData,
    activeTabText
}) => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone_number: '',
        category_id: '',
        category_name: '',
        company: '',
        email: '',
        visibility_id: '',
        visibility_name: '',
        address: '',
        emergency_contact: '',
        website: '',
        notes: '',
        rating: '',
        logo_url: null as any,
        is_text_enabled: false,
    });

    const [activeTab, setActiveTab] = useState<'personal' | 'vendor'>('personal');
    const isFirstTabMount = React.useRef(true); // skip clearing on initial mount

    const [errors, setErrors] = useState<Record<string, string>>({});

    const [rawCategories, setRawCategories] = useState<any[]>([]);
    const [selectedParentCategory, setSelectedParentCategory] = useState<any>(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState<any>(null);
    const [selectedDetailedCategory, setSelectedDetailedCategory] = useState<any>(null);

    const [apiTags, setApiTags] = useState<{ label: string; value: string }[]>([]);
    const [showTagDropdown, setShowTagDropdown] = useState(false);

    const [tags, setTags] = useState<{ id: string | number; name: string }[]>([]);
    const [apiVisibilityOptions, setApiVisibilityOptions] = useState<{ id: string | number; name: string }[]>([]);
    const [selectedVisibilityIds, setSelectedVisibilityIds] = useState<(string | number)[]>([]);
    const [selectedVisibilityNames, setSelectedVisibilityNames] = useState<string[]>([]);
    const [showVisibilityDropdown, setShowVisibilityDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [personalCategories, setPersonalCategories] = useState<{ id: string | number; name: string }[]>([]);
    const [vendorCategoriesData, setVendorCategoriesData] = useState<any[]>([]);
    const [selectedDocuments, setSelectedDocuments] = useState<any[]>([]);

    // Tagged Properties State
    const [allProperties, setAllProperties] = useState<any[]>([]);
    const [selectedPropertyIds, setSelectedPropertyIds] = useState<(number | string)[]>([]);
    const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
    const [showPropertyTypeDropdown, setShowPropertyTypeDropdown] = useState(false);
    const [propertyFormData, setPropertyFormData] = useState({
        name: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        zip: '',
        country: 'USA',
        type: '',
        typeValue: '',
        isPrimary: true,
        notes: ''
    });
    const [propertyErrors, setPropertyErrors] = useState<Record<string, string>>({});

    const propertyTypeOptions = [
        { label: 'Primary Residence', value: 'primary' },
        { label: 'Vacation Home', value: 'vacation' },
        { label: 'Rental Property', value: 'rental' },
        { label: 'Commercial', value: 'commercial' },
        { label: 'Other', value: 'other' },
    ];

    console.log("contactData in AddContactmodal:", JSON.stringify(contactData));



    useEffect(() => {
        if (visible) {
            fetchCategories();
            fetchTags();
            fetchVisibilityOptions();
            fetchProperties();
            if (activeTabText == 'vendor') {
                setActiveTab("vendor")
            }
        }
    }, [visible]);

    // Clear category selections when tab changes (skip on initial mount)
    useEffect(() => {
        if (isFirstTabMount.current) {
            isFirstTabMount.current = false;
            return;
        }
        setSelectedParentCategory(null);
        setSelectedSubCategory(null);
        setSelectedDetailedCategory(null);
        handleInputChange('category_id', '');
        handleInputChange('category_name', '');
    }, [activeTab]);

    // Pre-select category hierarchy in edit mode once category data is loaded
    useEffect(() => {
        if (!isEdit || !contactData?.category || !visible) return;

        const categoriesPool = rawCategories;

        if (!categoriesPool || categoriesPool.length === 0) return;

        const cat = contactData.category; // deepest selected category object from API

        // Build ancestor chain: walk parent_category up to the root
        // Chain is ordered from deepest to root, we'll reverse it to get [root, sub, detailed]
        const chain: any[] = [];
        let current = cat;
        while (current) {
            chain.unshift(current); // prepend so index 0 = root
            current = current.parent_category || null;
        }
        // chain[0] = root parent, chain[1] = subcategory, chain[2] = detailed
        // Find matching objects in the fetched category tree (by id)
        const findInTree = (nodes: any[], id: number): any => {
            for (const node of nodes) {
                if (node.id === id) return node;
                if (node.subcategories?.length) {
                    const found = findInTree(node.subcategories, id);
                    if (found) return found;
                }
            }
            return null;
        };

        if (chain.length >= 1) {
            const rootNode = findInTree(categoriesPool, chain[0].id);
            if (rootNode) {
                setSelectedParentCategory(rootNode);

                if (chain.length >= 2) {
                    const subNode = findInTree(rootNode.subcategories || [], chain[1].id);
                    if (subNode) {
                        setSelectedSubCategory(subNode);

                        if (chain.length >= 3) {
                            const detailNode = findInTree(subNode.subcategories || [], chain[2].id);
                            if (detailNode) {
                                setSelectedDetailedCategory(detailNode);
                            }
                        }
                    }
                }
            }
        }
    }, [isEdit, contactData, visible, rawCategories, vendorCategoriesData, activeTab]);

    useEffect(() => {
        if (isEdit && contactData && visible) {
            // Check if tags are objects (Contact type) or strings
            if (contactData.tags && Array.isArray(contactData.tags)) {
                setTags(contactData.tags.map((t: any) => ({
                    id: t.id,
                    name: t.name
                })));
            } else {
                setTags([]);
            }

            // Split name if first_name/last_name not provided
            let fName = contactData.first_name || '';
            let lName = contactData.last_name || '';
            if (!fName && !lName && contactData.name) {
                const parts = contactData.name.trim().split(/\s+/);
                fName = parts[0] || '';
                lName = parts.slice(1).join(' ') || '';
            }

            setFormData({
                first_name: fName,
                last_name: lName,
                phone_number: contactData.phone_number || '',
                category_id: contactData.category_id?.toString() || '',
                category_name: contactData.category_name || '',
                company: contactData.company || '',
                email: contactData.email || '',
                address: contactData.address || '',
                emergency_contact: contactData.emergency_contact || '',
                website: contactData.website || '',
                notes: contactData.initial_note || '',
                rating: contactData.rating ? Math.floor(Number(contactData.rating)).toString() : '',
                logo_url: contactData.logo_url || null,
                is_text_enabled: !!contactData.phone_number_text_enabled,
                visibility_id: contactData.visibility_id?.toString() || '',
                visibility_name: contactData.visibility_name || '',
            });

            if (contactData.visibilities && Array.isArray(contactData.visibilities)) {
                setSelectedVisibilityIds(contactData.visibilities.map((v: any) => v.id.toString()));
                setSelectedVisibilityNames(contactData.visibilities.map((v: any) => v.name || v.option));
            } else if (contactData.visibility_id) {
                setSelectedVisibilityIds([contactData.visibility_id.toString()]);
                setSelectedVisibilityNames([contactData.visibility_name || '']);
            } else {
                setSelectedVisibilityIds([]);
                setSelectedVisibilityNames([]);
            }

            if (contactData.property_ids && Array.isArray(contactData.property_ids)) {
                setSelectedPropertyIds(contactData.property_ids);
            } else if (contactData.properties && Array.isArray(contactData.properties)) {
                setSelectedPropertyIds(contactData.properties.map((p: any) => p.id));
            } else {
                setSelectedPropertyIds([]);
            }

            // Populate multi-select categories
            if (activeTab === 'personal' && contactData.categories) {
                setPersonalCategories(contactData.categories.map((c: any) => ({
                    id: c.id,
                    name: c.name || c.label
                })));
            } else {
                setPersonalCategories([]);
            }

            // Populate documents
            if (contactData.documents) {
                setSelectedDocuments(contactData.documents.map((d: any) => ({
                    uri: d.url || d.uri,
                    name: d.file_name || d.name,
                    mimeType: d.mime_type || d.type
                })));
            } else {
                setSelectedDocuments([]);
            }
        } else if (!visible) {
            // Reset state when modal closes
            setFormData({
                first_name: '',
                last_name: '',
                phone_number: '',
                category_id: '',
                category_name: '',
                company: '',
                email: '',
                visibility_id: '',
                visibility_name: '',
                address: '',
                emergency_contact: '',
                website: '',
                notes: '',
                rating: '',
                logo_url: null,
                is_text_enabled: false,
            });
            setTags([]);
            setSelectedVisibilityIds([]);
            setSelectedVisibilityNames([]);
            setSelectedPropertyIds([]);
            setAllProperties([]);
            setPersonalCategories([]);
            setSelectedDocuments([]);
            setErrors({});
            // Reset tab mount guard so next open skips the initial clear again
            isFirstTabMount.current = true;
        }
    }, [isEdit, contactData, visible, activeTab]);

    const fetchCategories = async () => {
        try {
            const res = await apiGet(ApiConstants.VENDOR_CATEGORIES);
            if (res.status === 200 || res.status === 201) {
                const data = res.data || [];
                console.log("data in fetchCategories", JSON.stringify(data));

                setRawCategories(data);
            }
        } catch (error) {
            console.error('Error fetching categories in modal:', error);
        }
    };

    const fetchVendorCategories = async () => {
        try {
            const res = await apiGet(ApiConstants.VENDOR_PROFESSIONAL_CATEGORIES_SEED);
            if (res.status === 200 || res.status === 201) {
                const data = res.data.seeded;
                // console.log("data", JSON.stringify(data));
                if (Array.isArray(data)) {
                    setVendorCategoriesData(data);
                }
            }
        } catch (error: any) {
            console.log('Error fetching vendor seed categories:', error?.message);
            if (error?.response) {
                console.log('Status:', error.response.status);
                console.log('Response Data:', JSON.stringify(error.response.data, null, 2));
                console.log('URL:', error.config?.url);
                console.log('Method:', error.config?.method);
            }
        }
    };

    const fetchTags = async () => {
        try {
            const res = await apiGet(ApiConstants.VENDOR_TAGS);
            if (res.status === 200 || res.status === 201) {
                const formatted = (res.data || []).map((item: any) => ({
                    label: item.name || item.label,
                    value: item.id?.toString() || item.value
                }));
                setApiTags(formatted);
            }
        } catch (error) {
            console.error('Error fetching tags in modal:', error);
        }
    };
    const fetchProperties = async () => {
        try {
            const res = await apiGet(ApiConstants.PROPERTIES);
            if (res.status === 200 || res.status === 201) {
                setAllProperties(res.data?.results || []);
            }
        } catch (error) {
            console.error('Error fetching properties in modal:', error);
        }
    };

    const fetchVisibilityOptions = async () => {
        try {
            const res = await apiGet(ApiConstants.VISIBILITY_OPTIONS);
            if (res.status === 200 || res.status === 201) {
                const formatted = (res.data || []).map((item: any) => ({
                    name: item.option || item.name,
                    id: item.id?.toString() || item.value
                }));
                setApiVisibilityOptions(formatted);
            }
        } catch (error) {
            console.error('Error fetching visibility in modal:', error);
        }
    };



    const handlePropertyInputChange = (field: string, value: any) => {
        setPropertyFormData(prev => ({ ...prev, [field]: value }));
        if (propertyErrors[field]) {
            setPropertyErrors(prev => {
                const updated = { ...prev };
                delete updated[field];
                return updated;
            });
        }
    };

    const validatePropertyForm = () => {
        let errs: Record<string, string> = {};
        if (!propertyFormData.name.trim()) errs.name = 'Property name is required';
        if (!propertyFormData.address1.trim()) errs.address1 = 'Address Line 1 is required';
        if (!propertyFormData.city.trim()) errs.city = 'City is required';
        if (!propertyFormData.state.trim()) errs.state = 'State is required';
        if (!propertyFormData.zip.trim()) errs.zip = 'ZIP code is required';
        if (!propertyFormData.country.trim()) errs.country = 'Country is required';
        if (!propertyFormData.typeValue) errs.type = 'Property type is required';
        setPropertyErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleAddProperty = async () => {
        if (!validatePropertyForm()) return;
        setLoading(true);
        const payload = {
            name: propertyFormData.name,
            address_line1: propertyFormData.address1,
            address_line2: propertyFormData.address2,
            city: propertyFormData.city,
            state: propertyFormData.state,
            zip_code: propertyFormData.zip,
            country: propertyFormData.country,
            property_type: propertyFormData.typeValue,
            is_primary: propertyFormData.isPrimary,
            notes: propertyFormData.notes
        };

        try {
            const response = await apiPost(ApiConstants.PROPERTIES, payload);
            if (response && (response.status === 200 || response.status === 201)) {
                const newProperty = response.data;
                setAllProperties(prev => [newProperty, ...prev]);
                setSelectedPropertyIds(prev => [...prev, newProperty.id]);
                setShowAddPropertyModal(false);
                // Reset property form
                setPropertyFormData({
                    name: '',
                    address1: '',
                    address2: '',
                    city: '',
                    state: '',
                    zip: '',
                    country: 'USA',
                    type: '',
                    typeValue: '',
                    isPrimary: true,
                    notes: ''
                });
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Property added successfully'
                });
            } else {
                const errorMessage = response.data?.message || response.data?.error || 'Failed to add property';
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: typeof errorMessage === 'string' ? errorMessage : 'Invalid data provided'
                });
            }
        } catch (error: any) {
            console.error('Error adding property:', error);
            const apiError = error?.response?.data;
            let errorDetail = 'Something went wrong';

            if (apiError) {
                if (typeof apiError === 'object') {
                    // Extract first error message from object
                    const firstKey = Object.keys(apiError)[0];
                    const val = apiError[firstKey];
                    errorDetail = Array.isArray(val) ? val[0] : (typeof val === 'string' ? val : JSON.stringify(val));
                } else if (typeof apiError === 'string') {
                    errorDetail = apiError;
                }
            }

            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: errorDetail
            });
        } finally {
            setLoading(false);
        }
    };


    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
        // Clear error when user types
        if (errors[field]) {
            setErrors(prev => {
                const updated = { ...prev };
                delete updated[field];
                return updated;
            });
        }
    };

    const handleSelectTag = (tag: { label: string; value: string }) => {
        if (!tags.find(t => t.id === tag.value)) {
            const newTags = [...tags, { id: tag.value, name: tag.label }];
            setTags(newTags);

            // Clear tag error
            if (errors.tags) {
                setErrors(prev => {
                    const updated = { ...prev };
                    delete updated.tags;
                    return updated;
                });
            }
        }
        setShowTagDropdown(false);
    };

    const handleRemoveTag = (tagId: string | number) => {
        setTags(tags.filter(tag => tag.id !== tagId));
    };

    const handleLogoPick = async () => {
        try {
            const result: any = await DocumentPicker.getDocumentAsync({
                type: ['image/jpeg', 'image/png', 'image/jpg'],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                handleInputChange('logo_url', result.assets[0]);
            }
        } catch (err) {
            console.error('Error picking logo:', err);
        }
    };

    const handleRemoveLogo = () => {
        handleInputChange('logo_url', null);
    };


    const handleParentCategorySelect = (category: any) => {
        if (selectedParentCategory?.id === category.id) {
            setSelectedParentCategory(null);
            setSelectedSubCategory(null);
            setSelectedDetailedCategory(null);
            handleInputChange('category_id', '');
            handleInputChange('category_name', '');
            return;
        }

        setSelectedParentCategory(category);
        setSelectedSubCategory(null);
        setSelectedDetailedCategory(null);
        // Do not update formData.category_id yet if it has subcategories
        if (!category.has_subcategories) {
            handleInputChange('category_id', category.id.toString());
            handleInputChange('category_name', category.name);
        } else {
            handleInputChange('category_id', '');
            handleInputChange('category_name', '');
        }
    };

    const handleSubCategorySelect = (subCat: any) => {
        if (selectedSubCategory?.id === subCat.id) {
            setSelectedSubCategory(null);
            setSelectedDetailedCategory(null);
            handleInputChange('category_id', '');
            handleInputChange('category_name', '');
            return;
        }

        setSelectedSubCategory(subCat);
        setSelectedDetailedCategory(null);
        if (!subCat.has_subcategories) {
            handleInputChange('category_id', subCat.id.toString());
            handleInputChange('category_name', subCat.name);
        } else {
            handleInputChange('category_id', '');
            handleInputChange('category_name', '');
        }
    };

    const handleDetailedCategorySelect = (detailedCat: any) => {
        if (selectedDetailedCategory?.id === detailedCat.id) {
            setSelectedDetailedCategory(null);
            handleInputChange('category_id', '');
            handleInputChange('category_name', '');
            return;
        }

        setSelectedDetailedCategory(detailedCat);
        handleInputChange('category_id', detailedCat.id.toString());
        handleInputChange('category_name', detailedCat.name);
    };

    const renderCategorySelection = () => {
        const categoriesToRender = Array.isArray(rawCategories) ? rawCategories : [];

        return (
            <>
                {/* Category Hierarchical Selection */}
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
                                    onPress={() => handleParentCategorySelect(cat)}
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
                    {errors.category_id ? <Text style={styles.dropdownErrorText}>{errors.category_id}</Text> : null}
                </View>

                {/* Subcategory Selection */}
                {selectedParentCategory && selectedParentCategory.has_subcategories && (
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
                                        onPress={() => handleSubCategorySelect(sub)}
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

                            {/* Nested Sub-subcategories (Detailed Level) */}
                            {selectedSubCategory && selectedSubCategory.has_subcategories && (
                                <View style={styles.detailedCatRow}>
                                    {selectedSubCategory.subcategories.map((detailed: any, idx: number) => (
                                        <TouchableOpacity
                                            key={idx}
                                            style={[
                                                styles.detailedCatChip,
                                                selectedDetailedCategory?.id === detailed.id && styles.activeDetailedCatChip
                                            ]}
                                            onPress={() => handleDetailedCategorySelect(detailed)}
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

                {/* Selected Status Box */}
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

    const handleDocumentPick = async () => {
        try {
            const result: any = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/*'],
                multiple: true,
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setSelectedDocuments(prev => [...prev, ...result.assets]);
            }
        } catch (err) {
            console.error('Error picking document:', err);
        }
    };

    const handleRemoveDocument = (index: number) => {
        setSelectedDocuments(prev => prev.filter((_, i) => i !== index));
    };

    const validateForm = () => {
        let newErrors: Record<string, string> = {};

        const currentCategoryId = selectedDetailedCategory?.id || selectedSubCategory?.id || selectedParentCategory?.id || formData.category_id;

        // Required fields
        if (activeTab === 'personal') {
            if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
            if (!currentCategoryId) newErrors.category_id = 'Category is required';
        } else {
            if (!formData.company.trim()) newErrors.company = 'Company is required';
            if (!currentCategoryId) newErrors.category_id = 'Category is required';


            // Optional Website Validation
            if (formData.website.trim() && !formData.website.startsWith('https://')) {
                newErrors.website = 'URL must start with https://';
            }

            // Rating check if provided (allow decimals)
            if (formData.rating.trim() && !/^\d*\.?\d+$/.test(formData.rating)) {
                newErrors.rating = 'Rating must be a number';
            }
        }

        if (tags.length === 0) newErrors.tags = 'At least one tag is required';

        if (!formData.phone_number.trim()) {
            newErrors.phone_number = 'Phone number is required';
        } else if (!/^\d+$/.test(formData.phone_number)) {
            newErrors.phone_number = 'Phone number has allowed digits only';
        }

        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (selectedVisibilityIds.length === 0) newErrors.visibility_id = 'Visibility is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        const finalCategoryId = selectedDetailedCategory?.id || selectedSubCategory?.id || selectedParentCategory?.id || formData.category_id;

        // If in edit mode, just pass the data to parent without making API call
        // Parent (contact-details) will handle the PATCH API call
        if (isEdit) {
            onSave({
                ...formData,
                category_id: finalCategoryId,
                tags: tags,
                property_ids: selectedPropertyIds,
                visibility_ids: selectedVisibilityIds,
                visibilities: selectedVisibilityIds.map(id => ({
                    id,
                    name: selectedVisibilityNames[selectedVisibilityIds.indexOf(id)]
                }))
            });
            return;
        }

        // Create mode - make API call to create new contact
        try {
            setLoading(true);
            console.log('formData.is_text_enabled', formData.is_text_enabled)
            const formDataObj = new FormData();

            // Common fields for both tabs
            formDataObj.append('name', `${formData.first_name} ${formData.last_name}`.trim());
            formDataObj.append('email', formData.email);
            formDataObj.append('phone_number', formData.phone_number);
            formDataObj.append('address', formData.address);
            formDataObj.append('phone_number_text_enabled', String(formData.is_text_enabled));

            // Send visibility IDs
            selectedVisibilityIds.forEach(id => {
                formDataObj.append('visibility', id.toString());
            });

            formDataObj.append('initial_note', formData.notes);
            selectedPropertyIds.forEach(id => {
                formDataObj.append('property_ids', id.toString());
            });

            // Send tag IDs individually for vendors
            const tagIds = tags.map(t => Number(t.id)).filter(id => !isNaN(id));
            tagIds.forEach(id => {
                formDataObj.append('tag_ids', id.toString());
            });

            // Common file uploads
            if (formData.logo_url && formData.logo_url.uri) {
                formDataObj.append('logo', {
                    uri: formData.logo_url.uri,
                    name: formData.logo_url.name || 'logo.png',
                    type: formData.logo_url.mimeType || 'image/png',
                } as any);
            }

            if (activeTab === 'personal') {
                // Personal contact specific fields
                formDataObj.append('category', finalCategoryId);
            } else {
                // Vendor / Professional specific fields
                formDataObj.append('emergency_contact', formData.emergency_contact);
                formDataObj.append('website', formData.website);
                formDataObj.append('category', finalCategoryId);
                formDataObj.append('company', formData.company);
                formDataObj.append('rating', formData.rating);
                // Multiple documents
                // selectedDocuments.forEach((doc, index) => {
                //     if (doc.uri) {
                //         formDataObj.append('docurl', {
                //             uri: doc.uri,
                //             name: doc.name || `document_${index}.pdf`,
                //             type: doc.mimeType || 'application/pdf',
                //         } as any);
                //     }
                // });
            }
            console.log("formDataObj in add contacts", JSON.stringify(formDataObj));


            // Hit the Create API
            const url = activeTab === 'personal' ? ApiConstants.CREATE_PERSONAL_CONTACT : ApiConstants.VENDORS_CREATE;
            const res = await apiPost(url, formDataObj, { isFormData: true });

            if (res.status === 200 || res.status === 201) {
                // Pass the actual form data object with tags to parent
                onSave({
                    ...formData,
                    tags: tags,
                    visibility_ids: selectedVisibilityIds,
                    visibilities: selectedVisibilityIds.map(id => ({
                        id,
                        name: selectedVisibilityNames[selectedVisibilityIds.indexOf(id)]
                    }))
                });
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: res.data?.message || 'Contact added successfully!',
                });
            } else {
                console.error('Failed to create/update contact:', res.data);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: res.data?.message || 'Something went wrong',
                });
            }
        } catch (error: any) {
            console.error('Error saving contact:', error);
            if (error?.response?.data) {
                console.error('API Error Details:', JSON.stringify(error.response.data, null, 2));
            }
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error?.response?.data?.message || (error?.response?.data && typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error?.response?.data)) || error?.message || 'An unexpected error occurred',
            });
        } finally {
            setLoading(false);
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
                            <Text style={styles.headerTitle}>{isEdit ? 'Edit Contact' : 'Add Contact'}</Text>
                            <Text style={styles.headerSubtitle}>
                                Store details, set visibility, add color-coded tags for filtering.
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Image source={Icons.ic_cross} style={styles.closeIcon} />
                        </TouchableOpacity>
                    </View>

                    {/* Tab Bar */}
                    <View style={styles.tabBarWrapper}>
                        <View style={styles.tabBarContainer}>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'personal' && styles.activeTab]}
                                onPress={() => setActiveTab('personal')}
                                activeOpacity={0.8}
                            >
                                <Image
                                    source={Icons.ic_user}
                                    style={[styles.tabIcon, activeTab === 'personal' && styles.activeTabIcon]}
                                />
                                <Text style={[styles.tabText, activeTab === 'personal' && styles.activeTabText]}>
                                    Personal Contact
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'vendor' && styles.activeTab]}
                                onPress={() => setActiveTab('vendor')}
                                activeOpacity={0.8}
                            >
                                <MaterialIcons name="business" size={18} color={activeTab === 'vendor' ? ColorConstants.WHITE : ColorConstants.GRAY} />
                                <Text style={[styles.tabText, activeTab === 'vendor' && styles.activeTabText]}>
                                    Vendor / Professional
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Add New Property View Overlay */}
                    {showAddPropertyModal && (
                        <View style={styles.subModalOverlay}>
                            <View style={styles.subModalContainer}>
                                <View style={styles.propertyHeader}>
                                    <View>
                                        <Text style={styles.propertyTitle}>Add New Property</Text>
                                        <Text style={styles.propertySubtitle}>Enter property details</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => setShowAddPropertyModal(false)} style={styles.closeSubModal}>
                                        <Image source={Icons.ic_cross} style={{ width: 14, height: 14, tintColor: ColorConstants.GRAY }} />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView
                                    contentContainerStyle={[styles.subModalContent, { paddingBottom: 65 }]}
                                    showsVerticalScrollIndicator={false}
                                    nestedScrollEnabled={true}
                                >
                                    <CustomTextInput
                                        label="Property Name *"
                                        value={propertyFormData.name}
                                        onChangeText={(v) => handlePropertyInputChange('name', v)}
                                        placeholder='e.g., "Main House" or "Beach Condo"'
                                        error={propertyErrors.name}
                                    />
                                    <CustomTextInput
                                        label="Address Line 1 *"
                                        value={propertyFormData.address1}
                                        onChangeText={(v) => handlePropertyInputChange('address1', v)}
                                        placeholder='Street address'
                                        error={propertyErrors.address1}
                                    />
                                    <CustomTextInput
                                        label="Address Line 2"
                                        value={propertyFormData.address2}
                                        onChangeText={(v) => handlePropertyInputChange('address2', v)}
                                        placeholder='Apartment, suite, etc. (optional)'
                                    />

                                    <CustomTextInput
                                        label="City *"
                                        value={propertyFormData.city}
                                        onChangeText={(v) => handlePropertyInputChange('city', v)}
                                        error={propertyErrors.city}
                                    />
                                    <CustomTextInput
                                        label="State *"
                                        value={propertyFormData.state}
                                        onChangeText={(v) => handlePropertyInputChange('state', v)}
                                        error={propertyErrors.state}
                                    />

                                    <CustomTextInput
                                        label="ZIP Code *"
                                        value={propertyFormData.zip}
                                        onChangeText={(v) => handlePropertyInputChange('zip', v)}
                                        keyboardType="numeric"
                                        error={propertyErrors.zip}
                                    />

                                    <CustomTextInput
                                        label="Country *"
                                        value={propertyFormData.country}
                                        onChangeText={(v) => handlePropertyInputChange('country', v)}
                                        placeholder='Country'
                                        error={propertyErrors.country}
                                    />

                                    <View style={{ flex: 1, zIndex: 1000 }}>
                                        <Text style={styles.label}>Property Type</Text>
                                        <TouchableOpacity
                                            style={styles.dropdownButton}
                                            onPress={() => setShowPropertyTypeDropdown(!showPropertyTypeDropdown)}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={styles.inputText}>{propertyFormData.type || 'Select Type'}</Text>
                                            <Image source={Icons.ic_down_arrow} style={styles.arrowIcon} />
                                        </TouchableOpacity>
                                        {propertyErrors.type ? <Text style={styles.dropdownErrorText}>{propertyErrors.type}</Text> : null}

                                        {showPropertyTypeDropdown && (
                                            <View style={styles.dropdownList}>
                                                <ScrollView nestedScrollEnabled={true}>
                                                    {propertyTypeOptions.map((opt, idx) => (
                                                        <TouchableOpacity
                                                            key={idx}
                                                            style={styles.dropdownItem}
                                                            onPress={() => {
                                                                setPropertyFormData(prev => ({
                                                                    ...prev,
                                                                    type: opt.label,
                                                                    typeValue: opt.value
                                                                }));
                                                                setShowPropertyTypeDropdown(false);
                                                            }}
                                                        >
                                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                {propertyFormData.type === opt.label && (
                                                                    <Image source={Icons.ic_check} style={{ width: 14, height: 14, marginRight: 8, tintColor: ColorConstants.PRIMARY_BROWN }} />
                                                                )}
                                                                <Text style={styles.dropdownItemText}>{opt.label}</Text>
                                                            </View>
                                                        </TouchableOpacity>
                                                    ))}
                                                </ScrollView>
                                            </View>
                                        )}
                                    </View>

                                    <TouchableOpacity
                                        style={styles.checkboxContainer}
                                        onPress={() => handlePropertyInputChange('isPrimary', !propertyFormData.isPrimary)}
                                    >
                                        <View style={[styles.checkbox, propertyFormData.isPrimary && { backgroundColor: ColorConstants.WHITE, borderColor: ColorConstants.GRAY3 }]}>
                                            {propertyFormData.isPrimary && <Image source={Icons.ic_checkbox_tick} style={{ width: 20, height: 20, tintColor: ColorConstants.PRIMARY_BROWN }} />}
                                        </View>
                                        <Text style={{ fontFamily: Fonts.mulishRegular, fontSize: 14, color: '#374151' }}>Set as primary property</Text>
                                    </TouchableOpacity>

                                    <CustomTextInput
                                        label="Notes"
                                        value={propertyFormData.notes}
                                        onChangeText={(v) => handlePropertyInputChange('notes', v)}
                                        placeholder='Any additional details...'
                                        multiline
                                        inputStyles={{ height: 80, alignItems: 'flex-start' }}
                                    />
                                </ScrollView>

                                <View style={styles.subModalFooter}>
                                    <TouchableOpacity onPress={() => setShowAddPropertyModal(false)}>
                                        <Text style={{ fontFamily: Fonts.ManropeMedium, fontSize: 14, color: '#4B5563' }}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.addPropertyBtn} onPress={handleAddProperty}>
                                        <Text style={styles.addPropertyBtnText}>Add Property</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {/* Tab Content */}
                        {activeTab === 'personal' ? (
                            <>
                                {/* Name Section */}
                                <View style={{ flexDirection: 'row', gap: 12 }}>
                                    <View style={{ flex: 1 }}>
                                        <CustomTextInput
                                            label="First Name"
                                            value={formData.first_name}
                                            onChangeText={(t) => handleInputChange('first_name', t)}
                                            error={errors.first_name}
                                            placeholder='Enter first name'
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <CustomTextInput
                                            label="Last Name"
                                            value={formData.last_name}
                                            onChangeText={(t) => handleInputChange('last_name', t)}
                                            error={errors.last_name}
                                            placeholder='Enter last name'
                                        />
                                    </View>
                                </View>

                                {/* Phone */}
                                <CustomTextInput
                                    label="Phone"
                                    value={formData.phone_number}
                                    onChangeText={(t) => handleInputChange('phone_number', t)}
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                    error={errors.phone_number}
                                    placeholder='Enter phone number'
                                />

                                <TouchableOpacity
                                    style={styles.checkboxWrapper}
                                    onPress={() => handleInputChange('is_text_enabled', !formData.is_text_enabled)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.checkboxBase, formData.is_text_enabled && styles.checkboxSelected]}>
                                        {formData.is_text_enabled && <Image source={Icons.ic_check} style={styles.checkboxIcon} />}
                                    </View>
                                    <Text style={styles.checkboxLabel}>Text Enabled</Text>
                                </TouchableOpacity>

                                {/* Email */}
                                <CustomTextInput
                                    label="Email"
                                    value={formData.email}
                                    onChangeText={(t) => handleInputChange('email', t)}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    leftIcon={Icons.ic_mail}
                                    placeholder='Enter email address'
                                    error={errors.email}
                                />

                                {/* Visibility Dropdown */}
                                <View style={[styles.inputContainer, { zIndex: 1000 }]}>
                                    <Text style={styles.label}>Visibility</Text>
                                    <TouchableOpacity
                                        style={styles.dropdownButton}
                                        onPress={() => setShowVisibilityDropdown(!showVisibilityDropdown)}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[styles.inputText, { color: selectedVisibilityNames.length > 0 ? ColorConstants.DARK_CYAN : ColorConstants.GRAY }]}>
                                            {selectedVisibilityNames.length > 0 ? selectedVisibilityNames.join(', ') : 'Select Visibility'}
                                        </Text>
                                        <Image source={Icons.ic_down_arrow} style={styles.arrowIcon} />
                                    </TouchableOpacity>
                                    {errors.visibility_id ? <Text style={styles.dropdownErrorText}>{errors.visibility_id}</Text> : null}

                                    {showVisibilityDropdown && (
                                        <View style={styles.dropdownList}>
                                            <ScrollView
                                                style={styles.dropdownScroll}
                                                nestedScrollEnabled={true}
                                                showsVerticalScrollIndicator={true}
                                            >
                                                {apiVisibilityOptions.map((opt, idx) => {
                                                    const isSelected = selectedVisibilityIds.includes(opt.id.toString());
                                                    return (
                                                        <TouchableOpacity
                                                            key={idx}
                                                            style={styles.dropdownItem}
                                                            onPress={() => {
                                                                let newIds = [...selectedVisibilityIds];
                                                                let newNames = [...selectedVisibilityNames];
                                                                if (isSelected) {
                                                                    newIds = newIds.filter(id => id !== opt.id.toString());
                                                                    newNames = newNames.filter(name => name !== opt.name);
                                                                } else {
                                                                    newIds.push(opt.id.toString());
                                                                    newNames.push(opt.name);
                                                                }
                                                                setSelectedVisibilityIds(newIds);
                                                                setSelectedVisibilityNames(newNames);
                                                                // Clear error
                                                                if (errors.visibility_id) {
                                                                    setErrors(prev => {
                                                                        const updated = { ...prev };
                                                                        delete updated.visibility_id;
                                                                        return updated;
                                                                    });
                                                                }
                                                            }}
                                                        >
                                                            <View style={styles.multiSelectItem}>
                                                                <Text style={styles.dropdownItemText}>{opt.name}</Text>
                                                                {isSelected && <Image source={Icons.ic_check} style={styles.checkIconDropdown} />}
                                                            </View>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </ScrollView>
                                        </View>
                                    )}
                                </View>

                                {/* Tags Dropdown */}
                                <View style={[styles.inputContainer, { zIndex: 900 }]}>
                                    <Text style={styles.label}>Tags</Text>
                                    <TouchableOpacity
                                        style={styles.dropdownButton}
                                        onPress={() => {
                                            setShowVisibilityDropdown(false);
                                            setShowTagDropdown(!showTagDropdown);
                                        }}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[styles.inputText, { color: ColorConstants.GRAY }]}>Select Tags</Text>
                                        <Image source={Icons.ic_down_arrow} style={styles.arrowIcon} />
                                    </TouchableOpacity>
                                    {errors.tags ? <Text style={styles.dropdownErrorText}>{errors.tags}</Text> : null}

                                    {showTagDropdown && (
                                        <View style={styles.dropdownList}>
                                            <ScrollView
                                                style={styles.dropdownScroll}
                                                nestedScrollEnabled={true}
                                                showsVerticalScrollIndicator={true}
                                            >
                                                {apiTags.filter(opt => !tags.find(t => t.id.toString() === opt.value)).map((opt, idx) => (
                                                    <TouchableOpacity
                                                        key={idx}
                                                        style={styles.dropdownItem}
                                                        onPress={() => handleSelectTag(opt)}
                                                    >
                                                        <Text style={styles.dropdownItemText}>{opt.label}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                                {apiTags.filter(opt => !tags.find(t => t.id.toString() === opt.value)).length === 0 && (
                                                    <View style={styles.dropdownItem}>
                                                        <Text style={[styles.dropdownItemText, { color: ColorConstants.GRAY }]}>No more tags available</Text>
                                                    </View>
                                                )}
                                            </ScrollView>
                                        </View>
                                    )}
                                </View>

                                {/* Display Tags */}
                                {tags.length > 0 && (
                                    <View style={styles.tagsContainer}>
                                        {tags.map((tag, index) => (
                                            <View key={index} style={styles.tagChip}>
                                                <Text style={styles.tagText}>{tag.name}</Text>
                                                <TouchableOpacity
                                                    onPress={() => handleRemoveTag(tag.id)}
                                                    style={styles.removeTagButton}
                                                >
                                                    <Image source={Icons.ic_cross} style={styles.removeTagIcon} />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {/* Tagged Properties Section */}
                                <View style={styles.taggedPropertiesSection}>
                                    <View style={styles.taggedHeader}>
                                        <Text style={[styles.label, { marginBottom: 0 }]}>Tagged Properties</Text>
                                        <TouchableOpacity onPress={() => setShowAddPropertyModal(true)}>
                                            <Text style={styles.quickAddText}>+ Quick Add Property</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.propertyListContainer}>
                                        <ScrollView
                                            nestedScrollEnabled={true}
                                            showsVerticalScrollIndicator={false}
                                            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                                        >
                                            {allProperties.length === 0 ? (
                                                <Text style={styles.noPropertiesText}>No properties available.</Text>
                                            ) : (
                                                allProperties.map((prop, index) => {
                                                    const isSelected = selectedPropertyIds.includes(prop.id);
                                                    return (
                                                        <TouchableOpacity
                                                            key={index}
                                                            style={styles.propertyItem}
                                                            onPress={() => {
                                                                if (isSelected) {
                                                                    setSelectedPropertyIds(selectedPropertyIds.filter(id => id !== prop.id));
                                                                } else {
                                                                    setSelectedPropertyIds([...selectedPropertyIds, prop.id]);
                                                                }
                                                            }}
                                                        >
                                                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                                                <Image
                                                                    source={isSelected ? Icons.ic_checkbox_selected : Icons.ic_checkbox_black}
                                                                    style={{ width: 18, height: 18, marginRight: 10, tintColor: isSelected ? ColorConstants.PRIMARY_BROWN : '#E0E0E0' }}
                                                                />
                                                                <Text style={styles.propertyName}>{prop.name}</Text>
                                                            </View>
                                                        </TouchableOpacity>
                                                    );
                                                })
                                            )}
                                        </ScrollView>
                                    </View>
                                </View>

                                {/* Address Field */}
                                <CustomTextInput
                                    label="Address (Optional)"
                                    value={formData.address}
                                    onChangeText={(t) => handleInputChange('address', t)}
                                    placeholder="Enter Address"
                                    multiline
                                    error={errors.address}
                                />

                                {/* Hierarchical Category Selection */}
                                {renderCategorySelection()}

                                {/* Upload Detail Image (Photo) */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Upload Photo</Text>
                                    {formData.logo_url ? (
                                        <View style={styles.logoPreviewContainer}>
                                            <Image
                                                source={{
                                                    uri: formData.logo_url.uri
                                                        ? formData.logo_url.uri
                                                        : formData.logo_url.startsWith('http')
                                                            ? formData.logo_url
                                                            : `${ApiConstants.MEDIA_URL}${formData.logo_url}`
                                                }}
                                                style={styles.logoPreview}
                                            />
                                            <TouchableOpacity
                                                style={styles.removeLogoButton}
                                                onPress={handleRemoveLogo}
                                                activeOpacity={0.8}
                                            >
                                                <Image source={Icons.ic_cross} style={styles.removeLogoIcon} />
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <TouchableOpacity style={styles.uploadArea} onPress={handleLogoPick} activeOpacity={0.7}>
                                            <Image source={Icons.ic_upload} style={styles.uploadIcon} />
                                            <Text style={styles.uploadTitle}>Upload Photo</Text>
                                            <Text style={styles.uploadSubtitle}>Select here to choose image</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {/* Notes */}
                                <CustomTextInput
                                    label="Notes (Optional)"
                                    value={formData.notes}
                                    onChangeText={(t) => handleInputChange('notes', t)}
                                    placeholder="Enter any notes..."
                                    multiline
                                    inputStyles={{ height: 80, alignItems: 'flex-start' }}
                                    error={errors.notes}
                                />
                            </>
                        ) : (
                            <>
                                {/* Vendor UI */}
                                {/* Company */}
                                <CustomTextInput
                                    label="Company"
                                    value={formData.company}
                                    onChangeText={(t) => handleInputChange('company', t)}
                                    error={errors.company}
                                    placeholder='Enter company name'
                                />

                                {/* Name Section */}
                                <View style={{ flexDirection: 'row', gap: 12 }}>
                                    <View style={{ flex: 1 }}>
                                        <CustomTextInput
                                            label="First Name"
                                            value={formData.first_name}
                                            onChangeText={(t) => handleInputChange('first_name', t)}
                                            error={errors.first_name}
                                            placeholder='Enter first name'
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <CustomTextInput
                                            label="Last Name"
                                            value={formData.last_name}
                                            onChangeText={(t) => handleInputChange('last_name', t)}
                                            error={errors.last_name}
                                            placeholder='Enter last name'
                                        />
                                    </View>
                                </View>

                                {/* Phone */}
                                <CustomTextInput
                                    label="Primary Phone Number"
                                    value={formData.phone_number}
                                    onChangeText={(t) => handleInputChange('phone_number', t)}
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                    error={errors.phone_number}
                                    placeholder='Enter phone number'
                                />

                                <TouchableOpacity
                                    style={styles.checkboxWrapper}
                                    onPress={() => handleInputChange('is_text_enabled', !formData.is_text_enabled)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.checkboxBase, formData.is_text_enabled && styles.checkboxSelected]}>
                                        {formData.is_text_enabled && <Image source={Icons.ic_check} style={styles.checkboxIcon} />}
                                    </View>
                                    <Text style={styles.checkboxLabel}>Text Enabled</Text>
                                </TouchableOpacity>

                                {/* Email */}
                                <CustomTextInput
                                    label="Email"
                                    value={formData.email}
                                    onChangeText={(t) => handleInputChange('email', t)}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    leftIcon={Icons.ic_mail}
                                    placeholder='Enter email address'
                                    error={errors.email}
                                />

                                {/* Visibility Dropdown */}
                                <View style={[styles.inputContainer, { zIndex: 1000 }]}>
                                    <Text style={styles.label}>Visibility</Text>
                                    <TouchableOpacity
                                        style={styles.dropdownButton}
                                        onPress={() => setShowVisibilityDropdown(!showVisibilityDropdown)}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[styles.inputText, { color: selectedVisibilityNames.length > 0 ? ColorConstants.DARK_CYAN : ColorConstants.GRAY }]}>
                                            {selectedVisibilityNames.length > 0 ? selectedVisibilityNames.join(', ') : 'Select Visibility'}
                                        </Text>
                                        <Image source={Icons.ic_down_arrow} style={styles.arrowIcon} />
                                    </TouchableOpacity>
                                    {errors.visibility_id ? <Text style={styles.dropdownErrorText}>{errors.visibility_id}</Text> : null}

                                    {showVisibilityDropdown && (
                                        <View style={styles.dropdownList}>
                                            <ScrollView
                                                style={styles.dropdownScroll}
                                                nestedScrollEnabled={true}
                                                showsVerticalScrollIndicator={true}
                                            >
                                                {apiVisibilityOptions.map((opt, idx) => {
                                                    const isSelected = selectedVisibilityIds.includes(opt.id.toString());
                                                    return (
                                                        <TouchableOpacity
                                                            key={idx}
                                                            style={styles.dropdownItem}
                                                            onPress={() => {
                                                                let newIds = [...selectedVisibilityIds];
                                                                let newNames = [...selectedVisibilityNames];
                                                                if (isSelected) {
                                                                    newIds = newIds.filter(id => id !== opt.id.toString());
                                                                    newNames = newNames.filter(name => name !== opt.name);
                                                                } else {
                                                                    newIds.push(opt.id.toString());
                                                                    newNames.push(opt.name);
                                                                }
                                                                setSelectedVisibilityIds(newIds);
                                                                setSelectedVisibilityNames(newNames);
                                                                // Clear error
                                                                if (errors.visibility_id) {
                                                                    setErrors(prev => {
                                                                        const updated = { ...prev };
                                                                        delete updated.visibility_id;
                                                                        return updated;
                                                                    });
                                                                }
                                                            }}
                                                        >
                                                            <View style={styles.multiSelectItem}>
                                                                <Text style={styles.dropdownItemText}>{opt.name}</Text>
                                                                {isSelected && <Image source={Icons.ic_check} style={styles.checkIconDropdown} />}
                                                            </View>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </ScrollView>
                                        </View>
                                    )}
                                </View>

                                {/* Tags Dropdown */}
                                <View style={[styles.inputContainer, { zIndex: 900 }]}>
                                    <Text style={styles.label}>Tags</Text>
                                    <TouchableOpacity
                                        style={styles.dropdownButton}
                                        onPress={() => {
                                            setShowVisibilityDropdown(false);
                                            setShowTagDropdown(!showTagDropdown);
                                        }}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[styles.inputText, { color: ColorConstants.GRAY }]}>Select Tags</Text>
                                        <Image source={Icons.ic_down_arrow} style={styles.arrowIcon} />
                                    </TouchableOpacity>
                                    {errors.tags ? <Text style={styles.dropdownErrorText}>{errors.tags}</Text> : null}

                                    {showTagDropdown && (
                                        <View style={styles.dropdownList}>
                                            <ScrollView
                                                style={styles.dropdownScroll}
                                                nestedScrollEnabled={true}
                                                showsVerticalScrollIndicator={true}
                                            >
                                                {apiTags.filter(opt => !tags.find(t => t.id.toString() === opt.value)).map((opt, idx) => (
                                                    <TouchableOpacity
                                                        key={idx}
                                                        style={styles.dropdownItem}
                                                        onPress={() => handleSelectTag(opt)}
                                                    >
                                                        <Text style={styles.dropdownItemText}>{opt.label}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                                {apiTags.filter(opt => !tags.find(t => t.id.toString() === opt.value)).length === 0 && (
                                                    <View style={styles.dropdownItem}>
                                                        <Text style={[styles.dropdownItemText, { color: ColorConstants.GRAY }]}>No more tags available</Text>
                                                    </View>
                                                )}
                                            </ScrollView>
                                        </View>
                                    )}
                                </View>

                                {/* Display Tags */}
                                {tags.length > 0 && (
                                    <View style={styles.tagsContainer}>
                                        {tags.map((tag, index) => (
                                            <View key={index} style={styles.tagChip}>
                                                <Text style={styles.tagText}>{tag.name}</Text>
                                                <TouchableOpacity
                                                    onPress={() => handleRemoveTag(tag.id)}
                                                    style={styles.removeTagButton}
                                                >
                                                    <Image source={Icons.ic_cross} style={styles.removeTagIcon} />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {/* Tagged Properties Section */}
                                <View style={styles.taggedPropertiesSection}>
                                    <View style={styles.taggedHeader}>
                                        <Text style={[styles.label, { marginBottom: 0 }]}>Tagged Properties</Text>
                                        <TouchableOpacity onPress={() => setShowAddPropertyModal(true)}>
                                            <Text style={styles.quickAddText}>+ Quick Add Property</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.propertyListContainer}>
                                        <ScrollView
                                            nestedScrollEnabled={true}
                                            showsVerticalScrollIndicator={false}
                                            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                                        >
                                            {allProperties.length === 0 ? (
                                                <Text style={styles.noPropertiesText}>No properties available.</Text>
                                            ) : (
                                                allProperties.map((prop, index) => {
                                                    const isSelected = selectedPropertyIds.includes(prop.id);
                                                    return (
                                                        <TouchableOpacity
                                                            key={index}
                                                            style={styles.propertyItem}
                                                            onPress={() => {
                                                                if (isSelected) {
                                                                    setSelectedPropertyIds(selectedPropertyIds.filter(id => id !== prop.id));
                                                                } else {
                                                                    setSelectedPropertyIds([...selectedPropertyIds, prop.id]);
                                                                }
                                                            }}
                                                        >
                                                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                                                <Image
                                                                    source={isSelected ? Icons.ic_checkbox_selected : Icons.ic_checkbox_black}
                                                                    style={{ width: 18, height: 18, marginRight: 10, tintColor: isSelected ? ColorConstants.PRIMARY_BROWN : '#E0E0E0' }}
                                                                />
                                                                <Text style={styles.propertyName}>{prop.name}</Text>
                                                            </View>
                                                        </TouchableOpacity>
                                                    );
                                                })
                                            )}
                                        </ScrollView>
                                    </View>
                                </View>

                                {/* Address Field */}
                                <CustomTextInput
                                    label="Address (Optional)"
                                    value={formData.address}
                                    onChangeText={(t) => handleInputChange('address', t)}
                                    placeholder="Enter Address"
                                    multiline
                                    error={errors.address}
                                />

                                {/* Emergency Number */}
                                <CustomTextInput
                                    label="Emergency Number (Optional)"
                                    value={formData.emergency_contact}
                                    onChangeText={(t) => handleInputChange('emergency_contact', t)}
                                    placeholder="Enter Emergency Number"
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                    error={errors.emergency_contact}
                                />

                                {/* Website */}
                                <CustomTextInput
                                    label="Website"
                                    value={formData.website}
                                    onChangeText={(t) => handleInputChange('website', t)}
                                    placeholder="Enter Website URL (optional)"
                                    autoCapitalize="none"
                                    error={errors.website}
                                />

                                {/* Hierarchical Category Selection */}
                                {renderCategorySelection()}

                                {/* Rating */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Rating (Optional)</Text>
                                    <View style={styles.ratingContainer}>
                                        {[1, 2, 3, 4, 5].map((num) => {
                                            const isSelected = Math.floor(Number(formData.rating)) === num;
                                            return (
                                                <TouchableOpacity
                                                    key={num}
                                                    style={[
                                                        styles.ratingBox,
                                                        isSelected && styles.selectedRatingBox
                                                    ]}
                                                    onPress={() => handleInputChange('rating', num.toString())}
                                                    activeOpacity={0.7}
                                                >
                                                    <Text style={[
                                                        styles.ratingText,
                                                        isSelected && styles.selectedRatingText
                                                    ]}>
                                                        {num}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                    {errors.rating ? <Text style={styles.dropdownErrorText}>{errors.rating}</Text> : null}
                                </View>

                                {/* Upload logo */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Upload logo</Text>
                                    {formData.logo_url ? (
                                        <View style={styles.logoPreviewContainer}>
                                            <Image
                                                source={{
                                                    uri: formData.logo_url.uri
                                                        ? formData.logo_url.uri
                                                        : formData.logo_url.startsWith('http')
                                                            ? formData.logo_url
                                                            : `${ApiConstants.MEDIA_URL}${formData.logo_url}`
                                                }}
                                                style={styles.logoPreview}
                                            />
                                            <TouchableOpacity
                                                style={styles.removeLogoButton}
                                                onPress={handleRemoveLogo}
                                                activeOpacity={0.8}
                                            >
                                                <Image source={Icons.ic_cross} style={styles.removeLogoIcon} />
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <TouchableOpacity style={styles.uploadArea} onPress={handleLogoPick} activeOpacity={0.7}>
                                            <Image source={Icons.ic_upload} style={styles.uploadIcon} />
                                            <Text style={styles.uploadTitle}>Upload Logo</Text>
                                            <Text style={styles.uploadSubtitle}>Drag and drop or select</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {/* Documents Section */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Documents (Optional)</Text>
                                    <View style={styles.uploadAreaContainer}>
                                        <TouchableOpacity style={styles.uploadArea} onPress={handleDocumentPick} activeOpacity={0.7}>
                                            <Image source={Icons.ic_doc} style={styles.uploadIcon} />
                                            <Text style={styles.uploadTitle}>Upload Documents</Text>
                                            <Text style={styles.uploadSubtitle}>PDF, Word or Images</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {selectedDocuments.length > 0 && (
                                        <View style={styles.documentList}>
                                            {selectedDocuments.map((doc, index) => (
                                                <View key={index} style={styles.documentItem}>
                                                    <View style={styles.documentInfo}>
                                                        <MaterialIcons name="insert-drive-file" size={20} color={ColorConstants.PRIMARY_BROWN} />
                                                        <Text style={styles.documentName} numberOfLines={1}>{doc.name}</Text>
                                                    </View>
                                                    <TouchableOpacity onPress={() => handleRemoveDocument(index)}>
                                                        <Image source={Icons.ic_cross} style={styles.removeDocIcon} />
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </View>

                                {/* Notes */}
                                <CustomTextInput
                                    label="Notes (Optional)"
                                    value={formData.notes}
                                    onChangeText={(t) => handleInputChange('notes', t)}
                                    placeholder="Enter any notes..."
                                    multiline
                                    inputStyles={{ height: 80, alignItems: 'flex-start' }}
                                    error={errors.notes}
                                />
                            </>
                        )}
                    </ScrollView>

                    {/* Footer Actions */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.createButton, loading && { opacity: 0.7 }]}
                            onPress={handleSave}
                            disabled={loading}
                        >
                            <Text style={styles.createButtonText}>
                                {loading ? 'Processing...' : (isEdit ? 'Update Contact' : 'Create Contact')}
                            </Text>
                        </TouchableOpacity>
                    </View>
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
    inputContainer: {
        marginBottom: 16
    },
    label: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        marginBottom: 8
    },
    emailIcon: {
        height: 14,
        width: 14,
        resizeMode: 'contain'
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
        color: ColorConstants.DARK_CYAN
    },
    arrowIcon: {
        width: 12,
        height: 12,
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
    dropdownScroll: {

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
        marginBottom: 12
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
        fontSize: 12,
        color: ColorConstants.BLACK2
    },
    taggedPropertiesSection: {
        marginBottom: 20,
    },
    taggedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },
    quickAddText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 13,
        color: '#E07D00', // Match screenshot orange
        // textDecorationLine: 'underline'
    },
    propertyListContainer: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: 12,
        minHeight: 50, // Match CustomTextInput height
        maxHeight: 150, // Limit height for multiple properties
        justifyContent: 'center'
    },
    noPropertiesText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: '#6B7280',
        fontStyle: 'italic'
    },
    propertyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    propertyName: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: '#374151'
    },
    propertyAddress: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.GRAY
    },
    // Sub-modal styles (now View Overlay)
    subModalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        padding: 24,
        zIndex: 2000,
    },
    subModalContainer: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 16,
        maxHeight: '80%'
    },
    propertyHeader: {
        backgroundColor: '#FFFBEB', // Light yellow header
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    propertyTitle: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 18,
        color: '#111827'
    },
    propertySubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: '#4B5563'
    },
    closeSubModal: {
        padding: 4
    },
    subModalContent: {
        padding: 16
    },
    row: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 12,
        gap: 8
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center'
    },
    subModalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6'
    },
    addPropertyBtn: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8
    },
    addPropertyBtnText: {
        color: ColorConstants.WHITE,
        fontFamily: Fonts.ManropeBold,
        fontSize: 14
    },
    removeTagButton: {
        padding: 2
    },
    removeTagIcon: {
        width: 10,
        height: 10,
        tintColor: ColorConstants.GRAY5
    },
    uploadArea: {
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: ColorConstants.GRAY2,
        borderRadius: 12,
        paddingVertical: 20,
        paddingHorizontal: 20,
        alignItems: 'center',
        backgroundColor: ColorConstants.LIGHT_PEACH3
    },
    uploadIcon: {
        width: 44,
        height: 44,
        tintColor: ColorConstants.BLACK2,
        marginBottom: 12,
        resizeMode: 'contain'
    },
    logoPreviewContainer: {
        width: 140,
        height: 140,
        borderRadius: 12,
        position: 'relative',
        marginTop: 5,
    },
    logoPreview: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
        resizeMode: 'cover',
        borderWidth: 1,
        borderColor: '#E0E0E0'
    },
    removeLogoButton: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: '#FF3B30',
        width: 25,
        height: 25,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeLogoIcon: {
        width: 12,
        height: 12,
        tintColor: ColorConstants.WHITE,
        resizeMode: 'contain'
    },
    uploadTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.BLACK2,
        marginBottom: 4
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
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 10,
        marginHorizontal: 20,
        marginBottom: 20
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
    createButton: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8
    },
    createButtonText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.WHITE
    },
    dropdownErrorText: {
        marginTop: 4,
        fontSize: 11,
        color: ColorConstants.RED,
        fontFamily: 'Inter-Regular',
    },
    ratingContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4
    },
    ratingBox: {
        width: 44,
        height: 44,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        backgroundColor: ColorConstants.WHITE,
        justifyContent: 'center',
        alignItems: 'center'
    },
    selectedRatingBox: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        borderColor: ColorConstants.PRIMARY_BROWN
    },
    ratingText: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 16,
        color: ColorConstants.BLACK2
    },
    selectedRatingText: {
        color: ColorConstants.WHITE
    },
    tabBarWrapper: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
    },
    tabBarContainer: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 6,
        borderRadius: 10,
        gap: 4,
    },
    activeTab: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
    },
    tabIcon: {
        width: 12,
        height: 12,
        tintColor: '#6B7280',
        resizeMode: 'contain',
    },
    activeTabIcon: {
        tintColor: ColorConstants.WHITE,
    },
    tabText: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 10.5,
        color: '#6B7280',
    },
    activeTabText: {
        color: ColorConstants.WHITE,
    },
    uploadAreaContainer: {
        marginTop: 8,
    },
    documentList: {
        marginTop: 12,
        gap: 8,
    },
    documentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    documentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    documentName: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        flex: 1,
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
        width: '47.5%',
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
        fontSize: 13,
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
        marginTop: 20,
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
        fontSize: 14,
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
        // marginBottom: 20
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
    checkboxWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    checkboxBase: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        backgroundColor: ColorConstants.WHITE,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    checkboxSelected: {
        borderColor: ColorConstants.PRIMARY_BROWN,
    },
    checkboxIcon: {
        width: 14,
        height: 14,
        tintColor: ColorConstants.PRIMARY_BROWN,
    },
    checkboxLabel: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    multiSelectItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
    },
    checkIconDropdown: {
        width: 14,
        height: 14,
        tintColor: ColorConstants.PRIMARY_BROWN,
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
    removeDocIcon: {
        width: 16,
        height: 16,
        tintColor: ColorConstants.GRAY,
    },
});

export default AddContactModal;