import { apiPost } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import React, { useState } from 'react';
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
import Toast from 'react-native-toast-message';

interface CreateBackupModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const BACKUP_ITEMS = [
    {
        id: 'include_contacts',
        title: 'Contacts',
        subtitle: 'Enabled on this device',
    },
    {
        id: 'include_documents',
        title: 'Documents',
        subtitle: 'All your uploaded documents',
    },
    {
        id: 'include_reminders',
        title: 'Reminders',
        subtitle: 'All your reminders and tasks',
    },
    {
        id: 'include_settings',
        title: 'Settings',
        subtitle: 'Your account settings and preferences',
    },
];

const CreateBackupModal: React.FC<CreateBackupModalProps> = ({
    visible,
    onClose,
    onSuccess
}) => {
    const [selectedItems, setSelectedItems] = useState<string[]>([
        'include_contacts',
        'include_documents',
        'include_reminders',
        'include_settings'
    ]);
    const [loading, setLoading] = useState(false);

    const toggleItem = (id: string) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleCreate = async () => {
        if (selectedItems.length === 0) {
            Toast.show({
                type: 'error',
                text1: 'Selection Required',
                text2: 'Please select at least one item to backup'
            });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                include_contacts: selectedItems.includes('include_contacts'),
                include_documents: selectedItems.includes('include_documents'),
                include_reminders: selectedItems.includes('include_reminders'),
                include_settings: selectedItems.includes('include_settings'),
            };

            const response = await apiPost(`${ApiConstants.SETTINGS_BACKUP}create/`, payload);
            if (response.status === 200 || response.status === 201) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: response.data.message || 'Backup created successfully'
                });
                onSuccess();
            }
        } catch (error) {
            console.error('Error creating backup:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to create backup'
            });
        } finally {
            setLoading(false);
        }
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
                        <View>
                            <Text style={styles.headerTitle}>Create Backup</Text>
                            <Text style={styles.headerSubtitle}>Select what you want to include in your backup</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Image source={Icons.ic_cross} style={styles.closeIcon} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        <View style={styles.itemsContainer}>
                            {BACKUP_ITEMS.map((item) => {
                                const isSelected = selectedItems.includes(item.id);
                                return (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={[styles.itemCard, isSelected && styles.itemCardSelected]}
                                        onPress={() => toggleItem(item.id)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                                            {isSelected && (
                                                <Image source={Icons.ic_checkbox_selected} style={styles.tickIcon} />
                                            )}
                                        </View>
                                        <View style={styles.itemInfo}>
                                            <Text style={styles.itemTitle}>{item.title}</Text>
                                            <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Footer Buttons */}
                        <View style={styles.footer}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={loading}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.createBtn} onPress={handleCreate} disabled={loading}>
                                {loading ? (
                                    <ActivityIndicator color={ColorConstants.WHITE} size="small" />
                                ) : (
                                    <Text style={styles.createBtnText}>Create Backup</Text>
                                )}
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
        maxHeight: '80%',
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: ColorConstants.GRAY3,
    },
    headerTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 22,
        color: ColorConstants.BLACK2,
    },
    headerSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 13,
        color: ColorConstants.BLACK2,
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
        padding: 24,
    },
    itemsContainer: {
        gap: 16,
        marginBottom: 24,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: ColorConstants.WHITE,
    },
    itemCardSelected: {
        borderColor: ColorConstants.PRIMARY_BROWN,
        backgroundColor: '#FCF9F9',
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    checkboxSelected: {
        borderColor: ColorConstants.PRIMARY_BROWN,
    },
    tickIcon: {
        width: 22,
        height: 22,
    },
    itemInfo: {
        flex: 1,
    },
    itemTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.BLACK2,
    },
    itemSubtitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 10,
        color: ColorConstants.DARK_CYAN,
        marginTop: 2,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    cancelBtn: {
        height: 44,
        width: 78,
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
    createBtn: {
        height: 44,
        width: 133,
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    createBtnText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.WHITE,
    },
});

export default CreateBackupModal;
