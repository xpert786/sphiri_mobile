import { apiGet, apiPost } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import Header from '@/components/Header';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { handleDownload } from '@/constants/Helper';
import { StringConstants } from '@/constants/StringConstants';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface Tag {
  id: number;
  name: string;
}

interface SharedContact {
  id: number;
  name: string;
  display_name: string;
  company: string;
  category: string;
  category_display: string;
  tags: Tag[];
  rating: string;
  visibility: string;
}

interface SharedReminder {
  id: number;
  title: string;
  description: string;
  reminder_date: string;
  reminder_time: string;
  assigned_to_display: string;
  days_left: number;
  priority: number;
  priority_display: string;
  priority_color: string;
  category: number;
  category_name: string;
  related_contact: any;
  related_contact_name: any;
  status: string;
  status_display: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

interface SharedDocument {
  id: number;
  title: string;
  file?: string;
  file_url?: string;
  url?: string;
  document?: string;
  attachment?: string;
  file_type: string;
  file_size: number;
  file_size_display: string;
  category: number;
  category_name: string;
  issue_date: string;
  expiration_date: string;
  expiration_status: string;
  status: string;
  is_shared: boolean;
  uploaded_by: string;
  linked_contacts: any[];
  tags_list: string[];
  created_at: string;
  updated_at: string;
}

interface Invite {
  id: number;
  inviter_name: string;
  inviter_email: string;
  role: string;
  role_display: string;
  relationship: string;
  relationship_display: string;
  status: string;
  invited_at: string;
  invitation_message?: string;
}

interface DashboardData {
  welcome_message: string;
  shared_contacts: SharedContact[];
  shared_contacts_count: number;
  shared_reminders: SharedReminder[];
  shared_reminders_count: number;
  shared_documents: SharedDocument[];
  shared_documents_count: number;
}

export default function TrusteeView({ userData }: any) {
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [accessBlocked, setAccessBlocked] = useState<boolean>(false);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [inviteProcessingId, setInviteProcessingId] = useState<number | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      fetchInvites();
      fetchDashboardData();

      const onBackPress = () => {
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [])
  );

  useFocusEffect(
    React.useCallback(() => {
      fetchInvites();
      fetchDashboardData();
    }, [])
  );


  const fetchInvites = async () => {
    try {
      const response = await apiGet(ApiConstants.SHOW_INVITE);
      console.log("response in invites", response.data);

      if (response.status === 200) {
        const data = response.data?.results || response.data;
        if (Array.isArray(data)) {
          const pendingInvites = data.filter((inv: Invite) => inv.status === 'pending');
          setInvites(pendingInvites);
        }
      }
    } catch (error) {
      console.error('Error fetching invites:', error);
    }
  };

  const handleAcceptInvite = async (inviteId: number) => {
    try {
      setInviteProcessingId(inviteId);
      const response = await apiPost(`${ApiConstants.SHOW_INVITE}${inviteId}${ApiConstants.ACCEPT_INVITE}`, {});
      if (response.status === 200 || response.status === 201) {
        Alert.alert('Success', 'Invite accepted successfully');
        setInvites(prev => prev.filter(inv => inv.id !== inviteId));
        fetchDashboardData();
      }
    } catch (error: any) {
      console.error('Error accepting invite:', error);
      const errorMsg = error?.response?.data?.detail || 'Failed to accept invite';
      Alert.alert('Error', errorMsg);
    } finally {
      setInviteProcessingId(null);
    }
  };

