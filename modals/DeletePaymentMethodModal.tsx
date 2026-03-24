import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface DeletePaymentMethodModalProps {
    visible: boolean;
    onClose: () => void;
    onDelete: () => void;
    isDeleting?: boolean;
}

export default function DeletePaymentMethodModal({
    visible,
    onClose,
    onDelete,
    isDeleting = false
}: DeletePaymentMethodModalProps) {
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
                            <Ionicons name="close" size={20} color={ColorConstants.BLACK} />
                        </TouchableOpacity>
                    </View>

                    {/* Title */}
                    <Text style={styles.titleText}>Delete Payment Method</Text>

                    {/* Warning Icon Circle */}
                    <View style={styles.iconCircle}>
                        <Ionicons name="warning-outline" size={32} color="#EA580C" />
                    </View>

                    {/* Subtitle */}
                    <View style={styles.content}>
                        <Text style={styles.subtitleText}>
                            Are you sure you want to delete this payment method?
                        </Text>
                    </View>

                    {/* Footer Actions */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={onClose}
                            disabled={isDeleting}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.deleteBtn, isDeleting && { opacity: 0.7 }]}
                            onPress={onDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <ActivityIndicator color={ColorConstants.WHITE} size="small" />
                            ) : (
                                <Text style={styles.deleteText}>Delete</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20
    },
    container: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 24,
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 10
    },
    closeBtn: {
        padding: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 20
    },
    titleText: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 20,
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 20
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#FFF7ED',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: 24
    },
    content: {
        alignItems: 'center',
        marginBottom: 32,
    },
    subtitleText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: '#4B5563',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 10
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center'
    },
    cancelText: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 16,
        color: '#374151'
    },
    deleteBtn: {
        flex: 1,
        backgroundColor: '#EF4444',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center'
    },
    deleteText: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 16,
        color: ColorConstants.WHITE
    }
});
