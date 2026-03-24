import { apiPost } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import CustomTextInput from '@/components/CustomTextInput';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface CreateNewFolderModalProps {
    visible: boolean;
    onClose: () => void;
    onCreate: (folderData: any) => void;
}

const CATEGORIES = [
    { label: 'Insurance Policies', value: 'insurance' },
    { label: 'Warranties & Maintenance', value: 'warranty' },
    { label: 'Family Records', value: 'family' },
    { label: 'Estate Planning', value: 'estate' },
];


const CreateNewFolderModal: React.FC<CreateNewFolderModalProps> = ({
    visible,
    onClose,
    onCreate
}) => {
    const [folderName, setFolderName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [showParentDropdown, setShowParentDropdown] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleClose = () => {
        setFolderName('');
        setDescription('');
        setCategory('');
        setShowCategoryDropdown(false);
        onClose();
    };

    const handleCreate = async () => {
        if (!folderName.trim()) {
            Alert.alert('Error', 'Please enter a folder name');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name: folderName,
                description: description,
            };

            console.log('Creating folder with payload:', payload);
            const response = await apiPost(ApiConstants.HOMEOWNER_DOCUMENT_CATEGORIES, payload);
            console.log('Create folder response:', response.status, response.data);

            if (response.status === 201 || response.status === 200) {
                onCreate(response.data);
                handleClose();
            } else {
                const errorMsg = response.data?.message || 'Failed to create folder. Please try again.';
                Alert.alert('Error', errorMsg);
            }
        } catch (error: any) {
            console.error('Create Folder Error details:', error.response?.data || error.message);

            let errorMessage = 'Something went wrong. Please try again.';
            const serverData = error.response?.data;

            if (serverData) {
                if (typeof serverData === 'string') {
                    errorMessage = serverData;
                } else if (typeof serverData === 'object') {
                    // Handle Django REST framework style field errors
                    const fieldErrors = Object.entries(serverData)
                        .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                        .join('\n');
                    errorMessage = fieldErrors || errorMessage;
                }
            }

            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <ScrollView bounces={false} contentContainerStyle={styles.scrollContent}>
                        <View style={styles.content}>
                            <View style={styles.header}>
                                <View style={styles.headerTextContainer}>
                                    <Text style={styles.headerTitle}>Create New Folder</Text>
                                    <Text style={styles.headerSubtitle}>Create a new folder to organize your documents</Text>
                                </View>
                                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                                    <Image source={Icons.ic_cross} style={styles.closeIcon} />
                                </TouchableOpacity>
                            </View>

                            <View >
                                <CustomTextInput
                                    label="Folder Name"
                                    value={folderName}
                                    onChangeText={setFolderName}
                                    placeholder="e.g., Insurance Policy"
                                    parentStyles={styles.inputSpacing}
                                />

                                {/* <View style={[styles.inputGroup, { zIndex: 2000 }]}>
                                    <Text style={styles.label}>Category</Text>
                                    <TouchableOpacity
                                        style={styles.dropdownTrigger}
                                        onPress={() => {
                                            setShowCategoryDropdown(!showCategoryDropdown);
                                            setShowParentDropdown(false);
                                        }}
                                    >
                                        <Text style={[styles.dropdownValue, !category && { color: ColorConstants.GRAY }]}>
                                            {category ? CATEGORIES.find(c => c.value === category)?.label : 'Select Category'}
                                        </Text>
                                        <Image source={Icons.ic_down_arrow} style={styles.dropdownIcon} resizeMode="contain" />
                                    </TouchableOpacity>
                                    {showCategoryDropdown && (
                                        <View style={styles.dropdownList}>
                                            {CATEGORIES.map((item, index) => (
                                                <TouchableOpacity
                                                    key={item.value}
                                                    style={[
                                                        styles.dropdownItem,
                                                        index === CATEGORIES.length - 1 && { borderBottomWidth: 0 }
                                                    ]}
                                                    onPress={() => {
                                                        setCategory(item.value);
                                                        setShowCategoryDropdown(false);
                                                    }}
                                                >
                                                    <Text style={styles.dropdownItemText}>{item.label}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View> */}

                                <CustomTextInput
                                    label="Description"
                                    value={description}
                                    onChangeText={setDescription}
                                    placeholder="Enter folder description"
                                    parentStyles={styles.inputSpacing}
                                    multiline={true}
                                />

                                {/* Spacer to prevent dropdown cutting off */}
                                {showCategoryDropdown && <View style={styles.dropdownSpacer} />}
                            </View>

                            <View style={styles.footer}>
                                <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                                    <Text style={styles.cancelBtnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                                    onPress={handleCreate}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color={ColorConstants.WHITE} size="small" />
                                    ) : (
                                        <Text style={styles.submitBtnText}>Create Folder</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
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
        maxHeight: '90%',
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        padding: 24,
        paddingBottom: 40, // Extra padding at bottom
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        paddingBottom: 20,
    },
    headerTextContainer: {
        flex: 1,
        paddingRight: 10,
    },
    headerTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 22,
        color: ColorConstants.BLACK2,
    },
    headerSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
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

    inputSpacing: {
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 20,
        position: 'relative',
    },
    label: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        marginBottom: 6,
    },
    dropdownTrigger: {
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12
    },
    dropdownValue: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 13,
        color: ColorConstants.DARK_CYAN,
    },
    dropdownIcon: {
        width: 14,
        height: 14,
        tintColor: ColorConstants.GRAY,
    },
    dropdownList: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: ColorConstants.WHITE,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 12,
        marginTop: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    dropdownSpacer: {
        height: 80,
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    dropdownItemText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 15,
        color: ColorConstants.BLACK2,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    cancelBtn: {
        height: 40,
        paddingHorizontal: 12,
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
    submitBtn: {
        height: 40,
        paddingHorizontal: 12,
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitBtnText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.WHITE,
    },
});

export default CreateNewFolderModal;
