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

interface ServiceReportModalProps {
    visible: boolean;
    onClose: () => void;
    reportData?: any;
}

const ServiceReportModal: React.FC<ServiceReportModalProps> = ({
    visible,
    onClose,
    reportData
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
                            <Text style={styles.headerTitle}>Service Report</Text>
                            <Text style={styles.headerSubtitle}>SVC-2024-1115-001</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Image source={Icons.ic_cross} style={styles.closeIcon} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {/* Service Information */}
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>Service Information</Text>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Service Type</Text>
                                <Text style={styles.infoValue}>Drain Cleaning</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Service Date</Text>
                                <Text style={styles.infoValue}>November 15, 2024</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Duration</Text>
                                <Text style={styles.infoValue}>1 hour 15 minutes</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Time</Text>
                                <Text style={styles.infoValue}>1:30 PM - 2:45 PM</Text>
                            </View>
                        </View>

                        {/* Client Information */}
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>Client Information</Text>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Name</Text>
                                <Text style={styles.infoValue}>John Smith</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Address</Text>
                                <Text style={styles.infoValue}>123 Oak Street, Springfield, IL 62701</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Phone</Text>
                                <Text style={styles.infoValue}>(555) 123-4567</Text>
                            </View>
                        </View>

                        {/* Service Details/Tasks */}
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>Service Information</Text>

                            <View style={styles.taskCard}>
                                <View style={styles.taskIconContainer}>
                                    <Image source={Icons.ic_check_circle3} style={styles.taskIcon} />
                                </View>
                                <View style={styles.taskContent}>
                                    <Text style={styles.taskTitle}>Initial inspection of main drain line</Text>
                                    <Text style={styles.taskDesc}>Found blockage approximately 20 feet from connection point</Text>
                                    <View style={styles.completedBadge}>
                                        <Text style={styles.completedText}>Completed</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.taskCard}>
                                <View style={styles.taskIconContainer}>
                                    <Image source={Icons.ic_check_circle3} style={styles.taskIcon} />
                                </View>
                                <View style={styles.taskContent}>
                                    <Text style={styles.taskTitle}>Camera inspection performed</Text>
                                    <Text style={styles.taskDesc}>Identified debris buildup and minor corrosion</Text>
                                    <View style={styles.completedBadge}>
                                        <Text style={styles.completedText}>Completed</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Findings & Recommendations */}
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>Findings & Recommendations</Text>

                            <View style={styles.findingCard}>
                                <View style={styles.findingIconContainer}>
                                    <Image source={Icons.ic_info2} />
                                </View>
                                <View style={styles.findingContent}>
                                    <Text style={styles.findingTitle}>Issue Found</Text>
                                    <Text style={styles.findingDesc}>Main drain line blockage caused by debris accumulation</Text>
                                </View>
                            </View>

                            <View style={styles.findingCard}>
                                <View style={styles.findingContent}>
                                    <Text style={styles.findingTitle}>Root Cause Analysis</Text>
                                    <Text style={styles.findingDesc}>Combination of grease buildup and mineral deposits</Text>
                                </View>
                            </View>
                        </View>

                        {/* Materials & Equipment */}
                        <View style={[styles.sectionContainer2]}>
                            <Text style={[styles.sectionTitle, { paddingHorizontal: 15 }]}>Materials & Equipment Used</Text>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableHeaderText, { flex: 2 }]}>Material</Text>
                                <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Quantity</Text>
                                <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Cost</Text>
                            </View>

                            <View style={styles.tableRow}>
                                <Text style={[styles.tableCellText, { flex: 2 }]}>Hydro jet fluid</Text>
                                <Text style={[styles.tableCellText, { flex: 1, textAlign: 'center' }]}>2 gallons</Text>
                                <Text style={[styles.tableCellText, { flex: 1, textAlign: 'right' }]}>$15</Text>
                            </View>
                            <View style={styles.tableRow}>
                                <Text style={[styles.tableCellText, { flex: 2 }]}>Drain cleaning brush</Text>
                                <Text style={[styles.tableCellText, { flex: 1, textAlign: 'center' }]}>1</Text>
                                <Text style={[styles.tableCellText, { flex: 1, textAlign: 'right' }]}>$5</Text>
                            </View>
                            <View style={styles.tableRow}>
                                <Text style={[styles.tableCellText, { flex: 2 }]}>Inspection camera time</Text>
                                <Text style={[styles.tableCellText, { flex: 1, textAlign: 'center' }]}>30 min</Text>
                                <Text style={[styles.tableCellText, { flex: 1, textAlign: 'right' }]}>$0</Text>
                            </View>
                        </View>

                        {/* Technician Information */}
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>Technician Information</Text>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Technician Name</Text>
                                <Text style={styles.infoValue}>Mike Johnson</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>License Number</Text>
                                <Text style={styles.infoValue}>IL-PLB-123456</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Experience</Text>
                                <Text style={styles.infoValue}>12 years</Text>
                            </View>
                        </View>

                        {/* Signature confirmation */}
                        <View style={[styles.sectionContainer, { alignItems: 'center' }]}>
                            <Image source={Icons.ic_check_circle3} style={styles.tickIcon} />
                            <Text style={styles.signatureText}>Client signature received on November 15, 2024</Text>
                        </View>

                        {/* Footer Actions */}
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
        padding: 15,
    },
    sectionContainer: {
        backgroundColor: ColorConstants.PRIMARY_10,
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
    },
    sectionContainer2: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        paddingHorizontal: 0
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: Fonts.ManropeMedium,
        color: '#344054',
        marginBottom: 12,
    },
    infoRow: {
        marginBottom: 10,
    },
    infoLabel: {
        fontSize: 12,
        fontFamily: Fonts.interRegular,
        color: ColorConstants.GRAY,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 14,
        fontFamily: Fonts.ManropeSemiBold,
        color: ColorConstants.BLACK2,
    },
    taskCard: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 10,
        padding: 12,
        flexDirection: 'row',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#F2F2F7',
    },
    taskIconContainer: {
        marginRight: 12,
        marginTop: 3
    },
    taskIcon: {
        width: 20,
        height: 20,
        tintColor: '#4CAF50',
    },
    taskContent: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 14,
        fontFamily: Fonts.ManropeSemiBold,
        color: ColorConstants.BLACK2,
        marginBottom: 4,
    },
    taskDesc: {
        fontSize: 12,
        fontFamily: Fonts.interRegular,
        color: ColorConstants.GRAY,
        marginBottom: 8,
    },
    completedBadge: {
        backgroundColor: ColorConstants.GREEN2,
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    completedText: {
        fontSize: 11,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.WHITE,
    },
    findingCard: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 10,
        padding: 12,
        flexDirection: 'row',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#F2F2F7',
    },
    findingIconContainer: {
        marginRight: 10,
        alignSelf: 'center'
    },
    findingContent: {
        flex: 1,
    },
    findingTitle: {
        fontSize: 14,
        fontFamily: Fonts.ManropeSemiBold,
        color: ColorConstants.BLACK2,
        marginBottom: 2,
    },
    findingDesc: {
        fontSize: 12,
        fontFamily: Fonts.interRegular,
        color: ColorConstants.GRAY,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F9FAFB',
        padding: 12,
        marginBottom: 5,
    },
    tableHeaderText: {
        fontSize: 16,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.BLACK2,
    },
    tableRow: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    tableCellText: {
        fontSize: 13,
        fontFamily: Fonts.interRegular,
        color: ColorConstants.BLACK2,
    },
    tickIcon: {
        width: 24,
        height: 24,
        marginBottom: 10,
    },
    signatureText: {
        fontSize: 12,
        fontFamily: Fonts.mulishRegular,
        color: ColorConstants.DARK_CYAN,
        textAlign: 'center',
    },
    footerActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 15,
        marginTop: 10,
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
        fontFamily: Fonts.ManropeRegular,
        color: ColorConstants.BLACK2,
    },
});

export default ServiceReportModal;
