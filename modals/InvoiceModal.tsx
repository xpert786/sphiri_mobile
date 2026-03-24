import { Icons } from '@/assets';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import React from 'react';
import {
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface InvoiceModalProps {
    visible: boolean;
    onClose: () => void;
    invoiceData?: any;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({
    visible,
    onClose,
    invoiceData
}) => {
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
                        <View style={{ flex: 1 }}>
                            <Text style={styles.headerTitle}>INV-2024-1115-001</Text>
                            <Text style={styles.headerSubtitle}>Invoice details and payment information</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Image source={Icons.ic_cross} style={styles.closeIcon} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {/* Logo */}
                        <View style={styles.logoContainer}>
                            <View style={styles.logoBox}>
                                <Text style={styles.logoText}>Logo</Text>
                            </View>
                        </View>

                        {/* Addresses */}
                        <View style={styles.addressSection}>
                            <View style={styles.addressBlock}>
                                <Text style={styles.addressLabel}>From</Text>
                                <Text style={styles.businessName}>Alex's Plumbing Services</Text>
                                <Text style={styles.addressText}>123 Main St, Springfield, IL 62701</Text>
                                <Text style={styles.addressText}>(555) 123-4567</Text>
                                <Text style={styles.addressText}>contact@alexsplumbing.com</Text>
                            </View>

                            <View style={[styles.addressBlock, { marginTop: 20 }]}>
                                <Text style={styles.addressLabel}>Bill To:</Text>
                                <Text style={styles.businessName}>John Smith</Text>
                                <Text style={styles.addressText}>123 Oak Street, Springfield, IL 62701</Text>
                                <Text style={styles.addressText}>(555) 123-4567</Text>
                                <Text style={styles.addressText}>john@example.com</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        {/* Metadata */}
                        <View style={styles.metadataSection}>
                            <View style={styles.metaRow}>
                                <Text style={styles.metaLabel}>Invoice Number</Text>
                                <Text style={styles.metaValue}>INV-2024-1115-001</Text>
                            </View>

                            <View style={styles.metaRow}>
                                <Text style={styles.metaLabel}>Invoice Date</Text>
                                <Text style={styles.metaValue}>15 November 2024</Text>
                            </View>

                            <View style={styles.metaRow}>
                                <Text style={styles.metaLabel}>Due Date</Text>
                                <Text style={styles.metaValue}>15 December 2024</Text>
                            </View>

                            <View style={styles.metaRow}>
                                <Text style={styles.metaLabel}>Status</Text>
                                <View style={styles.paidBadge}>
                                    <Text style={styles.paidText}>Paid</Text>
                                </View>
                            </View>

                            <View style={styles.metaRow}>
                                <Text style={styles.metaLabel}>Payment Date</Text>
                                <Text style={styles.metaValue}>16 November 2024</Text>
                            </View>
                        </View>

                        {/* Services Table */}
                        <View style={styles.servicesSection}>
                            <Text style={styles.sectionTitle}>Services</Text>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableHeaderText, { flex: 2.5 }]}>Description</Text>
                                <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Quantity</Text>
                                <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Rate</Text>
                                <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Amount</Text>
                            </View>

                            <View style={styles.tableRow}>
                                <Text style={[styles.tableCellText, { flex: 2.5 }]}>Drain Cleaning Service - Main Line</Text>
                                <Text style={[styles.tableCellText, { flex: 1, textAlign: 'center' }]}>1</Text>
                                <Text style={[styles.tableCellText, { flex: 1, textAlign: 'right' }]}>$100.00</Text>
                                <Text style={[styles.tableCellText, { flex: 1, textAlign: 'right' }]}>$100.00</Text>
                            </View>

                            <View style={styles.tableRow}>
                                <Text style={[styles.tableCellText, { flex: 2.5 }]}>Equipment & Material Setup</Text>
                                <Text style={[styles.tableCellText, { flex: 1, textAlign: 'center' }]}>1</Text>
                                <Text style={[styles.tableCellText, { flex: 1, textAlign: 'right' }]}>$30.00</Text>
                                <Text style={[styles.tableCellText, { flex: 1, textAlign: 'right' }]}>$30.00</Text>
                            </View>

                            <View style={styles.tableRow}>
                                <Text style={[styles.tableCellText, { flex: 2.5 }]}>Camera Inspection</Text>
                                <Text style={[styles.tableCellText, { flex: 1, textAlign: 'center' }]}>1</Text>
                                <Text style={[styles.tableCellText, { flex: 1, textAlign: 'right' }]}>$20.00</Text>
                                <Text style={[styles.tableCellText, { flex: 1, textAlign: 'right' }]}>$20.00</Text>
                            </View>
                        </View>

                        {/* Totals */}
                        <View style={styles.totalsSection}>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Subtotal:</Text>
                                <Text style={styles.totalAmount}>$150.00</Text>
                            </View>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Tax (0%):</Text>
                                <Text style={styles.totalAmount}>$0.00</Text>
                            </View>
                            <View style={styles.totalRowLarge}>
                                <Text style={styles.totalLabelLarge}>Total:</Text>
                                <Text style={styles.totalAmountLarge}>$150.00</Text>
                            </View>
                        </View>

                        {/* Notes */}
                        <View style={styles.notesSection}>
                            <Text style={styles.sectionTitle}>Notes</Text>
                            <Text style={styles.notesText}>Service completed successfully. Main line blockage removed. Thank you for your business.</Text>
                        </View>

                        {/* Actions */}
                        <View style={styles.footerActions}>
                            <TouchableOpacity style={styles.actionBtn}>
                                <Image source={Icons.ic_print} style={styles.actionIcon} />
                                <Text style={styles.actionText}>Print</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.actionBtn}>
                                <Image source={Icons.ic_download_bottom} style={styles.actionIcon} />
                                <Text style={styles.actionText}>Download PDF</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
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
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 20,
        width: '100%',
        maxHeight: '90%',
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    headerTitle: {
        fontSize: 22,
        fontFamily: Fonts.ManropeBold,
        color: ColorConstants.BLACK,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        fontFamily: Fonts.mulishRegular,
        color: ColorConstants.GRAY,
    },
    closeBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#F2F2F7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeIcon: {
        width: 12,
        height: 12,
        tintColor: ColorConstants.BLACK2,
    },
    scrollContent: {
        padding: 20,
    },
    logoContainer: {
        marginBottom: 25,
    },
    logoBox: {
        width: 140,
        height: 80,
        backgroundColor: '#F2F2F7',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        fontSize: 28,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.BLACK2,
    },
    addressSection: {
        marginBottom: 20,
    },
    addressBlock: {},
    addressLabel: {
        fontSize: 16,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.BLACK,
        marginBottom: 8,
    },
    businessName: {
        fontSize: 15,
        fontFamily: Fonts.interRegular,
        color: ColorConstants.BLACK2,
        marginBottom: 4,
    },
    addressText: {
        fontSize: 14,
        fontFamily: Fonts.interRegular,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 2,
    },
    divider: {
        height: 1,
        backgroundColor: '#F2F2F7',
        marginBottom: 20,
    },
    metadataSection: {
        marginBottom: 20,
    },
    metaRow: {
        marginBottom: 12,
    },
    metaLabel: {
        fontSize: 13,
        fontFamily: Fonts.interRegular,
        color: ColorConstants.GRAY,
        marginBottom: 4,
    },
    metaValue: {
        fontSize: 16,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.BLACK2,
    },
    paidBadge: {
        backgroundColor: '#4CAF50',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 12,
    },
    paidText: {
        fontSize: 12,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.WHITE,
    },
    servicesSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.BLACK,
        marginBottom: 12,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F2F2F7',
        padding: 10,
        borderRadius: 4,
        marginBottom: 8,
    },
    tableHeaderText: {
        fontSize: 12,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.GRAY,
    },
    tableRow: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    tableCellText: {
        fontSize: 13,
        fontFamily: Fonts.interRegular,
        color: ColorConstants.BLACK2,
    },
    totalsSection: {
        alignItems: 'flex-end',
        marginBottom: 25,
        paddingRight: 10,
    },
    totalRow: {
        flexDirection: 'row',
        width: 200,
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    totalLabel: {
        fontSize: 14,
        fontFamily: Fonts.interRegular,
        color: ColorConstants.DARK_CYAN,
    },
    totalAmount: {
        fontSize: 14,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.BLACK2,
    },
    totalRowLarge: {
        flexDirection: 'row',
        width: 200,
        justifyContent: 'space-between',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F2F2F7',
    },
    totalLabelLarge: {
        fontSize: 16,
        fontFamily: Fonts.ManropeBold,
        color: ColorConstants.BLACK2,
    },
    totalAmountLarge: {
        fontSize: 16,
        fontFamily: Fonts.ManropeBold,
        color: ColorConstants.BLACK2,
    },
    notesSection: {
        marginBottom: 30,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    notesText: {
        fontSize: 14,
        fontFamily: Fonts.interRegular,
        color: ColorConstants.DARK_CYAN,
        lineHeight: 20,
    },
    footerActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 15,
        marginBottom: 10,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    actionIcon: {
        width: 16,
        height: 16,
        marginRight: 8,
        tintColor: ColorConstants.BLACK2,
        resizeMode: 'contain',
    },
    actionText: {
        fontSize: 14,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.BLACK2,
    },
});

export default InvoiceModal;
