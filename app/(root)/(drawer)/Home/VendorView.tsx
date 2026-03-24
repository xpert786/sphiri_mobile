import { apiGet } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import CommonButton from '@/components/CommonButton';
import Header from '@/components/Header';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { capitalizeFirstLetter } from '@/constants/Helper';
import AppointmentDetailsModal from '@/modals/AppointmentDetailsModal';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface VendorStats {
  active_clients: number;
  active_clients_change: number;
  services_completed: number;
  services_completed_change: number;
  pending_messages: number;
  pending_messages_change: number;
  average_rating: number;
  average_rating_change: number;
}

interface RecentActivity {
  id: number;
  activity_type: string;
  activity_type_display: string;
  title: string;
  description: string;
  time_ago: string; // e.g., "18 hours ago", "Jan 31, 2026"
  created_at: string;
}

interface UpcomingAppointment {
  id: number;
  client_name: string;
  service_title: string;
  formatted_date: string;
  formatted_time: string;
  address: string;
  status?: string;
  notes?: string;
}

interface VendorDashboardResponse {
  business_name: string;
  stats: VendorStats;
  recent_activity: RecentActivity[];
  upcoming_appointments: UpcomingAppointment[];
  client_name: string;
  service_title: string;
  formatted_date: string;
  formatted_time: string;
  address: string;
}



