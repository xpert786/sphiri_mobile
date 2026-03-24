import { apiGet } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { capitalizeFirstLetter } from '@/constants/Helper';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Attachment {
    id: number;
    filename: string;
    file_size: number;
    content_type: string;
    file_url: string;
    uploaded_at: string;
}

interface ReplySender {
    name: string;
    email: string;
    role: string;
}

interface ReplyItem {
    id: number;
    message: string;
    sender: ReplySender;
    is_internal: boolean;
    created_at: string;
    attachments: Attachment[];
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

interface TicketDetailsModalProps {
    visible: boolean;
    onClose: () => void;
    ticket: TicketItem | null;
    handleReply: (ticket: TicketItem) => void;
}

export default function TicketDetailsModal({ visible, onClose, ticket, handleReply }: TicketDetailsModalProps) {
    const [replies, setReplies] = useState<ReplyItem[]>([]);
    const [loadingReplies, setLoadingReplies] = useState(false);

    useEffect(() => {
        if (visible && ticket) {
            fetchReplies();
        }
    }, [visible, ticket]);

    const fetchReplies = async () => {
        try {
            setLoadingReplies(true);
            const response = await apiGet(`${ApiConstants.SUPPORT_TICKETS}${ticket?.id}/`); // fallback or actual ticket id based on API structure, assuming ID is integer 22 etc. if ticket_id is TKT-22 then split or if ticket.id is the actual DB id use ticket.id
            if (response.data && response.data.replies) {
                setReplies(response.data.replies);
            }
        } catch (error) {
            console.error('Error fetching ticket replies:', error);
        } finally {
            setLoadingReplies(false);
        }
    };

    if (!ticket) return null;
    const formattedDate = new Date(ticket.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.modalTitle}>Ticket #{ticket.ticket_id}</Text>
                            <Text style={styles.modalSubtitle}>{ticket.subject}</Text>
                        </View>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Ionicons name="close" size={20} color={ColorConstants.DARK_CYAN || '#000'} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {/* Details Grid */}
                        <View style={styles.detailsGrid}>
                            <View style={styles.detailsCol}>
                                <View style={styles.detailItem}>
                                    <View style={styles.iconBox}>
                                        <Ionicons name="person-outline" size={20} color={ColorConstants.WHITE} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.detailLabel}>From</Text>
                                        <Text style={styles.detailValue}>{ticket.customer_email || 'N/A'}</Text>
                                    </View>
                                </View>
                                <View style={styles.detailItem}>
                                    <View style={styles.iconBox}>
                                        <Ionicons name="pricetag-outline" size={20} color={ColorConstants.WHITE} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.detailLabel}>Priority</Text>
                                        <Text style={styles.detailValue}>{capitalizeFirstLetter(ticket.priority)}</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.detailsCol}>
                                <View style={styles.detailItem}>
                                    <View style={styles.iconBox}>
                                        <Ionicons name="calendar-outline" size={20} color={ColorConstants.WHITE} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.detailLabel}>Created</Text>
                                        <Text style={styles.detailValue}>{formattedDate}</Text>
                                    </View>
                                </View>
                                <View style={styles.detailItem}>
                                    <View style={styles.iconBox}>
                                        <Ionicons name="information-circle-outline" size={20} color={ColorConstants.WHITE} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.detailLabel}>Status</Text>
                                        <Text style={styles.detailValue}>{ticket.status}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Description Box */}
                        <Text style={styles.sectionTitle}>Description</Text>
                        <View style={styles.descriptionBox}>
                            <Text style={styles.descriptionText}>{ticket.description || 'Please check this ticket'}</Text>
                        </View>

                        {/* Conversation History Box */}
                        <Text style={styles.sectionTitle}>Conversation History ({replies.length} replies)</Text>

                        {loadingReplies ? (
                            <ActivityIndicator size="small" color={ColorConstants.PRIMARY_BROWN} style={{ marginTop: 20 }} />
                        ) : (
                            <View style={styles.chatSection}>
                                {replies.map((reply) => {
                                    const replyDate = new Date(reply.created_at).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    });

                                    // is_internal or different sender logic
                                    // if sender email matches customer email => Right aligned
                                    const isCustomer = reply.sender.email === ticket.customer_email;

                                    if (isCustomer) {
                                        return (
                                            <View key={reply.id} style={styles.chatRightContainer}>
                                                <Text style={styles.chatTimestampRight}>{reply.sender.name}   {replyDate}</Text>
                                                <View style={styles.chatBubbleRight}>
                                                    <Text style={styles.chatTextRight}>{reply.message}</Text>
                                                    {reply.attachments && reply.attachments.length > 0 && (
                                                        <View>
                                                            <View style={styles.dividerRight} />
                                                            <Text style={styles.attachmentLabelRight}>Attachments:</Text>
                                                            <View style={styles.attachmentsList}>
                                                                {reply.attachments.map((attachment) => {
                                                                    const isPdf = attachment.content_type === 'application/pdf' || attachment.filename.endsWith('.pdf');
                                                                    return (
                                                                        <TouchableOpacity key={attachment.id} onPress={() => Linking.openURL(attachment.file_url)}>
                                                                            {isPdf ? (
                                                                                <View style={[styles.emptyAttachmentBox, { borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'transparent' }]}>
                                                                                    <Ionicons name="document-text" size={24} color={ColorConstants.WHITE} />
                                                                                    <Text style={{ color: ColorConstants.WHITE, fontSize: 10, marginTop: 4, textAlign: 'center' }} numberOfLines={2}>
                                                                                        {attachment.filename}
                                                                                    </Text>
                                                                                </View>
                                                                            ) : (
                                                                                <Image source={{ uri: attachment.file_url }} style={styles.attachmentImg} />
                                                                            )}
                                                                        </TouchableOpacity>
                                                                    );
                                                                })}
                                                            </View>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                        );
                                    } else {
                                        return (
                                            <View key={reply.id} style={styles.chatLeftContainer}>
                                                <Text style={styles.chatTimestampLeft}>{reply.sender.name}   {replyDate}</Text>
                                                <View style={styles.chatBubbleLeft}>
                                                    <Text style={styles.chatTextLeft}>{reply.message}</Text>
                                                    {reply.attachments && reply.attachments.length > 0 && (
                                                        <View>
                                                            <View style={styles.dividerLeft} />
                                                            <Text style={styles.attachmentLabelLeft}>Attachments:</Text>
                                                            <View style={styles.attachmentsList}>
                                                                {reply.attachments.map((attachment) => {
                                                                    const isPdf = attachment.content_type === 'application/pdf' || attachment.filename.endsWith('.pdf');
                                                                    return (
                                                                        <TouchableOpacity key={attachment.id} onPress={() => Linking.openURL(attachment.file_url)}>
                                                                            {isPdf ? (
                                                                                <View style={styles.emptyAttachmentBox}>
                                                                                    <Ionicons name="document-text" size={24} color={ColorConstants.PRIMARY_BROWN} />
                                                                                    <Text style={{ color: ColorConstants.GRAY, fontSize: 10, marginTop: 4, textAlign: 'center' }} numberOfLines={2}>
                                                                                        {attachment.filename}
                                                                                    </Text>
                                                                                </View>
                                                                            ) : (
                                                                                <Image source={{ uri: attachment.file_url }} style={styles.attachmentImg} />
                                                                            )}
                                                                        </TouchableOpacity>
                                                                    );
                                                                })}
                                                            </View>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                        );
                                    }
                                })}
                            </View>
                        )}

                        {/* Footer Actions */}
                        <View style={styles.footer}>
                            <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
                                <Text style={styles.btnCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.btnCreate]}
                                onPress={() => handleReply(ticket)}
                            >
                                <Text style={styles.btnCreateText}>
                                    Reply
                                </Text>
                            </TouchableOpacity>
                        </View>

                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'flex-end',  // Change to push to bottom
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: ColorConstants.WHITE,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        // Remove bottom radiuses because it's at the bottom
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        width: '100%',
        height: '92%',
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: ColorConstants.GRAY3 || '#e5e7eb',
        paddingBottom: 16,
        marginBottom: 20,
    },
    headerTextContainer: {
        flex: 1,
    },
    modalTitle: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 20,
        color: ColorConstants.BLACK2,
    },
    modalSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.GRAY,
        marginTop: 4,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: ColorConstants.GRAY6 || '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    detailsCol: {
        flex: 1,
        gap: 16,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#737373', // Fallback
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailLabel: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 11,
        color: ColorConstants.GRAY,
    },
    detailValue: {
        fontFamily: Fonts.interMedium,
        fontSize: 12,
        color: ColorConstants.BLACK2,
        marginTop: 2,
    },
    sectionTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.BLACK2,
        marginBottom: 12,
        marginTop: 8,
    },
    descriptionBox: {
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3 || '#e5e7eb',
        borderRadius: 8,
        padding: 16,
        backgroundColor: '#f9fafb',
        marginBottom: 24,
    },
    descriptionText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.GRAY,
        lineHeight: 20,
    },
    chatSection: {
        marginTop: 8,
    },
    chatRightContainer: {
        alignItems: 'flex-end',
        marginBottom: 24,
    },
    chatTimestampRight: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.GRAY,
        marginBottom: 6,
    },
    chatBubbleRight: {
        backgroundColor: '#A47B6A', // Primary Brown shade
        padding: 16,
        borderRadius: 16,
        borderTopRightRadius: 4,
        maxWidth: '85%',
    },
    chatTextRight: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.WHITE,
    },
    dividerRight: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        marginVertical: 12,
    },
    attachmentLabelRight: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 8,
    },
    attachmentsList: {
        flexDirection: 'row',
        gap: 8,
    },
    attachmentImg: {
        width: 120,
        height: 80,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    chatLeftContainer: {
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    chatTimestampLeft: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.GRAY,
        marginBottom: 6,
    },
    chatBubbleLeft: {
        backgroundColor: '#FEF5F2', // Light pinkish
        borderWidth: 1,
        borderColor: '#E6D3C9',
        padding: 16,
        borderRadius: 16,
        borderTopLeftRadius: 4,
        maxWidth: '85%',
    },
    chatTextLeft: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    dividerLeft: {
        height: 1,
        backgroundColor: '#E6D3C9',
        marginVertical: 12,
    },
    attachmentLabelLeft: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.GRAY,
        marginBottom: 8,
    },
    emptyAttachmentBox: {
        width: 100,
        paddingHorizontal: 8,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3 || '#e5e7eb',
        backgroundColor: ColorConstants.WHITE,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: ColorConstants.GRAY6,
        paddingTop: 16,
        gap: 12,
    },
    btnCancel: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
    },
    btnCancelText: {
        fontFamily: Fonts.interMedium,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
    },
    btnCreate: {
        backgroundColor: ColorConstants.PRIMARY_BROWN, // Muted version of PRIMARY_BROWN since the screenshot button looks a bit faded
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    btnCreateDisabled: {
        opacity: 0.6,
    },
    btnCreateText: {
        fontFamily: Fonts.interMedium,
        fontSize: 14,
        color: ColorConstants.WHITE,
    },
});
