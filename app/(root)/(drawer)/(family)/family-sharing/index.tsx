import { Icons } from '@/assets';
import Header from '@/components/Header';
import RecentActivityItem from '@/components/RecentActivity';
import { ColorConstants } from '@/constants/ColorConstants';
import { RecentActivities } from '@/constants/Helper';
import { StringConstants } from '@/constants/StringConstants';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Image,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Contact = {
    initials: string;
    name: string;
    company: string;
    tags: string[];
    status: "Active" | "Inactive"
};

const SharedContent = [
    { action: 'Share All Vendor Contacts', detail: 'Allow family members to view and edit vendor information', time: '2 hours ago' },
    { action: 'Share Home Documents', detail: 'Allow access to warranties, insurance, and maintenance records', time: '5 hours ago' },
    { action: 'Share Reminders', detail: 'Enable family members to view and manage household tasks', time: 'Yesterday' },
    { action: 'Share Legal Documents', detail: 'Provide access to wills, POA, and estate planning documents', time: 'Yesterday' },
];

const Stats = [
    { count: '6', label: 'Active Members', icon: Icons.ic_users },
    { count: '2', label: 'Family Members', icon: Icons.ic_users },
    { count: '2', label: 'Pending Invitations', icon: Icons.ic_invitation },
];

const allContacts: Contact[] = [
    {
        initials: 'SJ',
        name: 'Sarah Johnson',
        company: 'ABC Climate Control',
        tags: ['Contacts', 'Documents', 'Reminders'],
        status: 'Active',
    },
    {
        initials: 'JM',
        name: 'John Martinez',
        company: 'ABC Climate Control',
        tags: ['Contacts', 'Documents', 'Reminders'],
        status: 'Active',
    },
    {
        initials: 'ER',
        name: 'Dr. Emily Roberts',
        company: 'ABC Climate Control',
        tags: ['Contacts', 'Documents', 'Reminders'],
        status: 'Active',
    },
    {
        initials: 'SW',
        name: 'Sarah Williams',
        company: 'ABC Climate Control',
        tags: ['Contacts', 'Documents', 'Reminders'],
        status: 'Active',
    }
];


