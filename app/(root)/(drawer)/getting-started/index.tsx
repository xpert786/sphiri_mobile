import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HOW_IT_WORKS = [
    {
        icon: 'rocket-launch-outline',
        title: 'Complete Your Profile',
        description: 'Add your property details and contact information to get started.',
    },
    {
        icon: 'information-outline',
        title: 'Upload Documents',
        description: 'Digitize your insurance policies, warranties, and property deeds in the Documents Archive.',
    },
    {
        icon: 'lightbulb-outline',
        title: 'Set Reminders',
        description: 'Never miss a renewal. Set alerts for tax payments, maintenance, and policy expiries.',
    },
    {
        icon: 'account-group-outline',
        title: 'Invite Family & Vendors',
        description: 'Share access with family members and bridge the gap with service providers.',
    },
];

const FAQS = [
    {
        q: 'How do I add a property?',
        a: "Go to your Dashboard and click on 'Add Property' to enter your home details.",
    },
    {
        q: 'Can I invite my local plumber?',
        a: "Yes! Use the 'Vendors & Contacts' page to invite and manage your service providers.",
    },
    {
        q: 'Is my data private?',
        a: 'Absolutely. Sphiri uses bank-level encryption. Only you and the people you explicitly share with can see your data.',
    },
];

const BEST_PRACTICES = [
    {
        title: 'Use Categories',
        description: 'Organize documents by category to find them instantly during emergencies.',
    },
    {
        title: 'Update Regularly',
        description: 'Keep your property status and contacts updated for accurate reporting.',
    },
    {
        title: 'Secure Shares',
        description: 'Use the Family Sharing permissions to control who can view or edit sensitive files.',
    },
];

