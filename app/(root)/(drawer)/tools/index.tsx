import { apiGet } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import Header from '@/components/Header';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { handleDownload } from '@/constants/Helper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function ToolsScreen() {
    const [activeTab, setActiveTab] = useState<'Maintenance' | 'Moving' | 'Reports'>('Maintenance');
    const [fetchingMovingTasks, setFetchingMovingTasks] = useState(false);
    const [fetchingMaintenanceTasks, setFetchingMaintenanceTasks] = useState(false);
    const [movingTasks, setMovingTasks] = useState<any[]>([]);
    const [movingStatistics, setMovingStatistics] = useState({ total_tasks: 0, completed_tasks: 0 });
    const [maintenanceTasks, setMaintenanceTasks] = useState<any[]>([]);
    useEffect(() => {
        if (activeTab === 'Moving') {
            fetchMovingTasks();
        } else if (activeTab === 'Maintenance') {
            fetchMaintenanceTasks();
        }
    }, [activeTab]);

    const fetchMaintenanceTasks = async () => {
        try {
            setFetchingMaintenanceTasks(true);
            const response = await apiGet(ApiConstants.REMINDERS);
            if (response.data && response.data.results) {
                setMaintenanceTasks(response.data.results.filter((item: any) => item.category_name !== 'Moving'));
            }
        } catch (error) {
            console.log('Error fetching maintenance tasks:', error);
        } finally {
            setFetchingMaintenanceTasks(false);
        }
    };

    const fetchMovingTasks = async () => {
        try {
            setFetchingMovingTasks(true);
            const response = await apiGet(ApiConstants.FAMILY_MEMBER_MOVING_CHECKLIST);
            if (response?.data) {
                if (response.data.todo_list) {
                    setMovingTasks(response.data.todo_list);
                }
                if (response.data.statistics) {
                    setMovingStatistics(response.data.statistics);
                }
            }
        } catch (error) {
            console.log('Error fetching moving tasks:', error);
        } finally {
            setFetchingMovingTasks(false);
        }
    };

    const downloadReport = async (type: 'insurance' | 'estate') => {
        try {
            const response = await apiGet(ApiConstants.TOOLS_REPORTS_GENERATE, { type });
            console.log("response in downloadReport:", response.data)

            if (response.status === 200 || response.status === 201) {
                const downloadUrl = response?.data?.data?.download_url
                console.log("downloadUrl in downloadReport:", downloadUrl);
                const fullUrl = ApiConstants.MEDIA_URL + downloadUrl;
                console.log("fullUrl", fullUrl)
                await handleDownload(fullUrl);
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to download report'
                })
            }
        } catch (error) {
            console.log(`Error downloading ${type} report:`, error);
        }
    };

    const renderMaintenanceItem = ({ item }: { item: any }) => {
        const isHigh = item.priority_name === 'High Priority';
        const isMedium = item.priority_name === 'Medium Priority';
        const isLow = item.priority_name === 'Low Priority';

        const borderColor = item.priority_color || (isHigh ? '#EF4444' : isMedium ? '#FACC15' : '#22C55E');
        const priorityColor = item.priority_color || (isHigh ? '#EF4444' : isMedium ? '#EAB308' : '#16A34A');
        const priorityBg = isHigh ? '#FEF2F2' : isMedium ? '#FEFCE8' : '#F0FDF4';

        const categoryBg = item.category_color ? `${item.category_color}20` : '#F5F3FF'; // 20% opacity using hex
        const categoryText = item.category_color || '#8B5CF6';

        return (
            <View style={[styles.taskCard, { borderLeftColor: borderColor }]}>
                <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <View style={[styles.categoryBadge, { backgroundColor: categoryBg }]}>
                            <Text style={[styles.categoryBadgeText, { color: categoryText }]}>{item.category_name}</Text>
                        </View>
                    </View>
                    <View style={styles.badgeColumn}>
                        {item.is_overdue && (
                            <View style={styles.overdueBadge}>
                                <MaterialCommunityIcons name="alert-circle-outline" size={14} color="#EF4444" />
                                <Text style={styles.overdueBadgeText}>OVERDUE</Text>
                            </View>
                        )}
                        {item.is_recurring && (
                            <View style={styles.recurringBadge}>
                                <MaterialCommunityIcons name="cached" size={14} color="#3B82F6" />
                                <Text style={styles.recurringBadgeText}>RECURRING</Text>
                            </View>
                        )}
                        {item.is_completed && (
                            <View style={styles.completedBadge}>
                                <MaterialCommunityIcons name="cached" size={14} color="#826d3dff" />
                                <Text style={styles.completedText}>COMPLETED</Text>
                            </View>
                        )}
                    </View>
                </View>

                <Text style={styles.cardDescription}>{item.description}</Text>

                <View style={styles.cardDivider} />

                <View style={styles.cardFooter}>
                    <View style={styles.footerInfoRow}>
                        <View style={styles.footerInfoItem}>
                            <Image source={Icons.ic_calendar_outline} style={styles.footerIcon} />
                            <Text style={styles.footerInfoText}>{item.reminder_date} • {item.reminder_time ? item.reminder_time.substring(0, 5) : ''}</Text>
                        </View>
                        {item.assigned_to_name && item.assigned_to_name.length > 0 && (
                            <View style={styles.footerInfoItem}>
                                <Image source={Icons.ic_user_single} style={styles.footerIcon} />
                                <Text style={styles.footerInfoText}>{item.assigned_to_name.join(', ')}</Text>
                            </View>
                        )}
                    </View>
                    <View style={[styles.priorityLabelBadge, { backgroundColor: priorityBg }]}>
                        <Text style={[styles.priorityLabelText, { color: priorityColor }]}>{item.priority_name}</Text>
                    </View>
                </View>
            </View>
        );
    };

    const renderMaintenanceTab = () => (
        <View style={styles.tabContent}>
            <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>All Tasks & Maintenance</Text>
            </View>
            {fetchingMaintenanceTasks ? (
                <View style={{ paddingVertical: 40 }}>
                    <ActivityIndicator size="large" color="#11323B" />
                </View>
            ) : (
                <FlatList
                    data={maintenanceTasks}
                    renderItem={renderMaintenanceItem}
                    keyExtractor={item => item.id.toString()}
                    scrollEnabled={false}
                    contentContainerStyle={styles.maintenanceList}
                    ListEmptyComponent={
                        <View style={styles.emptyStateCard}>
                            <MaterialCommunityIcons name="wrench-outline" size={32} color="#CBD5E1" style={styles.emptyIcon} />
                            <Text style={styles.emptyTitle}>No maintenance tasks scheduled yet.</Text>
                            <Text style={styles.emptySubtitle}>
                                Suggestions: HVAC Service, Lawn Mowing, Roof{'\n'}Inspection.
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );

    const renderMovingHeader = () => {
        const completedTasks = movingStatistics.completed_tasks || 0;
        const totalTasks = movingStatistics.total_tasks || movingTasks.length;
        if (movingTasks.length === 0) {
            return null;
        }

        return (
            <View style={styles.movingHeaderCard}>
                <Text style={styles.movingHeaderTitle}>Moving Checklist</Text>
                <Text style={styles.movingHeaderSubtitle}>Organize your relocation tasks efficiently.</Text>

                <View style={styles.movingProgressRow}>
                    <Text style={styles.movingProgressLabel}>Completion</Text>
                    <Text style={styles.movingProgressValue}>{completedTasks}/{totalTasks}</Text>
                </View>
                <View style={styles.movingProgressBarTrack}>
                    <View style={[styles.movingProgressBarFill, { width: totalTasks > 0 ? `${(completedTasks / totalTasks) * 100}%` : '0%' }]} />
                </View>
            </View>
        );
    };

    const getCategoryColors = (categoryName: string) => {
        if (!categoryName) return { bg: '#F5F3FF', text: '#8B5CF6' }; // Default purple

        const colors = [
            { bg: '#F5F3FF', text: '#8B5CF6' }, // Purple
            { bg: '#E0F2FE', text: '#0284C7' }, // Blue
            { bg: '#F1F5F9', text: '#0F172A' }, // Slate/Black
            { bg: '#FEF2F2', text: '#EF4444' }, // Red
            { bg: '#F0FDF4', text: '#16A34A' }, // Green
            { bg: '#FFF7ED', text: '#EA580C' }, // Orange
            { bg: '#FEFCE8', text: '#CA8A04' }, // Yellow
            { bg: '#FDF2F8', text: '#DB2777' }, // Pink
            { bg: '#F0FDFA', text: '#0D9488' }, // Teal
            { bg: '#EEF2FF', text: '#4F46E5' }, // Indigo
        ];

        // Simple hash to consistently pick a color based on category name
        let hash = 0;
        for (let i = 0; i < categoryName.length; i++) {
            hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
        }

        const index = Math.abs(hash) % colors.length;
        return colors[index];
    };

    const renderMovingItem = ({ item }: { item: any }) => {
        const categoryColors = getCategoryColors(item.category || '');
        const badgeBg = categoryColors.bg;
        const badgeText = categoryColors.text;

        const isHigh = item.priority?.toLowerCase() === 'high' || item.priority?.toLowerCase() === 'critical';
        const isMedium = item.priority?.toLowerCase() === 'medium';

        const priorityColor = isHigh ? '#EF4444' : isMedium ? '#EAB308' : '#16A34A';
        const priorityBg = isHigh ? '#FEF2F2' : isMedium ? '#FEFCE8' : '#F0FDF4';

        return (
            <View style={[styles.taskCard, { borderLeftColor: item.category_color || item.statusColor || '#153C48' }]}>
                <View style={styles.movingCardHeader}>
                    <View style={styles.movingCardHeaderLeft}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.movingCardDescription}>{item.description}</Text>
                    </View>
                    <View style={styles.movingBadgeColumn}>
                        <View style={[styles.categoryBadge, { backgroundColor: badgeBg }]}>
                            <Text style={[styles.categoryBadgeText, { color: badgeText, fontSize: 10 }]}>{item.category ? item.category.replace('_', ' ').toUpperCase() : ''}</Text>
                        </View>
                        {item.priority && (
                            <View style={[styles.priorityLabelBadge, { backgroundColor: priorityBg, alignSelf: 'flex-end' }]}>
                                <Text style={[styles.priorityLabelText, { color: priorityColor }]}>
                                    {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.movingDateBadge}>
                    <MaterialCommunityIcons name="clock-outline" size={14} color="#94A3B8" />
                    <Text style={styles.movingDateText}>{item.due_date || item.date}</Text>
                </View>
            </View>
        );
    };

    const renderMovingTab = () => (
        <View style={styles.tabContent}>
            {fetchingMovingTasks ? (
                <View style={{ paddingVertical: 40 }}>
                    <ActivityIndicator size="large" color="#11323B" />
                </View>
            ) : (
                <FlatList
                    data={movingTasks}
                    renderItem={renderMovingItem}
                    keyExtractor={item => item.id}
                    scrollEnabled={false}
                    ListHeaderComponent={renderMovingHeader}
                    contentContainerStyle={styles.maintenanceList}
                    ListEmptyComponent={
                        <View style={styles.emptyStateCard}>
                            <MaterialCommunityIcons name="clipboard-outline" size={32} color="#CBD5E1" style={styles.emptyIcon} />
                            <Text style={styles.emptyTitle}>Your moving checklist is empty.</Text>
                            <Text style={styles.emptySubtitle}>
                                Add tasks like "Book Moving Truck", "Pack Kitchen", "Update Address".
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );

    const renderReportsTab = () => (
        <View style={styles.tabContent}>
            <View style={styles.reportCard}>
                <View style={styles.reportIconWrapper}>
                    <MaterialCommunityIcons name="file-document-outline" size={22} color="#EA580C" />
                </View>
                <Text style={styles.reportTitle}>Insurance Report</Text>
                <Text style={styles.reportDescription}>
                    Generate a comprehensive list of all your home inventory assets, including purchase prices and estimated values. Essential for insurance claims and coverage reviews.
                </Text>
                <TouchableOpacity style={styles.downloadButton} onPress={() => downloadReport('insurance')}>
                    <MaterialCommunityIcons name="tray-arrow-down" size={20} color={ColorConstants.WHITE} />
                    <Text style={styles.downloadButtonText}>Download Insurance Report</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.reportCard}>
                <View style={styles.reportIconWrapper2}>
                    <MaterialCommunityIcons name="dock-left" size={22} color={ColorConstants.BLUE} />
                </View>
                <Text style={styles.reportTitle}>Estate Preparation</Text>
                <Text style={styles.reportDescription}>
                    A summary of your trustees, shared documents, and critical property information. Helps your family stay informed about your estate organization.
                </Text>
                <TouchableOpacity style={styles.downloadButton2} onPress={() => downloadReport('estate')}>
                    <MaterialCommunityIcons name="tray-arrow-down" size={20} color={ColorConstants.PRIMARY_BROWN} />
                    <Text style={styles.downloadButtonText2}>Download Estate Summary</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={'dark-content'} backgroundColor={ColorConstants.WHITE} />
            <Header
                title="Tools & Planners"
                subtitle="Smart utilities to stay organized and prepared."
                containerStyle={{ paddingTop: 10, paddingBottom: 24 }}
            />

            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Maintenance' && styles.activeTab]}
                    onPress={() => setActiveTab('Maintenance')}
                >
                    <Text style={[styles.tabText, activeTab === 'Maintenance' && styles.activeTabText]}>Maintenance Planner</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Moving' && styles.activeTab]}
                    onPress={() => setActiveTab('Moving')}
                >
                    <Text style={[styles.tabText, activeTab === 'Moving' && styles.activeTabText]}>Moving Planner</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Reports' && styles.activeTab]}
                    onPress={() => setActiveTab('Reports')}
                >
                    <Text style={[styles.tabText, activeTab === 'Reports' && styles.activeTabText]}>Reports</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {activeTab === 'Maintenance' && renderMaintenanceTab()}
                {activeTab === 'Moving' && renderMovingTab()}
                {activeTab === 'Reports' && renderReportsTab()}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorConstants.WHITE, // Light beige from screenshot
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#FAF7F2',
        marginHorizontal: 20,
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#EAEAEB',
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
        justifyContent: 'center'
    },
    activeTab: {
        backgroundColor: '#11323B', // Dark teal from screenshot
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabText: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 13,
        color: '#153C48',
        textAlign: 'center',
        marginHorizontal: 8
    },
    activeTabText: {
        color: ColorConstants.WHITE,
        marginHorizontal: 8
    },
    scrollContent: {
        paddingBottom: 20,
    },
    tabContent: {
        paddingHorizontal: 20,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 17,
        fontFamily: Fonts.ManropeBold,
        color: '#153C48', // Dark color from screenshot
    },
    headerRightAction: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionText: {
        fontSize: 14,
        fontFamily: Fonts.ManropeBold,
        color: '#153C48',
        marginRight: 2,
    },
    // New Card Styles
    maintenanceList: {
        paddingBottom: 20,
    },
    taskCard: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    cardHeaderLeft: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontFamily: Fonts.ManropeBold,
        color: ColorConstants.BLACK2,
        marginBottom: 4,
    },
    categoryBadge: {
        backgroundColor: '#F5F3FF',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    categoryBadgeText: {
        fontSize: 12,
        fontFamily: Fonts.ManropeBold,
        color: '#8B5CF6',
    },
    badgeColumn: {
        alignItems: 'flex-end',
        gap: 8,
    },
    overdueBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    overdueBadgeText: {
        fontSize: 10,
        fontFamily: Fonts.ManropeExtraBold,
        color: '#EF4444',
    },
    recurringBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    recurringBadgeText: {
        fontSize: 10,
        fontFamily: Fonts.ManropeExtraBold,
        color: '#3B82F6',
    },
    completedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ColorConstants.GRAY3,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    completedText: {
        fontSize: 10,
        fontFamily: Fonts.ManropeExtraBold,
        color: ColorConstants.DARK_CYAN,
    },
    cardDescription: {
        fontSize: 14,
        fontFamily: Fonts.mulishMedium,
        color: '#64748B',
        lineHeight: 20,
        marginBottom: 20,
    },
    cardDivider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginBottom: 16,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerInfoRow: {
        flexDirection: 'column',
        gap: 8,
    },
    footerInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    footerIcon: {
        width: 14,
        height: 14,
        tintColor: '#94A3B8',
        resizeMode: 'contain',
    },
    footerInfoText: {
        fontSize: 12,
        fontFamily: Fonts.mulishMedium,
        color: '#64748B',
    },
    priorityLabelBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    priorityLabelText: {
        fontSize: 11,
        fontFamily: Fonts.ManropeBold,
    },
    // Keep Moving Tab styles
    movingHeaderCard: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 24,
        padding: 24,
        marginBottom: 20,
        borderWidth: 0.5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    movingHeaderTitle: {
        fontSize: 20,
        fontFamily: Fonts.ManropeBold,
        color: '#11323B',
        marginBottom: 4,
    },
    movingHeaderSubtitle: {
        fontSize: 12,
        fontFamily: Fonts.interRegular,
        color: '#64748B',
        marginBottom: 24,
    },
    movingProgressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    movingProgressLabel: {
        fontSize: 13,
        fontFamily: Fonts.ManropeBold,
        color: '#11323B',
    },
    movingProgressValue: {
        fontSize: 13,
        fontFamily: Fonts.ManropeBold,
        color: '#11323B',
    },
    movingProgressBarTrack: {
        height: 6,
        backgroundColor: '#F1F5F9',
        borderRadius: 3,
        overflow: 'hidden',
    },
    movingProgressBarFill: {
        height: '100%',
        backgroundColor: '#11323B',
        borderRadius: 3,
    },
    movingCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    movingCardHeaderLeft: {
        flex: 1,
        paddingRight: 12,
    },
    movingBadgeColumn: {
        alignItems: 'flex-end',
        gap: 8,
    },
    movingCardDescription: {
        fontSize: 14,
        fontFamily: Fonts.mulishMedium,
        color: '#64748B',
        lineHeight: 20,
        marginTop: 4,
    },
    movingDateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-start',
        gap: 6,
    },
    movingDateText: {
        fontSize: 12,
        fontFamily: Fonts.interMedium,
        color: '#64748B',
    },
    emptyStateCard: {
        backgroundColor: '#FCFAF6',
        borderRadius: 20,
        padding: 32,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 220,
    },
    emptyIcon: {
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 15,
        fontFamily: Fonts.interMedium,
        color: '#64748B',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 13,
        fontFamily: Fonts.interRegular,
        color: '#94A3B8',
        textAlign: 'center',
        lineHeight: 20,
    },
    // Keep Reports Tab styles
    reportCard: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
        marginBottom: 12
    },
    reportIconWrapper: {
        width: 45,
        height: 45,
        borderRadius: 16,
        backgroundColor: '#FFF4ED',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    reportIconWrapper2: {
        width: 45,
        height: 45,
        borderRadius: 16,
        backgroundColor: '#cbdef3ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    reportTitle: {
        fontSize: 18,
        fontFamily: Fonts.interBold,
        color: ColorConstants.BLACK2,
        marginBottom: 12,
    },
    reportDescription: {
        fontSize: 14,
        fontFamily: Fonts.interRegular,
        color: '#64748B',
        lineHeight: 20,
        marginBottom: 32,
    },
    downloadButton: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    downloadButton2: {
        backgroundColor: ColorConstants.WHITE,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: ColorConstants.PRIMARY_BROWN
    },
    downloadButtonText: {
        color: ColorConstants.WHITE,
        fontSize: 15,
        fontFamily: Fonts.interSemiBold,
    },
    downloadButtonText2: {
        color: ColorConstants.PRIMARY_BROWN,
        fontSize: 15,
        fontFamily: Fonts.interSemiBold,
    },
});
