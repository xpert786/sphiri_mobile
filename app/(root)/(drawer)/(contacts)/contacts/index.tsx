import { apiDelete, apiGet, apiPost } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import AppDropdown from '@/components/AppDropdown';
import CommonButton from '@/components/CommonButton';
import Header from '@/components/Header';
import HierarchicalDropdown from '@/components/HierarchicalDropdown';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { capitalizeFirstLetter } from '@/constants/Helper';
import { StringConstants } from '@/constants/StringConstants';
import AddContactModal from '@/modals/AddContactModal';
import DeleteConfirmationModal from '@/modals/DeleteConfirmationModal';
import ShareContactModal from '@/modals/ShareContactModal';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    BackHandler,
    Dimensions,
    FlatList,
    Image,
    Linking,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    UIManager,
    View,
    findNodeHandle
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';


export type Contact = {
    id: number;
    name: string;
    first_name?: string;
    last_name?: string;
    company: string;
    logo_url: string;
    category_id?: number | string;
    category_name: string;
    phone_number: string;
    email: string;
    tags: { id: number; name: string }[];
    visibility_name: string;
    rating: string;
    address: string;
    address_line_1?: string;
    city?: string;
    state?: string;
    zipcode?: string;
    country?: string;
    website: string;
    emergency_contact: string;
    notes?: string;
    category?: string
};

type DropdownItem = {
    label: string;
    value: string;
    originalName?: string;
    isParent?: boolean;
};