export default function GettingStartedScreen() {
    const handleGoToDashboard = () => {
        router.replace('/(root)/(drawer)/Home');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={ColorConstants.WHITE} />

            {/* Back Header */}
            <TouchableOpacity style={styles.backHeader} onPress={handleGoToDashboard} activeOpacity={0.7}>
                <View style={styles.backCircle}>
                    <MaterialCommunityIcons name="arrow-left" size={20} color="#11323B" />
                </View>
                <Text style={styles.backLabel}>Back to Dashboard</Text>
            </TouchableOpacity>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Card */}
                <View style={styles.heroCard}>
                    <Text style={styles.heroTitle}>Welcome to Sphiri! Your Home's Digital Hub.</Text>
                    <Text style={styles.heroSubtitle}>
                        Manage your documents, track property maintenance, and collaborate with family and vendors all in one secure place.
                    </Text>
                </View>

                {/* How It Works */}
                <View style={styles.sectionLabelRow}>
                    <View style={styles.sectionAccent} />
                    <Text style={styles.sectionTitle}>How It Works</Text>
                </View>

                {HOW_IT_WORKS.map((item, idx) => (
                    <View key={idx} style={styles.stepCard}>
                        <View style={styles.stepIconBox}>
                            <MaterialCommunityIcons name={item.icon} size={26} color="#11323B" />
                        </View>
                        <View style={styles.stepTextBox}>
                            <Text style={styles.stepTitle}>{item.title}</Text>
                            <Text style={styles.stepDesc}>{item.description}</Text>
                        </View>
                    </View>
                ))}

                {/* FAQs */}
                <View style={[styles.sectionLabelRow, { marginTop: 28 }]}>
                    <View style={styles.sectionAccent} />
                    <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                </View>

                {FAQS.map((faq, idx) => (
                    <View key={idx} style={styles.faqCard}>
                        <View style={styles.faqTitleRow}>
                            <MaterialCommunityIcons name="help-circle-outline" size={20} color="#11323B" style={{ marginRight: 8 }} />
                            <Text style={styles.faqQuestion}>{faq.q}</Text>
                        </View>
                        <Text style={styles.faqAnswer}>{faq.a}</Text>
                    </View>
                ))}

                {/* Best Practices */}
                <View style={styles.bestPracticesCard}>
                    <View style={styles.bestPracticesHeader}>
                        <MaterialCommunityIcons name="lightbulb-outline" size={22} color="#11323B" style={{ marginRight: 8 }} />
                        <Text style={styles.bestPracticesTitle}>Best Practices</Text>
                    </View>

                    {BEST_PRACTICES.map((bp, idx) => (
                        <View key={idx} style={styles.bpItem}>
                            <View style={styles.bpBullet} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.bpTitle}>{bp.title}</Text>
                                <Text style={styles.bpDesc}>{bp.description}</Text>
                            </View>
                        </View>
                    ))}

                    <View style={styles.divider} />

                    <Text style={styles.quoteText}>
                        {'"Sphiri is designed to give you peace of mind by keeping your most important asset organized."'}
                    </Text>

                    <TouchableOpacity style={styles.startButton} onPress={handleGoToDashboard} activeOpacity={0.85}>
                        <Text style={styles.startButtonText}>Start Using Sphiri now</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color={ColorConstants.WHITE} />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f3f3ff',
    },
    backHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#f3f3f3ff',
    },
    backCircle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: ColorConstants.WHITE,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.10,
        shadowRadius: 12,
        elevation: 5,
    },
    backLabel: {
        marginLeft: 12,
        fontSize: 16,
        fontFamily: Fonts.ManropeSemiBold,
        color: '#11323B',
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    heroCard: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        borderRadius: 20,
        padding: 24,
        marginBottom: 32,
    },
    heroTitle: {
        fontSize: 22,
        fontFamily: Fonts.ManropeBold,
        color: ColorConstants.WHITE,
        marginBottom: 12,
        lineHeight: 30,
    },
    heroSubtitle: {
        fontSize: 15,
        fontFamily: Fonts.mulishRegular,
        color: 'rgba(255,255,255,0.8)',
        lineHeight: 22,
    },
    sectionLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionAccent: {
        width: 4,
        height: 22,
        borderRadius: 2,
        backgroundColor: '#11323B',
        marginRight: 10,
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: Fonts.ManropeBold,
        color: '#11323B',
    },
    stepCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 5,
        elevation: 1,
    },
    stepIconBox: {
        width: 54,
        height: 54,
        borderRadius: 14,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    stepTextBox: {
        flex: 1,
        paddingTop: 4,
    },
    stepTitle: {
        fontSize: 16,
        fontFamily: Fonts.ManropeBold,
        color: '#11323B',
        marginBottom: 6,
    },
    stepDesc: {
        fontSize: 14,
        fontFamily: Fonts.mulishRegular,
        color: '#64748B',
        lineHeight: 20,
    },
    faqCard: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 5,
        elevation: 1,
    },
    faqTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    faqQuestion: {
        flex: 1,
        fontSize: 15,
        fontFamily: Fonts.ManropeBold,
        color: '#11323B',
    },
    faqAnswer: {
        fontSize: 14,
        fontFamily: Fonts.mulishRegular,
        color: '#64748B',
        lineHeight: 20,
        paddingLeft: 28,
    },
    bestPracticesCard: {
        backgroundColor: '#E8DDD3',
        borderRadius: 20,
        padding: 20,
        marginTop: 28,
    },
    bestPracticesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    bestPracticesTitle: {
        fontSize: 18,
        fontFamily: Fonts.ManropeBold,
        color: '#11323B',
    },
    bpItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    bpBullet: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#11323B',
        marginTop: 6,
        marginRight: 12,
    },
    bpTitle: {
        fontSize: 15,
        fontFamily: Fonts.ManropeBold,
        color: '#11323B',
        marginBottom: 4,
    },
    bpDesc: {
        fontSize: 14,
        fontFamily: Fonts.mulishRegular,
        color: '#64748B',
        lineHeight: 20,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(17,50,59,0.15)',
        marginVertical: 16,
    },
    quoteText: {
        fontSize: 13,
        fontFamily: Fonts.mulishRegular,
        fontStyle: 'italic',
        color: '#64748B',
        lineHeight: 20,
        marginBottom: 20,
    },
    startButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    startButtonText: {
        fontSize: 16,
        fontFamily: Fonts.ManropeBold,
        color: ColorConstants.WHITE,
        marginRight: 6,
    },
});
