import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import CreateBackupModal from '@/modals/CreateBackupModal';
import DeleteBackupModal from '@/modals/DeleteBackupModal';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';

const BackupTab = () => {
    const [backupData, setBackupData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false);
    const [showCreateBackupModal, setShowCreateBackupModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedBackupId, setSelectedBackupId] = useState<string | null>(null);
    const [retentionDays, setRetentionDays] = useState('');

    const frequencyOptions = [
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Monthly', value: 'monthly' },
    ];

    useEffect(() => {
        fetchBackupData();
    }, []);

    const fetchBackupData = async () => {
        try {
            // Only set major loading on initial fetch if data is missing, 
            // otherwise let the UI update silently or via processing
            if (!backupData) setLoading(true);
            const response = await apiGet(ApiConstants.SETTINGS_BACKUP);
            if (response.data) {
                setBackupData(response.data);
                if (response.data.settings) {
                    setRetentionDays(response.data.settings.retention_days?.toString() || '');
                }
            }
        } catch (error) {
            console.error('Error fetching backup data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSettings = async (key: string, value: boolean) => {
        if (processing) return;
        setProcessing(true);
        try {
            const payload = { [key]: value };
            await apiPatch(ApiConstants.SETTINGS_BACKUP, payload);
            await fetchBackupData();
        } catch (error) {
            console.error('Error updating settings:', error);
            Alert.alert('Error', 'Failed to update settings');
        } finally {
            setProcessing(false);
        }
    };

    const handleUpdateFrequency = async (freqValue: string, freqLabel: string) => {
        if (processing) return;
        setProcessing(true);
        try {
            const payload = {
                ...backupData.settings,
                backup_frequency: freqValue,
                frequency_display: freqLabel,
            };
            await apiPut(`${ApiConstants.SETTINGS_BACKUP}settings/`, payload);
            await fetchBackupData();
            setShowFrequencyDropdown(false);
        } catch (error) {
            console.error('Error updating frequency:', error);
            Alert.alert('Error', 'Failed to update backup frequency');
        } finally {
            setProcessing(false);
        }
    };

    const handleRetentionUpdate = async () => {
        if (processing || !retentionDays) return;
        setProcessing(true);
        try {
            const payload = {
                ...backupData.settings,
                retention_days: parseInt(retentionDays, 10),
            };
            await apiPut(`${ApiConstants.SETTINGS_BACKUP}settings/`, payload);
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Data retention updated successfully'
            });
            await fetchBackupData();
        } catch (error) {
            console.error('Error updating retention:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to update data retention'
            });
        } finally {
            setProcessing(false);
        }
    };


    const handleRestoreBackup = async (backupId: string) => {
        if (processing) return;
        Alert.alert(
            'Confirm Restore',
            'Are you sure you want to restore from this backup? Current data may be overwritten.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Restore',
                    style: 'destructive',
                    onPress: async () => {
                        setProcessing(true);
                        try {
                            await apiPost(`${ApiConstants.SETTINGS_BACKUP}restore/`, { backup_id: backupId });
                            Alert.alert('Success', 'Restore process started');
                            await fetchBackupData();
                        } catch (error) {
                            console.error('Error restoring backup:', error);
                            Alert.alert('Error', 'Failed to initiate restore');
                        } finally {
                            setProcessing(false);
                        }
                    },
                },
            ]
        );
    };

    const handleDeleteBackup = (backupId: string) => {
        setSelectedBackupId(backupId);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedBackupId || processing) return;
        setProcessing(true);
        try {
            const response = await apiDelete(`${ApiConstants.SETTINGS_BACKUP}${selectedBackupId}/`);
            if (response.status === 200 || response.status === 204 || response.data?.message) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: response.data?.message || 'Backup deleted successfully'
                });
                await fetchBackupData();
            }
        } catch (error) {
            console.error('Error deleting backup:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to delete backup'
            });
        } finally {
            setProcessing(false);
            setShowDeleteModal(false);
            setSelectedBackupId(null);
        }
    };

    const handleExportData = (format: string) => {
        // Placeholder for export functionality
        Alert.alert('Export', `Export as ${format} coming soon`);
    };

    if (loading) {
        return (
            <View style={[styles.tabContent, { justifyContent: 'center', height: 400 }]}>
                <ActivityIndicator size="large" color={ColorConstants.PRIMARY_BROWN} />
            </View>
        );
    }

    if (!backupData) return null;

    const { settings, last_backup, recent_backups } = backupData;

    const formatDate = (dateString: string) => {
        return moment(dateString).format('DD/MM/YYYY, HH:mm:ss');
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return ColorConstants.GREEN2;
            case 'failed':
                return '#EF4444';
            case 'in_progress':
                return '#F59E0B';
            default:
                return ColorConstants.DARK_CYAN;
        }
    };

    const getStatusBgColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return ColorConstants.GREEN20;
            case 'failed':
                return '#FEE2E2';
            case 'in_progress':
                return '#FEF3C7';
            default:
                return ColorConstants.GRAY3;
        }
    };

    return (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            {/* Automatic Backups */}
            <View style={[styles.card, processing && { opacity: 0.7 }]}>
                <Text style={styles.cardTitle}>Automatic Backups</Text>
                <Text style={styles.cardSubtitle}>
                    Configure automatic backup settings for your data
                </Text>

                <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingLabel}>Enable Automatic Backups</Text>
                        <Text style={styles.settingDescription}>
                            Automatically backup your data on a regular schedule
                        </Text>
                    </View>
                    <Switch
                        value={settings?.auto_backup_enabled || false}
                        onValueChange={(value) => handleUpdateSettings('auto_backup_enabled', value)}
                        disabled={processing}
                        trackColor={{ false: ColorConstants.GRAY3, true: ColorConstants.PRIMARY_BROWN }}
                        thumbColor={ColorConstants.WHITE}
                    />
                </View>

                <View style={styles.divider} />

                <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingLabel}>Backup Frequency</Text>
                        <Text style={styles.settingDescription}>
                            {settings?.frequency_display}
                        </Text>
                    </View>
                    <View style={{ position: 'relative' }}>
                        <TouchableOpacity
                            style={[styles.dropdownBtn, processing && { opacity: 0.5 }]}
                            disabled={processing}
                            onPress={() => setShowFrequencyDropdown(!showFrequencyDropdown)}
                        >
                            <Text style={styles.dropdownBtnText}>{settings?.frequency_display || 'Daily'}</Text>
                            <Image source={Icons.ic_down_arrow} style={styles.dropdownIcon} />
                        </TouchableOpacity>

                        {showFrequencyDropdown && (
                            <View style={styles.dropdownListContainer}>
                                {frequencyOptions.map((option, index) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[
                                            styles.dropdownItem,
                                            index === frequencyOptions.length - 1 && styles.dropdownItemLast
                                        ]}
                                        onPress={() => handleUpdateFrequency(option.value, option.label)}
                                    >
                                        <Text style={styles.dropdownItemText}>{option.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.divider} />

                <Text style={styles.sectionSubtitle}>Include in Backup</Text>

                <View style={styles.includeRow}>
                    <Text style={styles.includeLabel}>Contacts</Text>
                    <Switch
                        value={settings?.include_contacts || false}
                        onValueChange={(value) => handleUpdateSettings('include_contacts', value)}
                        disabled={processing}
                        trackColor={{ false: ColorConstants.GRAY3, true: ColorConstants.PRIMARY_BROWN }}
                        thumbColor={ColorConstants.WHITE}
                    />
                </View>

                <View style={styles.includeRow}>
                    <Text style={styles.includeLabel}>Documents</Text>
                    <Switch
                        value={settings?.include_documents || false}
                        onValueChange={(value) => handleUpdateSettings('include_documents', value)}
                        disabled={processing}
                        trackColor={{ false: ColorConstants.GRAY3, true: ColorConstants.PRIMARY_BROWN }}
                        thumbColor={ColorConstants.WHITE}
                    />
                </View>

                <View style={styles.includeRow}>
                    <Text style={styles.includeLabel}>Reminders</Text>
                    <Switch
                        value={settings?.include_reminders || false}
                        onValueChange={(value) => handleUpdateSettings('include_reminders', value)}
                        disabled={processing}
                        trackColor={{ false: ColorConstants.GRAY3, true: ColorConstants.PRIMARY_BROWN }}
                        thumbColor={ColorConstants.WHITE}
                    />
                </View>

                <View style={styles.includeRow}>
                    <Text style={styles.includeLabel}>Settings</Text>
                    <Switch
                        value={settings?.include_settings || false}
                        onValueChange={(value) => handleUpdateSettings('include_settings', value)}
                        disabled={processing}
                        trackColor={{ false: ColorConstants.GRAY3, true: ColorConstants.PRIMARY_BROWN }}
                        thumbColor={ColorConstants.WHITE}
                    />
                </View>

                <Text style={styles.retentionLabel}>Data Retention (days)</Text>
                <TextInput
                    style={styles.retentionInput}
                    value={retentionDays}
                    onChangeText={setRetentionDays}
                    keyboardType="numeric"
                    onSubmitEditing={handleRetentionUpdate}
                    returnKeyType="done"
                />
            </View>


            {/* Last Backup */}
            {last_backup && (
                <View style={[styles.card, processing && { opacity: 0.7 }]}>
                    <Text style={styles.cardTitle}>Last Backup</Text>

                    <View style={styles.lastBackupCard}>
                        <View style={styles.lastBackupMain}>
                            <Image source={Icons.ic_calendar_outline} style={styles.lastBackupIcon} />
                            <View>
                                <Text style={styles.lastBackupType}>{last_backup.type_display || 'Manual Backup'}</Text>
                                <Text style={styles.lastBackupDate}>{formatDate(last_backup.created_at)}</Text>
                            </View>
                        </View>
                        <View
                            style={[
                                styles.statusBadge,
                                { backgroundColor: '#E2F2E7', alignSelf: 'center' }
                            ]}
                        >
                            <Text
                                style={[
                                    styles.statusBadgeText,
                                    { color: '#4CAF50' }
                                ]}
                            >
                                {last_backup.status_display || last_backup.status}
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Manual Backup */}
            <View style={[styles.card, processing && { opacity: 0.7 }]}>
                <Text style={styles.cardTitle}>Manual Backup</Text>
                <Text style={styles.cardSubtitle}>
                    Create a manual backup of your data
                </Text>

                <TouchableOpacity
                    style={[styles.createBackupBtn, processing && { opacity: 0.5 }]}
                    onPress={() => setShowCreateBackupModal(true)}
                    disabled={processing}
                >
                    {processing ? (
                        <ActivityIndicator color={ColorConstants.WHITE} size="small" />
                    ) : (
                        <Text style={styles.createBackupBtnText}>Create Backup</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Recent Backups */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Recent Backups</Text>
                <Text style={styles.cardSubtitle}>
                    View and manage your backup history
                </Text>

                {recent_backups && recent_backups.length > 0 ? (
                    recent_backups.map((backup: any, index: number) => (
                        <View key={index} style={styles.recentBackupItemCard}>
                            <View style={styles.recentBackupHeader}>
                                <View>
                                    <Text style={styles.recentBackupType}>{backup.type_display || 'Manual Backup'}</Text>
                                    <Text style={styles.recentBackupDate}>{formatDate(backup.created_at)}</Text>
                                </View>
                                <View style={styles.recentBackupActions}>
                                    <View
                                        style={[
                                            styles.statusBadge,
                                            { backgroundColor: '#E2F2E7', marginRight: 8 }
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.statusBadgeText,
                                                { color: '#4CAF50' }
                                            ]}
                                        >
                                            {backup.status_display || backup.status}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.deleteBtnOutline}
                                        onPress={() => handleDeleteBackup(backup.id)}
                                        disabled={processing}
                                    >
                                        <Text style={styles.deleteBtnTextOutline}>Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <Text style={styles.recentBackupIncludes}>
                                Includes: {[
                                    backup.includes_contacts && 'Contacts',
                                    backup.includes_documents && 'Documents',
                                    backup.includes_reminders && 'Reminders',
                                    backup.includes_settings && 'Settings',
                                ].filter(Boolean).join(', ')}
                            </Text>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>No recent backups available</Text>
                    </View>
                )}
            </View>

            {/* Export Data */}
            <View style={[styles.card, processing && { opacity: 0.7 }]}>
                <Text style={styles.cardTitle}>Export Data</Text>
                <Text style={styles.cardSubtitle}>
                    Export your data in various formats
                </Text>

                <TouchableOpacity style={[styles.exportOption, processing && { opacity: 0.5 }]} disabled={processing} onPress={() => handleExportData('CSV')}>
                    <Image source={Icons.ic_download} style={styles.exportIcon} />
                    <Text style={styles.exportText}>Export as CSV</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.exportOption, processing && { opacity: 0.5 }]} disabled={processing} onPress={() => handleExportData('JSON')}>
                    <Image source={Icons.ic_download} style={styles.exportIcon} />
                    <Text style={styles.exportText}>Export as JSON</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.exportOption, processing && { opacity: 0.5 }]} disabled={processing} onPress={() => handleExportData('PDF')}>
                    <Image source={Icons.ic_download} style={styles.exportIcon} />
                    <Text style={styles.exportText}>Export as PDF</Text>
                </TouchableOpacity>
            </View>
            <CreateBackupModal
                visible={showCreateBackupModal}
                onClose={() => setShowCreateBackupModal(false)}
                onSuccess={() => {
                    setShowCreateBackupModal(false);
                    fetchBackupData();
                }}
            />
            <DeleteBackupModal
                visible={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onDelete={confirmDelete}
            />
        </ScrollView>
    );
};

export default BackupTab;

const styles = StyleSheet.create({
    tabContent: {
        paddingHorizontal: 20,
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
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 18,
        color: ColorConstants.BLACK2,
    },
    cardSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 16,
        marginTop: 4,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    settingInfo: {
        flex: 1,
        marginRight: 16,
    },
    settingLabel: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 15,
        color: ColorConstants.BLACK2,
        marginBottom: 4,
    },
    settingDescription: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 13,
        color: ColorConstants.DARK_CYAN,
    },
    divider: {
        height: 1,
        backgroundColor: ColorConstants.GRAY3,
        marginVertical: 12,
    },
    dropdownBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ColorConstants.WHITE,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 8,
    },
    dropdownBtnText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    dropdownIcon: {
        width: 12,
        height: 12,
        tintColor: ColorConstants.DARK_CYAN,
        resizeMode: 'contain'
    },
    dropdownListContainer: {
        position: 'absolute',
        top: 45,
        right: 0,
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        width: 120,
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    dropdownItem: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: ColorConstants.GRAY3,
    },
    dropdownItemLast: {
        borderBottomWidth: 0,
    },
    dropdownItemText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    sectionSubtitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 15,
        color: ColorConstants.BLACK2,
        marginTop: 8,
        marginBottom: 12,
    },
    includeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10
    },
    includeLabel: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    lastBackupCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 12,
        backgroundColor: ColorConstants.WHITE,
        marginTop: 12,
    },
    lastBackupMain: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    lastBackupIcon: {
        width: 24,
        height: 24,
        marginRight: 12,
        tintColor: ColorConstants.BLACK2,
    },
    lastBackupType: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
    },
    lastBackupDate: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 12,
        color: ColorConstants.BLACK2,
    },
    recentBackupItemCard: {
        padding: 16,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 12,
        backgroundColor: ColorConstants.WHITE,
        marginBottom: 12,
    },
    recentBackupHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    recentBackupType: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 16,
        color: ColorConstants.BLACK2,
    },
    recentBackupDate: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
    },
    recentBackupActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    recentBackupIncludes: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
        marginTop: 8,
    },
    deleteBtnOutline: {
        borderWidth: 1,
        borderColor: '#FF7D7D',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    deleteBtnTextOutline: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 12,
        color: '#FF0000',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusBadgeText: {
        fontSize: 10,
        fontFamily: Fonts.ManropeSemiBold,
        textTransform: 'capitalize',
    },
    restoreBtn: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    restoreBtnText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 15,
        color: ColorConstants.WHITE,
    },
    emptyState: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyStateText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
    },
    createBackupBtn: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    createBackupBtnText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 15,
        color: ColorConstants.WHITE,
    },
    exportOption: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    exportIcon: {
        width: 20,
        height: 20,
        tintColor: ColorConstants.BLACK2,
        marginRight: 12,
    },
    exportText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 15,
        color: ColorConstants.BLACK2,
    },
    retentionLabel: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        marginBottom: 12,
        marginTop: 10
    },
    retentionInput: {
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
});
