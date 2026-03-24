import { apiGet, apiPatch } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import Header from '@/components/Header';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FamilyMemberPermissions {
    id: number;
    first_name: string;
    last_name: string;
    invitee_email: string;
    nickname: string;
    relationship: string;
    role: string;
    has_emergency_access: boolean;
    can_view_contacts: boolean;
    can_edit_contacts: boolean;
    can_delete_contacts: boolean;
    can_view_documents: boolean;
    can_edit_documents: boolean;
    can_delete_documents: boolean;
    can_view_reminders: boolean;
    can_edit_reminders: boolean;
    can_delete_reminders: boolean;
    full_name: string;
}

export default function Permissions() {
    const params = useLocalSearchParams();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [member, setMember] = useState<Partial<FamilyMemberPermissions>>(
        params.member ? JSON.parse(params.member as string) : {
            full_name: 'Sarah Johnson',
            invitee_email: 'sarah@example.com',
            role: 'Co-manager',
            status: 'active',
        }
    );

    useEffect(() => {
        if (member.id) {
            fetchMemberPermissions();
        }
    }, [member.id]);

    const fetchMemberPermissions = async () => {
        try {
            setLoading(true);
            const response = await apiGet(`${ApiConstants.MEMBERS}${member.id}/`);
            if (response.data) {
                setMember(response.data);
            }
        } catch (error) {
            console.error('Error fetching member permissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (key: keyof FamilyMemberPermissions) => {
        const newValue = !member[key];

        // Optimistic update
        setMember(prev => ({
            ...prev,
            [key]: newValue
        }));

        try {
            const response = await apiPatch(`${ApiConstants.MEMBERS}${member.id}/`, { [key]: newValue });
            if (!(response.status === 200 || response.status === 204)) {
                throw new Error('Update failed');
            }
        } catch (error) {
            console.error('Error updating permission:', error);
            // Rollback on error
            setMember(prev => ({
                ...prev,
                [key]: !newValue
            }));
            Alert.alert('Error', 'Failed to update permission');
        }
    };

    const renderPermissionCard = (title: string, icon: any, keys: { view: keyof FamilyMemberPermissions, edit: keyof FamilyMemberPermissions, delete: keyof FamilyMemberPermissions }) => {
        const isEditing = member[keys.edit];
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.iconContainer}>
                        <Image source={icon} style={styles.categoryIcon} />
                    </View>
                    <View style={styles.headerText}>
                        <Text style={styles.cardTitle}>{title}</Text>
                        <Text style={styles.cardSubtitle}>{isEditing ? 'View & Edit' : 'View Only'}</Text>
                    </View>
                </View>

                <View style={styles.switchGroup}>
                    <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>Can View</Text>
                        <Switch
                            value={member[keys.view] as boolean}
                            onValueChange={() => handleToggle(keys.view)}
                            trackColor={{ false: '#E0E0E0', true: ColorConstants.PRIMARY_BROWN }}
                            thumbColor={ColorConstants.WHITE}
                        />
                    </View>
                    <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>Can Edit</Text>
                        <Switch
                            value={member[keys.edit] as boolean}
                            onValueChange={() => handleToggle(keys.edit)}
                            trackColor={{ false: '#E0E0E0', true: ColorConstants.PRIMARY_BROWN }}
                            thumbColor={ColorConstants.WHITE}
                        />
                    </View>
                    <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>Can Delete</Text>
                        <Switch
                            value={member[keys.delete] as boolean}
                            onValueChange={() => handleToggle(keys.delete)}
                            trackColor={{ false: '#E0E0E0', true: ColorConstants.PRIMARY_BROWN }}
                            thumbColor={ColorConstants.WHITE}
                        />
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} >
                    <Image source={Icons.ic_left_arrow} />
                </TouchableOpacity>
                <Header
                    title={''}
                    subtitle={''}
                    showBackArrow={false}
                />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={ColorConstants.PRIMARY_BROWN} />
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.memberProfile}>
                        <Image source={Icons.dummy_user1} style={styles.avatar} />
                        <View style={styles.memberMeta}>
                            <Text style={styles.memberName}>{member.full_name || `${member.first_name} ${member.last_name}`}</Text>
                            <Text style={styles.memberEmail}>{member.invitee_email}</Text>
                            <View style={styles.badgeRow}>
                                <View style={styles.roleBadge}>
                                    <Text style={styles.roleText}>{member.role}</Text>
                                </View>
                                <View style={styles.statusTag}>
                                    <Text style={styles.statusText}>Active</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.permissionsView}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Content Permissions</Text>
                            <Text style={styles.sectionSubtitle}>Manage what {member.full_name || member.first_name} can access</Text>
                        </View>

                        {renderPermissionCard('Contact', Icons.ic_users, {
                            view: 'can_view_contacts',
                            edit: 'can_edit_contacts',
                            delete: 'can_delete_contacts'
                        })}
                        {renderPermissionCard('Documents', Icons.ic_doc, {
                            view: 'can_view_documents',
                            edit: 'can_edit_documents',
                            delete: 'can_delete_documents'
                        })}
                        {renderPermissionCard('Reminders', Icons.ic_clock, {
                            view: 'can_view_reminders',
                            edit: 'can_edit_reminders',
                            delete: 'can_delete_reminders'
                        })}
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorConstants.WHITE,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
        paddingLeft: 20,
        paddingRight: 20
    },
    saveButton: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 8,
        minWidth: 70,
        alignItems: 'center'
    },
    saveButtonText: {
        color: ColorConstants.WHITE,
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20
    },
    memberProfile: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        marginRight: 16
    },
    memberMeta: {
        flex: 1
    },
    memberName: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.BLACK2
    },
    memberEmail: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 4
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 4
    },
    roleBadge: {
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
        backgroundColor: '#F3F4F6'
    },
    statusText: {
        color: '#6B7280',
        fontSize: 11,
        fontFamily: Fonts.ManropeMedium
    },
    permissionsView: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 16,
        paddingHorizontal: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        paddingTop: 20

    },
    sectionHeader: {
        marginBottom: 24
    },
    sectionTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 16,
        color: ColorConstants.BLACK2
    },
    sectionSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
    },
    card: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: ColorConstants.REDDISH_BROWN,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    categoryIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
        tintColor: ColorConstants.BLACK2
    },
    headerText: {
        flex: 1
    },
    cardTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.BLACK2
    },
    cardSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN
    },
    switchGroup: {
        gap: 12
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3
    },
    switchLabel: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2
    }
});
