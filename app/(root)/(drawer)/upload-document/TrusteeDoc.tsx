import { apiGet } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import Header from '@/components/Header';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { capitalizeFirstLetter, handleDownload } from '@/constants/Helper';
import { router, useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    BackHandler,
    FlatList,
    Image,
    LayoutAnimation,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface SharedDocument {
    id: number;
    title: string;
    file_type: string;
    file_size_display: string;
    category: number;
    category_name: string | null;
    issue_date: string;
    expiration_date: string;
    expiration_status: string;
    status: string;
    is_shared: boolean;
    created_at: string;
}

interface Category {
    id: number;
    name: string;
}

interface SharedDocumentsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: SharedDocument[];
    categories: Category[];
}

interface SharedFolderDocument {
    id: number;
    title: string;
    file_type: string;
    issue_date: string;
}

interface SharedFolder {
    id: number;
    name: string;
    description: string;
    icon: string;
    color: string;
    category_group: string;
    parent: number | null;
    document_count: number;
    subfolder_count: number;
    subfolders: SharedFolder[];
    documents: SharedFolderDocument[];
}

// --- Types for Folder Management ---
type FileType = 'PDF' | 'DOCX' | 'TXT' | 'JPG';

interface FileItem {
    id: string;
    name: string;
    date: string;
    type: FileType;
}

interface FolderItem {
    id: string;
    name: string;
    subFolders?: FolderItem[];
    files?: FileItem[];
    docCount?: number; // "9 documents" or "3 docs"
    subFolderCount?: number; // "3 Subfolders"
}


