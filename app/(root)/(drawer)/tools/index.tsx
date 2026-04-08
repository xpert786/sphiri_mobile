import { apiGet, apiPost } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import Header from '@/components/Header';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { handleDownload } from '@/constants/Helper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

const width = Dimensions.get('window').width;

const TOOLS_DATA = [
    {
        id: 'maintenance',
        title: 'Maintenance Planner',
        description: 'View & manage upcoming maintenance tasks, overdue items, and recurring schedules.',
        icon: 'wrench',
        iconBg: '#ECFDF5',
        iconColor: '#059669',
        linkColor: '#059669',
    },
    {
        id: 'emergency',
        title: 'Emergency Home File',
        description: 'Quick-access emergency contacts, insurance documents, and critical property info.',
        icon: 'alert-circle-outline',
        iconBg: '#FEF2F2',
        iconColor: '#DC2626',
        linkColor: '#DC2626',
    },
    {
        id: 'insurance',
        title: 'Insurance Inventory Report',
        description: 'Generate a comprehensive inventory report with photos, receipts, and serial numbers.',
        icon: 'shield-check-outline',
        iconBg: '#FFF7ED',
        iconColor: '#EA580C',
        linkColor: '#EA580C',
    },
    {
        id: 'moving',
        title: 'Moving Planner',
        description: 'Organize your relocation tasks and track completion progress.',
        icon: 'truck-delivery-outline',
        iconBg: '#EEF2FF',
        iconColor: '#4F46E5',
        linkColor: '#4F46E5',
    },
    {
        id: 'estate',
        title: 'Estate Preparation Report',
        description: 'Review trustees, shared documents, and critical estate information.',
        icon: 'folder-outline',
        iconBg: '#EFF6FF',
        iconColor: '#2563EB',
        linkColor: '#2563EB',
    },
];

const TOOL_TYPE_MAP: Record<string, string> = {
    maintenance: 'maintenance_planner',
    emergency: 'emergency_home_file',
    insurance: 'insurance_inventory',
    moving: 'moving_planner',
    estate: 'estate_preparation',
};

