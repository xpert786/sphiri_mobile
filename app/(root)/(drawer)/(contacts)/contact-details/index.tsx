import { apiDelete, apiGet, apiPatch, apiPost } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import ApiErrorModal from '@/components/ApiErrorModal';
import CustomTextInput from '@/components/CustomTextInput';
import Header from '@/components/Header';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { capitalizeFirstLetter } from '@/constants/Helper';
import { StringConstants } from '@/constants/StringConstants';
import AddContactModal from '@/modals/AddContactModal';
import DeleteConfirmationModal from '@/modals/DeleteConfirmationModal';
import LogEngagementModal from '@/modals/LogEngagementModal';
import UploadAttachmentModal from '@/modals/UploadAttachmentModal';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback } from 'react';
import { Dimensions, FlatList, Image, Linking, Pressable, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Contact } from '../contacts';
const { width } = Dimensions.get('window')

const tabs = [
    { key: 'Overview', label: 'Overview' },
    { key: 'Engagements', label: 'Engagements' },
    { key: 'Attachments', label: 'Attachments' },
    { key: 'Notes', label: 'Notes' },
];

export default function ContactDetails() {
    const hasAutoOpenedRef = React.useRef(false);
    const { item, editMode, type } = useLocalSearchParams();

    const getBaseUrl = () => {
        return type === 'personal_contact' ? ApiConstants.PERSONAL_CONTACTS_LIST : ApiConstants.VENDORS_LIST_CONTACTS;
    };

    const [activeTab, setActiveTab] = React.useState<'Overview' | 'Engagements' | 'Attachments' | 'Notes'>('Overview');
    const [notes, setNotes] = React.useState('');
    const [editModalVisible, setEditModalVisible] = React.useState(false);
    const [logEngagementModalVisible, setLogEngagementModalVisible] = React.useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = React.useState(false);
    const [selectedContact, setSelectedContact] = React.useState<Contact | null>(null);
    const [engagements, setEngagements] = React.useState<any[]>([]);
    const [loadingEngagements, setLoadingEngagements] = React.useState(false);
    const [attachments, setAttachments] = React.useState<any[]>([]);
    const [loadingAttachments, setLoadingAttachments] = React.useState(false);
    const [notesList, setNotesList] = React.useState<any[]>([]);
    const [loadingNotes, setLoadingNotes] = React.useState(false);
    const [savingNote, setSavingNote] = React.useState(false);
    const [apiErrorModalVisible, setApiErrorModalVisible] = React.useState(false);
    const [apiErrorData, setApiErrorData] = React.useState<any>(null);
    const [uploadAttachmentModalVisible, setUploadAttachmentModalVisible] = React.useState(false);

    useFocusEffect(
        useCallback(() => {
            if (selectedContact?.id) {
                console.log("id ContactDetails", selectedContact?.id);

                fetchContactDetails(selectedContact.id);
            }
        }, [selectedContact?.id])
    );

    React.useEffect(() => {
        if (item) {
            try {
                const parsedContact = JSON.parse(item as string);
                setSelectedContact(parsedContact);
            } catch (error) {
                console.error('Error parsing contact-details item:', error);
            }
        }
    }, [item]);

    React.useEffect(() => {
        if (editMode === 'true' && selectedContact && !hasAutoOpenedRef.current) {
            setEditModalVisible(true);
            hasAutoOpenedRef.current = true;
        }
    }, [editMode, selectedContact]);


    const fetchContactDetails = async (id: number) => {
        console.log("id in fetchContactDetails:", id);

        try {
            const res = await apiGet(`${getBaseUrl()}${id}/`);
            console.log("res.status", res.status);
            console.log("res.data", res.data);

            if (res.status === 200 || res.status === 201) {
                setSelectedContact(res.data);
            }
        } catch (error) {
            console.error('Error fetching contact details:', error);
        }
    };

    const handleTabPress = (tabKey: 'Overview' | 'Engagements' | 'Attachments' | 'Notes') => {
        setActiveTab(tabKey);
        if (tabKey === 'Engagements') {
            fetchEngagements();
        } else if (tabKey === 'Attachments') {
            fetchAttachments();
        } else if (tabKey === 'Notes') {
            fetchNotes();
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

    const getImageUrl = (url: string) => {
        if (!url) return undefined;
        if (url.startsWith('http')) return { uri: url };
        return { uri: `${ApiConstants.MEDIA_URL}${url}` };
    };

    const handleSaveContact = async (updatedData: any) => {
        try {
            if (!selectedContact) return;

            setEditModalVisible(false);

            const url = `${getBaseUrl()}${selectedContact.id}/`;
            console.log("selectedContact.id", selectedContact.id);
            console.log("url for edit contact:", url);

            const formData = new FormData();
            formData.append('name', `${updatedData.first_name} ${updatedData.last_name}`.trim());
            formData.append('first_name', updatedData.first_name || '');
            formData.append('last_name', updatedData.last_name || '');
            formData.append('phone_number', updatedData.phone_number || '');
            formData.append('company', updatedData.company || '');
            formData.append('email', updatedData.email || '');
            formData.append('address', updatedData.address || '');
            formData.append('emergency_contact', updatedData.emergency_contact || '');
            formData.append('website', updatedData.website || '');
            formData.append('initial_note', updatedData.notes || '');
            formData.append('notes', updatedData.notes || '');
            formData.append('rating', updatedData.rating || '');
            formData.append('category', updatedData.category_id || '');

            // Visibility — modal sends an array in visibility_ids
            if (updatedData.visibility_ids && Array.isArray(updatedData.visibility_ids) && updatedData.visibility_ids.length > 0) {
                updatedData.visibility_ids.forEach((id: any) => {
                    formData.append('visibility', id.toString());
                });
            } else if (updatedData.visibility_id) {
                // fallback for single value
                formData.append('visibility', updatedData.visibility_id.toString());
            }

            // Category Tags and Global Tags based on type
            if (type === 'personal_contact') {
                if (updatedData.tag_ids && Array.isArray(updatedData.tag_ids)) {
                    updatedData.tag_ids.forEach((id: any) => {
                        formData.append('tags', id.toString());
                    });
                }
                if (updatedData.global_tag_ids && Array.isArray(updatedData.global_tag_ids)) {
                    updatedData.global_tag_ids.forEach((id: any) => {
                        formData.append('global_tags', id.toString());
                    });
                }
            } else {
                // Vendor case
                if (updatedData.tag_ids && Array.isArray(updatedData.tag_ids)) {
                    updatedData.tag_ids.forEach((id: any) => {
                        formData.append('tag_ids', id.toString());
                    });
                }
                if (updatedData.global_tag_ids && Array.isArray(updatedData.global_tag_ids)) {
                    updatedData.global_tag_ids.forEach((id: any) => {
                        formData.append('global_tag_ids', id.toString());
                    });
                }
            }

            // Property IDs — handle as individual parts (removed [] suffix for compatibility)
            if (updatedData.property_ids && Array.isArray(updatedData.property_ids)) {
                updatedData.property_ids.forEach((id: any) => {
                    formData.append('property_ids', id.toString());
                });
            }

            if (updatedData.logo_url && updatedData.logo_url.uri) {
                const logoFile = {
                    uri: updatedData.logo_url.uri,
                    name: updatedData.logo_url.name || 'logo.jpg',
                    type: updatedData.logo_url.mimeType || 'image/jpeg'
                };
                formData.append('logo', logoFile as any);
                formData.append('logo_url', logoFile as any);
            }
            console.log("formData in handleSaveContact for edit :", JSON.stringify(formData))

            const res = await apiPatch(url, formData, { isFormData: true });

            if (res.status === 200 || res.status === 201) {
                console.log('Update Success:', res.data);
                setSelectedContact(res.data);
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Contact updated successfully',
                });
                setEditModalVisible(false);
            } else {
                console.error('Update Failed:', res.data);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: res.data?.message || 'Failed to update contact',
                });
            }
        } catch (error: any) {
            console.error('Error updating contact:', error);
            if (error?.response?.data) {
                console.error('API Error Details (Edit):', JSON.stringify(error.response.data, null, 2));
                setApiErrorData(error.response.data);
                setApiErrorModalVisible(true);
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: error?.message || 'An unexpected error occurred',
                });
            }
        }
    };

    const fetchEngagements = async () => {
        try {
            if (!selectedContact) return;

            setLoadingEngagements(true);
            const url = `${ApiConstants.VENDORS_LIST_CONTACTS}${selectedContact.id}${ApiConstants.VENDORS_ENGAGEMENTS}`;
            console.log("Fetching engagements from:", url);

            const res = await apiGet(url);

            if (res.status === 200 || res.status === 201) {
                console.log('Engagements fetched:', res.data);
                setEngagements(res.data || []);


            } else {
                console.error('Failed to fetch engagements:', res.data);
                setEngagements([]);
            }
        } catch (error) {
            console.error('Error fetching engagements:', error);
            setEngagements([]);
        } finally {
            setLoadingEngagements(false);
        }
    };

    const fetchAttachments = async () => {
        try {
            if (!selectedContact) return;

            setLoadingAttachments(true);
            const url = `${ApiConstants.VENDORS_LIST_CONTACTS}${selectedContact.id}${ApiConstants.VENDORS_ATTACHMENTS}`;
            console.log("Fetching attachments from:", url);

            const res = await apiGet(url);

            if (res.status === 200 || res.status === 201) {
                console.log('Attachments fetched:', res.data);
                setAttachments(res.data || []);
            } else {
                console.error('Failed to fetch attachments:', res.data);
                setAttachments([]);
            }
        } catch (error) {
            console.error('Error fetching attachments:', error);
            setAttachments([]);
        } finally {
            setLoadingAttachments(false);
        }
    };

    const fetchNotes = async () => {
        try {
            if (!selectedContact) return;

            setLoadingNotes(true);
            const url = `${ApiConstants.VENDORS_LIST_CONTACTS}${selectedContact.id}${ApiConstants.VENDORS_NOTES}`;
            console.log("Fetching notes from:", url);

            const res = await apiGet(url);

            if (res.status === 200 || res.status === 201) {
                console.log('Notes fetched:', res.data);
                setNotesList(res.data || []);
            } else {
                console.error('Failed to fetch notes:', res.data);
                setNotesList([]);
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
            setNotesList([]);
        } finally {
            setLoadingNotes(false);
        }
    };

    const handleSaveNote = async () => {
        try {
            if (!selectedContact || !notes.trim()) return;

            setSavingNote(true);
            const url = `${ApiConstants.VENDORS_LIST_CONTACTS}${selectedContact.id}${ApiConstants.VENDORS_NOTES}`;
            const payload = { note: notes.trim() };

            const res = await apiPost(url, payload);

            if (res.status === 200 || res.status === 201) {
                console.log('Note saved successfully:', res.data);
                setNotes('');
                fetchNotes();
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Note saved successfully',
                });
            } else {
                console.error('Failed to save note:', res.data);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to save note',
                });
            }
        } catch (error) {
            console.error('Error saving note:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'An error occurred while saving the note',
            });
        } finally {
            setSavingNote(false);
        }
    };

    const handleEditContact = () => {
        setEditModalVisible(true);
    };

    const handleDeleteContact = async () => {
        try {
            if (!selectedContact) return;
            const url = `${getBaseUrl()}${selectedContact.id}/`;
            const res = await apiDelete(url);

            if (res.status === 200 || res.status === 204 || res.status === 201) {
                console.log('Delete Success');
                setDeleteModalVisible(false);
                router.back();
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: "Contact deleted successfully",
                });
            } else {
                console.error('Delete Failed:', res.data);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: res.data?.message || 'Failed to delete contact',
                });
            }
        } catch (error: any) {
            console.error('Error deleting contact:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error?.response?.data?.message || error?.message || 'An unexpected error occurred',
            });
        }
    };

    const handleLogEngagement = async (formData: any) => {
        setLogEngagementModalVisible(false);
        try {
            if (!selectedContact) return;

            const url = `${ApiConstants.VENDORS_LIST_CONTACTS}${selectedContact.id}${ApiConstants.VENDORS_ENGAGEMENTS}`;
            console.log('url in handleLogEngagement=>>>>', url)

            const payload = {
                title: formData.title,
                notes: formData.notes,
                engagement_type: formData.type?.toLowerCase() || 'payment',
                date: formData.date ? new Date(formData.date).toISOString().split('T')[0] : null,
                rating: parseInt(formData.rating, 10) || 0,
                invoice_url: formData.invoiceUrl || '',
                next_appointment: formData.nextAppointment ? new Date(formData.nextAppointment).toISOString().split('T')[0] : null
            };
            console.log('payload in handleLogEngagement=>>>>', payload)

            const res = await apiPost(url, payload);

            if (res.status === 200 || res.status === 201) {
                console.log('Engagement logged successfully:', res.data);
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Log Engagement added successfully!',
                });
                fetchEngagements();
            } else {
                console.error('Failed to log engagement:', res.data);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: res.data?.message || 'Failed to log engagement',
                });
            }
        } catch (error: any) {
            console.error('Error logging engagement:', error);
            if (error?.response?.data) {
                console.error('API Error Details (Log Engagement):', JSON.stringify(error.response.data, null, 2));
                setApiErrorData(error.response.data);
                setApiErrorModalVisible(true);
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: error?.message || 'An unexpected error occurred',
                });
            }
        }
    };

    const handleUploadAttachment = async (formData: any) => {
        try {
            if (!selectedContact) return;
            const url = `${ApiConstants.VENDORS_LIST_CONTACTS}${selectedContact.id}${ApiConstants.VENDORS_ATTACHMENTS}`;

            const data = new FormData();
            data.append('file', {
                uri: formData.file.uri,
                name: formData.file.name,
                type: formData.file.mimeType || 'application/octet-stream',
            } as any);

            if (formData.property_id) {
                data.append('property_id', formData.property_id.toString());
            }
            if (formData.is_medical) {
                data.append('is_medical', 'true');
            }

            const res = await apiPost(url, data, { isFormData: true });

            if (res.status === 200 || res.status === 201) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Attachment uploaded successfully',
                });
                setUploadAttachmentModalVisible(false);
                fetchAttachments();
            } else {
                throw new Error(res.data?.message || 'Upload failed');
            }
        } catch (error: any) {
            console.error('Error uploading attachment:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'Failed to upload attachment',
            });
            setUploadAttachmentModalVisible(false);
        }
    };


    const renderContent = () => {
        switch (activeTab) {
            case 'Overview':
                return (
                    <View style={styles.tabContainer}>
                        <Text style={styles.titleText}>{StringConstants.PROFILE}</Text>

                        <View style={styles.profileInfo}>
                            <Image source={Icons.ic_phonecall} style={styles.profileIcon} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.profileLabel}>PHONE NUMBER</Text>
                                <Text style={styles.valueText}>{selectedContact?.phone_number || 'No phone'}</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.profileInfo}
                            onPress={() => {
                                if (selectedContact?.email) {
                                    Linking.openURL(`mailto:${selectedContact.email}`).catch(err => {
                                        console.error('Failed to open email:', err);
                                        Toast.show({ type: 'error', text1: 'Error', text2: 'Could not open email app' });
                                    });
                                }
                            }}
                        >
                            <Image source={Icons.ic_gmail} style={styles.profileIcon} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.profileLabel}>EMAIL ADDRESS</Text>
                                <Text style={styles.valueText}>{selectedContact?.email || 'No email'}</Text>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.profileInfo}>
                            <Image source={Icons.ic_location2} style={styles.profileIcon} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.profileLabel}>ADDRESS</Text>
                                <Text style={styles.valueText}>
                                    {selectedContact?.address || (selectedContact as any)?.address_line1 || 'No address provided'}
                                </Text>
                            </View>
                        </View>

                        {type === 'vendor' && <TouchableOpacity
                            style={styles.profileInfo}
                            onPress={() => {
                                if (selectedContact?.website) {
                                    let url = selectedContact.website.trim();
                                    if (!url.startsWith('http://') && !url.startsWith('https://')) {
                                        url = `https://${url}`;
                                    }
                                    Linking.openURL(url).catch(err => {
                                        console.error('Failed to open website:', err);
                                        Toast.show({ type: 'error', text1: 'Error', text2: 'Could not open website' });
                                    });
                                }
                            }}
                        >
                            <Image source={Icons.ic_website} style={styles.profileIcon} />
                            <View style={[styles.infoTextContainer, { flexDirection: 'row', alignItems: 'flex-end', gap: 6 }]}>
                                <View style={{ width: '92%' }}>
                                    <Text style={styles.profileLabel}>WEBSITE</Text>
                                    <Text style={styles.valueText} numberOfLines={2} ellipsizeMode="tail">
                                        {selectedContact?.website || 'No website provided'}
                                    </Text>
                                </View>
                                <Image source={Icons.ic_open_link} style={{ width: 14, height: 14, tintColor: ColorConstants.DARK_CYAN, marginBottom: 2 }} />
                            </View>
                        </TouchableOpacity>}

                        {type === 'vendor' && <View style={styles.profileInfo}>
                            <Image source={Icons.ic_phonecall} style={styles.profileIcon} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.profileLabel}>EMERGENCY CONTACT</Text>
                                <Text style={styles.valueText}>{selectedContact?.emergency_contact || 'No emergency contact provided'}</Text>
                            </View>
                        </View>}

                        <View style={styles.profileInfo}>
                            <MaterialIcons name="visibility" size={18} color={ColorConstants.DARK_CYAN} style={styles.profileIcon} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.profileLabel}>VISIBILITY</Text>
                                <Text style={styles.valueText}>{(selectedContact as any)?.visibility_name || 'Shared'}</Text>
                            </View>
                        </View>

                        <View style={styles.profileInfo}>
                            <Image source={Icons.ic_doc2} style={styles.profileIcon} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.profileLabel}>NOTES</Text>
                                <Text style={styles.valueText}>{(selectedContact as any)?.notes || 'No notes'}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <Text style={styles.titleText}>{StringConstants.TAG}</Text>
                        <View style={styles.tagsContainer}>
                            {selectedContact?.tags && selectedContact?.tags.length > 0 ?
                                selectedContact?.tags.map((tag, index) => (
                                    <View key={index} style={[
                                        styles.tagBadge,
                                        tag.name.toLowerCase().includes('emergency') && { backgroundColor: ColorConstants.RED },
                                        tag.name.toLowerCase().includes('shared') && { backgroundColor: ColorConstants.PRIMARY_BROWN }
                                    ]}>
                                        <Text style={[
                                            styles.tagText,
                                            (tag.name.toLowerCase().includes('emergency') || tag.name.toLowerCase().includes('shared')) && { color: ColorConstants.WHITE }
                                        ]}>{tag.name}</Text>
                                    </View>
                                )) :
                                <Text style={styles.notags}>No tags</Text>

                            }
                        </View>

                        {selectedContact?.global_tags && selectedContact.global_tags.length > 0 ? (
                            <>
                                <Text style={[styles.titleText, { marginTop: 16 }]}>Global Tags</Text>
                                <View style={styles.tagsContainer}>
                                    {selectedContact.global_tags.map((tag, index) => (
                                        <View key={index} style={[styles.tagBadge, { backgroundColor: '#E0F2FE', borderColor: '#BAE6FD', borderWidth: 0.5 }]}>
                                            <Text style={[styles.tagText, { color: '#0369A1' }]}>{tag.name || tag.label}</Text>
                                        </View>
                                    ))}
                                </View>
                            </>
                        ) : (
                            <Text style={styles.notags}>No Global tags</Text>
                        )}

                        <View style={[styles.divider, { marginTop: 16 }]} />

                        <Text style={[styles.titleText, { marginTop: 4 }]}>Associated Properties</Text>
                        <View style={styles.propertiesContainer}>
                            {(selectedContact as any)?.properties && (selectedContact as any).properties.length > 0 ? (
                                (selectedContact as any).properties.map((prop: any, index: number) => (
                                    <View key={index} style={styles.propertyCard}>
                                        <Text style={styles.propertyName}>{capitalizeFirstLetter(prop.name)}</Text>
                                        <Text style={styles.propertyAddress}>{prop.full_address}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.valueText}>No associated properties.</Text>
                            )}
                        </View>

                        {(selectedContact as any)?.document_url && (
                            <>
                                <View style={[styles.divider, { marginTop: 16 }]} />
                                <Text style={[styles.titleText, { marginTop: 16 }]}>Document</Text>
                                <TouchableOpacity
                                    style={[styles.profileInfo, { marginTop: 8 }]}
                                    onPress={() => {
                                        const docUrl = (selectedContact as any).document_url;
                                        const fullUrl = docUrl.startsWith('http')
                                            ? docUrl
                                            : `${ApiConstants.MEDIA_URL}${docUrl}`;
                                        Linking.openURL(fullUrl).catch(err => {
                                            console.error('Failed to open PDF:', err);
                                            Toast.show({ type: 'error', text1: 'Error', text2: 'Could not open document' });
                                        });
                                    }}
                                >
                                    <Image source={Icons.ic_doc2} style={styles.profileIcon} />
                                    <View style={styles.infoTextContainer}>
                                        <Text style={styles.profileLabel}>FILE NAME</Text>
                                        <Text style={[styles.valueText, { color: ColorConstants.PRIMARY_BROWN, textDecorationLine: 'underline' }]}>
                                            {(selectedContact as any).document_url.split('/').pop()}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </>
                        )}
                        <View style={{ height: 20 }} />
                    </View >
                );
            case 'Engagements':
                return (
                    <View style={styles.tabContainer}>
                        <Text style={styles.titleText}>{StringConstants.ENGAGEMENT_HISTORY}</Text>
                        <TouchableOpacity
                            style={styles.logEngagementButton}
                            onPress={() => setLogEngagementModalVisible(true)}
                        >
                            <Text style={styles.logEngagementText}>{StringConstants.LOG_ENGAGEMENT}</Text>
                        </TouchableOpacity>
                        <FlatList
                            data={engagements}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <View style={[styles.contactCard, { marginHorizontal: 0, marginBottom: 12 }]}>
                                    <Text style={styles.title}>{item.title}</Text>
                                    <Text style={styles.description}>{item.notes}</Text>
                                    <Text style={styles.dateTime}>{formatDate(item.date)}</Text>
                                    <View style={styles.others}>
                                        <Image source={Icons.ic_star} style={styles.starIcon} />
                                        <Text style={styles.rating}>{item.rating}</Text>
                                        <TouchableOpacity onPress={() => {
                                            if (item.invoice_url) {
                                                Linking.openURL(item.invoice_url).catch(err => {
                                                    console.error('Failed to open URL:', err);
                                                    Toast.show({
                                                        type: 'error',
                                                        text1: 'Error',
                                                        text2: 'Failed to open invoice URL',
                                                    });
                                                });
                                            }
                                        }}>
                                            <Text style={styles.viewInvoice}>{StringConstants.VIEW_INVOICE}</Text>
                                        </TouchableOpacity>
                                        {item.next_appointment && (
                                            <View style={styles.nextDate}>
                                                <Text style={styles.nextDateText}>Next: {formatDate(item.next_appointment)}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.serviceBadge2}>
                                        <Text style={styles.serviceText}>{item.engagement_type_display}</Text>
                                    </View>
                                </View>
                            )}
                            scrollEnabled={false}
                            ListEmptyComponent={() => (
                                <Text style={styles.emptyText}>
                                    {loadingEngagements ? 'Loading engagements...' : 'No engagements found.'}
                                </Text>
                            )}
                        />
                    </View>
                );
            case 'Attachments':
                return (
                    <View style={styles.tabContainer}>
                        <View style={styles.tabHeader}>
                            <Text style={styles.titleText}>{StringConstants.ATTACHMENTS}</Text>
                            <TouchableOpacity
                                style={styles.addAttachmentButton}
                                onPress={() => setUploadAttachmentModalVisible(true)}
                            >
                                <MaterialIcons name="add" size={18} color={ColorConstants.WHITE} />
                                <Text style={styles.addAttachmentText}>Add Attachment</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={attachments}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.attachmentRow}
                                    onPress={() => {
                                        const fullUrl = item.file.startsWith('http') ? item.file : `${ApiConstants.MEDIA_URL}${item.file}`;
                                        Linking.openURL(fullUrl).catch(err => {
                                            console.error('Failed to open URL:', err);
                                            Toast.show({
                                                type: 'error',
                                                text1: 'Error',
                                                text2: 'Failed to open attachment',
                                            });
                                        });
                                    }}
                                >
                                    <Text style={styles.bullet}>&bull;</Text>
                                    <Text style={styles.attachments}>{item.file.split('/').pop() || 'Attachment'}</Text>
                                </TouchableOpacity>
                            )}
                            scrollEnabled={false}
                            ListEmptyComponent={() => (
                                <View style={styles.emptyStateContainer}>
                                    <MaterialIcons name="attachment" size={48} color={ColorConstants.GRAY2} style={styles.emptyStateIcon} />
                                    <Text style={styles.emptyStateTitle}>No attachments found.</Text>
                                    <Text style={styles.emptyStateSubtext}>Click "Add Attachment" to upload your first file.</Text>
                                </View>
                            )}
                        />
                    </View>
                );
            case 'Notes':
                return (
                    <View style={styles.tabContainer}>
                        <Text style={styles.titleText}>{StringConstants.NOTES}</Text>
                        <CustomTextInput
                            label={'Add Note'}
                            value={notes}
                            onChangeText={(text) => setNotes(text)}
                            placeholder={'Write a note...'}
                            multiline
                            multiStyles={styles.multilineInput}
                        />
                        <TouchableOpacity
                            style={[styles.addButton, { width: 90 }, savingNote && { opacity: 0.6 }]}
                            onPress={handleSaveNote}
                            disabled={savingNote}
                        >
                            <Text style={styles.addButtonText}>
                                {savingNote ? 'Saving...' : StringConstants.SAVE_NOTE}
                            </Text>
                        </TouchableOpacity>

                        <Text style={[styles.titleText, { marginTop: 20, marginBottom: 10 }]}>History</Text>
                        <FlatList
                            data={notesList}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <View style={[styles.contactCard, { marginHorizontal: 0, marginBottom: 10 }]}>
                                    <Text style={styles.noteTitles}>{item.note}</Text>
                                    <Text style={styles.dateTimeText}>
                                        {new Date(item.created_at).toLocaleString()}
                                    </Text>
                                </View>
                            )}
                            scrollEnabled={false}
                            ListEmptyComponent={() => (
                                <Text style={styles.emptyText}>
                                    {loadingNotes ? 'Loading notes...' : 'No notes found for this contact.'}
                                </Text>
                            )}
                        />

                        {selectedContact?.notes && (
                            <View style={[styles.contactCard, { marginHorizontal: 0 }]}>
                                <Text style={styles.noteTitles}>{selectedContact.notes}</Text>
                                <Text style={styles.dateTimeText}>Initial Note</Text>
                            </View>
                        )}
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={ColorConstants.WHITE} barStyle="dark-content" />
            <AddContactModal
                visible={editModalVisible}
                onClose={() => {
                    setEditModalVisible(false);
                }}
                onSave={handleSaveContact}
                isEdit={true}
                contactData={selectedContact}
                activeTabText={type === 'personal_contact' ? 'personal' : 'vendor'}
            />

            <LogEngagementModal
                visible={logEngagementModalVisible}
                onClose={() => setLogEngagementModalVisible(false)}
                onUpload={handleLogEngagement}
            />

            <DeleteConfirmationModal
                visible={deleteModalVisible}
                onClose={() => setDeleteModalVisible(false)}
                onDelete={handleDeleteContact}
                title={`Are you sure you want to delete ${selectedContact?.name}?`}
            />

            <ApiErrorModal
                visible={apiErrorModalVisible}
                errorData={apiErrorData}
                onClose={() => setApiErrorModalVisible(false)}
            />

            <UploadAttachmentModal
                visible={uploadAttachmentModalVisible}
                onClose={() => setUploadAttachmentModalVisible(false)}
                onUpload={handleUploadAttachment}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
                <Header
                    title={StringConstants.VENDORS_AND_CONTACTS}
                    subtitle="Manage vendors, family, & professional contacts"
                    tapOnBack={() => router.back()}
                />

                <View style={styles.contactCard}>
                    <View style={styles.contactHeader}>
                        <View style={styles.initialsContainer}>
                            {selectedContact?.logo_url ? (
                                <Image source={getImageUrl(selectedContact.logo_url)} style={styles.profileImage} />
                            ) : (
                                <Text style={styles.initialsText}>
                                    {selectedContact?.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'V'}
                                </Text>
                            )}
                        </View>

                        <View style={styles.contactInfo}>
                            <Text style={styles.contactName}>{selectedContact?.name || 'Vendor'}</Text>
                            <Text style={styles.contactCompany}></Text>
                        </View>
                        <View style={{ flexDirection: 'column' }}>
                            <View style={styles.moreButton}>
                                <Image source={Icons.ic_star} style={styles.moreIcon} />
                                <Text style={styles.ratingText}>{selectedContact?.rating || '0.0'}</Text>
                            </View>
                            <View style={styles.statusTagsRow}>
                                {(selectedContact?.category?.name || selectedContact?.category_name) &&
                                    <View style={styles.serviceBadge}>
                                        <Text style={styles.serviceText} numberOfLines={1}>{selectedContact?.category?.name || selectedContact?.category_name}</Text>
                                    </View>}
                                {selectedContact?.tags[0]?.name && (
                                    <View style={[
                                        styles.statusBadge,
                                        {
                                            backgroundColor: selectedContact.tags[0]?.name.toLowerCase() === 'shared'
                                                ? ColorConstants.PRIMARY_BROWN
                                                : ColorConstants.GRAY3
                                        }
                                    ]}>
                                        <Text style={[
                                            styles.statusText,
                                            {
                                                color: selectedContact.tags[0]?.name.toLowerCase() === 'shared'
                                                    ? ColorConstants.WHITE
                                                    : ColorConstants.BLACK2
                                            }
                                        ]}>
                                            {selectedContact?.tags[0]?.name || selectedContact?.visibility_name}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                    <View style={styles.statusTagsRow}>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => handleEditContact()}
                        >
                            <Text style={styles.addButtonText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.deleteBtn}
                            onPress={() => setDeleteModalVisible(true)}
                        >
                            <Text style={styles.addButtonText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {type === 'vendor' &&
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.tabBarContainer}
                        contentContainerStyle={styles.tabBar}
                    >
                        {tabs.map(tab => (
                            <Pressable
                                key={tab.key}
                                style={[
                                    styles.tabsView,
                                    activeTab === tab.key && styles.activeTabView,
                                ]}
                                onPress={() => handleTabPress(tab.key as 'Overview' | 'Engagements' | 'Attachments' | 'Notes')}
                            >
                                <Text
                                    style={[
                                        styles.tabLabel,
                                        activeTab === tab.key && styles.activeTabLabel,
                                    ]}
                                >
                                    {tab.label}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>}

                {type === 'personal_contact' ?
                    <View style={styles.tabContainer}>
                        <Text style={styles.titleText}>{StringConstants.PROFILE}</Text>

                        <View style={styles.profileInfo}>
                            <Image source={Icons.ic_phonecall} style={styles.profileIcon} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.profileLabel}>PHONE NUMBER</Text>
                                <Text style={styles.valueText}>{selectedContact?.phone_number || 'No phone'}</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.profileInfo}
                            onPress={() => {
                                if (selectedContact?.email) {
                                    Linking.openURL(`mailto:${selectedContact.email}`).catch(err => {
                                        console.error('Failed to open email:', err);
                                        Toast.show({ type: 'error', text1: 'Error', text2: 'Could not open email app' });
                                    });
                                }
                            }}
                        >
                            <Image source={Icons.ic_gmail} style={styles.profileIcon} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.profileLabel}>EMAIL ADDRESS</Text>
                                <Text style={styles.valueText}>{selectedContact?.email || 'No email'}</Text>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.profileInfo}>
                            <Image source={Icons.ic_location2} style={styles.profileIcon} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.profileLabel}>ADDRESS</Text>
                                <Text style={styles.valueText}>
                                    {selectedContact?.address || (selectedContact as any)?.address_line1 || 'No address provided'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.profileInfo}>
                            <MaterialIcons name="visibility" size={18} color={ColorConstants.DARK_CYAN} style={styles.profileIcon} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.profileLabel}>VISIBILITY</Text>
                                <Text style={styles.valueText}>{(selectedContact as any)?.visibility_name || 'Shared'}</Text>
                            </View>
                        </View>

                        <View style={styles.profileInfo}>
                            <Image source={Icons.ic_doc2} style={styles.profileIcon} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.profileLabel}>NOTES</Text>
                                <Text style={styles.valueText}>{(selectedContact as any)?.notes || 'No notes'}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <Text style={styles.titleText}>{StringConstants.TAG}</Text>
                        <View style={styles.tagsContainer}>
                            {selectedContact?.tags && selectedContact?.tags.length > 0 ?
                                selectedContact?.tags.map((tag, index) => (
                                    <View key={index} style={[
                                        styles.tagBadge,
                                        tag.name.toLowerCase().includes('emergency') && { backgroundColor: ColorConstants.RED },
                                        tag.name.toLowerCase().includes('shared') && { backgroundColor: ColorConstants.PRIMARY_BROWN }
                                    ]}>
                                        <Text style={[
                                            styles.tagText,
                                            (tag.name.toLowerCase().includes('emergency') || tag.name.toLowerCase().includes('shared')) && { color: ColorConstants.WHITE }
                                        ]}>{tag.name}</Text>
                                    </View>
                                )) :
                                <Text style={styles.notags}>No tags</Text>

                            }
                        </View>

                        {selectedContact?.global_tags && selectedContact.global_tags.length > 0 ? (
                            <>
                                <Text style={[styles.titleText, { marginTop: 16 }]}>Global Tags</Text>
                                <View style={styles.tagsContainer}>
                                    {selectedContact.global_tags.map((tag, index) => (
                                        <View key={index} style={[styles.tagBadge, { backgroundColor: '#E0F2FE', borderColor: '#BAE6FD', borderWidth: 0.5 }]}>
                                            <Text style={[styles.tagText, { color: '#0369A1' }]}>{tag.name || tag.label}</Text>
                                        </View>
                                    ))}
                                </View>
                            </>
                        ) : (
                            <Text style={styles.notags}>No Global tags</Text>
                        )}

                        <View style={[styles.divider, { marginTop: 16 }]} />

                        <Text style={[styles.titleText, { marginTop: 4 }]}>Associated Properties</Text>
                        <View style={styles.propertiesContainer}>
                            {(selectedContact as any)?.properties && (selectedContact as any).properties.length > 0 ? (
                                (selectedContact as any).properties.map((prop: any, index: number) => (
                                    <View key={index} style={styles.propertyCard}>
                                        <Text style={styles.propertyName}>{capitalizeFirstLetter(prop.name)}</Text>
                                        <Text style={styles.propertyAddress}>{prop.full_address}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.valueText}>No associated properties.</Text>
                            )}
                        </View>

                        {(selectedContact as any)?.document_url && (
                            <>
                                <View style={[styles.divider, { marginTop: 16 }]} />
                                <Text style={[styles.titleText, { marginTop: 16 }]}>Document</Text>
                                <TouchableOpacity
                                    style={[styles.profileInfo, { marginTop: 8 }]}
                                    onPress={() => {
                                        const docUrl = (selectedContact as any).document_url;
                                        const fullUrl = docUrl.startsWith('http')
                                            ? docUrl
                                            : `${ApiConstants.MEDIA_URL}${docUrl}`;
                                        Linking.openURL(fullUrl).catch(err => {
                                            console.error('Failed to open PDF:', err);
                                            Toast.show({ type: 'error', text1: 'Error', text2: 'Could not open document' });
                                        });
                                    }}
                                >
                                    <Image source={Icons.ic_doc2} style={styles.profileIcon} />
                                    <View style={styles.infoTextContainer}>
                                        <Text style={styles.profileLabel}>FILE NAME</Text>
                                        <Text style={[styles.valueText, { color: ColorConstants.PRIMARY_BROWN, textDecorationLine: 'underline' }]}>
                                            {(selectedContact as any).document_url.split('/').pop()}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </>
                        )}
                        <View style={{ height: 20 }} />
                    </View > :
                    renderContent()
                }


            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorConstants.WHITE,
    },
    contactCard: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        marginTop: 10,
        marginHorizontal: 20
    },
    contactHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    initialsContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: ColorConstants.LIGHT_PEACH,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        resizeMode: 'cover'
    },
    initialsText: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 14,
        color: ColorConstants.PRIMARY_BROWN,
    },
    contactInfo: {
        flex: 1,
    },
    contactName: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.BLACK2,
        marginBottom: 2,
        marginRight: -100
    },
    contactCompany: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
    },
    moreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginBottom: 5,
    },
    moreIcon: {
        marginRight: 3
    },
    ratingText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
    },
    statusTagsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 15
    },
    statusText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 10,
    },
    serviceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 2,
        paddingHorizontal: 10,
        borderRadius: 15,
        marginRight: 6,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        marginTop: 5
    },
    serviceBadge2: {
        paddingVertical: 2,
        paddingHorizontal: 12,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        alignSelf: 'flex-start',
    },
    serviceText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 11,
        color: ColorConstants.BLACK2,
        textAlign: 'center',
    },
    emptyText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 12,
        color: ColorConstants.GRAY,
        textAlign: 'center',
        marginVertical: 40
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        borderRadius: 8,
        flexShrink: 0,
        width: 60,
        height: 35,
        marginRight: 10
    },
    addButtonText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 13,
        color: ColorConstants.WHITE,
    },
    deleteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: ColorConstants.RED,
        borderRadius: 8,
        flexShrink: 0,
        width: 68,
        height: 35,
        marginRight: 10
    },
    tabBarContainer: {
        marginHorizontal: 20,
        backgroundColor: ColorConstants.LIGHT_PEACH,
        borderRadius: 8,
        height: 33,
        marginTop: 12,
        marginBottom: 5,
    },
    tabBar: {
        alignItems: 'center',
        flexDirection: 'row',
        paddingLeft: 3,
    },
    tabsView: {
        height: 20,
        paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        marginRight: 6,
    },
    activeTabView: {
        height: 27,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 6,
    },
    activeTabLabel: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 13,
        color: ColorConstants.BLACK2
    },
    tabLabel: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 13,
        color: ColorConstants.BLACK2
    },
    profileContainer: {
        flex: 1,
    },
    titleText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.BLACK2,
        marginBottom: 4
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginVertical: 10
    },
    profileIcon: {
        width: 18,
        height: 18,
        marginTop: 2,
        tintColor: ColorConstants.DARK_CYAN,
        resizeMode: 'contain'
    },
    infoTextContainer: {
        flex: 1,
    },
    profileLabel: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 10,
        color: ColorConstants.GRAY,
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    valueText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    propertiesContainer: {
        marginTop: 8,
        gap: 12
    },
    propertyCard: {
        backgroundColor: '#FFFBE6',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#F1E9CE'
    },
    propertyName: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        marginBottom: 4
    },
    propertyAddress: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN
    },
    divider: {
        height: 1,
        backgroundColor: ColorConstants.GRAY3,
        marginVertical: 10
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        marginTop: 10
    },
    tabContainer: {
        flex: 1,
        marginBottom: 20,
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 8,
        padding: 15,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        marginTop: 10,
        marginHorizontal: 20
    },
    tagBadge: {
        backgroundColor: ColorConstants.GRAY3,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 15,
        marginRight: 6,
        marginBottom: 5,
        flexDirection: 'row',
    },
    tagText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 10,
        color: ColorConstants.BLACK2,
    },
    notags: {
        fontFamily: Fonts.ManropeLight,
        fontSize: 12,
        color: ColorConstants.GRAY,
    },
    customFieldText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
        marginVertical: 8
    },
    customFieldLabel: {
        color: ColorConstants.BLACK2,
    },
    logEngagementButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        borderRadius: 8,
        flexShrink: 0,
        width: 135,
        height: 35,
        marginVertical: 10
    },
    logEngagementText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 13,
        color: ColorConstants.WHITE,
    },
    title: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 15,
        color: ColorConstants.BLACK2,
    },
    description: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 13,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 3
    },
    dateTime: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 15,
    },
    others: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: 8
    },
    starIcon: {
        marginTop: 2
    },
    rating: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        marginLeft: 5
    },
    viewInvoice: {
        fontFamily: Fonts.mulishMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        textDecorationLine: 'underline',
        marginLeft: 15
    },
    nextDate: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 15,
        backgroundColor: ColorConstants.GRAY3,
        marginHorizontal: 10,
        marginTop: 6,
    },
    nextDateText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 12,
        color: ColorConstants.BLACK2,
    },
    attachmentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 7
    },
    bullet: {
        fontSize: 20,
        marginRight: 6,
        color: ColorConstants.DARK_CYAN,
    },
    attachments: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
        textDecorationLine: 'underline',
    },
    multilineInput: {
        minHeight: 60,
        paddingBottom: 10,
    },
    noteTitles: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.BLACK2,
        marginBottom: 2
    },
    dateTimeText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
    },
    tabHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    addAttachmentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        gap: 4,
    },
    addAttachmentText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 13,
        color: ColorConstants.WHITE,
    },
    emptyStateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyStateIcon: {
        transform: [{ rotate: '45deg' }],
        marginBottom: 16,
        opacity: 0.5,
    },
    emptyStateTitle: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 16,
        color: ColorConstants.BLACK2,
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.GRAY,
        textAlign: 'center',
    },
});