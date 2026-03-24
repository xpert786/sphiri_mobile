import { apiDelete, apiGet } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import CommonButton from '@/components/CommonButton';
import Header from '@/components/Header';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { capitalizeFirstLetter } from '@/constants/Helper';
import { StringConstants } from '@/constants/StringConstants';
import AddClientModal from '@/modals/AddClientModal';
import DeleteConfirmationModal from '@/modals/DeleteConfirmationModal';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    FlatList,
    Image,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Client {
    id: number;
    name: string;
    email: string;
    phone: string;
    services_count: number;
    last_service_date: string | null;
    last_service_display: string;
    rating: number;
    total_reviews: number;
    status: string;
    status_display: string;
}

interface ClientsResponse {
    clients: Client[];
}


export default function Clients() {
    const [menuId, setMenuId] = useState<number | null>(null);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                router.navigate('/(root)/(drawer)/Home');
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => subscription.remove();
        }, [])
    );

    const fetchClients = async () => {
        try {
            const response = await apiGet(`${ApiConstants.VENDOR_CLIENTS}?page=1`);
            if (response.data && response.data.clients) {
                setClients(response.data.clients);
            }
        } catch (error) {
            console.error("Failed to fetch clients:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    React.useEffect(() => {
        fetchClients();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchClients();
    };

    const toggleAccordion = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const toggleMenu = (id: number) => {
        setMenuId(menuId === id ? null : id);
    };

    const confirmDeleteClient = (id: number) => {
        setClientToDelete(id);
        setMenuId(null);
        setDeleteModalVisible(true);
    };

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderClientItem = ({ item: doc }: { item: Client }) => (
        <View key={doc.id} style={styles.cardContainer}>
            <TouchableOpacity
                style={[styles.documentCard, expandedId === doc.id && styles.expandedCard]}
                onPress={() => toggleAccordion(doc.id)}
                activeOpacity={0.9}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.headerTitleRow}>
                        <Text style={styles.cardTitle}>{capitalizeFirstLetter(doc.name)}</Text>
                        <View style={styles.headerActions}>
                            <TouchableOpacity
                                style={styles.menuTrigger}
                                onPress={() => toggleMenu(doc.id)}
                            >
                                <Image source={Icons.ic_dots_vertical} style={styles.dotsIcon} />
                            </TouchableOpacity>
                            <Image
                                source={expandedId === doc.id ? Icons.ic_up_arrow : Icons.ic_down_arrow}
                                style={styles.chevronIcon}
                            />
                        </View>
                    </View>

                    <View style={styles.fileTypeBadge}>
                        <Text style={styles.fileTypeText}>{doc.rating.toFixed(1)} ★</Text>
                    </View>

                    {expandedId === doc.id && (
                        <View style={styles.expandedContent}>
                            <Text style={styles.infoHeading}>Client Information</Text>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Contact Email</Text>
                                <Text style={styles.infoValue}>{doc.email}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Contact Number</Text>
                                <Text style={styles.infoValue}>{doc.phone || 'N/A'}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Services</Text>
                                <Text style={styles.infoValue}>{doc.services_count}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Last Service	</Text>
                                <Text style={styles.infoValue}>{doc.last_service_display}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Status</Text>
                                <Text style={[styles.infoValue, styles.statusText]}>{doc.status_display}</Text>
                            </View>
                        </View>
                    )}
                </View>
            </TouchableOpacity>

            {/* Action Menu Popover */}
            {menuId === doc.id && (
                <View style={styles.popoverMenu}>
                    <TouchableOpacity
                        style={styles.popoverItem}
                        onPress={() => {
                            setMenuId(null);
                            router.push({
                                pathname: '/(root)/(drawer)/(clients)/client-details',
                                params: { id: doc.id }
                            });
                        }}
                    >
                        <Text style={styles.popoverText}>View Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.popoverItem}
                        onPress={() => {
                            setMenuId(null);
                            router.push({
                                pathname: '/(root)/(drawer)/(clients)/client-details',
                                params: { id: doc.id, tab: 'Services' }
                            });
                        }}
                    >
                        <Text style={styles.popoverText}>View Service</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.popoverItem} onPress={() => {
                        router.push({
                            pathname: '/(root)/(drawer)/(message)/message',
                            params: { fromClient: true }
                        });
                    }}>
                        <Text style={styles.popoverText}>Send Message</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.popoverItem}
                        onPress={() => confirmDeleteClient(doc.id)}
                    >
                        <Text style={styles.popoverText}>Remove Client</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    const handleDeleteClient = async () => {
        if (!clientToDelete) return;

        try {
            await apiDelete(`${ApiConstants.VENDOR_CLIENTS}${clientToDelete}/`);
            // Optimistically remove from list
            setClients(currentClients => currentClients.filter(c => c.id !== clientToDelete));
            setDeleteModalVisible(false);
            setClientToDelete(null);
        } catch (error) {
            console.error("Failed to delete client:", error);
            Alert.alert("Error", "Failed to delete client. Please try again.");
            setDeleteModalVisible(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={ColorConstants.WHITE} barStyle="dark-content" />

            {loading && !refreshing ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={ColorConstants.DARK_CYAN} />
                </View>
            ) : (
                <FlatList
                    data={filteredClients}
                    renderItem={renderClientItem}
                    keyExtractor={(item) => item.id.toString()}
                    ListHeaderComponent={
                        <>
                            <Header
                                title={"Clients"}
                                subtitle={'Manage your client relationships'}
                                showBackArrow={false}
                                containerStyle={{ paddingTop: 10 }}
                            />

                            <View style={styles.docWrapper}>
                                <CommonButton
                                    title={StringConstants.ADD_CLIENT}
                                    onPress={() => setModalVisible(true)}
                                    icon={Icons.ic_plus}
                                />

                                {/* Search Bar */}
                                <View style={styles.searchBar}>
                                    <Image source={Icons.ic_search} style={styles.searchIcon} />
                                    <TextInput
                                        placeholder={"Search clients..."}
                                        placeholderTextColor={ColorConstants.DARK_CYAN}
                                        style={styles.searchInput}
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                    />
                                </View>

                                {/* Documents List */}
                                <Text style={styles.documentsListTitle}>Client Directory</Text>
                                <Text style={[styles.documentsListSubTitle, { marginBottom: 24 }]}>{filteredClients.length} active clients</Text>
                            </View>
                        </>
                    }
                    contentContainerStyle={styles.contentStyles}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}

            <AddClientModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onAdd={(newClient) => {
                    setClients(prevClients => [newClient, ...prevClients]);
                }}
            />

            <DeleteConfirmationModal
                visible={deleteModalVisible}
                onClose={() => setDeleteModalVisible(false)}
                onDelete={handleDeleteClient}
                title="Are you sure you want to remove this client? This action cannot be undone."
            />

        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorConstants.WHITE,
    },
    contentStyles: {
        paddingBottom: 20
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    docWrapper: {
        marginHorizontal: 20

    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ColorConstants.WHITE,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 12,
        paddingHorizontal: 12,
        marginTop: 10,
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
    documentsListTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 20,
        color: ColorConstants.BLACK2,
        marginTop: 15
    },
    documentsListSubTitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
    },
    documentsList: {
        marginTop: 24,
    },
    cardContainer: {
        marginBottom: 16,
        position: 'relative',
        marginHorizontal: 20
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
    statusText: {
        backgroundColor: ColorConstants.GREEN2,
        color: ColorConstants.WHITE,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 2,
        alignSelf: 'flex-start',

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
        color: ColorConstants.DARK_CYAN,
        marginLeft: 8,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 10,
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
})