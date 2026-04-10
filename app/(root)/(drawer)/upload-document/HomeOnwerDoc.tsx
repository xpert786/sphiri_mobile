import { apiDelete, apiGet } from '@/api/apiMethods'; // Added import
import { ApiConstants } from '@/api/endpoints'; // Added import
import { Icons } from '@/assets';
import CommonButton from '@/components/CommonButton';
import DocumentCard, { DocumentItem } from '@/components/DocumentCard';
import FilterDropdown from '@/components/FilterDropdown';
import Header from '@/components/Header';
import { ColorConstants } from '@/constants/ColorConstants'; // Ensure this matches user's path
import { Fonts } from '@/constants/Fonts';
import { StringConstants } from '@/constants/StringConstants';
import CreateNewFolderModal from '@/modals/CreateNewFolderModal';
import DeleteConfirmationModal from '@/modals/DeleteConfirmationModal';
import UploadDocumentModal from '@/modals/UploadDocumentModal';
import { styles } from '@/styles/_documentStyles';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    LayoutAnimation,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';



// Data for Dropdowns
const allDocOptions = [
    { id: 'home', label: 'Home', checked: true },
    { id: 'family', label: 'Family', checked: true },
    { id: 'legal', label: 'Legal', checked: false },
    { id: 'insurance', label: 'Insurance', checked: false },
    { id: 'fin', label: 'Financial', checked: true },
    { id: 'maint', label: 'Maintenance', checked: false },
    { id: 'fin2', label: 'Financial', checked: true }, // Duplicate in screenshot? Keeping distinct ID
    { id: 'maint2', label: 'Maintenance', checked: false },
    { id: 'warr', label: 'Warranty', checked: true },
    { id: 'legal2', label: 'Legal', checked: true },
    { id: 'ident', label: 'Identify', checked: true },
    { id: 'est', label: 'Estate Planning', checked: true },
    { id: 'prop', label: 'Property', checked: true },
    { id: 'priv', label: 'Private', checked: true },
    { id: 'share', label: 'Shared', checked: true },
];

const allFolderOptions = [
    { id: 'inspol', label: 'Insurance policies', checked: true },
    { id: 'warmaint', label: 'Warranties & Maintenance', checked: true },
    { id: 'fam', label: 'Family Records', checked: true },
    { id: 'est', label: 'Estate Planning', checked: true },
    { id: 'prop', label: 'Property Documents', checked: true },
    { id: 'med', label: 'Medical Records', checked: true },
    { id: 'tax', label: 'Tax Documents', checked: true },
    { id: 'travel', label: 'Travel Documents', checked: true },
    { id: 'util', label: 'Utility Bills', checked: true },
    { id: 'veh', label: 'Vehicle Documents', checked: true },
    { id: 'bank', label: 'Bank Documents', checked: true },
];


// --- Types for Folder Management ---
type FileType = 'PDF' | 'DOCX' | 'TXT' | 'JPG';

interface FileItem {
    id: string;
    name: string;
    date: string;
    type: FileType;
    file_url: string;
}

interface FolderItem {
    id: string;
    name: string;
    description?: string;
    subFolders?: FolderItem[];
    files?: FileItem[];
    docCount?: number; // "9 documents" or "3 docs"
    subFolderCount?: number; // "3 Subfolders"
}

// --- API Response Interfaces ---
interface ApiDocument {
    id: number;
    title: string;
    file: string;
    file_url: string;
    file_name: string;
    file_type: string;
    file_size: number;
    file_size_display: string;
    version: number;
    parent_document: number | null;
    uploaded_by: string;
    category: number | null;
    category_name: string | null;
    linked_contacts: string[];
    linked_contacts_ids: number[];
    linked_family_members: string[];
    linked_family_members_ids: number[];
    linked_vendors: string[];
    linked_vendors_ids: number[];
    issue_date: string;
    expiration_date: string;
    status: string;
    is_shared: boolean;
    property_name: string | null;
    tag_names: string[] | null;
    tags: number[] | null;
    created_at: string;
    updated_at: string;
}

interface ApiResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: ApiDocument[];
}

interface ApiCategory {
    id: number;
    name: string;
    description: string;
    icon: string;
    color: string;
    category_group: string;
    document_count: number;
    children?: ApiCategory[];
}

interface ApiCategoryResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: ApiCategory[];
}

import { handleDownload } from '@/constants/Helper';
import { useRouter } from 'expo-router'; // Add this import

