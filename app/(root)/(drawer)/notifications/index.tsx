import { apiGet, apiPost } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import Header from '@/components/Header';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { StringConstants } from '@/constants/StringConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    Dimensions,
    FlatList,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

interface Notification {
    id: number;
    notification_type: string;
    notification_type_display?: string;
    title: string;
    message: string;
    priority?: string;
    priority_display?: string;
    is_read: boolean;
    is_archived?: boolean;
    action_url?: string;
    action_label?: string;
    time_ago?: string;
    created_at: string;
}

interface Invite {
    id: number;
    inviter_name: string;
    inviter_email: string;
    role: string;
    role_display: string;
    relationship: string;
    relationship_display: string;
    status: string;
    invited_at: string;
    invitation_message?: string;
}

const NotificationItem = ({ item, onPress }: { item: Notification, onPress?: () => void }) => {
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            disabled={item.is_read || !onPress}
            style={[styles.notificationItem, !item.is_read && styles.unreadItem]}
        >
            <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                    <Text style={styles.notificationTitle}>{item.title}</Text>
                    {!item.is_read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notificationMessage}>{item.message}</Text>
                <Text style={styles.timeAgo}>{item.time_ago}</Text>
            </View>
        </TouchableOpacity>
    );
};

const Notifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [invites, setInvites] = useState<Invite[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [inviteProcessingId, setInviteProcessingId] = useState<number | null>(null);
    const [selectedInvite, setSelectedInvite] = useState<Invite | null>(null);

    useEffect(() => {
        fetchNotifications();
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

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const role = await AsyncStorage.getItem(StringConstants.USER_ROLE);
            setUserRole(role);

            if (role === 'family_member') {
                // Fetch invites for family member
                const hasInvites = await fetchInvites();
                // If no invites, fetch regular notifications
                if (!hasInvites) {
                    const notifResponse = await apiGet(ApiConstants.PUSH_NOTIFICATIONS_API);
                    if (notifResponse.data) {
                        setNotifications(notifResponse.data.results || []);
                    }
                }
            } else {
                let endpoint = '';
                let dataPath = '';

                switch (role) {
                    case 'vendor':
                        endpoint = ApiConstants.VENDOR_NOTIFICATIONS_API;
                        dataPath = 'notifications';
                        break;
                    case 'home_owner':
                    default:
                        endpoint = ApiConstants.PUSH_NOTIFICATIONS_API;
                        dataPath = 'results';
                        break;
                }

                const response = await apiGet(endpoint);
                if (response.data) {
                    setNotifications(response.data[dataPath] || []);
                }
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchInvites = async (): Promise<boolean> => {
        try {
            const response = await apiGet(ApiConstants.SHOW_INVITE);
            console.log("response in invites (notifications)", response.data);

            if (response.status === 200) {
                const data = response.data?.results || response.data;
                setInvites(data);
                return Array.isArray(data) && data.length > 0;
            }
            return false;
        } catch (error) {
            console.error('Error fetching invites:', error);
            return false;
        }
    };

    const handleAcceptInvite = async (inviteId: number) => {
        console.log("inviteId handleAcceptInvite:", inviteId);

        try {
            setInviteProcessingId(inviteId);
            const response = await apiPost(`${ApiConstants.SHOW_INVITE}${inviteId}${ApiConstants.ACCEPT_INVITE}`, {});
            console.log("response in handleAcceptInvite:", response.data);
            if (response.status === 200 || response.status === 201) {
                setInvites(prev => prev.filter(inv => inv.id !== inviteId));
                setSelectedInvite(null);
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Invite accepted successfully',
                })
            }
        } catch (error: any) {
            console.error('Error accepting invite:', error);
            const errorMsg = error?.response?.data?.detail || 'Failed to accept invite';
            Alert.alert('Error', errorMsg);
        } finally {
            setInviteProcessingId(null);
        }
    };

    const handleRejectInvite = async (inviteId: number) => {
        try {
            setInviteProcessingId(inviteId);
            const response = await apiPost(`${ApiConstants.SHOW_INVITE}${inviteId}${ApiConstants.REJECT_INVITE}`, {});
            if (response.status === 200 || response.status === 201) {
                setInvites(prev => prev.filter(inv => inv.id !== inviteId));
                setSelectedInvite(null);
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Invite Rejected successfully',
                })
            }
        } catch (error: any) {
            console.error('Error rejecting invite:', error);
            const errorMsg = error?.response?.data?.detail || 'Failed to reject invite';
            Alert.alert('Error', errorMsg);
        } finally {
            setInviteProcessingId(null);
        }
    };

    const handleMarkAsRead = async (id: number) => {
        if (userRole !== 'vendor' && userRole !== 'home_owner') return;

        try {
            // Update local state immediately for better UX
            setNotifications(prev => prev.map(notif =>
                notif.id === id ? { ...notif, is_read: true } : notif
            ));

            let baseUrl = userRole === 'vendor'
                ? ApiConstants.VENDOR_NOTIFICATION_READ
                : ApiConstants.HOMEOWNER_NOTIFICATION_READ;

            const url = `${baseUrl}${id}/read/`;
            await apiPost(url);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        if (userRole !== 'vendor' && userRole !== 'home_owner') return;

        try {
            // Update local state immediately for better UX
            setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));

            let endpoint = userRole === 'vendor'
                ? ApiConstants.VENDOR_NOTIFICATION_MARK_ALL_READ
                : ApiConstants.HOMEOWNER_NOTIFICATION_MARK_ALL_READ;

            await apiPost(endpoint);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    const renderInviteCard = ({ item }: { item: Invite }) => (
        <TouchableOpacity
            activeOpacity={0.7}
            style={styles.inviteCard}
            onPress={() => setSelectedInvite(item)}
        >
            <View style={styles.inviteIconContainer}>
                <Text style={styles.inviteIconText}>
                    {(item.inviter_name || '').charAt(0).toUpperCase()}
                </Text>
            </View>
            <View style={styles.inviteCardContent}>
                <Text style={styles.inviteCardTitle} numberOfLines={1}>
                    Family Invitation
                </Text>
                <View style={styles.inviteDetailRow}>
                    <Text style={styles.inviteDetailLabel}>Inviter</Text>
                    <Text style={styles.inviteDetailValue} numberOfLines={1}>
                        {item.inviter_email}
                    </Text>
                </View>
                <View style={styles.inviteDetailRow}>
                    <Text style={styles.inviteDetailLabel}>Role</Text>
                    <Text style={styles.inviteDetailValue} numberOfLines={1}>
                        {item.role}
                    </Text>
                </View>
                {item.relationship ? (
                    <View style={styles.inviteDetailRow}>
                        <Text style={styles.inviteDetailLabel}>Relationship</Text>
                        <Text style={styles.inviteDetailValue} numberOfLines={1}>
                            {item.relationship}
                        </Text>
                    </View>
                ) : null}
                <Text style={styles.inviteCardDate}>{formatDate(item.invited_at)}</Text>
            </View>
            <View style={styles.inviteCardActions}>
                <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => handleAcceptInvite(item.id)}
                    disabled={inviteProcessingId === item.id}
                >
                    {inviteProcessingId === item.id ? (
                        <ActivityIndicator size="small" color={ColorConstants.WHITE} />
                    ) : (
                        <Text style={styles.acceptBtnText}>Accept</Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => handleRejectInvite(item.id)}
                    disabled={inviteProcessingId === item.id}
                >
                    <Text style={styles.rejectBtnText}>Reject</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const renderInviteDetailModal = () => {
        if (!selectedInvite) return null;

        return (
            <Modal
                visible={!!selectedInvite}
                transparent
                animationType="fade"
                onRequestClose={() => setSelectedInvite(null)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setSelectedInvite(null)}
                >
                    <TouchableOpacity activeOpacity={1} style={styles.modalContainer}>
                        {/* Close button */}
                        <TouchableOpacity
                            style={styles.modalCloseBtn}
                            onPress={() => setSelectedInvite(null)}
                        >
                            <Text style={styles.modalCloseBtnText}>✕</Text>
                        </TouchableOpacity>

                        {/* Avatar */}
                        <View style={styles.modalAvatarContainer}>
                            <Text style={styles.modalAvatarText}>
                                {(selectedInvite.inviter_name || selectedInvite.inviter_email || '?').charAt(0).toUpperCase()}
                            </Text>
                        </View>

                        {/* Title */}
                        <Text style={styles.modalTitle}>Family Invitation</Text>

                        {/* Inviter Name */}
                        <Text style={styles.modalInviterName}>
                            {selectedInvite.inviter_name || selectedInvite.inviter_email}
                        </Text>

                        {/* Details */}
                        <View style={styles.modalDetailsContainer}>
                            <View style={styles.modalDetailRow}>
                                <Text style={styles.modalDetailLabel}>Role</Text>
                                <Text style={styles.modalDetailValue}>
                                    {selectedInvite.role_display || selectedInvite.role}
                                </Text>
                            </View>

                            {selectedInvite.relationship_display ? (
                                <View style={styles.modalDetailRow}>
                                    <Text style={styles.modalDetailLabel}>Relationship</Text>
                                    <Text style={styles.modalDetailValue}>
                                        {selectedInvite.relationship_display}
                                    </Text>
                                </View>
                            ) : null}

                            <View style={styles.modalDetailRow}>
                                <Text style={styles.modalDetailLabel}>Invited on</Text>
                                <Text style={styles.modalDetailValue}>
                                    {formatDate(selectedInvite.invited_at)}
                                </Text>
                            </View>

                            {selectedInvite.inviter_email ? (
                                <View style={styles.modalDetailRow}>
                                    <Text style={styles.modalDetailLabel}>Email</Text>
                                    <Text style={styles.modalDetailValue}>
                                        {selectedInvite.inviter_email}
                                    </Text>
                                </View>
                            ) : null}
                        </View>

                        {/* Invitation Message */}
                        {selectedInvite.invitation_message ? (
                            <View style={styles.modalMessageBox}>
                                <Text style={styles.modalMessageLabel}>Message</Text>
                                <Text style={styles.modalMessageText}>
                                    "{selectedInvite.invitation_message}"
                                </Text>
                            </View>
                        ) : null}

                        {/* Actions */}
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.modalAcceptBtn}
                                onPress={() => handleAcceptInvite(selectedInvite.id)}
                                disabled={inviteProcessingId === selectedInvite.id}
                            >
                                {inviteProcessingId === selectedInvite.id ? (
                                    <ActivityIndicator size="small" color={ColorConstants.WHITE} />
                                ) : (
                                    <Text style={styles.modalAcceptBtnText}>Accept Invite</Text>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalRejectBtn}
                                onPress={() => handleRejectInvite(selectedInvite.id)}
                                disabled={inviteProcessingId === selectedInvite.id}
                            >
                                <Text style={styles.modalRejectBtnText}>Reject</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        );
    };

    const getSubtitle = () => {
        if (userRole === 'family_member') {
            return invites.length > 0
                ? `You have ${invites.length} pending invite${invites.length > 1 ? 's' : ''}`
                : 'No pending invites';
        }
        return 'Stay updated with your activities';
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <Header
                title="Notifications"
                subtitle={getSubtitle()}
                showBackArrow={true}
                tapOnBack={() => router.push('/(root)/(drawer)/Home')}
            />

            {(userRole === 'vendor' || userRole === 'home_owner') && notifications.length > 0 && (
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
                <View style={[styles.centerContainer, { paddingTop: 0 }]}>
                    <ActivityIndicator size="large" color={ColorConstants.PRIMARY_BROWN} />
                </View>
            ) : userRole === 'family_member' && invites.length > 0 ? (
                // Family member with invites: show invite cards
                <FlatList
                    data={invites}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderInviteCard}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.centerContainer}>
                            <Text style={styles.placeholderText}>No pending invites</Text>
                        </View>
                    }
                    onRefresh={fetchNotifications}
                    refreshing={loading}
                />
            ) : (
                // Vendor / Homeowner: show regular notifications
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <NotificationItem
                            item={item}
                            onPress={(userRole === 'vendor' || userRole === 'home_owner') ? () => handleMarkAsRead(item.id) : undefined}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.centerContainer}>
                            <Text style={styles.placeholderText}>No notifications found</Text>
                        </View>
                    }
                    onRefresh={fetchNotifications}
                    refreshing={loading}
                />
            )}

            {/* Invite Detail Modal */}
            {renderInviteDetailModal()}
        </SafeAreaView>
    );
};

