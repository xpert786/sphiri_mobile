import { apiDelete, apiGet, apiPatch } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import Header from '@/components/Header';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import AddTrusteeModal from '@/modals/AddTrusteeModal';
import DeleteConfirmationModal from '@/modals/DeleteConfirmationModal';
import DocumentPreviewModal from '@/modals/DocumentPreviewModal';
import EditDocumentModal from '@/modals/EditDocumentModal';
import RemoveTrusteeModal from '@/modals/RemoveTrusteeModal';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

type TabOption = 'Overview' | 'Versions' | 'Legacy Access' | 'Search';

interface DocumentDetailsData {
    id: number;
    title: string;
    file_url: string;
    file_type: string;
    file_size_display: string;
    version: number;
    description: string;
    category_name: string;
    folder_name: string;
    issue_date: string;
    expiration_date: string;
    tag_names?: string[];
    tags: string;
    created_at: string;
    updated_at: string;
    linked_family_members?: any[];
    linked_vendors?: any[];
    linked_personal_contacts?: any[];
}

interface DocumentVersion {
    id: number;
    title: string;
    file_url: string;
    file_size_display: string;
    version: number;
    uploaded_by: string;
    created_at: string;
}

interface Trustee {
    id: number;
    name: string;
    email: string;
    role_display: string;
    access_trigger_display: string;
}

interface LegacyAccessData {
    document_id: number;
    document_title: string;
    primary_trustees: Trustee[];
    secondary_trustees: Trustee[];
    total_count: number;
}

