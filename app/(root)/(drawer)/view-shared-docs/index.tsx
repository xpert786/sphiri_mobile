import { apiGet } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import Header from '@/components/Header';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { StringConstants } from '@/constants/StringConstants';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    BackHandler,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type InfoRowProps = {
    label: string;
    value: string | string[] | undefined | null;
};

interface SharedDocumentDetail {
    id: number;
    title: string;
    description: string;
    file: string;
    file_url: string;
    file_type: string;
    file_size: number;
    file_size_display: string;
    version: number;
    tags: string;
    tags_list: any[];
    category: number;
    category_name: string;
    folder: number;
    folder_name: string;
    linked_contacts: any[];
    linked_contact_name: string | null;
    issue_date: string;
    expiration_date: string;
    status: string;
    is_shared: boolean;
    uploaded_by: string;
    can_download: boolean;
    can_edit: boolean;
    can_delete: boolean;
    created_at: string;
    updated_at: string;
}

export default function ViewSharedDocs() {
    const { id } = useLocalSearchParams();
    const [document, setDocument] = useState<SharedDocumentDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchDocumentDetails(id as string);
        }
    }, [id]);

    const fetchDocumentDetails = async (docId: string) => {
        try {
            setLoading(true);
            const response = await apiGet(`${ApiConstants.SHARE_DOCUMENTS}/${docId}/`);
            if (response.status === 200) {
                setDocument(response.data);
            }
        } catch (error) {
            console.error('Error fetching document details:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                router.navigate('/(root)/(drawer)/Home');
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () =>
                subscription.remove();
        }, [])
    );

    const InfoRow = ({ label, value }: InfoRowProps) => {
        if (!value) return null;
        return (
            <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color={ColorConstants.PRIMARY_BROWN} />
            </SafeAreaView>
        );
    }

    if (!document) {
        return (
            <SafeAreaView style={styles.container}>
                <Header
                    title={StringConstants.FAMILY_DASHBOARD}
                    subtitle="Document details not found"
                    tapOnBack={() => router.back()}
                />
            </SafeAreaView>
        )
    }

    const tagsArray = document.tags ? document.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title={StringConstants.FAMILY_DASHBOARD}
                subtitle="Welcome back, Sarah Johnson. Here's an overview of shared household information"
                tapOnBack={() => router.navigate('/(root)/(drawer)/Home')}
            />

            <ScrollView contentContainerStyle={styles.contentContainer}>
                {/* Document Header */}
                <View style={styles.infoCard}>
                    <View style={styles.documentHeader}>
                        <View style={styles.titleRow}>
                            <Text style={styles.documentTitle}>{document.title}</Text>
                            {/* Rating removed as it is not in the API response */}
                        </View>

                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>{document.category_name}</Text>
                        </View>

                        <View style={styles.tagsRow}>
                            {/* Tags */}
                            <View style={styles.tagsContainer}>
                                {tagsArray.map((tag, index) => (
                                    <View key={index} style={styles.tagBadge}>
                                        <Text style={styles.tagText}>{tag}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* Shared indicator */}
                            {document.is_shared && (
                                <View style={styles.sharedContainer}>
                                    <Image source={Icons.ic_share} style={styles.shareIcon} />
                                    <Text style={styles.sharedText}>Shared</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Document Information Card */}

                    <Text style={styles.infoTitle}>Document Information</Text>
                    <InfoRow label="Document Type" value={document.file_type} />
                    <InfoRow label="Uploaded By" value={document.uploaded_by} />
                    <InfoRow label="Issue Date" value={document.issue_date} />
                    <InfoRow label="Expiration Date" value={document.expiration_date} />
                    <InfoRow label="Linked Contact" value={document.linked_contact_name} />
                    <View style={styles.divider} />
                    <InfoRow label="Description" value={document.description} />
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
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    documentHeader: {
        marginBottom: 24,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        // marginBottom: 8,
    },
    documentTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 20,
        color: ColorConstants.BLACK2,
        flex: 1,
        marginRight: 12,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 5
    },
    starIcon: {
        width: 16,
        height: 16,
        tintColor: ColorConstants.DARK_CYAN,
    },
    ratingText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    categoryBadge: {
        marginBottom: 12,
    },

    tagsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
    },

    sharedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        backgroundColor: ColorConstants.WHITE,
    },

    sharedText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
    },
    categoryText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.BLACK2,
    },
    tagBadge: {
        backgroundColor: ColorConstants.GRAY3,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    tagText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 12,
        color: ColorConstants.BLACK2,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },

    shareIcon: {
        width: 12,
        height: 12,
        tintColor: ColorConstants.DARK_CYAN,
        resizeMode: 'contain',
    },
    infoCard: {
        backgroundColor: ColorConstants.WHITE,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 16,
        padding: 16,
    },
    infoTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 18,
        color: ColorConstants.BLACK2,
        marginBottom: 20,
    },
    infoSection: {
        paddingVertical: 12,
    },
    infoLabel: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 4,
    },
    infoValue: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    divider: {
        height: 1,
        backgroundColor: ColorConstants.GRAY3,
    },
});