export default Notifications;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorConstants.WHITE,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
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
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    placeholderText: {
        color: ColorConstants.GRAY,
        fontSize: 14,
        fontFamily: Fonts.mulishRegular,
    },
    // Regular notification styles
    notificationItem: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
    },
    unreadItem: {
        backgroundColor: ColorConstants.PRIMARY_10,
        borderColor: ColorConstants.PRIMARY_BROWN,
    },
    notificationContent: {
        flex: 1,
    },
    notificationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    notificationTitle: {
        fontSize: 16,
        fontFamily: Fonts.ManropeSemiBold,
        color: ColorConstants.BLACK2,
        flex: 1,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        marginLeft: 8,
    },
    notificationMessage: {
        fontSize: 14,
        fontFamily: Fonts.mulishRegular,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 8,
    },
    timeAgo: {
        fontSize: 12,
        fontFamily: Fonts.mulishRegular,
        color: ColorConstants.GRAY,
    },
    // Invite card styles
    inviteCard: {
        backgroundColor: '#FFF9F7',
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: ColorConstants.PRIMARY_BROWN,
    },
    inviteIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    inviteIconText: {
        fontSize: 20,
        fontFamily: Fonts.ManropeSemiBold,
        color: ColorConstants.WHITE,
    },
    inviteCardContent: {
        marginBottom: 14,
    },
    inviteCardTitle: {
        fontSize: 17,
        fontFamily: Fonts.ManropeSemiBold,
        color: ColorConstants.BLACK2,
    },
    inviteDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    inviteDetailLabel: {
        fontSize: 13,
        fontFamily: Fonts.mulishRegular,
        color: ColorConstants.GRAY,
    },
    inviteDetailValue: {
        fontSize: 14,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.BLACK2,
        maxWidth: '65%',
        textAlign: 'right',
    },
    inviteCardDate: {
        fontSize: 12,
        fontFamily: Fonts.mulishRegular,
        color: ColorConstants.GRAY,
        marginTop: 6,
    },
    inviteCardActions: {
        flexDirection: 'row',
        gap: 12,
    },
    acceptBtn: {
        flex: 1,
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        paddingVertical: 11,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    acceptBtnText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 14,
        color: ColorConstants.WHITE,
    },
    rejectBtn: {
        flex: 1,
        backgroundColor: ColorConstants.WHITE,
        paddingVertical: 11,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: ColorConstants.RED,
    },
    rejectBtnText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 14,
        color: ColorConstants.RED,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: width - 48,
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
    },
    modalCloseBtn: {
        position: 'absolute',
        top: 14,
        right: 18,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: ColorConstants.GRAY3,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    modalCloseBtnText: {
        fontSize: 14,
        color: ColorConstants.BLACK2,
        fontFamily: Fonts.ManropeSemiBold,
    },
    modalAvatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    modalAvatarText: {
        fontSize: 28,
        fontFamily: Fonts.ManropeSemiBold,
        color: ColorConstants.WHITE,
    },
    modalTitle: {
        fontSize: 13,
        fontFamily: Fonts.ManropeSemiBold,
        color: ColorConstants.PRIMARY_BROWN,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 6,
    },
    modalInviterName: {
        fontSize: 20,
        fontFamily: Fonts.ManropeSemiBold,
        color: ColorConstants.BLACK2,
        textAlign: 'center',
        marginBottom: 20,
    },
    modalDetailsContainer: {
        width: '100%',
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    modalDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#EFEFEF',
    },
    modalDetailLabel: {
        fontSize: 13,
        fontFamily: Fonts.mulishRegular,
        color: ColorConstants.GRAY,
    },
    modalDetailValue: {
        fontSize: 14,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.BLACK2,
        maxWidth: '60%',
        textAlign: 'right',
    },
    modalMessageBox: {
        width: '100%',
        backgroundColor: '#FFF9F7',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderLeftWidth: 3,
        borderLeftColor: ColorConstants.PRIMARY_BROWN,
    },
    modalMessageLabel: {
        fontSize: 12,
        fontFamily: Fonts.ManropeSemiBold,
        color: ColorConstants.PRIMARY_BROWN,
        marginBottom: 6,
    },
    modalMessageText: {
        fontSize: 14,
        fontFamily: Fonts.mulishRegular,
        color: ColorConstants.DARK_CYAN,
        fontStyle: 'italic',
        lineHeight: 20,
    },
    modalActions: {
        width: '100%',
        gap: 10,
    },
    modalAcceptBtn: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalAcceptBtnText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 16,
        color: ColorConstants.WHITE,
    },
    modalRejectBtn: {
        backgroundColor: ColorConstants.WHITE,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: ColorConstants.RED,
    },
    modalRejectBtnText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 16,
        color: ColorConstants.RED,
    },
});