type ActionMenu = {
    visible: boolean;
    contact: Contact | null;
    position: { x: number; y: number };
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');


export default function Contacts() {
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All categories');
    const [selectedTag, setSelectedTag] = useState('All Tags');
    const [searchQuery, setSearchQuery] = useState('');
    const [shareModalVisible, setShareModalVisible] = useState(false);
    const [apiCategories, setApiCategories] = useState<DropdownItem[]>([]);
    const [flatCategories, setFlatCategories] = useState<DropdownItem[]>([]);
    const [apiTags, setApiTags] = useState<DropdownItem[]>([]);
    const [loadingFilters, setLoadingFilters] = useState(false);
    const [apiContacts, setApiContacts] = useState<Contact[]>([]);
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [actionMenu, setActionMenu] = useState<ActionMenu>({
        visible: false,
        contact: null,
        position: { x: 0, y: 0 }
    });
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

    const [activeTab, setActiveTab] = useState<'personal' | 'vendor'>('personal');
    const [apiPersonalContacts, setApiPersonalContacts] = useState<Contact[]>([]);
    const [loadingPersonalContacts, setLoadingPersonalContacts] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    useFocusEffect(
        useCallback(() => {
            fetchFilters();
            fetchVendorContacts();
            fetchPersonalContacts();
        }, [])
    );

    useEffect(() => {
        if (activeTab) {
            fetchFilters(activeTab);
        }
    }, [activeTab]);

    useEffect(() => {
        const backAction = () => {
            router.push('/(root)/(drawer)/Home');
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchQuery, selectedCategory, selectedTag]);

    const flattenCategories = (categories: any[], depth = 0): DropdownItem[] => {
        let result: DropdownItem[] = [];
        const indent = '\u00A0'.repeat(depth * 4); // 4 non-breaking spaces per level

        categories.forEach(cat => {
            const hasChildren = cat.subcategories && cat.subcategories.length > 0;
            result.push({
                label: `${indent}${cat.name}`,
                value: cat.id.toString(),
                originalName: cat.name,
                isParent: hasChildren
            });

            if (hasChildren) {
                result = [...result, ...flattenCategories(cat.subcategories, depth + 1)];
            }
        });

        return result;
    };

    const fetchFilters = async (activeTab?: 'personal' | 'vendor') => {
        console.log('activeTab in fetchFilters:', activeTab)
        let url = activeTab == 'vendor' ? ApiConstants.VENDOR_PROFESSIONAL_CATEGORIES_SEED : ApiConstants.VENDOR_CATEGORIES;
        try {
            setLoadingFilters(true);
            const [catRes, tagRes] = await Promise.all([
                apiGet(url),
                apiGet(ApiConstants.VENDOR_TAGS)
            ]);

            if (catRes.status === 200 || catRes.status === 201) {
                // Handle different response structures:
                // VENDOR_PROFESSIONAL_CATEGORIES_SEED returns { message: "...", seeded: [...] }
                // VENDOR_CATEGORIES might return the array directly or in a similar property.
                const categoriesData = catRes.data?.seeded || catRes.data || [];
                const flattened = flattenCategories(categoriesData);
                const formattedCats: DropdownItem[] = [
                    { label: 'All categories', value: 'all', originalName: 'All categories' },
                    ...flattened
                ];

                console.log("formattedCats:", formattedCats);
                setApiCategories(formattedCats);
            }

            if (tagRes.status === 200 || tagRes.status === 201) {
                const formattedTags: DropdownItem[] = [
                    { label: 'All Tags', value: 'all' },
                    ...(tagRes.data || []).map((item: any) => ({
                        label: item.name || item.label,
                        value: item.id?.toString() || item.value
                    }))
                ];
                setApiTags(formattedTags);
            }
        } catch (error) {
            console.log('Error fetching filters:', error);
            // Fallback to minimal data if API fails completely to prevent broken UI
            setApiCategories([{ label: 'All categories', value: 'all' }]);
            setApiTags([{ label: 'All Tags', value: 'all' }]);
        } finally {
            setLoadingFilters(false);
        }
    };

    const fetchPersonalContacts = async () => {
        try {
            setLoadingPersonalContacts(true);
            const res = await apiGet(ApiConstants.PERSONAL_CONTACTS_LIST);
            console.log("response in personal contacts list:", JSON.stringify(res.data));

            if (res.status === 200 || res.status === 201) {
                const sortedData = (res.data || []).sort((a: any, b: any) => b.id - a.id);
                setApiPersonalContacts(sortedData);
            }
        } catch (error) {
            console.log('Error fetching personal contacts:', error);
        } finally {
            setLoadingPersonalContacts(false);
        }
    };

    const fetchVendorContacts = async () => {
        try {
            setLoadingContacts(true);
            const res = await apiGet(ApiConstants.VENDORS_LIST_CONTACTS);
            console.log("response in vendors list contacts:", JSON.stringify(res.data));

            if (res.status === 200 || res.status === 201) {
                const sortedData = (res.data || []).sort((a: any, b: any) => b.id - a.id);
                setApiContacts(sortedData);
            }
        } catch (error) {
            console.log('Error fetching contacts:', error);
        } finally {
            setLoadingContacts(false);
        }
    };

    const handleEditContact = (contact: Contact) => {
        setActionMenu({ visible: false, contact: null, position: { x: 0, y: 0 } });
        router.push({
            pathname: '/contact-details',
            params: {
                item: JSON.stringify(contact),
                editMode: 'true',
                type: activeTab === 'personal' ? 'personal_contact' : 'vendor'
            }
        });
    };

    const handleSaveContact = () => {
        setAddModalVisible(false);
        setSelectedContact(null);
        setIsEditMode(false);
        if (activeTab === 'personal') {
            fetchPersonalContacts();
        } else {
            fetchVendorContacts();
        }
    };



    const showActionMenu = (contact: Contact, event: any) => {
        const handle = findNodeHandle(event.target);
        if (handle) {
            UIManager.measure(handle, (x, y, width, height, pageX, pageY) => {
                // Precise positioning below the icon with 20px margin from screen edge
                const menuWidth = 140;
                const adjustedX = Math.min(pageX + width - menuWidth, SCREEN_WIDTH - menuWidth - 20);

                setActionMenu({
                    visible: true,
                    contact,
                    position: {
                        x: adjustedX,
                        y: pageY + height + 2
                    }
                });
            });
        }
    };


    const handleDeleteContact = async (contact: Contact) => {
        setActionMenu({ visible: false, contact: null, position: { x: 0, y: 0 } });
        setContactToDelete(contact);
        setDeleteModalVisible(true);
    };

    const confirmDeleteContact = async () => {
        try {
            if (!contactToDelete) return;

            const url = activeTab === 'personal'
                ? `${ApiConstants.PERSONAL_CONTACTS_LIST}${contactToDelete.id}/`
                : `${ApiConstants.VENDORS_LIST_CONTACTS}${contactToDelete.id}/`;
            const res = await apiDelete(url);

            if (res.status === 200 || res.status === 204 || res.status === 201) {
                console.log('Delete Success');
                setDeleteModalVisible(false);
                setContactToDelete(null);

                if (activeTab === 'personal') {
                    fetchPersonalContacts();
                } else {
                    fetchVendorContacts(); // Refresh the list
                }
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Contact deleted successfully',
                });
            } else {
                console.error('Delete Failed:', res.data);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: res.data?.message || 'Failed to delete contact',
                });
            }
        } catch (error: any) {
            console.error('Error deleting contact:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error?.response?.data?.message || error?.message || 'An unexpected error occurred',
            });
        }
    };

    const handleShareContact = async (selectedId: string | null) => {
        if (!selectedId || !selectedContact) return;
        console.log("selectedContact", selectedContact);

        setLoadingContacts(true); // Re-use loading state or add a new one if preferred.
        try {
            const payload = {
                vendor: selectedContact.id,
                assigned_family_member: parseInt(selectedId, 10),
                permission_level: "view",
                status: "active"
            };
            console.log("payload in handleShareContact->>>>", payload);

            const response = await apiPost(ApiConstants.VENDOR_ASSIGNMENTS, payload);
            if (response.status === 200 || response.status === 201) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Contact shared successfully',
                });
            } else {
                let errorMsg = response?.data?.message || 'Failed to share contact';
                const errData = response?.data;
                if (errData?.non_field_errors && Array.isArray(errData.non_field_errors) && errData.non_field_errors.some((err: string) => err.includes('unique set'))) {
                    errorMsg = 'Contact already shared to this member';
                }
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: errorMsg,
                });
            }
        } catch (error: any) {
            console.error('Error sharing contact:', error);
            let errorMsg = error?.response?.data?.message || 'Failed to share contact';
            const errData = error?.response?.data || error?.data;
            if (errData?.non_field_errors && Array.isArray(errData.non_field_errors) && errData.non_field_errors.some((err: string) => err.includes('unique set'))) {
                errorMsg = 'Contact already shared to this member';
            }
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: errorMsg,
            });
        } finally {
            setLoadingContacts(false);
            setShareModalVisible(false);
            setSelectedContact(null);
        }
    };

    const dataToFilter = activeTab === 'personal' ? apiPersonalContacts : apiContacts;

    const filteredContacts = dataToFilter.filter(contact => {
        const searchQueryLower = searchQuery.toLowerCase();
        const matchesSearch = searchQuery === '' ||
            contact.name.toLowerCase().includes(searchQueryLower) ||
            contact.company?.toLowerCase().includes(searchQueryLower) ||
            contact.email?.toLowerCase().includes(searchQueryLower) ||
            contact.phone_number?.toLowerCase().includes(searchQueryLower) ||
            contact.tags?.some(tag => tag.name.toLowerCase().includes(searchQueryLower));

        const matchesCategory = selectedCategory === 'All categories' ||
            contact.category_name === selectedCategory;

        const matchesTag = selectedTag === 'All Tags' ||
            contact.tags?.some(tag => tag.name === selectedTag);

        return matchesSearch && matchesCategory && matchesTag;
    });

    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(filteredContacts.length / pageSize) || 1);
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [filteredContacts.length]);

    const totalPages = Math.max(1, Math.ceil(filteredContacts.length / pageSize) || 1);
    const paginatedContacts = filteredContacts.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const renderContactItem = ({ item }: { item: Contact }) => {
        const initials = item.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

        return (
            <TouchableOpacity style={styles.contactCard} onPress={() => {
                router.push({
                    pathname: '/contact-details',
                    params: {
                        item: JSON.stringify(item),
                        type: activeTab === 'personal' ? 'personal_contact' : 'vendor'
                    }
                });
            }}>
                <View style={styles.contactHeader}>
                    {item.logo_url ?
                        <View style={styles.initialsContainer}>
                            <Image source={{ uri: `${ApiConstants.MEDIA_URL}${item.logo_url}` }} style={styles.profileImage} />
                        </View>
                        :
                        <View style={styles.initialsContainer}>
                            <Text style={styles.initialsText}>{initials ? initials : "V"}</Text>
                        </View>}

                    <View style={styles.contactInfo}>
                        <Text style={styles.contactName}>{capitalizeFirstLetter(item.name) || "Vendor"}</Text>
                        {item.category_name && <Text style={styles.contactCompany}>{item.category_name}</Text>}
                    </View>

                    <View style={styles.contactActions}>
                        {item.phone_number ? (
                            <TouchableOpacity
                                style={styles.actionIconButton}
                                onPress={() => Linking.openURL(`tel:${item.phone_number}`)}
                            >
                                <MaterialIcons name="call" size={18} color={ColorConstants.PRIMARY_BROWN} />
                            </TouchableOpacity>
                        ) : null}
                        {item.email ? (
                            <TouchableOpacity
                                style={styles.actionIconButton}
                                onPress={() => Linking.openURL(`mailto:${item.email}`)}
                            >
                                <MaterialIcons name="email" size={18} color={ColorConstants.PRIMARY_BROWN} />
                            </TouchableOpacity>
                        ) : null}
                    </View>

                    <TouchableOpacity
                        style={styles.moreButton}
                        onPress={(e) => showActionMenu(item, e)}
                    >
                        <Image source={Icons.ic_dots_vertical} style={styles.moreIcon} />
                    </TouchableOpacity>
                </View>

                {item.tags.length > 0 &&
                    <View style={styles.statusTagsRow}>
                        <View style={styles.tagsContainer}>
                            <View style={styles.tagLabelContainer}>
                                <Text style={styles.tagLabelText}>Tags</Text>
                                <Image source={Icons.ic_tags} style={styles.tagIcon} />
                            </View>

                            {item.tags.map((tag, index) => (
                                <View key={index} style={[
                                    styles.tagBadge,
                                    tag.name.includes('Emergency') && { backgroundColor: ColorConstants.RED },
                                    tag.name.includes('Shared') && { backgroundColor: ColorConstants.PRIMARY_BROWN }
                                ]}>
                                    <Text style={[
                                        styles.tagText,
                                        (tag.name.includes('Emergency') || tag.name.includes('Shared')) && { color: ColorConstants.WHITE }
                                    ]}>{tag.name}</Text>
                                </View>
                            ))}
                        </View>
                    </View>}
            </TouchableOpacity>
        );
    };


    const renderActionMenu = () => (
        <Modal
            transparent
            visible={actionMenu.visible}
            animationType="fade"
            onRequestClose={() => setActionMenu({ visible: false, contact: null, position: { x: 0, y: 0 } })}
        >
            <TouchableWithoutFeedback
                onPress={() => setActionMenu({ visible: false, contact: null, position: { x: 0, y: 0 } })}
            >
                <View style={styles.actionMenuOverlay}>
                    <View style={[styles.actionMenuContainer, {
                        top: actionMenu.position.y - 0,
                        left: actionMenu.position.x
                    }]}>
                        {actionMenu.contact && (
                            <>

                                <TouchableOpacity
                                    style={styles.actionMenuItem}
                                    onPress={() => {
                                        setSelectedContact(actionMenu.contact);
                                        setShareModalVisible(true);
                                        setActionMenu({ visible: false, contact: null, position: { x: 0, y: 0 } });
                                    }}
                                >
                                    <Text style={styles.actionMenuText}>Share with Family</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.actionMenuItem}
                                    onPress={() => handleEditContact(actionMenu.contact!)}
                                >
                                    <Text style={styles.actionMenuText}>Edit</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.actionMenuItem}
                                    onPress={() => handleDeleteContact(actionMenu.contact!)}
                                >
                                    <Text style={styles.actionMenuText}>Delete</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );



    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={ColorConstants.WHITE} barStyle="dark-content" />

            {addModalVisible && (
                <AddContactModal
                    visible={addModalVisible}
                    onClose={() => {
                        setAddModalVisible(false);
                        setSelectedContact(null);
                        setIsEditMode(false);
                    }}
                    onSave={handleSaveContact}
                    isEdit={isEditMode}
                    contactData={selectedContact}
                    activeTabText={activeTab}
                />
            )}

            {shareModalVisible && selectedContact && (
                <ShareContactModal
                    visible={shareModalVisible}
                    onClose={() => {
                        setShareModalVisible(false);
                        setSelectedContact(null);
                    }}
                    onShare={handleShareContact}
                    contactName={selectedContact.name}
                />
            )}

            <DeleteConfirmationModal
                visible={deleteModalVisible}
                onClose={() => {
                    setDeleteModalVisible(false);
                    setContactToDelete(null);
                }}
                onDelete={confirmDeleteContact}
                title={`Are you sure you want to delete ${contactToDelete?.name}?`}
            />

            {renderActionMenu()}

            <Header
                title={StringConstants.VENDORS_AND_CONTACTS}
                subtitle="Manage vendors, family, & professional contacts"
                showBackArrow={false}
                containerStyle={{ marginTop: 20 }}
            />

            {/* Tab Bar */}
            <View style={styles.tabBarWrapper}>
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

            <CommonButton
                title={'Add Contact'}
                onPress={() => {
                    setIsEditMode(false);
                    setSelectedContact(null);
                    setAddModalVisible(true);
                }}
                icon={Icons.ic_plus}
                containerStyle={{ marginHorizontal: 20 }}
            />

            <View style={styles.searchContainer}>
                <Image source={Icons.ic_search} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search contacts by name, company or tags..."
                    placeholderTextColor={ColorConstants.LIGHT_GREY2}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <View style={styles.filterRow}>
                <View style={styles.dropdownWrapper}>
                    <HierarchicalDropdown
                        label=""
                        data={apiCategories}
                        value={apiCategories.find(cat => cat.originalName === selectedCategory)?.label || selectedCategory}
                        onSelect={(val) => {
                            const selected = apiCategories.find(cat => cat.label === val);
                            if (selected) {
                                setSelectedCategory(selected.originalName || selected.label);
                            }
                        }}
                        placeholder="Select Category"
                        dropdownWidth={280}
                    />
                </View>

                <View style={styles.dropdownWrapper}>
                    <AppDropdown
                        label=""
                        data={apiTags.map(tag => tag.label)}
                        value={selectedTag}
                        onSelect={(val) => setSelectedTag(val)}
                        placeholder="Select Tag"
                    />
                </View>
            </View>




            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollViewContent}>


                <View style={[styles.sectionHeader, { justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }]}>
                    <Text style={styles.sectionTitle}>{activeTab === 'personal' ? 'Personal Contacts' : 'Professional Network'}</Text>
                    <Text style={{ fontSize: 14, color: ColorConstants.DARK_CYAN, fontFamily: Fonts.mulishRegular }}>
                        {filteredContacts.length} contacts
                    </Text>
                </View>

                <View style={styles.contactsList}>
                    <FlatList
                        data={paginatedContacts}
                        renderItem={renderContactItem}
                        keyExtractor={(item) => item.id.toString()}
                        scrollEnabled={false}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                        refreshing={activeTab === 'personal' ? loadingPersonalContacts : loadingContacts}
                        onRefresh={activeTab === 'personal' ? fetchPersonalContacts : fetchVendorContacts}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No contacts found matching your filters.</Text>
                            </View>
                        )}
                    />

                    {/* Pagination Controls */}
                    {filteredContacts.length > 10 && !(activeTab === 'personal' ? loadingPersonalContacts : loadingContacts) && (
                        <View style={styles.paginationContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.pageButton,
                                    currentPage === 1 && styles.pageButtonDisabled
                                ]}
                                disabled={currentPage === 1}
                                onPress={() => handlePageChange(currentPage - 1)}
                            >
                                <Text
                                    style={[
                                        styles.pageArrowText,
                                        currentPage === 1 && styles.pageArrowTextDisabled
                                    ]}
                                >
                                    {'<'}
                                </Text>
                            </TouchableOpacity>

                            {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                                .filter(page => page >= currentPage && page < currentPage + 4)
                                .map((page) => {
                                    const isActive = page === currentPage;
                                    return (
                                        <TouchableOpacity
                                            key={page}
                                            style={[
                                                styles.pageNumberButton,
                                                isActive && styles.pageNumberButtonActive
                                            ]}
                                            onPress={() => handlePageChange(page)}
                                        >
                                            <Text
                                                style={[
                                                    styles.pageNumberText,
                                                    isActive && styles.pageNumberTextActive
                                                ]}
                                            >
                                                {page}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}

                            <TouchableOpacity
                                style={[
                                    styles.pageButton,
                                    currentPage === totalPages && styles.pageButtonDisabled
                                ]}
                                disabled={currentPage === totalPages}
                                onPress={() => handlePageChange(currentPage + 1)}
                            >
                                <Text
                                    style={[
                                        styles.pageArrowText,
                                        currentPage === totalPages && styles.pageArrowTextDisabled
                                    ]}
                                >
                                    {'>'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorConstants.WHITE,
    },
    scrollViewContent: {
        flexGrow: 1,
        paddingBottom: 20
    },
    searchFilterWrapper: {
        padding: 10,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        marginHorizontal: 20,
        borderRadius: 10,
    },
    tabBarWrapper: {
        marginHorizontal: 20,
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
        borderRadius: 10,
        gap: 8,
    },
    activeTab: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
    },
    tabIcon: {
        width: 14,
        height: 14,
        tintColor: '#6B7280',
        resizeMode: 'contain',
    },
    activeTabIcon: {
        tintColor: ColorConstants.WHITE,
    },
    tabText: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 12,
        color: '#6B7280',
    },
    activeTabText: {
        color: ColorConstants.WHITE,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        minHeight: 34,
        marginHorizontal: 20,
        marginVertical: 6
    },
    searchIcon: {
        marginRight: 10,
        height: 12,
        width: 12,
        tintColor: ColorConstants.GRAY
    },
    searchInput: {
        flex: 1,
        fontFamily: 'Inter-Regular',
        fontSize: 11,
        color: ColorConstants.BLACK,
    },
    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        gap: 8,
    },
    dropdownButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: ColorConstants.WHITE,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        minHeight: 40,
    },
    dropdownButtonText: {
        flex: 1,
        fontFamily: Fonts.ManropeMedium,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
        marginRight: 8,
    },
    chevronIcon: {
        width: 8,
        height: 8,
        resizeMode: 'contain',
        tintColor: ColorConstants.DARK_CYAN,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        minHeight: 40,
        flexShrink: 0,
    },
    addButtonText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 12,
        color: ColorConstants.WHITE,
        marginLeft: 4,
    },
    plusIcon: {
        width: 14,
        height: 14,
        resizeMode: 'contain',
    },
    dropdownWrapper: {
        flex: 1,
        marginTop: -15
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
        zIndex: 999,
    },
    checkIcon: {
        width: 16,
        height: 16,
        tintColor: ColorConstants.PRIMARY_BROWN,
    },
    sectionHeader: {
        paddingHorizontal: 20,
        marginTop: 10,
        marginBottom: 16,
    },
    sectionTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.BLACK2,
    },
    contactsList: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    contactCard: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
    },
    contactHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        // marginBottom: 15,
    },
    initialsContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: ColorConstants.LIGHT_PEACH,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        resizeMode: 'cover',
        borderWidth: 0.5,
        borderColor: ColorConstants.GRAY3,
    },
    initialsText: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 14,
        color: ColorConstants.PRIMARY_BROWN,
    },
    contactInfo: {
        flex: 1,
    },
    contactName: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.BLACK2,
        marginBottom: 2,
    },
    contactCompany: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
    },
    moreButton: {
        padding: 4,
    },
    moreIcon: {
        width: 20,
        height: 20,
    },
    contactActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionIconButton: {
        width: 25,
        height: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusTagsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginTop: 15
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 15,
        marginRight: 8,
    },
    shieldIcon: {
        width: 12,
        height: 12,
        marginRight: 4,
        tintColor: ColorConstants.WHITE,
    },
    statusText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 10,
    },
    tagIcon: {
        width: 10,
        height: 10,
        resizeMode: 'contain',
        marginLeft: 4,
    },
    tagLabelText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 10,
        color: ColorConstants.GRAY,
    },
    tagsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        flex: 1,
    },
    tagLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        marginLeft: 8,
    },
    tagBadge: {
        backgroundColor: ColorConstants.GRAY3,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 15,
        marginRight: 6,
        marginBottom: 2,

    },
    tagText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 10,
        color: ColorConstants.BLACK2,
    },
    separator: {
        height: 12,
    },
    // Action Menu Styles
    actionMenuOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    actionMenuContainer: {
        position: 'absolute',
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 8,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        minWidth: 120,
    },
    actionMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 7,
    },
    actionMenuIcon: {
        width: 16,
        height: 16,
        marginRight: 10,
        tintColor: ColorConstants.PRIMARY_BROWN,
    },
    actionMenuText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    emptyContainer: {
        paddingVertical: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.GRAY,
        textAlign: 'center',
    },
    paginationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 4,
        gap: 6,
    },
    pageButton: {
        minWidth: 36,
        height: 32,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: ColorConstants.WHITE,
        marginBottom: 8
    },
    pageButtonDisabled: {
        opacity: 1,
    },
    pageArrowText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
    },
    pageArrowTextDisabled: {
        color: ColorConstants.GRAY2,
    },
    pageNumberButton: {
        minWidth: 32,
        height: 32,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: ColorConstants.WHITE,
        marginBottom: 8
    },
    pageNumberButtonActive: {
        backgroundColor: ColorConstants.BLACK2,
        borderColor: ColorConstants.BLACK2,
    },
    pageNumberText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
    },
    pageNumberTextActive: {
        color: ColorConstants.WHITE,
    },
});
