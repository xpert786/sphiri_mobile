import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useProfile } from '@/context/ProfileContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StringConstants } from '@/constants/StringConstants';
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

const TRUSTEE_HOW_IT_WORKS = [
    {
        icon: 'rocket-launch-outline',
        title: 'Explore Shared Files',
        description: "Check the 'Documents' tab to see what the homeowner has shared with you.",
    },
    {
        icon: 'information-outline',
        title: 'Stay Alert',
        description: "Monitor the 'Tasks' section for any reminders or actions assigned to you.",
    },
    {
        icon: 'lightbulb-outline',
        title: 'Emergency Ready',
        description: "Access the 'Emergency' section for critical contact numbers and protocols.",
    },
];

const TRUSTEE_FAQS = [
    {
        q: 'Can I upload documents?',
        a: "Family members can view and download shared documents. Upload permissions stay with the homeowner.",
    },
    {
        q: 'How do I see recent updates?',
        a: "Your dashboard shows a live feed of recent documents and reminders shared with you.",
    },
];

const TRUSTEE_BEST_PRACTICES = [
    {
        title: 'Check Task Status',
        description: 'Mark reminders as complete once done to keep the homeowner informed.',
    },
    {
        title: 'Profile Accuracy',
        description: 'Ensure your contact info is correct so you can be reached during emergencies.',
    },
];

const VENDOR_HOW_IT_WORKS = [
    {
        icon: 'rocket-launch-outline',
        title: 'Manage Clients',
        description: 'View detailed profiles of the homeowners you serve and their property needs.',
    },
    {
        icon: 'information-outline',
        title: 'Upload Service Records',
        description: "Send invoices, reports, and photos directly to your client's digital archive.",
    },
    {
        icon: 'chart-line',
        title: 'Track Analytics',
        description: 'Monitor your business growth and client engagement through your dashboard.',
    },
];

const VENDOR_FAQS = [
    {
        q: 'How do I gain more visibility?',
        a: 'Provide high-quality service and ensure your profile is fully completed to appear in homeowner searches.',
    },
    {
        q: 'Can I manage multiple properties for one client?',
        a: 'Yes, clients can link you to one or all of their properties stored in Sphiri.',
    },
];

const VENDOR_BEST_PRACTICES = [
    {
        title: 'Prompt Communication',
        description: 'Respond to client messages quickly to build trust and professional rapport.',
    },
    {
        title: 'Digital Transparency',
        description: 'Always upload a service report after a visit so clients have a permanent record.',
    },
    {
        title: 'Accurate Invoicing',
        description: 'Link invoices to specific documents for easier tracking by homeowners.',
    },
];

const getContent = (role: string | null) => {
    switch (role) {
        case 'family_member':
            return {
                how_it_works: TRUSTEE_HOW_IT_WORKS,
                faqs: TRUSTEE_FAQS,
                best_practices: TRUSTEE_BEST_PRACTICES,
                hero_title: "Collaborative Home Management.",
                hero_desc: "Access shared household information, stay on top of tasks, and know exactly what to do in emergencies.",
            };
        case 'vendor':
            return {
                how_it_works: VENDOR_HOW_IT_WORKS,
                faqs: VENDOR_FAQS,
                best_practices: VENDOR_BEST_PRACTICES,
                hero_title: "Grow and Manage Your Business.",
                hero_desc: "Connect with homeowners, manage your service history, and provide a premium digital experience to your clients.",
            };
        case 'home_owner':
        default:
            return {
                how_it_works: HOW_IT_WORKS,
                faqs: FAQS,
                best_practices: BEST_PRACTICES,
                hero_title: "Welcome to Sphiri! Your Home's Digital Hub.",
                hero_desc: "Manage your documents, track property maintenance, and collaborate with family and vendors all in one secure place.",
            };
    }
};

export default function GettingStartedScreen() {
    const { role } = useProfile();
    const [userRole, setUserRole] = useState<string | null>(role);

    useEffect(() => {
        if (!role) {
            loadRole();
        }
    }, [role]);

    const loadRole = async () => {
        const storedRole = await AsyncStorage.getItem(StringConstants.USER_ROLE);
        setUserRole(storedRole);
    };

    const content = getContent(userRole);
    const isTrustee = userRole === 'family_member';
    const isVendor = userRole === 'vendor';

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={ColorConstants.WHITE} />

            {/* Back Header */}
            <TouchableOpacity style={styles.backHeader} onPress={() => router.replace('/(root)/(drawer)/Home')} activeOpacity={0.7}>
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
                <View style={[
                    styles.heroCard,
                    isTrustee && styles.trusteeHeroCard,
                    isVendor && styles.vendorHeroCard
                ]}>
                    <Text style={styles.heroTitle}>{content.hero_title}</Text>
                    <Text style={[styles.heroSubtitle, isTrustee && { opacity: 0.7 }]}>
                        {content.hero_desc}
                    </Text>
                </View>

                {/* How It Works */}
                <View style={styles.sectionLabelRow}>
                    <View style={styles.sectionAccent} />
                    <Text style={styles.sectionTitle}>How It Works</Text>
                </View>

                {content.how_it_works.map((item, idx) => (
                    <View key={idx} style={styles.stepCard}>
                        <View style={styles.stepIconBox}>
                            {/* @ts-ignore */}
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

                {content.faqs.map((faq, idx) => (
                    <View key={idx} style={styles.faqCard}>
                        <View style={styles.faqTitleRow}>
                            <MaterialCommunityIcons name="help-circle-outline" size={20} color="#11323B" style={{ marginRight: 8 }} />
                            <Text style={styles.faqQuestion}>{faq.q}</Text>
                        </View>
                        <Text style={styles.faqAnswer}>{faq.a}</Text>
                    </View>
                ))}

                {/* Best Practices */}
                <View style={[styles.bestPracticesCard, isTrustee && styles.trusteeBestPracticesCard]}>
                    <View style={styles.bestPracticesHeader}>
                        <MaterialCommunityIcons name="lightbulb-outline" size={22} color="#11323B" style={{ marginRight: 8 }} />
                        <Text style={styles.bestPracticesTitle}>Best Practices</Text>
                    </View>

                    {content.best_practices.map((bp, idx) => (
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

                    <TouchableOpacity
                        style={[
                            styles.startButton,
                            isTrustee && styles.trusteeStartButton,
                            isVendor && styles.vendorStartButton
                        ]}
                        onPress={() => router.replace('/(root)/(drawer)/Home')}
                        activeOpacity={0.85}
                    >
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
    trusteeHeroCard: {
        backgroundColor: '#4B5563', // Matches the dark gray/blue aesthetic
        paddingVertical: 32,
    },
    trusteeBestPracticesCard: {
        backgroundColor: '#F8FAFC', // Slightly different for Trustee contrast
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    trusteeStartButton: {
        backgroundColor: '#4B5563',
    },
    vendorHeroCard: {
        backgroundColor: '#9F7161', // Matches the rust/brown logic from screenshot visually or PRIMARY_BROWN
    },
    vendorStartButton: {
        backgroundColor: '#9F7161',
    },
});
