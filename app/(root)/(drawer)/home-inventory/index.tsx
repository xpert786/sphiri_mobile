import { apiDelete, apiGet } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import Header from '@/components/Header';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { capitalizeFirstLetter } from '@/constants/Helper';
import AddHomeInventoryModal from '@/modals/AddHomeInventoryModal';
import DeleteConfirmationModal from '@/modals/DeleteConfirmationModal';
import HomeInventoryPreviewModal from '@/modals/HomeInventoryPreviewModal';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function HomeInventory() {
    const [inventoryItems, setInventoryItems] = useState<any[]>([]);
    const [loadingInventory, setLoadingInventory] = useState(true);
    const [showAddInventoryModal, setShowAddInventoryModal] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<any>(null);

    const [previewModalVisible, setPreviewModalVisible] = useState(false);
    const [selectedPreviewItem, setSelectedPreviewItem] = useState<any>(null);

    React.useEffect(() => {
        fetchInventory();
    }, []);



    const fetchInventory = async () => {
        try {
            setLoadingInventory(true);
            const response = await apiGet(ApiConstants.HOME_INVENTORY);
            if (response.data && response.data.results) {
                setInventoryItems(response.data.results);
            }
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setLoadingInventory(false);
        }
    };

    const confirmDelete = (item: any) => {
        setItemToDelete(item);
        setDeleteModalVisible(true);
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;

        try {
            setLoadingInventory(true);
            const url = `${ApiConstants.HOME_INVENTORY}${itemToDelete.id}/`;
            const response = await apiDelete(url);

            if (response.status === 200 || response.status === 204 || response.status === 201) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Item deleted successfully',
                });
                fetchInventory();
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to delete item',
                });
            }
        } catch (error) {
            console.error('Error deleting inventory:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Something went wrong',
            });
        } finally {
            setDeleteModalVisible(false);
            setItemToDelete(null);
            setLoadingInventory(false);
        }
    };

    const handlePreviewClick = (item: any) => {
        if (item) {
            setSelectedPreviewItem(item);
            setPreviewModalVisible(true);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title={'Home Inventory'}
                subtitle={'Track and manage your home assets or documents'}
                showBackArrow={false}
                containerStyle={{ paddingTop: 10 }}
            />

            <View style={styles.inventorySection}>
                <TouchableOpacity
                    style={styles.uploadBtn}
                    onPress={() => setShowAddInventoryModal(true)}
                >
                    <Text style={styles.uploadBtnText}>Upload File</Text>
                </TouchableOpacity>
            </View>

            {loadingInventory ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="small" color={ColorConstants.PRIMARY_BROWN} />
                </View>
            ) : (
                <FlatList
                    data={inventoryItems}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No items found</Text>
                    }
                    renderItem={({ item }) => {
                        const isImage = item.photo_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                        const hasVideo = !!item.video_url;

                        const isPdfReceipt = item.receipt_url?.toLowerCase().endsWith('.pdf');
                        const isPdfPhoto = item.photo_url?.toLowerCase().endsWith('.pdf');
                        const isPdf = isPdfReceipt || isPdfPhoto;

                        return (
                            <View style={styles.inventoryCard}>
                                <View style={[
                                    styles.imageContainer,
                                    (hasVideo || (isPdf && !isImage)) && { backgroundColor: 'transparent' }
                                ]}>
                                    {isImage ? (
                                        <Image
                                            source={{ uri: item.photo_url }}
                                            style={styles.inventoryImage}
                                        />
                                    ) : hasVideo ? (
                                        <MaterialCommunityIcons name="file-video" size={48} color="#9b2cfa" />
                                    ) :
                                        isPdf ? (
                                            <MaterialCommunityIcons name="file-pdf-box" size={48} color="#f72535" />
                                        ) : (
                                            <Image
                                                source={item.photo_url ? Icons.ic_doc : Icons.dummy_image1}
                                                style={[!item.photo_url ? styles.inventoryImage : styles.docIcon, item.photo_url && { tintColor: ColorConstants.PRIMARY_BROWN }]}
                                            />
                                        )}
                                </View>
                                <View style={styles.infoContainer}>
                                    <Text style={styles.inventoryItemName} numberOfLines={1}>{capitalizeFirstLetter(item.name)}</Text>
                                    {(item.is_high_value || item.is_insured || item.is_heirloom) && (
                                        <View style={styles.tagsContainer}>
                                            {item.is_high_value && <View style={[styles.tag, styles.highValueTag]}><Text style={[styles.tagText, styles.highValueTagText]}>High Value</Text></View>}
                                            {item.is_insured && <View style={[styles.tag, styles.insuredTag]}><Text style={[styles.tagText, styles.insuredTagText]}>Insured</Text></View>}
                                            {item.is_heirloom && <View style={[styles.tag, styles.heirloomTag]}><Text style={[styles.tagText, styles.heirloomTagText]}>Heirloom</Text></View>}
                                        </View>
                                    )}
                                </View>
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        onPress={() => handlePreviewClick(item)}
                                        style={styles.actionIconContainer}
                                    >
                                        <Image source={Icons.ic_eye} style={styles.actionIcon} />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => confirmDelete(item)}
                                        style={styles.actionIconContainer}
                                    >
                                        <Image source={Icons.ic_bin} style={styles.deleteIcon} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    }}
                />
            )}
            <AddHomeInventoryModal
                visible={showAddInventoryModal}
                onClose={() => setShowAddInventoryModal(false)}
                onSuccess={() => {
                    fetchInventory();
                    setShowAddInventoryModal(false);
                }}
            />
            <DeleteConfirmationModal
                visible={deleteModalVisible}
                onClose={() => {
                    setDeleteModalVisible(false);
                    setItemToDelete(null);
                }}
                onDelete={handleDelete}
                title={`Are you sure you want to delete ${itemToDelete?.name}?`}
            />

            <HomeInventoryPreviewModal
                visible={previewModalVisible}
                onClose={() => {
                    setPreviewModalVisible(false);
                    setSelectedPreviewItem(null);
                }}
                item={selectedPreviewItem}
            />
        </SafeAreaView>
    );
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorConstants.WHITE,
    },
    scrollContent: {
        paddingBottom: 40,
        paddingHorizontal: 20,
    },
    inventorySection: {
        marginTop: 8,
        marginHorizontal: 20,
    },
    inventoryTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 20,
        color: ColorConstants.BLACK2,
        marginBottom: 4,
    },
    inventorySubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 20,
    },
    uploadBtn: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
    uploadBtnText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.WHITE,
    },
    inventoryCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        width: '100%',
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    imageContainer: {
        width: 48,
        height: 48,
        borderRadius: 8,
        marginRight: 10,
        backgroundColor: ColorConstants.LIGHT_PEACH3,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    inventoryImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    docIcon: {
        width: 15,
        height: 15,
        resizeMode: 'contain',
    },
    infoContainer: {
        flex: 1,
        marginRight: 10,
        justifyContent: 'center',
    },
    inventoryItemName: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 6,
    },
    tag: {
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 4,
    },
    tagText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 10,
    },
    highValueTag: {
        backgroundColor: '#FEF3C7',
    },
    highValueTagText: {
        color: '#D97706',
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
    deleteIconContainer: {
        padding: 4,
    },
    deleteIcon: {
        width: 16,
        height: 16,
        tintColor: '#9CA3AF',
    },
    actionButtons: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        flexDirection: 'row',
    },
    actionIconContainer: {
        padding: 4,
        height: 35,
        width: 35,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: ColorConstants.WHITE,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.25,
        shadowRadius: 1.84,
        elevation: 4,
    },
    actionIcon: {
        width: 18,
        height: 18,
        tintColor: '#9CA3AF',
        resizeMode: 'contain'
    },
    loaderContainer: {
        width: '100%',
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 13,
        color: ColorConstants.DARK_CYAN,
        textAlign: 'center',
        width: '100%',
        padding: 20,
    },


})
