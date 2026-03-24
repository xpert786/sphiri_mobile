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

interface DeleteBackupModalProps {
    visible: boolean;
    onClose: () => void;
    onDelete: () => void;
}

const DeleteBackupModal: React.FC<DeleteBackupModalProps> = ({
    visible,
    onClose,
    onDelete,
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
                        <Text style={styles.headerTitle}>Delete Backup</Text>
                    </View>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Image source={Icons.ic_cross} style={styles.closeIcon} />
                    </TouchableOpacity>

                    {/* Alert Icon Circle */}
                    <View style={styles.iconCircle}>
                        <Image source={Icons.ic_warn_emergency} style={styles.warnIcon} />
                    </View>

                    {/* Subtitle */}
                    <View style={styles.content}>
                        <Text style={styles.subtitleText}>Are you sure you want to delete this backup? This action cannot be undone.</Text>
                    </View>

                    {/* Footer Actions */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
                            <Text style={styles.deleteText}>Delete</Text>
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
        padding: 24
    },
    container: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 24,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        alignSelf: 'center'
    },
    headerTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 22,
        color: '#1F2937',
    },
    closeBtn: {
        padding: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        position: 'absolute',
        right: 20,
        top: 20
    },
    closeIcon: {
        width: 12,
        height: 12,
        tintColor: ColorConstants.GRAY5
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFF7ED', // Very light orange
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginTop: -10,
        marginBottom: 20
    },
    warnIcon: {
        width: 36,
        height: 36,
        resizeMode: 'contain',
        tintColor: '#EA580C' // Orange
    },
    content: {
        alignItems: 'center',
        marginBottom: 32,
    },
    subtitleText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 16,
        color: '#3B4A66',
        textAlign: 'center',
        paddingHorizontal: 10,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center'
    },
    cancelText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 16,
        color: '#3B4A66'
    },
    deleteBtn: {
        flex: 1,
        backgroundColor: ColorConstants.RED,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center'
    },
    deleteText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 16,
        color: ColorConstants.WHITE
    }
});

export default DeleteBackupModal;