export default function DocumentDetails() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState<TabOption>('Overview');
    const [activeAction, setActiveAction] = useState<
        'view' | 'edit' | 'download' | 'delete' | ''
    >('');
    const [showAddTrusteeModal, setShowAddTrusteeModal] = useState(false);
    const [editingLegacyAccessId, setEditingLegacyAccessId] = useState<number | null>(null);
    const [editingTrusteeInitialValues, setEditingTrusteeInitialValues] = useState<any>(null);
    const [showRemoveTrusteeModal, setShowRemoveTrusteeModal] = useState(false);
    const [removingTrustee, setRemovingTrustee] = useState<{ id: number; name: string } | null>(null);
    const [isRemovingTrustee, setIsRemovingTrustee] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [deleteConfig, setDeleteConfig] = useState({ title: '' });

    const [documentDetails, setDocumentDetails] = useState<DocumentDetailsData | null>(null);
    const [versions, setVersions] = useState<DocumentVersion[]>([]);
    const [legacyAccess, setLegacyAccess] = useState<LegacyAccessData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);

    const fileName = (params.title as string) || (documentDetails?.title) || 'Document Details';
    const documentId = params.id as string;

    useEffect(() => {
        console.log('documentId:', documentId);
        if (documentId) {
            fetchData();
        } else {
            console.warn('No documentId provided in params');
            setIsLoading(false);
        }
    }, [documentId]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [detailsRes, versionsRes, legacyRes] = await Promise.all([
                apiGet(`${ApiConstants.HOMEOWNER_DOCUMENTS}${documentId}/`),
                apiGet(`${ApiConstants.HOMEOWNER_DOCUMENTS}${documentId}/versions/`),
                apiGet(`${ApiConstants.HOMEOWNER_DOCUMENTS}${documentId}/legacy-access/`),
            ]);

            if (detailsRes.status === 200) setDocumentDetails(detailsRes.data);
            if (versionsRes.status === 200) setVersions(versionsRes.data);
            if (legacyRes.status === 200) setLegacyAccess(legacyRes.data);
        } catch (error) {
            console.error('Error fetching document details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditTrustee = async (legacyAccessId: number) => {
        try {
            const res = await apiGet(
                `${ApiConstants.HOMEOWNER_DOCUMENTS}${documentId}/legacy-access/${legacyAccessId}/`
            );
            if (res.status === 200) {
                setEditingLegacyAccessId(legacyAccessId);
                setEditingTrusteeInitialValues(res.data);
                setShowAddTrusteeModal(true);
            }
        } catch (error) {
            console.error('Error fetching legacy access trustee:', error);
        }
    };

    const openRemoveTrusteeModal = (id: number, name: string) => {
        setRemovingTrustee({ id, name });
        setShowRemoveTrusteeModal(true);
    };

    const handleRemoveTrustee = async () => {
        if (!removingTrustee) return;
        try {
            setIsRemovingTrustee(true);
            const res = await apiDelete(
                `${ApiConstants.HOMEOWNER_DOCUMENTS}${documentId}/legacy-access/${removingTrustee.id}/`
            );

            const message =
                (res?.data && (res.data.message || res.data.detail)) ||
                `Trustee "${removingTrustee.name}" has been removed successfully`;

            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: message,
            });

            setShowRemoveTrusteeModal(false);
            setRemovingTrustee(null);
            fetchData();
        } catch (error) {
            console.error('Error removing trustee:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to remove trustee. Please try again.',
            });
        } finally {
            setIsRemovingTrustee(false);
        }
    };

    const handlePreview = async () => {
        setActiveAction('view');
        try {
            const response = await apiGet(`${ApiConstants.HOMEOWNER_DOCUMENTS}${documentId}/preview/`);
            if (response.status === 200) {
                setPreviewData(response.data);
                setShowPreviewModal(true);
            }
        } catch (error) {
            console.error('Error fetching preview data:', error);
        }
    };

    const handleDownload = async () => {
        setActiveAction('download');
        try {
            const response = await apiGet(`${ApiConstants.HOMEOWNER_DOCUMENTS}${documentId}/download/`);
            if (response.status === 200 && response.data?.file_url) {
                Linking.openURL(response.data.file_url).catch(err => {
                    console.error('Failed to open download URL:', err);
                });
            }
        } catch (error) {
            console.error('Error fetching download URL:', error);
        }
    };

    const handleDeleteDocument = async () => {
        try {
            setIsDeleting(true);
            const response = await apiDelete(`${ApiConstants.HOMEOWNER_DOCUMENTS}${documentId}/`);
            
            // Check for 204 No Content or 200 Success
            if (response.status === 204 || response.status === 200) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Document deleted successfully',
                });
                setShowDeleteModal(false);
                router.push('/(root)/(drawer)/upload-document');
            }
        } catch (error) {
            console.error('Error deleting document:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to delete document. Please try again.',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const renderOverview = () => (
        <View style={styles.card}>
            <Text style={styles.sectionTitle}>Note</Text>
            <Text style={styles.sectionContent}>{documentDetails?.description || 'No Notes available'}</Text>
            <View style={styles.separator} />
            <View style={styles.section}>
                <Text style={styles.sectionMainTitle}>Document Information</Text>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Document Title</Text>
                    <Text style={styles.infoValue}>{documentDetails?.title || 'No Title available'}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Category</Text>
                    <Text style={styles.infoValue}>{documentDetails?.category_name || 'No Category available'}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>File Type</Text>
                    <Text style={styles.infoValue}>{documentDetails?.file_type || "No File Type available"}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>File Size</Text>
                    <Text style={styles.infoValue}>{documentDetails?.file_size_display || 'No File Size available'}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Issue Date</Text>
                    <Text style={styles.infoValue}>{documentDetails?.issue_date || 'No Issue Date available'}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Expiration Date</Text>
                    <Text style={styles.infoValue}>{documentDetails?.expiration_date || 'No Expiration Date available'}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Folder</Text>
                    <Text style={styles.infoValue}>{documentDetails?.folder_name || 'No Folder available'}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Tags</Text>
                    <View style={styles.tagsRow}>
                        {(() => {
                            const tags = Array.isArray(documentDetails?.tag_names) && documentDetails.tag_names.length > 0
                                ? documentDetails.tag_names
                                : (typeof documentDetails?.tags === 'string' && documentDetails.tags
                                    ? documentDetails.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
                                    : []);

                            if (tags.length > 0) {
                                return tags.map((tag, index) => (
                                    <View key={index} style={styles.tag}>
                                        <Text style={styles.tagText}>{tag}</Text>
                                    </View>
                                ));
                            }
                            return <Text style={styles.infoValue}>No tags</Text>;
                        })()}
                    </View>
                </View>

                {/* Linked Family Member */}
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Linked Family Member</Text>
                    <View style={styles.tagsRow}>
                        {documentDetails?.linked_family_members && documentDetails.linked_family_members.length > 0 ? (
                            documentDetails.linked_family_members.map((member, index) => (
                                <View key={index} style={styles.familyChipView}>
                                    <Text style={styles.familyText}>{typeof member === 'object' ? member.name : member}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.infoValue}>No family members linked</Text>
                        )}
                    </View>
                </View>

                {/* Linked Professional contact */}
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Linked Professional contact</Text>
                    <View style={styles.tagsRow}>
                        {documentDetails?.linked_vendors && documentDetails.linked_vendors.length > 0 ? (
                            documentDetails.linked_vendors.map((vendor, index) => (
                                <View key={index} style={styles.professionalChipView}>
                                    <Text style={styles.professionalText}>{typeof vendor === 'object' ? vendor.name : vendor}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.infoValue}>No professional contacts linked</Text>
                        )}
                    </View>
                </View>

                {/* Linked Personal Contact */}
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Linked Personal Contact</Text>
                    <View style={styles.tagsRow}>
                        {documentDetails?.linked_personal_contacts && documentDetails.linked_personal_contacts.length > 0 ? (
                            documentDetails.linked_personal_contacts.map((contact, index) => (
                                <View key={index} style={styles.personalChipView}>
                                    <Text style={styles.personalText}>{typeof contact === 'object' ? contact.name : contact}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.infoValue}>No personal contacts linked</Text>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );

    const renderVersions = () => (
        <View style={styles.card}>
            <Text style={styles.sectionMainTitle}>Version History</Text>
            {versions && versions.length > 0 ? (
                versions.map((ver) => (
                    <View key={ver.id} style={[styles.versionItem, { marginBottom: 12 }]}>
                        <Text style={styles.versionTitle}>{ver.title} (v{ver.version})</Text>
                        <View style={styles.versionMetaRow}>
                            <Image source={Icons.ic_clock} style={styles.metaIcon} />
                            <Text style={styles.metaText}>{new Date(ver.created_at).toLocaleDateString()}</Text>

                            <Image source={Icons.ic_user_single} style={[styles.metaIcon, { marginLeft: 12 }]} />
                            <Text style={styles.metaText}>{ver.uploaded_by}</Text>

                            <Image source={Icons.ic_doc} style={[styles.metaIcon, { marginLeft: 12 }]} />
                            <Text style={styles.metaText}>{ver.file_size_display}</Text>
                        </View>
                        <TouchableOpacity style={styles.downloadBtn}>
                            <Feather name="download" size={14} color="white" style={{ marginRight: 8 }} />
                            <Text style={styles.downloadText}>Download</Text>
                        </TouchableOpacity>
                    </View>
                ))
            ) : (
                <Text style={styles.infoValue}>No version history found.</Text>
            )}
        </View>
    );

    const renderLegacyAccess = () => (
        <View style={styles.legacyContainer}>
            <View style={styles.legacyHeader}>
                <Text style={styles.legacyMainTitle}>Legacy Access Policy</Text>
                <TouchableOpacity
                    style={styles.addTrusteeBtn}
                    onPress={() => {
                        setEditingLegacyAccessId(null);
                        setEditingTrusteeInitialValues(null);
                        setShowAddTrusteeModal(true);
                    }}
                >
                    <Text style={styles.addTrusteeBtnText}>Add New Trustee</Text>
                </TouchableOpacity>
            </View>

            {/* Primary Trustees */}
            <View style={styles.trusteeSectionHeader}>
                <Image source={Icons.ic_insurance} style={styles.trusteeIcon} />
                <Text style={styles.trusteeTitle}>Primary Trustees</Text>
            </View>

            {legacyAccess?.primary_trustees && legacyAccess.primary_trustees.length > 0 ? (
                legacyAccess.primary_trustees.map((trustee) => (
                    <View key={trustee.id} style={styles.trusteeCard}>
                        <Text style={styles.trusteeName}>{trustee.name}</Text>
                        <Text style={styles.trusteeEmail}>{trustee.email}</Text>
                        <View style={styles.tagsRow}>
                            {/* <View style={[styles.tag, { backgroundColor: ColorConstants.PRIMARY_BROWN }]}>
                                <Text style={[styles.tagText, { color: 'white' }]}>{trustee.role_display || 'Primary Trustee'}</Text>
                            </View> */}
                            <View style={[styles.tag, { backgroundColor: '#F3F4F6' }]}>
                                <Text style={styles.tagText}>{trustee.access_trigger_display || 'Trigger'}</Text>
                            </View>
                        </View>
                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                style={styles.editActionBtn}
                                onPress={() => handleEditTrustee((trustee as any).id)}
                            >
                                <Image source={Icons.ic_edit} style={styles.actionBtnIcon} />
                                <Text style={styles.actionBtnText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.deleteActionBtn}
                                onPress={() => {
                                    openRemoveTrusteeModal((trustee as any).id, trustee.name);
                                }}
                            >
                                <Feather name="trash-2" size={16} color={ColorConstants.BLACK2} />
                                <Text style={[styles.deleteBtnText, { color: ColorConstants.BLACK }]}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))
            ) : (
                <Text style={[styles.infoValue, { marginBottom: 20, marginLeft: 5 }]}>No primary trustees assigned.</Text>
            )}

            {/* Secondary Trustees */}
            <View style={{ marginTop: 24 }}>
                <View style={styles.trusteeSectionHeader}>
                    <Image source={Icons.ic_people} style={styles.trusteeIcon} />
                    <Text style={styles.trusteeTitle}>Secondary Trustees</Text>
                </View>

                {legacyAccess?.secondary_trustees && legacyAccess.secondary_trustees.length > 0 ? (
                    legacyAccess.secondary_trustees.map((trustee) => (
                        <View key={trustee.id} style={styles.trusteeCard}>
                            <Text style={styles.trusteeName}>{trustee.name}</Text>
                            <Text style={styles.trusteeEmail}>{trustee.email}</Text>
                            <View style={styles.tagsRow}>
                                {trustee?.access_trigger_display &&
                                    <View style={[styles.tag, { backgroundColor: '#F3F4F6' }]}>
                                        <Text style={styles.tagText}>{trustee?.access_trigger_display || 'Trigger'}</Text>
                                    </View>}
                            </View>
                            <View style={styles.actionRow}>
                                <TouchableOpacity
                                    style={styles.editActionBtn}
                                    onPress={() => handleEditTrustee((trustee as any).id)}
                                >
                                    <Image source={Icons.ic_edit} style={styles.actionBtnIcon} />
                                    <Text style={styles.actionBtnText}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.deleteActionBtn}
                                    onPress={() => {
                                        openRemoveTrusteeModal((trustee as any).id, trustee.name);
                                    }}
                                >
                                    <Feather name="trash-2" size={16} color={ColorConstants.BLACK2} />
                                    <Text style={[styles.deleteBtnText, { color: ColorConstants.BLACK }]}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={[styles.infoValue, { marginLeft: 5 }]}>No secondary trustees assigned.</Text>
                )}
            </View>
        </View>
    );

    const renderSearch = () => (
        <View style={styles.card}>
            <Text style={styles.sectionMainTitle}>Full-Text Search</Text>

            <View style={styles.searchResultBox}>
                <Text style={styles.searchResultText}>
                    Home Insurance Policy Coverage Details Premium Amount Annual
                </Text>
            </View>

            <Text style={styles.ocrHint}>
                OCR text is automatically extracted from uploaded documents for searchability
            </Text>
        </View>
    );

    console.log("documentDetails-->>>>", documentDetails);


    return (
        <SafeAreaView style={styles.container}>
            <Header
                title={fileName}
                showBackArrow={true}
                titleStyles={styles.headerTitle}
                tapOnBack={() => router.push('/(root)/(drawer)/upload-document')}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

                {/* Action Bar */}
                <View style={styles.actionBar}>

                    {/* VIEW */}
                    <TouchableOpacity
                        style={[
                            styles.iconButton,
                            activeAction === 'view' && styles.iconButtonActive
                        ]}
                        onPress={handlePreview}
                        activeOpacity={0.8}
                    >
                        <Feather
                            name="eye"
                            size={18}
                            color={activeAction === 'view' ? ColorConstants.WHITE : ColorConstants.BLACK2}
                        />
                    </TouchableOpacity>

                    {/* EDIT */}
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
                        <Feather
                            name="edit"
                            size={18}
                            color={activeAction === 'edit' ? ColorConstants.WHITE : ColorConstants.BLACK2}
                        />
                    </TouchableOpacity>

                    {/* DOWNLOAD */}
                    <TouchableOpacity
                        style={[
                            styles.iconButton,
                            activeAction === 'download' && styles.iconButtonActive
                        ]}
                        onPress={handleDownload}
                    >
                        <Feather
                            name="download"
                            size={18}
                            color={activeAction === 'download' ? ColorConstants.WHITE : ColorConstants.BLACK2}
                        />
                    </TouchableOpacity>

                    {/* DELETE */}
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
                        <Feather
                            name="trash-2"
                            size={18}
                            color={activeAction === 'delete' ? ColorConstants.WHITE : ColorConstants.BLACK2}
                        />
                    </TouchableOpacity>

                </View>

                {/* Tabs */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabScrollContainer}
                >
                    <View style={styles.tabContainer}>
                        {(['Overview', 'Versions', 'Legacy Access', 'Search'] as TabOption[]).map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                style={[
                                    styles.tabButton,
                                    activeTab === tab && styles.tabButtonActive
                                ]}
                                onPress={() => setActiveTab(tab)}
                                activeOpacity={0.8}
                            >
                                <Text
                                    style={[
                                        styles.tabText,
                                        activeTab === tab && styles.tabTextActive
                                    ]}
                                    numberOfLines={1}
                                >
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>

                {/* Tab Content */}
                <View style={styles.contentContainer}>
                    {isLoading ? (
                        <View style={{ marginTop: 40 }}>
                            <ActivityIndicator size="large" color={ColorConstants.PRIMARY_BROWN} />
                        </View>
                    ) : (
                        <>
                            {activeTab === 'Overview' && renderOverview()}
                            {activeTab === 'Versions' && renderVersions()}
                            {activeTab === 'Legacy Access' && renderLegacyAccess()}
                            {activeTab === 'Search' && renderSearch()}
                        </>
                    )}
                </View>

            </ScrollView>

            <AddTrusteeModal
                visible={showAddTrusteeModal}
                onClose={() => setShowAddTrusteeModal(false)}
                onSaveSuccess={() => {
                    fetchData(); // Refresh list after adding
                }}
                docId={documentId}
                legacyAccessId={editingLegacyAccessId}
                initialValues={editingTrusteeInitialValues}
            />

            <DeleteConfirmationModal
                visible={showDeleteModal}
                onClose={() => {
                    if (isDeleting) return;
                    setShowDeleteModal(false);
                    setActiveAction('');
                }}
                onDelete={handleDeleteDocument}
                title={deleteConfig.title}
                isLoading={isDeleting}
            />

            <RemoveTrusteeModal
                visible={showRemoveTrusteeModal}
                trusteeName={removingTrustee?.name || ''}
                onClose={() => {
                    if (isRemovingTrustee) return;
                    setShowRemoveTrusteeModal(false);
                    setRemovingTrustee(null);
                }}
                onConfirm={handleRemoveTrustee}
                isLoading={isRemovingTrustee}
            />

            <DocumentPreviewModal
                visible={showPreviewModal}
                onClose={() => setShowPreviewModal(false)}
                fileName={fileName}
                previewUrl={previewData?.file_url}
                previewType={previewData?.preview_type}
            />

            <EditDocumentModal
                visible={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setActiveAction('');
                }}
                onSave={async (payload: any) => {
                    try {
                        console.log('Saving document payload:', payload);

                        const response = await apiPatch(
                            `${ApiConstants.HOMEOWNER_DOCUMENTS}${documentId}/`,
                            payload,
                            { isFormData: payload instanceof FormData }
                        );

                        if (response.status === 200) {
                            console.log('Document updated successfully');
                            setShowEditModal(false);
                            setActiveAction('');
                            // Refresh document details
                            fetchData();
                        }
                    } catch (error) {
                        console.error('Error updating document:', error);
                    }
                }}
                initialData={documentDetails ? {
                    title: documentDetails.title,
                    category: documentDetails.category_name,
                    folder: documentDetails.folder_name,
                    property: (documentDetails as any).property_name || '',
                    property_id: (documentDetails as any).property || null,
                    issueDate: documentDetails.issue_date,
                    expirationDate: documentDetails.expiration_date,
                    tags: (Array.isArray(documentDetails.tag_names) && documentDetails.tag_names.length > 0)
                        ? documentDetails.tag_names.join(', ')
                        : (documentDetails.tags || ''),
                    note: documentDetails.description,
                    fileType: documentDetails.file_type,
                    fileSize: documentDetails.file_size_display,
                    file_url: (documentDetails as any).file_url || '',
                    file_name: (documentDetails as any).file_name || '',
                    linked_contact: (documentDetails as any).linked_family_members || [],
                    linked_contact_ids: (documentDetails as any).linked_family_members_ids || [],
                    linked_family_members: (documentDetails as any).linked_family_members || [],
                    linked_family_members_ids: (documentDetails as any).linked_family_members_ids || [],
                    linked_personal_contacts: (documentDetails as any).linked_personal_contacts || [],
                    linked_personal_contacts_ids: (documentDetails as any).linked_personal_contacts_ids || [],
                    linked_vendors: (documentDetails as any).linked_vendors || [],
                    linked_vendors_ids: (documentDetails as any).linked_vendors_ids || [],
                    linked_contacts: (documentDetails as any).linked_personal_contacts || [],
                    linked_contacts_ids: (documentDetails as any).linked_personal_contacts_ids || [],
                } : undefined}
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
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },

    tabText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },

    tabTextActive: {
        fontFamily: Fonts.ManropeSemiBold,
    },

    contentContainer: {
        paddingHorizontal: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 20,
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
        rowGap: 8,
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
    familyChipView: {
        backgroundColor: ColorConstants.LIGHT_PEACH3,
        borderWidth: 1,
        borderColor: ColorConstants.BROWN20,
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    familyText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 12,
        color: ColorConstants.PRIMARY_BROWN,
    },
    professionalChipView: {
        backgroundColor: ColorConstants.LIGHT_PEACH3,
        borderWidth: 1,
        borderColor: ColorConstants.BROWN20,
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    professionalText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 12,
        color: ColorConstants.PRIMARY_BROWN,
    },
    personalChipView: {
        backgroundColor: ColorConstants.LIGHT_PEACH3,
        borderWidth: 1,
        borderColor: ColorConstants.BROWN20,
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    personalText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 12,
        color: ColorConstants.PRIMARY_BROWN,
    },

    // Versions
    versionItem: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 16,
    },
    versionTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK,
        marginBottom: 8,
    },
    versionMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    metaIcon: {
        width: 14,
        height: 14,
        tintColor: '#666',
        resizeMode: 'contain',
        marginRight: 6,
    },
    metaText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: '#666',
    },
    downloadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#A05E5D',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    downloadIcon: {
        width: 14,
        height: 14,
        tintColor: 'white',
        marginRight: 8,
    },
    downloadText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 13,
        color: 'white',
    },

    // Legacy Access
    legacyContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3
    },
    legacyHeader: {
        marginBottom: 24,
    },
    legacyMainTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 16,
        color: ColorConstants.BLACK2,
        marginBottom: 16
    },
    addTrusteeBtn: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        paddingVertical: 6,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 17
    },
    addTrusteeBtnText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 16,
        color: 'white'
    },
    trusteeSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    trusteeIcon: {
        width: 18,
        height: 18,
        resizeMode: 'contain',
        marginRight: 10,
        tintColor: ColorConstants.BLACK,
    },
    trusteeTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 18,
        color: ColorConstants.BLACK2,
    },
    trusteeCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 16,
        marginBottom: 16,
    },
    trusteeName: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 18,
        color: ColorConstants.BLACK2,
        marginBottom: 4
    },
    trusteeEmail: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: '#666',
        marginBottom: 12
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16
    },
    editActionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 8
    },
    deleteActionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingVertical: 6,
        borderRadius: 8,
        gap: 8
    },
    actionBtnIcon: {
        width: 16,
        height: 16,
        resizeMode: 'contain',
        tintColor: 'white'
    },
    actionBtnText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 14,
        color: 'white'
    },
    deleteBtnText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 14,
        color: ColorConstants.BLACK2
    },

    // Search
    searchResultBox: {
        backgroundColor: ColorConstants.LIGHT_PEACH3,
        padding: 16,
        borderRadius: 8,
        marginBottom: 20,
    },
    searchResultText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
    },
    ocrHint: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 13,
        color: '#666',
        marginHorizontal: 15
    },

});
