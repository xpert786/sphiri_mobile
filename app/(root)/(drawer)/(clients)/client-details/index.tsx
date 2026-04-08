import { apiDelete, apiGet, apiPatch, apiPost } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import Header from '@/components/Header';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { formatDate, handleDownload } from '@/constants/Helper';
import DeleteConfirmationModal from '@/modals/DeleteConfirmationModal';
import SendProposalModal from '@/modals/SendProposalModal';
import SetServiceReminderModal from '@/modals/SetServiceReminderModal';
import UploadClientDocumentModal from '@/modals/UploadClientDocumentModal';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type TabType = 'Overview' | 'Services' | 'Documents' | 'Notes';

interface ClientDetail {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    status: string;
    status_display: string;
    services_count: number;
    last_service_date: string | null;
    last_service_display: string;
    rating: number;
    total_reviews: number;
    rating_display: string;
    created_at: string;
    updated_at: string;
}

interface ClientService {
    id: number;
    name: string;
    date: string;
    price: string;
    status: string;
}

interface ClientDocument {
    id: number;
    file_name: string;
    file_size: string;
    file_url?: string;
    formatted_date: string;
    document_type_display: string;
}

interface ClientNote {
    id: number;
    note: string;
    is_pinned: boolean;
    created_at: string;
    updated_at: string;
}

