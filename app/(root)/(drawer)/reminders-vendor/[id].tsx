import { apiGet } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import Header from '@/components/Header';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { capitalizeFirstLetter } from '@/constants/Helper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ReminderDetail {
    id: number;
    title: string;
    description: string;
    reminder_date: string;
    reminder_time: string;
    status: string;
    reminder_type: string;
    is_completed: boolean;
    is_recurring: boolean;
    recurrence_pattern: string;
    recurrence_end_date: string;
    notify_via_email: boolean;
    notify_via_push: boolean;
    created_by: string;
    created_at: string;
    category: {
        id: number;
        name: string;
        color: string;
        icon: string;
    };
    priority: {
        id: number;
        name: string;
        level: number;
        color: string;
    };
}

export default function ReminderDetailScreen() {
    const { id } = useLocalSearchParams();
    const [data, setData] = useState<ReminderDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchDetail();
        }
    }, [id]);

    const fetchDetail = async () => {
        try {
            setLoading(true);
            const response = await apiGet(`${ApiConstants.VENDOR_REMINDERS_API}${id}/`);
            if (response.data) {
                setData(response.data);
            }
        } catch (error) {
            console.error('Error fetching reminder detail:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };



    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Header title="Reminders" showBackArrow={true} tapOnBack={() => router.back()} />
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={ColorConstants.BLUE} />
                </View>
            </SafeAreaView>
        );
    }

    if (!data) {
        return (
            <SafeAreaView style={styles.container}>
                <Header title="Reminders" showBackArrow={true} tapOnBack={() => router.back()} />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Failed to load reminder details.</Text>
                </View>
            </SafeAreaView>
        );
    }


    return (
        <SafeAreaView style={styles.container}>
            <Header
                title="Reminders"
                subtitle="Track and manage your upcoming tasks and deadlines."
                showBackArrow={false}
                showMenu={true}
                containerStyle={{ paddingTop: 20 }}
            />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.contentCard}>
                    {/* Navigation */}
                    <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(root)/(drawer)/reminders-vendor/')}>
                        <MaterialCommunityIcons name="arrow-left" size={14} color={ColorConstants.DARK_CYAN} />
                        <Text style={styles.backButtonText}>Back to Reminders</Text>
                    </TouchableOpacity>

                    {/* Header Section */}
                    <View style={styles.headerSection}>
                        <View style={[styles.categoryIconContainer, { backgroundColor: data.category.color + '20' }]}>
                            <MaterialCommunityIcons name={'bell'} size={28} color={data.category.color} />
                        </View>
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.title}>{capitalizeFirstLetter(data.title)}</Text>
                            <View style={styles.badgeContainer}>
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusBadgeText}>{capitalizeFirstLetter(data.status.replace('_', ' '))}</Text>
                                </View>
                                <View style={[styles.priorityBadge, { backgroundColor: data.priority.id === 5 ? '#FEF2F2' : data.priority.id === 4 ? '#FFF7ED' : '#F0F9FF' }]}>
                                    <View style={[styles.priorityDot, { backgroundColor: data?.priority?.color }]} />
                                    <Text style={[styles.priorityText, { color: data?.priority?.color }]}>{data?.priority?.name}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Description Area */}
                    {/* Information Blocks */}
                    <View style={styles.infoBlock}>
                        <Text style={styles.infoBlockLabel}>Category</Text>
                        <Text style={styles.infoBlockValue}>{capitalizeFirstLetter(data?.category?.name)}</Text>
                    </View>

                    <View style={styles.infoBlock}>
                        <Text style={styles.infoBlockLabel}>Created By</Text>
                        <Text style={styles.infoBlockValue}>{data?.created_by || 'N/A'}</Text>
                    </View>

                    <View style={styles.infoBlock}>
                        <Text style={styles.infoBlockLabel}>Due Date</Text>
                        <Text style={styles.infoBlockValue}>{formatDate(data?.reminder_date)}</Text>
                    </View>

                    <View style={styles.infoBlock}>
                        <Text style={styles.infoBlockLabel}>Priority</Text>
                        <Text style={styles.infoBlockValue}>{capitalizeFirstLetter(data?.priority?.name)}</Text>
                    </View>

                    {/* Description Area */}
                    <Text style={styles.descriptionTitle}>Description</Text>
                    <View style={styles.descriptionBox}>
                        <Text style={styles.descriptionText}>{capitalizeFirstLetter(data?.description) || 'No description provided.'}</Text>
                    </View>

                    {/* Footer Metadata */}
                    <View style={styles.footerDivider} />
                    <View style={styles.metadataContainer}>
                        <Text style={styles.metadataText}>Reminder ID: #{data.id}</Text>
                        <Text style={styles.dotText}>•</Text>
                        <Text style={styles.metadataText}>Created: {formatDate(data?.created_at)}</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorConstants.WHITE,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    contentCard: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        padding: 20,
        // elevation: 4,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 4 },
        // shadowOpacity: 0.10,
        // shadowRadius: 8,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backButtonText: {
        fontSize: 12,
        fontFamily: Fonts.interMedium,
        color: ColorConstants.DARK_CYAN,
        marginLeft: 6,
    },
    headerSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    categoryIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    headerTextContainer: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontFamily: Fonts.interBold,
        color: '#111827',
        marginBottom: 6,
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusBadge: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    statusBadgeText: {
        fontSize: 11,
        fontFamily: Fonts.interMedium,
        color: ColorConstants.DARK_CYAN,
    },
    priorityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        gap: 4,
    },
    priorityDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    priorityText: {
        fontSize: 11,
        fontFamily: Fonts.interMedium,
    },
    infoBlock: {
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
    },
    infoBlockLabel: {
        fontSize: 13,
        fontFamily: Fonts.interMedium,
        color: '#6B7280',
        marginBottom: 4,
    },
    infoBlockValue: {
        fontSize: 15,
        fontFamily: Fonts.interSemiBold,
        color: '#111827',
    },
    descriptionTitle: {
        fontSize: 18,
        fontFamily: Fonts.interBold,
        color: '#111827',
        marginTop: 12,
        marginBottom: 12,
    },
    descriptionBox: {
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 8,
        marginBottom: 24,
    },
    descriptionText: {
        fontSize: 14,
        fontFamily: Fonts.interRegular,
        color: '#374151',
        lineHeight: 20,
    },
    footerDivider: {
        height: 1,
        backgroundColor: '#111827',
        marginTop: 16,
        marginBottom: 16,
    },
    metadataContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metadataText: {
        fontSize: 13,
        fontFamily: Fonts.interRegular,
        color: '#6B7280',
    },
    dotText: {
        fontSize: 13,
        fontFamily: Fonts.interRegular,
        color: '#6B7280',
        marginHorizontal: 12,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontFamily: Fonts.interMedium,
        fontSize: 15,
        color: ColorConstants.RED,
    },
});
