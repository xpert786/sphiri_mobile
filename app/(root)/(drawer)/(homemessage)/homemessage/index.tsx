import { apiGet } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import Header from '@/components/Header';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { capitalizeFirstLetter } from '@/constants/Helper';
import StartHomeMessagesModal from '@/modals/StartHomeMessagesModal';
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


export default function HomeMessage() {
    const navigation = useNavigation();
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<number | string | null>(null);
    const [showStartModal, setShowStartModal] = useState(false);
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { fromClient } = useLocalSearchParams();

    const [refreshing, setRefreshing] = useState(false);
    const wsServiceRef = useRef<WebSocketService | null>(null);

    useFocusEffect(
        useCallback(() => {
            fetchMessages();

            // Initialize Conversation List WebSocket
            if (!wsServiceRef.current) {
                console.log("Initializing HomeMessage WebSocket: ws/conversations/");
                wsServiceRef.current = new WebSocketService('ws/conversations/');

                wsServiceRef.current.onConnect(() => {
                    console.log("HomeMessage WebSocket connected");
                });

                wsServiceRef.current.onMessage((data: any) => {
                    console.log("HomeMessage WebSocket received:", JSON.stringify(data));

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
                        // For any other event type (like a generic "update" or unknown broadcast)
                        // Trigger a refresh to ensure UI stays in sync
                        console.log("Unknown message type received, triggering silent refresh");
                        fetchMessages(true);
                    }
                });

                wsServiceRef.current.connect();
            }

            // High-frequency poller for real-time feel (5 seconds)
            // This ensures the list and unread counts stay updated even if the 
            // backend doesn't broadcast to the 'ws/conversations/' socket.
            const poller = setInterval(() => {
                // console.log("Focused Poller: syncing message list...");
                fetchMessages(true);
            }, 5000);

            const onBackPress = () => {
                router.navigate('/(root)/(drawer)/Home');
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
        console.log("handleNewMessagePreview triggered with data:", JSON.stringify(data));
        setConversations(prevConversations => {
            const index = prevConversations.findIndex(c => c.id.toString() === data.conversation_id.toString());
            console.log("Conversation index found:", index, "for conv_id:", data.conversation_id);

            if (index !== -1) {
                // Conversation exists, update its last_message, unread_count and move to top
                const updatedConv = {
                    ...prevConversations[index],
                    last_message: {
                        ...(prevConversations[index].last_message || {}),
                        text: data.preview.text,
                        id: data.preview.id
                    },
                    last_message_at: new Date().toISOString(),
                };

                const newArray = [...prevConversations];
                newArray.splice(index, 1);
                newArray.unshift(updatedConv);
                console.log("Updated conversation list locally.");
                return newArray;
            } else {
                console.log("Conversation not found in list, or brand new. Re-fetching entire list...");
                // It's a brand new conversation that we don't have local metadata for yet.
                // Re-fetch the entire list to cleanly get vendor/client avatars, etc.
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
            const response = await apiGet(ApiConstants.HOMEOWNER_MESSAGES);
            // console.log("Messages API Response:", JSON.stringify(response.data));
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
    const filteredData = conversations.filter(item => {
        const searchTerm = search.toLowerCase();
        const vendorName = item.vendor?.business_name?.toLowerCase() || '';
        const subject = item.subject?.toLowerCase() || '';
        const lastMsg = item.last_message?.text?.toLowerCase() || '';

        return vendorName.includes(searchTerm) ||
            subject.includes(searchTerm) ||
            lastMsg.includes(searchTerm);
    });

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

    const renderItem = ({ item }: any) => {
        const isSelected = item.id === selectedId;
        const initials = item.vendor.business_name ? item.vendor.business_name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : '?';

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
                        pathname: './homemessage-inner',
                        params: { id: convId }
                    });
                }}
            >
                <View style={styles.cardRow}>
                    <View style={styles.avatarCol}>
                        {item?.client_avatar ? (
                            <Image source={{ uri: item?.client_avatar }} style={styles.avatarImage} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.initials}>{initials}</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.textCol}>
                        <View style={styles.headerRow}>
                            <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">
                                {capitalizeFirstLetter(item?.vendor?.business_name)}
                            </Text>
                            <Text style={styles.timeText}>{formatDateTime(item?.last_message_at)}</Text>
                        </View>
                        <Text style={styles.messageText} numberOfLines={2} ellipsizeMode="tail">
                            {String(item?.last_message?.text || item.subject || (item?.last_message_at ? "-" : "No messages yet")).replace(/[\n\r]+/g, ' ').trim()}
                        </Text>
                    </View>
                </View>
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
                showBackArrow={false}
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

            <StartHomeMessagesModal
                visible={showStartModal}
                onClose={() => setShowStartModal(false)}
                onStart={(newConversation) => {
                    console.log('New conversation started:', newConversation);
                    setConversations(prev => [newConversation, ...prev]);
                    setSelectedId(newConversation.id);
                    setShowStartModal(false);
                    // Navigate to inner chat
                    router.push({
                        pathname: './homemessage-inner',
                        params: { id: newConversation.id }
                    });
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
        backgroundColor: ColorConstants.WHITE,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.10,
        shadowRadius: 8,
        // Elevation for Android
        elevation: 4,
    },
    cardSelected: {
        backgroundColor: '#FEF8F4',
        borderColor: ColorConstants.ORANGE,
    },
    cardUnselected: {
        backgroundColor: ColorConstants.WHITE,
        borderColor: ColorConstants.GRAY3,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    avatarCol: {
        marginRight: 12,
    },
    avatarImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
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
    textCol: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    nameText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 15,
        color: ColorConstants.DARK_CYAN,
        flex: 1,
        marginRight: 8,
    },
    timeText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 10,
        color: ColorConstants.GRAY,
    },
    messageText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 13,
        color: ColorConstants.GRAY5,
        lineHeight: 18,
    },
});
