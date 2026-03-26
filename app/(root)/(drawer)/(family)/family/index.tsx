import { apiGet, apiPatch } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import CommonButton from '@/components/CommonButton';
import Header from '@/components/Header';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { StringConstants } from '@/constants/StringConstants';
import DeleteConfirmationModal from '@/modals/DeleteConfirmationModal';
import EditFamilyMemberModal from '@/modals/EditFamilyMemberModal';
import InviteFamilyMemberModal from '@/modals/InviteFamilyMemberModal';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

const width = Dimensions.get('window').width;

interface FamilyMember {
    id: number;
    first_name: string;
    last_name: string;
    invitee_email: string;
    invitee_name: string;
    nickname: string;
    relationship: string;
    relationship_display: string;
    role: string;
    role_display: string;
    status: string;
    invited_at: string;
    accepted_at: string | null;
    profile_picture: string | null;
    has_emergency_access?: boolean;
    can_view_contacts?: boolean;
    can_create_contacts?: boolean;
    can_edit_contacts?: boolean;
    can_delete_contacts?: boolean;
    can_view_documents?: boolean;
    can_upload_documents?: boolean;
    can_edit_documents?: boolean;
    can_delete_documents?: boolean;
    can_view_reminders?: boolean;
    can_create_reminders?: boolean;
    can_edit_reminders?: boolean;
    can_delete_reminders?: boolean;
}

interface ActivityItem {
    id: number;
    member_name: string;
    member_email: string;
    action: string;
    action_display: string;
    content_type: string;
    content_type_display: string;
    content_id: number;
    content_title: string;
    description: string;
    time_ago: string;
    created_at: string;
}

const ACTIVITY_FEED: ActivityItem[] = [];