export default function ClientDetails() {
    const { id, tab } = useLocalSearchParams();
    const [clientData, setClientData] = useState<ClientDetail | null>(null);
    const [services, setServices] = useState<ClientService[]>([]);
    const [documents, setDocuments] = useState<ClientDocument[]>([]);
    const [notes, setNotes] = useState<ClientNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingServices, setLoadingServices] = useState(false);
    const [loadingDocuments, setLoadingDocuments] = useState(false);
    const [loadingNotes, setLoadingNotes] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>((tab as TabType) || 'Overview');
    const [menuVisible, setMenuVisible] = useState(false);
    const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
    const [noteInput, setNoteInput] = useState('');
    const [isSubmittingNote, setIsSubmittingNote] = useState(false);
    const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
    const [deleteNoteVisible, setDeleteNoteVisible] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
    const [editingNoteText, setEditingNoteText] = useState('');
    const [isUpdatingNote, setIsUpdatingNote] = useState(false);

    useEffect(() => {
        if (tab && ['Overview', 'Services', 'Documents', 'Notes'].includes(tab as string)) {
            setActiveTab(tab as TabType);
        }
    }, [tab]);
    const [sendProposalVisible, setSendProposalVisible] = useState(false);
    const [setReminderVisible, setSetReminderVisible] = useState(false);
    const [uploadDocVisible, setUploadDocVisible] = useState(false);
    const [deleteDocVisible, setDeleteDocVisible] = useState(false);

    const fetchClientDetails = async () => {
        try {
            const response = await apiGet(`${ApiConstants.VENDOR_CLIENTS}${id}/`);
            console.log("response in fetchClientDetails:", response.data);

            if (response.data) {
                setClientData(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch client details:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchClientServices = async () => {
        setLoadingServices(true);
        try {
            const response = await apiGet(`${ApiConstants.VENDOR_CLIENT_SERVICES}${id}/services/`);
            if (response.data && response.data.services) {
                setServices(response.data.services);
            }
        } catch (error) {
            console.error("Failed to fetch client services:", error);
        } finally {
            setLoadingServices(false);
        }
    };

    const fetchClientDocuments = async () => {
        setLoadingDocuments(true);
        try {
            const response = await apiGet(`${ApiConstants.VENDOR_CLIENT_DOCUMENTS}${id}/documents/`);
            if (response.data && response.data.documents) {
                setDocuments(response.data.documents);
            }
        } catch (error) {
            console.error("Failed to fetch client documents:", error);
        } finally {
            setLoadingDocuments(false);
        }
    };

    const fetchClientNotes = async () => {
        setLoadingNotes(true);
        try {
            const response = await apiGet(`${ApiConstants.VENDOR_CLIENT_NOTES}${id}/notes/`);
            if (response.data && response.data.notes) {
                setNotes(response.data.notes);
            }
        } catch (error) {
            console.error("Failed to fetch client notes:", error);
        } finally {
            setLoadingNotes(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchClientDetails();
            fetchClientServices();
            fetchClientDocuments();
            fetchClientNotes();
        }
    }, [id]);

    const toggleMenu = () => setMenuVisible(!menuVisible);

    const handleMenuAction = (action: 'proposal' | 'reminder' | 'upload' | 'delete') => {
        setMenuVisible(false);
        setTimeout(() => {
            if (action === 'proposal') setSendProposalVisible(true);
            if (action === 'reminder') setSetReminderVisible(true);
            if (action === 'upload') setUploadDocVisible(true);
            // if (action === 'delete') setDeleteDocVisible(true);
        }, 300); // Small delay to allow menu to close smoothly
    };

    const handleUploadDocument = async (data: { docType: string; selectedFile: any }) => {
        setUploadDocVisible(false);
        setLoadingDocuments(true);
        try {
            const formData = new FormData();
            const formattedDocType = data.docType === 'Service Report' ? 'service_report' : data.docType.toLowerCase();
            formData.append('document_type', formattedDocType);
            formData.append('file', {
                uri: data.selectedFile.uri,
                name: data.selectedFile.name,
                type: data.selectedFile.mimeType || 'application/octet-stream',
            } as any);

            console.log("url in handleUploadDocument", `${ApiConstants.VENDOR_CLIENT_DOCUMENTS}${id}/documents/`);
            console.log("formData in handleUploadDocument", JSON.stringify(formData))


            const response = await apiPost(
                `${ApiConstants.VENDOR_CLIENT_DOCUMENTS}${id}/documents/`,
                formData,
                { isFormData: true }
            );
            console.log("response in handleUploadDocument:", response);


            if (response.status === 200 || response.status === 201) {
                console.log("Document uploaded successfully");
                fetchClientDocuments();
            }
        } catch (error) {
            console.error("Failed to upload document:", error);
        } finally {
            setUploadDocVisible(false);
            setLoadingDocuments(false);
        }
    };

    const handleDeleteDocument = async () => {
        if (!selectedDocId) return;
        setDeleteDocVisible(false);
        setLoadingDocuments(true);
        try {
            const response = await apiDelete(`${ApiConstants.VENDOR_DOCUMENTS}${selectedDocId}/`);
            if (response.status === 200 || response.status === 204) {
                console.log("Document deleted successfully");
                fetchClientDocuments();
            }
        } catch (error) {
            console.error("Failed to delete document:", error);
        } finally {
            setLoadingDocuments(false);
            setSelectedDocId(null);
        }
    };

    const handleAddNote = async () => {
        if (!noteInput.trim()) {
            Alert.alert('Error', 'Please enter a note');
            return;
        }
        setIsSubmittingNote(true);
        try {
            const response = await apiPost(`${ApiConstants.VENDOR_CLIENT_NOTES}${id}/notes/`, {
                note: noteInput.trim(),
                client: Number(id)
            });
            if (response.status === 200 || response.status === 201) {
                setNoteInput('');
                fetchClientNotes();
            }
        } catch (error) {
            console.error("Failed to add note:", error);
        } finally {
            setIsSubmittingNote(false);
        }
    };

    const handleDeleteNote = async () => {
        if (!selectedNoteId) return;
        setDeleteNoteVisible(false);
        setLoadingNotes(true);
        try {
            const response = await apiDelete(`${ApiConstants.VENDOR_NOTES}${selectedNoteId}/`);
            if (response.status === 200 || response.status === 204) {
                fetchClientNotes();
            }
        } catch (error) {
            console.error("Failed to delete note:", error);
        } finally {
            setLoadingNotes(false);
            setSelectedNoteId(null);
        }
    };

    const handleUpdateNote = async () => {
        if (!editingNoteId || !editingNoteText.trim()) return;
        setIsUpdatingNote(true);
        try {
            const response = await apiPatch(`${ApiConstants.VENDOR_NOTES}${editingNoteId}/`, {
                note: editingNoteText.trim()
            });
            if (response.status === 200) {
                setEditingNoteId(null);
                setEditingNoteText('');
                fetchClientNotes();
            }
        } catch (error) {
            console.error("Failed to update note:", error);
            Alert.alert('Error', 'Failed to update note. Please try again.');
        } finally {
            setIsUpdatingNote(false);
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Overview':
                return (
                    <View>
                        <Text style={styles.sectionTitle}>Client Information</Text>

                        <Text style={styles.infoLabel}>Status</Text>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>{clientData?.status_display || 'N/A'}</Text>
                        </View>

                        <Text style={styles.infoLabel}>Total Services</Text>
                        <Text style={styles.infoValue}>{clientData?.services_count ?? 0}</Text>

                        <Text style={styles.infoLabel}>Last Service</Text>
                        <Text style={styles.infoValue}>{clientData?.last_service_display || 'Never'}</Text>
                    </View>
                );
            case 'Services':
                return (
                    <View style={styles.tabContent}>
                        <Text style={styles.sectionTitle}>Service History</Text>
                        <Text style={styles.sectionSubtitle}>{services.length} services completed</Text>

                        {loadingServices ? (
                            <ActivityIndicator size="small" color={ColorConstants.DARK_CYAN} style={{ marginTop: 20 }} />
                        ) : services.length > 0 ? (
                            services.map((item) => (
                                <View key={item.id} style={styles.serviceCard}>
                                    <View>
                                        <Text style={styles.serviceName}>{item.name}</Text>
                                        <Text style={styles.serviceDate}>{item.date}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={styles.servicePrice}>{item.price}</Text>
                                        <View style={[styles.statusBadge, { marginTop: 4, paddingHorizontal: 10, paddingVertical: 2, borderRadius: 12 }]}>
                                            <Text style={[styles.statusText, { fontSize: 10 }]}>{item.status}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateText}>No services found for this client.</Text>
                            </View>
                        )}
                    </View>
                );
            case 'Documents':
                return (
                    <View style={styles.tabContent}>
                        <Text style={styles.sectionTitle}>Documents</Text>
                        <Text style={styles.sectionSubtitle}>{documents.length} {documents.length > 1 ? 'files' : 'file'}</Text>

                        {loadingDocuments ? (
                            <ActivityIndicator size="small" color={ColorConstants.DARK_CYAN} style={{ marginTop: 20 }} />
                        ) : documents.length > 0 ? (
                            documents.map((item) => (
                                <View key={item.id} style={styles.documentCard}>
                                    <View style={{ flex: 1, marginRight: 12 }}>
                                        <Text style={styles.docName} numberOfLines={1}>{item.file_name}</Text>
                                        <Text style={styles.docInfo}>{item.document_type_display} • {formatDate(item.formatted_date)}</Text>
                                    </View>
                                    <View style={styles.actionButtons}>
                                        <TouchableOpacity
                                            style={styles.downloadButton}
                                            onPress={() => {
                                                if (item.file_url) {
                                                    handleDownload(item.file_url);
                                                }
                                            }}
                                        >
                                            <MaterialCommunityIcons name="download" size={20} color={ColorConstants.DARK_CYAN} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.downloadButton, { marginLeft: 8 }]}
                                            onPress={() => {
                                                setSelectedDocId(item.id);
                                                setDeleteDocVisible(true);
                                            }}
                                        >
                                            <MaterialCommunityIcons name="delete-outline" size={20} color={ColorConstants.DARK_CYAN} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateText}>No documents found for this client.</Text>
                            </View>
                        )}
                    </View>
                );
            case 'Notes':
                return (
                    <View style={styles.tabContent}>
                        <Text style={styles.sectionTitle}>Notes</Text>

                        <View style={{ marginTop: 20 }}>
                            {loadingNotes ? (
                                <ActivityIndicator size="small" color={ColorConstants.DARK_CYAN} />
                            ) : notes.length > 0 ? (
                                notes.map((item) => (
                                    <View key={item.id} style={styles.notesCard}>
                                        <View style={styles.noteHeader}>
                                            <View style={{ flex: 1 }}>
                                                {editingNoteId === item.id ? (
                                                    <View style={styles.editNoteInputWrapper}>
                                                        <TextInput
                                                            style={styles.noteTextInput}
                                                            value={editingNoteText}
                                                            onChangeText={setEditingNoteText}
                                                            multiline
                                                            textAlignVertical="top"
                                                        />
                                                    </View>
                                                ) : (
                                                    <Text style={styles.notesText}>
                                                        {item.note}
                                                    </Text>
                                                )}
                                            </View>
                                            <View style={styles.noteActions}>
                                                <TouchableOpacity onPress={() => {
                                                    setEditingNoteId(item.id);
                                                    setEditingNoteText(item.note);
                                                }}>
                                                    <Text style={[styles.editBtnText, editingNoteId === item.id && { color: ColorConstants.GRAY }]}>Edit</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        setSelectedNoteId(item.id);
                                                        setDeleteNoteVisible(true);
                                                    }}
                                                >
                                                    <Text style={styles.deleteBtnText}>Delete</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        {editingNoteId === item.id ? (
                                            <View style={styles.inlineEditBtnContainer}>
                                                <TouchableOpacity
                                                    style={styles.inlineSaveBtn}
                                                    onPress={handleUpdateNote}
                                                    disabled={isUpdatingNote}
                                                >
                                                    {isUpdatingNote ? (
                                                        <ActivityIndicator size="small" color={ColorConstants.WHITE} />
                                                    ) : (
                                                        <Text style={styles.inlineSaveBtnText}>Save</Text>
                                                    )}
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={styles.inlineCancelBtn}
                                                    onPress={() => {
                                                        setEditingNoteId(null);
                                                        setEditingNoteText('');
                                                    }}
                                                >
                                                    <Text style={styles.inlineCancelBtnText}>Cancel</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ) : (
                                            <Text style={styles.noteDate}>
                                                {(() => {
                                                    const date = new Date(item.created_at);
                                                    const day = String(date.getDate()).padStart(2, '0');
                                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                                    const year = date.getFullYear();
                                                    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
                                                    return `${day}/${month}/${year} ${time}`;
                                                })()}
                                            </Text>
                                        )}
                                    </View>
                                ))
                            ) : (
                                <View style={styles.emptyNoteState}>
                                    <Text style={styles.emptyNoteStateText}>No notes are available at the moment. Please add your first note below.</Text>
                                </View>
                            )}

                            <View style={styles.addNoteContainer}>
                                <Text style={styles.addNoteTitle}>Add New Note</Text>
                                <View style={styles.noteInputWrapper}>
                                    <TextInput
                                        style={styles.noteTextInput}
                                        placeholder="Enter your note here..."
                                        placeholderTextColor={ColorConstants.GRAY}
                                        multiline
                                        value={noteInput}
                                        onChangeText={setNoteInput}
                                        textAlignVertical="top"
                                    />
                                </View>
                                <TouchableOpacity
                                    style={[styles.addNoteBtn, !noteInput.trim() && { opacity: 0.6 }]}
                                    onPress={handleAddNote}
                                    disabled={isSubmittingNote}
                                >
                                    {isSubmittingNote ? (
                                        <ActivityIndicator size="small" color={ColorConstants.WHITE} />
                                    ) : (
                                        <Text style={styles.addNoteBtnText}>Add Note</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={ColorConstants.WHITE} barStyle="dark-content" />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView contentContainerStyle={{ paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
                    <Header
                        title="Clients"
                        subtitle="Manage your client relationships"
                        containerStyle={{ paddingTop: 10 }}
                        showBackArrow={true}
                        tapOnBack={() => router.back()}
                    />

                    {loading ? (
                        <ActivityIndicator size="large" color={ColorConstants.DARK_CYAN} style={{ marginTop: 40 }} />
                    ) : (
                        <View style={styles.data}>
                            {/* Client Header */}
                            <View style={styles.headerRow}>
                                <View>
                                    <Text style={styles.clientName}>{clientData?.name || 'Unknown'}</Text>
                                    <Text style={styles.clientType}>Client</Text>
                                </View>
                                <View style={{ position: 'relative' }}>
                                    <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
                                        <Image source={Icons.ic_dots_vertical} style={styles.menuIcon} />
                                    </TouchableOpacity>
                                    {menuVisible && (
                                        <View style={styles.menuPopover}>
                                            <TouchableOpacity
                                                style={styles.menuItem}
                                                onPress={() => handleMenuAction('proposal')}
                                            >
                                                <Text style={styles.menuText}>Send Proposal</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.menuItem}
                                                onPress={() => handleMenuAction('reminder')}
                                            >
                                                <Text style={styles.menuTextNormal}>Set Reminder</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.menuItem}
                                                onPress={() => handleMenuAction('upload')}
                                            >
                                                <Text style={styles.menuTextNormal}>Upload Documents</Text>
                                            </TouchableOpacity>
                                            {/* <TouchableOpacity
                                            style={styles.menuItem}
                                            onPress={() => handleMenuAction('delete')}
                                        >
                                            <Text style={styles.menuTextNormal}>Remove Document</Text>
                                        </TouchableOpacity> */}
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* Quick Info Cards */}
                            <View style={styles.infoGrid}>
                                <View style={styles.infoCard}>
                                    <View style={styles.iconBox}>
                                        <MaterialCommunityIcons name="email-outline" size={18} color={ColorConstants.WHITE} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.cardLabel}>Email</Text>
                                        <Text style={styles.cardValue}>{clientData?.email || 'N/A'}</Text>
                                    </View>
                                </View>
                                <View style={styles.infoCard}>
                                    <View style={styles.iconBox}>
                                        <MaterialCommunityIcons name="star-outline" size={18} color={ColorConstants.WHITE} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.cardLabel}>Rating</Text>
                                        <Text style={styles.cardValue}>{`${clientData?.rating.toFixed(0)}/5`}</Text>
                                    </View>
                                </View>
                                <View style={styles.infoCard}>
                                    <View style={styles.iconBox}>
                                        <MaterialCommunityIcons name="phone" size={18} color={ColorConstants.WHITE} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.cardLabel}>Phone</Text>
                                        <Text style={styles.cardValue}>{clientData?.phone || 'N/A'}</Text>
                                    </View>
                                </View>
                                <View style={styles.infoCard}>
                                    <View style={styles.iconBox}>
                                        <MaterialCommunityIcons name="map-marker-outline" size={18} color={ColorConstants.WHITE} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.cardLabel}>Address</Text>
                                        <Text style={styles.cardValue}>{clientData?.address || 'N/A'}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Tabs */}
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.tabScrollContainer}
                            >
                                {(['Overview', 'Services', 'Documents', 'Notes'] as TabType[]).map((tab) => (
                                    <TouchableOpacity
                                        key={tab}
                                        style={[
                                            styles.tabButton,
                                            activeTab === tab && styles.activeTabButton,
                                        ]}
                                        onPress={() => setActiveTab(tab)}
                                    >
                                        <Text
                                            style={[
                                                styles.tabText,
                                                activeTab === tab && styles.activeTabText,
                                            ]}
                                        >
                                            {tab}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {/* Action Buttons Float */}
                            {/* {(activeTab === 'Services' || activeTab === 'Documents') &&
                            <View style={styles.actionFloat}>
                        
                                <TouchableOpacity
                                    style={[styles.floatButton, { backgroundColor: ColorConstants.WHITE, borderWidth: 1, borderColor: ColorConstants.GRAY3 }]}
                                    onPress={() => {
                                        if (activeTab === 'Services') {
                                            router.push('/(root)/(drawer)/(clients)/service-history');
                                        } else if (activeTab === 'Documents') {
                                            router.push('/(root)/(drawer)/(clients)/all-documents');
                                        }
                                    }}
                                >
                                    <Image source={Icons.ic_eye} style={[styles.floatIcon, { tintColor: ColorConstants.BLACK }]} />
                                </TouchableOpacity>
                            </View>} */}

                            {/* Tab Content */}
                            <View style={styles.contentContainer}>
                                {renderTabContent()}
                            </View>

                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Modals */}
            <SendProposalModal
                visible={sendProposalVisible}
                onClose={() => setSendProposalVisible(false)}
                onSend={() => console.log('Proposal Sent')}
                clientId={Number(id)}
                clientName={clientData?.name || 'Unknown'}
            />
            <SetServiceReminderModal
                visible={setReminderVisible}
                onClose={() => setSetReminderVisible(false)}
                onSetReminder={() => {
                    console.log('Reminder Set');
                    // Optionally refresh data here if needed
                }}
                clientId={Number(id)}
            />
            <UploadClientDocumentModal
                visible={uploadDocVisible}
                onClose={() => setUploadDocVisible(false)}
                onUpload={handleUploadDocument}
            />
            <DeleteConfirmationModal
                visible={deleteDocVisible}
                onClose={() => {
                    setDeleteDocVisible(false);
                    setSelectedDocId(null);
                }}
                onDelete={handleDeleteDocument}
                title="Are you sure you want to remove this document?"
            />
            <DeleteConfirmationModal
                visible={deleteNoteVisible}
                onClose={() => {
                    setDeleteNoteVisible(false);
                    setSelectedNoteId(null);
                }}
                onDelete={handleDeleteNote}
                title="Are you sure you want to remove this note?"
            />
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {

        flex: 1,
        backgroundColor: ColorConstants.WHITE,
    },
    data: {
        paddingHorizontal: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginTop: 10,
        marginBottom: 20,
    },
    clientName: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 15,
        color: ColorConstants.PRIMARY_BROWN,
    },
    clientType: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 11,
        color: ColorConstants.GRAY,
        marginTop: 4,
    },
    menuButton: {
        padding: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
    },
    menuIcon: {
        width: 16,
        height: 16,
        tintColor: ColorConstants.BLACK2,
    },
    menuPopover: {
        position: 'absolute',
        top: 40,
        right: 0,
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        padding: 8,
        width: 180,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 10,
        zIndex: 1000,
    },
    menuItem: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    menuItemActive: {
        backgroundColor: '#F7E7E2', // Light reddish background for "Send Proposal"
    },
    menuText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2, // Or specific color for active item? Screenshot looks like normal text color.
    },
    menuTextNormal: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 24,
    },
    infoCard: {
        width: '48%',
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    iconBox: {
        width: 30,
        height: 30,
        borderRadius: 8,
        backgroundColor: ColorConstants.DARK_CYAN,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardLabel: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.GRAY,
    },
    cardValue: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 12,
        color: ColorConstants.BLACK2,
        marginTop: 2,
    },
    // Tabs
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        marginBottom: 24,
    },
    tabScrollContainer: {
        flexDirection: 'row',
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        marginBottom: 24,
    },

    tabButton: {
        paddingVertical: 8,
        paddingHorizontal: 8, // 👈 horizontal scroll ke liye better
        alignItems: 'center',
        borderRadius: 8,
    },
    activeTabButton: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        paddingHorizontal: 12
    },
    tabText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    activeTabText: {
        color: ColorConstants.WHITE,
    },
    // Content
    contentContainer: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
    },
    tabContent: {},
    sectionTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 18,
        color: ColorConstants.BLACK2,
    },
    sectionSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.GRAY,
        marginBottom: 20,
    },
    // Overview Styles
    infoLabel: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.GRAY,
        marginTop: 16,
        marginBottom: 4,
    },
    infoValue: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.BLACK2,
    },
    statusBadge: {
        backgroundColor: ColorConstants.GREEN2,
        alignSelf: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontFamily: Fonts.ManropeMedium, // or mulish
        fontSize: 12,
        color: ColorConstants.WHITE,
    },
    // Services Styles
    serviceCard: {
        backgroundColor: '#F9FAFB', // Light gray background for items
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    serviceName: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.BLACK2,
        marginBottom: 4,
    },
    serviceDate: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.GRAY,
    },
    servicePrice: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 16,
        color: ColorConstants.BLACK2,
    },
    // Documents Styles
    documentCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    docName: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        marginBottom: 4,
    },
    docInfo: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.GRAY,
    },
    downloadButton: {
        padding: 8,
        backgroundColor: '#E5E7EB', // slightly darker for button
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Notes Styles
    notesCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    noteHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    noteActions: {
        flexDirection: 'row',
        gap: 12,
    },
    notesText: {
        flex: 1,
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        marginRight: 10,
    },
    editBtnText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 13,
        color: ColorConstants.GRAY,
    },
    deleteBtnText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 13,
        color: '#F55151',
    },
    noteDate: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 11,
        color: ColorConstants.GRAY,
    },
    emptyNoteState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 30,
    },
    emptyNoteStateText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.GRAY,
        textAlign: 'center',
    },
    editNoteInputWrapper: {
        borderWidth: 2,
        borderColor: '#9E7762',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        minHeight: 120,
    },
    inlineEditBtnContainer: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    inlineSaveBtn: {
        backgroundColor: '#9E7762',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 8,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inlineSaveBtnText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 14,
        color: ColorConstants.WHITE,
    },
    inlineCancelBtn: {
        backgroundColor: '#F3F4F6',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 8,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inlineCancelBtnText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    addNoteContainer: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        marginTop: 10,
    },
    addNoteTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 16,
        color: ColorConstants.BLACK2,
        marginBottom: 12,
    },
    noteInputWrapper: {
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 12,
        padding: 12,
        minHeight: 120,
        marginBottom: 16,
    },
    noteTextInput: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        flex: 1,
    },
    addNoteBtn: {
        backgroundColor: ColorConstants.PRIMARY_BROWN, // From screenshot (light brown/tan)
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    addNoteBtnText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 14,
        color: ColorConstants.WHITE,
    },
    // Actions Float
    actionFloat: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
        marginBottom: 16,
    },
    floatButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    floatIcon: {
        width: 18,
        height: 18,
        resizeMode: 'contain'
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyStateText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.GRAY,
    }
});
