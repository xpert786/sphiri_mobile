import { apiGet } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import Header from '@/components/Header';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { StringConstants } from '@/constants/StringConstants';
import EmergencyTrustModal from '@/modals/EmergencyTrustModal';

import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    BackHandler,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type TabType = 'triggers' | 'contacts' | 'documents';

interface EmergencyStatus {
    status: string;
    status_display: string;
    has_pending_request: boolean;
    pending_request: any;
    access_message: string;
    can_request: boolean;
}

export default function EmergencyTrustee() {
    const [activeTab, setActiveTab] = useState<TabType>('triggers');
    const [modalVisible, setModalVisible] = useState(false);
    const [emergencyStatus, setEmergencyStatus] = useState<EmergencyStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [accessBlocked, setAccessBlocked] = useState(false);

    const fetchEmergencyStatus = async () => {
        try {
            setLoading(true);
            const response = await apiGet(ApiConstants.BASE_URL + ApiConstants.EMERGENCY_ACCESS_FAMILY_MEMBER);
            console.log("response in fetchEmergencyStatus:", response.data);

            if (response.status === 200) {
                setEmergencyStatus(response.data);
            }
        } catch (error: any) {
            if (error?.response?.status === 403) {
                setAccessBlocked(true);
            } else {
                console.error('Error fetching emergency status:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchEmergencyStatus();
        }, [])
    );

    const handleRequestAccess = () => {
        setModalVisible(false);
        // Ideally call API to request access here, then refresh status
        // For now, assume modal handles API or we just refresh
        fetchEmergencyStatus();
    };


    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                router.navigate('/(root)/(drawer)/Home');
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => subscription.remove();
        }, [])
    );

    const renderStatusSection = () => {
        if (!emergencyStatus) return null;

        const isPending = emergencyStatus.has_pending_request || emergencyStatus.status === 'PENDING';
        const isActive = emergencyStatus.status === 'ACTIVE';

        return (
            <View style={styles.statusCard}>
                <Text style={styles.statusTitle}>Emergency Access Status</Text>
                <Text style={styles.statusSubtitle}>{emergencyStatus.access_message}</Text>

                <View style={[styles.pendingBadge, isActive && { backgroundColor: ColorConstants.GREEN2 }]}>
                    <Text style={styles.pendingBadgeText}>{emergencyStatus.status_display}</Text>
                </View>

                {isPending && (
                    <View style={styles.warningBox}>
                        <Ionicons name="alert-circle-outline" size={20} color={ColorConstants.BLACK2} style={{ marginTop: 2 }} />
                        <View style={{ marginLeft: 8, flex: 1 }}>
                            <Text style={styles.warningTitle}>Request Pending</Text>
                            <Text style={styles.warningDesc}>
                                Your emergency access request is awaiting primary user approval.
                            </Text>
                        </View>
                    </View>
                )}

                {emergencyStatus.can_request && (
                    <TouchableOpacity
                        style={styles.requestButton}
                        onPress={() => setModalVisible(true)}
                    >
                        <Image
                            source={Icons.ic_warn}
                            style={{ width: 18, height: 18, marginRight: 6, tintColor: "white" }}
                            resizeMode="contain"
                        />

                        <Text style={styles.requestButtonText}>
                            Request Emergency Access
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const renderTabs = () => (
        <View style={styles.tabContainer}>
            <TouchableOpacity
                style={[styles.tabItem, activeTab === 'triggers' && styles.activeTabItem]}
                onPress={() => setActiveTab('triggers')}
            >
                <Text style={[styles.tabText, activeTab === 'triggers' && styles.activeTabText]}>Access Triggers</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.tabItem, activeTab === 'contacts' && styles.activeTabItem]}
                onPress={() => setActiveTab('contacts')}
            >
                <Text style={[styles.tabText, activeTab === 'contacts' && styles.activeTabText]}>E Contacts</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.tabItem, activeTab === 'documents' && styles.activeTabItem]}
                onPress={() => setActiveTab('documents')}
            >
                <Text style={[styles.tabText, activeTab === 'documents' && styles.activeTabText]}>E Documents</Text>
            </TouchableOpacity>
        </View>
    );

    const renderTriggersTab = () => (
        <View style={styles.contentBox}>
            <Text style={styles.sectionHeaderTitle}>Active Access Triggers</Text>
            <Text style={styles.sectionHeaderSubtitle}>
                Configured mechanisms that grant you{'\n'}access to emergency documents
            </Text>

            {/* Inactivity Timer Card */}
            <View style={styles.triggerCard}>
                <Text style={styles.triggerTitle}>Inactivity Timer (30 days)</Text>
                <Text style={styles.triggerDesc}>Automatically activates after 30{'\n'}days of account inactivity</Text>
                <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>Active</Text>
                </View>
                <Text style={styles.lastCheckedText}>Last checked: 11/7/2025, 11:12:39 AM</Text>
            </View>

            {/* Manual Unlock Card */}
            <View style={styles.triggerCard}>
                <Text style={styles.triggerTitle}>Manual Unlock</Text>
                <Text style={styles.triggerDesc}>Requires manual unlock by primary{'\n'}user</Text>
                <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>Active</Text>
                </View>
            </View>

            {/* How It Works */}
            <View style={styles.infoBox}>
                <Ionicons name="alert-circle-outline" size={20} color={ColorConstants.BLACK2} style={{ marginTop: 2 }} />
                <View style={{ marginLeft: 8, flex: 1 }}>
                    <Text style={styles.infoTitle}>How It Works</Text>
                    <Text style={styles.infoDesc}>
                        Emergency access is designed as a "dead{'\n'}man's switch." If the primary user becomes{'\n'}incapacitated or unresponsive, designated{'\n'}triggers automatically grant you access to{'\n'}critical documents. All access is logged and{'\n'}time-bound.
                    </Text>
                </View>
            </View>
        </View>
    );

    const renderContactsTab = () => (
        <View style={styles.contentBox}>
            <Text style={styles.sectionHeaderTitle}>Emergency Contacts</Text>
            <Text style={styles.sectionHeaderSubtitle}>Authorized contacts for emergency situations</Text>

            {/* Contact 1 */}
            <View style={styles.contactCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View>
                        <Text style={styles.contactName}>Sarah Johnson</Text>
                        <Text style={styles.contactRole}>Spouse</Text>
                    </View>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleBadgeText}>Full Access</Text>
                    </View>
                </View>

                <View style={styles.contactInfoRow}>
                    <Ionicons name="call-outline" size={14} color={ColorConstants.GRAY} />
                    <Text style={styles.contactInfoText}>+1 (555) 111-2233</Text>
                </View>
                <View style={styles.contactInfoRow}>
                    <Ionicons name="mail-outline" size={14} color={ColorConstants.GRAY} />
                    <Text style={styles.contactInfoText}>sarah@gmail.com</Text>
                </View>
                <View style={styles.contactInfoRow}>
                    <Ionicons name="location-outline" size={14} color={ColorConstants.GRAY} />
                    <Text style={styles.contactInfoText}>123 Main Street, Anytown, ST{'\n'}12345</Text>
                </View>

                <View style={styles.warningBox}>
                    <Ionicons name="alert-circle-outline" size={18} color={ColorConstants.BLACK2} />
                    <View style={{ marginLeft: 8, flex: 1, borderColor: "#F59E0B" }}>
                        <Text style={styles.warningTitle}>Authorized for{'\n'}Emergency Access</Text>
                        <Text style={styles.warningDesc}>
                            Can access all emergency{'\n'}documents when emergency{'\n'}access is activated.
                        </Text>
                    </View>
                </View>

                <View style={styles.actionButtonsRow}>
                    <TouchableOpacity style={styles.outlineButton}>
                        <Text style={styles.outlineButtonText}>View Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.solidButton}>
                        <Text style={styles.solidButtonText}>Contact Now</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Contact 2 */}
            <View style={styles.contactCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View>
                        <Text style={styles.contactName}>Dr. Sarah Wilson</Text>
                        <Text style={styles.contactRole}>Primary Care Physician</Text>
                    </View>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleBadgeText}>Medical Only</Text>
                    </View>
                </View>

                <View style={styles.contactInfoRow}>
                    <Ionicons name="call-outline" size={14} color={ColorConstants.GRAY} />
                    <Text style={styles.contactInfoText}>+1 (555) 111-2233</Text>
                </View>
                <View style={styles.contactInfoRow}>
                    <Ionicons name="mail-outline" size={14} color={ColorConstants.GRAY} />
                    <Text style={styles.contactInfoText}>dr.wilson@healthcare.com</Text>
                </View>
                <View style={styles.contactInfoRow}>
                    <Ionicons name="location-outline" size={14} color={ColorConstants.GRAY} />
                    <Text style={styles.contactInfoText}>Medical Plaza, Suite 100</Text>
                </View>

                <View style={styles.warningBox}>
                    <Ionicons name="alert-circle-outline" size={18} color={ColorConstants.BLACK2} />
                    <View style={{ marginLeft: 8, flex: 1 }}>
                        <Text style={styles.warningTitle}>Authorized for Emergency Access</Text>
                        <Text style={styles.warningDesc}>
                            Can access medical documents only when emergency access is activated.
                        </Text>
                    </View>
                </View>

                <View style={styles.actionButtonsRow}>
                    <TouchableOpacity style={styles.outlineButton}>
                        <Text style={styles.outlineButtonText}>View Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.solidButton}>
                        <Text style={styles.solidButtonText}>Contact Now</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Contact 3 */}
            <View style={styles.contactCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View>
                        <Text style={styles.contactName}>Attorney James Brown</Text>
                        <Text style={styles.contactRole}>Estate Attorney</Text>
                    </View>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleBadgeText}>Full Access</Text>
                    </View>
                </View>

                <View style={styles.contactInfoRow}>
                    <Ionicons name="call-outline" size={14} color={ColorConstants.GRAY} />
                    <Text style={styles.contactInfoText}>+1 (555) 666-7777</Text>
                </View>
                <View style={styles.contactInfoRow}>
                    <Ionicons name="mail-outline" size={14} color={ColorConstants.GRAY} />
                    <Text style={styles.contactInfoText}>jbrown@lawfirm.com</Text>
                </View>
                <View style={styles.contactInfoRow}>
                    <Ionicons name="location-outline" size={14} color={ColorConstants.GRAY} />
                    <Text style={styles.contactInfoText}>Law Building, 5th Floor</Text>
                </View>


                <View style={styles.actionButtonsRow}>
                    <TouchableOpacity style={styles.outlineButton}>
                        <Text style={styles.outlineButtonText}>View Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.solidButton}>
                        <Text style={styles.solidButtonText}>Contact Now</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderDocumentsTab = () => (
        <View style={styles.contentBox}>
            <Text style={styles.sectionHeaderTitle}>Emergency Documents</Text>
            <Text style={styles.sectionHeaderSubtitle}>Critical documents accessible during emergency</Text>

            {/* Document 1 */}
            <View style={styles.contactCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.contactName}>Last Will & Testament</Text>
                        <Text style={styles.contactRole}>Complete estate planning{'\n'}document</Text>
                    </View>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleBadgeText}>Locked</Text>
                    </View>
                </View>

                <View style={styles.docDetailsContainer}>
                    <View style={styles.docDetailRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.docLabel}>Category</Text>
                            <Text style={styles.docValue}>Michael Brown</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.docLabel}>File Type</Text>
                            <View style={styles.fileTypeBadge}>
                                <Text style={styles.fileTypeText}>PDF</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.docDetailRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.docLabel}>Size</Text>
                            <Text style={styles.docValue}>2.4 MB</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.docLabel}>Upload Date</Text>
                            <Text style={styles.docValue}>1/15/2026</Text>
                        </View>
                    </View>
                    <View style={styles.docDetailRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.docLabel}>Visible To</Text>
                            <Text style={styles.docValue}>spouse, attorney</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.warningBox}>
                    <Ionicons name="lock-closed-outline" size={14} color={ColorConstants.BLACK2} />
                    <View style={{ marginLeft: 8, flex: 1 }}>
                        <Text style={styles.warningDesc}>
                            This document is only accessible{'\n'}when emergency access is{'\n'}activated.
                        </Text>
                    </View>
                </View>

                <View style={styles.actionButtonsRow}>
                    <TouchableOpacity style={styles.outlineButton}>
                        <Text style={styles.outlineButtonText}>View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.solidButton, { backgroundColor: ColorConstants.BROWN50 }]}>
                        <Text style={styles.solidButtonText}>Download</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Document 2 */}
            <View style={styles.contactCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.contactName}>Medical Power of Attorney</Text>
                        <Text style={styles.contactRole}>Authorized medical decision maker document</Text>
                    </View>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleBadgeText}>Locked</Text>
                    </View>
                </View>

                <View style={styles.docDetailsContainer}>
                    <View style={styles.docDetailRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.docLabel}>Category</Text>
                            <Text style={styles.docValue}>Medical</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.docLabel}>File Type</Text>
                            <View style={styles.fileTypeBadge}>
                                <Text style={styles.fileTypeText}>PDF</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.docDetailRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.docLabel}>Size</Text>
                            <Text style={styles.docValue}>1.8 MB</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.docLabel}>Upload Date</Text>
                            <Text style={styles.docValue}>1/15/2026</Text>
                        </View>
                    </View>
                    <View style={styles.docDetailRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.docLabel}>Visible To</Text>
                            <Text style={styles.docValue}>spouse, physician</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.warningBox}>
                    <Ionicons name="lock-closed-outline" size={14} color={ColorConstants.BLACK2} />
                    <View style={{ marginLeft: 8, flex: 1 }}>
                        <Text style={styles.warningDesc}>
                            This document is only accessible{'\n'}when emergency access is{'\n'}activated.
                        </Text>
                    </View>
                </View>

                <View style={styles.actionButtonsRow}>
                    <TouchableOpacity style={styles.outlineButton}>
                        <Text style={styles.outlineButtonText}>View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.solidButton, { backgroundColor: ColorConstants.BROWN50 }]}>
                        <Text style={styles.solidButtonText}>Download</Text>
                    </TouchableOpacity>
                </View>
            </View>


            {/* Document 3 */}
            <View style={styles.contactCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.contactName}>Financial Account List</Text>
                        <Text style={styles.contactRole}>All bank and investment accounts with details</Text>
                    </View>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleBadgeText}>Locked</Text>
                    </View>
                </View>

                <View style={styles.docDetailsContainer}>
                    <View style={styles.docDetailRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.docLabel}>Category</Text>
                            <Text style={styles.docValue}>Financial</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.docLabel}>File Type</Text>
                            <View style={[styles.fileTypeBadge, { backgroundColor: '#F0D0C9' }]}>
                                <Text style={styles.fileTypeText}>DOCX</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.docDetailRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.docLabel}>Size</Text>
                            <Text style={styles.docValue}>0.5 MB</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.docLabel}>Upload Date</Text>
                            <Text style={styles.docValue}>3/1/2026</Text>
                        </View>
                    </View>
                    <View style={styles.docDetailRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.docLabel}>Visible To</Text>
                            <Text style={styles.docValue}>spouse</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.warningBox}>
                    <Ionicons name="lock-closed-outline" size={14} color={ColorConstants.BLACK2} />
                    <View style={{ marginLeft: 8, flex: 1 }}>
                        <Text style={styles.warningDesc}>
                            This document is only accessible{'\n'}when emergency access is{'\n'}activated.
                        </Text>
                    </View>
                </View>

                <View style={styles.actionButtonsRow}>
                    <TouchableOpacity style={styles.outlineButton}>
                        <Text style={styles.outlineButtonText}>View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.solidButton, { backgroundColor: ColorConstants.BROWN50 }]}>
                        <Text style={styles.solidButtonText}>Download</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Document 4 */}
            <View style={styles.contactCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.contactName}>Insurance Policies Summary</Text>
                        <Text style={styles.contactRole}>Life, health, property, and disability insurance</Text>
                    </View>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleBadgeText}>Locked</Text>
                    </View>
                </View>

                <View style={styles.docDetailsContainer}>
                    <View style={styles.docDetailRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.docLabel}>Category</Text>
                            <Text style={styles.docValue}>Insurance</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.docLabel}>File Type</Text>
                            <View style={[styles.fileTypeBadge, { backgroundColor: '#F0D0C9' }]}>
                                <Text style={styles.fileTypeText}>DOCX</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.docDetailRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.docLabel}>Size</Text>
                            <Text style={styles.docValue}>3.1 MB</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.docLabel}>Upload Date</Text>
                            <Text style={styles.docValue}>2/10/2026</Text>
                        </View>
                    </View>
                    <View style={styles.docDetailRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.docLabel}>Visible To</Text>
                            <Text style={styles.docValue}>spouse</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.warningBox}>
                    <Ionicons name="lock-closed-outline" size={14} color={ColorConstants.BLACK2} />
                    <View style={{ marginLeft: 8, flex: 1 }}>
                        <Text style={styles.warningDesc}>
                            This document is only accessible{'\n'}when emergency access is{'\n'}activated.
                        </Text>
                    </View>
                </View>

                <View style={styles.actionButtonsRow}>
                    <TouchableOpacity style={styles.outlineButton}>
                        <Text style={styles.outlineButtonText}>View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.solidButton, { backgroundColor: ColorConstants.BROWN50 }]}>
                        <Text style={styles.solidButtonText}>Download</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Document Security Info */}
            <View style={[styles.infoBox, { marginBottom: 30 }]}>
                <Ionicons name="alert-circle-outline" size={20} color={ColorConstants.BLACK2} style={{ marginTop: 2 }} />
                <View style={{ marginLeft: 8, flex: 1 }}>
                    <Text style={styles.infoTitle}>Document Security</Text>
                    <Text style={styles.infoDesc}>
                        All emergency documents are encrypted and{'\n'}access is logged. Documents can only be{'\n'}accessed when emergency access is{'\n'}activated and you have the required{'\n'}permissions.
                    </Text>
                </View>
            </View>

        </View>
    );

    if (accessBlocked) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar backgroundColor={ColorConstants.WHITE} barStyle="dark-content" />
                <Header
                    title={StringConstants.EMERGENCY_ACCESS}
                    subtitle={StringConstants.RESTRICTED_ACCESS_TO_CRITICAL_INFORMATION}
                    showBackArrow={false}
                    containerStyle={{ marginTop: 20 }}
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
                        You don't have permission to view emergency access.{'\n'}Please contact the homeowner to grant access.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={ColorConstants.WHITE} barStyle="dark-content" />

            <ScrollView showsVerticalScrollIndicator={false}>
                <Header
                    title={StringConstants.EMERGENCY_ACCESS}
                    subtitle={StringConstants.RESTRICTED_ACCESS_TO_CRITICAL_INFORMATION}
                    showBackArrow={false}
                    containerStyle={{ marginTop: 20 }}
                />

                <View style={styles.contentContainer}>
                    {loading ? (
                        <ActivityIndicator size="large" color={ColorConstants.PRIMARY_BROWN} style={{ marginTop: 50 }} />
                    ) : (
                        <>
                            {renderStatusSection()}

                            {/* {emergencyStatus?.status === 'ACTIVE' && (
                                <View>
                                    {renderTabs()}
                                    {activeTab === 'triggers' && renderTriggersTab()}
                                    {activeTab === 'contacts' && renderContactsTab()}
                                    {activeTab === 'documents' && renderDocumentsTab()}
                                </View>
                            )} */}
                        </>
                    )}
                </View>

                <EmergencyTrustModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    onRequestAccess={handleRequestAccess}
                />
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
        paddingHorizontal: 16,
        paddingBottom: 20
    },
    lockedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
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
    statusCard: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        marginTop: 20,
        marginBottom: 20,
        // Shadow for iOS
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 4 },
        // shadowOpacity: 0.10,
        // shadowRadius: 8,
        // // Shadow for Android
        // elevation: 5,
    },
    contentBox: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        marginBottom: 20,
        // Shadow for iOS
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 4 },
        // shadowOpacity: 0.10,
        // shadowRadius: 8,
        // // Shadow for Android
        // elevation: 5,
    },
    statusTitle: {
        fontSize: 20,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.BLACK2,
        marginBottom: 4,
    },
    statusSubtitle: {
        fontSize: 16,
        fontFamily: Fonts.mulishRegular,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 12,
    },
    pendingBadge: {
        backgroundColor: ColorConstants.ORANGE,
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 16,
    },
    pendingBadgeText: {
        fontSize: 11,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.WHITE,
    },
    warningBox: {
        backgroundColor: '#FFF8E6', // Light orange/yellow background
        borderWidth: 1,
        borderColor: '#FFD700', // Gold/Yellow border
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
        marginBottom: 16,
        marginTop: 10
    },
    warningTitle: {
        fontSize: 18,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.BLACK2,
        marginBottom: 2,
    },
    warningDesc: {
        fontSize: 14,
        fontFamily: Fonts.mulishRegular,
        color: ColorConstants.GRAY5,
        lineHeight: 16,
    },
    requestButton: {
        backgroundColor: '#A06A61',
        borderRadius: 10,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    requestButtonText: {
        fontSize: 16,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.WHITE,
    },

    // Tabs
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#E0AB9B80',
        borderRadius: 8,
        padding: 4,
        marginBottom: 20,
    },
    tabItem: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
    },
    activeTabItem: {
        backgroundColor: ColorConstants.WHITE,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 4,
    },
    tabText: {
        fontSize: 14,
        fontFamily: Fonts.ManropeMedium,
        color: '#2D2F33',
    },
    activeTabText: {
        color: ColorConstants.BLACK2,
    },

    // Section Headers
    sectionHeaderTitle: {
        fontSize: 20,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.BLACK2,
        marginBottom: 4,
    },
    sectionHeaderSubtitle: {
        fontSize: 16,
        fontFamily: Fonts.mulishRegular,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 16,
    },

    // Triggers
    triggerCard: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        padding: 16,
        marginBottom: 16,
    },
    triggerTitle: {
        fontSize: 20,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.BLACK2,
        marginBottom: 4,
    },
    triggerDesc: {
        fontSize: 16,
        fontFamily: Fonts.mulishRegular,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 12,
    },
    activeBadge: {
        backgroundColor: ColorConstants.GREEN2, // Green
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 12,
    },
    activeBadgeText: {
        fontSize: 12,
        fontFamily: Fonts.monMedium,
        color: ColorConstants.WHITE,
    },
    lastCheckedText: {
        fontSize: 14,
        fontFamily: Fonts.mulishRegular,
        color: ColorConstants.GRAY,
    },
    infoBox: {
        backgroundColor: '#FFF8E6', // Light orange/yellow background
        borderWidth: 1,
        borderColor: '#FFE0B2', // Light orange border
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
    },
    infoTitle: {
        fontSize: 18,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.BLACK2,
        marginBottom: 4,
    },
    infoDesc: {
        fontSize: 14,
        fontFamily: Fonts.mulishRegular,
        color: ColorConstants.DARK_CYAN,
        lineHeight: 18,
    },

    // Contacts
    contactCard: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        padding: 16,
        marginBottom: 16,
    },
    contactName: {
        fontSize: 20,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.BLACK2,
        marginBottom: 2,
    },
    contactRole: {
        fontSize: 16,
        fontFamily: Fonts.mulishRegular,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 12,
    },
    roleBadge: {
        backgroundColor: '#E5E7EB', // Light gray
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    roleBadgeText: {
        fontSize: 12,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.BLACK2,
    },
    contactInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    contactInfoText: {
        fontSize: 16,
        fontFamily: Fonts.mulishRegular,
        color: ColorConstants.GRAY5,
        marginLeft: 8,
    },
    actionButtonsRow: {
        flexDirection: 'row',
        gap: 12, // React Native 0.71+ support gap
    },
    outlineButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: ColorConstants.WHITE,
    },
    outlineButtonText: {
        fontSize: 16,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.BLACK2,
    },
    solidButton: {
        flex: 1,
        backgroundColor: '#9B6359',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    solidButtonText: {
        fontSize: 16,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.WHITE,
    },

    // Documents
    docDetailsContainer: {
        backgroundColor: '#EEEEEE', // Very light gray
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    docDetailRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    docLabel: {
        fontSize: 10,
        fontFamily: 'Inter-Regular',
        color: ColorConstants.GRAY,
        marginBottom: 2,
    },
    docValue: {
        fontSize: 12,
        fontFamily: 'Inter-Medium',
        color: ColorConstants.BLACK2,
    },
    fileTypeBadge: {
        backgroundColor: '#E0AB9B',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    fileTypeText: {
        fontSize: 10,
        fontFamily: 'Inter-Bold',
        color: '#5D4037', // Dark brown
    },

})