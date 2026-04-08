import { Icons } from '@/assets';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import React from 'react';
import {
    ActivityIndicator,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface DeleteConfirmationModalProps {
    visible: boolean;
    onClose: () => void;
    onDelete: () => void;
    title: string;
    subtitle?: string;
    isLoading?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    visible,
    onClose,
    onDelete,
    title,
    subtitle,
    isLoading = false,
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
                    {/* Header with Close Button */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Image source={Icons.ic_cross} style={styles.closeIcon} />
                        </TouchableOpacity>
                    </View>

                    {/* Trash Icon Circle */}
                    <View style={styles.iconCircle}>
                        <Image source={Icons.ic_bin2} style={styles.trashIcon} />
                    </View>

                    {/* Dynamic Title and Subtitle */}
                    <View style={styles.content}>
                        <Text style={styles.titleText}>{title}</Text>
                    </View>

                    {/* Footer Actions */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.deleteBtn, isLoading && { opacity: 0.7 }]} 
                            onPress={onDelete}
                            disabled={isLoading}
                        >
                            <View style={styles.deleteBtnContent}>
                                {isLoading ? (
                                    <ActivityIndicator size="small" color={ColorConstants.WHITE} />
                                ) : (
                                    <>
                                        <Image source={Icons.ic_bin} style={styles.deleteIcon} />
                                        <Text style={styles.deleteText}>Delete</Text>
                                    </>
                                )}
                            </View>
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
        borderRadius: 24, // Slightly more rounded as per screenshot
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    closeBtn: {
        padding: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 20
    },
    closeIcon: {
        width: 12,
        height: 12,
        tintColor: ColorConstants.GRAY5
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: ColorConstants.RED50, // Lighter red/pink as per screenshot
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 20
    },
    trashIcon: {
        width: 32,
        height: 32,
        resizeMode: 'contain',
        tintColor: '#2D2F33'
    },
    content: {
        alignItems: 'center',
        marginBottom: 24,
    },
    titleText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.DARK_CYAN, // Darker grayish blue
        textAlign: 'center',
        lineHeight: 26,
        paddingHorizontal: 10
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        marginBottom: 10
    },
    cancelBtn: {
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center'
    },
    cancelText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.DARK_CYAN
    },
    deleteBtn: {
        backgroundColor: ColorConstants.RED, // Red 
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 10,
        alignItems: 'center'
    },
    deleteBtnContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    deleteIcon: {
        width: 14,
        height: 14,
        resizeMode: 'contain'
    },
    deleteText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.WHITE
    }
});

export default DeleteConfirmationModal;
