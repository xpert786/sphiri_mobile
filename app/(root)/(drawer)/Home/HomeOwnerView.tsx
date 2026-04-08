import { apiGet } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import CommonLoader from '@/components/CommonLoader';
import Header from '@/components/Header';
import RecentActivityItem from '@/components/RecentActivity';
import ReminderCard from '@/components/ReminderCard';
import SectionHeader from '@/components/SectionHeader';
import { StringConstants } from '@/constants/StringConstants';
import { styles } from '@/styles/_homeStyles';
import { useFocusEffect } from '@react-navigation/native';
import { Href, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';


type QuickAction = {
  title: string;
  route?: Href;
};

const QuickActions: QuickAction[] = [
  { title: 'Add Contact', route: '/(root)/(drawer)/(contacts)/contacts' },
  { title: 'Upload Document', route: '/(root)/(drawer)/upload-document' },
  { title: 'Invite Family Member', route: '/(root)/(drawer)/(family)/family' },
  { title: 'Set Reminder', route: '/(root)/(drawer)/set-reminder' },
];






export default function HomeOwnerView({ userData }: any) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [personalContactsCount, setPersonalContactsCount] = useState(0);

  const firstName = userData?.full_name?.split(' ')[0] || '';

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
    fetchPersonalContactsCount();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiGet(ApiConstants.DASHBOARD_HOME_OWNER);
      // console.log("Dashboard Home Owner Response:", response.data);
      if (response.status === 200 || response.status === 201) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.log("Error fetching dashboard data in homeowner:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonalContactsCount = async () => {
    try {
      const response = await apiGet(ApiConstants.PERSONAL_CONTACTS_LIST);
      if (response.status === 200 || response.status === 201) {
        const data = response.data;
        const count = Array.isArray(data) ? data.length : (data?.results?.length || 0);
        setPersonalContactsCount(count);
      }
    } catch (error) {
      console.log("Error fetching personal contacts count:", error);
    }
  };

  if (loading) {
    return <CommonLoader visible={loading} />;
  }

  const stats = [
    { count: dashboardData?.stats?.active_vendors?.toString() || '0', label: 'Active Vendors', icon: Icons.ic_active_vendor, route: { pathname: '/(root)/(drawer)/(contacts)/contacts', params: { tab: 'vendor' } } as any },
    { count: personalContactsCount.toString(), label: 'Personal Contacts', icon: Icons.ic_users, route: '/(root)/(drawer)/(family)/family' },
    {
      count: `${dashboardData?.stats?.storage_usage?.used_display || '0'} / ${dashboardData?.stats?.storage_usage?.total_display || '0'}`, label: 'Storage Usage', icon: Icons.ic_storage, route: {
        pathname: '/(root)/(drawer)/account-settings',
        params: { tab: 'Billing' }
      } as any
    },
    { count: dashboardData?.stats?.pending_tasks?.toString() || '0', label: 'Pending Tasks', icon: Icons.ic_clock, route: '/(root)/(drawer)/set-reminder' },
  ];

  const tapOnSmartSuggestionLabel = (buttonLabel: string) => {
    console.log("Button Label:", buttonLabel);
    if (buttonLabel == "Add Contact") {
      router.push('/(root)/(drawer)/(contacts)/contacts');
    }
    else if (buttonLabel == 'Upload Backup') {
      router.push({
        pathname: '/(root)/(drawer)/account-settings',
        params: { tab: 'Backup' }
      } as any);
    } else {
      router.push('/(root)/(drawer)/account-settings');
    }
  }


  const renderEmptyComponent = (message: string) => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );



  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Header
        title={`Welcome Back, ${firstName}`}
        subtitle={StringConstants.HOME_TITLE}
        showBackArrow={false}
        containerStyle={{ paddingTop: 20 }}
      />


      {/* Quick Actions */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickActionsContainer}
      >
        {QuickActions.map((action, index) => {
          const isSelected = selectedIndex === index;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.quickAction,
                isSelected && styles.quickActionSelected,
              ]}
              onPress={() => {
                setSelectedIndex(index);
                if (action.route) {
                  router.push(action.route);
                }
              }}
            >
              <Image
                source={Icons.ic_plus}
                style={[
                  styles.plusIcon,
                  isSelected && styles.plusIconSelected,
                ]}
              />
              <Text
                style={[
                  styles.quickActionText,
                  isSelected && styles.quickActionTextSelected,
                ]}
              >
                {action.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>



      {/* Stats */}
      <View style={styles.statsGrid}>
        {stats.map((stat: any, index: number) => (
          <TouchableOpacity key={index} style={styles.statCard} onPress={() => {
            if (stat.route) {
              router.push(stat.route);
            }
          }}>
            <View style={styles.statHeader}>
              <View style={styles.statIconContainer}>
                <Image source={stat.icon} style={styles.statIcon} resizeMode="contain" />
              </View>
              <Image source={Icons.ic_tilted_arrow} />
            </View>
            <Text style={styles.statCount}>{stat.count}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Smart Suggestions */}
      <View style={styles.profileContainer}>
        <FlatList
          data={dashboardData?.smart_suggestions || []}
          keyExtractor={(_, index) => `${index}`}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          ListEmptyComponent={renderEmptyComponent('No suggestions found')}
          renderItem={({ item }) => {
            return (
              <View style={styles.historyContainer}>
                <View style={styles.iconSmart}>
                  <Image source={Icons.ic_smart} />
                </View>
                <View style={styles.suggestionContent}>
                  <Text style={styles.name}>{item.title}</Text>
                  <Text style={styles.date}>{item.description}</Text>
                  <TouchableOpacity style={styles.activeClientsView} onPress={() => tapOnSmartSuggestionLabel(item.action_label)}>
                    <Text style={styles.activeClient}>{item.action_label}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )
          }}
          ListHeaderComponent={
            <>
              <Text style={styles.sectionTitle}>{StringConstants.SMART_SUGGESTIONS}</Text>
            </>
          }
        />
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <FlatList
          data={dashboardData?.recent_activity || []}
          scrollEnabled={false}
          ListEmptyComponent={renderEmptyComponent('No recent activity found')}
          renderItem={({ item, index }) => (
            <RecentActivityItem
              item={item}
              isLast={index === (dashboardData?.recent_activity?.length || 0) - 1}
            />
          )}
          ListHeaderComponent={
            <SectionHeader title={StringConstants.RECENT_ACTIVITY} />
          }
        />
      </View>

      {/* Reminders */}
      <View style={styles.section}>
        <FlatList
          data={dashboardData?.upcoming_reminders || []}
          scrollEnabled={false}
          ListEmptyComponent={renderEmptyComponent('No upcoming reminders found')}
          renderItem={({ item, index }) => (
            <ReminderCard
              item={item}
              isLast={index === (dashboardData?.upcoming_reminders?.length || 0) - 1}
            />
          )}
          ListHeaderComponent={
            <SectionHeader title={StringConstants.UPCOMING_REMINDERS} />
          }
        />
      </View>
    </ScrollView>
  );
}
