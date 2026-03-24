import { Icons } from '@/assets';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import React from 'react';
import {
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface DeleteReminderModalProps {
    visible: boolean;
    onClose: () => void;
    onDelete: () => void;
    reminder: any;
}

const DeleteReminderModal: React.FC<DeleteReminderModalProps> = ({
    visible,
    onClose,
    onDelete,
    reminder
}) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Delete Reminder</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Image source={Icons.ic_cross} style={styles.closeIcon} />
                        </TouchableOpacity>
                    </View>

                    {/* Trash Icon Circle */}
                    <View style={styles.iconCircle}>
                        <Image source={Icons.ic_bin2} style={styles.trashIcon} />
                    </View>

                    {/* Reminder Info Card */}
                    <View style={styles.reminderCard}>
                        <Text style={styles.cardTitle}>{reminder?.title || ''}</Text>
                        <View style={styles.cardMetaRow}>
                            <View style={styles.metaItem}>
                                <Image source={Icons.ic_calendar_outline} style={styles.metaIcon} />
                                <Text style={styles.metaText}>Due: {reminder?.displayDate || reminder?.date || ''}</Text>
                            </View>
                            <View style={styles.metaItem}>
                                <Image source={Icons.ic_tags} style={styles.metaIcon} />
                                <Text style={styles.metaText}>Assigned to: {reminder?.assignedTo || ''}</Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.confirmTitle}>Are you sure you want to delete this reminder?</Text>
                    <Text style={styles.confirmSub}>This action cannot be undone. The reminder will be permanently removed from your account.</Text>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
                            <Text style={styles.deleteText}>Delete Reminders</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20
    },
    container: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 16,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        paddingBottom: 12
    },
    title: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 20,
        color: ColorConstants.BLACK2
    },
    closeBtn: {
        padding: 10,
        backgroundColor: ColorConstants.GRAY3,
        borderRadius: 20
    },
    closeIcon: {
        width: 12,
        height: 12,
        tintColor: ColorConstants.GRAY5
    },
    iconCircle: {
        width: 54,
        height: 54,
        borderRadius: 32,
        backgroundColor: ColorConstants.RED50, // Light red
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginVertical: 20
    },
    trashIcon: {
        width: 28,
        height: 28,
        resizeMode: 'contain'
    },
    reminderCard: {
        backgroundColor: '#F5F7FA', // Light Grayish
        borderRadius: 8,
        padding: 16,
        marginBottom: 20
    },
    cardTitle: {
        fontFamily: Fonts.mulishSemiBold,
        fontSize: 16,
        color: ColorConstants.BLACK2,
        marginBottom: 8,
    },
    cardMetaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flexShrink: 1
    },
    metaIcon: {
        width: 14,
        height: 14,
        tintColor: ColorConstants.DARK_CYAN,
        resizeMode: 'contain'
    },
    metaText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 13,
        color: ColorConstants.DARK_CYAN,
        flexShrink: 1
    },
    confirmTitle: {
        fontFamily: Fonts.mulishBold,
        fontSize: 16,
        color: ColorConstants.BLACK2,
        textAlign: 'center',
        marginBottom: 8
    },
    confirmSub: {
        fontFamily: Fonts.ManropeRegular,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 10
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end', // Centered as per screenshot? No, looks like space-around or just gap. Screenshot shows cancel and delete.
        gap: 12,
        marginBottom: 10
    },
    cancelBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3
    },
    cancelText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.DARK_CYAN
    },
    deleteBtn: {
        backgroundColor: ColorConstants.RED, // Red
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8
    },
    deleteText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.WHITE
    }
});

export default DeleteReminderModal;
