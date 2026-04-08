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
import { MaterialCommunityIcons } from '@expo/vector-icons';
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

    const getAvatarInitials = (name: string) => {
        if (!name) return '??';
        const names = name.split(' ');
        if (names.length >= 2) {
            return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
        }
        return name.charAt(0).toUpperCase();
    };

    const renderClientItem = ({ item: doc }: { item: Client }) => (
        <View key={doc.id} style={styles.cardContainer}>
            <TouchableOpacity
                style={[styles.documentCard, expandedId === doc.id && styles.expandedCard]}
                onPress={() => toggleAccordion(doc.id)}
                activeOpacity={0.9}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.headerPrimaryRow}>
                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarText}>{getAvatarInitials(doc.name)}</Text>
                        </View>
                        
                        <View style={styles.headerInfo}>
                            <Text style={styles.cardTitle} numberOfLines={1}>
                                {capitalizeFirstLetter(doc.name)}
                            </Text>
                            <Text style={styles.cardSubtitle} numberOfLines={1}>
                                {doc.email}
                            </Text>
                        </View>

                        <View style={styles.headerActions}>
                            <TouchableOpacity
                                style={styles.menuTrigger}
                                onPress={() => toggleMenu(doc.id)}
                            >
                                <Image source={Icons.ic_dots_vertical} style={styles.dotsIcon} />
                            </TouchableOpacity>
                            <MaterialCommunityIcons
                                name={expandedId === doc.id ? "chevron-up" : "chevron-down"}
                                size={24}
                                color={ColorConstants.BLACK2}
                            />
                        </View>
                    </View>

                    {expandedId === doc.id && (
                        <View style={styles.expandedContent}>
                            <View style={styles.divider} />
                            
                            <Text style={styles.infoHeading}>Client Contact</Text>
                            
                            <View style={styles.detailCard}>
                                <View style={styles.infoRow}>
                                    <View style={[styles.infoIconBox, { backgroundColor: ColorConstants.LIGHT_PEACH3 }]}>
                                        <MaterialCommunityIcons name="email-outline" size={20} color={ColorConstants.PRIMARY_BROWN} />
                                    </View>
                                    <View style={styles.infoTextContainer}>
                                        <Text style={styles.infoLabel}>Email Address</Text>
                                        <Text style={styles.infoValue}>{doc.email}</Text>
                                    </View>
                                </View>

                                <View style={styles.infoRow}>
                                    <View style={[styles.infoIconBox, { backgroundColor: ColorConstants.LIGHT_PEACH3 }]}>
                                        <MaterialCommunityIcons name="phone" size={20} color={ColorConstants.PRIMARY_BROWN} />
                                    </View>
                                    <View style={styles.infoTextContainer}>
                                        <Text style={styles.infoLabel}>Phone Number</Text>
                                        <Text style={styles.infoValue}>{doc.phone || 'Not available'}</Text>
                                    </View>
                                </View>
                            </View>

                            <Text style={styles.infoHeading}>Service Overview</Text>
                            
                            <View style={styles.statsRow}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statLabel}>Services</Text>
                                    <Text style={styles.statValue}>{doc.services_count}</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.statLabel}>Last Active</Text>
                                    <Text style={styles.statValue}>{doc.last_service_display}</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.statLabel}>Status</Text>
                                    <View style={styles.statusBadge}>
                                        <Text style={styles.statusBadgeText}>{doc.status_display}</Text>
                                    </View>
                                </View>
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
        height: 44,
    },
    searchIcon: {
        width: 16,
        height: 16,
        tintColor: ColorConstants.DARK_CYAN,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    documentsListTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 22,
        color: ColorConstants.BLACK2,
        marginTop: 20
    },
    documentsListSubTitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
        marginTop: 4
    },
    cardContainer: {
        marginBottom: 16,
        marginHorizontal: 20,
        position: 'relative',
    },
    documentCard: {
        backgroundColor: ColorConstants.WHITE,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 20,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    expandedCard: {
        borderColor: ColorConstants.PRIMARY_BROWN + '40', // 25% opacity
    },
    cardHeader: {
        width: '100%',
    },
    headerPrimaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarCircle: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: ColorConstants.LIGHT_PEACH3,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 18,
        color: ColorConstants.PRIMARY_BROWN,
    },
    headerInfo: {
        flex: 1,
    },
    cardTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 17,
        color: ColorConstants.BLACK2,
    },
    cardSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 13,
        color: ColorConstants.DARK_CYAN,
        marginTop: 2,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginLeft: 8,
    },
    menuTrigger: {
        backgroundColor: ColorConstants.GRAY_SHADE,
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dotsIcon: {
        width: 16,
        height: 16,
        tintColor: ColorConstants.BLACK2,
    },
    expandedContent: {
        marginTop: 16,
    },
    divider: {
        height: 1,
        backgroundColor: ColorConstants.GRAY_SHADE,
        marginBottom: 16,
    },
    infoHeading: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    detailCard: {
        backgroundColor: ColorConstants.GRAY_SHADE,
        borderRadius: 16,
        padding: 12,
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    infoIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoLabel: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 11,
        color: ColorConstants.GRAY,
    },
    infoValue: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        marginTop: 1,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 4,
    },
    statValue: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 16,
        color: ColorConstants.BLACK2,
    },
    statusBadge: {
        backgroundColor: ColorConstants.GREEN10,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusBadgeText: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 11,
        color: ColorConstants.GREEN,
    },
    popoverMenu: {
        position: 'absolute',
        top: 50,
        right: 48,
        backgroundColor: ColorConstants.WHITE,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 12,
        width: 160,
        padding: 6,
        zIndex: 2000,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
    },
    popoverItem: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    popoverText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 13,
        color: ColorConstants.DARK_CYAN,
    },
});