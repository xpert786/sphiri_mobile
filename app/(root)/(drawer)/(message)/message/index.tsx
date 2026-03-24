import { apiGet } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import Header from '@/components/Header';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { useProfile } from '@/context/ProfileContext';
import StartConversationModal from '@/modals/StartConversationModal';
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
    ActivityIndicator,
    BackHandler,
    FlatList,
    Image,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebSocketService } from '../../../../services/WebSocketService';

// Mock data removed in favor of dynamic API data

export default function Message() {
    const navigation = useNavigation();
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<number | string | null>(null);
    const { profile } = useProfile();
    const [showStartModal, setShowStartModal] = useState(false);
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [refreshing, setRefreshing] = useState(false);
    const wsServiceRef = useRef<WebSocketService | null>(null);

    const { fromClient } = useLocalSearchParams();

    useFocusEffect(
        useCallback(() => {
            fetchMessages();

            // Initialize Conversation List WebSocket
            if (!wsServiceRef.current) {
                console.log("Initializing Vendor Message WebSocket: ws/conversations/");
                wsServiceRef.current = new WebSocketService('ws/conversations/');

                wsServiceRef.current.onConnect(() => {
                    console.log("Vendor Message WebSocket connected");
                });

                wsServiceRef.current.onMessage((data: any) => {
                    console.log("Vendor Message WebSocket received:", JSON.stringify(data));

                    // Ignore heartbeat pong
                    if (data.type === 'pong') return;

                    const convId = data.conversation_id || data.id || (data.data?.conversation_id);

                    if ((data.type === 'new_message' || data.type === 'message' || data.type === 'chat_message') && convId) {
                        const previewData = {
                            type: data.type,
                            conversation_id: convId,
                            preview: data.preview || {
                                text: data.data?.text || data.text || "New message",
                                id: data.data?.id || data.id
                            }
                        };
                        handleNewMessagePreview(previewData);
                    } else {
                        // For any other event type
                        console.log("Unknown message type received, triggering silent refresh");
                        fetchMessages(true);
                    }
                });

                wsServiceRef.current.connect();
            }

            // High-frequency poller (3 seconds)
            const poller = setInterval(() => {
                // console.log("Vendor Focused Poller: syncing message list...");
                fetchMessages(true);
            }, 5000);

            const onBackPress = () => {
                if (fromClient) {
                    router.navigate('/(root)/(drawer)/(clients)/clients');
                } else {
                    router.navigate('/(root)/(drawer)/Home');
                }
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => {
                subscription.remove();
                if (poller) clearInterval(poller);
                if (wsServiceRef.current) {
                    wsServiceRef.current.cleanup();
                    wsServiceRef.current = null;
                }
            };
        }, [fromClient])
    );

    const handleNewMessagePreview = useCallback((data: { type: string, conversation_id: string, preview: { text: string, id: number } }) => {
        console.log("handleNewMessagePreview (Vendor) triggered with data:", JSON.stringify(data));
        setConversations(prevConversations => {
            const index = prevConversations.findIndex(c => c.id.toString() === data.conversation_id.toString());
            console.log("Conversation index found:", index, "for conv_id:", data.conversation_id);

            if (index !== -1) {
                // Conversation exists, update its last_message, unread_count and move to top
                const updatedConv = {
                    ...prevConversations[index],
                    last_message: data.preview.text,
                    time_ago: "Just now", // Optimistic local update
                    unread_count: prevConversations[index].unread_count // Keep existing count but don't increment
                };

                const newArray = [...prevConversations];
                newArray.splice(index, 1);
                newArray.unshift(updatedConv);
                console.log("Updated vendor conversation list locally.");
                return newArray;
            } else {
                console.log("Conversation not found in vendor list, or brand new. Re-fetching entire list...");
                fetchMessages(true);
                return prevConversations;
            }
        });

        // Fire off a silent background fetch after a delay to sync with server
        setTimeout(() => {
            fetchMessages(true);
        }, 2000); // 2 second delay to allow server state to settle
    }, []);

    const fetchMessages = async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const response = await apiGet(ApiConstants.VENDOR_MESSAGES);
            // if (response.data?.conversations?.length > 0) {
            //     console.log("DEBUG Vendor Conv:", JSON.stringify(response.data.conversations[0]));
            // }
            if (response.data && Array.isArray(response.data.conversations)) {
                setConversations(response.data.conversations);
                if (response.data.conversations.length > 0 && !selectedId && !isSilent) {
                    setSelectedId(response.data.conversations[0].id);
                }
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            if (!isSilent) setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchMessages(true);
    };



    // Filter messages based on search text
    const formatDateTime = (isoString: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const now = new Date();

        // Time parts
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const strHours = String(hours).padStart(2, '0');
        const timeStr = `${strHours}:${minutes} ${ampm}`;

        // Check if today
        const isToday =
            date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();

        if (isToday) return `Today ${timeStr}`;

        // Check if yesterday
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const isYesterday =
            date.getDate() === yesterday.getDate() &&
            date.getMonth() === yesterday.getMonth() &&
            date.getFullYear() === yesterday.getFullYear();

        if (isYesterday) return `Yesterday ${timeStr}`;

        // Default: MM/DD/YYYY HH:MM AM/PM
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year} ${timeStr}`;
    };

    const filteredData = conversations.filter(item =>
        item.client_name?.toLowerCase().includes(search.toLowerCase()) ||
        item.subject?.toLowerCase().includes(search.toLowerCase())
    );

    const renderItem = ({ item }: any) => {
        const isSelected = item.id === selectedId;
        const initials = item.client_name ? item.client_name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : '?';

        return (
            <Pressable
                style={[
                    styles.cardContainer,
                    isSelected ? styles.cardSelected : styles.cardUnselected
                ]}
                onPress={() => {
                    const convId = item.id.toString();
                    setSelectedId(convId);

                    router.push({
                        pathname: './message-inner',
                        params: { id: convId }
                    });
                }}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.userInfo}>
                        <View style={styles.avatarContainer}>
                            {item?.client_avatar ? (
                                <Image source={{ uri: item.client_avatar }} style={styles.avatarImage} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={styles.initials}>{initials}</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">{item.client_name}</Text>
                    </View>
                    <Text style={styles.timeText}>{formatDateTime(item.last_message_at)}</Text>
                </View>

                <Text style={styles.messageText} numberOfLines={2} ellipsizeMode="tail">
                    {item.last_message || item.subject}
                </Text>
            </Pressable>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={ColorConstants.WHITE} barStyle="dark-content" />

            {/* Common Header */}
            <Header
                title="Messages"
                subtitle="Communicate with clients and team members"
                showBackArrow={!!fromClient}
                tapOnBack={() => router.navigate('/(root)/(drawer)/(clients)/clients')}
                containerStyle={{ marginTop: 10 }}
            />

            {/* Search and Filter Row */}
            <View style={styles.filterRow}>
                <View style={styles.searchContainer}>
                    <Image source={Icons.ic_search} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search..."
                        placeholderTextColor={ColorConstants.GRAY}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>

                <TouchableOpacity style={styles.filterButton} onPress={() => setShowStartModal(true)}>
                    <Image source={Icons.ic_plus} style={styles.downArrow} />
                    <Text style={styles.filterText}>New</Text>
                </TouchableOpacity>
            </View>

            {/* Messages List */}
            {loading && conversations.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={ColorConstants.DARK_CYAN} />
                    <Text style={{ marginTop: 10, fontFamily: Fonts.interRegular, color: ColorConstants.GRAY }}>Loading conversations...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredData}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    ListEmptyComponent={
                        <View style={{ marginTop: 50, alignItems: 'center' }}>
                            <Text style={{ fontFamily: Fonts.interRegular, color: ColorConstants.GRAY }}>No conversations found</Text>
                        </View>
                    }
                />
            )}

            <StartConversationModal
                visible={showStartModal}
                onClose={() => setShowStartModal(false)}
                onStart={(newConversation) => {
                    console.log('New conversation started:', newConversation);
                    setConversations(prev => [newConversation, ...prev]);
                    setSelectedId(newConversation.id);
                    setShowStartModal(false);
                }}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorConstants.WHITE,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 15,
    },
    headerLeft: {
        flex: 1,
        paddingRight: 10,
    },
    headerTitle: {
        fontFamily: 'SFPro-Regular', // Matching existing Header style
        fontSize: 22,
        color: ColorConstants.PRIMARY_BROWN,
        fontWeight: '600',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontFamily: 'Inter-Regular',
        fontSize: 12,
        color: ColorConstants.GRAY,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingTop: 5,
    },
    iconButton: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
        tintColor: ColorConstants.DARK_CYAN
    },
    badgeContainer: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: ColorConstants.BLACK2,
        borderRadius: 10,
        width: 14,
        height: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: ColorConstants.WHITE,
    },
    badgeText: {
        color: ColorConstants.WHITE,
        fontSize: 8,
        fontWeight: 'bold',
    },
    profileImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
    },
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 15,
        gap: 10,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3, // Light gray border
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 40,
        backgroundColor: ColorConstants.WHITE,
    },
    searchIcon: {
        width: 16,
        height: 16,
        tintColor: ColorConstants.GRAY,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontFamily: 'Inter-Regular',
        fontSize: 13,
        color: ColorConstants.BLACK,
        height: '100%',
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 40,
        backgroundColor: ColorConstants.WHITE,
    },
    filterText: {
        fontFamily: 'Inter-Regular',
        fontSize: 13,
        color: ColorConstants.DARK_CYAN,
    },
    downArrow: {
        width: 10,
        height: 10,
        tintColor: ColorConstants.DARK_CYAN,
        marginLeft: 8,
        resizeMode: "contain"
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    cardContainer: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        // Elevation for Android
        elevation: 1,
    },
    cardSelected: {
        backgroundColor: '#FEF8F4', // Light peach background (approximation from design)
        borderColor: ColorConstants.ORANGE, // Orange border
    },
    cardUnselected: {
        backgroundColor: ColorConstants.WHITE,
        borderColor: ColorConstants.GRAY3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        // marginBottom: 8,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarContainer: {
        marginRight: 10,
    },
    avatarImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',

    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: ColorConstants.LIGHT_PEACH2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    initials: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.PRIMARY_BROWN,
    },
    nameText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
        flex: 1,
        marginTop: -20
    },
    timeText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 10,
        color: ColorConstants.GRAY,
        marginLeft: 8,
    },
    messageText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.GRAY5,
        // lineHeight: 18,
        paddingLeft: 50,
        marginTop: -15
    },
});
