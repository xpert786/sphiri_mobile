import { apiGet, apiPut } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const CHANNELS = [
    {
        id: 'reminders',
        title: 'Reminders',
        options: [
            { id: 'email', label: 'Email', icon: Icons.ic_mail },
            { id: 'sms', label: 'SMS', icon: Icons.ic_message },
            { id: 'push', label: 'Push', icon: Icons.ic_notification },
        ]
    },
    {
        id: 'documents',
        title: 'Documents',
        options: [
            { id: 'email', label: 'Email', icon: Icons.ic_mail },
            { id: 'sms', label: 'SMS', icon: Icons.ic_message },
            { id: 'push', label: 'Push', icon: Icons.ic_notification },
        ]
    },
    {
        id: 'family',
        title: 'Family',
        options: [
            { id: 'email', label: 'Email', icon: Icons.ic_mail },
            { id: 'sms', label: 'SMS', icon: Icons.ic_message },
            { id: 'push', label: 'Push', icon: Icons.ic_notification },
        ]
    },
    {
        id: 'contacts',
        title: 'Contacts',
        options: [
            { id: 'email', label: 'Email', icon: Icons.ic_mail },
            { id: 'sms', label: 'SMS', icon: Icons.ic_message },
            { id: 'push', label: 'Push', icon: Icons.ic_notification },
        ]
    }
];

const LEAD_TIME_OPTIONS = [
    { id: '15_minutes', label: '15 minutes before' },
    { id: '1_hour', label: '1 hour before' },
    { id: '1_day', label: '1 day before' },
    { id: '1_week', label: '1 week before' },
];

