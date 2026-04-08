import { apiGet } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import Header from '@/components/Header';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { capitalizeFirstLetter } from '@/constants/Helper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface InventoryDetail {
    id: number;
    name: string;
    category: string;
    current_value: string;
    condition: string;
    serial_number: string;
    vendor_name: string;
    room: string;
    created_at: string;
    homeowner_name: string;
    notes: string;
    photo_details?: FileDetails;
    video_details?: FileDetails;
    receipt_details?: FileDetails;
    warranty_document_details?: FileDetails;
    manual_details?: FileDetails;
    // Add other fields as per API response if needed
}

interface FileDetails {
    filename: string | null;
    path: string | null;
    url: string | null;
    size: number | null;
    status?: string | null;
}

export default function InventoryDetailScreen() {
    const { id } = useLocalSearchParams();
    const [data, setData] = useState<InventoryDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchDetail();
        }
    }, [id]);

    const fetchDetail = async () => {
        try {
            setLoading(true);
            const response = await apiGet(`${ApiConstants.VENDOR_HOME_INVENTORY}${id}/`);
            if (response.data) {
                setData(response.data);
            }
        } catch (error) {
            console.error('Error fetching inventory detail:', error);
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

    const InfoCard = ({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) => (
        <View style={styles.infoCard}>
            <Text style={styles.cardLabel}>{label}</Text>
            <Text style={styles.cardValue} numberOfLines={multiline ? undefined : 1}>{value ? (capitalizeFirstLetter(value) || 'N/A') : 'N/A'}</Text>
        </View>
    );

    const DocumentTile = ({ label, details }: { label: string; details?: FileDetails }) => {
        if (!details || !details.url) return null;
        return (
            <View style={styles.documentTile}>
                <Text style={styles.documentLabel}>{label.toUpperCase()}</Text>
                <View style={{ alignSelf: 'flex-start', marginBottom: 16 }}>
                    <View style={styles.availableBadge}>
                        <Text style={styles.availableBadgeText}>Available</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => Linking.openURL(details.url!)}>
                    <Text style={styles.viewLink}>View {label}</Text>
                </TouchableOpacity>
                <Text style={styles.filenameText} numberOfLines={1} ellipsizeMode="tail">
                    {details.filename}
                </Text>
            </View>
        );
    };

    const hasMediaDocs = data?.photo_details?.url || data?.video_details?.url || data?.receipt_details?.url || data?.warranty_document_details?.url || data?.manual_details?.url;

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Header title="Inventory" showBackArrow={true} tapOnBack={() => router.back()} />
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={ColorConstants.BLUE} />
                </View>
            </SafeAreaView>
        );
    }

    if (!data) {
        return (
            <SafeAreaView style={styles.container}>
                <Header title="Inventory" showBackArrow={true} tapOnBack={() => router.back()} />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Failed to load item details.</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title="Inventory"
                showBackArrow={false}
                showMenu={true}
                containerStyle={{ paddingTop: 20 }}
            />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.contentCard}>
                    {/* Back Button */}
                    <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(root)/(drawer)/inventory-vendor/')}>
                        <MaterialCommunityIcons name="arrow-left" size={14} color={ColorConstants.DARK_CYAN} />
                        <Text style={styles.backButtonText}>Back to Inventory</Text>
                    </TouchableOpacity>

                    {/* Title Row */}
                    <View style={styles.titleRow}>
                        <Text style={styles.title}>{capitalizeFirstLetter(data.name)}</Text>
                        {/* <View style={styles.badge}>
                            <Text style={styles.badgeText}>{capitalizeFirstLetter(data.condition) || 'Available'}</Text>
                        </View> */}
                    </View>

                    {/* Grid of Info */}
                    <InfoCard label="Owner" value={data.homeowner_name} />
                    <InfoCard label="Category" value={data.category} />
                    <InfoCard label="Price" value={`$${data.current_value || '0.00'}`} />
                    <InfoCard label="Serial Number" value={data.serial_number} />
                    <InfoCard label="Assigned Vendor" value={data.vendor_name} />
                    <InfoCard label="Condition" value={data.condition} />
                    <InfoCard label="Purchase Date" value={formatDate(data.created_at)} />
                    <InfoCard label="Additional Notes" value={data.notes} multiline={true} />

                    {hasMediaDocs ? (
                        <>
                            <Text style={styles.sectionHeader}>Media & Documents</Text>
                            <View style={styles.documentsContainer}>
                                <DocumentTile label="Photo" details={data.photo_details} />
                                <DocumentTile label="Video" details={data.video_details} />
                                <DocumentTile label="Receipt" details={data.receipt_details} />
                                <DocumentTile label="Warranty" details={data.warranty_document_details} />
                                <DocumentTile label="Manual" details={data.manual_details} />
                            </View>
                        </>
                    ) : null}

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Metadata */}
                    <View style={styles.metadata}>
                        <Text style={styles.metadataText}>Item ID: #{data.id}</Text>
                        <View style={styles.dot} />
                        <Text style={styles.metadataText}>Added: {formatDate(data.created_at)}</Text>
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
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.10,
        shadowRadius: 8,
        elevation: 4,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    backButtonText: {
        fontSize: 12,
        fontFamily: Fonts.interMedium,
        color: ColorConstants.DARK_CYAN,
        marginLeft: 8,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 28,
    },
    title: {
        fontSize: 20,
        fontFamily: Fonts.interBold,
        color: '#111827',
        marginRight: 12,
    },
    badge: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 11,
        fontFamily: Fonts.interMedium,
        color: ColorConstants.DARK_CYAN,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    infoCard: {
        width: '100%',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    cardLabel: {
        fontSize: 12,
        fontFamily: Fonts.interRegular,
        color: ColorConstants.GRAY,
        marginBottom: 1,
    },
    cardValue: {
        fontSize: 15,
        fontFamily: Fonts.ManropeMedium,
        color: '#111827',
    },
    divider: {
        height: 1,
        backgroundColor: '#000',
        marginVertical: 16,
        opacity: 0.1,
    },
    metadata: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metadataText: {
        fontSize: 12,
        fontFamily: Fonts.interRegular,
        color: ColorConstants.GRAY,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: ColorConstants.GRAY,
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
        fontSize: 16,
        color: ColorConstants.RED,
    },
    sectionHeader: {
        fontSize: 18,
        fontFamily: Fonts.interBold,
        color: '#111827',
        marginTop: 12,
        marginBottom: 16,
    },
    documentsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    documentTile: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        width: '90%',
        marginBottom: 8,
    },
    documentLabel: {
        fontSize: 12,
        fontFamily: Fonts.interBold,
        color: '#9CA3AF',
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    availableBadge: {
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    availableBadgeText: {
        fontSize: 11,
        fontFamily: Fonts.interMedium,
        color: '#059669',
    },
    viewLink: {
        fontSize: 14,
        fontFamily: Fonts.interMedium,
        color: '#2563EB',
        textDecorationLine: 'underline',
        marginBottom: 8,
    },
    filenameText: {
        fontSize: 11,
        fontFamily: Fonts.interRegular,
        color: '#9CA3AF',
    },
});
