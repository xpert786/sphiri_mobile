import { axiosInstance } from '@/api/axiosInstance';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import Header from '@/components/Header';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    BackHandler,
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsVendor() {
    const [activeTab, setActiveTab] = useState<'Engagement Stats' | 'Renewal Pipeline' | 'Client Feedback'>('Engagement Stats');

    // API Data State
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [renewalData, setRenewalData] = useState<any[]>([]);
    const [feedbackData, setFeedbackData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isAnalyticsForbidden, setIsAnalyticsForbidden] = useState(false);

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

    // Fetch all analytics data
    useEffect(() => {
        fetchAnalyticsData();
    }, []);

    const fetchAnalyticsData = async () => {
        try {
            setLoading(true);
            setIsAnalyticsForbidden(false);

            // Fetch all three endpoints in parallel using allSettled to handle individual failures
            const results = await Promise.allSettled([
                axiosInstance.get(ApiConstants.VENDOR_ANALYTICS),
                axiosInstance.get(ApiConstants.VENDOR_ANALYTICS_RENEWAL_PIPELINE),
                axiosInstance.get(ApiConstants.VENDOR_ANALYTICS_FEEDBACK)
            ]);

            // Handle VENDOR_ANALYTICS
            if (results[0].status === 'fulfilled') {
                setAnalyticsData(results[0].value.data);
            } else {
                const error = results[0].reason;
                if (error?.response?.status === 403) {
                    setIsAnalyticsForbidden(true);
                }
                console.error('Error fetching VENDOR_ANALYTICS:', error);
            }

            // Handle RENEWAL_PIPELINE
            if (results[1].status === 'fulfilled') {
                setRenewalData(results[1].value.data?.pipeline || []);
            } else {
                console.error('Error fetching VENDOR_ANALYTICS_RENEWAL_PIPELINE:', results[1].reason);
            }

            // Handle FEEDBACK
            if (results[2].status === 'fulfilled') {
                setFeedbackData(results[2].value.data);
            } else {
                console.error('Error fetching VENDOR_ANALYTICS_FEEDBACK:', results[2].reason);
            }

        } catch (error) {
            console.error('General error fetching analytics data:', error);
        } finally {
            setLoading(false);
        }
    };


    // Chart data - will be populated from API
    const barData = analyticsData?.revenue_chart?.map((item: any) => ({
        value: parseFloat(item.revenue),
        label: item.month,
        frontColor: '#F59E0B'
    })) || [];

    const pieData = analyticsData?.service_distribution?.map((item: any) => ({
        value: item.count,
        color: item.color,
        text: `${item.percentage}%`
    })) || [];

    const lineData = analyticsData?.revenue_chart?.map((item: any, index: number) => ({
        value: parseFloat(item.revenue) || index * 10 + 50,
        label: item.month
    })) || [];



    const renderStatisticsTop = () => (
        <View>
            {/* Top Cards */}
            <View style={styles.statsGrid}>
                <View style={styles.statsCard}>
                    <Text style={styles.statsLabel}>Total Services</Text>
                    <View style={styles.statsRow}>
                        <Text style={styles.statsValue}>{analyticsData?.summary?.total_services || 0}</Text>
                        <View style={[styles.iconContainer, { backgroundColor: '#374151' }]}>
                            <Image source={Icons.ic_check_circle2} style={[styles.cardIcon, { tintColor: 'white' }]} />
                        </View>
                    </View>
                    <View style={styles.statsRow2}>
                        <Image source={Icons.ic_tilted_arrow} style={styles.titledUpArrow} />
                        <Text style={styles.statsSubtext}>{analyticsData?.summary?.services_this_month || 0} this month</Text>
                    </View>
                </View>
                <View style={styles.statsCard}>
                    <Text style={styles.statsLabel}>Completion Rate</Text>
                    <View style={styles.statsRow}>
                        <Text style={styles.statsValue}>{analyticsData?.summary?.completion_rate || '0'}%</Text>
                        <View style={[styles.iconContainer, { backgroundColor: '#374151' }]}>
                            <Image source={Icons.ic_analytics} style={[styles.cardIcon, { tintColor: 'white' }]} />
                        </View>
                    </View>
                    <View style={styles.statsRow2}>
                        <Image source={Icons.ic_tilted_arrow} style={styles.titledUpArrow} />
                        <Text style={styles.statsSubtext}>{analyticsData?.summary?.completion_status || 'N/A'}</Text>
                    </View>
                </View>
                <View style={styles.statsCard}>
                    <Text style={styles.statsLabel}>Customer Retention</Text>
                    <View style={styles.statsRow}>
                        <Text style={styles.statsValue}>{analyticsData?.summary?.customer_retention || '0'}%</Text>
                        <View style={[styles.iconContainer, { backgroundColor: '#374151' }]}>
                            <Image source={Icons.ic_users} style={[styles.cardIcon, { tintColor: 'white' }]} />
                        </View>
                    </View>
                    <Text style={styles.statsSubtextNeutral}>{analyticsData?.summary?.repeat_rate || '0'}% repeat rate</Text>
                </View>
                <View style={styles.statsCard}>
                    <Text style={styles.statsLabel}>Average Rating</Text>
                    <View style={styles.statsRow}>
                        <Text style={styles.statsValue}>{analyticsData?.summary?.avg_rating || '0'}</Text>
                        <View style={[styles.iconContainer, { backgroundColor: '#374151' }]}>
                            <Image source={Icons.ic_stars} style={[styles.cardIcon, { tintColor: 'white' }]} />
                        </View>
                    </View>
                    <Text style={styles.statsSubtextRed}>From {analyticsData?.summary?.total_reviews || 0} reviews</Text>
                </View>
            </View>

            {/* Revenue Trend */}
            {!isAnalyticsForbidden && (
                <View style={styles.chartCard}>
                    <Text style={styles.chartTitle}>Revenue Trend</Text>
                    <Text style={styles.chartSubtitle}>Lost 6 months performance</Text>
                    <View style={{ marginTop: 20, alignItems: 'center', overflow: 'hidden' }}>

                        <BarChart
                            data={barData}
                            width={screenWidth}
                            height={200}
                            barWidth={20}
                            spacing={25}
                            roundedTop

                            /* GRID LINES */
                            hideRules={false}              // very important
                            rulesType="dashed"              // "solid" | "dashed"
                            rulesColor="#E0E0E0"            // horizontal grid color
                            rulesThickness={1}

                            showVerticalLines={false}              // X-axis grid lines
                            verticalLinesColor="#E0E0E0"
                            verticalLinesThickness={1}

                            /* Axis */
                            xAxisThickness={1}
                            yAxisThickness={1}
                            xAxisColor="#E0E0E0"
                            yAxisColor="#E0E0E0"
                            yAxisLabelPrefix="$"
                            yAxisTextStyle={{
                                color: ColorConstants.BLACK2,
                                fontFamily: Fonts.mulishRegular,
                                fontSize: 12,
                            }}
                            xAxisLabelTextStyle={{
                                fontSize: 12,
                                color: ColorConstants.BLACK2,
                                fontFamily: Fonts.mulishRegular,
                            }}

                            noOfSections={4}
                        />
                    </View>
                </View>
            )}

            {/* Service Distribution Pie Chart */}
            {!isAnalyticsForbidden && (
                <View style={styles.chartCard}>
                    <Text style={styles.chartTitle}>Service Distribution</Text>
                    <Text style={styles.chartSubtitle}>By service type</Text>
                    <View style={{ marginTop: 20, alignItems: 'center' }}>
                        <PieChart
                            data={pieData}
                            donut={false} // Screenshot is a full pie
                            radius={100}
                            innerRadius={0}
                            showText
                            textColor="white"
                            textSize={12}
                        />
                    </View>
                    {/* Legend */}
                    <View style={styles.legendContainer}>
                        <View style={styles.legendRow}>
                            {analyticsData?.service_distribution?.map((item: any, index: number) => (
                                <React.Fragment key={index}>
                                    <View style={[styles.legendDot, { backgroundColor: item.color }, index > 0 && { marginLeft: 10 }]} />
                                    <Text style={[styles.legendText, { color: item.color }]}>{item.service_type}</Text>
                                </React.Fragment>
                            ))}
                        </View>
                    </View>
                </View>
            )}
        </View>
    );

    const renderStatisticsBottom = () => (
        <View style={styles.pipelineContainer}>
            {/* Engagement Statistics */}
            <View >
                <Text style={styles.sectionTitle}>Engagement Statistics</Text>
                <Text style={styles.sectionSubtitle}>Track interaction patterns and client relationships</Text>

                <View style={styles.engagementCard}>
                    <Text style={styles.engLabel}>Services This Month</Text>
                    <View style={styles.engRow}>
                        <Text style={styles.engValue}>{analyticsData?.engagement_stats?.services_this_month || 0}</Text>
                        <Text style={styles.engTrend}>{analyticsData?.engagement_stats?.services_change || ''}</Text>
                    </View>
                </View>
                <View style={styles.engagementCard}>
                    <Text style={styles.engLabel}>Avg Response Time</Text>
                    <View style={styles.engRow}>
                        <Text style={styles.engValue}>{analyticsData?.engagement_stats?.avg_response_time || '0 hours'}</Text>
                        <Text style={styles.engStatus}>{analyticsData?.engagement_stats?.response_time_status || ''}</Text>
                    </View>
                </View>
                <View style={styles.engagementCard}>
                    <Text style={styles.engLabel}>Avg Job Duration</Text>
                    <View style={styles.engRow}>
                        <Text style={styles.engValue}>{analyticsData?.engagement_stats?.avg_job_duration || '0 hours'}</Text>
                    </View>
                </View>
                <View style={styles.engagementCard}>
                    <Text style={styles.engLabel}>Repeat Customer Rate</Text>
                    <View style={styles.engRow}>
                        <Text style={styles.engValue}>{analyticsData?.engagement_stats?.repeat_customer_rate || '0'}%</Text>
                        <View style={styles.badgeSuccess}>
                            <Text style={styles.badgeTextSuccess}>{analyticsData?.engagement_stats?.repeat_customer_status || 'Good'}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Monthly Growth Line Chart */}
            <View style={[styles.chartCard, { marginHorizontal: 0 }]}>
                <Text style={styles.chartTitle}>Monthly Growth</Text>
                <Text style={styles.chartValue}>+{analyticsData?.engagement_stats?.monthly_growth || '0'}%</Text>
                {!isAnalyticsForbidden &&
                    <View style={{ marginTop: 10, alignItems: 'center' }}>
                        <LineChart
                            data={lineData}
                            width={screenWidth - 80}
                            height={200}
                            color="#3B82F6"
                            thickness={2}
                            startFillColor="rgba(59, 130, 246, 0.3)"
                            endFillColor="rgba(59, 130, 246, 0.05)"
                            startOpacity={0.9}
                            endOpacity={0.2}
                            initialSpacing={10}
                            noOfSections={4}
                            yAxisThickness={0}
                            xAxisThickness={0}
                            hideRules
                            hideDataPoints
                            areaChart
                            curved
                            xAxisLabelTextStyle={{ color: ColorConstants.DARK_CYAN, fontSize: 10, fontFamily: Fonts.mulishRegular }}
                            yAxisTextStyle={{ color: ColorConstants.DARK_CYAN, fontSize: 10, fontFamily: Fonts.mulishRegular }}
                        />
                    </View>}
            </View>
        </View>
    );

    const renderRenewalPipeline = () => (
        <View style={styles.pipelineContainer}>
            <Text style={styles.sectionTitle}>Renewal Pipeline</Text>
            <Text style={styles.sectionSubtitle}>Contracts expiring soon - prioritize renewals by urgency</Text>
            {/* Pipeline List */}
            {renewalData.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No contracts up for renewal at this time.</Text>
                </View>
            ) : (
                renewalData.map((item: any) => (
                    <View key={item.id} style={styles.pipelineCard}>
                        <View style={styles.pipelineHeader}>
                            <View>
                                <Text style={styles.pipelineName}>{item.name}</Text>
                                <Text style={styles.pipelinePlan}>{item.plan}</Text>
                            </View>
                            <View style={[styles.tagBadge, { backgroundColor: item.tag === 'Medium' ? '#F3F4F6' : '#EF4444' }]}>
                                <Text style={[styles.tagText, { color: item.tag === 'Medium' ? '#374151' : 'white' }]}>{item.tag}</Text>
                            </View>
                        </View>

                        <View style={styles.pipelineRow}>
                            <Text style={styles.pipelineAmount}>{item.amount}</Text>
                            <Text style={styles.pipelineExpires}>Expires in {item.expires}</Text>
                        </View>
                        <Text style={styles.pipelineLikelihood}>{item.likelihood}</Text>
                    </View>
                ))
            )}
        </View>
    );

    const renderFeedback = () => (
        <View style={styles.pipelineContainer}>
            {/* Feedback Summary */}
            <Text style={styles.sectionTitle}>Client Feedback Summary</Text>
            <Text style={styles.sectionSubtitle}>Recent reviews and ratings from clients</Text>

            <View style={styles.feedbackSummaryContainer}>
                <View style={styles.feedbackSummaryCard}>
                    <Text style={styles.fsLabel}>Average Rating</Text>
                    <Text style={styles.fsValue}>{feedbackData?.average_rating || '0'}</Text>
                    <View style={{ flexDirection: 'row' }}>
                        {[...Array(5)].map((_, i) => (
                            <Image
                                key={i}
                                source={Icons.ic_star}
                                style={{
                                    width: 12,
                                    height: 12,
                                    tintColor: i < Math.floor(parseFloat(feedbackData?.average_rating || '0')) ? ColorConstants.ORANGE : ColorConstants.GRAY2,
                                    marginRight: 2
                                }}
                            />
                        ))}
                    </View>
                </View>
                <View style={styles.feedbackSummaryCard}>
                    <Text style={styles.fsLabel}>Total Reviews</Text>
                    <Text style={styles.fsValue}>{feedbackData?.total_reviews || 0}</Text>
                </View>
                <View style={styles.feedbackSummaryCard}>
                    <Text style={styles.fsLabel}>Would Recommend</Text>
                    <Text style={[styles.fsValue, { color: ColorConstants.GREEN2 }]}>{feedbackData?.would_recommend_percentage || '0'}%</Text>
                </View>
            </View>

            {/* Reviews List */}
            {feedbackData?.reviews?.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No feedback available</Text>
                </View>
            ) : (
                feedbackData?.reviews?.map((item: any) => (
                    <View key={item.id} style={styles.reviewCard}>
                        <View style={styles.reviewHeader}>
                            <View>
                                <Text style={styles.reviewName}>{item.client_name}</Text>
                                <Text style={styles.reviewService}>{item.service_title}</Text>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                {[...Array(5)].map((_, i) => (
                                    <Image
                                        key={i}
                                        source={Icons.ic_star}
                                        style={{ width: 12, height: 12, tintColor: i < item.rating ? ColorConstants.ORANGE : ColorConstants.GRAY2, marginRight: 2 }}
                                    />
                                ))
                                }
                            </View>
                        </View>
                        <Text style={styles.reviewComment}>{item.comment}</Text>
                        <View style={styles.reviewFooter}>
                            <Text style={styles.reviewDate}>{item.formatted_date}</Text>
                            {item.recommendation !== 'not_recommend' && (
                                <View style={styles.recommendBadge}>
                                    <Text style={styles.recommendText}>{item.recommendation_display}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                ))
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={ColorConstants.WHITE} barStyle="dark-content" />
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={ColorConstants.PRIMARY_BROWN} />
                    <Text style={{ marginTop: 10, fontFamily: Fonts.mulishRegular, color: ColorConstants.DARK_CYAN }}>Loading analytics...</Text>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
                    <Header
                        title="Analytics"
                        subtitle="Track your business performance"
                        showBackArrow={false} // Assuming drawer navigation for top-level
                        containerStyle={{ marginVertical: 10 }}
                    />

                    {/* Top Statistics */}
                    {renderStatisticsTop()}

                    {/* Tab Bar - Always Visible */}
                    <View style={styles.tabBarContainer}>
                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === 'Engagement Stats' && styles.activeTabButton]}
                            onPress={() => setActiveTab('Engagement Stats')}
                        >
                            <Text style={[styles.tabText, activeTab === 'Engagement Stats' && styles.activeTabText]}>Engagement Stats</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === 'Renewal Pipeline' && styles.activeTabButton]}
                            onPress={() => setActiveTab('Renewal Pipeline')}
                        >
                            <Text style={[styles.tabText, activeTab === 'Renewal Pipeline' && styles.activeTabText]}>Renewal Pipeline</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === 'Client Feedback' && styles.activeTabButton]}
                            onPress={() => setActiveTab('Client Feedback')}
                        >
                            <Text style={[styles.tabText, activeTab === 'Client Feedback' && styles.activeTabText]}>Client Feedback</Text>
                        </TouchableOpacity>
                    </View>

                    {activeTab === 'Engagement Stats' && renderStatisticsBottom()}
                    {activeTab === 'Renewal Pipeline' && renderRenewalPipeline()}
                    {activeTab === 'Client Feedback' && renderFeedback()}

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
    scrollContainer: {
        paddingBottom: 40,
    },
    tabBarContainer: {
        flexDirection: 'row',
        backgroundColor: '#F9FAFB',
        borderRadius: 12, // Increased radius
        padding: 4,
        marginBottom: 20,
        marginHorizontal: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB' // Added border per visual typical of this style
    },
    tabButton: {
        flex: 1,
        paddingVertical: 8, // Increased vertical padding
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        paddingHorizontal: 12
    },
    activeTabButton: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    tabText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center'
    },
    activeTabText: {
        color: 'white',
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 11
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
        paddingHorizontal: 20
    },
    statsCard: {
        width: (screenWidth - 52) / 2, // 20 padding * 2 = 40, gap 12. Roughly half.
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
    },
    statsLabel: {
        fontFamily: Fonts.ManropeRegular,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 8
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    statsRow2: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    titledUpArrow: {
        width: 10,
        height: 10,
        resizeMode: 'contain',
        tintColor: ColorConstants.GREEN,
        marginTop: 4,
        marginRight: 4
    },
    statsValue: {
        fontFamily: Fonts.mulishSemiBold,
        fontSize: 20,
        color: ColorConstants.BLACK2
    },
    statsSubtext: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.GREEN2,
        marginTop: 4
    },
    statsSubtextNeutral: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4
    },
    statsSubtextRed: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center'
    },
    cardIcon: {
        width: 16,
        height: 16,
        resizeMode: 'contain'
    },
    chartCard: {
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 20,
        overflow: 'hidden',
    },
    chartTitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 13,
        color: ColorConstants.DARK_CYAN,
    },
    chartSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: '#6B7280',
    },
    chartValue: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 20,
        color: ColorConstants.BLACK2,
        marginBottom: 10
    },
    legendContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 20,
        gap: 10
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 8,
        height: 7,
        marginRight: 6
    },
    legendText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: '#6B7280'
    },
    sectionTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 18,
        color: '#111827',
        // marginHorizontal: 20,
        marginTop: 10
    },
    sectionSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: '#6B7280',
        // marginHorizontal: 20,
        marginBottom: 16
    },
    engagementCard: {
        backgroundColor: ColorConstants.GRAY6, // Light gray background
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    engLabel: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4
    },
    engRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    engValue: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 20,
        color: '#111827'
    },
    engTrend: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.GREEN2 // Green
    },
    engStatus: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: '#374151'
    },
    badgeSuccess: {
        backgroundColor: ColorConstants.GREEN2,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10
    },
    badgeTextSuccess: {
        color: 'white',
        fontSize: 10,
        fontFamily: Fonts.ManropeMedium
    },
    pipelineContainer: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        marginHorizontal: 20,
        marginBottom: 20,
        paddingHorizontal: 16,
        paddingTop: 10
    },
    pipelineCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    pipelineHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12
    },
    pipelineName: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 16,
        color: '#111827'
    },
    pipelinePlan: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: '#6B7280'
    },
    tagBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        height: 24,
        justifyContent: 'center'
    },
    tagText: {
        fontSize: 10,
        fontFamily: Fonts.ManropeMedium
    },
    pipelineRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4
    },
    pipelineAmount: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 18,
        color: '#111827'
    },
    pipelineExpires: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: '#6B7280'
    },
    pipelineLikelihood: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.GREEN2 // Greenish for high likelihood
    },
    feedbackSummaryContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20
    },
    feedbackSummaryCard: {
        flex: 1,
        backgroundColor: ColorConstants.GRAY6,
        borderRadius: 12,
        padding: 14,
    },
    fsLabel: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
        minHeight: 32 // Ensure 2 lines alignment
    },
    fsValue: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 20,
        color: '#111827',
        marginBottom: 4
    },
    reviewCard: {
        backgroundColor: ColorConstants.GRAY6,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
    },
    reviewName: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 16,
        color: '#111827'
    },
    reviewService: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: '#6B7280'
    },
    reviewComment: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: '#374151',
        marginBottom: 12,
        lineHeight: 20
    },
    reviewFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    reviewDate: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: '#6B7280'
    },
    recommendBadge: {
        backgroundColor: ColorConstants.GREEN20, // Light Green
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: ColorConstants.WHITE
    },
    recommendText: {
        fontSize: 10,
        color: ColorConstants.BLACK2,
        fontFamily: Fonts.ManropeMedium
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
