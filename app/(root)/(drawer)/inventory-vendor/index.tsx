import { apiGet } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import Header from '@/components/Header';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { capitalizeFirstLetter } from '@/constants/Helper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface InventoryItem {
    id: number;
    name: string;
    condition: string;
    category: string;
    current_value: string;
    // adding other fields for future use if needed
    description?: string;
    homeowner_name?: string
}

export default function InventoryVendorScreen() {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const response = await apiGet(ApiConstants.VENDOR_HOME_INVENTORY);
            if (response.data && response.data.results) {
                setItems(response.data.results);
            }
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: InventoryItem }) => (
        <View style={styles.card}>
            <View style={styles.cardLeft}>
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons
                        name={"cube-outline"}
                        size={30}
                        color={ColorConstants.DARK_CYAN}
                    />
                </View>
                <View style={styles.detailsContainer}>
                    <View style={styles.titleRow}>
                        <Text style={styles.title} numberOfLines={1}>{capitalizeFirstLetter(item.name)}</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{capitalizeFirstLetter(item.condition) || 'Available'}</Text>
                        </View>
                    </View>
                    <Text style={styles.subtitle} numberOfLines={2}>
                        {item.category} • Owner:  <Text style={styles.boldText}>{item.homeowner_name}</Text>
                    </Text>
                </View>
            </View>
            <TouchableOpacity
                style={styles.viewButton}
                onPress={() => router.push(`/(root)/(drawer)/inventory-vendor/${item.id}`)}
            >
                <Text style={styles.viewButtonText}>View</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={'dark-content'} />
            <Header
                title="Inventory"
                subtitle="Manage and track your home inventory items."
                showBackArrow={false}
                showMenu={true}
                containerStyle={{ paddingTop: 20 }}
            />
            <View style={styles.mainContent}>
                <View style={styles.listContainer}>
                    <Text style={styles.listHeader}>All Inventory Items</Text>
                    {loading ? (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator size="large" color={ColorConstants.BLUE} />
                        </View>
                    ) : (
                        <FlatList
                            data={items}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderItem}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>No inventory items found.</Text>
                                </View>
                            }
                        />
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorConstants.WHITE,
    },
    headerContainer: {
        paddingTop: 16,
        paddingBottom: 24,
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: Fonts.interBold,
        color: '#111827', // Dark gray for title
    },
    mainContent: {
        flex: 1,
        paddingHorizontal: 16,
    },
    listContainer: {
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 20,
    },
    listHeader: {
        fontSize: 18,
        fontFamily: Fonts.interBold,
        color: '#111827',
        marginBottom: 16,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 40,
    },
    emptyText: {
        fontFamily: Fonts.interMedium,
        fontSize: 14,
        color: ColorConstants.GRAY,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 14,
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        marginBottom: 12,
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#EBF3FF', // Very light blue background
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    icon: {
        width: 24,
        height: 24,
        tintColor: ColorConstants.BLUE,
        resizeMode: 'contain',
    },
    detailsContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 14,
        fontFamily: Fonts.interSemiBold,
        color: '#111827',
        marginRight: 8,
    },
    badge: {
        backgroundColor: ColorConstants.GRAY6,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 10,
        fontFamily: Fonts.interMedium,
        color: ColorConstants.DARK_CYAN,
    },
    subtitle: {
        fontSize: 11,
        fontFamily: Fonts.interRegular,
        color: ColorConstants.GRAY,
    },
    boldText: {
        fontFamily: Fonts.interSemiBold,
    },
    viewButton: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#93C5FD', // Light blue border
        backgroundColor: ColorConstants.WHITE,
        marginLeft: 10,
    },
    viewButtonText: {
        fontSize: 14,
        fontFamily: Fonts.interMedium,
        color: ColorConstants.BLUE,
    },
});
