import BackupTab from '@/components/AccountSettings/BackupTab';
import BillingTab from '@/components/AccountSettings/BillingTab';
import NotificationsTab from '@/components/AccountSettings/NotificationsTab';
import SecurityTab from '@/components/AccountSettings/SecurityTab';
import Header from '@/components/Header';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TABS = ['Security', 'Notifications', 'Billing', 'Backup'];

export default function AccountSettings() {
    const params = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState('Security');

    useEffect(() => {
        if (params.tab && typeof params.tab === 'string' && TABS.includes(params.tab)) {
            setActiveTab(params.tab);
        }
    }, [params.tab]);

    const renderTabs = () => (
        <View style={styles.tabsContainer}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabsContent}
            >
                <View style={styles.tabsWrapper}>
                    {TABS.map(tab => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            style={[
                                styles.tab,
                                activeTab === tab && styles.activeTab
                            ]}
                        >
                            <Text style={[
                                styles.tabText,
                                activeTab === tab && styles.activeTabText
                            ]}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Security':
                return <SecurityTab />;
            case 'Notifications':
                return <NotificationsTab />;
            case 'Billing':
                return <BillingTab />;
            case 'Backup':
                return <BackupTab />;
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title={'Profile'}
                subtitle={'Update your personal information and profile details.'}
                showBackArrow={false}
                containerStyle={{ paddingTop: 10 }}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.pageHeader}>
                    <Text style={styles.pageTitle}>Account Settings</Text>
                    <Text style={styles.pageSubtitle}>Manage your profile, security, subscription, and preferences</Text>
                </View>

                {renderTabs()}

                {renderTabContent()}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorConstants.WHITE,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    pageHeader: {
        paddingHorizontal: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 16,
        paddingVertical: 16,
        marginHorizontal: 20,
        marginTop: 10,
    },
    pageTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 18,
        color: ColorConstants.BLACK2,
    },
    pageSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
        marginTop: 4,
    },
    tabsContainer: {
        marginBottom: 20,
    },
    tabsContent: {
        paddingLeft: 15,
        paddingRight: 20,
    },
    tabsWrapper: {
        flexDirection: 'row',
        backgroundColor: ColorConstants.LIGHT_PEACH,
        borderRadius: 10,
        padding: 5,
    },
    tab: {
        paddingVertical: 5,
        paddingHorizontal: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: ColorConstants.WHITE,
    },
    tabText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    activeTabText: {
        color: ColorConstants.BLACK2,
    },
});
