import { apiGet } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type ReminderDetails = {
    id: number;
    title: string;
    description: string;
    contact_vendor_name: string | null;
    related_contact: any;
    related_contact_name?: string; // API indicates this might be present or related_contact has name
    assigned_to: number[];
    assigned_to_name: string;
    category: number;
    category_name: string;
    category_data: {
        id: number;
        name: string;
        color: string;
        icon: string;
    };
    related_document: any;
    reminder_date: string;
    reminder_time: string;
    priority: number;
    priority_display: string;
    priority_color: string;
    status: string;
    status_display: string;
    is_completed: boolean;
    can_mark_complete: boolean;
    created_at: string;
    updated_at: string;
};

type TaskReminderModalProps = {
    visible: boolean;
    onClose: () => void;
    task: any; // partial reminder object from list
    onMarkComplete?: () => void;
};

const TaskReminderModal: React.FC<TaskReminderModalProps> = ({
    visible,
    onClose,
    task,
    onMarkComplete,
}) => {
    const [loading, setLoading] = useState(false);
    const [reminderDetails, setReminderDetails] = useState<ReminderDetails | null>(null);

    useEffect(() => {
        if (visible && task?.id) {
            fetchReminderDetails();
        } else {
            setReminderDetails(null);
        }
    }, [visible, task]);

    const fetchReminderDetails = async () => {
        setLoading(true);
        try {
            const response = await apiGet(`${ApiConstants.SHARED_REMINDER_DETAILS}${task.id}/`);
            setReminderDetails(response.data);
        } catch (error) {
            console.error('Error fetching reminder details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!task) return null;

    const displayData = reminderDetails || task;

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <Text style={styles.title}>{displayData.title || 'Reminder Details'}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Image source={Icons.ic_cross} style={styles.closeIcon} />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color={ColorConstants.DARK_CYAN} style={{ marginVertical: 20 }} />
                    ) : (
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Details Card */}
                            <View style={styles.detailsCard}>
                                <DetailItem label="Description" value={displayData.description || 'N/A'} />
                                {/* <DetailItem label="Contact/Vendor" value={displayData.contact_vendor_name || displayData.related_contact_name || 'N/A'} /> */}
                                <DetailItem label="Assigned To" value={displayData.assigned_to_name || 'N/A'} />
                                <DetailItem label="Category" value={displayData.category_name || 'N/A'} />

                                {/* Related Document Button - Only show if related_document exists if logic requires, otherwise assume static based on design or API response if present */}
                                {displayData.related_document && (
                                    <View style={styles.detailItem}>
                                        <Text style={styles.detailLabel}>Related Document</Text>
                                        <TouchableOpacity style={styles.documentButton}>
                                            <Image source={Icons.ic_download} style={styles.documentIcon} />
                                            <Text style={styles.documentText}>{'Document'}</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                <DetailItem label="Due Date" value={displayData.reminder_date || 'N/A'} />

                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Priority</Text>
                                    <View style={[styles.priorityPill, { backgroundColor: displayData.priority_color || ColorConstants.ORANGE }]}>
                                        <Text style={styles.priorityText}>{displayData.priority_display || 'Medium'}</Text>
                                    </View>
                                </View>

                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Status</Text>
                                    <View style={styles.statusPill}>
                                        <Text style={styles.statusText}>{displayData.status_display || 'Pending'}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Footer Buttons */}
                            <View style={styles.footer}>
                                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>

                                {!displayData.is_completed && (
                                    <TouchableOpacity style={styles.Downloadbutton} onPress={onMarkComplete}>
                                        <Text style={styles.Downloadtext}>Mark as Complete</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </ScrollView>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const DetailItem = ({ label, value }: { label: string, value: string }) => (
    <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 16,
        padding: 20,
        width: '100%',
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    title: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 22,
        color: ColorConstants.BLACK2,
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.BLACK2,
        lineHeight: 15,
    },
    closeButton: {
        padding: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 20,
    },
    closeIcon: {
        width: 10,
        height: 10,
        resizeMode: 'contain',
        tintColor: ColorConstants.BLACK2,
    },
    detailsCard: {
        backgroundColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        gap: 16,
    },
    detailItem: {
        gap: 6,
    },
    detailLabel: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
    },
    detailValue: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    documentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ColorConstants.WHITE,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20, // Pill shape
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    documentIcon: {
        width: 10,
        height: 10,
        resizeMode: 'contain',
        marginRight: 6,
        tintColor: ColorConstants.BLACK2,
    },
    documentText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 12,
        color: ColorConstants.BLACK2,
    },
    priorityPill: {
        alignSelf: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderRadius: 16,
    },
    priorityHigh: { backgroundColor: ColorConstants.RED },
    priorityMedium: { backgroundColor: ColorConstants.ORANGE },
    priorityLow: { backgroundColor: ColorConstants.GREEN },
    priorityText: {
        fontFamily: Fonts.interMedium,
        fontSize: 12,
        color: ColorConstants.WHITE,
    },
    statusPill: {
        alignSelf: 'flex-start',
        backgroundColor: '#E6DCCF',
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderRadius: 16,
    },
    statusText: {
        fontFamily: Fonts.interMedium,
        fontSize: 12,
        color: ColorConstants.BLACK2,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 12,
        marginTop: 10,
    },
    cancelButton: {
        // paddingVertical: 10,
        // paddingHorizontal: 20,
        width: 78,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        height: 33, // Match CommonButton height if possible
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.DARK_CYAN,
        textAlign: 'center'
    },
    Downloadbutton: {
        // paddingVertical: 10,
        // paddingHorizontal: 40,
        width: 156,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        height: 33,
        justifyContent: 'center',
        backgroundColor: ColorConstants.PRIMARY_BROWN,
    },
    Downloadtext: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.WHITE,
        textAlign: 'center'
    },

    completeButton: {
        marginTop: 0,
        marginBottom: 0,
        height: 44,
        paddingHorizontal: 20,
        borderRadius: 8,
    }
});

export default TaskReminderModal;
