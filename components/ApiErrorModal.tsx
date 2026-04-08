import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface ApiErrorModalProps {
    visible: boolean;
    errorData: any;
    onClose: () => void;
}

const ApiErrorModal: React.FC<ApiErrorModalProps> = ({ visible, errorData, onClose }) => {
    if (!visible) return null;
    const getErrorMessage = (data: any) => {
        if (!data) return 'An unexpected error occurred. Please try again.';
        if (typeof data === 'string') return data;
        if (typeof data === 'object') {
            // Handle standard Django/REST error objects like { "email": ["error msg"] }
            const messages = Object.entries(data)
                .map(([key, value]) => {
                    const fieldName = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
                    const message = Array.isArray(value) ? value[0] : value;
                    return `• ${fieldName}: ${message}`;
                });
            return messages.length > 0 ? messages.join('\n\n') : JSON.stringify(data);
        }
        return 'An unexpected error occurred. Please try again.';
    };

    const errorMessage = getErrorMessage(errorData);

    return (
        <View style={styles.errorModalOverlay}>
            <View style={styles.errorModalContainer}>
                <View style={styles.errorHeader}>
                    <View style={styles.errorIconContainer}>
                        <MaterialIcons name="error-outline" size={32} color="#DC2626" />
                    </View>
                    <Text style={styles.errorTitle}>Submission Error</Text>
                </View>
                <ScrollView style={styles.errorMessageScroll} showsVerticalScrollIndicator={false}>
                    <Text style={styles.errorMessageText}>{errorMessage}</Text>
                </ScrollView>
                <TouchableOpacity
                    style={styles.errorCloseButton}
                    onPress={onClose}
                    activeOpacity={0.8}
                >
                    <Text style={styles.errorCloseButtonText}>Okay</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    errorModalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        zIndex: 9999,
    },
    errorModalContainer: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 20,
        width: '100%',
        maxWidth: 400,
        padding: 24,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
    },
    errorHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    errorIconContainer: {
        width: 61,
        height: 61,
        borderRadius: 32,
        backgroundColor: '#FEF2F2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    errorTitle: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 20,
        color: '#111827',
        textAlign: 'center',
    },
    errorMessageScroll: {
        maxHeight: 200,
        width: '100%',
        marginBottom: 24,
    },
    errorMessageText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 22,
        textAlign: 'center',
    },
    errorCloseButton: {
        backgroundColor: '#DC2626',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 32,
        width: '100%',
        alignItems: 'center',
    },
    errorCloseButtonText: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 16,
        color: ColorConstants.WHITE,
    },
});

export default ApiErrorModal;
