import { Icons } from '@/assets';
import CommonButton from '@/components/CommonButton';
import { ColorConstants } from '@/constants/ColorConstants';
import { StringConstants } from '@/constants/StringConstants';
import React from 'react';
import {
    Dimensions,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

type recentFiles = {
    id: number;
    title: string;
    date: string;
    fileSize: string;
    content?: string
};
interface RecentFilesModalProps {
    visible: boolean;
    onClose: () => void;
    document: recentFiles | null;
}

const RecentFilesModal: React.FC<RecentFilesModalProps> = ({ visible, document, onClose }) => {
    if (!document) return null;
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{document.title}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Image source={Icons.ic_cross} style={styles.closeIcon} />
                        </TouchableOpacity>
                    </View>
                    {/* Primary User Info */}
                    <View style={styles.section}>
                        <View style={styles.primaryUserCard}>
                            <Text style={styles.primaryUserText}>
                                {document.content}
                            </Text>
                        </View>
                    </View>

                    {/* Contact Information */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Document Information</Text>

                        <View style={styles.contactField}>
                            <Text style={styles.contactLabel}>Title</Text>
                            <Text style={styles.contactValue}>{document.title}</Text>
                        </View>

                        <View style={styles.contactField}>
                            <Text style={styles.contactLabel}>Date</Text>
                            <Text style={styles.contactValue}>{document.date}</Text>
                        </View>

                        <View style={styles.contactField}>
                            <Text style={styles.contactLabel}>Size</Text>
                            <Text style={styles.contactValue}>{document.fileSize}</Text>
                        </View>
                    </View>

                    <CommonButton
                        title={StringConstants.CONTINUE}
                        onPress={onClose}
                    />
                </View>
            </View>
        </Modal>
    );
};

const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: ColorConstants.WHITE,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 25
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: ColorConstants.GRAY3,
    },
    modalTitle: {
        fontFamily: 'SFPro-Medium',
        fontSize: 18,
        color: ColorConstants.PRIMARY_BROWN,
    },
    closeButton: {
        padding: 4,
    },
    closeIcon: {
        width: 12,
        height: 12,
    },
    contentScroll: {
        paddingHorizontal: 20,
    },
    section: {
        marginTop: 12,
    },
    sectionTitle: {
        fontFamily: 'SFPro-Medium',
        fontSize: 13,
        color: ColorConstants.BLACK,
        marginBottom: 10,
    },

    fileIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: ColorConstants.BLUE20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    fileIcon: {
        width: 20,
        height: 20,
        tintColor: ColorConstants.BLUE,
    },
    fileInfo: {
        flex: 1,
    },
    fileName: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 4,
    },
    fileMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    fileDate: {
        fontFamily: 'Inter-Regular',
        fontSize: 12,
        color: ColorConstants.GRAY,
    },
    fileSeparator: {
        fontFamily: 'Inter-Regular',
        fontSize: 12,
        color: ColorConstants.GRAY,
        marginHorizontal: 6,
    },
    fileSize: {
        fontFamily: 'Inter-Regular',
        fontSize: 12,
        color: ColorConstants.GRAY,
    },
    fileOwner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: ColorConstants.GRAY_SHADE,
        borderRadius: 8,
    },
    personIcon: {
        width: 16,
        height: 16,
        tintColor: ColorConstants.GRAY,
        marginRight: 8,
    },
    ownerName: {
        fontFamily: 'Inter-Medium',
        fontSize: 12,
        color: ColorConstants.GRAY,
    },
    primaryUserCard: {
        borderRadius: 6,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
    },
    primaryUserText: {
        fontFamily: 'Inter-Regular',
        fontSize: 12,
        color: ColorConstants.GRAY,
        lineHeight: 18,
    },
    contactField: {
        marginBottom: 16,
    },
    contactLabel: {
        fontFamily: 'SFPro-Regular',
        fontSize: 11,
        color: ColorConstants.BLACK,
        marginBottom: 8,
    },
    contactValue: {
        fontFamily: 'SFPro-Medium',
        fontSize: 11,
        color: ColorConstants.BLACK,
    },

});

export default RecentFilesModal;