export default function TrusteeDoc() {
    const [activeTab, setActiveTab] = useState('Documents');
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All categories');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [expandedId, setExpandedId] = useState<number | null>(1);
    const [menuId, setMenuId] = useState<number | null>(null);
    const [activeFileMenu, setActiveFileMenu] = useState<string | null>(null);
    // Expanded state for folders: simple map of folder ID -> boolean
    const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
        'f1': true, // Open by default for demo
        'f1-1': true
    });

    const [documents, setDocuments] = useState<SharedDocument[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // New state for Shared Folders
    const [sharedFolders, setSharedFolders] = useState<SharedFolder[]>([]);

    const fetchDocuments = async (page = 1, search = '', categoryId: number | null = null) => {
        setIsLoading(true);
        try {
            const categoryParam = categoryId ? `&category=${categoryId}` : '';
            const response = await apiGet(`${ApiConstants.BASE_URL}${ApiConstants.SHARED_DOCUMENTS_LIST}?page=${page}&page_size=4&search=${search}${categoryParam}`);
            console.log("data in fetchDocuments:", JSON.stringify(response.data));
            const data: SharedDocumentsResponse = response.data;
            
            // Client-side fallback filter
            const filteredResults = categoryId 
                ? (data.results || []).filter(doc => doc.category === categoryId)
                : data.results;

            setDocuments(filteredResults);
            setCategories(data.categories);
            setTotalPages(Math.ceil(data.count / 4));
            setCurrentPage(page);
        } catch (error) {
            console.error("Error fetching shared documents:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSharedFolders = async () => {
        try {
            const response = await apiGet(`${ApiConstants.BASE_URL}${ApiConstants.SHARED_FOLDERS}`);
            const data: SharedFolder[] = response.data;
            // console.log("data in fetchSharedFolders:", data);

            setSharedFolders(data);
        } catch (error) {
            console.error("Error fetching shared folders:", error);
        }
    };

    const tapOnPreview = async (id: number) => {
        setIsLoading(true);
        try {
            // Fetch details to get file_url
            const detailsResponse = await apiGet(`${ApiConstants.BASE_URL}${ApiConstants.SHARED_DOCUMENTS_LIST}${id}/`);
            const docDetails = detailsResponse.data;
            console.log("docDetails in tapOnPreview:", docDetails);
            setIsLoading(false);


            if (!docDetails.file_url) {
                Alert.alert('Error', 'Download URL not found.');
                return;
            } else {
                try {
                    const supported = await Linking.canOpenURL(docDetails.file_url);
                    if (supported) {
                        await Linking.openURL(docDetails.file_url); // ✅ Chrome / default browser me open hoga
                    } else {
                        console.log("Can't open URL:", docDetails.file_url);
                    }
                } catch (error) {
                    console.log('Error opening URL', error);
                }
                setActiveFileMenu(null);

            }
        } catch (error) {
            console.error("Download error:", error);
            setIsLoading(false);
            Alert.alert('Error', 'Failed to download document.');
        } finally {
            setIsLoading(false);
        }
    };

    const tapOnDownloadIcon = async (id: number) => {
        setIsLoading(true);
        try {
            // Fetch details to get file_url
            const detailsResponse = await apiGet(`${ApiConstants.BASE_URL}${ApiConstants.SHARED_DOCUMENTS_LIST}${id}/`);
            const docDetails = detailsResponse.data;
            console.log("docDetails in tapOnDownloadIcon:", docDetails);


            if (!docDetails.file_url) {
                Alert.alert('Error', 'Download URL not found.');
                return;
            }
            handleDownload(docDetails.file_url)



        } catch (error) {
            console.error("Download error:", error);
            Alert.alert('Error', 'Failed to download document.');
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchDocuments(currentPage, searchQuery, selectedCategoryId);
        }, [currentPage, searchQuery, selectedCategoryId]) // Re-fetch when page, search query, or category changes
    );

    useFocusEffect(
        React.useCallback(() => {
            if (activeTab === 'Folders') {
                fetchSharedFolders();
            }
        }, [activeTab])
    );



    const toggleFolder = (folderId: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedFolders(prev => ({
            ...prev,
            [folderId]: !prev[folderId]
        }));
    };

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () =>
                subscription.remove();
        }, [])
    );

    const renderSharedFileItem = (file: SharedFolderDocument) => (
        <View
            key={`file-${file.id}`}
            style={[styles.fileItemContainer, { position: 'relative', zIndex: activeFileMenu === file.id.toString() ? 999 : 1, elevation: activeFileMenu === file.id.toString() ? 1 : 0 }]}

        >
            <View style={styles.fileIconContainer}>
                <Image source={Icons.ic_file_corner} style={styles.fileIcon} />
            </View>
            <View style={styles.fileContent}>
                <Text style={styles.fileName}>{file.title}</Text>
                {file.issue_date && <Text style={styles.fileDate}>{file.issue_date}</Text>}
            </View>
            <View style={styles.fileBadgeContainer}>
                <Text style={styles.fileBadgeText}>{file.file_type}</Text>
            </View>

            {/* Kebab Menu */}
            <View>
                <TouchableOpacity
                    style={styles.moreButton}
                    onPress={(e) => {
                        e.stopPropagation(); // Prevent nav on menu click
                        setActiveFileMenu(prev => prev === file.id.toString() ? null : file.id.toString())
                    }}
                >
                    <Image source={Icons.ic_dots_vertical} style={styles.moreIcon} />
                </TouchableOpacity>

                {/* Popup Menu */}
                {activeFileMenu === file.id.toString() && (
                    <View style={styles.popupMenu}>
                        <TouchableOpacity style={styles.popupMenuItem}
                            onPress={(e) => {
                                e.stopPropagation();
                                console.log('View Details', file.id);
                                setActiveFileMenu(null);
                                router.push({
                                    pathname: '/(root)/(drawer)/upload-document/document-details-trustee',
                                    params: { title: file.title, id: file.id }
                                })
                            }}>
                            <Text style={styles.popupMenuText}>View Details</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.popupMenuItem} onPress={() => tapOnPreview(file.id)}
                        // onPress={(e) => { e.stopPropagation(); console.log('Preview Document', file.id); setActiveFileMenu(null); }}
                        >
                            <Text style={styles.popupMenuText}>Preview Doc</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.popupMenuItem} onPress={(e) => {
                            e.stopPropagation();
                            console.log('Edit', file.id);
                            setActiveFileMenu(null);
                            router.push({
                                pathname: '/(root)/(drawer)/upload-document/document-details-trustee',
                                params: { title: file.title, id: file.id, action: 'edit' }
                            })
                        }}>
                            <Text style={styles.popupMenuText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.popupMenuItem} onPress={(e) => {
                            e.stopPropagation();
                            console.log('Download', file.id);
                            setActiveFileMenu(null);
                            tapOnDownloadIcon(file.id);
                        }}>
                            <Text style={styles.popupMenuText}>Download</Text>
                        </TouchableOpacity>


                    </View>
                )}
            </View>
        </View>
    );

    const renderSharedFolderItem = (folder: SharedFolder, level: number = 0) => {
        const isExpanded = !!expandedFolders[folder.id.toString()];
        // Indentation for nested items
        const paddingLeft = level * 20;

        return (
            <View key={folder.id} style={styles.folderWrapper}>
                <TouchableOpacity
                    style={[styles.folderHeader, { paddingLeft: paddingLeft || 16 }]}
                    onPress={() => toggleFolder(folder.id.toString())}
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
                            {/* Subtitle logic: "3 Subfolders" or "Identity" or "Home" depending on context */}
                            {folder.subfolder_count > 0 ? (
                                <Text style={styles.folderSubtitle}>{folder.subfolder_count} Subfolders</Text>
                            ) : (
                                <Text style={styles.folderSubtitle}>
                                    {folder.category_group || 'Shared Folder'}
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* Badge / Actions */}
                    {!isExpanded && <View style={styles.folderRight}>
                        <View style={styles.docCountBadge}>
                            <Text style={styles.docCountText}>{folder.document_count ? `${folder.document_count} docs` : '0 docs'}</Text>
                        </View>
                    </View>}
                </TouchableOpacity>

                {/* Collapsible Content */}
                {isExpanded && (
                    <View style={styles.folderContent}>
                        {/* Render Subfolders */}
                        {folder.subfolders?.map(sub => renderSharedFolderItem(sub, level + 1))}

                        {/* Render Files */}
                        {folder.documents?.map(file => (
                            <View key={file.id} style={{ paddingLeft: (level + 1) * 20 + 16 }}>
                                {renderSharedFileItem(file)}
                            </View>
                        ))}

                        {!folder.subfolders?.length && !folder.documents?.length && (
                            <View style={[styles.folderActionsRow, { paddingLeft: paddingLeft + 56 }]}>
                                <View style={styles.docCountBadge}>
                                    <Text style={styles.docCountText}>{folder.document_count ? `${folder.document_count} docs` : '0 docs'}</Text>
                                </View>
                                {/* <TouchableOpacity style={styles.smallActionBtn}>
                                    <Image source={Icons.ic_edit2} style={styles.smallActionIcon} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.smallActionBtn}>
                                    <Image source={Icons.ic_bin} style={styles.smallActionIcon} />
                                </TouchableOpacity> */}
                            </View>
                        )}
                    </View>
                )}
            </View>
        );
    }

    const toggleAccordion = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const toggleMenu = (id: number) => {
        setMenuId(menuId === id ? null : id);
    };

    return (
        <View style={styles.container}>
            <Header
                title="Shared Documents & Folders"
                subtitle="Browse and access documents & folders shared with you by the Primary User"
                showBackArrow={false}
                containerStyle={{ paddingTop: 20 }}
            />

            <ScrollView
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
                scrollEnabled={!isCategoryOpen}
            >
                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'Documents' && styles.activeTab]}
                        onPress={() => setActiveTab('Documents')}
                    >
                        <Text style={[styles.tabText, activeTab === 'Documents' && styles.activeTabText]}>
                            Shared Documents
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'Folders' && styles.activeTab]}
                        onPress={() => setActiveTab('Folders')}
                    >
                        <Text style={[styles.tabText, activeTab === 'Folders' && styles.activeTabText]}>
                            Shared Folders
                        </Text>
                    </TouchableOpacity>
                </View>


                {activeTab === 'Documents' ?
                    <>
                        {/* Search Bar */}
                        {/* <View style={styles.searchBar}>
                            <Image source={Icons.ic_search} style={styles.searchIcon} />
                            <TextInput
                                placeholder={"Search documents..."}
                                placeholderTextColor={ColorConstants.DARK_CYAN}
                                style={styles.searchInput}
                                value={searchQuery}
                                onChangeText={(text) => {
                                    setSearchQuery(text);
                                    setCurrentPage(1); // Reset to page 1 on search
                                }}
                            />
                        </View> */}

                        {/* Category Dropdown */}
                        <View style={[styles.dropdownContainer, { zIndex: 1000 }]}>
                            <TouchableOpacity
                                style={styles.dropdownHeader}
                                onPress={() => setIsCategoryOpen(!isCategoryOpen)}
                            >
                                <Text style={styles.dropdownTitle}>{selectedCategory}</Text>
                                <Image
                                    source={isCategoryOpen ? Icons.ic_up_arrow : Icons.ic_down_arrow}
                                    style={styles.dropdownIcon}
                                />
                            </TouchableOpacity>

                            {isCategoryOpen && (
                                <ScrollView
                                    style={styles.dropdownList}
                                    nestedScrollEnabled={true}
                                    showsVerticalScrollIndicator={true}
                                    persistentScrollbar={true}
                                    overScrollMode="never"
                                    contentContainerStyle={{ paddingVertical: 8 }}
                                >
                                    <TouchableOpacity
                                        style={styles.dropdownItem}
                                        onPress={() => {
                                            setSelectedCategory('All categories');
                                            setSelectedCategoryId(null);
                                            setIsCategoryOpen(false);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <Text style={styles.dropdownItemText}>All categories</Text>
                                    </TouchableOpacity>
                                    {categories.map((cat) => (
                                        <TouchableOpacity
                                            key={cat.id}
                                            style={styles.dropdownItem}
                                            onPress={() => {
                                                setSelectedCategory(cat.name);
                                                setSelectedCategoryId(cat.id);
                                                setIsCategoryOpen(false);
                                                setCurrentPage(1);
                                            }}
                                        >
                                            <View style={styles.itemContent}>
                                                <Text style={styles.dropdownItemText}>{cat.name}</Text>
                                                {cat.name === 'Home' && (
                                                    <Image source={Icons.ic_up_arrow} style={[styles.dropdownIcon, { transform: [{ rotate: '0deg' }] }]} />
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            )}
                        </View>

                        {/* Documents List */}
                        <View style={styles.documentsList}>


                            <FlatList
                                data={documents ?? []}
                                keyExtractor={(item) => item.id.toString()}
                                showsVerticalScrollIndicator={false}
                                scrollEnabled={false}
                                extraData={{ expandedId, menuId }}
                                renderItem={({ item: doc }) => (
                                    <View style={styles.cardContainer}>
                                        <TouchableOpacity
                                            style={[
                                                styles.documentCard,
                                                expandedId === doc.id && styles.expandedCard,
                                            ]}
                                            onPress={() => toggleAccordion(doc.id)}
                                            activeOpacity={0.9}
                                        >
                                            <View style={styles.cardHeader}>
                                                <View style={styles.headerTitleRow}>
                                                    <Text style={styles.cardTitle}>{capitalizeFirstLetter(doc.title)}</Text>

                                                    <View style={styles.headerActions}>
                                                        <TouchableOpacity
                                                            style={styles.menuTrigger}
                                                            onPress={() => toggleMenu(doc.id)}
                                                        >
                                                            <Image
                                                                source={Icons.ic_dots_vertical}
                                                                style={styles.dotsIcon}
                                                            />
                                                        </TouchableOpacity>

                                                        <Image
                                                            source={
                                                                expandedId === doc.id
                                                                    ? Icons.ic_up_arrow
                                                                    : Icons.ic_down_arrow
                                                            }
                                                            style={styles.chevronIcon}
                                                        />
                                                    </View>
                                                </View>

                                                <View style={styles.fileTypeBadge}>
                                                    <Text style={styles.fileTypeText}>{doc.file_type}</Text>
                                                </View>

                                                {expandedId === doc.id && (
                                                    <View style={styles.expandedContent}>
                                                        <Text style={styles.infoHeading}>
                                                            Document Information
                                                        </Text>

                                                        <View style={styles.infoRow}>
                                                            <Text style={styles.infoLabel}>Category</Text>
                                                            <Text style={styles.infoValue}>
                                                                {doc?.category_name || 'N/A'}
                                                            </Text>
                                                        </View>

                                                        <View style={styles.infoRow}>
                                                            <Text style={styles.infoLabel}>Issue Date</Text>
                                                            <Text style={styles.infoValue}>{doc.issue_date || 'N/A'}</Text>
                                                        </View>

                                                        <View style={styles.infoRow}>
                                                            <Text style={styles.infoLabel}>Expiration</Text>
                                                            {doc.expiration_status === 'Expiring Soon' ? (
                                                                <View style={styles.expiringBadge}>
                                                                    <Text style={styles.expiringText}>
                                                                        Expiring Soon
                                                                    </Text>
                                                                </View>
                                                            ) : (
                                                                <Text style={styles.infoValue}>
                                                                    {doc.expiration_date || 'N/A'}
                                                                </Text>
                                                            )}
                                                        </View>

                                                        <View style={styles.infoRow}>
                                                            <Text style={styles.infoLabel}>Size</Text>
                                                            <Text style={styles.infoValue}>
                                                                {doc.file_size_display}
                                                            </Text>
                                                        </View>

                                                        <View style={styles.infoRow}>
                                                            <Text style={styles.infoLabel}>Status</Text>
                                                            <Text style={styles.infoValue}>
                                                                {capitalizeFirstLetter(doc.status)}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                )}
                                            </View>
                                        </TouchableOpacity>

                                        {menuId === doc.id && (
                                            <View style={styles.popoverMenu}>
                                                <TouchableOpacity
                                                    style={styles.popoverItem}
                                                    onPress={() => {
                                                        setMenuId(null);
                                                        router.push({
                                                            pathname:
                                                                '/(root)/(drawer)/upload-document/document-details-trustee',
                                                            params: { title: doc.title, id: doc.id },
                                                        });
                                                    }}
                                                >
                                                    <Text style={styles.popoverTextActive}>
                                                        View Details
                                                    </Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    style={styles.popoverItem}
                                                    onPress={() => {
                                                        setMenuId(null);
                                                        router.push({
                                                            pathname:
                                                                '/(root)/(drawer)/upload-document/document-details-trustee',
                                                            params: {
                                                                title: doc.title,
                                                                id: doc.id,
                                                                action: 'edit',
                                                            },
                                                        });
                                                    }}
                                                >
                                                    <Text style={styles.popoverText}>Edit</Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    style={styles.popoverItem}
                                                    onPress={() => {
                                                        setMenuId(null);
                                                        tapOnDownloadIcon(doc.id);
                                                    }}
                                                >
                                                    <Text style={styles.popoverText}>Download</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                )}
                                ListEmptyComponent={
                                    <Text style={styles.emptyText}>No documents found</Text>
                                }
                            />

                        </View>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <View style={styles.pagination}>
                                <TouchableOpacity
                                    style={[styles.pageArrow, styles.leftArrow, currentPage === 1 && { opacity: 0.5 }]}
                                    onPress={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <Image source={Icons.ic_left} />
                                </TouchableOpacity>

                                {(() => {
                                    const rangeSize = 3;
                                    const start = Math.max(1, Math.min(currentPage - Math.floor(rangeSize / 2), Math.max(1, totalPages - rangeSize + 1)));
                                    const end = Math.min(totalPages, start + rangeSize - 1);

                                    const pages = [];
                                    for (let i = start; i <= end; i++) {
                                        pages.push(i);
                                    }

                                    return pages.map(page => (
                                        <TouchableOpacity
                                            key={page}
                                            style={[styles.pageNumber, currentPage === page && styles.activePage]}
                                            onPress={() => setCurrentPage(page)}
                                        >
                                            <Text style={[styles.pageText, currentPage === page && styles.activePageText]}>{page}</Text>
                                        </TouchableOpacity>
                                    ));
                                })()}

                                <TouchableOpacity
                                    style={[styles.pageArrow, styles.rightArrow, currentPage === totalPages && { opacity: 0.5 }]}
                                    onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    <Image source={Icons.ic_right} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </> :
                    <View style={styles.folderContainer}>
                        <View style={styles.mainFolderCard}>
                            {sharedFolders.length > 0 ?
                                sharedFolders.map((folder, index) => (
                                    <React.Fragment key={folder.id}>
                                        {renderSharedFolderItem(folder)}
                                        {index < sharedFolders.length - 1 && <View style={styles.folderSeparator} />}
                                    </React.Fragment>
                                )) : <Text style={styles.emptyText}>No shared folders found</Text>}
                        </View>
                    </View>
                }
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorConstants.WHITE,
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#F3E5E1',
        borderRadius: 12,
        padding: 4,
        marginTop: 10,
    },
    tab: {
        flex: 1,
        paddingVertical: 6,
        alignItems: 'center',
        borderRadius: 10,
    },
    activeTab: {
        backgroundColor: ColorConstants.WHITE,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    tabText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    activeTabText: {
        fontFamily: Fonts.ManropeSemiBold,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ColorConstants.WHITE,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 12,
        paddingHorizontal: 12,
        marginTop: 20,
        height: 39,
    },
    searchIcon: {
        width: 14,
        height: 14,
        tintColor: ColorConstants.DARK_CYAN,
    },
    searchInput: {
        flex: 1,
        marginLeft: 6,
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.BLACK2,
    },
    dropdownContainer: {
        marginTop: 16,
        position: 'relative',
    },
    dropdownHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // width: 140,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 36,
    },
    dropdownTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 13,
        color: ColorConstants.DARK_CYAN,
    },
    dropdownIcon: {
        width: 12,
        height: 12,
        tintColor: ColorConstants.GRAY,
        resizeMode: 'contain',
    },
    dropdownList: {
        position: 'absolute',
        top: 40,
        left: 0,
        backgroundColor: ColorConstants.WHITE,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 8,
        width: 320,
        // maxHeight: 500,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        zIndex: 1000,
    },
    dropdownItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    itemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dropdownItemText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
    },
    documentsList: {
        marginTop: 24,
    },
    cardContainer: {
        marginBottom: 16,
        position: 'relative',
    },
    documentCard: {
        backgroundColor: ColorConstants.WHITE,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 16,
        padding: 16,
    },
    expandedCard: {
        borderColor: ColorConstants.GRAY3,
    },
    cardHeader: {
        width: '100%',
    },
    headerTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 16,
        color: ColorConstants.BLACK2,
        flex: 1,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    menuTrigger: {
        backgroundColor: '#F1F3F5',
        width: 28,
        height: 28,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dotsIcon: {
        width: 16,
        height: 16,
        tintColor: ColorConstants.BLACK2,
    },
    chevronIcon: {
        width: 16,
        height: 16,
        tintColor: ColorConstants.BLACK2,
        resizeMode: 'contain',
    },
    fileTypeBadge: {
        backgroundColor: '#F7E7E2',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 2,
        borderRadius: 12,
        marginTop: 8,
    },
    fileTypeText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 12,
        color: ColorConstants.BLACK2,
    },
    expandedContent: {
        marginTop: 20,
    },
    infoHeading: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 18,
        color: ColorConstants.BLACK2,
        marginBottom: 16,
    },
    infoRow: {
        marginTop: 16,
    },
    infoLabel: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.GRAY,
        marginBottom: 4,
    },
    infoValue: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 15,
        color: ColorConstants.BLACK2,
    },
    expiringBadge: {
        backgroundColor: '#F55151',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 4,
        alignSelf: 'flex-start',
    },
    expiringText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 12,
        color: ColorConstants.WHITE,
    },
    popoverMenu: {
        position: 'absolute',
        top: 45,
        right: 48,
        backgroundColor: ColorConstants.WHITE,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 8,
        width: 130,
        padding: 4,
        zIndex: 2000,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
    },
    popoverItem: {
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    popoverTextActive: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 12,
        color: ColorConstants.BLACK2,
        backgroundColor: '#F7E7E2',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    popoverText: {
        fontFamily: Fonts.ManropeRegular,
        fontSize: 12,
        color: ColorConstants.GRAY,
        marginLeft: 8,
    },
    emptyText: {
        textAlign: 'center',
        marginVertical: 20,
        color: '#999',
        fontSize: 11,
        fontFamily: Fonts.ManropeRegular
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
        gap: 6,
    },
    pageNumber: {
        width: 32,
        height: 32,
        borderWidth: 0.5,
        borderColor: ColorConstants.DARK_CYAN,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activePage: {
        backgroundColor: '#4A5568',
        borderColor: '#4A5568',
    },
    activePageText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.WHITE,
    },
    pageText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    pageArrow: {
        width: 32,
        height: 32,
        borderWidth: 0.5,
        borderColor: ColorConstants.DARK_CYAN,
        alignItems: 'center',
        justifyContent: 'center',
    },
    leftArrow: {
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
    },
    rightArrow: {
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
    },


    // --- Folder Management Styles ---
    folderContainer: {
        flex: 1,
        marginTop: 25
    },
    mainFolderCard: {
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingVertical: 10,
        backgroundColor: ColorConstants.WHITE,
    },
    folderWrapper: {
        // overflow: 'hidden', // Removed to allow popup menu to overflow
    },
    folderHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingRight: 16,
    },
    folderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    chevron: {
        width: 10,
        height: 10,
        tintColor: ColorConstants.DARK_CYAN,
        resizeMode: 'contain',
        marginRight: 10,
    },
    folderIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
        marginRight: 10,
    },
    folderTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK,
        marginBottom: 2,
        maxWidth: 200,
    },
    folderSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 11,
        color: '#666',
    },
    folderRight: {
        alignItems: 'flex-end',
    },
    docCountBadge: {
        backgroundColor: '#E5E7EB',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    docCountText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 10,
        color: '#4B5563',
    },
    folderContent: {
        // Child content container
    },
    folderSeparator: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginLeft: 40,
        marginRight: 16,
    },

    // File Items
    fileItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        marginVertical: 4,
        marginRight: 16,
        padding: 10,
        borderRadius: 8,
    },
    fileIconContainer: {
        marginRight: 7,
    },
    fileIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
        tintColor: ColorConstants.BLACK2,
    },
    fileContent: {
        flex: 1,
    },
    fileName: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 10,
        color: ColorConstants.BLACK,
        marginBottom: 2,
    },
    fileDate: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 10,
        color: '#666',
    },
    fileBadgeContainer: {
        borderWidth: 1.5,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginRight: 3,
        marginLeft: 5,
        backgroundColor: '#FFFFFF',
    },
    fileBadgeText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 10,
        color: '#666',
    },
    moreButton: {
        padding: 4,
    },
    moreIcon: {
        width: 16,
        height: 16,
        resizeMode: 'contain',
    },

    // Actions
    folderActionsRow: {
        flexDirection: 'row',
        paddingBottom: 10,
        alignItems: 'center',
        gap: 12,
    },
    smallActionBtn: {
        padding: 4,
    },
    smallActionIcon: {
        width: 14,
        height: 14,
        resizeMode: 'contain',
        tintColor: '#6B7280',
    },

    // Popup Menu
    popupMenu: {
        position: 'absolute',
        top: 25,
        right: 0,
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        width: 100,
        zIndex: 2000,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    popupMenuItem: {
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    popupMenuText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 11,
        color: ColorConstants.BLACK,
    },

});