export default function FamilySharing() {
    const [sharedSwitches, setSharedSwitches] = useState(
        SharedContent.map(() => false)
    );

    const toggleSwitch = (index: number) => {
        setSharedSwitches(prev =>
            prev.map((value, i) => (i === index ? !value : value))
        );
    };


    const renderContactItem = ({ item }: { item: Contact }) => {
        return (
            <View style={styles.contactCard}>
                <View style={styles.contactHeader}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>{item.initials}</Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View
                            style={[
                                styles.priorityBadge,
                                item.status === 'Active'
                                    ? styles.priorityHigh
                                    : styles.priorityMedium,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.priorityText,
                                    {
                                        color:
                                            item.status === 'Active'
                                                ? ColorConstants.GREEN
                                                : ColorConstants.RED,
                                    },
                                ]}
                            >
                                {item.status}
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => { }}
                        >
                            <Image source={Icons.ic_edit} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{item.name}</Text>
                    <Text style={styles.contactCompany}>{item.company}</Text>

                    <Text style={styles.contactPhone}>
                        Joined: <Text style={styles.value}>2024-01-15</Text>
                    </Text>

                    <Text style={styles.contactEmail}>
                        Last active: <Text style={styles.value}>2 hours ago</Text>
                    </Text>

                    <Text style={styles.contactCompany}>Access Control</Text>
                </View>

                {/* Tags */}
                <View style={styles.tagsContainer}>
                    {item.tags.map((tag, index) => (
                        <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };


    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={ColorConstants.WHITE} barStyle="dark-content" />
            <ScrollView showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}>
                <Header
                    title={StringConstants.FAMILY_SHARING_AND_COLLABORATION}
                    subtitle={StringConstants.MANAGE_FAMILY_ACCESS_AND_EMERGENCY_PROTOCOLS}
                    tapOnBack={() => { router.back() }}
                />

                {/* Emergency section */}
                <View style={styles.emergencySection}>
                    <Image source={Icons.ic_emergency} style={styles.emergencyIcon} />
                    <View style={styles.emergencyContent}>
                        <Text style={styles.emergencyTitle}>
                            {StringConstants.EMERGENCY_ACCESS_PROTOCOL}
                        </Text>
                        <Text style={styles.emergencyDesc} numberOfLines={3} ellipsizeMode="tail">
                            {StringConstants.CONFIGURE_EMERGENCY_ACCESS_PROTOCOL}
                        </Text>
                        <View style={styles.emergencyBtnContainer}>
                            <TouchableOpacity style={styles.emergencyBtn} onPress={() => { router.push('/configure-emergency') }}>
                                <Text style={styles.emergencyBtnText}>
                                    {StringConstants.CONFIGURE_EMERGENCY_ACCESS}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.viewProtocolButton} onPress={() => { router.push('/view-protocols') }}>
                                <Text style={styles.viewProtocolButtonText}>
                                    {StringConstants.VIEW_PROTOCOLS}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    {Stats.map((stat, index) => (
                        <View key={index} style={styles.statCard}>
                            <View style={styles.statHeader}>
                                <View style={styles.statIconContainer}>
                                    <Image source={stat.icon} style={styles.statIcon} resizeMode="contain" />
                                </View>
                                <Image source={Icons.ic_tilted_arrow} />
                            </View>
                            <Text style={styles.statCount}>{stat.count}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                <Text style={styles.familyMembersTitle}>{StringConstants.FAMILY_MEMBERS}</Text>
                {/* Contacts List */}
                <FlatList
                    data={allContacts}
                    keyExtractor={(item, index) => `${index}`}
                    renderItem={renderContactItem}
                    contentContainerStyle={styles.contactsList}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                />


                {/* Shared Content Controls */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{StringConstants.SHARED_CONTENT_CONTROLS}</Text>
                    <View style={styles.divider} />
                    {SharedContent.map((activity, index) => {
                        return (
                            <View
                                key={index}
                                style={styles.sharedCard}
                            >
                                <View style={styles.sharedContent}>
                                    <Text style={styles.sharedAction}>{activity.action}</Text>
                                    <Text style={styles.sharedDetails}>{activity.detail}</Text>
                                </View>

                                <Switch
                                    value={sharedSwitches[index]}
                                    onValueChange={() => toggleSwitch(index)}
                                    trackColor={{
                                        false: '#D3D3D3', // OFF background
                                        true: ColorConstants.PRIMARY_BROWN, // ON background
                                    }}
                                    thumbColor={
                                        sharedSwitches[index]
                                            ? ColorConstants.WHITE   // ON thumb
                                            : '#F4F3F4'              // OFF thumb
                                    }
                                    style={{
                                        transform: Platform.OS === 'ios'
                                            ? [{ scaleX: 0.6 }, { scaleY: 0.6 }]
                                            : [{ scaleX: 1 }, { scaleY: 1 }],
                                    }}
                                />
                            </View>
                        );
                    })}
                </View>

                {/* Recent Activity */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {StringConstants.RECENT_ACTIVITY}
                    </Text>
                    <View style={styles.divider} />
                    <FlatList
                        data={RecentActivities}
                        keyExtractor={(_, index) => `${index}`}
                        scrollEnabled={false}
                        renderItem={({ item, index }) => (
                            <RecentActivityItem
                                item={item}
                                isLast={index === RecentActivities.length - 1}
                            />
                        )}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorConstants.WHITE,
    },
    contentContainer: {
        paddingBottom: 50
    },
    emergencyIcon: {
        width: 35,
        height: 35,
        resizeMode: 'contain',
        marginRight: 10,
        borderRadius: 6,
    },
    emergencySection: {
        padding: 15,
        borderColor: ColorConstants.RED50,
        borderWidth: 1,
        borderRadius: 10,
        marginHorizontal: 20,
        flexDirection: 'row',
        backgroundColor: ColorConstants.RED10,
        marginBottom: 20
    },
    emergencyContent: {
        flex: 1,           // take remaining width
        flexShrink: 1,
    },
    emergencyTitle: {
        fontFamily: 'Inter-Medium',
        fontSize: 12,
        color: ColorConstants.DARK_CYAN
    },
    emergencyDesc: {
        fontFamily: 'Inter-Light',
        fontSize: 10,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 10,
        flexWrap: 'wrap',
        flexShrink: 1,       // allows text to shrink if needed
        overflow: 'hidden',
    },
    emergencyBtnContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    emergencyBtn: {
        height: 25,
        width: 152,
        backgroundColor: ColorConstants.RED,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        marginRight: 10
    },
    emergencyBtnText: {
        fontFamily: 'Inter-Medium',
        fontSize: 10,
        color: ColorConstants.WHITE
    },
    viewProtocolButton: {
        height: 25,
        width: 86,
        borderColor: ColorConstants.RED,
        borderWidth: 1,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center'

    },
    viewProtocolButtonText: {
        fontFamily: 'Inter-Regular',
        fontSize: 10,
        color: ColorConstants.RED
    },


    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 20
    },
    statCard: {
        width: '31%', // Adjusted to fit 2 per row better with gap
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    statIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: ColorConstants.PRIMARY_BROWN, // Brownish bg for icon
        justifyContent: 'center',
        alignItems: 'center',
    },
    statIcon: {
        width: 16,
        height: 16,
        tintColor: ColorConstants.WHITE,
    },
    arrowIcon: { // For the tilted arrow in stats
        width: 16,
        height: 16,
        tintColor: ColorConstants.GRAY2,
    },
    statCount: {
        fontFamily: 'Inter-Medium', // Use Bold
        fontSize: 14,
        color: ColorConstants.BLACK, // Titles are dark
        marginBottom: 4,
    },
    statLabel: {
        fontFamily: 'Inter-Regular',
        fontSize: 10,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 2,
    },
    familyMembersTitle: {
        marginHorizontal: 20,
        fontFamily: 'SFPro-Medium', // Use Bold
        fontSize: 12,
        color: ColorConstants.BLACK,
    },
    contactsList: {
        paddingHorizontal: 20,
        marginTop: 10,
    },
    contactCard: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
    },
    contactHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        justifyContent: 'space-between',
    },
    avatarContainer: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: ColorConstants.LIGHT_PEACH,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontFamily: 'Inter-Medium',
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
    },
    priorityBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    priorityHigh: {
        backgroundColor: ColorConstants.GREEN10,
    },
    priorityMedium: {
        backgroundColor: ColorConstants.RED10,
    },

    priorityText: {
        fontFamily: 'Inter-Medium',
        fontSize: 9, // Small
        color: ColorConstants.DARK_CYAN,
    },
    contactInfo: {
        flex: 1,
    },
    contactName: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 11,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 4,
    },
    contactCompany: {
        fontFamily: 'Inter-Regular',
        fontSize: 11,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 4,
    },
    value: {
        color: ColorConstants.GRAY,
    },
    contactPhone: {
        fontFamily: 'Inter-Regular',
        fontSize: 10,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 4,
    },
    contactEmail: {
        fontFamily: 'Inter-Regular',
        fontSize: 10,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 4,
    },
    editButton: {
        padding: 8,
    },

    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 6
    },
    tag: {
        backgroundColor: ColorConstants.GRAY_SHADE,
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    tagText: {
        fontFamily: 'Inter-Regular',
        fontSize: 8,
        color: ColorConstants.GRAY,
    },

    section: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 12,
        marginBottom: 16,
        marginHorizontal: 20
    },
    sectionTitle: {
        fontFamily: 'SFPro-Medium',
        fontSize: 14,
        color: ColorConstants.BLACK,
        marginBottom: 12,
    },
    divider: {
        height: 1,
        backgroundColor: ColorConstants.GRAY3,
        marginBottom: 8,
    },

    sharedCard: {
        flexDirection: 'row',
        backgroundColor: ColorConstants.GRAY_SHADE,
        paddingVertical: 7,
        marginBottom: 7,
        borderWidth: 0,
        alignItems: 'center',
        paddingLeft: 15,
        paddingRight: 7,
        borderRadius: 6,
    },
    noDivider: {
        borderBottomWidth: 0,
        paddingBottom: 0,
    },
    sharedContent: {
        flex: 1,
    },
    sharedAction: {
        fontFamily: 'SFPro-Medium', // Title
        fontSize: 11,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 2,
    },
    sharedDetails: {
        fontFamily: 'Inter-Regular', // Subtitle
        fontSize: 9,
        color: ColorConstants.GRAY,
    },

})
