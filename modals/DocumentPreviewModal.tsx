import { Icons } from '@/assets';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import React from 'react';
import {
    Dimensions,
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');

interface DocumentPreviewModalProps {
    visible: boolean;
    onClose: () => void;
    fileName: string;
    previewUrl?: string;
    previewType?: string;
}

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
    visible,
    onClose,
    fileName,
    previewUrl,
    previewType,
}) => {
    console.log('previewUrl: ', previewUrl)
    //previewUrl: http://168.231.121.7/sphiri/media/documents/2026/02/Intake_Form_Client_Testing_1.pdf

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle} numberOfLines={1}>{fileName}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Image source={Icons.ic_cross} style={styles.closeIcon} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        <Text style={styles.previewLabel}>Document Preview</Text>

                        <View style={styles.previewContainer}>
                            {/* Main Preview Area */}
                            <View style={styles.mainPreviewArea}>
                                {previewUrl?.toLowerCase().endsWith('.pdf') || previewType === 'pdf' ? (
                                    <View style={{ flex: 1, width: '100%', overflow: 'hidden' }}>
                                        <WebView
                                            source={{
                                                uri: Platform.OS === 'android'
                                                    ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(previewUrl || '')}`
                                                    : (previewUrl || '')
                                            }}
                                            style={{ flex: 1 }}
                                            startInLoadingState={true}
                                            scalesPageToFit={Platform.OS === 'android'}
                                        />
                                    </View>
                                ) : previewUrl ? (
                                    <Image
                                        source={{ uri: previewUrl }}
                                        style={styles.mainPreviewImage}
                                        resizeMode="contain"
                                    />
                                ) : (
                                    <View style={styles.noPreviewContainer}>
                                        <Image source={Icons.ic_doc} style={styles.noPreviewIcon} />
                                        <Text style={styles.noPreviewText}>Preview not available</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};


export default DocumentPreviewModal;

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 80,
    },
    modalContainer: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 24,
        flex: 1,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 22,
        color: ColorConstants.BLACK2,
        flex: 1,
        marginRight: 10,
    },
    closeButton: {
        padding: 8,
        backgroundColor: ColorConstants.GRAY_SHADE,
        borderRadius: 20,
    },
    closeIcon: {
        width: 12,
        height: 12,
        tintColor: ColorConstants.BLACK2,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    previewLabel: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.BLACK2,
        marginBottom: 16,
    },
    previewContainer: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 12,
    },
    mainPreviewArea: {
        width: '100%',
        height: 400,
        backgroundColor: 'white',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    mainPreviewImage: {
        width: '100%',
        height: '100%',
    },
    noPreviewContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    noPreviewIcon: {
        width: 48,
        height: 48,
        tintColor: ColorConstants.GRAY3,
        marginBottom: 12,
    },
    noPreviewText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: '#666',
    },
    footer: {
        alignItems: 'flex-end',
        paddingBottom: 24,
        paddingRight: 24,
        paddingTop: 10
    },
    cancelBtn: {
        height: 44,
        paddingHorizontal: 24,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtnText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.DARK_CYAN,
    },
});