export default function VendorView({ userData }: any) {
  const [dashboardData, setDashboardData] = useState<VendorDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<UpcomingAppointment | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Default values to fall back or initial state if needed
  const businessName = dashboardData?.business_name || userData?.business_name || "Alex's Plumbing";

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        subscription.remove();
    }, [])
  );

  useEffect(() => {
    fetchDashboardData();

  }, []);


  const fetchDashboardData = async () => {
    try {
      const response = await apiGet(ApiConstants.VENDOR_DASHBOARD);
      if (response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch vendor dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };




  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const getStatsArray = () => {
    if (!dashboardData) return [];
    return [
      {
        count: dashboardData.stats.active_clients.toString(),
        change: dashboardData.stats.active_clients_change,
        label: 'Active Clients',
        icon: Icons.ic_users,
        route: '/(root)/(drawer)/(clients)/clients',
      },
      {
        count: dashboardData.stats.services_completed.toString(),
        change: dashboardData.stats.services_completed_change,
        label: 'Services Completed',
        icon: Icons.ic_checklist,
        route: '/(root)/(drawer)/analytics-vendor'
      },
      {
        count: dashboardData.stats.pending_messages.toString(),
        change: dashboardData.stats.pending_messages_change,
        label: 'Pending Messages',
        icon: Icons.ic_message_clock,
        route: '/(root)/(drawer)/(message)/message'
      },
      {
        count: dashboardData.stats.average_rating.toFixed(1), // Updated to match user request "5" -> "5.0"
        change: dashboardData.stats.average_rating_change,
        label: 'Average Rating',
        icon: Icons.ic_stars,
        route: '/(root)/(drawer)/analytics-vendor'
      },
    ];
  };

  const dashboardStats = getStatsArray();
  const recentActivities = dashboardData?.recent_activity || [];
  const upcomingAppointments = dashboardData?.upcoming_appointments || [];

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={ColorConstants.DARK_CYAN} />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Header
        title={`Welcome back, ${businessName}`}
        subtitle="Here's your business overview for today"
        showBackArrow={false}
        containerStyle={{ paddingTop: 10 }}
      />

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {dashboardStats.map((stat, index) => (
          <TouchableOpacity key={index} style={styles.statCard}
            onPress={() => {
              if (stat.route) {
                router.push(stat.route);
              }
            }}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statCount}>{stat.count}</Text>
            </View>
            {stat.change !== 0 && (
              <View style={styles.statChangeRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image
                    source={stat.change > 0 ? Icons.ic_tilted_arrow : Icons.ic_lower_tilted_arrow}
                    style={[
                      styles.changeIcon,
                      { tintColor: stat.change > 0 ? ColorConstants.GREEN : ColorConstants.RED }
                    ]}
                  />
                  <Text style={[
                    styles.statChangeText,
                    { color: stat.change > 0 ? ColorConstants.GREEN : ColorConstants.RED }
                  ]}>
                    {stat.change > 0 ? '+' : ''}{stat.change}
                  </Text>
                </View>
                <View style={styles.statIconContainer}>
                  <Image source={stat.icon} style={styles.statIcon} resizeMode="contain" />
                </View>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Activity */}
      <View style={[styles.section, { marginTop: 6 }]}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <Text style={styles.sectionSubtitle}>Latest updates from your business</Text>

        {recentActivities.map((item, index) => (
          <View key={item.id} style={[styles.activityCard, index === recentActivities.length - 1 && { marginBottom: 0 }]}>
            <View style={styles.activityRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.activityName}>{capitalizeFirstLetter(item.title)}</Text>
                <Text style={styles.activityAction}>{capitalizeFirstLetter(item.description)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <View style={[styles.statusBadge, {
                  backgroundColor: item.activity_type === 'new_client' || item.activity_type === 'completed'
                    ? ColorConstants.GREEN2
                    : item.activity_type === 'pending' || item.activity_type.includes('request')
                      ? ColorConstants.ORANGE
                      : '#E5E7EB'
                }]}>
                  <Text style={[styles.statusText, {
                    color: (item.activity_type === 'new_client' || item.activity_type === 'completed' || item.activity_type === 'pending' || item.activity_type.includes('request'))
                      ? ColorConstants.WHITE
                      : ColorConstants.BLACK
                  }]}>
                    {item.activity_type_display}
                  </Text>
                </View>
                <Text style={styles.activityTime}>{item.time_ago}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Upcoming Appointments */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
        <Text style={styles.sectionSubtitle}>Next scheduled services</Text>

        {upcomingAppointments.length === 0 ? (
          <Text style={[styles.sectionSubtitle, { marginTop: 10, fontFamily: Fonts.ManropeLight, textAlign: 'center' }]}>No upcoming appointments.</Text>
        ) : (
          upcomingAppointments.map((item) => (
            <View key={item.id} style={styles.appointmentCard}>
              <Text style={styles.apptName}>{capitalizeFirstLetter(item.client_name)}</Text>
              <Text style={styles.apptType}>{capitalizeFirstLetter(item.service_title)}</Text>

              <View style={styles.apptRow}>
                <Image source={Icons.ic_calender} style={styles.apptIcon} />
                <Text style={styles.apptText}>{item.formatted_date} {item.formatted_time}</Text>
              </View>
              <View style={styles.apptRow}>
                <Image source={Icons.ic_location} style={styles.apptIcon} />
                <Text style={styles.apptText}>{item.address}</Text>
              </View>

              <CommonButton
                title="View Details"
                onPress={() => {
                  setSelectedAppointment(item);
                  setIsModalVisible(true);
                }}
                containerStyle={{ marginTop: 10, height: 35 }}
              />
            </View>
          ))
        )}
      </View>

      {/* Grow Your Business */}
      <View style={styles.section}>
        <Text style={styles.growTitle}>Grow Your Business</Text>
        <Text style={styles.growText}>Complete your profile to increase visibility and attract more clients.</Text>
        <CommonButton
          title="View Details"
          onPress={() => { router.push('./grow-business') }}
          containerStyle={{ marginTop: 16, width: 140, height: 35 }}
        />
      </View>

      {/* Appointment Details Modal */}
      <AppointmentDetailsModal
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment || undefined}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statCard: {
    width: '48%',
    backgroundColor: ColorConstants.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: ColorConstants.GRAY3,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,

  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 5
  },
  statLabel: {
    fontFamily: Fonts.ManropeRegular,
    fontSize: 12,
    color: ColorConstants.DARK_CYAN,

  },
  statContent: {
    marginTop: 8,
  },
  statCount: {
    fontFamily: Fonts.mulishSemiBold,
    fontSize: 24,
    color: ColorConstants.BLACK2,
  },
  statIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#535B69', // Dark grey/blue from screenshot
    justifyContent: 'center',
    alignItems: 'center',
  },
  statIcon: {
    width: 16,
    height: 16,
    tintColor: ColorConstants.WHITE,
  },
  statChangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    justifyContent: 'space-between',
  },
  changeIcon: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
    marginRight: 4,
  },
  statChangeText: {
    fontFamily: Fonts.mulishRegular,
    fontSize: 12,
  },

  // Sections
  section: {
    marginTop: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: ColorConstants.GRAY3,
    borderRadius: 12,
    marginHorizontal: 20
  },
  sectionTitle: {
    fontFamily: Fonts.ManropeSemiBold,
    fontSize: 18,
    color: ColorConstants.BLACK2,
    marginBottom: 2
  },
  sectionSubtitle: {
    fontFamily: Fonts.mulishRegular,
    fontSize: 12,
    color: ColorConstants.GRAY,
    marginBottom: 16,
  },

  // Recent Activity
  activityCard: {
    backgroundColor: ColorConstants.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: ColorConstants.GRAY3,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  activityName: {
    fontFamily: Fonts.ManropeMedium,
    fontSize: 16,
    color: ColorConstants.BLACK2,
    marginBottom: 4,
  },
  activityAction: {
    fontFamily: Fonts.mulishRegular,
    fontSize: 12,
    color: ColorConstants.GRAY,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 4,
  },
  statusText: {
    fontFamily: Fonts.mulishRegular,
    fontSize: 10,
    color: ColorConstants.WHITE,
  },
  activityTime: {
    fontFamily: Fonts.mulishRegular,
    fontSize: 10,
    color: ColorConstants.GRAY,
  },

  // Upcoming Appointments
  appointmentCard: {
    backgroundColor: ColorConstants.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: ColorConstants.GRAY3,
  },
  apptName: {
    fontFamily: Fonts.ManropeMedium,
    fontSize: 16,
    color: ColorConstants.BLACK2,
    marginBottom: 2,
  },
  apptType: {
    fontFamily: Fonts.mulishRegular,
    fontSize: 12,
    color: ColorConstants.GRAY,
    marginBottom: 12,
  },
  apptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  apptIcon: {
    width: 14,
    height: 14,
    tintColor: ColorConstants.DARK_CYAN,
    marginRight: 8,
    resizeMode: 'contain',
  },
  apptText: {
    fontFamily: Fonts.mulishRegular,
    fontSize: 12,
    color: ColorConstants.DARK_CYAN,
  },

  // Grow Business

  growTitle: {
    fontFamily: Fonts.ManropeMedium,
    fontSize: 18,
    color: ColorConstants.BLACK2,
    marginBottom: 8,
  },
  growText: {
    fontFamily: Fonts.mulishRegular,
    fontSize: 14,
    color: ColorConstants.DARK_CYAN,
    lineHeight: 20,
    maxWidth: '90%',
  },
});
