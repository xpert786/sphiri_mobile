import { apiGet, apiPost } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import Header from '@/components/Header';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import RaiseTicketModal from '@/modals/RaiseTicketModal';
import ReplyModal from '@/modals/ReplyModal';
import TicketDetailsModal from '@/modals/TicketDetailsModal';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    BackHandler,
    Dimensions,
    FlatList,
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');
const gap = 20;
const statCardWidth = (width - 60) / 2; // (total width - horiz padding - gap) / 2


// Types for API
interface Attachment {
    id: number;
    filename: string;
    file_size: number;
    content_type: string;
    file_url: string;
    uploaded_at: string;
}

interface TicketItem {
    id: number;
    ticket_id: string;
    subject: string;
    description: string;
    status: string;
    priority: string;
    customer_name: string;
    customer_email: string;
    assigned_to: any;
    created_by: number;
    created_by_name: string;
    created_at: string;
    updated_at: string;
    resolved_at: string | null;
    replies_count: number;
    attachments: Attachment[];
}

export default function SupportTools() {
    const [isRaiseTicketModalVisible, setIsRaiseTicketModalVisible] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
    const [tickets, setTickets] = useState<TicketItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyTicketId, setReplyTicketId] = useState<string | null>(null);

    const openCount = tickets.filter(t => t.status.toLowerCase() !== 'closed').length;
    const resolvedCount = tickets.filter(t => t.status.toLowerCase() === 'closed').length;

    const stats = [
        {
            title: 'Open Tickets',
            count: openCount.toString(),
            subtitle: 'awaiting response',
            icon: <MaterialCommunityIcons name="ticket-confirmation-outline" size={18} color={ColorConstants.WHITE} />
        },
        {
            title: 'Resolved',
            count: resolvedCount.toString(),
            subtitle: 'this week',
            icon: <MaterialCommunityIcons name="check-decagram-outline" size={18} color={ColorConstants.WHITE} />
        },
    ];

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const response = await apiGet(ApiConstants.SUPPORT_TICKETS);
            if (response.data && response.data.tickets) {
                setTickets(response.data.tickets);
            }
        } catch (error) {
            console.error('Error fetching support tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchTickets();
        }, [])
    );

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

    const handleCloseTicket = async (ticketId: number) => {
        console.log("ticketId in handleCloseTicket:", ticketId);

        try {
            const response = await apiPost(`${ApiConstants.SUPPORT_TICKETS}${ticketId}/close/`);
            console.log("response", response.data);

            if (response.status == 200 || response.status == 201) {
                Toast.show({
                    type: 'success',
                    text1: 'Ticket closed successfully',
                })
                fetchTickets();
            }
        } catch (error) {
            console.error('Error closing ticket:', error);
        }
    }


    const renderStatCard = (item: any, index: number) => (
        <View key={index} style={styles.statCard}>
            <View style={styles.statHeader}>
                <Text style={styles.statTitle}>{item.title}</Text>
                <View style={styles.statIconWrapper}>
                    {item.icon}
                </View>
            </View>
            <Text style={styles.statCount}>{item.count}</Text>
            {/* <Text style={styles.statSubtitle}>{item.subtitle}</Text> */}
        </View>
    );

    const renderTicketCard = ({ item }: { item: TicketItem }) => {
        const isClosed = item.status.toLowerCase() === 'closed';
        const formattedDate = new Date(item.created_at).toLocaleDateString();
        console.log("item", item);



        return (
            <View style={styles.ticketCard}>
                <View style={styles.ticketHeader}>
                    <View style={styles.avatar}>
                        <Image source={Icons.ic_clock} style={{ width: 16, height: 16, tintColor: ColorConstants.WHITE }} />
                    </View>
                    <View style={styles.ticketInfo}>
                        <Text style={styles.ticketTitle}>{item.subject}</Text>
                        <Text style={styles.ticketMeta}>{item.customer_email} • {formattedDate}</Text>

                        <View style={styles.badgesRow}>
                            <View style={[styles.badge, styles.badgeYellow]}>
                                <Text style={styles.badgeTextYellow}>{item.priority}</Text>
                            </View>
                            <View style={[styles.badge, isClosed ? styles.badgeGreen : styles.badgeYellow]}>
                                <Text style={[styles.badgeTextYellow, isClosed && styles.badgeTextGreen]}>
                                    {item.status}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {item.attachments && item.attachments.length > 0 && (
                    <View style={styles.attachmentsSection}>
                        <Text style={styles.attachmentsLabel}>Attachments:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.attachmentsList}>
                            {item.attachments.map((attachment) => {
                                const isPdf = attachment.content_type === 'application/pdf' || attachment.filename.endsWith('.pdf');
                                return (
                                    <TouchableOpacity key={attachment.id} onPress={() => Linking.openURL(attachment.file_url)}>
                                        {isPdf ? (
                                            <View style={[styles.emptyAttachmentBox, { borderColor: 'rgba(255,255,255,0.3)' }]}>
                                                <Ionicons name="document-text" size={20} color={ColorConstants.WHITE} />
                                                <Text style={{ color: ColorConstants.WHITE, fontSize: 8, marginTop: 4, textAlign: 'center' }} numberOfLines={2}>
                                                    {attachment.filename}
                                                </Text>
                                            </View>
                                        ) : (
                                            <Image source={{ uri: attachment.file_url }} style={styles.attachmentImg} />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

                {!isClosed && (
                    <View style={styles.ticketActions}>
                        <TouchableOpacity style={styles.btnOutline} onPress={() => setSelectedTicket(item)}>
                            <Ionicons name="eye-outline" size={14} color={ColorConstants.BLACK2} />
                            <Text style={styles.btnOutlineText}>Details</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btnPrimary} onPress={() => setReplyTicketId(item.ticket_id)}>
                            <MaterialCommunityIcons name="reply" size={14} color={ColorConstants.WHITE} />
                            <Text style={styles.btnPrimaryText}>Reply</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btnSecondary} onPress={() => handleCloseTicket(item.id)}>
                            <Ionicons name="close" size={14} color={ColorConstants.WHITE} />
                            <Text style={styles.btnSecondaryText} numberOfLines={1} adjustsFontSizeToFit>Close Ticket</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title='Support Tools'
                subtitle='Create and manage your support tickets'
                showBackArrow={false}
                containerStyle={{ paddingTop: 20 }}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Title & Action Section */}
                <View style={styles.topSection}>
                    <TouchableOpacity style={styles.raiseButton} onPress={() => setIsRaiseTicketModalVisible(true)}>
                        <Image source={Icons.ic_plus} style={styles.plusIcon} />
                        <Text style={styles.raiseButtonText}>Raise Ticket</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats Section */}
                <View style={styles.statsContainer}>
                    {stats.map((item, index) => renderStatCard(item, index))}
                </View>

                {/* Tickets List Section */}
                <View style={styles.ticketsSection}>
                    <Text style={styles.sectionTitle}>My Support Tickets</Text>
                    <Text style={styles.sectionSubtitle}>Your support requests and issues</Text>

                    <View style={{ marginTop: 20 }}>
                        {loading ? (
                            <Text style={styles.sectionSubtitle}>Loading tickets...</Text>
                        ) : tickets.length > 0 ? (
                            <FlatList
                                data={tickets}
                                renderItem={renderTicketCard}
                                keyExtractor={(item) => item.id.toString()}
                                scrollEnabled={false}
                            />
                        ) : (
                            <Text style={styles.sectionSubtitle}>No support tickets found.</Text>
                        )}
                    </View>
                </View>
            </ScrollView>

            <RaiseTicketModal
                visible={isRaiseTicketModalVisible}
                onClose={() => setIsRaiseTicketModalVisible(false)}
                onSubmit={(data) => {
                    console.log('New Ticket Data:', data);
                    setIsRaiseTicketModalVisible(false);
                    fetchTickets();
                }}
            />
            {selectedTicket && (
                <TicketDetailsModal
                    visible={!!selectedTicket}
                    onClose={() => setSelectedTicket(null)}
                    ticket={selectedTicket}
                    handleReply={(ticket) => {
                        console.log('Reply to ticket:', ticket);
                        setSelectedTicket(null);
                        setReplyTicketId(ticket.ticket_id);
                    }}
                />
            )}

            {
                replyTicketId && (
                    <ReplyModal
                        visible={!!replyTicketId}
                        ticketId={replyTicketId}
                        onClose={() => setReplyTicketId(null)}
                        onSubmit={(data) => {
                            console.log('Reply Data:', data);
                            setReplyTicketId(null);
                            fetchTickets();
                        }}
                    />
                )
            }
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorConstants.WHITE, // Light beige background similar to screenshot
    },
    scrollContent: {
        paddingBottom: 40,
    },
    topSection: {
        alignItems: 'flex-end',
        paddingHorizontal: 20,
        marginTop: 10,
    },
    pageTitle: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 24,
        color: ColorConstants.BLACK2,
    },
    pageSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.GRAY,
        marginTop: 4,
    },
    raiseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        gap: 6,
    },
    plusIcon: {
        width: 14,
        height: 14,
        tintColor: ColorConstants.WHITE,
    },
    raiseButtonText: {
        fontFamily: Fonts.interMedium,
        fontSize: 14,
        color: ColorConstants.WHITE,
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        marginTop: 24,
        gap: gap,
        paddingBottom: 10,
    },
    statCard: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        padding: 16,
        width: statCardWidth,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.10,
        shadowRadius: 8,
        elevation: 5,
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    statIconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: ColorConstants.GRAY5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statIcon: {
        width: 16,
        height: 16,
        tintColor: ColorConstants.WHITE,
        resizeMode: 'contain',
    },
    statCount: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 28,
        color: ColorConstants.BLACK2,
        marginTop: 12,
    },
    statSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.GRAY,
        marginTop: 4,
    },
    ticketsSection: {
        backgroundColor: ColorConstants.WHITE,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 24,
        // minHeight: 500, // To mimic full page curve
    },
    sectionTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 18,
        color: ColorConstants.BLACK2,
    },
    sectionSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.GRAY,
        marginTop: 4,
    },
    ticketCard: {
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
    },
    ticketHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: ColorConstants.GRAY5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ticketInfo: {
        flex: 1,
    },
    ticketTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.BLACK2,
    },
    ticketMeta: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.GRAY,
        marginTop: 4,
    },
    badgesRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 10,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
    },
    badgeYellow: {
        backgroundColor: '#FEF3C7', // Light yellow
    },
    badgeTextYellow: {
        fontFamily: Fonts.interMedium,
        fontSize: 12,
        color: '#D97706', // Dark yellow/orange
    },
    badgeGreen: {
        backgroundColor: ColorConstants.GREEN10, // Light green
    },
    badgeTextGreen: {
        color: ColorConstants.GREEN2, // Dark green
    },
    attachmentsSection: {
        marginTop: 20,
        marginLeft: 56, // align with text
    },
    attachmentsLabel: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.GRAY,
        marginBottom: 10,
    },
    attachmentsList: {
        gap: 12,
    },
    emptyAttachmentBox: {
        width: 80,
        height: 60,
        paddingHorizontal: 8,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        backgroundColor: ColorConstants.GRAY,
        justifyContent: 'center',
        alignItems: 'center',
    },
    attachmentImg: {
        width: 80,
        height: 60,
        borderRadius: 8,
        backgroundColor: ColorConstants.GRAY5,
    },
    ticketActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8,
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: ColorConstants.GRAY6,
        paddingTop: 16,
    },
    btnOutline: {
        flex: 0.3,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        paddingHorizontal: 4,
        paddingVertical: 8,
        borderRadius: 6,
        gap: 4,
    },
    btnOutlineText: {
        fontFamily: Fonts.interMedium,
        fontSize: 12,
        color: ColorConstants.BLACK2,
    },
    btnPrimary: {
        flex: 0.3,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        paddingHorizontal: 4,
        paddingVertical: 8,
        borderRadius: 6,
        gap: 4,
    },
    btnPrimaryText: {
        fontFamily: Fonts.interMedium,
        fontSize: 12,
        color: ColorConstants.WHITE,
    },
    btnSecondary: {
        flex: 0.4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4B5563', // Slate GRAY
        paddingVertical: 8,
        borderRadius: 6,
        gap: 4,
    },
    btnSecondaryText: {
        fontFamily: Fonts.interMedium,
        fontSize: 12,
        color: ColorConstants.WHITE,
    }
});