export default function HomeOnwerDoc() {
    const router = useRouter(); // Initialize router
    const [activeTab, setActiveTab] = useState<'All Documents' | 'Folder Management'>('All Documents');
    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [newFolderModalVisible, setNewFolderModalVisible] = useState(false);
    const [editingDocumentId, setEditingDocumentId] = useState<number | null>(null);
    const [editingDocumentDetails, setEditingDocumentDetails] = useState<any | null>(null);

    // Items To Show State
    const [itemsToShow, setItemsToShow] = useState<number | 'All'>(6);
    const [showItemsDropdown, setShowItemsDropdown] = useState(false);
    const showOptions = [6, 12, 24, 50, 'All'];


    // File Menu State
    const [activeFileMenu, setActiveFileMenu] = useState<string | null>(null);
    const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);
    const [isFileDeleteModalVisible, setIsFileDeleteModalVisible] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Filter selections (Mock)
    const [docFilters, setDocFilters] = useState(allDocOptions);
    const [folderFilters, setFolderFilters] = useState(allFolderOptions);


    // Expanded state for folders: simple map of folder ID -> boolean
    const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
        'f1': true, // Open by default for demo
        'f1-1': true
    });

    const [documents, setDocuments] = useState<DocumentItem[]>([]); // Changed to state
    const [isLoading, setIsLoading] = useState(false); // Added loading state
    const [allTags, setAllTags] = useState<any[]>([]); // Added tags master list
    const [categories, setCategories] = useState<FolderItem[]>([]); // Added category state
    const [isCategoriesLoading, setIsCategoriesLoading] = useState(false); // Added category loading state

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [apiCategoryOptions, setApiCategoryOptions] = useState<string[]>(['All']);
    const [selectedProperty, setSelectedProperty] = useState<string>('All');
    const [apiPropertyOptions, setApiPropertyOptions] = useState<string[]>(['All']);
    const [selectedTag, setSelectedTag] = useState<string>('All');
    const [apiTagOptions, setApiTagOptions] = useState<string[]>(['All']);

    const init = async () => {
        setIsLoading(true);
        setIsCategoriesLoading(true);
        try {
            // Fetch all in parallel
            console.log("Starting init fetch...");
            const [docsResponse, categoriesResponse, defaultCategoriesResponse, propertiesResponse, tagsResponse] = await Promise.all([
                apiGet(ApiConstants.HOMEOWNER_DOCUMENTS),
                apiGet(ApiConstants.MY_FOLDERS_LIST),
                apiGet(ApiConstants.DEFAULT_CATEGORIES),
                apiGet(ApiConstants.PROPERTIES),
                apiGet(ApiConstants.DOCUMENT_TAGS)
            ]);

            const docsData = docsResponse.data as ApiResponse;
            const categoriesData = categoriesResponse.data;
            const defaultCatsData = defaultCategoriesResponse.data;
            const propsData = propertiesResponse.data;
            const tagsData = tagsResponse.data;

            console.log("init - docsResponse:", JSON.stringify(docsResponse));

            // Sync API Categories for filter
            const dCatsInit = Array.isArray(defaultCatsData) ? defaultCatsData : (defaultCatsData.results || []);
            const cCatsInit = Array.isArray(categoriesData) ? categoriesData : (categoriesData.results || []);
            const mergedCatNamesInit = Array.from(new Set([
                ...dCatsInit.map((c: any) => c.name),
                ...cCatsInit.map((c: any) => c.name)
            ])).filter(Boolean);
            setApiCategoryOptions(['All', ...mergedCatNamesInit]);

            // Sync API Properties for filter
            const propItems = Array.isArray(propsData) ? propsData : (propsData.results || []);
            const propNames = propItems.map((p: any) => p.name);
            setApiPropertyOptions(['All', ...propNames]);

            // Sync API Tags for filter
            const tagItems = Array.isArray(tagsData) ? tagsData : (tagsData.results || []);
            setAllTags(tagItems);
            const tagNames = tagItems.map((t: any) => t.name);
            setApiTagOptions(['All', ...tagNames]);

            // Process documents for "All Documents" tab
            const today = new Date().toISOString().split('T')[0];
            const mappedDocs: DocumentItem[] = docsData.results.map(doc => ({
                id: doc.id,
                title: doc.title,
                badgeText: doc.category_name || doc.file_type,
                folderName: doc.category_name || 'Uncategorized',
                propertyName: doc.property_name || 'All', // Assuming property_name is available
                tags: doc.tag_names && doc.tag_names.length > 0
                    ? doc.tag_names
                    : (doc.tags ? doc.tags.map((id: number) => tagItems.find((t: any) => t.id === id)?.name).filter(Boolean) : []),
                fileType: doc.file_type,
                fileSize: doc.file_size_display,
                uploadedBy: doc.uploaded_by,
                issuedDate: doc.issue_date,
                expirationDate: doc.expiration_date,
                status: doc.status,
                isShared: doc.is_shared,
                linkedContacts: doc.linked_contacts || [],
                linkedFamilyMembers: doc.linked_family_members || [],
                linkedVendors: doc.linked_vendors || [],
                versionCount: doc.version,
                isLocked: false,
                isExpiringSoon: doc.expiration_date === today,
                file_url: doc.file_url,
            }));
            setDocuments(mappedDocs);

            // Process categories with documents for "Folder Management" tab
            const categoriesToTransform = Array.isArray(categoriesData) ? categoriesData : (categoriesData.results || []);
            const transformedFolders = transformCategoriesToFolders(categoriesToTransform, docsData.results);

            // Sort by id descending so newest appear at the top
            const sortedFolders = [...transformedFolders].sort((a, b) => Number(b.id) - Number(a.id));
            setCategories(sortedFolders);

        } catch (error) {
            console.error("Initialization error:", error);
        } finally {
            setIsLoading(false);
            setIsCategoriesLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            init();
        }, [])
    );
    const fetchCategories = async () => {
        setIsCategoriesLoading(true);
        try {
            // We need documents too to match them
            console.log("Starting fetchCategories...");
            const [docsResponse, categoriesResponse, defaultCategoriesResponse] = await Promise.all([
                apiGet(ApiConstants.HOMEOWNER_DOCUMENTS),
                apiGet(ApiConstants.MY_FOLDERS_LIST),
                apiGet(ApiConstants.DEFAULT_CATEGORIES)
            ]);

            const docsData = docsResponse.data as ApiResponse;
            const categoriesData = categoriesResponse.data;
            const defaultCatsData = defaultCategoriesResponse.data;

            console.log("docsResponse:", docsResponse);


            // Sync API Categories for filter
            const dCatsFetch = Array.isArray(defaultCatsData) ? defaultCatsData : (defaultCatsData.results || []);
            const cCatsFetch = Array.isArray(categoriesData) ? categoriesData : (categoriesData.results || []);
            const mergedCatNamesFetch = Array.from(new Set([
                ...dCatsFetch.map((c: any) => c.name),
                ...cCatsFetch.map((c: any) => c.name)
            ])).filter(Boolean);
            setApiCategoryOptions(['All', ...mergedCatNamesFetch]);

            const categoriesToTransform = Array.isArray(categoriesData) ? categoriesData : (categoriesData.results || []);
            const transformedFolders = transformCategoriesToFolders(categoriesToTransform, docsData.results);

            // Sort by id descending so newest appear at the top
            const sortedFolders = [...transformedFolders].sort((a, b) => Number(b.id) - Number(a.id));
            setCategories(sortedFolders);

            // Also update the documents state while we're at it
            const today = new Date().toISOString().split('T')[0];
            const mappedDocs: DocumentItem[] = docsData.results.map(doc => ({
                id: doc.id,
                title: doc.title,
                badgeText: doc.category_name || doc.file_type,
                folderName: doc.category_name || 'Uncategorized',
                propertyName: doc.property_name || 'All',
                tags: doc.tag_names && doc.tag_names.length > 0
                    ? doc.tag_names
                    : (doc.tags ? doc.tags.map((id: number) => allTags.find((t: any) => t.id === id)?.name).filter(Boolean) : []),
                fileType: doc.file_type,
                fileSize: doc.file_size_display,
                uploadedBy: doc.uploaded_by,
                issuedDate: doc.issue_date,
                expirationDate: doc.expiration_date,
                status: doc.status,
                isShared: doc.is_shared,
                linkedContacts: doc.linked_contacts || [],
                linkedFamilyMembers: doc.linked_family_members || [],
                linkedVendors: doc.linked_vendors || [],
                versionCount: doc.version,
                isLocked: false,
                isExpiringSoon: doc.expiration_date === today,
                file_url: doc.file_url,
            }));
            setDocuments(mappedDocs);
        } catch (error) {
            console.error("FETCH CATEGORY ERROR:", error);
        } finally {
            setIsCategoriesLoading(false);
        }
    };

    const handleDeleteFile = async () => {
        if (!fileToDelete) return;
        try {
            setIsLoading(true);
            const response = await apiDelete(`${ApiConstants.HOMEOWNER_DOCUMENTS}${fileToDelete.id}/`);
            if (response.status === 200 || response.status === 204) {
                Toast.show({
                    type: 'success',
                    text1: 'Deleted',
                    text2: 'Document deleted successfully',
                });
                fetchCategories(); // Refresh folders and files
            }
        } catch (error) {
            console.error("Delete error:", error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to delete document',
            });
        } finally {
            setIsLoading(false);
            setIsFileDeleteModalVisible(false);
            setFileToDelete(null);
        }
    };



    const transformCategoriesToFolders = (apiCategories: ApiCategory[], apiDocuments: ApiDocument[]): FolderItem[] => {
        if (!Array.isArray(apiCategories)) return [];

        return apiCategories.map(cat => {
            // Match documents by category name
            const matchingDocs = apiDocuments.filter(doc => doc.category_name === cat.name);
            const mappedFiles: FileItem[] = matchingDocs.map(doc => ({
                id: doc.id.toString(),
                name: doc.title,
                date: new Date(doc.created_at).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                }),
                type: doc.file_type as FileType,
                file_url: doc.file_url
            }));

            return {
                id: cat.id.toString(),
                name: cat.name,
                description: cat.description,
                docCount: cat.document_count,
                subFolders: transformCategoriesToFolders(cat.children || [], apiDocuments),
                subFolderCount: cat.children?.length || 0,
                files: mappedFiles
            };
        });
    };

    const fetchDocuments = async () => {
        setIsLoading(true);
        try {
            const response = await apiGet(ApiConstants.HOMEOWNER_DOCUMENTS);
            const data = response.data as ApiResponse;
            console.log("data in fetchDocuments:", data);


            const today = new Date().toISOString().split('T')[0];
            const mappedDocs: DocumentItem[] = data.results.map(doc => ({
                id: doc.id,
                title: doc.title,
                badgeText: doc.category_name || doc.file_type,
                folderName: doc.category_name || 'Uncategorized',
                issuedDate: doc.issue_date,
                expirationDate: doc.expiration_date,
                versionCount: doc.version,
                isLocked: false,
                isExpiringSoon: doc.expiration_date === today,
                file_url: doc.file_url,
            }));

            setDocuments(mappedDocs);
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleFolder = (folderId: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedFolders(prev => ({
            ...prev,
            [folderId]: !prev[folderId]
        }));
    };

    const handleCreateFolder = (data: any) => {
        console.log('Folder created event:', data);
        setNewFolderModalVisible(false);
        fetchCategories(); // Refetch to ensure the UI is in sync with server state
    };

    const toggleDocFilter = (id: string) => {
        setDocFilters(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
    }

    const toggleFolderFilter = (id: string) => {
        setFolderFilters(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
    }

    const handlePreviewDocument = (file: FileItem) => {
        if (!file.file_url) return;
        Linking.openURL(file.file_url).catch(err => {
            console.error('Error opening document preview URL:', err);
            Toast.show({
                type: 'error',
                text1: 'Preview Error',
                text2: 'Unable to open document preview.',
            });
        });
    };

    const handleEditDocument = async (file: FileItem) => {
        try {
            const res = await apiGet(`${ApiConstants.HOMEOWNER_DOCUMENTS}${file.id}/`);
            if (res.status === 200) {
                setEditingDocumentId(Number(file.id));
                setEditingDocumentDetails(res.data);
                setUploadModalVisible(true);
            }
        } catch (error) {
            console.error('Error fetching document details for edit:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load document for editing.',
            });
        } finally {
            setActiveFileMenu(null);
        }
    };

    const renderFileItem = (file: FileItem) => (
        <TouchableOpacity
            key={file.id}
            style={[styles.fileItemContainer, { position: 'relative', zIndex: activeFileMenu === file.id ? 999 : 1, elevation: activeFileMenu === file.id ? 1 : 0 }]}
            onPress={() => router.push({
                pathname: '/(root)/(drawer)/upload-document/document-details',
                params: { id: file.id, title: file.name }
            })}
        >
            <View style={styles.fileIconContainer}>
                <Image source={Icons.ic_file_corner} style={styles.fileIcon} />
            </View>
            <View style={styles.fileContent}>
                <Text style={styles.fileName}>{file.name}</Text>
                <Text style={styles.fileDate}>{file.date}</Text>
            </View>
            <View style={styles.fileBadgeContainer}>
                <Text style={styles.fileBadgeText}>{file.type}</Text>
            </View>

            {/* Kebab Menu */}
            <View>
                <TouchableOpacity
                    style={styles.moreButton}
                    onPress={(e) => {
                        e.stopPropagation(); // Prevent nav on menu click
                        setActiveFileMenu(prev => prev === file.id ? null : file.id)
                    }}
                >
                    <Image source={Icons.ic_dots_vertical} style={styles.moreIcon} />
                </TouchableOpacity>

                {/* Popup Menu */}
                {activeFileMenu === file.id && (
                    <View style={styles.popupMenu}>
                        <TouchableOpacity style={styles.popupMenuItem} onPress={(e) => {
                            console.log("file, ", file)
                            //  e.stopPropagation(); 
                            handleDownload(file?.file_url)
                        }}>
                            <Text style={styles.popupMenuText}>Download</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.popupMenuItem}
                            onPress={(e) => {
                                e.stopPropagation();
                                handlePreviewDocument(file);
                                setActiveFileMenu(null);
                            }}>
                            <Text style={styles.popupMenuText}>Preview</Text>
                        </TouchableOpacity>
                        {/* <TouchableOpacity style={styles.popupMenuItem} onPress={(e) => { e.stopPropagation();  setActiveFileMenu(null); }}>
                            <Text style={styles.popupMenuText}>Edit</Text>
                        </TouchableOpacity> */}
                        <TouchableOpacity style={styles.popupMenuItem} onPress={(e) => { e.stopPropagation(); setFileToDelete(file); setIsFileDeleteModalVisible(true); setActiveFileMenu(null); }}>
                            <Text style={[styles.popupMenuText, { color: ColorConstants.RED }]}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderFolderItem = (folder: FolderItem, level: number = 0) => {
        const isExpanded = !!expandedFolders[folder.id];
        // Indentation for nested items
        const paddingLeft = level * 20;

        return (
            <View key={folder.id} style={styles.folderWrapper}>
                <TouchableOpacity
                    style={[styles.folderHeader, { paddingLeft: paddingLeft || 16 }]}
                    onPress={() => toggleFolder(folder.id)}
                    activeOpacity={0.7}
                >
                    <View style={styles.folderLeft}>
                        {/* Chevron */}
                        <Image
                            source={Icons.ic_down_arrow}
                            style={[
                                styles.chevron,
                                { transform: [{ rotate: isExpanded ? '0deg' : '-90deg' }] }
                            ]}
                        />
                        {/* Custom Yellow Folder Icon */}
                        <Image source={Icons.ic_yellow_folder} style={styles.folderIcon} />

                        <View>
                            <Text style={styles.folderTitle}>{folder.name}</Text>
                            <Text style={styles.folderSubtitle}>
                                {folder.description || (folder.subFolderCount ? `${folder.subFolderCount} Subfolders` : '')}
                            </Text>
                        </View>
                    </View>

                    {/* Badge / Actions */}
                    {!isExpanded && <View style={styles.folderRight}>
                        <View style={styles.docCountBadge}>
                            <Text style={styles.docCountText}>{folder.docCount ? `${folder.docCount} docs` : '0 docs'}</Text>
                        </View>
                    </View>}
                </TouchableOpacity>

                {/* Collapsible Content */}
                {isExpanded && (
                    <View style={styles.folderContent}>
                        {/* Render Subfolders */}
                        {folder.subFolders?.map(sub => renderFolderItem(sub, level + 1))}

                        {/* Render Files */}
                        {folder.files?.map(file => (
                            <View key={file.id} style={{ paddingLeft: (level + 1) * 20 + 16 }}>
                                {renderFileItem(file)}
                            </View>
                        ))}

                        {!folder.subFolders && !folder.files?.length && (
                            <View style={[styles.folderActionsRow, { paddingLeft: paddingLeft + 56 }]}>
                                <View style={styles.docCountBadge}>
                                    <Text style={styles.docCountText}>{folder.docCount ? `${folder.docCount} docs` : '0 docs'}</Text>
                                </View>
                                <TouchableOpacity style={styles.smallActionBtn}>
                                    <Image source={Icons.ic_edit2} style={styles.smallActionIcon} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.smallActionBtn}>
                                    <Image source={Icons.ic_bin} style={styles.smallActionIcon} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
            </View>
        );
    }



    const renderItemsToShowDropdown = () => {
        if (!showItemsDropdown) return null;

        return (
            <View style={styles.itemsDropdownOverlay}>
                {showOptions.map((option) => (
                    <TouchableOpacity
                        key={option.toString()}
                        style={styles.itemsDropdownItem}
                        onPress={() => {
                            setItemsToShow(option as any);
                            setShowItemsDropdown(false);
                        }}
                    >
                        {itemsToShow === option && (
                            <Image source={Icons.ic_checkbox_tick} style={styles.checkIcon} />
                        )}
                        <Text style={styles.itemsDropdownItemText}>{option}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <Header
                title="Documents"
                subtitle="Secure storage for all your important documents."
                showBackArrow={false}
                containerStyle={{ marginTop: 10 }}
            />
            <UploadDocumentModal
                visible={uploadModalVisible}
                onClose={() => setUploadModalVisible(false)}
                onUploadSuccess={() => {
                    setUploadModalVisible(false);
                    setEditingDocumentId(null);
                    setEditingDocumentDetails(null);
                    fetchDocuments();
                    fetchCategories();
                }}
                documentId={editingDocumentId || undefined}
                initialDetails={editingDocumentDetails}
            />
            <CreateNewFolderModal
                visible={newFolderModalVisible}
                onClose={() => setNewFolderModalVisible(false)}
                onCreate={handleCreateFolder}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>

                {/* Main Action Button */}
                <CommonButton
                    title={activeTab === 'Folder Management' ? StringConstants.NEW_FOLDER : StringConstants.UPLOAD_DOCUMENT}
                    onPress={() => {
                        if (activeTab === 'Folder Management') {
                            setNewFolderModalVisible(true);
                        } else {
                            setUploadModalVisible(true);
                        }
                    }}
                    containerStyle={{ marginHorizontal: 20, marginBottom: 16 }}
                    icon={activeTab === 'Folder Management' ? Icons.ic_folder_outline : Icons.ic_upload}
                />

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'All Documents' && styles.tabButtonActive]}
                        onPress={() => { setActiveTab('All Documents'); }}
                    >
                        <Text style={[styles.tabText]}>All Documents</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'Folder Management' && styles.tabButtonActive]}
                        onPress={() => { setActiveTab('Folder Management'); }}
                    >
                        <Text style={[styles.tabText]}>Folder Management</Text>
                    </TouchableOpacity>
                </View>

                {/* Search Bar & Show Dropdown Row */}
                <View style={styles.searchAndShowRow}>
                    <View style={styles.searchContainer}>
                        <Image source={Icons.ic_search} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder={activeTab === 'All Documents' ? "Search documents..." : "Search folders..."}
                            placeholderTextColor={ColorConstants.DARK_CYAN}
                        />
                    </View>
                    <View style={{ width: '40%', flexDirection: 'row', alignItems: 'center' }}>

                        <Text style={styles.showLabel}>Show: </Text>

                        <View style={{ zIndex: 10 }}>
                            <TouchableOpacity
                                style={styles.showDropdownTrigger}
                                onPress={() => setShowItemsDropdown(!showItemsDropdown)}
                            >
                                <Text style={styles.showDropdownText}>{itemsToShow}</Text>
                                <View style={{ transform: [{ rotate: showItemsDropdown ? '180deg' : '0deg' }] }}>
                                    <Image source={Icons.ic_down_arrow} style={styles.showDropdownArrow} />
                                </View>
                            </TouchableOpacity>

                            {/* Items To Show List (Shadow/Overlay) */}
                            {renderItemsToShowDropdown()}
                        </View>
                    </View>
                </View>

                {/* Filters - Show for All Documents only */}
                {activeTab === 'All Documents' && (
                    <View style={{ paddingHorizontal: 20, marginBottom: 16, flexDirection: 'row', gap: 10 }}>
                        <View style={{ flex: 1 }}>
                            <FilterDropdown
                                label="Category"
                                data={apiCategoryOptions}
                                value={selectedCategory}
                                onSelect={setSelectedCategory}
                                placeholder="All"
                                inputStyles={{ borderRadius: 12, height: 44 }}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <FilterDropdown
                                label="Property"
                                data={apiPropertyOptions}
                                value={selectedProperty}
                                onSelect={setSelectedProperty}
                                placeholder="All"
                                inputStyles={{ borderRadius: 12, height: 44 }}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <FilterDropdown
                                label="Tags"
                                data={apiTagOptions}
                                value={selectedTag}
                                onSelect={setSelectedTag}
                                placeholder="All"
                                inputStyles={{ borderRadius: 12, height: 44 }}
                            />
                        </View>
                    </View>
                )}

                {/* Content */}
                {activeTab === 'All Documents' ? (
                    <>
                        {/* Documents List */}
                        <View style={styles.documentsList}>
                            {(() => {
                                const filteredDocs = documents.filter(doc => {
                                    const matchCategory = selectedCategory === 'All'
                                        ? true
                                        : (doc.badgeText === selectedCategory || doc.folderName === selectedCategory);
                                    const matchProperty = selectedProperty === 'All'
                                        ? true
                                        : (doc.propertyName === selectedProperty);
                                    const matchTag = selectedTag === 'All'
                                        ? true
                                        : (doc.tags?.includes(selectedTag));
                                    return matchCategory && matchProperty && matchTag;
                                });
                                const finalDocs = itemsToShow === 'All' ? filteredDocs : filteredDocs.slice(0, itemsToShow);

                                if (isLoading) {
                                    return <ActivityIndicator size="large" color={ColorConstants.DARK_CYAN} style={{ marginTop: 20 }} />;
                                }

                                if (finalDocs.length > 0) {
                                    return (
                                        <FlatList
                                            data={finalDocs}
                                            keyExtractor={(item) => item.id.toString()}
                                            renderItem={({ item }) => (
                                                <TouchableOpacity
                                                    activeOpacity={0.8}
                                                    onPress={() => router.push({
                                                        pathname: '/(root)/(drawer)/upload-document/document-details',
                                                        params: { id: item.id.toString(), title: item.title }
                                                    })}
                                                >
                                                    <DocumentCard item={item} />
                                                </TouchableOpacity>
                                            )}
                                            showsVerticalScrollIndicator={false}
                                            scrollEnabled={false}
                                        />
                                    );
                                }

                                return (
                                    <View style={{ alignItems: 'center', marginTop: 20 }}>
                                        <Text style={{ fontFamily: Fonts.ManropeRegular, color: ColorConstants.DARK_CYAN, textAlign: 'center', paddingHorizontal: 40, paddingTop: 70 }}>
                                            {selectedCategory === 'All' && selectedProperty === 'All' && selectedTag === 'All'
                                                ? "No documents found."
                                                : "No documents found matching the criteria."}
                                        </Text>
                                    </View>
                                );
                            })()}
                        </View>
                    </>
                ) : (
                    // --- Folder Management View ---
                    <View style={styles.folderContainer}>
                        {/* Folder List Card */}
                        <View style={styles.mainFolderCard}>
                            {isCategoriesLoading ? (
                                <ActivityIndicator size="large" color={ColorConstants.DARK_CYAN} style={{ marginVertical: 20 }} />
                            ) : categories.length > 0 ? (
                                (itemsToShow === 'All' ? categories : categories.slice(0, itemsToShow)).map((folder, index, array) => (
                                    <React.Fragment key={folder.id}>
                                        {renderFolderItem(folder)}
                                        {index < array.length - 1 && <View style={styles.folderSeparator} />}
                                    </React.Fragment>
                                ))
                            ) : (
                                <View style={{ alignItems: 'center', marginVertical: 20 }}>
                                    <Text style={{ fontFamily: 'Manrope-Regular', color: ColorConstants.DARK_CYAN }}>No folders found.</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

            </ScrollView>

            <DeleteConfirmationModal
                visible={isFileDeleteModalVisible}
                onClose={() => setIsFileDeleteModalVisible(false)}
                onDelete={handleDeleteFile}
                title={`Are you sure you want to delete "${fileToDelete?.name}"?`}
            />

            {isDownloading && (
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }]}>
                    <ActivityIndicator size="large" color={ColorConstants.PRIMARY_BROWN} />
                    <Text style={{ marginTop: 10, color: '#fff', fontFamily: Fonts.ManropeSemiBold }}>Downloading...</Text>
                </View>
            )}

        </View>
    );
};
