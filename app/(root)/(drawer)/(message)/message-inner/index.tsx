import { apiGet, apiPost } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import Header from '@/components/Header';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { capitalizeFirstLetter } from '@/constants/Helper';
import SendCalendorModal from '@/modals/SendCalendorModal';
import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebSocketService } from '../../../../services/WebSocketService';

export default function MessageInner() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [isCalendarModalVisible, setCalendarModalVisible] = useState(false);
  const [conversationDetails, setConversationDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // WebSocket Ref
  const wsServiceRef = useRef<WebSocketService | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (id) {
        fetchConversationDetails();

        // Initialize Chat WebSocket
        if (!wsServiceRef.current) {
          wsServiceRef.current = new WebSocketService(`ws/chat/${id}/`);

          // Send read receipt when opened
          wsServiceRef.current.onConnect(() => {
            console.log("Chat WS Connected - sending read event");
            wsServiceRef.current?.send({ type: "read", message_ids: [] });
          });

          wsServiceRef.current.onMessage((data: any) => {
            if (data.type === 'message' && data.data) {
              // Backend sends new messages here via broadcast
              setConversationDetails((prev: any) => {
                // Prevent duplicates
                if (prev?.messages?.some((m: any) => m.id === data.data.id)) {
                  return prev;
                }

                return {
                  ...prev,
                  messages: [...(prev?.messages || []), data.data],
                };
              });

              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }, 100);

              // Acknowledge receipt
              wsServiceRef.current?.send({ type: "read", message_ids: [data.data.id] });
            }
          });

          wsServiceRef.current.connect();
        }
      }

      return () => {
        if (wsServiceRef.current) {
          wsServiceRef.current.cleanup();
          wsServiceRef.current = null;
        }
      };
    }, [id])
  );

  const fetchConversationDetails = async () => {
    setLoading(true);
    try {
      const response = await apiGet(`${ApiConstants.VENDOR_MESSAGES}${id}/`);
      console.log("Conversation Details API Response:", response.data);
      if (response.data) {
        setConversationDetails(response.data);
        // Auto-scroll to bottom after loading messages
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 500);
      }
    } catch (error) {
      console.error("Error fetching conversation details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!message.trim() || !id) return;
    Keyboard.dismiss();

    // Send text purely through WebSocket (attachment: null)
    const sent = wsServiceRef.current?.send({
      type: "message",
      text: message,
      attachment: null
    });

    if (sent) {
      setMessage('');
      // Since backend broadcasts the message back in `type: "message"`, 
      // the state will update automatically via `onMessage`. 
      // If optimistic update is desired, appending here is also fine 
      // (but must catch duplicate via ID check on incoming WS).
    } else {
      console.error("Failed to send message via WS");
    }
  };

  const handlePickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    // Pick the image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      handleUploadImage(result.assets[0]);
    }
  };

  const handleUploadImage = async (imageAsset: ImagePicker.ImagePickerAsset) => {
    if (!id) return;
    setLoading(true);

    const formData = new FormData();
    // Re-construct the file object for FormData
    const uriParts = imageAsset.uri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    formData.append('attachment', {
      uri: imageAsset.uri,
      name: `photo.${fileType}`,
      type: `image/${fileType}`,
    } as any);

    formData.append('message_type', 'image');

    try {
      const response = await apiPost(`${ApiConstants.VENDOR_MESSAGES}${id}/`, formData, { isFormData: true });
      console.log("Upload Image API Response:", response.data);
      if (response.data) {
        setConversationDetails((prev: any) => ({
          ...prev,
          messages: [...(prev?.messages || []), response.data],
        }));
        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setLoading(false);
    }
  };
  const isSameDay = (date1: any, date2: any) => {
    if (!date1 || !date2) return false;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();
  };

  const formatDateHeader = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (isSameDay(date, today)) {
      return 'Today';
    } else if (isSameDay(date, yesterday)) {
      return 'Yesterday';
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    }
  };

  const formatDateTime = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = String(hours).padStart(2, '0');
    return `${strHours}:${minutes} ${ampm}`;
  };


  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={ColorConstants.WHITE} barStyle="dark-content" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <View style={{ flex: 1 }}>
          {/* Outer Header */}
          <Header
            title="Messages"
            subtitle="Communicate with clients and team members"
            showBackArrow={true}
            tapOnBack={() => router.back()}
          />

          {/* Chat Card */}
          <View style={styles.chatCard}>
            {/* Chat Header */}
            <View style={styles.chatHeader}>
              <View style={styles.chatUserInfo}>
                {conversationDetails?.client_avatar ? (
                  <Image source={{ uri: conversationDetails.client_avatar }} style={styles.chatAvatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.initials}>
                      {getInitials(conversationDetails?.client_name)}
                    </Text>
                  </View>
                )}
                <View>
                  <Text style={styles.chatName}>{capitalizeFirstLetter(conversationDetails?.client_name) || 'Loading...'}</Text>
                  <Text style={styles.chatSubtitle}>{capitalizeFirstLetter(conversationDetails?.subject) || '...'}</Text>
                </View>
              </View>
            </View>

            <SendCalendorModal
              visible={isCalendarModalVisible}
              onClose={() => setCalendarModalVisible(false)}
            />

            {/* Chat List */}
            {loading && !conversationDetails ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={ColorConstants.DARK_CYAN} />
              </View>
            ) : (
              <FlatList
                ref={flatListRef}
                data={conversationDetails?.messages || []}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
                style={{ flex: 1 }}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item, index }) => {
                  const isMe = item.sender_type === 'vendor';
                  const showDateHeader = index === 0 ||
                    !isSameDay(item.created_at, conversationDetails?.messages[index - 1]?.created_at);

                  return (
                    <View key={item.id || index}>
                      {showDateHeader && (
                        <View style={styles.dateHeaderContainer}>
                          <View style={styles.dateHeaderLine} />
                          <Text style={styles.dateHeaderText}>
                            {formatDateHeader(item.created_at)}
                          </Text>
                          <View style={styles.dateHeaderLine} />
                        </View>
                      )}
                      <View style={[styles.messageRow, isMe ? styles.rightAlign : styles.leftAlign]}>
                        <View style={[styles.messageBubble, isMe ? styles.rightBubble : styles.leftBubble]}>
                          {item.message_type === 'image' && item.attachment_url && (
                            <TouchableOpacity
                              onPress={() => {
                                const imageUrl = item.attachment_url.startsWith('http') ? item.attachment_url : ApiConstants.BASE_URL.replace('/sphiri/api/', '') + item.attachment_url;
                                setSelectedImage(imageUrl);
                                setIsPreviewVisible(true);
                              }}
                            >
                              <Image
                                source={{ uri: item.attachment_url.startsWith('http') ? item.attachment_url : ApiConstants.BASE_URL.replace('/sphiri/api/', '') + item.attachment_url }}
                                style={styles.messageImage}
                              />
                            </TouchableOpacity>
                          )}
                          {item.text ? (
                            <Text style={[styles.messageText, isMe ? styles.rightText : styles.leftText]}>
                              {item.text}
                            </Text>
                          ) : null}
                          <Text style={[styles.timeMsg, isMe ? styles.rightTime : styles.leftTime]}>
                            {formatDateTime(item.created_at)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                }}
              />
            )}

            {/* Message Input Area inside Card */}
            <View style={styles.inputArea}>
              <TouchableOpacity style={styles.attachmentButton} onPress={handlePickImage} disabled={loading}>
                <Image source={Icons.ic_shareitem} style={styles.clipIcon} />
              </TouchableOpacity>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Write your messages here..."
                  placeholderTextColor={ColorConstants.GRAY}
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  onSubmitEditing={handleSendMessage}
                  blurOnSubmit={true}
                  enterKeyHint="send"
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                  <Image source={Icons.ic_sender} style={styles.sendIcon} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Image Preview Modal */}
      <Modal
        visible={isPreviewVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsPreviewVisible(false)}
      >
        <SafeAreaView style={styles.previewContainer}>
          <TouchableOpacity
            style={styles.closePreviewButton}
            onPress={() => setIsPreviewVisible(false)}
          >
            <Image source={Icons.ic_cross} style={styles.closePreviewIcon} />
          </TouchableOpacity>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorConstants.WHITE,
  },
  // Filter/Search Styles
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 15,
    gap: 10,
  },
  searchContainer: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ColorConstants.GRAY3,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    backgroundColor: ColorConstants.WHITE,
  },
  searchIcon: {
    width: 14,
    height: 14,
    tintColor: ColorConstants.GRAY,
    marginRight: 10,
  },
  searchInput: {
    fontFamily: Fonts.interRegular,
    fontSize: 12,
    color: ColorConstants.BLACK,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: ColorConstants.GRAY3,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    backgroundColor: ColorConstants.WHITE,
  },
  filterText: {
    fontFamily: Fonts.interRegular,
    fontSize: 14,
    color: ColorConstants.DARK_CYAN,
  },
  downArrow: {
    width: 12,
    height: 12,
    tintColor: ColorConstants.DARK_CYAN,
    resizeMode: 'contain'
  },

  // Chat Card Styles
  chatCard: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: ColorConstants.WHITE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ColorConstants.GRAY3,
    overflow: 'hidden',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  chatUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ColorConstants.LIGHT_PEACH2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  initials: {
    fontFamily: Fonts.ManropeMedium,
    fontSize: 14,
    color: ColorConstants.PRIMARY_BROWN,
  },
  chatAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
  },
  chatName: {
    fontFamily: Fonts.ManropeMedium,
    fontSize: 18,
    color: ColorConstants.BLACK,
    marginBottom: 2,
  },
  chatSubtitle: {
    fontFamily: Fonts.interRegular,
    fontSize: 12,
    color: ColorConstants.GRAY,
  },
  calendarButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F7F7F7', // Very light grey
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAEAEA'
  },
  calendarIcon: {
    width: 18,
    height: 18,
    tintColor: ColorConstants.BLACK,
    resizeMode: 'contain'
  },

  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  messageRow: {
    marginBottom: 16,
    width: '100%',
  },
  leftAlign: {
    alignItems: 'flex-start',
  },
  rightAlign: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  leftBubble: {
    backgroundColor: '#FCF2ED', // Exact match light peach
    borderColor: '#9B6359', // Subtle border for peach
    borderRadius: 8
  },
  rightBubble: {
    backgroundColor: '#4A5568',
    borderColor: '#4A5568',
  },
  messageText: {
    fontFamily: Fonts.ManropeMedium,
    fontSize: 12,
    marginTop: -5,
    // lineHeight: 20,
    color: ColorConstants.DARK_CYAN
  },
  leftText: {
    color: '#4A5568', // Dark text on peach
  },
  rightText: {
    color: ColorConstants.WHITE,
  },
  timeMsg: {
    fontSize: 10,
    fontFamily: Fonts.interRegular,
    marginTop: 5,
    alignSelf: 'flex-end',
    // backgroundColor: 'red',
    marginBottom: -7
  },
  leftTime: {
    color: ColorConstants.GRAY,
  },
  rightTime: {
    color: '#A0AEC0', // Light grey on dark bg
  },

  // Input Area
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  attachmentButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEEEEE', // Grey box for clip
    justifyContent: 'center',
    alignItems: 'center',
  },

  clipIcon: {
    width: 18,
    height: 18,
    tintColor: ColorConstants.BLACK2,
    resizeMode: 'contain'
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0', // Light border
    borderRadius: 12,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 6,
    height: 48,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.mulishRegular,
    fontSize: 12,
    color: ColorConstants.BLACK,
    height: 40,
    textAlign: 'left',
    textAlignVertical: "center",
  },
  sendButton: {
    width: 25,
    height: 25,
    borderRadius: 8,
    backgroundColor: '#9B6359', // Primary Brown
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    width: 12,
    height: 12,
    tintColor: ColorConstants.WHITE,
    resizeMode: 'contain',
    marginLeft: -2 // Visual correction
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 5,
    resizeMode: 'cover',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closePreviewButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  closePreviewIcon: {
    width: 20,
    height: 20,
    tintColor: ColorConstants.WHITE,
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  dateHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 10,
  },
  dateHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: ColorConstants.GRAY3,
  },
  dateHeaderText: {
    fontFamily: Fonts.interRegular,
    fontSize: 12,
    color: ColorConstants.GRAY,
    marginHorizontal: 10,
    textTransform: 'uppercase',
  },
});
