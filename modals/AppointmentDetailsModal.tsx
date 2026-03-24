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

interface AppointmentDetailsModalProps {
    visible: boolean;
    onClose: () => void;
    appointment?: {
        id: number;
        client_name: string;
        service_title: string;
        formatted_date: string;
        formatted_time: string;
        address: string;
        status?: string;
        notes?: string;
    };
}

const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
    visible,
    onClose,
    appointment
}) => {
    if (!appointment) return null;

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
                            <Text style={styles.headerTitle}>Appointment Details</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Image source={Icons.ic_cross} style={styles.closeIcon} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {/* Service Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>SERVICE</Text>
                            <Text style={styles.sectionValue}>{appointment.service_title}</Text>
                        </View>

                        {/* Date and Time Row */}
                        <View style={styles.rowContainer}>
                            <View style={[styles.section, styles.halfWidth]}>
                                <Text style={styles.sectionLabel}>DATE</Text>
                                <Text style={styles.sectionValue}>{appointment.formatted_date}</Text>
                            </View>
                            <View style={[styles.section, styles.halfWidth]}>
                                <Text style={styles.sectionLabel}>TIME</Text>
                                <Text style={styles.sectionValue}>{appointment.formatted_time}</Text>
                            </View>
                        </View>

                        {/* Client Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>CLIENT</Text>
                            <Text style={styles.sectionValue}>{appointment.client_name}</Text>
                        </View>

                        {/* Location Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>LOCATION</Text>
                            <Text style={styles.sectionValue}>{appointment.address}</Text>
                        </View>

                        {/* Status Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>STATUS</Text>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>{appointment.status || 'scheduled'}</Text>
                            </View>
                        </View>

                        {/* Notes Section */}
                        {appointment.notes && (
                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>NOTES</Text>
                                <Text style={styles.notesText}>"{appointment.notes}"</Text>
                            </View>
                        )}

                        {/* Footer Button */}
                        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                            <Text style={styles.closeBtnText}>Close</Text>
                        </TouchableOpacity>
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
        alignItems: 'center',
        padding: 24,
        paddingBottom: 16,
    },
    headerTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 17,
        color: ColorConstants.BLACK2,
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
    section: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 11,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    sectionValue: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 12,
        color: ColorConstants.BLACK2,
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
    },
    halfWidth: {
        flex: 1,
    },
    statusBadge: {
        backgroundColor: '#E0F2FE',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 12,
        color: '#0284C7',
    },
    notesText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 16,
        color: ColorConstants.BLACK2,
        fontStyle: 'italic',
    },
    closeBtn: {
        height: 35,
        width: 100,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        alignSelf: 'flex-end',
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3
    },
    closeBtnText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
});

export default AppointmentDetailsModal;
