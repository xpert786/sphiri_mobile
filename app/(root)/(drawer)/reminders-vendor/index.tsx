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

interface Reminder {
    id: number;
    title: string;
    description: string;
    reminder_date: string;
    reminder_time: string;
    status: string;
    reminder_type: string;
    category: {
        name: string;
    };
    is_overdue: boolean;
}

export default function RemindersVendorScreen() {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReminders();
    }, []);

    const fetchReminders = async () => {
        try {
            setLoading(true);
            const response = await apiGet(ApiConstants.VENDOR_REMINDERS_API);
            if (response.data && response.data.reminders) {
                setReminders(response.data.reminders);
            }
        } catch (error) {
            console.error('Error fetching vendor reminders:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const renderItem = ({ item }: { item: Reminder }) => (
        <View style={styles.card}>
            <View style={styles.cardLeft}>
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons
                        name="alarm"
                        size={24}
                        color="#D97706"
                    />
                </View>
                <View style={styles.detailsContainer}>
                    <View style={styles.titleRow}>
                        <Text style={styles.title} numberOfLines={1}>{capitalizeFirstLetter(item.title)}</Text>
                        <View style={styles.typeTag}>
                            <Text style={styles.typeTagText}>{item.is_overdue ? "Overdue" : "Not Overdue"}</Text>
                        </View>
                    </View>
                    {!!item.description && (
                        <Text style={styles.description} numberOfLines={1}>{item?.category?.name}</Text>
                    )}
                    <Text style={styles.dueDate}>Due: {formatDate(item.reminder_date)}</Text>
                </View>
            </View>
            <TouchableOpacity
                style={styles.viewButton}
                onPress={() => router.push(`/(root)/(drawer)/reminders-vendor/${item.id}`)}
            >
                <Text style={styles.viewButtonText}>View</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={'dark-content'} />
            <Header
                title="Reminders"
                subtitle="Track and manage your upcoming tasks and deadlines."
                showBackArrow={false}
                showMenu={true}
                containerStyle={{ paddingTop: 20 }}
            />
            <View style={styles.mainContent}>
                <View style={styles.listContainer}>
                    <Text style={styles.listHeader}>Upcoming Reminders</Text>
                    {loading ? (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator size="large" color={ColorConstants.BLUE} />
                        </View>
                    ) : (
                        <FlatList
                            data={reminders}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderItem}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>No upcoming reminders found.</Text>
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
        minHeight: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        paddingVertical: 20,
        justifyContent: 'center',
        alignItems: 'center',
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
        paddingVertical: 12,
        paddingHorizontal: 12,
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
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
        width: 44,
        height: 44,
        borderRadius: 8,
        backgroundColor: '#FFFBEB', // Light yellow background
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    detailsContainer: {
        // flex: 1,
        justifyContent: 'center',
    },
    titleRow: {
        flexDirection: 'row',
        // alignItems: 'center',
        // justifyContent: 'space-between',
        marginBottom: 1,
    },
    title: {
        fontSize: 14,
        fontFamily: Fonts.interSemiBold,
        color: '#111827',
        flex: 1,
        marginRight: 8,
    },
    typeTag: {
        backgroundColor: ColorConstants.LIGHT_PEACH2,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    typeTagText: {
        fontSize: 10,
        fontFamily: Fonts.interMedium,
        color: ColorConstants.PRIMARY_BROWN,
    },
    description: {
        fontSize: 12,
        fontFamily: Fonts.interRegular,
        color: ColorConstants.DARK_CYAN,
        // marginBottom: 4,
    },
    dueDate: {
        fontSize: 11,
        fontFamily: Fonts.interMedium,
        color: ColorConstants.GRAY,
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
        fontSize: 12,
        fontFamily: Fonts.interMedium,
        color: ColorConstants.BLUE,
    },
});
