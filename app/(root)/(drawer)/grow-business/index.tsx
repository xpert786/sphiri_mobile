import { apiGet } from '@/api/apiMethods';
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
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SectionItem {
    field: string;
    completed: boolean;
    value: string;
    url?: string;
}

interface Section {
    title: string;
    completion: number;
    items: SectionItem[];
    weight: number;
}

interface GrowBusinessData {
    vendor_info: {
        business_name: string;
        business_type: string;
        onboarding_status: string;
        member_since: string;
        profile_completion: number;
    };
    profile_completion: {
        overall_completion: number;
        sections: {
            basic_information: Section;
            profile_details: Section;
            branding: Section;
        };
    };
    insights: {
        type: string;
        title: string;
        description: string;
        icon: string;
        action: string;
    }[];
}

const GrowBusiness = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<GrowBusinessData | null>(null);


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

    useEffect(() => {
        fetchGrowBusiness();
    }, []);

    const fetchGrowBusiness = async () => {
        try {
            setLoading(true);
            const response = await apiGet(ApiConstants.GROW_BUSINESS);
            if (response.data) {
                setData(response.data);
            }
        } catch (error) {
            console.error('Error fetching grow business data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Header title="Grow Your Business" showBackArrow={false} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={ColorConstants.PRIMARY_BROWN} />
                </View>
            </SafeAreaView>
        );
    }

    const sections = data?.profile_completion.sections;
    const overallCompletion = data?.profile_completion.overall_completion || 0;

    return (
        <SafeAreaView style={styles.container}>
            <Header title="Grow Your Business"
                subtitle='Complete your profile to show visibility and attract more clients'
                showBackArrow={false}
                containerStyle={{ paddingTop: 20 }}
            />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>

                    {/* Profile Completion Section */}
                    <View style={styles.sectionContainer}>
                        <View style={styles.completionHeader}>
                            <Text style={styles.sectionLabel}>Profile Completion</Text>
                            <Text style={styles.completionPercentage}>{overallCompletion}%</Text>
                        </View>
                        <View style={styles.progressBarBackground}>
                            <View style={[styles.progressBarFill, { width: `${overallCompletion}%` }]} />
                        </View>

                        {/* Success Box */}
                        {data?.insights.map((insight, index) => (
                            <View key={index} style={styles.successBox}>
                                <Image source={Icons.ic_check_circle3} style={styles.successIcon} />
                                <View style={styles.successTextContainer}>
                                    <Text style={styles.successTitle}>{insight.title}</Text>
                                    <Text style={styles.successSubtitle}>{insight.description}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Sections */}
                    {sections && (
                        <>
                            <SectionCard
                                title={sections.basic_information.title}
                                subtitle={sections.basic_information.items.map(i => i.field).join(', ')}
                                isCompleted={sections.basic_information.completion === 100}
                            />
                            <SectionCard
                                title={sections.profile_details.title}
                                subtitle={sections.profile_details.items.map(i => i.field).join(', ')}
                                isCompleted={sections.profile_details.completion === 100}
                            />
                            <SectionCard
                                title={sections.branding.title}
                                subtitle={sections.branding.items.map(i => i.field).join(', ')}
                                isCompleted={sections.branding.completion === 100}
                            />
                        </>
                    )}
                </View>

                {/* Footer Buttons */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.viewProfileButton}
                        onPress={() => router.push({
                            pathname: '/(root)/(drawer)/vendor-settings',
                            params: { from: 'grow-business' }
                        })}
                    >
                        <Text style={styles.viewProfileText}>View Profile</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

type SectionCardProps = {
    title: string;
    subtitle: string;
    isCompleted?: boolean;
};

const SectionCard: React.FC<SectionCardProps> = ({ title, subtitle, isCompleted }) => {
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{title}</Text>
                {isCompleted && (
                    <View style={styles.completedBadge}>
                        <Text style={styles.completedBadgeText}>Completed</Text>
                    </View>
                )}
            </View>
            <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorConstants.WHITE,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        flexGrow: 1,
        paddingVertical: 20,
    },
    content: {
        paddingHorizontal: 20,
    },
    sectionContainer: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        marginBottom: 16,
    },
    completionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionLabel: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
    },
    completionPercentage: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 14,
        color: ColorConstants.PRIMARY_BROWN,
    },
    progressBarBackground: {
        height: 6,
        backgroundColor: ColorConstants.GRAY3,
        borderRadius: 3,
        marginBottom: 20,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        borderRadius: 3,
    },
    successBox: {
        flexDirection: 'row',
        backgroundColor: '#F0FDF4', // Very light green
        borderColor: '#BBF7D0', // Light green
        borderWidth: 1,
        borderRadius: 10,
        padding: 12,
        alignItems: 'center',
        marginBottom: 8,
    },
    successIcon: {
        width: 24,
        height: 24,
        marginRight: 12,
        tintColor: ColorConstants.GREEN,
    },
    successTextContainer: {
        flex: 1,
    },
    successTitle: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 14,
        color: '#166534', // Dark green
        marginBottom: 2,
    },
    successSubtitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 12,
        color: '#15803D', // Medium green
    },
    card: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    cardTitle: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 16,
        color: ColorConstants.BLACK,
        marginRight: 8,
    },
    cardSubtitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 12,
        color: ColorConstants.GRAY,
    },
    completedBadge: {
        backgroundColor: ColorConstants.GREEN10, // Light green badge
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    completedBadgeText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 10,
        color: ColorConstants.GREEN2, // Green text
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        backgroundColor: ColorConstants.WHITE,
        gap: 12,
        justifyContent: 'flex-end',
    },
    viewProfileButton: {
        height: 45,
        paddingHorizontal: 25,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewProfileText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
    },
    editProfileButton: {
        height: 45,
        paddingHorizontal: 25,
        borderRadius: 8,
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editProfileText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 14,
        color: ColorConstants.WHITE,
    },
});

export default GrowBusiness;