export default function ToolsScreen() {
    const [detailToolId, setDetailToolId] = useState<string | null>(null);
    const [fetchingPdf, setFetchingPdf] = useState(false);
    const [fetchingTasks, setFetchingTasks] = useState(false);
    const [maintenanceData, setMaintenanceData] = useState<{
        overdue: any[];
        upcoming: any[];
        recurring: any[];
        recently_completed: any[];
        summary: { overdue_count: number; upcoming_count: number; recurring_count: number; completed_count: number; total_count: number };
    }>({
        overdue: [],
        upcoming: [],
        recurring: [],
        recently_completed: [],
        summary: { overdue_count: 0, upcoming_count: 0, recurring_count: 0, completed_count: 0, total_count: 0 },
    });

    // Emergency State
    const [fetchingEmergency, setFetchingEmergency] = useState(false);
    const [emergencyData, setEmergencyData] = useState<{
        emergency_contacts: any[];
        family_members: any[];
        insurance_documents: any[];
        properties: any[];
        vendor_contacts: any[];
        summary: { emergency_contacts_count: number; family_members_count: number; insurance_docs_count: number; properties_count: number; vendor_contacts_count: number };
    }>({
        emergency_contacts: [],
        family_members: [],
        insurance_documents: [],
        properties: [],
        vendor_contacts: [],
        summary: { emergency_contacts_count: 0, family_members_count: 0, insurance_docs_count: 0, properties_count: 0, vendor_contacts_count: 0 },
    });

    // Insurance State
    const [fetchingInventory, setFetchingInventory] = useState(false);
    const [insuranceData, setInsuranceData] = useState<{
        items: any[];
        available_categories: string[];
        total_items: number;
        total_estimated_value: number;
    }>({
        items: [],
        available_categories: [],
        total_items: 0,
        total_estimated_value: 0,
    });
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

    // Moving State
    const [fetchingMoving, setFetchingMoving] = useState(false);
    const [movingData, setMovingData] = useState<{
        items: any[];
        statistics: { total_tasks: number; completed_tasks: number; pending_tasks: number; completion_percentage: number };
    }>({
        items: [],
        statistics: { total_tasks: 0, completed_tasks: 0, pending_tasks: 0, completion_percentage: 0 },
    });

    // Estate State
    const [fetchingEstate, setFetchingEstate] = useState(false);
    const [estateData, setEstateData] = useState<{
        trustees: any[];
        shared_documents: any[];
        critical_documents: any[];
        properties: any[];
        summary: { trustees_count: number; shared_docs_count: number; critical_docs_count: number; properties_count: number };
    }>({
        trustees: [],
        shared_documents: [],
        critical_documents: [],
        properties: [],
        summary: { trustees_count: 0, shared_docs_count: 0, critical_docs_count: 0, properties_count: 0 },
    });

    const fetchMaintenanceTasks = async () => {
        try {
            setFetchingTasks(true);
            const response = await apiGet(ApiConstants.MAINTENANCE_PLANNER);
            if (response.data) {
                setMaintenanceData({
                    overdue: response.data.overdue || [],
                    upcoming: response.data.upcoming || [],
                    recurring: response.data.recurring || [],
                    recently_completed: response.data.recently_completed || [],
                    summary: response.data.summary || { overdue_count: 0, upcoming_count: 0, recurring_count: 0, completed_count: 0, total_count: 0 },
                });
            }
        } catch (error) {
            console.log('Error fetching maintenance tasks:', error);
        } finally {
            setFetchingTasks(false);
        }
    };

    const fetchEmergencyData = async () => {
        try {
            setFetchingEmergency(true);
            const response = await apiGet(ApiConstants.EMERGENCY_HOME_FILES);
            if (response.data) {
                setEmergencyData({
                    emergency_contacts: response.data.emergency_contacts || [],
                    family_members: response.data.family_members || [],
                    insurance_documents: response.data.insurance_documents || [],
                    properties: response.data.properties || [],
                    vendor_contacts: response.data.vendor_contacts || [],
                    summary: response.data.summary || { emergency_contacts_count: 0, family_members_count: 0, insurance_docs_count: 0, properties_count: 0, vendor_contacts_count: 0 },
                });
            }
        } catch (error) {
            console.log('Error fetching emergency data:', error);
        } finally {
            setFetchingEmergency(false);
        }
    };

    const fetchInventoryData = async () => {
        try {
            setFetchingInventory(true);
            const response = await apiGet(ApiConstants.INSURANCE_INVENTORY);
            if (response.data) {
                setInsuranceData({
                    items: response.data.items || [],
                    available_categories: response.data.available_categories || [],
                    total_items: response.data.total_items || 0,
                    total_estimated_value: response.data.total_estimated_value || 0,
                });
            }
        } catch (error) {
            console.log('Error fetching inventory data:', error);
        } finally {
            setFetchingInventory(false);
        }
    };

    const fetchMovingTasks = async () => {
        try {
            setFetchingMoving(true);
            const response = await apiGet(ApiConstants.MOVING_PLANNER);
            if (response.data) {
                setMovingData({
                    items: response.data.items || [],
                    statistics: response.data.statistics || { total_tasks: 0, completed_tasks: 0, pending_tasks: 0, completion_percentage: 0 },
                });
            }
        } catch (error) {
            console.log('Error fetching moving tasks:', error);
        } finally {
            setFetchingMoving(false);
        }
    };

    const fetchEstateData = async () => {
        try {
            setFetchingEstate(true);
            const response = await apiGet(ApiConstants.ESTATE_PREPARATION);
            if (response.data) {
                setEstateData({
                    trustees: response.data.trustees || [],
                    shared_documents: response.data.shared_documents || [],
                    critical_documents: response.data.critical_documents || [],
                    properties: response.data.properties || [],
                    summary: response.data.summary || { trustees_count: 0, shared_docs_count: 0, critical_docs_count: 0, properties_count: 0 },
                });
            }
        } catch (error) {
            console.log('Error fetching estate data:', error);
        } finally {
            setFetchingEstate(false);
        }
    };

    useEffect(() => {
        if (detailToolId === 'maintenance') {
            fetchMaintenanceTasks();
        } else if (detailToolId === 'emergency') {
            fetchEmergencyData();
        } else if (detailToolId === 'insurance') {
            fetchInventoryData();
        } else if (detailToolId === 'moving') {
            fetchMovingTasks();
        } else if (detailToolId === 'estate') {
            fetchEstateData();
        }
    }, [detailToolId]);

    const handleExportPDF = async () => {
        if (!detailToolId) return;
        try {
            setFetchingPdf(true);
            const toolType = TOOL_TYPE_MAP[detailToolId];
            const payload = {
                tool_type: toolType,
                options: {
                    category: null
                }
            };
            const response = await apiPost(ApiConstants.GENERATE_PDF, payload);
            console.log("response in handleExportPDF:", response.data);

            if (response?.data?.data?.download_url) {
                const fullUrl = response?.data?.data?.download_url;
                await handleDownload(fullUrl);
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to generate PDF report'
                });
            }
        } catch (error) {
            console.log('Error generating PDF:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Unable to export PDF at this time'
            });
        } finally {
            setFetchingPdf(false);
        }
    };

    const downloadReport = async (type: 'insurance' | 'estate') => {
        try {
            const response = await apiGet(ApiConstants.TOOLS_REPORTS_GENERATE, { type });
            if (response.status === 200 || response.status === 201) {
                const downloadUrl = response?.data?.data?.download_url;
                const fullUrl = ApiConstants.MEDIA_URL + downloadUrl;
                await handleDownload(fullUrl);
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to download report'
                });
            }
        } catch (error) {
            console.log(`Error downloading ${type} report:`, error);
        }
    };

    const handleToolPress = (id: string) => {
        setDetailToolId(id);
    };

    const renderToolCard = (tool: typeof TOOLS_DATA[0]) => (
        <TouchableOpacity
            key={tool.id}
            style={styles.toolCard}
            onPress={() => handleToolPress(tool.id)}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, { backgroundColor: tool.iconBg }]}>
                <MaterialCommunityIcons name={tool.icon as any} size={24} color={tool.iconColor} />
            </View>
            <Text style={styles.toolTitle}>{tool.title}</Text>
            <Text style={styles.toolDescription}>{tool.description}</Text>
            <View style={styles.linkContainer}>
                <Text style={[styles.linkText, { color: tool.linkColor }]}>Open Workflow</Text>
                <MaterialCommunityIcons name="chevron-right" size={18} color={tool.linkColor} />
            </View>
        </TouchableOpacity>
    );

    const renderStatsCard = (label: string, count: number, icon: any, color: string, bg: string) => (
        <View style={styles.statsCard}>
            <View style={[styles.statsIconBox, { backgroundColor: bg }]}>
                <MaterialCommunityIcons name={icon} size={20} color={color} />
            </View>
            <Text style={styles.statsLabel}>{label}</Text>
            <Text style={styles.statsCount}>{count}</Text>
        </View>
    );

    const renderDataTable = (title: string, count: number, icon: any, color: string, headers: string[], rows: any[][], columnWidths: number[]) => {
        return (
            <View style={styles.tableSection}>
                {title ? (
                    <View style={styles.tableHeaderRow}>
                        <MaterialCommunityIcons name={icon} size={22} color={color} />
                        <Text style={styles.tableTitle}>{title}</Text>
                        <View style={styles.countBadge}>
                            <Text style={styles.countBadgeText}>{count}</Text>
                        </View>
                    </View>
                ) : null}

                <View style={styles.tableWrapper}>
                    <View style={styles.innerTableHeader}>
                        {headers.map((h, i) => (
                            <Text key={i} style={[styles.columnHeader, { flex: columnWidths[i] }]}>{h}</Text>
                        ))}
                    </View>
                    {rows.length === 0 ? (
                        <View style={styles.emptyTableState}>
                            <Text style={styles.emptyTableText}>No {title.toLowerCase()} found.</Text>
                        </View>
                    ) : (
                        rows.map((row, index) => (
                            <View key={index} style={[styles.tableRow, index === rows.length - 1 && { borderBottomWidth: 0 }]}>
                                {row.map((cell, i) => (
                                    <View key={i} style={{ flex: columnWidths[i], paddingRight: 8 }}>
                                        {typeof cell === 'string' ? (
                                            <Text style={styles.cellText}>{cell}</Text>
                                        ) : cell}
                                    </View>
                                ))}
                            </View>
                        ))
                    )}
                </View>
            </View>
        );
    };

    const renderInventoryItemCard = (item: any) => (
        <View key={item.id} style={styles.inventoryCard}>
            <View style={styles.inventoryTopRow}>
                <View style={styles.inventoryImageContainer}>
                    {item.photo_url ? (
                        <Image source={{ uri: item.photo_url }} style={styles.inventoryImage} />
                    ) : (
                        <View style={styles.inventoryImagePlaceholder}>
                            <MaterialCommunityIcons name="image-outline" size={24} color="#CBD5E1" />
                        </View>
                    )}
                </View>
                <View style={styles.inventoryMainInfo}>
                    <View style={styles.inventoryTitleRow}>
                        <Text style={styles.inventoryName}>{item.name}</Text>
                        <Text style={styles.inventoryPrice}>${parseFloat(String(item.current_value || item.purchase_price || '0')).toFixed(2)}</Text>
                    </View>
                    <Text style={styles.inventoryMeta}>{item.category} • {item.room || '-'}</Text>
                    <View style={styles.inventoryDetailRow}>
                        <Text style={styles.inventorySN}>SN: {item.serial_number || '-'}</Text>
                        <Text style={styles.inventoryCondition}>{item.condition || 'Good'}</Text>
                    </View>
                    <View style={styles.tagContainer}>
                        {item.is_insured && (
                            <View style={[styles.statusTag, { backgroundColor: '#F0FDF4' }]}>
                                <Text style={[styles.statusTagText, { color: '#059669' }]}>INSURED</Text>
                            </View>
                        )}
                        {item.is_high_value && (
                            <View style={[styles.statusTag, { backgroundColor: '#FFF7ED' }]}>
                                <Text style={[styles.statusTagText, { color: '#EA580C' }]}>HIGH VALUE</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
            <View style={styles.inventoryFooter}>
                <Text style={styles.purchaseDateText}>Purchased: {item.purchase_date || '-'}</Text>
            </View>
        </View>
    );

    const renderMaintenanceDetails = () => {
        const { overdue, upcoming, recurring, recently_completed, summary } = maintenanceData;

        return (
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} style={styles.themeBg}>
                <View style={styles.detailsContainer}>
                    <View style={styles.summaryHeaderCard}>
                        <View style={styles.summaryIconContainer}>
                            <MaterialCommunityIcons name="wrench" size={28} color="#FFFFFF" />
                        </View>
                        <View style={styles.summaryTextContainer}>
                            <Text style={styles.summaryTitle}>Maintenance Planner</Text>
                            <Text style={styles.summarySubtitle}>
                                View & manage upcoming maintenance tasks, overdue items, and recurring schedules.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.statsGrid}>
                        {renderStatsCard('Total', summary.total_count, 'wrench', '#64748B', '#F1F5F9')}
                        {renderStatsCard('Overdue', summary.overdue_count, 'alert-circle-outline', '#DC2626', '#FEF2F2')}
                        {renderStatsCard('Upcoming', summary.upcoming_count, 'clock-outline', '#EA580C', '#FFF7ED')}
                        {renderStatsCard('Recurring', summary.recurring_count, 'cached', '#4F46E5', '#F5F3FF')}
                        {renderStatsCard('Completed', summary.completed_count, 'check-circle-outline', '#059669', '#F0FDF4')}
                    </View>

                    {fetchingTasks ? (
                        <ActivityIndicator size="large" color="#11323B" style={{ marginTop: 40 }} />
                    ) : (
                        <>
                            {renderDataTable('Overdue Tasks', overdue.length, 'alert', '#EAB308', ['TASK', 'DATE', 'PRIORITY', 'CATEGORY'], overdue.map(t => [t.title, t.reminder_date, t.priority_name, t.category_name]), [2, 1.5, 1.5, 1.2])}
                            {renderDataTable('Upcoming Tasks', upcoming.length, 'calendar-month', '#64748B', ['TASK', 'DATE', 'PRIORITY', 'CATEGORY'], upcoming.map(t => [t.title, t.reminder_date, t.priority_name, t.category_name]), [2, 1.5, 1.5, 1.2])}
                            {renderDataTable('Recurring Tasks', recurring.length, 'cached', '#4F46E5', ['TASK', 'DATE', 'STATUS', 'PRIORITY'], recurring.map(t => [t.title, t.reminder_date, t.status || 'in_progress', t.priority_name]), [2, 1.5, 1.5, 1.2])}
                            {renderDataTable('Recently Completed', recently_completed.length, 'check-circle-outline', '#059669', ['TASK', 'DATE', 'PRIORITY', 'CATEGORY'], recently_completed.map(t => [t.title, t.reminder_date, t.priority_name, t.category_name]), [2, 1.5, 1.5, 1.2])}
                        </>
                    )}
                </View>
            </ScrollView>
        );
    };

    const renderEmergencyDetails = () => {
        const { emergency_contacts, family_members, insurance_documents, properties, vendor_contacts, summary } = emergencyData;

        return (
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} style={styles.themeBg}>
                <View style={styles.detailsContainer}>
                    {/* Red Summary Card */}
                    <View style={[styles.summaryHeaderCard, { backgroundColor: '#EF4444' }]}>
                        <View style={styles.summaryIconContainer}>
                            <MaterialCommunityIcons name="alert-circle-outline" size={28} color="#FFFFFF" />
                        </View>
                        <View style={styles.summaryTextContainer}>
                            <Text style={styles.summaryTitle}>Emergency Home File</Text>
                            <Text style={styles.summarySubtitle}>
                                Quick-access emergency contacts, insurance documents, and critical property info.
                            </Text>
                        </View>
                    </View>

                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                        {renderStatsCard('Emergency Contacts', summary.emergency_contacts_count, 'phone-outline', '#DC2626', '#FEF2F2')}
                        {renderStatsCard('Family Members', summary.family_members_count, 'account-outline', '#4F46E5', '#F5F3FF')}
                        {renderStatsCard('Insurance Docs', summary.insurance_docs_count, 'file-document-outline', '#EA580C', '#FFF7ED')}
                        {renderStatsCard('Properties', summary.properties_count, 'home-outline', '#059669', '#F0FDF4')}
                        {renderStatsCard('Vendor Contacts', summary.vendor_contacts_count, 'wrench', '#64748B', '#F1F5F9')}
                    </View>

                    {fetchingEmergency ? (
                        <ActivityIndicator size="large" color="#DC2626" style={{ marginTop: 40 }} />
                    ) : (
                        <>
                            {renderDataTable('Emergency Contacts', emergency_contacts.length, 'phone', '#DC2626', ['NAME', 'PHONE', 'EMERGENCY #', 'EMAIL'], emergency_contacts.map(c => [c.name || '-', c.phone || '-', c.emergency_number || '-', c.email || '-']), [1.5, 1.2, 1.2, 1.8])}
                            {renderDataTable('Family Members', family_members.length, 'account-outline', '#4F46E5', ['NAME', 'EMAIL', 'ROLE'], family_members.map(m => [m.name || '-', m.email || '-', m.role || '-']), [1.5, 2, 1])}
                            {renderDataTable('Properties', properties.length, 'home', '#059669', ['PROPERTY', 'ADDRESS', 'TYPE', 'PRIMARY'], properties.map(p => [p.name || '-', p.full_address || '-', p.property_type || '-', p.is_primary ? <MaterialCommunityIcons name="checkbox-outline" size={16} color="#059669" /> : '-']), [1.2, 2, 1.2, 0.8])}

                            <View style={styles.tableSection}>
                                <View style={styles.tableHeaderRow}>
                                    <MaterialCommunityIcons name="file-document" size={22} color="#EA580C" />
                                    <Text style={styles.tableTitle}>Insurance Documents</Text>
                                    <View style={styles.countBadge}>
                                        <Text style={styles.countBadgeText}>{insurance_documents.length}</Text>
                                    </View>
                                </View>
                                {insurance_documents.length === 0 ? (
                                    <View style={styles.emptyStateContainer}>
                                        <Text style={styles.emptyStateText}>No insurance documents found.</Text>
                                    </View>
                                ) : (
                                    <View style={styles.tableWrapper}>
                                        <View style={styles.innerTableHeader}>
                                            <Text style={[styles.columnHeader, { flex: 2 }]}>FILENAME</Text>
                                            <Text style={[styles.columnHeader, { flex: 1 }]}>SIZE</Text>
                                            <Text style={[styles.columnHeader, { flex: 1 }]}>UPLOADED</Text>
                                        </View>
                                        {insurance_documents.map((d: any, i: number) => (
                                            <View key={i} style={[styles.tableRow, i === insurance_documents.length - 1 && { borderBottomWidth: 0 }]}>
                                                <Text style={[styles.cellText, { flex: 2 }]}>{d.name}</Text>
                                                <Text style={[styles.cellText, { flex: 1 }]}>{d.file_size_display || '-'}</Text>
                                                <Text style={[styles.cellText, { flex: 1 }]}>{d.created_at?.split('T')[0] || '-'}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>

                            {renderDataTable('Key Vendor Contacts', vendor_contacts.length, 'wrench', '#64748B', ['NAME', 'COMPANY', 'PHONE', 'EMAIL'], vendor_contacts.map(v => [v.name || '-', v.company || '-', v.phone || '-', v.email || '-']), [1.5, 1.2, 1.2, 1.8])}
                        </>
                    )}
                </View>
            </ScrollView>
        );
    };

    const renderInsuranceDetails = () => {
        const { items, available_categories, total_items, total_estimated_value } = insuranceData;
        const uniqueCategories = [...new Set(available_categories)];
        const filteredItems = selectedCategory === 'All Categories' ? items : items.filter(item => item.category === selectedCategory);

        return (
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} style={styles.themeBg}>
                <View style={styles.detailsContainer}>
                    {/* Orange Summary Card */}
                    <View style={[styles.summaryHeaderCard, { backgroundColor: '#F97316' }]}>
                        <View style={styles.summaryIconContainer}>
                            <MaterialCommunityIcons name="shield-check-outline" size={28} color="#FFFFFF" />
                        </View>
                        <View style={styles.summaryTextContainer}>
                            <Text style={styles.summaryTitle}>Insurance Inventory Report</Text>
                            <Text style={styles.summarySubtitle}>
                                Generate a comprehensive inventory report with photos, receipts, and serial numbers.
                            </Text>
                        </View>
                    </View>

                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                        {renderStatsCard('Total Items', total_items, 'shield-check-outline', '#EA580C', '#FFF7ED')}
                        {renderStatsCard('Total Value', `$${total_estimated_value.toLocaleString()}`, 'currency-usd', '#059669', '#F0FDF4')}
                    </View>

                    {/* Filter Section */}
                    <View style={styles.filterSection}>
                        <View style={styles.filterLabelRow}>
                            <MaterialCommunityIcons name="filter-variant" size={18} color="#64748B" />
                            <Text style={styles.filterLabel}>Filter by Category</Text>
                        </View>
                        <TouchableOpacity style={styles.filterDropdown} onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}>
                            <Text style={styles.filterDropdownText}>{selectedCategory}</Text>
                            <MaterialCommunityIcons name={showCategoryDropdown ? "chevron-up" : "chevron-down"} size={20} color="#64748B" />
                        </TouchableOpacity>
                        {showCategoryDropdown && (
                            <View style={{ marginTop: 8, backgroundColor: '#F8FAFC', borderRadius: 12, overflow: 'hidden' }}>
                                <TouchableOpacity
                                    style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', backgroundColor: selectedCategory === 'All Categories' ? '#EFF6FF' : 'transparent' }}
                                    onPress={() => { setSelectedCategory('All Categories'); setShowCategoryDropdown(false); }}
                                >
                                    <Text style={{ fontSize: 14, fontFamily: Fonts.mulishSemiBold, color: selectedCategory === 'All Categories' ? '#3B82F6' : '#11323B' }}>All Categories</Text>
                                </TouchableOpacity>
                                {uniqueCategories.map((cat, idx) => (
                                    <TouchableOpacity
                                        key={idx}
                                        style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: idx < uniqueCategories.length - 1 ? 1 : 0, borderBottomColor: '#F1F5F9', backgroundColor: selectedCategory === cat ? '#EFF6FF' : 'transparent' }}
                                        onPress={() => { setSelectedCategory(cat); setShowCategoryDropdown(false); }}
                                    >
                                        <Text style={{ fontSize: 14, fontFamily: Fonts.mulishSemiBold, color: selectedCategory === cat ? '#3B82F6' : '#11323B' }}>{cat}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    <View style={styles.sectionHeaderRow}>
                        <MaterialCommunityIcons name="clipboard-list-outline" size={22} color="#11323B" />
                        <Text style={styles.tableTitle}>Inventory Items</Text>
                        <View style={styles.countBadge}>
                            <Text style={styles.countBadgeText}>{filteredItems.length}</Text>
                        </View>
                    </View>

                    {fetchingInventory ? (
                        <ActivityIndicator size="large" color="#F97316" style={{ marginTop: 40 }} />
                    ) : (
                        <View style={styles.inventoryList}>
                            {filteredItems.map(renderInventoryItemCard)}
                        </View>
                    )}
                </View>
            </ScrollView>
        );
    };

    const renderMovingDetails = () => {
        const { items, statistics } = movingData;
        const { total_tasks, completed_tasks, pending_tasks, completion_percentage } = statistics;
        const completionRate = Math.round(completion_percentage);

        return (
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} style={styles.themeBg}>
                <View style={styles.detailsContainer}>
                    {/* Purple Summary Card */}
                    <View style={[styles.summaryHeaderCard, { backgroundColor: '#8B5CF6' }]}>
                        <View style={styles.summaryIconContainer}>
                            <MaterialCommunityIcons name="car" size={28} color="#FFFFFF" />
                        </View>
                        <View style={styles.summaryTextContainer}>
                            <Text style={styles.summaryTitle}>Moving Planner</Text>
                            <Text style={styles.summarySubtitle}>
                                Organize your relocation tasks and track completion progress.
                            </Text>
                        </View>
                    </View>

                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                        {renderStatsCard('Total Tasks', total_tasks, 'car', '#4F46E5', '#EEF2FF')}
                        {renderStatsCard('Completed', completed_tasks, 'check-circle-outline', '#059669', '#F0FDF4')}
                        {renderStatsCard('Pending', pending_tasks, 'clock-outline', '#EA580C', '#FFF7ED')}

                        <View style={styles.statsCard}>
                            <Text style={styles.statsLabel}>Completion</Text>
                            <Text style={[styles.statsCount, { color: '#8B5CF6' }]}>{completionRate}%</Text>
                            <View style={styles.progressBarContainer}>
                                <View style={[styles.progressBarFill, { width: `${completionRate}%` }]} />
                            </View>
                        </View>
                    </View>

                    {fetchingMoving ? (
                        <ActivityIndicator size="large" color="#8B5CF6" style={{ marginTop: 40 }} />
                    ) : (
                        renderDataTable('Moving Tasks', total_tasks, 'package-variant', '#11323B', ['TASK', 'DATE', 'STATUS', 'PRIORITY'], items.map(t => [
                            t.title,
                            t.reminder_date || '-',
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <MaterialCommunityIcons name={t.is_completed ? "check-circle" : "timer-sand-empty"} size={14} color={t.is_completed ? "#059669" : "#64748B"} style={{ marginRight: 4 }} />
                                <Text style={styles.cellText}>{t.status || (t.is_completed ? 'completed' : 'pending')}</Text>
                            </View>,
                            <Text style={[styles.cellText, { textAlign: 'center' }]}>{t.priority_name || 'Medium'}</Text>
                        ]), [1.8, 1, 1.3, 1.2])
                    )}
                </View>
            </ScrollView>
        );
    };

    const renderEstateDetails = () => {
        return (
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} style={styles.themeBg}>
                <View style={styles.detailsContainer}>
                    {/* Blue Summary Card */}
                    <View style={[styles.summaryHeaderCard, { backgroundColor: '#3B82F6' }]}>
                        <View style={styles.summaryIconContainer}>
                            <MaterialCommunityIcons name="folder-outline" size={28} color="#FFFFFF" />
                        </View>
                        <View style={styles.summaryTextContainer}>
                            <Text style={styles.summaryTitle}>Estate Preparation Report</Text>
                            <Text style={styles.summarySubtitle}>
                                Review trustees, shared documents, and critical estate information.
                            </Text>
                        </View>
                    </View>

                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                        {renderStatsCard('Trustees', estateData.summary.trustees_count, 'account-outline', '#3B82F6', '#EFF6FF')}
                        {renderStatsCard('Shared Docs', estateData.summary.shared_docs_count, 'folder-outline', '#A855F7', '#FAF5FF')}
                        {renderStatsCard('Critical Docs', estateData.summary.critical_docs_count, 'alert-circle-outline', '#EF4444', '#FEF2F2')}
                        {renderStatsCard('Properties', estateData.summary.properties_count, 'home-outline', '#059669', '#F0FDF4')}
                    </View>

                    {fetchingEstate ? (
                        <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 40 }} />
                    ) : (
                        <>
                            <View style={styles.tableSection}>
                                <View style={styles.tableHeaderRow}>
                                    <MaterialCommunityIcons name="account" size={22} color="#3B82F6" />
                                    <Text style={styles.tableTitle}>Appointed Trustees</Text>
                                    <View style={styles.countBadge}>
                                        <Text style={styles.countBadgeText}>{estateData.trustees.length}</Text>
                                    </View>
                                </View>
                                {estateData.trustees.length === 0 ? (
                                    <View style={styles.emptyStateContainer}>
                                        <Text style={styles.emptyStateText}>No trustees appointed. Set up trustees in the Documents section.</Text>
                                    </View>
                                ) : (
                                    renderDataTable('', estateData.trustees.length, 'account', '#3B82F6', ['NAME', 'ROLE', 'EMAIL'], estateData.trustees.map(t => [t.name || t.full_name || '-', t.role || 'Trustee', t.email || '-']), [1.5, 1, 1.5])
                                )}
                            </View>

                            <View style={styles.tableSection}>
                                <View style={styles.tableHeaderRow}>
                                    <MaterialCommunityIcons name="pin" size={22} color="#EF4444" />
                                    <Text style={styles.tableTitle}>Critical Documents</Text>
                                    <View style={styles.countBadge}>
                                        <Text style={styles.countBadgeText}>{estateData.critical_documents.length}</Text>
                                    </View>
                                </View>
                                {estateData.critical_documents.length === 0 ? (
                                    <View style={styles.emptyStateContainer}>
                                        <Text style={styles.emptyStateText}>No critical documents found.</Text>
                                    </View>
                                ) : (
                                    renderDataTable('', estateData.critical_documents.length, 'file-document', '#EF4444', ['FILENAME', 'SIZE', 'UPLOADED'], estateData.critical_documents.map(d => [d.name, d.file_size_display || '-', d.created_at?.split('T')[0]]), [2, 1, 1])
                                )}
                            </View>

                            <View style={styles.tableSection}>
                                <View style={styles.tableHeaderRow}>
                                    <MaterialCommunityIcons name="folder-account" size={22} color="#A855F7" />
                                    <Text style={styles.tableTitle}>Shared Documents</Text>
                                    <View style={styles.countBadge}>
                                        <Text style={styles.countBadgeText}>{estateData.shared_documents.length}</Text>
                                    </View>
                                </View>
                                {estateData.shared_documents.length === 0 ? (
                                    <View style={styles.emptyStateContainer}>
                                        <Text style={styles.emptyStateText}>No shared documents found.</Text>
                                    </View>
                                ) : (
                                    renderDataTable('', estateData.shared_documents.length, 'file-document', '#A855F7', ['FILENAME', 'SIZE', 'UPLOADED'], estateData.shared_documents.map(d => [d.name, d.file_size_display || '-', d.created_at?.split('T')[0]]), [2, 1, 1])
                                )}
                            </View>

                            {renderDataTable('Properties', estateData.properties.length, 'home', '#059669', ['PROPERTY', 'ADDRESS', 'TYPE', 'PRIMARY'], estateData.properties.map(p => [p.name || '-', p.full_address || '-', p.property_type || '-', p.is_primary ? <View style={{ alignItems: 'center' }}><MaterialCommunityIcons name="checkbox-outline" size={16} color="#059669" /></View> : <Text style={[styles.cellText, { textAlign: 'center' }]}>-</Text>]), [1.2, 2, 1.2, 0.8])}
                        </>
                    )}
                </View>
            </ScrollView>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={'dark-content'} backgroundColor={ColorConstants.WHITE} />
            <Header
                title={detailToolId ? (detailToolId === 'maintenance' ? "Maintenance Planner" : detailToolId === 'emergency' ? "Emergency Home File" : detailToolId === 'insurance' ? "Insurance Inventory Report" : detailToolId === 'moving' ? "Moving Planner" : "Estate Preparation Report") : "Tools & Planners"}
                subtitle={detailToolId ? "" : "Smart utilities to stay organized and prepared. Click a tool to start its automated workflow."}
                showBackArrow={!!detailToolId}
                tapOnBack={() => setDetailToolId(null)}
                containerStyle={{ paddingTop: 10, paddingBottom: 16 }}
                renderRight={detailToolId ? () => (
                    <View style={{ width: '100%', alignItems: 'flex-end', paddingHorizontal: 20 }}>
                        <TouchableOpacity
                            onPress={handleExportPDF}
                            disabled={fetchingPdf}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, borderWidth: 1, borderColor: '#FEE2E2' }}>
                                {fetchingPdf ? (
                                    <ActivityIndicator size="small" color="#DC2626" />
                                ) : (
                                    <MaterialCommunityIcons name="export" size={18} color="#DC2626" />
                                )}
                                <Text style={{ marginLeft: 4, fontSize: 11, fontFamily: Fonts.ManropeBold, color: '#DC2626' }}>Export</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                ) : undefined}
            />

            {!detailToolId ? (
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} style={styles.themeBg}>
                    <View style={styles.cardList}>
                        {TOOLS_DATA.map(renderToolCard)}
                    </View>
                </ScrollView>
            ) : (
                detailToolId === 'maintenance' ? renderMaintenanceDetails() :
                    detailToolId === 'emergency' ? renderEmergencyDetails() :
                        detailToolId === 'insurance' ? renderInsuranceDetails() :
                            detailToolId === 'moving' ? renderMovingDetails() :
                                detailToolId === 'estate' ? renderEstateDetails() : (
                                    <View style={styles.placeholderContainer}>
                                        <Text style={styles.placeholderText}>Details for {detailToolId} coming soon.</Text>
                                        <TouchableOpacity onPress={() => setDetailToolId(null)} style={styles.backButton}>
                                            <Text style={styles.backButtonText}>Go Back</Text>
                                        </TouchableOpacity>
                                    </View>
                                )
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fbfbfbff',
    },
    scrollContent: {
        paddingBottom: 40,
        paddingTop: 10
    },
    headerSection: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 16,
    },
    mainTitle: {
        fontSize: 28,
        fontFamily: Fonts.ManropeBold,
        color: '#11323B',
        marginBottom: 8,
    },
    mainSubtitle: {
        fontSize: 15,
        fontFamily: Fonts.mulishRegular,
        color: '#64748B',
        lineHeight: 22,
    },
    cardList: {
        paddingHorizontal: 16,
        gap: 16,
    },
    toolCard: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    toolTitle: {
        fontSize: 20,
        fontFamily: Fonts.ManropeBold,
        color: '#11323B',
        marginBottom: 12,
    },
    toolDescription: {
        fontSize: 14,
        fontFamily: Fonts.mulishRegular,
        color: '#64748B',
        lineHeight: 20,
        marginBottom: 24,
    },
    linkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    linkText: {
        fontSize: 16,
        fontFamily: Fonts.ManropeBold,
    },
    // Details Screen Styles
    themeBg: {
        backgroundColor: '#fbfbfbff',
    },
    detailsContainer: {
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    summaryHeaderCard: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        borderRadius: 24,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    summaryIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    summaryTextContainer: {
        flex: 1,
    },
    summaryTitle: {
        fontSize: 22,
        fontFamily: Fonts.ManropeBold,
        color: ColorConstants.WHITE,
        marginBottom: 4,
    },
    summarySubtitle: {
        fontSize: 13,
        fontFamily: Fonts.mulishRegular,
        color: 'rgba(255,255,255,0.7)',
        lineHeight: 18,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    statsCard: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 16,
        padding: 16,
        width: (width - 44) / 2,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    statsIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    statsLabel: {
        fontSize: 13,
        fontFamily: Fonts.ManropeSemiBold,
        color: '#64748B',
        marginBottom: 4,
    },
    statsCount: {
        fontSize: 24,
        fontFamily: Fonts.ManropeBold,
        color: '#11323B',
    },
    tableSection: {
        marginBottom: 24,
    },
    tableHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    tableTitle: {
        fontSize: 18,
        fontFamily: Fonts.ManropeBold,
        color: '#11323B',
    },
    countBadge: {
        backgroundColor: '#E2E8F0',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    countBadgeText: {
        fontSize: 12,
        fontFamily: Fonts.ManropeBold,
        color: '#64748B',
    },
    tableWrapper: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    innerTableHeader: {
        flexDirection: 'row',
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    columnHeader: {
        fontSize: 11,
        fontFamily: Fonts.ManropeBold,
        color: 'rgba(255,255,255,0.6)',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        alignItems: 'center',
    },
    cellText: {
        fontSize: 13,
        fontFamily: Fonts.mulishRegular,
        color: '#11323B',
    },
    placeholderContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    placeholderText: {
        fontSize: 16,
        fontFamily: Fonts.ManropeSemiBold,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 20,
    },
    backButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#11323B',
        borderRadius: 8,
    },
    backButtonText: {
        color: ColorConstants.WHITE,
        fontFamily: Fonts.ManropeBold,
    },
    emptyTableState: {
        padding: 20,
        alignItems: 'center',
    },
    emptyTableText: {
        fontSize: 14,
        fontFamily: Fonts.mulishRegular,
        color: '#64748B',
    },
    emptyStateContainer: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 16,
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        borderStyle: 'dashed',
    },
    emptyStateText: {
        fontSize: 15,
        fontFamily: Fonts.mulishRegular,
        color: '#64748B',
        textAlign: 'center'
    },
    filterSection: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    filterLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    filterLabel: {
        fontSize: 14,
        fontFamily: Fonts.mulishBold,
        color: '#64748B',
        marginLeft: 8,
    },
    filterDropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    filterDropdownText: {
        fontSize: 15,
        fontFamily: Fonts.mulishSemiBold,
        color: '#11323B',
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    inventoryList: {
        gap: 16,
    },
    inventoryCard: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    inventoryTopRow: {
        flexDirection: 'row',
        padding: 16,
    },
    inventoryImageContainer: {
        width: 100,
        height: 100,
        borderRadius: 16,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    inventoryImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    inventoryImagePlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    inventoryMainInfo: {
        flex: 1,
        marginLeft: 16,
    },
    inventoryTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    inventoryName: {
        flex: 1,
        fontSize: 17,
        fontFamily: Fonts.ManropeBold,
        color: '#11323B',
        marginRight: 8,
    },
    inventoryPrice: {
        fontSize: 18,
        fontFamily: Fonts.ManropeBold,
        color: '#11323B',
    },
    inventoryMeta: {
        fontSize: 13,
        fontFamily: Fonts.mulishMedium,
        color: '#64748B',
        marginBottom: 8,
    },
    inventoryDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    inventorySN: {
        fontSize: 12,
        fontFamily: Fonts.mulishBold,
        color: '#94A3B8',
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    inventoryCondition: {
        fontSize: 12,
        fontFamily: Fonts.mulishMedium,
        color: '#94A3B8',
    },
    tagContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    statusTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusTagText: {
        fontSize: 10,
        fontFamily: Fonts.mulishExtraBold,
    },
    inventoryFooter: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#F8FAFC',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    purchaseDateText: {
        fontSize: 13,
        fontFamily: Fonts.mulishMedium,
        color: '#64748B',
    },
    progressBarContainer: {
        height: 6,
        backgroundColor: '#F1F5F9',
        borderRadius: 3,
        marginTop: 12,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#8B5CF6',
        borderRadius: 3,
    },
});
