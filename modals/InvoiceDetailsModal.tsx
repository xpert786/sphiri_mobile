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

interface InvoiceDetailsModalProps {
    visible: boolean;
    onClose: () => void;
    invoice?: any;
}

const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({
    visible,
    onClose,
    invoice
}) => {
    // Merge provided invoice with defaults to ensure all properties exist
    const data = {
        number: invoice?.number || 'INV-2025-002',
        date: invoice?.date || 'Feb 15, 2025',
        amount: invoice?.amount || '$24.99',
        plan: invoice?.plan || 'Family+ (Monthly)',
        paymentMethod: invoice?.paymentMethod || 'Visa ****4242',
        description: invoice?.description || 'Family+ Plan - Monthly Subscription',
        items: invoice?.items || [
            { label: invoice?.plan || 'Family+ Plan (1 Month)', price: invoice?.amount || '$24.99' }
        ]
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.headerTitle}>Invoice Details</Text>
                            <Text style={styles.headerSubtitle}>Invoice #{data.number}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Image source={Icons.ic_cross} style={styles.closeIcon} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {/* Invoice Amount Card */}
                        <View style={styles.amountCard}>
                            <View style={styles.amountHeader}>
                                <Text style={styles.sectionLabel}>Invoice Amount</Text>
                                <View style={styles.paidBadge}>
                                    <Text style={styles.paidBadgeText}>Paid</Text>
                                </View>
                            </View>
                            <Text style={styles.planDesc}>{data.description}</Text>
                            <Text style={styles.amountText}>{data.amount}</Text>
                        </View>

                        {/* Details Section */}
                        <View style={styles.detailsCard}>
                            <Text style={styles.sectionTitle}>Details</Text>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Invoice Date</Text>
                                <Text style={styles.detailValue}>{data.date}</Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Invoice Number</Text>
                                <Text style={styles.detailValue}>{data.number}</Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Plan</Text>
                                <Text style={styles.detailValue}>{data.plan}</Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Payment Method</Text>
                                <Text style={styles.detailValue}>{data.paymentMethod}</Text>
                            </View>
                        </View>

                        {/* Itemized Charges */}
                        <View style={styles.detailsCard}>
                            <Text style={styles.sectionTitle}>Itemized Charges</Text>

                            {data.items.map((item: any, index: number) => (
                                <View key={index} style={styles.chargeRow}>
                                    <Text style={styles.chargeLabel}>{item.label}</Text>
                                    <Text style={styles.chargeValue}>{item.price}</Text>
                                </View>
                            ))}

                            <View style={[styles.chargeRow, styles.totalRow]}>
                                <Text style={styles.totalLabel}>Total</Text>
                                <Text style={styles.totalValue}>{data.amount}</Text>
                            </View>
                        </View>

                        {/* Footer Buttons */}
                        <View style={styles.footer}>
                            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                                <Text style={styles.closeBtnText}>Close</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.downloadBtn}>
                                <Text style={styles.downloadBtnText}>Download Invoice</Text>
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
        paddingHorizontal: 20,
    },
    modalContainer: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 24,
        maxHeight: '85%',
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 24,
    },
    headerTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 22,
        color: ColorConstants.BLACK2,
    },
    headerSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 13,
        color: ColorConstants.GRAY,
        marginTop: 4,
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
        paddingBottom: 24,
    },
    amountCard: {
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    amountHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    sectionLabel: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.BLACK2,
    },
    paidBadge: {
        backgroundColor: ColorConstants.GREEN20,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    paidBadgeText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 11,
        color: ColorConstants.GREEN2,
    },
    planDesc: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 13,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 16,
    },
    amountText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 28,
        color: ColorConstants.BLACK2,
    },
    detailsCard: {
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 16,
        color: ColorConstants.BLACK2,
        marginBottom: 20,
    },
    detailRow: {
        marginBottom: 16,
    },
    detailLabel: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.GRAY,
        marginBottom: 4,
    },
    detailValue: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 15,
        color: ColorConstants.BLACK2,
    },
    chargeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    chargeLabel: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
    },
    chargeValue: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    totalRow: {
        marginTop: 4,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: ColorConstants.GRAY3,
        marginBottom: 0,
    },
    totalLabel: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
    },
    totalValue: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 16,
        color: ColorConstants.BLACK2,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginTop: 8,
    },
    closeBtn: {
        flex: 1,
        height: 44,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeBtnText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.DARK_CYAN,
    },
    downloadBtn: {
        flex: 2,
        height: 44,
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    downloadBtnText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.WHITE,
    },
});

export default InvoiceDetailsModal;
