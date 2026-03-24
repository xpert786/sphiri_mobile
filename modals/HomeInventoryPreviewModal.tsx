import React from 'react';
import { Image, Linking, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import WebView from 'react-native-webview';
import { Icons } from '../assets';
import { ColorConstants } from '../constants/ColorConstants';
import { Fonts } from '../constants/Fonts';
import { handleDownload } from '../constants/Helper';


interface HomeInventoryPreviewModalProps {
    visible: boolean;
    onClose: () => void;
    item: any | null;
}

const HomeInventoryPreviewModal: React.FC<HomeInventoryPreviewModalProps> = ({
    visible,
    onClose,
    item,
}) => {
    if (!item) return null;

    const fileUrl = item.photo_url || '';
    console.log("fileUrl:", fileUrl);
    const isImage = fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) !== null;
    console.log("isImage", isImage);


    const getFileExtension = (url: string) => {
        if (!url) return 'FILE';
        const parts = url.split('.');
        const ext = parts.length > 1 ? parts.pop()?.toUpperCase() : 'FILE';
        return ext === 'JPG' ? 'JPEG' : ext;
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
                        <Text style={styles.headerTitle}>{item.name}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Image source={Icons.ic_cross} style={styles.closeIcon} />
                        </TouchableOpacity>
                    </View>

                    {/* Subheader */}
                    <View style={styles.subHeader}>
                        <Text style={styles.headerSubtitle}>Document Preview</Text>
                        {fileUrl ? (
                            <View style={styles.docTypePill}>
                                <Text style={styles.docTypeText}>{getFileExtension(fileUrl)}</Text>
                            </View>
                        ) : null}
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {/* Details Card */}
                        <View style={styles.detailsCard}>
                            {/* Row 1 */}
                            <View style={styles.detailsRow}>
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Category</Text>
                                    <Text style={styles.detailValue} numberOfLines={1}>{item.category || '--'}</Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Location</Text>
                                    <Text style={styles.detailValue} numberOfLines={1}>{item.room || '--'}</Text>
                                </View>
                            </View>

                            {/* Row 2 */}
                            <View style={styles.detailsRow}>
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Purchase Date</Text>
                                    <Text style={styles.detailValue} numberOfLines={1}>{item.purchase_date || '--'}</Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Estimated Value</Text>
                                    <Text style={styles.detailValue} numberOfLines={1}>${typeof item.current_value === 'string' || typeof item.current_value === 'number' ? item.current_value : '0.00'}</Text>
                                </View>
                            </View>

                            {/* Row 3 */}
                            <View style={styles.detailsRow}>
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Serial Number</Text>
                                    <Text style={styles.detailValue} numberOfLines={1}>{item.serial_number || '--'}</Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Vendor</Text>
                                    <Text style={styles.detailValue} numberOfLines={1}>{item.vendor_name || '--'}</Text>
                                </View>
                            </View>

                            {/* Row 4 */}
                            <View style={styles.detailsRowSingle}>
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Notes & Story</Text>
                                    <Text style={[styles.detailValue, { lineHeight: 20 }]}>{item.notes || '--'}</Text>
                                </View>
                            </View>

                            {/* Tags under details */}
                            {(item.is_high_value || item.is_insured || item.is_heirloom) && (
                                <View style={styles.tagsContainer}>
                                    {item.is_insured && <View style={[styles.tag, styles.insuredTag]}><Text style={[styles.tagText, styles.insuredTagText]}>Insured</Text></View>}
                                    {item.is_high_value && <View style={[styles.tag, styles.highValueTag]}><Text style={[styles.tagText, styles.highValueTagText]}>High Value</Text></View>}
                                    {item.is_heirloom && <View style={[styles.tag, styles.heirloomTag]}><Text style={[styles.tagText, styles.heirloomTagText]}>Heirloom</Text></View>}
                                </View>
                            )}
                        </View>

                        {/* Content Preview Area - Media & Documents */}
                        <View style={styles.mediaContainer}>
                            <Text style={styles.mediaTitle}>Media & Documents</Text>

                            <View style={styles.mediaCard}>
                                <View style={styles.mediaInfo}>
                                    <Text style={styles.mediaLabel}>PHOTO</Text>
                                    <Text style={[styles.mediaStatus, item.photo_details?.url ? styles.statusAvailable : styles.statusUnavailable]}>
                                        {item.photo_details?.url ? item.photo_details.filename : 'No file chosen'}
                                    </Text>
                                </View>
                                {item.photo_details?.url && (
                                    <TouchableOpacity style={styles.viewBtn} onPress={() => Linking.openURL(item.photo_details.url)}>
                                        <Text style={styles.viewBtnText}>View</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View style={styles.mediaCard}>
                                <View style={styles.mediaInfo}>
                                    <Text style={styles.mediaLabel}>VIDEO</Text>
                                    <Text style={[styles.mediaStatus, item.video_details?.url ? styles.statusAvailable : styles.statusUnavailable]}>
                                        {item.video_details?.url ? item.video_details.filename : 'No file chosen'}
                                    </Text>
                                </View>
                                {item.video_details?.url && (
                                    <TouchableOpacity style={styles.viewBtn} onPress={() => Linking.openURL(item.video_details.url)}>
                                        <Text style={styles.viewBtnText}>View</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View style={styles.mediaCard}>
                                <View style={styles.mediaInfo}>
                                    <Text style={styles.mediaLabel}>RECEIPT</Text>
                                    <Text style={[styles.mediaStatus, item.receipt_details?.url ? styles.statusAvailable : styles.statusUnavailable]}>
                                        {item.receipt_details?.url ? item.receipt_details.filename : 'No file chosen'}
                                    </Text>
                                </View>
                                {item.receipt_details?.url && (
                                    <TouchableOpacity style={styles.viewBtn} onPress={() => Linking.openURL(item.receipt_details.url)}>
                                        <Text style={styles.viewBtnText}>View</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View style={styles.mediaCard}>
                                <View style={styles.mediaInfo}>
                                    <Text style={styles.mediaLabel}>WARRANTY</Text>
                                    <Text style={[styles.mediaStatus, item.warranty_document_details?.url ? styles.statusAvailable : styles.statusUnavailable]}>
                                        {item.warranty_document_details?.url ? item.warranty_document_details.filename : 'No file chosen'}
                                    </Text>
                                </View>
                                {item.warranty_document_details?.url && (
                                    <TouchableOpacity style={styles.viewBtn} onPress={() => Linking.openURL(item.warranty_document_details.url)}>
                                        <Text style={styles.viewBtnText}>View</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View style={styles.mediaCard}>
                                <View style={styles.mediaInfo}>
                                    <Text style={styles.mediaLabel}>MANUAL</Text>
                                    <Text style={[styles.mediaStatus, item.manual_details?.url ? styles.statusAvailable : styles.statusUnavailable]}>
                                        {item.manual_details?.url ? item.manual_details.filename : 'No file chosen'}
                                    </Text>
                                </View>
                                {item.manual_details?.url && (
                                    <TouchableOpacity style={styles.viewBtn} onPress={() => Linking.openURL(item.manual_details.url)}>
                                        <Text style={styles.viewBtnText}>View</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {fileUrl && (
                                <View style={styles.previewArea}>
                                    {isImage ? (
                                        <Image source={{ uri: fileUrl }} style={styles.previewImage} resizeMode="cover" />
                                    ) : (
                                        <View style={styles.webviewWrapper}>
                                            <WebView
                                                source={{ uri: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(fileUrl)}` }}
                                                style={styles.webView}
                                                scalesPageToFit={true}
                                                originWhitelist={['*']}
                                                javaScriptEnabled={true}
                                                domStorageEnabled={true}
                                            />
                                        </View>
                                    )}

                                </View>)}
                        </View>
                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.footer}>
                        {fileUrl &&
                            <TouchableOpacity style={styles.downloadBtn} onPress={() => fileUrl && handleDownload(fileUrl)}>
                                <Text style={styles.downloadBtnText}>Download</Text>
                            </TouchableOpacity>}
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={styles.cancelBtnText}>Close</Text>
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
        paddingHorizontal: 16,
        paddingVertical: 32,
    },
    modalContainer: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        overflow: 'hidden',
        flex: 1,
        maxHeight: '75%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 4,
    },
    headerTitle: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 18,
        color: ColorConstants.BLACK2,
        flex: 1,
    },
    closeButton: {
        padding: 4,
    },
    closeIcon: {
        width: 14,
        height: 14,
        tintColor: ColorConstants.BLACK2,
    },
    subHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    headerSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.GRAY,
    },
    docTypePill: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    scrollContent: {
        paddingBottom: 24,
    },
    docTypeText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
    },
    detailsCard: {
        backgroundColor: '#FCFAF6',
        marginHorizontal: 20,
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
    },
    detailsRow: {
        flexDirection: 'row',
        marginBottom: 16
    },
    detailsRowSingle: {
        marginBottom: 16,
    },
    detailItem: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    detailLabel: {
        fontFamily: Fonts.interBold,
        fontSize: 13,
        color: '#64748B',
        marginBottom: 4,
    },
    detailValue: {
        fontFamily: Fonts.interRegular,
        fontSize: 12,
        color: '#334155',
        paddingRight: 8,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 4,
    },
    tag: {
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 4,
    },
    tagText: {
        fontFamily: Fonts.interSemiBold,
        fontSize: 12,
    },
    highValueTag: {
        backgroundColor: '#FEF3C7',
    },
    highValueTagText: {
        color: '#B45309',
    },
    insuredTag: {
        backgroundColor: '#D1FAE5',
    },
    insuredTagText: {
        color: '#059669',
    },
    heirloomTag: {
        backgroundColor: '#E0E7FF',
    },
    heirloomTagText: {
        color: '#4338CA',
    },
    mediaContainer: {
        marginHorizontal: 20,
        borderTopWidth: 1,
        borderColor: '#F1F5F9',
        paddingTop: 16,
    },
    mediaTitle: {
        fontFamily: Fonts.interBold,
        fontSize: 14,
        color: '#64748B',
        marginBottom: 12,
    },
    mediaCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: ColorConstants.WHITE,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
    },
    mediaInfo: {
        flex: 1,
        paddingRight: 10,
    },
    mediaLabel: {
        fontFamily: Fonts.interBold,
        fontSize: 12,
        color: '#94A3B8',
        marginBottom: 4,
    },
    mediaStatus: {
        fontFamily: Fonts.interRegular,
        fontSize: 13,
    },
    statusAvailable: {
        color: '#059669',
    },
    statusUnavailable: {
        color: '#CBD5E1',
    },
    viewBtn: {
        backgroundColor: ColorConstants.DARK_CYAN,
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 4,
    },
    viewBtnText: {
        color: ColorConstants.WHITE,
        fontFamily: Fonts.interMedium,
        fontSize: 12,
    },
    previewArea: {
        marginTop: 16,
        padding: 5,
        minHeight: 200,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        overflow: 'hidden',
    },
    previewImage: {
        width: '100%',
        minHeight: 200,
        borderRadius: 8,
    },
    webviewWrapper: {
        flex: 1,
        backgroundColor: ColorConstants.WHITE,
    },
    webView: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    noPreview: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    noPreviewText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.GRAY,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: 20,
        gap: 12,
    },
    closeBtn: {
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    cancelBtn: {
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: ColorConstants.WHITE,
    },
    cancelBtnText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
    },
    downloadBtn: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    downloadBtnText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.WHITE,
    },
});

export default HomeInventoryPreviewModal;
