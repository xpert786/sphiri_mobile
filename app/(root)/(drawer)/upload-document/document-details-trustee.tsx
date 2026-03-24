import { apiDelete, apiGet, apiPut } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import Header from '@/components/Header';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { handleDownload } from '@/constants/Helper';
import DeleteConfirmationModal from '@/modals/DeleteConfirmationModal';
import DocumentPreviewModal from '@/modals/DocumentPreviewModal';
import EditDocumentModal from '@/modals/EditDocumentModal';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, BackHandler, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

interface DocumentDetails {
    id: number;
    title: string;
    description: string;
    file: string;
    file_url: string;
    file_type: string;
    file_size_display: string;
    tags: string;
    tags_list?: string[];
    category_name: string;
    folder_name: string;
    linked_contact_name: string | null;
    issue_date: string;
    expiration_date: string;
    status: string;
    uploaded_by: string;
    can_download: boolean;
    can_edit: boolean;
    can_delete: boolean;
    created_at: string;
    linked_family_members: string[];
}


export default function DocumentDetailsTrustee() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [activeAction, setActiveAction] = useState<
        'view' | 'edit' | 'download' | 'delete' | ''
    >('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [deleteConfig, setDeleteConfig] = useState({ title: '' });
    const [docDetails, setDocDetails] = useState<DocumentDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);


    const fileName = (params.title as string) || (docDetails?.title) || 'Homeowners_Policy_2025';

    const fetchDocumentDetails = async () => {
        if (!params.id) return;
        setIsLoading(true);
        try {
            const response = await apiGet(`${ApiConstants.BASE_URL}${ApiConstants.SHARED_DOCUMENTS_LIST}${params.id}/`);
            console.log("response in fetchDocumentDetails:", response.data);

            setDocDetails(response.data);
        } catch (error) {
            console.error("Error fetching document details:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchDocumentDetails();
        }, [params.id])
    );

    React.useEffect(() => {
        if (params.action === 'edit' && docDetails?.can_edit) {
            setShowEditModal(true);
            setActiveAction('edit');
            // Optional: Remove param to prevent reopening on generic updates?
            // For now, relying on user closing it.
            router.setParams({ action: '' });
        }
    }, [docDetails, params.action]);

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () =>
                subscription.remove();
        }, [])
    );

    const tapOnDelete = async () => {
        console.log('tapOnDelete...');
        setShowDeleteModal(false);
        let url = ApiConstants.BASE_URL + ApiConstants.SHARED_DOCUMENTS_LIST + docDetails?.id + '/'
        try {
            const response = await apiDelete(url);
            Toast.show({
                type: 'success',
                text1: 'Document deleted successfully',
            })
            router.push('/(root)/(drawer)/upload-document')
        } catch (error) {
            console.error("Error fetching document details:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const tapOnDownloadIcon = async () => {
        setActiveAction('download');
        if (!docDetails?.file_url) return;
        else {
            handleDownload(docDetails.file_url)
            setActiveAction('');
        }
    };

    console.log("docDetails", docDetails);

    const getPermissionText = () => {
        const permissions = [];

        if (docDetails?.can_edit) permissions.push('edit');
        if (docDetails?.can_download) permissions.push('download');
        if (docDetails?.can_delete) permissions.push('delete');

        if (permissions.length === 0) {
            return ' You have no permissions.';
        }

        return ` You have ${permissions.join(', ')} permission${permissions.length > 1 ? 's' : ''}.`;
    };

    const handleSaveDocument = async (payload: any) => {
        console.log('Saving document payload:', payload);
        if (!docDetails?.id) return;

        setIsLoading(true);
        try {
            const url = `${ApiConstants.BASE_URL}${ApiConstants.SHARED_DOCUMENTS_LIST}${docDetails.id}/`;
            console.log("docDetails.id", docDetails.id);
            console.log("body in edit document", JSON.stringify(payload));


            await apiPut(url, payload);

            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Document updated successfully',
            });

            setShowEditModal(false);
            setActiveAction('');
            fetchDocumentDetails();
        } catch (error) {
            console.error("Error updating document:", error);
            Toast.show({
                type: 'error',
                text1: 'Update Failed',
                text2: 'Something went wrong while updating the document.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title={fileName}
                showBackArrow={true}
                titleStyles={styles.headerTitle}
                tapOnBack={() => router.push('/(root)/(drawer)/upload-document')}
            />

            {isLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={ColorConstants.PRIMARY_BROWN} />
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

                    {/* Action Bar */}
                    <View style={styles.actionBar}>

                        {/* VIEW */}
                        <TouchableOpacity
                            style={[
                                styles.iconButton,
                                activeAction === 'view' && styles.iconButtonActive
                            ]}
                            onPress={() => {
                                setActiveAction('view');
                                setShowPreviewModal(true);
                            }}
                            activeOpacity={0.8}
                        >
                            <Image
                                source={Icons.ic_eye}
                                style={[
                                    styles.actionIcon,
                                    activeAction === 'view' && styles.actionIconActive
                                ]}
                            />
                        </TouchableOpacity>

                        {/* EDIT */}
                        {docDetails?.can_edit && (
                            <TouchableOpacity
                                style={[
                                    styles.iconButton,
                                    activeAction === 'edit' && styles.iconButtonActive
                                ]}
                                onPress={() => {
                                    setActiveAction('edit');
                                    setShowEditModal(true);
                                }}
                            >
                                <Image
                                    source={Icons.ic_edit2}
                                    style={[
                                        styles.actionIcon,
                                        activeAction === 'edit' && styles.actionIconActive
                                    ]}
                                />
                            </TouchableOpacity>
                        )}

                        {/* DOWNLOAD */}
                        {docDetails?.can_download && (
                            <TouchableOpacity
                                style={[
                                    styles.iconButton,
                                    activeAction === 'download' && styles.iconButtonActive
                                ]}
                                onPress={tapOnDownloadIcon}
                            >
                                <Image
                                    source={Icons.ic_downloads}
                                    style={[
                                        styles.actionIcon,
                                        activeAction === 'download' && styles.actionIconActive
                                    ]}
                                />
                            </TouchableOpacity>
                        )}

                        {/* DELETE */}
                        {docDetails?.can_delete && (
                            <TouchableOpacity
                                style={[
                                    styles.iconButton,
                                    activeAction === 'delete' && styles.iconButtonActive
                                ]}
                                onPress={() => {
                                    setActiveAction('delete')
                                    setDeleteConfig({
                                        title: `Are you sure you want to delete ${fileName} document?`,
                                    });
                                    setShowDeleteModal(true);
                                }}
                            >
                                <Image
                                    source={Icons.ic_bin2}
                                    style={[
                                        styles.actionIcon,
                                        activeAction === 'delete' && styles.actionIconActive
                                    ]}
                                />
                            </TouchableOpacity>
                        )}

                    </View>

                    <View style={styles.card}>

                        <View style={styles.topCard}>
                            <View style={[styles.innerView, { marginBottom: 10 }]}>
                                <View>
                                    <Text style={styles.label}>Status</Text>
                                    <View style={styles.statusTagsView}>
                                        <Text style={styles.value}>{docDetails?.status ? (docDetails.status.charAt(0).toUpperCase() + docDetails.status.slice(1)) : 'Shared'}</Text>
                                    </View>
                                </View>
                                <View style={styles.rightLabels}>
                                    <Text style={styles.label}>Uploaded By</Text>
                                    <Text style={styles.value}>{docDetails?.uploaded_by || 'N/A'}</Text>
                                </View>
                            </View>
                            <View style={styles.innerView}>
                                <View>
                                    <Text style={styles.label}>File Type</Text>
                                    <View style={[styles.statusTagsView, styles.fileTypeTag]}>
                                        <Text style={styles.value}>{docDetails?.file_type || 'N/A'}</Text>
                                    </View>
                                </View>
                                <View style={styles.rightLabels}>
                                    <Text style={styles.label}>File Size</Text>
                                    <Text style={styles.value}>{docDetails?.file_size_display || 'N/A'}</Text>
                                </View>
                            </View>
                        </View>
                        <Text style={styles.sectionTitle}>Note</Text>
                        <Text style={styles.sectionContent}>{docDetails?.description || 'No note available.'}</Text>
                        <View style={styles.separator} />
                        <View style={styles.section}>
                            <Text style={styles.sectionMainTitle}>Document Information</Text>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Document Title</Text>
                                <Text style={styles.infoValue}>{docDetails?.title || 'N/A'}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Category</Text>
                                <Text style={styles.infoValue}>{docDetails?.category_name || 'N/A'}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Linked Contact</Text>
                                <Text style={styles.infoValue}>{docDetails?.linked_family_members?.map((contact: any) => contact).join(', ') || 'N/A'}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Tags</Text>
                                <View style={styles.tagsRow}>
                                    {(() => {
                                        // Use tags_list (array of names) first, fall back to tags string only if tags_list is empty
                                        const tags = Array.isArray(docDetails?.tags_list) && docDetails.tags_list.length > 0
                                            ? docDetails.tags_list
                                            : (typeof docDetails?.tags === 'string' && docDetails.tags
                                                ? docDetails.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
                                                : []);

                                        if (tags.length > 0) {
                                            return tags.map((tag: any, index: number) => (
                                                <View key={index} style={styles.tag}>
                                                    <Text style={styles.tagText}>{typeof tag === 'object' ? (tag.name || tag.title) : tag}</Text>
                                                </View>
                                            ));
                                        }
                                        return <Text style={styles.infoValue}>N/A</Text>;
                                    })()}
                                </View>
                            </View>



                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Issue Date</Text>
                                <Text style={styles.infoValue}>{docDetails?.issue_date || 'N/A'}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Expiration Date</Text>
                                <Text style={styles.infoValue}>{docDetails?.expiration_date || 'N/A'}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Folder</Text>
                                <Text style={styles.infoValue}>{docDetails?.folder_name || 'N/A'}</Text>
                            </View>


                        </View>
                    </View>

                    <View style={styles.policyBox}>
                        <View style={styles.policyHeader}>
                            <Image source={Icons.ic_info} style={styles.policyIcon} />
                            <Text style={styles.policyTitle}>Your Access Level</Text>
                        </View>
                        <Text style={styles.policyText}>
                            This document is shared with you.{getPermissionText()}
                        </Text>
                    </View>

                </ScrollView>
            )}


            <DeleteConfirmationModal
                visible={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onDelete={tapOnDelete}
                title={deleteConfig.title}
            />

            <DocumentPreviewModal
                visible={showPreviewModal}
                onClose={() => setShowPreviewModal(false)}
                fileName={fileName}
                previewUrl={docDetails?.file_url}
            />

            <EditDocumentModal
                visible={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setActiveAction('');
                }}
                onSave={handleSaveDocument}
                initialData={{
                    title: docDetails?.title || fileName,
                    category: docDetails?.category_name || '',
                    folder: docDetails?.folder_name || '',
                    issueDate: docDetails?.issue_date || '',
                    expirationDate: docDetails?.expiration_date || '',
                    note: docDetails?.description || '',
                    uploadedBy: docDetails?.uploaded_by || '',
                    uploadedDate: docDetails?.created_at?.split('T')[0] || '',
                    fileSize: docDetails?.file_size_display || '',
                    status: docDetails?.status || '',
                    fileType: docDetails?.file_type || '',
                    tags: (docDetails?.tags_list && docDetails.tags_list.length > 0) ? docDetails.tags_list : (docDetails?.tags || ''),
                    linked_contact: (docDetails as any)?.linked_family_members || [],
                    linked_contact_ids: (docDetails as any)?.linked_family_members_ids || []
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorConstants.WHITE,
    },
    headerTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        color: ColorConstants.BLACK2,
    },
    actionBar: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        marginBottom: 16,
        gap: 12,
        marginTop: 20
    },
    iconButton: {
        width: 44,
        height: 30,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    iconButtonActive: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        borderColor: ColorConstants.PRIMARY_BROWN,
    },
    actionIconActive: {
        tintColor: ColorConstants.WHITE,
    },
    actionIcon: {
        width: 15,
        height: 15,
        resizeMode: 'contain',
        tintColor: ColorConstants.BLACK2,
    },

    // Tabs
    tabScrollContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },

    tabContainer: {
        flexDirection: 'row',
        backgroundColor: ColorConstants.LIGHT_PEACH,
        borderRadius: 8,
        padding: 4,
    },

    tabButton: {
        minWidth: 70,
        paddingVertical: 6,
        paddingHorizontal: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
    },

    tabButtonActive: {
        backgroundColor: ColorConstants.WHITE,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },

    tabText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },

    tabTextActive: {
        fontFamily: Fonts.ManropeSemiBold,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 20,
        marginHorizontal: 20,
    },
    topCard: {
        backgroundColor: ColorConstants.GRAY3,
        borderRadius: 10,
        padding: 18,
        marginBottom: 15

    },
    innerView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN
    },
    value: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 12,
        color: ColorConstants.BLACK2
    },
    rightLabels: {
        width: '50%'
    },
    statusTagsView: {
        backgroundColor: ColorConstants.WHITE,
        paddingVertical: 2,
        paddingHorizontal: 11,
        borderRadius: 12,
        marginTop: 6
    },
    fileTypeTag: {
        backgroundColor: ColorConstants.LIGHT_PEACH

    },

    // Section Styles
    section: {
        marginBottom: 0,
    },
    sectionTitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 16,
        color: '#666',
        marginBottom: 4,
    },
    sectionContent: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    separator: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 16,
    },
    sectionMainTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 16,
        color: ColorConstants.BLACK2,
        marginBottom: 15
    },

    // Info Rows
    infoRow: {
        marginBottom: 16,
    },
    infoLabel: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 4,
    },
    infoValue: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    badge: {
        backgroundColor: ColorConstants.LIGHT_PEACH,
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 12,
    },
    badgeText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 12,
        color: ColorConstants.BLACK,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 4,
    },
    tag: {
        backgroundColor: '#E5E7EB',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    tagText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 12,
        color: ColorConstants.BLACK2,
    },

    policyBox: {
        backgroundColor: ColorConstants.ORANGE10,
        borderWidth: 1,
        borderColor: ColorConstants.ORANGE,
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 20,
        marginTop: 20
    },
    policyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    policyIcon: {
        marginRight: 12,
        marginTop: 2
    },
    policyTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 16,
        color: ColorConstants.BLACK2,
    },
    policyText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        lineHeight: 20,
    },

});
