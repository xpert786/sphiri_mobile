import { apiGet } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { StringConstants } from '@/constants/StringConstants';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface ShareContactModalProps {
    visible: boolean;
    onClose: () => void;
    onShare: (selectedMemberId: string | null) => void;
    contactName: string;
}

const ShareContactModal: React.FC<ShareContactModalProps> = ({
    visible,
    onClose,
    onShare,
    contactName
}) => {
    const [selectedMember, setSelectedMember] = useState<string | null>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            fetchFamilyMembers();
        } else {
            // Reset state when modal is closed
            setSelectedMember(null);
        }
    }, [visible]);

    const fetchFamilyMembers = async () => {
        setLoading(true);
        try {
            const res = await apiGet(ApiConstants.AVAILABLE_FAMILY_MEMBERS);
            if (res.status === 200 || res.status === 201) {
                setMembers(res.data || []);
            }
        } catch (error) {
            console.error('Error fetching available family members:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleMember = (id: string) => {
        if (selectedMember === id) {
            setSelectedMember(null);
        } else {
            setSelectedMember(id);
        }
    };

    const handleShare = () => {
        onShare(selectedMember);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Share Contact with Family</Text>
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.subtitle}>
                            Select family members to share <Text style={styles.boldText}>{contactName}</Text> with. It will appear on their dashboard.
                        </Text>

                        {/* Family Member List */}
                        <View>
                            {loading ? (
                                <ActivityIndicator size="small" color={ColorConstants.PRIMARY_BROWN} style={{ padding: 20 }} />
                            ) : (
                                <FlatList
                                    data={members}
                                    keyExtractor={(item) => item.id.toString()}
                                    renderItem={({ item: member }) => (
                                        <TouchableOpacity
                                            style={styles.memberItem}
                                            onPress={() => toggleMember(member.id.toString())}
                                            activeOpacity={0.7}
                                        >
                                            <View style={[
                                                styles.checkbox,
                                                selectedMember === member.id.toString() && styles.checkboxSelected
                                            ]}>
                                                {selectedMember === member.id.toString() && (
                                                    <Image source={Icons.ic_check} style={styles.tickIcon} />
                                                )}
                                            </View>
                                            <View style={styles.memberInfo}>
                                                <Text style={styles.memberName}>{member.invitee_name}</Text>
                                                <Text style={styles.memberEmail}>{member.invitee_email}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                    ListEmptyComponent={
                                        <Text style={{ textAlign: 'center', color: ColorConstants.GRAY, padding: 20, fontFamily: Fonts.mulishRegular }}>
                                            No family members available.
                                        </Text>
                                    }
                                />
                            )}
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>{StringConstants.CANCEL}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.shareButton, !selectedMember && styles.shareButtonDisabled]}
                            onPress={handleShare}
                            disabled={!selectedMember}
                        >
                            <Text style={styles.shareButtonText}>Share</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        paddingHorizontal: 20
    },
    modalContainer: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        overflow: 'hidden',
        width: '100%'
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 18,
        color: ColorConstants.BLACK2
    },
    content: {
        padding: 20,
    },
    subtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
        lineHeight: 20,
        marginBottom: 20
    },
    boldText: {
        fontFamily: Fonts.ManropeSemiBold,
        color: ColorConstants.BLACK
    },
    listContainer: {
    },
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10
    },
    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    checkboxSelected: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        borderColor: ColorConstants.PRIMARY_BROWN
    },
    tickIcon: {
        width: 14,
        height: 14,
        tintColor: ColorConstants.WHITE,
        resizeMode: 'contain'
    },
    memberInfo: {
        flex: 1
    },
    memberName: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2
    },
    memberEmail: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.GRAY
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        backgroundColor: ColorConstants.WHITE,
        gap: 12,
        marginBottom: 20,
        marginRight: 20
    },
    cancelButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    cancelButtonText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2
    },
    shareButton: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 8
    },
    shareButtonDisabled: {
        opacity: 0.7
    },
    shareButtonText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.WHITE
    }
});

export default ShareContactModal;