export default function Family() {
    const [members, setMembers] = useState<FamilyMember[]>([]);
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activitiesLoading, setActivitiesLoading] = useState(true);
    const [inviteModalVisible, setInviteModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    useEffect(() => {
        fetchFamilyMembers();
        fetchActivities();
    }, []);

    const fetchFamilyMembers = async () => {
        try {
            setLoading(true);
            const response = await apiGet(ApiConstants.MEMBERS);
            if (response.data && response.data.results) {
                setMembers(response.data.results);
                setCurrentPage(1);
            }
        } catch (error) {
            console.error('Error fetching family members:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(members.length / pageSize) || 1);
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [members.length]);

    const fetchActivities = async () => {
        try {
            setActivitiesLoading(true);
            const response = await apiGet(ApiConstants.MEMBERS_ACTIVITY);
            if (response.data && response.data.results) {
                setActivities(response.data.results);
            }
        } catch (error) {
            console.error('Error fetching family activity:', error);
        } finally {
            setActivitiesLoading(false);
        }
    };

    const handleUpdateMember = async (data: any) => {
        if (!selectedMember) return;
        try {
            const payload = {
                first_name: data.name ? data.name.split(' ')[0] : '',
                last_name: data.name ? data.name.split(' ').slice(1).join(' ') : '',
                invitee_email: data.email,
                relationship: selectedMember.relationship || '',
                role: data.role.toLowerCase().includes('co-manager') ? 'co-manager' : (data.role.toLowerCase().includes('editor') ? 'editor' : 'viewer'),
                personal_message: '',
                can_view_contacts: selectedMember.can_view_contacts ?? true,
                can_create_contacts: selectedMember.can_create_contacts ?? false,
                can_view_reminders: selectedMember.can_view_reminders ?? false,
                can_create_reminders: selectedMember.can_create_reminders ?? false,
                can_view_documents: selectedMember.can_view_documents ?? false,
                can_upload_documents: selectedMember.can_upload_documents ?? false,
                emergency_access: data.isEmergency ?? false,
            };

            const response = await apiPatch(`${ApiConstants.MEMBERS}${selectedMember.id}/`, payload);
            if (response.status === 200 || response.status === 204) {
                setEditModalVisible(false);
                fetchFamilyMembers();
            }
        } catch (error) {
            console.error('Error updating member:', error);
        }
    };

    const tapOnSaveInvite = async (payload: any) => {
        try {
            setLoading(true);
            const memberId = payload.member_id;
            if (!memberId) throw new Error("Member ID is missing");

            const response = await apiPatch(`${ApiConstants.MEMBERS}${memberId}/`, payload);
            if (response.status === 200 || response.status === 204) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Invitation sent successfully'
                });
                setInviteModalVisible(false);
                fetchFamilyMembers();
            }
        } catch (error: any) {
            console.error('Error sending invitation:', error);
            console.error('Error response:', error?.response?.status, JSON.stringify(error?.response?.data));
            const errorMsg = error?.response?.data?.detail || error?.response?.data?.invitee_email?.[0] || JSON.stringify(error?.response?.data) || 'Failed to send invitation';
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: errorMsg
            });
        } finally {
            setLoading(false);
        }
    };

    const getMemberDisplayName = (member: FamilyMember) => {
        if (member.invitee_name) return member.invitee_name;
        const fullName = `${member.first_name || ''} ${member.last_name || ''}`.trim();
        return fullName || member.invitee_email || 'Family Member';
    };

    const getMemberInitials = (member: FamilyMember) => {
        const name = getMemberDisplayName(member);
        const parts = name.split(' ').filter(Boolean);
        const first = parts[0]?.[0] ?? '';
        const second = parts[1]?.[0] ?? '';
        return (first + second).toUpperCase() || (name[0]?.toUpperCase() ?? '?');
    };

    const renderMemberCard = ({ item }: { item: FamilyMember }) => {
        const member = item;
        const hasProfilePic = !!member.profile_picture;

        return (
            <View style={styles.memberCard}>
                <View style={styles.memberHeader}>
                    {hasProfilePic ? (
                        <Image
                            source={{ uri: ApiConstants.MEDIA_URL + member.profile_picture }}
                            style={styles.memberAvatar}
                        />
                    ) : (
                        <View style={styles.memberInitialsCircle}>
                            <Text style={styles.memberInitialsText}>{getMemberInitials(member)}</Text>
                        </View>
                    )}
                    <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>{getMemberDisplayName(member)}</Text>
                        <Text style={styles.memberEmail}>{member.invitee_email}</Text>
                    </View>
                </View>

                <View style={styles.tagsContainer}>
                    <View style={styles.roleTag}>
                        <Text style={styles.roleText}>{member.role_display}</Text>
                    </View>
                    {member.status === 'accepted' ? (
                        <View style={styles.statusTagBasic}>
                            <Text style={styles.statusTextBasic}>{member.status}</Text>
                        </View>
                    ) : (
                        <View style={styles.statusTag}>
                            <Text style={styles.statusText}>{member.status}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.cardActions}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => {
                            router.push({
                                pathname: '/(root)/(drawer)/(family)/family/permissions',
                                params: { member: JSON.stringify(member) }
                            });
                        }}
                    >
                        <Image source={Icons.ic_settings} style={styles.actionIcon} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => {
                            setSelectedMember(member);
                            setEditModalVisible(true);
                        }}
                    >
                        <Image source={Icons.ic_edit} style={styles.actionIcon} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => {
                            setSelectedMember(member);
                            setDeleteModalVisible(true);
                        }}
                    >
                        <Image source={Icons.ic_bin2} style={styles.actionIcon} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const totalPages = Math.max(1, Math.ceil(members.length / pageSize) || 1);
    const paginatedMembers = members.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const renderActivityItem = (item: ActivityItem) => (
        <View key={item.id} style={styles.activityCard}>
            <View style={styles.activityIconContainer}>
                {/* Using a background color/container for the icon */}
                <View style={[styles.iconBox]}>
                    <Image
                        source={item.action === 'created' ? Icons.ic_plus : (item.action === 'downloaded' ? Icons.ic_download : Icons.ic_eye)}
                        style={styles.activityTypeIcon}
                    />
                </View>
            </View>
            <View style={styles.activityContent}>
                <Text style={styles.activityText}>
                    <Text style={styles.activityName}>{item.member_name}</Text>
                    <Text style={styles.activityAction}> {item.action_display} </Text>
                    <Text style={styles.activityTarget}>{item.content_title}</Text>
                </Text>
                <View style={styles.activityMeta}>
                    <View style={styles.typeTag}>
                        <Text style={styles.typeText}>{item.content_type_display}</Text>
                    </View>
                    <Text style={styles.timeText}>{item.time_ago}</Text>
                </View>
                {item.description ? <Text style={styles.subtext}>{item.description}</Text> : null}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={ColorConstants.WHITE} barStyle="dark-content" />

            <InviteFamilyMemberModal
                visible={inviteModalVisible}
                onClose={() => setInviteModalVisible(false)}
                onNext={(data) => tapOnSaveInvite(data)}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

                <Header
                    title={StringConstants.FAMILY_SHARING_AND_COLLABORATION}
                    subtitle={StringConstants.MANAGE_FAMILY_MEMBERS_PERMISSIONS}
                    showBackArrow={false}
                    containerStyle={{ paddingTop: 20 }}
                />

                <CommonButton
                    title={StringConstants.INVITE_MEMBER}
                    onPress={() => { setInviteModalVisible(true) }}
                    containerStyle={{ marginHorizontal: 20 }}
                    icon={Icons.ic_mail}
                />

                <View style={styles.membersContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Family Members</Text>
                        <Text style={styles.memberCount}>{members.length} members</Text>
                    </View>

                    <View style={styles.membersList}>
                        {loading ? (
                            <ActivityIndicator size="large" color={ColorConstants.PRIMARY_BROWN} style={{ marginVertical: 20 }} />
                        ) : (
                            <FlatList
                                data={paginatedMembers}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={renderMemberCard}
                                ListEmptyComponent={
                                    <Text style={styles.emptyText}>No family members found.</Text>
                                }
                                scrollEnabled={false}
                            />
                        )}
                        {!loading && members.length > 5 && (
                            <View style={styles.paginationContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.pageButton,
                                        currentPage === 1 && styles.pageButtonDisabled
                                    ]}
                                    disabled={currentPage === 1}
                                    onPress={() => handlePageChange(currentPage - 1)}
                                >
                                    <Text
                                        style={[
                                            styles.pageArrowText,
                                            currentPage === 1 && styles.pageArrowTextDisabled
                                        ]}
                                    >
                                        {'<'}
                                    </Text>
                                </TouchableOpacity>

                                {Array.from({ length: totalPages }, (_, idx) => {
                                    const page = idx + 1;
                                    const isActive = page === currentPage;
                                    return (
                                        <TouchableOpacity
                                            key={page}
                                            style={[
                                                styles.pageNumberButton,
                                                isActive && styles.pageNumberButtonActive
                                            ]}
                                            onPress={() => handlePageChange(page)}
                                        >
                                            <Text
                                                style={[
                                                    styles.pageNumberText,
                                                    isActive && styles.pageNumberTextActive
                                                ]}
                                            >
                                                {page}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}

                                <TouchableOpacity
                                    style={[
                                        styles.pageButton,
                                        currentPage === totalPages && styles.pageButtonDisabled
                                    ]}
                                    disabled={currentPage === totalPages}
                                    onPress={() => handlePageChange(currentPage + 1)}
                                >
                                    <Text
                                        style={[
                                            styles.pageArrowText,
                                            currentPage === totalPages && styles.pageArrowTextDisabled
                                        ]}
                                    >
                                        {'>'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>

                <View style={[styles.membersContainer, styles.activityContainer]}>
                    <View style={styles.sectionHeaderActivity}>
                        <Text style={styles.sectionTitle}>Activity Feed</Text>
                        <Text style={styles.sectionSubtitle}>Recent actions by family members</Text>
                    </View>

                    <View style={styles.activityList}>
                        {activitiesLoading ? (
                            <ActivityIndicator size="large" color={ColorConstants.PRIMARY_BROWN} style={{ marginVertical: 20 }} />
                        ) : activities.length > 0 ? (
                            activities.map(renderActivityItem)
                        ) : (
                            <Text style={styles.emptyText}>No recent activity.</Text>
                        )}
                    </View>
                </View>

            </ScrollView>

            <EditFamilyMemberModal
                visible={editModalVisible}
                onClose={() => setEditModalVisible(false)}
                onSave={handleUpdateMember}
                member={selectedMember}
            />

            <DeleteConfirmationModal
                visible={deleteModalVisible}
                onClose={() => setDeleteModalVisible(false)}
                onDelete={() => {
                    console.log('Delete Member:', selectedMember?.id);
                    setDeleteModalVisible(false);
                }}
                title={`Are you sure you want to delete “${selectedMember?.invitee_name || `${selectedMember?.first_name} ${selectedMember?.last_name}`}” Family Member?`}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorConstants.WHITE,
    },
    membersContainer: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        paddingTop: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        marginHorizontal: 20
    },
    activityContainer: {
        paddingBottom: 10,
        paddingTop: 10
    },

    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 12
    },
    sectionHeaderActivity: {
        paddingHorizontal: 20,
        marginTop: 10,
        marginBottom: 12
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: Fonts.ManropeMedium, // Using semi-bold usually for headers
        color: ColorConstants.BLACK2
    },
    sectionSubtitle: {
        fontSize: 14,
        fontFamily: Fonts.mulishRegular,
        color: ColorConstants.DARK_CYAN,
        marginTop: 4
    },
    memberCount: {
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
        fontFamily: Fonts.mulishRegular
    },
    membersList: {
        paddingHorizontal: 20,
    },
    memberCard: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
    },
    memberHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12
    },
    memberAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12
    },
    memberInitialsCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: ColorConstants.LIGHT_PEACH3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    memberInitialsText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 16,
        color: ColorConstants.BLACK2,
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: 16,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.BLACK2
    },
    memberEmail: {
        fontSize: 13,
        color: ColorConstants.DARK_CYAN,
        fontFamily: Fonts.mulishRegular,
        marginTop: 2
    },
    tagsContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 8,
        flexWrap: 'wrap'
    },
    roleTag: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: ColorConstants.PRIMARY_BROWN
    },
    roleText: {
        color: ColorConstants.WHITE,
        fontSize: 11,
        fontFamily: Fonts.ManropeMedium
    },
    statusTag: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: ColorConstants.RED
    },
    statusText: {
        color: ColorConstants.WHITE,
        fontSize: 11,
        fontFamily: Fonts.ManropeMedium
    },
    statusTagBasic: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: '#EEEEEE'
    },
    statusTextBasic: {
        color: '#666666',
        fontSize: 11,
        fontFamily: Fonts.interMedium
    },
    cardActions: {
        flexDirection: 'row',
        gap: 16
    },
    iconButton: {
        padding: 4
    },
    actionIcon: {
        width: 16,
        height: 16,
        resizeMode: 'contain',
        tintColor: ColorConstants.BLACK2
    },
    activityList: {
        paddingHorizontal: 20,
    },
    activityCard: {
        flexDirection: 'row',
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    activityIconContainer: {
        marginRight: 12
    },
    iconBox: {
        width: 30,
        height: 30,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: ColorConstants.REDDISH_BROWN,
        marginTop: 5
    },
    activityTypeIcon: {
        width: 13,
        height: 13,
        resizeMode: 'contain',
        tintColor: ColorConstants.BLACK2
    },
    activityContent: {
        flex: 1,
    },
    activityText: {
        fontSize: 16,
        color: ColorConstants.BLACK2,
    },
    activityName: {
        fontFamily: Fonts.ManropeMedium
    },
    activityAction: {
        color: ColorConstants.DARK_CYAN,
        fontFamily: Fonts.mulishRegular
    },
    activityTarget: {
        fontFamily: Fonts.ManropeMedium
    },
    activityMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6
    },
    typeTag: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginRight: 8,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3
    },
    typeText: {
        fontSize: 11,
        color: ColorConstants.BLACK2,
        fontFamily: Fonts.ManropeMedium
    },
    timeText: {
        fontSize: 11,
        color: ColorConstants.DARK_CYAN,
        fontFamily: Fonts.ManropeMedium
    },
    subtext: {
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
        marginTop: 4,
        fontFamily: Fonts.ManropeMedium
    },
    emptyText: {
        textAlign: 'center',
        padding: 20,
        color: ColorConstants.DARK_CYAN,
        fontFamily: Fonts.mulishRegular
    },
    paginationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        marginBottom: 4,
        gap: 6,
    },
    pageButton: {
        minWidth: 36,
        height: 32,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: ColorConstants.WHITE,
        marginBottom: 20
    },
    pageButtonDisabled: {
        opacity: 0.5,
    },
    pageArrowText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
    },
    pageArrowTextDisabled: {
        color: ColorConstants.GRAY3,
    },
    pageNumberButton: {
        minWidth: 32,
        height: 32,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: ColorConstants.WHITE,
        marginBottom: 20
    },
    pageNumberButtonActive: {
        backgroundColor: ColorConstants.BLACK2,
        borderColor: ColorConstants.BLACK2,
    },
    pageNumberText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
    },
    pageNumberTextActive: {
        color: ColorConstants.WHITE,
    },
});