const NotificationsTab = () => {
    const [settings, setSettings] = useState<any>({
        reminders: { email: true, sms: false, push: true },
        documents: { email: true, sms: false, push: true },
        family: { email: true, sms: true, push: true },
        contacts: { email: true, sms: false, push: false },
    });

    const [leadTime, setLeadTime] = useState('1_day');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await apiGet(ApiConstants.SETTINGS_NOTIFICATIONS);
            if (response.data) {
                const data = response.data;
                setSettings({
                    reminders: { email: data.reminders_email, sms: data.reminders_sms, push: data.reminders_push },
                    documents: { email: data.documents_email, sms: data.documents_sms, push: data.documents_push },
                    family: { email: data.family_email, sms: data.family_sms, push: data.family_push },
                    contacts: { email: data.contacts_email, sms: data.contacts_sms, push: data.contacts_push },
                });
                setLeadTime(data.notification_lead_time);
            }
        } catch (error) {
            console.error('Error fetching notification settings:', error);
            Alert.alert('Error', 'Failed to fetch notification settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async (updatedSettings: any, updatedLeadTime: string) => {
        try {
            setSaving(true);
            const payload = {
                reminders_email: updatedSettings.reminders.email,
                reminders_sms: updatedSettings.reminders.sms,
                reminders_push: updatedSettings.reminders.push,
                documents_email: updatedSettings.documents.email,
                documents_sms: updatedSettings.documents.sms,
                documents_push: updatedSettings.documents.push,
                family_email: updatedSettings.family.email,
                family_sms: updatedSettings.family.sms,
                family_push: updatedSettings.family.push,
                contacts_email: updatedSettings.contacts.email,
                contacts_sms: updatedSettings.contacts.sms,
                contacts_push: updatedSettings.contacts.push,
                notification_lead_time: updatedLeadTime,
            };
            const response = await apiPut(ApiConstants.SETTINGS_NOTIFICATIONS, payload);
            if (!(response.status === 200 || response.status === 204)) {
                throw new Error('Failed to save settings');
            }
        } catch (error) {
            console.error('Error saving notification settings:', error);
            Alert.alert('Error', 'Failed to auto-save notification settings. Please check your connection.');
            // Let the caller handle rollback if necessary
            throw error;
        } finally {
            setSaving(false);
        }
    };

    const toggleSetting = async (channelId: string, optionId: string) => {
        const oldValue = settings[channelId][optionId];
        const newSettings = {
            ...settings,
            [channelId]: {
                ...settings[channelId],
                [optionId]: !oldValue
            }
        };

        // Optimistic update
        setSettings(newSettings);

        try {
            await handleSaveSettings(newSettings, leadTime);
        } catch (error) {
            // Rollback on error
            setSettings((prev: any) => ({
                ...prev,
                [channelId]: {
                    ...prev[channelId],
                    [optionId]: oldValue
                }
            }));
        }
    };

    const handleLeadTimeChange = async (newId: string) => {
        const oldLeadTime = leadTime;

        // Optimistic update
        setLeadTime(newId);

        try {
            await handleSaveSettings(settings, newId);
        } catch (error) {
            // Rollback on error
            setLeadTime(oldLeadTime);
        }
    };

    if (loading) {
        return (
            <View style={[styles.tabContent, { justifyContent: 'center', height: 400 }]}>
                <ActivityIndicator size="large" color={ColorConstants.PRIMARY_BROWN} />
            </View>
        );
    }

    return (
        <View style={styles.tabContent}>

            <View style={[styles.cardView, { marginBottom: 16 }]}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitleHeader}>Notification Channels</Text>
                    <Text style={styles.sectionSubtitle}>Choose how you want to receive notifications</Text>
                </View>

                {CHANNELS.map(channel => (
                    <View key={channel.id} style={styles.card}>
                        <Text style={styles.cardTitle}>{channel.title}</Text>
                        <View style={styles.optionsContainer}>
                            {channel.options.map(option => (
                                <View key={option.id} style={styles.optionRow}>
                                    <View style={styles.optionLabelContainer}>
                                        <Image source={option.icon} style={styles.optionIcon} />
                                        <Text style={styles.optionLabel}>{option.label}</Text>
                                    </View>
                                    <Switch
                                        value={settings[channel.id][option.id]}
                                        onValueChange={() => toggleSetting(channel.id, option.id)}
                                        trackColor={{ false: '#E5E7EB', true: ColorConstants.PRIMARY_BROWN }}
                                        thumbColor={ColorConstants.WHITE}
                                        style={Platform.OS === 'ios' ? { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] } : {}}
                                    />
                                </View>
                            ))}
                        </View>
                    </View>
                ))}
            </View>

            <View style={styles.cardView}>
                <View style={[styles.sectionHeader]}>
                    <Text style={styles.sectionTitleHeader}>Notification Lead Time</Text>
                    <Text style={styles.sectionSubtitle}>How long before an event should you be notified?</Text>
                </View>

                <View style={styles.leadTimeContainer}>
                    {LEAD_TIME_OPTIONS.map(option => (
                        <TouchableOpacity
                            key={option.id}
                            style={styles.radioRow}
                            onPress={() => handleLeadTimeChange(option.id)}
                            disabled={saving}
                        >
                            <View style={styles.ratioCircle}>
                                {leadTime === option.id && <View style={styles.radioInner} />}
                            </View>
                            <Text style={styles.radioLabel}>{option.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );
};

export default NotificationsTab;

const styles = StyleSheet.create({
    tabContent: {
        paddingHorizontal: 20,
    },
    sectionHeader: {
        marginBottom: 16,
    },
    cardView: {
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingTop: 20,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,

    },
    sectionTitleHeader: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 20,
        color: ColorConstants.BLACK2,
    },
    sectionSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
        marginTop: 4,
    },
    card: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
    },
    cardTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.BLACK2,
        marginBottom: 20,
    },
    optionsContainer: {
        gap: 11,
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    optionLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionIcon: {
        width: 18,
        height: 18,
        tintColor: ColorConstants.DARK_CYAN,
        marginRight: 12,
        resizeMode: 'contain',
    },
    optionLabel: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
    },
    leadTimeContainer: {
        gap: 12,
        marginBottom: 24,
    },
    radioRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ColorConstants.WHITE,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 10,
        padding: 12,
    },
    ratioCircle: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 1,
        borderColor: ColorConstants.PRIMARY_BROWN,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: ColorConstants.PRIMARY_BROWN,
    },
    radioLabel: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
    },
    saveBtn: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        borderRadius: 10,
        marginBottom: 20,
        width: 156,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveBtnText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.WHITE,
    },
});
