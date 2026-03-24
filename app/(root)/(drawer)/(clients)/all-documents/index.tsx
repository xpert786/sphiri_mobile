import { apiGet } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import Header from '@/components/Header';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface DocumentRecord {
    id: string;
    name: string;
    date: string;
    size: string;
    category: string;
}

const DocumentCard = ({ item }: { item: DocumentRecord }) => {
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.fileIconContainer}>
                    <Image source={Icons.ic_file_corner} style={styles.fileIcon} />
                </View>
                <View style={styles.fileInfo}>
                    <Text style={styles.fileName}>{item.name}</Text>
                    <View style={styles.metaRow}>
                        <Image source={Icons.ic_calendar_outline} style={styles.calendarIcon} />
                        <Text style={styles.metaText}>{item.date} • {item.size}</Text>
                    </View>
                </View>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.category}</Text>
                </View>
            </View>

            <View style={styles.cardActions}>
                <TouchableOpacity style={styles.actionIconBtn}>
                    <Image source={Icons.ic_eye} style={styles.actionIcon} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionIconBtn}>
                    <Image source={Icons.ic_download_bottom} style={styles.actionIcon} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionIconBtn}>
                    <Image source={Icons.ic_bin2} style={styles.actionIcon} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default function AllDocuments() {
    const { id } = useLocalSearchParams();
    const [documents, setDocuments] = useState<DocumentRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchDocuments();
        } else {
            setLoading(false);
        }
    }, [id]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const clientId = Array.isArray(id) ? id[0] : id;
            if (!clientId) return;

            const url = `${ApiConstants.VENDOR_CLIENT_DOCUMENTS}${clientId}/documents/`;
            const response = await apiGet(url);
            if (response.data && response.data.documents) {
                setDocuments(response.data.documents);
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <Header
                title="Clients"
                subtitle="Manage your client relationships"
                showBackArrow={true}
                tapOnBack={() => router.back()}
            />

            <View style={styles.subHeader}>
                <Text style={styles.pageTitle}>Documents</Text>
                <Text style={styles.pageSubtitle}>All documents for John Smith</Text>
            </View>

            {/* <CommonButton
                title={'Upload Documents'}
                onPress={() => { }}
                icon={Icons.ic_upload}
                containerStyle={{ marginHorizontal: 20 }}
            /> */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {loading ? (
                    <ActivityIndicator size="large" color={ColorConstants.PRIMARY_BROWN} style={{ marginTop: 20 }} />
                ) : (
                    documents.map((item) => (
                        <DocumentCard key={item.id} item={item} />
                    ))
                )}
                {!loading && documents.length === 0 && (
                    <Text style={{ textAlign: 'center', marginTop: 20, color: ColorConstants.GRAY }}>
                        No documents found.
                    </Text>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorConstants.WHITE,
    },
    subHeader: {
        paddingHorizontal: 20,
        marginTop: 10,
        marginBottom: 10,
    },
    pageTitle: {
        fontSize: 18,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.PRIMARY_BROWN,
    },
    pageSubtitle: {
        fontSize: 12,
        fontFamily: Fonts.mulishRegular,
        color: ColorConstants.GRAY,
        marginTop: 2,
    },
    uploadBtn: {
        flexDirection: 'row',
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        paddingVertical: 10,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    uploadIcon: {
        width: 18,
        height: 18,
        tintColor: ColorConstants.WHITE,
        marginRight: 10,
    },
    uploadBtnText: {
        fontSize: 16,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.WHITE,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        padding: 15,
        marginBottom: 15,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    fileIconContainer: {
        width: 30,
        height: 30,
        backgroundColor: ColorConstants.DARK_CYAN,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    fileIcon: {
        tintColor: ColorConstants.WHITE,
    },
    fileInfo: {
        flex: 1,
    },
    fileName: {
        fontSize: 16,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.BLACK2,
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    calendarIcon: {
        width: 14,
        height: 14,
        tintColor: ColorConstants.GRAY,
        marginRight: 6,
    },
    metaText: {
        fontSize: 12,
        fontFamily: Fonts.mulishRegular,
        color: ColorConstants.DARK_CYAN,
    },
    badge: {
        backgroundColor: ColorConstants.WHITE,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
    },
    badgeText: {
        fontSize: 10,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.BLACK2,
    },
    cardActions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionIconBtn: {
        width: 32,
        height: 32,
        borderRadius: 6,
        backgroundColor: '#F2F2F7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionIcon: {
        width: 14,
        height: 14,
        tintColor: ColorConstants.BLACK2,
        resizeMode: 'contain'
    },
});