  const handleRejectInvite = async (inviteId: number) => {
    try {
      setInviteProcessingId(inviteId);
      const response = await apiPost(`${ApiConstants.SHOW_INVITE}${inviteId}${ApiConstants.REJECT_INVITE}`, {});
      if (response.status === 200 || response.status === 201) {
        Alert.alert('Info', 'Invite rejected');
        setInvites(prev => prev.filter(inv => inv.id !== inviteId));
      }
    } catch (error: any) {
      console.error('Error rejecting invite:', error);
      const errorMsg = error?.response?.data?.detail || 'Failed to reject invite';
      Alert.alert('Error', errorMsg);
    } finally {
      setInviteProcessingId(null);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiGet(ApiConstants.FAMILY_MEMBERSDHASBOARD);
      console.log("response in trustee view", JSON.stringify(response.data));

      if (response.status === 200) {
        setDashboardData(response.data);
        if (response.data.shared_documents?.length > 0) {
          setSelectedDocumentId(response.data.shared_documents[0].id);
        }
      }
      else if (response.status === 403) {
        setAccessBlocked(true)
      }
    } catch (error: any) {
      if (error?.response?.status === 403) {
        setAccessBlocked(true);
      } else {
        console.error('Error fetching dashboard data:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const tapOnDownloadIcon = async (document: SharedDocument) => {
    console.log('document.id in tapOnDownloadIcon:', document.id)
    setDownloadingId(document.id)
    const url = ApiConstants.BASE_URL + ApiConstants.SHARED_DOCUMENTS_LIST + document.id + '/download/'

    try {
      setLoading(true);
      const response = await apiGet(url);
      if (response.status === 200) {
        console.log('res in tapOnDownloadIcon:', JSON.stringify(response.data));
        handleDownload(response?.data?.file_url)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setDownloadingId(null);
      setLoading(false);
    }
  };

  const renderInviteCard = (invite: Invite) => (
    <View key={invite.id} style={styles.inviteCard}>
      <View style={styles.inviteInfo}>
        <Text style={styles.inviteTitle}>
          {invite.inviter_name || invite.inviter_email}
        </Text>
        <Text style={styles.inviteSubtitle}>
          has invited you as {invite.role_display || invite.role}
        </Text>
        {!!invite.relationship_display && (
          <Text style={styles.inviteRelation}>
            Relationship: {invite.relationship_display}
          </Text>
        )}
        {!!invite.invitation_message ? (
          <Text style={styles.inviteMessage}>"{invite.invitation_message}"</Text>
        ) : null}
      </View>
      <View style={styles.inviteActions}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleAcceptInvite(invite.id)}
          disabled={inviteProcessingId === invite.id}
        >
          {inviteProcessingId === invite.id ? (
            <ActivityIndicator size="small" color={ColorConstants.WHITE} />
          ) : (
            <Text style={styles.acceptButtonText}>Accept</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => handleRejectInvite(invite.id)}
          disabled={inviteProcessingId === invite.id}
        >
          <Text style={styles.rejectButtonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && invites.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={ColorConstants.PRIMARY_BROWN} />
      </View>
    );
  }

  if (accessBlocked && invites.length === 0) {
    return (
      <View style={styles.container}>
        <Header
          title={StringConstants.FAMILY_DASHBOARD}
          showBackArrow={false}
          containerStyle={{ paddingTop: 20 }}
        />
        <View style={styles.lockedContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={64}
            color={ColorConstants.GRAY}
            style={{ marginBottom: 20 }}
          />
          <Text style={styles.lockedTitle}>Access Restricted</Text>
          <Text style={styles.lockedSubtitle}>
            You don't have permission to view this dashboard.{'\n'}Please contact the homeowner to grant access.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title={StringConstants.FAMILY_DASHBOARD}
        subtitle={dashboardData?.welcome_message}
        showBackArrow={false}
        containerStyle={{ paddingTop: 20 }}
      />

      <ScrollView contentContainerStyle={styles.contentContainer}>

        {/* Pending Invites Section */}
        {invites.length > 0 && (
          <View style={styles.inviteSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pending Invites</Text>
              <Text style={styles.sectionSubtitle}>You have {invites.length} pending invite{invites.length > 1 ? 's' : ''}</Text>
            </View>
            {invites.map(renderInviteCard)}
          </View>
        )}

        {/* Only show dashboard sections when access is not blocked */}
        {!accessBlocked && (
          <>
            {/* Shared Contacts Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Shared Contacts</Text>
                <Text style={styles.sectionSubtitle}>Contacts shared with you by the homeowner</Text>
              </View>


              <FlatList
                data={dashboardData?.shared_contacts ?? []}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.contactCard}>
                    <View style={styles.cardHeader}>
                      <View style={styles.cardInfo}>
                        <Text style={styles.cardTitle}>{item.display_name}</Text>
                        <Text style={styles.cardSubtitle}>{item.category_display}</Text>
                      </View>

                      <TouchableOpacity
                        style={styles.viewButton}
                        onPress={() =>
                          router.push({
                            pathname: '/(root)/(drawer)/view-contacts',
                            params: { id: item.id },
                          })
                        }
                      >
                        <Image source={Icons.ic_eye} style={styles.eyeIcon} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.cardFooter}>
                      {item.tags.map((tag) => (
                        <View key={tag.id} style={styles.tagBadge}>
                          <Text style={styles.tagText}>{tag.name}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No contacts found</Text>
                }
              />

            </View>

            {/* Shared Reminders Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Shared Reminders</Text>
                <Text style={styles.sectionSubtitle}>Tasks and reminders assigned to you</Text>
              </View>

              <FlatList
                data={dashboardData?.shared_reminders ?? []}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.reminderCard}>
                    <View style={styles.reminderRow}>
                      <View style={styles.reminderInfo}>
                        <Text
                          style={[
                            styles.reminderTitle,
                            item.is_completed && styles.completedText,
                          ]}
                        >
                          {item.title}
                        </Text>

                        <Text style={styles.reminderSubtitle}>
                          Assigned: {item.assigned_to_display} • {item.status_display}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.reminderFooter}>
                      <View style={styles.timeContainer}>
                        <Image source={Icons.ic_clock} style={styles.clockIcon} />
                        <Text style={styles.timeText}>
                          {item.days_left < 0
                            ? `${Math.abs(item.days_left)} days ago`
                            : `${item.days_left} days left`}
                        </Text>
                      </View>

                      {!!item.priority_display && (
                        <View
                          style={[
                            styles.priorityBadge,
                            {
                              backgroundColor:
                                item.priority_display === 'High Priority'
                                  ? ColorConstants.RED
                                  : ColorConstants.ORANGE,
                            },
                          ]}
                        >
                          <Text style={styles.priorityText}>
                            {item.priority_display}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No reminders found</Text>
                }
              />


            </View>

            {/* Shared Documents Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Shared Documents</Text>
                <Text style={styles.sectionSubtitle}>Documents shared with you</Text>
              </View>

              <FlatList
                data={dashboardData?.shared_documents ?? []}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                extraData={{ selectedDocumentId, downloadingId }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.documentCard,
                      selectedDocumentId === item.id && styles.highlightedCard,
                    ]}
                    onPress={() => setSelectedDocumentId(item.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.docHeader}>
                      <Text style={styles.docTitle}>{item.title}</Text>

                      {!!item.category_name && (
                        <View style={styles.categoryBadge}>
                          <Text style={styles.categoryText}>{item.category_name}</Text>
                        </View>
                      )}
                    </View>

                    {!!item.expiration_status && (
                      <View style={styles.expiryContainer}>
                        <Image source={Icons.ic_warn} style={styles.warnIcon} />
                        <Text style={styles.expiryText}>
                          {item.expiration_status}: {item.expiration_date}
                        </Text>
                      </View>
                    )}

                    {!!item.issue_date && (
                      <View style={styles.issueDateContainer}>
                        <Image source={Icons.ic_clock} style={styles.clockIcon} />
                        <Text style={styles.issueDateText}>
                          Issued: {item.issue_date}
                        </Text>
                      </View>
                    )}

                    <View style={styles.docActions}>
                      <TouchableOpacity
                        style={[
                          styles.actionIcon,
                          selectedDocumentId === item.id && styles.selectedActionIcon,
                        ]}
                        onPress={() => tapOnDownloadIcon(item)}
                        disabled={downloadingId === item.id}
                      >
                        {downloadingId === item.id ? (
                          <ActivityIndicator
                            size="small"
                            color={ColorConstants.PRIMARY_BROWN}
                          />
                        ) : (
                          <Image
                            source={Icons.ic_download_bottom}
                            style={styles.iconStyle}
                          />
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.actionIcon,
                          selectedDocumentId === item.id && styles.selectedActionIcon,
                        ]}
                        onPress={() =>
                          router.push({
                            pathname: '/(root)/(drawer)/view-shared-docs',
                            params: { id: item.id },
                          })
                        }
                      >
                        <Image source={Icons.ic_eye} style={styles.iconStyle} />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No documents found</Text>
                }
              />

            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorConstants.WHITE,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  lockIcon: {
    width: 64,
    height: 64,
    tintColor: ColorConstants.GRAY,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  lockedTitle: {
    fontFamily: Fonts.ManropeSemiBold,
    fontSize: 20,
    color: ColorConstants.BLACK2,
    marginBottom: 10,
    textAlign: 'center',
  },
  lockedSubtitle: {
    fontFamily: Fonts.mulishRegular,
    fontSize: 14,
    color: ColorConstants.GRAY,
    textAlign: 'center',
    lineHeight: 22,
  },
  contentContainer: {
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  welcomeMessage: {
    fontFamily: Fonts.ManropeMedium,
    fontSize: 14,
    color: ColorConstants.BLACK2,
    marginTop: 16,
    marginBottom: 8,
  },
  section: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: ColorConstants.GRAY3,
    borderRadius: 16,
    padding: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: Fonts.ManropeMedium,
    fontSize: 20,
    color: ColorConstants.BLACK2,
  },
  sectionSubtitle: {
    fontFamily: Fonts.mulishRegular,
    fontSize: 12,
    color: ColorConstants.GRAY,
  },
  contactCard: {
    backgroundColor: ColorConstants.WHITE,
    borderWidth: 1,
    borderColor: ColorConstants.GRAY3,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  highlightedCard: {
    borderColor: ColorConstants.REDDISH_BROWN,
    backgroundColor: ColorConstants.PRIMARY_10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    resizeMode: 'contain'
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: Fonts.ManropeMedium,
    fontSize: 16,
    color: ColorConstants.BLACK2,
  },
  cardSubtitle: {
    fontFamily: Fonts.mulishRegular,
    fontSize: 12,
    color: ColorConstants.DARK_CYAN,
  },
  viewButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: ColorConstants.GRAY_SHADE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeIcon: {
    width: 16,
    height: 16,
    tintColor: ColorConstants.BLACK2,
    resizeMode: 'contain'
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  sharedBadge: {
    backgroundColor: ColorConstants.PRIMARY_BROWN,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontFamily: Fonts.interMedium,
    fontSize: 10,
    color: ColorConstants.WHITE,
  },
  tagLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagLabelText: {
    fontFamily: Fonts.ManropeMedium,
    fontSize: 10,
    color: ColorConstants.DARK_CYAN,
  },
  tinyArrow: {
    width: 8,
    height: 8,
    tintColor: ColorConstants.GRAY,
  },
  tagBadge: {
    backgroundColor: ColorConstants.GRAY3,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  tagText: {
    fontFamily: Fonts.ManropeMedium,
    fontSize: 10,
    color: ColorConstants.BLACK2,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    color: '#999',
    fontSize: 11,
    fontFamily: Fonts.ManropeRegular
  },
  reminderCard: {
    backgroundColor: ColorConstants.WHITE,
    borderWidth: 1,
    borderColor: ColorConstants.GRAY3,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: ColorConstants.REDDISH_BROWN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: ColorConstants.REDDISH_BROWN,
  },
  checkIcon: {
    width: 12,
    height: 12,
    tintColor: ColorConstants.WHITE,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontFamily: Fonts.ManropeMedium,
    fontSize: 16,
    color: ColorConstants.BLACK2,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: ColorConstants.GRAY,
  },
  reminderSubtitle: {
    fontFamily: Fonts.mulishRegular,
    fontSize: 12,
    color: ColorConstants.DARK_CYAN,
  },
  reminderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clockIcon: {
    width: 14,
    height: 14,
    tintColor: ColorConstants.GRAY,
  },
  timeText: {
    marginLeft: 6,
    fontFamily: Fonts.mulishRegular,
    fontSize: 12,
    color: ColorConstants.DARK_CYAN,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  priorityText: {
    fontFamily: Fonts.interMedium,
    fontSize: 10,
    color: ColorConstants.WHITE,
  },
  documentCard: {
    backgroundColor: ColorConstants.WHITE,
    borderWidth: 1,
    borderColor: ColorConstants.GRAY3,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  docHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  docTitle: {
    fontFamily: Fonts.ManropeMedium,
    fontSize: 16,
    color: ColorConstants.BLACK2,
    flex: 1,
    marginRight: 8,
  },
  categoryBadge: {
    backgroundColor: ColorConstants.GRAY3,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryText: {
    fontFamily: Fonts.ManropeMedium,
    fontSize: 10,
    color: ColorConstants.BLACK2,
  },
  issueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  issueDateText: {
    marginLeft: 6,
    fontFamily: Fonts.mulishRegular,
    fontSize: 12,
    color: ColorConstants.BLUE,
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  warnIcon: {
    width: 14,
    height: 14,
    tintColor: ColorConstants.RED,
  },
  expiryText: {
    marginLeft: 6,
    fontFamily: Fonts.interRegular,
    fontSize: 12,
    color: ColorConstants.RED,
  },
  docActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 16,
  },
  actionIcon: {
    padding: 4,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedActionIcon: {
    backgroundColor: ColorConstants.GRAY3,
    borderRadius: 8,
  },
  iconStyle: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    tintColor: ColorConstants.BLACK2,
  },
  inviteSection: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: ColorConstants.REDDISH_BROWN,
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#FFF9F7',
  },
  inviteCard: {
    backgroundColor: ColorConstants.WHITE,
    borderWidth: 1,
    borderColor: ColorConstants.GRAY3,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  inviteInfo: {
    marginBottom: 12,
  },
  inviteTitle: {
    fontFamily: Fonts.ManropeMedium,
    fontSize: 16,
    color: ColorConstants.BLACK2,
  },
  inviteSubtitle: {
    fontFamily: Fonts.mulishRegular,
    fontSize: 13,
    color: ColorConstants.DARK_CYAN,
    marginTop: 4,
  },
  inviteRelation: {
    fontFamily: Fonts.mulishRegular,
    fontSize: 12,
    color: ColorConstants.GRAY,
    marginTop: 4,
  },
  inviteMessage: {
    fontFamily: Fonts.mulishRegular,
    fontSize: 12,
    color: ColorConstants.DARK_CYAN,
    marginTop: 8,
    fontStyle: 'italic',
  },
  inviteActions: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: ColorConstants.PRIMARY_BROWN,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: {
    fontFamily: Fonts.ManropeMedium,
    fontSize: 14,
    color: ColorConstants.WHITE,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: ColorConstants.WHITE,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ColorConstants.RED,
  },
  rejectButtonText: {
    fontFamily: Fonts.ManropeMedium,
    fontSize: 14,
    color: ColorConstants.RED,
  },
});