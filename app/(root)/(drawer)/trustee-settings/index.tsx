import { apiGet, apiPatch } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import CustomSwitch from '@/components/CustomSwitch';
import Header from '@/components/Header';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { handleDownload } from '@/constants/Helper';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function TrusteeSettings() {
    const [emailEnabled, setEmailEnabled] = useState(false);
    const [pushEnabled, setPushEnabled] = useState(false);
    const [smsEnabled, setSmsEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    // Fetch settings on component mount
    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await apiGet(ApiConstants.FAMILY_MEMBER_SETTINGS);
            if (response.data) {
                setEmailEnabled(response.data.email_notifications ?? false);
                setPushEnabled(response.data.push_notifications ?? false);
                setSmsEnabled(response.data.sms_notifications ?? false);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            // Alert.alert('Error', 'Failed to load settings. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async (field: string, value: boolean) => {
        try {
            const payload = {
                email_notifications: emailEnabled,
                push_notifications: pushEnabled,
                sms_notifications: smsEnabled,
                [field]: value
            };
            await apiPatch(ApiConstants.FAMILY_MEMBER_SETTINGS, payload);
        } catch (error) {
            console.error('Error updating settings:', error);
            Alert.alert('Error', 'Failed to update settings. Please try again.');
            // Revert the change on error
            if (field === 'email_notifications') setEmailEnabled(!value);
            if (field === 'push_notifications') setPushEnabled(!value);
            if (field === 'sms_notifications') setSmsEnabled(!value);
        }
    };

    const handleEmailToggle = (value: boolean) => {
        setEmailEnabled(value);
        updateSettings('email_notifications', value);
    };

    const handlePushToggle = (value: boolean) => {
        setPushEnabled(value);
        updateSettings('push_notifications', value);
    };

    const handleSmsToggle = (value: boolean) => {
        setSmsEnabled(value);
        updateSettings('sms_notifications', value);
    };

    const handleDownloadAudit = async () => {
        try {
            setDownloading(true);
            const response = await apiGet(`${ApiConstants.BASE_URL}${ApiConstants.DOWNLOAD_AUDIT}`);
            const downloadUrl = response.data?.download_url;
            if (downloadUrl) {
                await handleDownload(downloadUrl);
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'No download URL found in response.',
                });
            }
        } catch (error) {
            console.error('Error downloading audit report:', error);
            Toast.show({
                type: 'error',
                text1: 'Download Failed',
                text2: 'Something went wrong while downloading the audit report.',
            });
        } finally {
            setDownloading(false);
        }
    };

    const auditData = [
        { action: 'Viewed', resource: 'Home Insurance Policy', date: '2024-01-10 14:30' },
        { action: 'Downloaded', resource: 'Property Deed', date: '2024-01-09 10:15' },
        { action: 'Marked Complete', resource: 'HVAC Maintenance', date: '2024-01-08 16:45' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title={'Settings'}
                subtitle={'Manage your notification preferences and view access audit'}
                showBackArrow={false}
                containerStyle={{ paddingTop: 10 }}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={ColorConstants.PRIMARY_BROWN} />
                    </View>
                ) : (
                    <>
                        {/* Notification Preferences Card */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.sectionTitle}>Notification Preferences</Text>
                                <Text style={styles.sectionSubtitle}>Choose how you want to receive notifications</Text>
                            </View>

                            <View style={styles.preferencesContainer}>
                                <PreferenceItem
                                    title="Email Notifications"
                                    subtitle="Receive updates via email"
                                    value={emailEnabled}
                                    onValueChange={handleEmailToggle}
                                />
                                <PreferenceItem
                                    title="Push Notifications"
                                    subtitle="Receive browser notifications"
                                    value={pushEnabled}
                                    onValueChange={handlePushToggle}
                                />
                                <PreferenceItem
                                    title="SMS Notifications"
                                    subtitle="Receive text messages"
                                    value={smsEnabled}
                                    onValueChange={handleSmsToggle}
                                />
                            </View>
                        </View>

                        {/* Access Audit Card */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.sectionTitle}>Access Audit</Text>
                                <Text style={styles.sectionSubtitle}>View your activity log and access history</Text>
                            </View>

                            <View style={styles.auditList}>
                                {auditData.map((item, index) => (
                                    <AuditItem key={index} item={item} />
                                ))}
                            </View>

                            <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadAudit} disabled={downloading}>
                                <Text style={styles.downloadButtonText}>{downloading ? 'Downloading...' : 'Download Audit Report'}</Text>
                            </TouchableOpacity>

                        </View>
                    </>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}

const PreferenceItem = ({ title, subtitle, value, onValueChange }: { title: string, subtitle: string, value: boolean, onValueChange: (val: boolean) => void }) => (
    <View style={styles.preferenceItem}>
        <View style={styles.preferenceTextContainer}>
            <Text style={styles.preferenceTitle}>{title}</Text>
            <Text style={styles.preferenceSubtitle}>{subtitle}</Text>
        </View>
        <CustomSwitch
            value={value}
            onValueChange={onValueChange}
            activeColor={ColorConstants.PRIMARY_BROWN}
        />
    </View>
);

const AuditItem = ({ item }: { item: { action: string, resource: string, date: string } }) => (
    <View style={styles.auditItem}>
        <View style={styles.auditTextContainer}>
            <Text style={styles.auditAction}>{item.action}</Text>
            <Text style={styles.auditResource}>{item.resource}</Text>
        </View>
        <View style={styles.datePill}>
            <Text style={styles.dateText}>{item.date}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorConstants.WHITE,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 80,
        paddingTop: 10,
    },
    card: {
        backgroundColor: ColorConstants.WHITE,
        marginBottom: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 12,
    },
    cardHeader: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 20,
        color: ColorConstants.BLACK2,
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
    },
    preferencesContainer: {
        gap: 12,
    },
    preferenceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        backgroundColor: ColorConstants.WHITE,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
    },
    preferenceTextContainer: {
        flex: 1,
        marginRight: 10,
    },
    preferenceTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.BLACK2,
        marginBottom: 4,
    },
    preferenceSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.GRAY,
    },
    auditList: {
        marginBottom: 20,
        gap: 24,
    },
    auditItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    auditTextContainer: {
        flex: 1,
        marginRight: 10,
    },
    auditAction: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.BLACK2,
        marginBottom: 4,
    },
    auditResource: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
    },
    datePill: {
        // backgroundColor: '#F9FAFB', 
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    dateText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 10, // Small text for date
        color: ColorConstants.BLACK2,
    },
    downloadButtonText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.WHITE,
        textAlign: "center",
    },
    downloadButton: {
        marginTop: 10,
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        borderRadius: 8,
        height: 37,
        alignSelf: 'flex-end',
        // paddingHorizontal: 20,
        width: 200,
        alignItems: "center",
        justifyContent: "center",
    },

});