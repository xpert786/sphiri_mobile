import { axiosInstance } from '@/api/axiosInstance';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import Header from '@/components/Header';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ExportRestriction {
    name: string;
    is_restricted: boolean;
}

interface SecurityFeature {
    name: string;
    is_enabled: boolean;
}

interface PermissionsData {
    id: number;
    client_visibility: string;
    client_visibility_display: string;
    assigned_clients_count: number;
    can_export_client_data: boolean;
    can_copy_client_records: boolean;
    can_export_analytics: boolean;
    can_share_documents: boolean;
    export_restrictions: ExportRestriction[];
    security_features: SecurityFeature[];
    created_at: string;
    updated_at: string;
}

interface Policy {
    title: string;
    desc: string;
    badge: string;
}

interface ComplianceStandard {
    name: string;
    is_certified: boolean;
}

interface ComplianceData {
    id: number;
    log_retention_period: number;
    encryption_standard: string;
    gdpr_compliant: boolean;
    hipaa_ready: boolean;
    soc2_type2: boolean;
    data_privacy_shield: boolean;
    compliance_standards: ComplianceStandard[];
}

export default function Permissions() {
    const [activeTab, setActiveTab] = useState('Overview');
    const [permissionsData, setPermissionsData] = useState<PermissionsData | null>(null);
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [complianceData, setComplianceData] = useState<ComplianceData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPermissionsData();
    }, []);

    const fetchPermissionsData = async () => {
        try {
            setLoading(true);
            const [permRes, policyRes, complianceRes] = await Promise.all([
                axiosInstance.get(ApiConstants.VENDOR_PERMISSIONS),
                axiosInstance.get(ApiConstants.VENDOR_PERMISSIONS_SECURITY_POLICIES),
                axiosInstance.get(ApiConstants.VENDOR_PERMISSIONS_COMPLIANCE)
            ]);

            setPermissionsData(permRes.data);
            setPolicies(policyRes.data.policies || []);
            setComplianceData(complianceRes.data);
        } catch (error) {
            console.error('Error fetching permissions data:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderTab = (title: string) => (
        <TouchableOpacity
            style={[styles.tabButton, activeTab === title && styles.activeTabButton]}
            onPress={() => setActiveTab(title)}
        >
            <Text style={[styles.tabText, activeTab === title && styles.activeTabText]}>{title}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title="Access Control & Permissions"
                subtitle="Manage data access, restrictions, and security policies"
                showBackArrow={false}
                containerStyle={{ paddingTop: 10 }}
            />

            <View style={styles.tabContainer}>
                {renderTab('Overview')}
                {renderTab('Security Policies')}
                {renderTab('Compliance')}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
                        <ActivityIndicator size="large" color={ColorConstants.PRIMARY_BROWN} />
                        <Text style={{ marginTop: 10, fontFamily: Fonts.mulishRegular, color: ColorConstants.DARK_CYAN }}>Loading permissions...</Text>
                    </View>
                ) : (
                    <>
                        {activeTab === 'Overview' && (
                            <>
                                {/* Data Access Permissions */}
                                <View style={styles.sectionCard}>
                                    <View style={styles.sectionHeader}>
                                        <Image source={Icons.ic_locked} style={styles.sectionIcon} />
                                        <View>
                                            <Text style={styles.sectionTitle}>Data Access Permissions</Text>
                                            <Text style={styles.sectionSubtitle}>Control what client data can be accessed</Text>
                                        </View>
                                    </View>

                                    <View style={styles.cardItem}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.itemTitle}>Client Visibility</Text>
                                            <Text style={styles.itemSubtitle}>Can view all clients in the system</Text>
                                        </View>
                                        <View style={styles.pillContainer}>
                                            <Text style={styles.pillText}>{permissionsData?.client_visibility_display || 'N/A'}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.cardItem}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.itemTitle}>Assigned Clients</Text>
                                            <Text style={styles.itemSubtitle}>You have access to {permissionsData?.assigned_clients_count || 0} assigned client accounts</Text>
                                        </View>
                                        <View style={styles.badgeContainer}>
                                            <Text style={styles.badgeText}>{permissionsData?.assigned_clients_count || 0}</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Export & Sharing Restrictions */}
                                <View style={[styles.sectionCard, styles.restrictionCard]}>
                                    <View style={styles.sectionHeader}>
                                        <Image source={Icons.ic_notnow} style={[styles.sectionIcon]} />
                                        <View>
                                            <Text style={styles.sectionTitle}>Export & Sharing Restrictions</Text>
                                            <Text style={styles.sectionSubtitle}>Data protection measures to prevent unauthorized sharing</Text>
                                        </View>
                                    </View>

                                    {permissionsData?.export_restrictions?.map((item, index, arr) => (
                                        <View key={index} style={[styles.cardItemWhite]}>
                                            <Text style={styles.itemTitle}>{item.name}</Text>
                                            <View style={styles.restrictedPill}>
                                                <Text style={styles.restrictedText}>{item.is_restricted ? 'Restricted' : 'Not Restricted'}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>

                                {/* Active Security Features */}
                                <View style={[styles.sectionCard, styles.securityCard]}>
                                    <View style={styles.sectionHeader}>
                                        <Image source={Icons.ic_security} style={[styles.sectionIcon]} />
                                        <View>
                                            <Text style={styles.sectionTitle}>Active Security Features</Text>
                                            <Text style={styles.sectionSubtitle}>Your account protection status</Text>
                                        </View>
                                    </View>

                                    {permissionsData?.security_features?.map((item, index, arr) => (
                                        <View key={index} style={[styles.cardItemWhite, index === arr.length - 1 && { marginBottom: 0 }]}>
                                            <Text style={styles.itemTitle}>{item.name}</Text>
                                            {item.is_enabled && <Image source={Icons.ic_check_circle3} />}
                                        </View>
                                    ))}
                                </View>
                            </>
                        )}

                        {activeTab === 'Security Policies' && (
                            <View style={styles.sectionCard}>
                                <View style={styles.headerSpacer}>
                                    <Text style={styles.pageTitle}>Security Policies</Text>
                                    <Text style={styles.pageSubtitle}>Data protection and access control policies in effect</Text>
                                </View>

                                {policies.length === 0 ? (
                                    <View style={styles.emptyState}>
                                        <Text style={styles.emptyStateText}>No security policies available</Text>
                                    </View>
                                ) : (
                                    policies.map((policy, index) => (
                                        <View key={index} style={styles.policyCard}>
                                            <Text style={styles.policyTitle}>{policy.title}</Text>
                                            <Text style={styles.policyDesc}>{policy.desc}</Text>
                                            <View style={styles.policyBadge}>
                                                <Text style={styles.policyBadgeText}>{policy.badge}</Text>
                                            </View>
                                        </View>
                                    ))
                                )}
                            </View>
                        )}

                        {activeTab === 'Compliance' && (
                            <View style={styles.sectionCard}>
                                <View style={styles.headerSpacer}>
                                    <Text style={styles.pageTitle}>Compliance & Audit</Text>
                                    <Text style={styles.pageSubtitle}>Compliance status and audit information</Text>
                                </View>

                                <View style={styles.grayCard}>
                                    <Text style={styles.grayCardLabel}>Log Retention Period</Text>
                                    <Text style={styles.grayCardValue}>{complianceData?.log_retention_period || 0} Days</Text>
                                </View>

                                <View style={styles.grayCard}>
                                    <Text style={styles.grayCardLabel}>Encryption Standard</Text>
                                    <Text style={styles.grayCardValue}>{complianceData?.encryption_standard || 'N/A'}</Text>
                                </View>

                                <View style={styles.complianceCard}>
                                    <Text style={styles.complianceTitle}>Compliance Standards</Text>
                                    {complianceData?.compliance_standards?.map((std, index) => (
                                        <View key={index} style={styles.complianceRow}>
                                            <Text style={styles.complianceName}>{std.name}</Text>
                                            {std.is_certified && (
                                                <View style={styles.certifiedPill}>
                                                    <Text style={styles.certifiedText}>Certified</Text>
                                                </View>
                                            )}
                                        </View>
                                    ))}
                                </View>

                                <View style={styles.noticeCard}>
                                    <Text style={styles.noticeText}>
                                        All access is logged and encrypted. You{'\n'}can view complete audit logs in the Audit{'\n'}Logs section. For compliance reports or{'\n'}questions, contact support.
                                    </Text>
                                </View>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorConstants.WHITE,
    },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 12,
        padding: 4,
        backgroundColor: ColorConstants.WHITE,
        marginTop: 10
    },
    tabContent: {
        // paddingHorizontal: 20, 
        // gap: 12,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    activeTabButton: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        fontFamily: Fonts.ManropeMedium,
    },
    tabText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 12,
        color: ColorConstants.BLACK2,
        textAlign: 'center'
    },
    activeTabText: {
        color: ColorConstants.WHITE,
        fontFamily: Fonts.ManropeMedium,
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    sectionCard: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
    },
    restrictionCard: {
        backgroundColor: ColorConstants.PRIMARY_10,
        borderColor: '#E0AB9B',
    },
    securityCard: {
        backgroundColor: '#4CAF501A', // Light Green bg
        borderColor: '#4CAF50',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    sectionIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
        marginRight: 10,
        tintColor: ColorConstants.BLACK2,
        marginTop: 5,
    },
    sectionTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 20,
        color: ColorConstants.BLACK2,
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
        lineHeight: 18,
        marginLeft: -30
    },
    cardItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: ColorConstants.GRAY3,
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
    },
    cardItemWhite: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
    },

    itemTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.BLACK2,
        marginBottom: 2,
    },
    itemSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.GRAY,
    },
    pillContainer: {
        backgroundColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    pillText: {
        fontFamily: Fonts.interMedium,
        fontSize: 12,
        color: ColorConstants.BLACK2,
    },
    badgeContainer: {
        backgroundColor: '#E5E7EB',
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 3,
        minWidth: 24,
        alignItems: 'center',
    },
    badgeText: {
        fontFamily: Fonts.interMedium,
        fontSize: 12,
        color: ColorConstants.BLACK2,
    },
    restrictedPill: {
        backgroundColor: ColorConstants.RED,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 2,

    },
    restrictedText: {
        fontFamily: Fonts.interMedium,
        fontSize: 12,
        color: ColorConstants.WHITE,
    },
    checkIcon: {
        width: 18,
        height: 18,
        resizeMode: 'contain',
        tintColor: '#10B981',
    },
    // New Styles
    tabContentContainer: {
        paddingTop: 10,
    },
    headerSpacer: {
        marginBottom: 20,
    },
    pageTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 20,
        color: ColorConstants.BLACK2,
        marginBottom: 4,
    },
    pageSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 13,
        color: ColorConstants.GRAY,
    },
    policyCard: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    policyTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.BLACK2,
        marginBottom: 8,
    },
    policyDesc: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 13,
        color: ColorConstants.GRAY,
        lineHeight: 20,
        marginBottom: 12,
    },
    policyBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    policyBadgeText: {
        fontFamily: Fonts.interMedium,
        fontSize: 11,
        color: ColorConstants.BLACK2,
    },
    grayCard: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
    },
    grayCardLabel: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 13,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 6,
    },
    grayCardValue: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 18,
        color: ColorConstants.BLACK2,
    },
    complianceCard: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    complianceTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 18,
        color: ColorConstants.BLACK2,
        marginBottom: 16,
    },
    complianceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    complianceName: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    certifiedPill: {
        backgroundColor: '#4CAF50', // Green
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    certifiedText: {
        fontFamily: Fonts.interMedium,
        fontSize: 11,
        color: ColorConstants.WHITE,
    },
    noticeCard: {
        backgroundColor: '#F59E0B1A', // Light Yellow
        borderColor: '#F59E0B',
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    noticeText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        lineHeight: 20,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    emptyStateText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center'
    }
});
