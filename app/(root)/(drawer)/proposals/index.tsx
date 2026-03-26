import { apiGet, apiPost } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import Header from '@/components/Header';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    BackHandler,
    DeviceEventEmitter,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Proposal {
    id: number;
    subject: string;
    message: string;
    status: string;
    sent_at: string;
    created_at: string;
    // Add other fields as needed based on API response
}

export default function ProposalsScreen() {
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProposals();
    }, []);

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

    const fetchProposals = async () => {
        try {
            setLoading(true);
            const response = await apiGet(ApiConstants.VENDOR_PROPOSALS);
            if (response.data) {
                const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
                const unreadProposals = data.filter((item: any) => item.is_read === false);
                setProposals(unreadProposals);
            }
        } catch (error) {
            console.error('Error fetching proposals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const body = {
                action: "mark_all_read"
            };
            setProposals([]);
            DeviceEventEmitter.emit('refreshProposals');
            const response = await apiPost(ApiConstants.VENDOR_PROPOSALS, body);
            console.log("response in handleMarkAllRead", response.data);
        } catch (error) {
            console.error('Error marking all proposals as read:', error);
        }
    };

    const getTimeAgo = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 0) return 'Just now';
        if (diffInSeconds < 60) return 'Just now';

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;

        const diffInDays = Math.round(diffInHours / 24);
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 7) return `${diffInDays} days ago`;

        if (diffInDays < 30) {
            const weeks = Math.floor(diffInDays / 7);
            return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
        }

        return date.toLocaleDateString();
    };

    const renderProposalItem = ({ item }: { item: Proposal }) => {
        console.log("item in renderProposalItem", item);

        return (
            <View style={styles.proposalCard}>
                <Text style={styles.proposalTitle}>{item.subject || 'No Title'}</Text>
                <Text style={styles.proposalDescription}>
                    {item.message || 'No description provided.'}
                </Text>
                {/* <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View> */}
                <Text style={styles.timeText}>{getTimeAgo(item.sent_at || item.created_at)}</Text>
            </View>
        )
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title="Vendor Proposals"
                subtitle="Review and manage proposals from vendors."
                showBackArrow={true}
                tapOnBack={() => router.push('/(root)/(drawer)/Home')}
            />

            {proposals.length > 0 && !loading && (
                <View style={styles.topActions}>
                    <TouchableOpacity
                        style={styles.markAllReadButton}
                        activeOpacity={0.7}
                        onPress={handleMarkAllRead}
                    >
                        <Text style={styles.markAllReadText}>Mark all as read</Text>
                    </TouchableOpacity>
                </View>
            )}

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={ColorConstants.DARK_CYAN} />
                </View>
            ) : (
                <FlatList
                    data={proposals}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderProposalItem}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No proposals found.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorConstants.WHITE,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 20,
    },
    proposalCard: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    proposalTitle: {
        fontFamily: 'Manrope-SemiBold',
        fontSize: 16,
        color: ColorConstants.BLACK,
        marginBottom: 8,
    },
    proposalDescription: {
        fontFamily: 'Manrope-Regular',
        fontSize: 14,
        color: ColorConstants.GRAY,
        marginBottom: 12,
        // backgroundColor: 'red'
    },
    statusBadge: {
        alignSelf: 'flex-start',
        backgroundColor: ColorConstants.LIGHT_PEACH2,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontFamily: 'Manrope-Medium',
        fontSize: 12,
        color: ColorConstants.PRIMARY_BROWN,
        textTransform: 'capitalize',
    },
    timeText: {
        fontFamily: 'Manrope-Medium',
        fontSize: 11,
        color: ColorConstants.PRIMARY_BROWN,
        position: 'absolute',
        bottom: 15,
        right: 15
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontFamily: 'Manrope-Regular',
        fontSize: 16,
        color: ColorConstants.GRAY,
    },
    topActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        marginVertical: 12,
    },
    markAllReadButton: {
        backgroundColor: ColorConstants.WHITE,
        borderWidth: 1,
        borderColor: ColorConstants.PRIMARY_BROWN,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
    },
    markAllReadText: {
        color: ColorConstants.PRIMARY_BROWN,
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 13,
    },
});
