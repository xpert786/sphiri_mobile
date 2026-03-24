import { apiGet } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import Header from '@/components/Header';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { StringConstants } from '@/constants/StringConstants';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    BackHandler,
    Image,
    Linking,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Tag {
    id: number;
    name: string;
}

interface CustomField {
    id?: number;
    label?: string;
    value?: string;
    field_name?: string;
    field_value?: string;
}

interface ContactDetails {
    id: number;
    name: string;
    company: string;
    category: string;
    category_display: string;
    is_shared: boolean;
    rating: string;
    phone: string;
    email: string;
    emergency_number: string;
    address_line1: string;
    address_line2: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    website: string;
    job_title: string;
    tags: Tag[];
    custom_fields: CustomField[];
    profile_picture: string;
    logo_url: string;
    notes: string;
    created_at: string | null;
    updated_at: string | null;
}

export default function ViewContacts() {
    const { id } = useLocalSearchParams();
    const [contactDetails, setContactDetails] = useState<ContactDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchContactDetails(id as string);
        }
    }, [id]);

    const fetchContactDetails = async (contactId: string) => {
        try {
            setLoading(true);
            const response = await apiGet(`${ApiConstants.SHARE_CONTACTS}/${contactId}/`);
            if (response.status === 200) {
                setContactDetails(response.data);
            }
        } catch (error) {
            console.error('Error fetching contact details:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                router.navigate('/(root)/(drawer)/Home');
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () =>
                subscription.remove();
        }, [])
    );

    const getProfileImage = () => {
        if (contactDetails?.profile_picture) {
            return { uri: contactDetails.profile_picture.startsWith('http') ? contactDetails.profile_picture : `${ApiConstants.MEDIA_URL}${contactDetails.profile_picture}` };
        } else if (contactDetails?.logo_url) {
            return { uri: contactDetails.logo_url.startsWith('http') ? contactDetails.logo_url : `${ApiConstants.MEDIA_URL}${contactDetails.logo_url}` };
        }
        return Icons.dummy_image2;
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color={ColorConstants.PRIMARY_BROWN} />
            </SafeAreaView>
        );
    }


    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={ColorConstants.WHITE} barStyle="dark-content" />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <Header
                    title={StringConstants.FAMILY_DASHBOARD}
                    subtitle={StringConstants.TRUSTEE_TITLE}
                    tapOnBack={() => router.navigate('/(root)/(drawer)/Home')}
                />

                {contactDetails && (
                    <View style={styles.mainCard}>
                        {/* Header Section */}
                        <View style={styles.titleRow}>
                            <View style={{ flexDirection: 'row', flex: 1 }}>
                                <Image source={getProfileImage()} style={styles.profileImage} />
                                <View style={{ marginLeft: 10, flex: 1 }}>
                                    <Text style={styles.contactName}>{contactDetails.name}</Text>
                                    <Text style={styles.companyName}>{contactDetails.company || contactDetails.job_title}</Text>
                                </View>
                            </View>
                            {contactDetails.rating && (
                                <View style={styles.ratingContainer}>
                                    <Image source={Icons.ic_star} style={styles.starIcon} />
                                    <Text style={styles.ratingText}>{contactDetails.rating}</Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.badgeRow}>
                            <View style={styles.tagGrid}>
                                <View style={styles.serviceBadge}>
                                    <Text style={styles.serviceText}>{contactDetails.category_display}</Text>
                                </View>
                                {contactDetails.is_shared && (
                                    <View style={styles.sharedBadge}>
                                        <Text style={styles.sharedText}>Shared</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Contact Info List */}
                        <View style={styles.infoList}>
                            {contactDetails.phone ? (
                                <View style={styles.infoItem}>
                                    <Image source={Icons.ic_phonecall} style={styles.infoIcon} />
                                    <Text style={styles.infoText}>{contactDetails.phone}</Text>
                                </View>
                            ) : null}
                            {contactDetails.email ? (
                                <View style={styles.infoItem}>
                                    <Image source={Icons.ic_gmail} style={styles.infoIcon} />
                                    <Text style={styles.infoText}>{contactDetails.email}</Text>
                                </View>
                            ) : null}
                            {contactDetails.address_line1 ? (
                                <View style={styles.infoItem}>
                                    <Image source={Icons.ic_location2} style={styles.infoIcon} />
                                    <Text style={styles.infoText}>
                                        {[contactDetails.address_line1, contactDetails.address_line2, contactDetails.city, contactDetails.state, contactDetails.zip_code].filter(Boolean).join(', ')}
                                    </Text>
                                </View>
                            ) : null}
                            {contactDetails.website ? (
                                <TouchableOpacity style={styles.infoItem} onPress={() => Linking.openURL(contactDetails.website)}>
                                    <Image source={Icons.ic_website} style={styles.infoIcon} />
                                    <Text style={styles.infoText} numberOfLines={1}>Website</Text>
                                    <Image source={Icons.ic_open_link} style={styles.openLinkIcon} />
                                </TouchableOpacity>
                            ) : null}
                            {contactDetails.emergency_number ? (
                                <View style={styles.infoItem}>
                                    <Image source={Icons.ic_shield2} style={styles.infoIcon} />
                                    <Text style={styles.infoText}>{contactDetails.emergency_number}</Text>
                                </View>
                            ) : null}
                        </View>

                        <View style={styles.divider} />

                        {/* Tags Section */}
                        {contactDetails.tags && contactDetails.tags.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Tags</Text>
                                <View style={styles.tagsContainer}>
                                    {contactDetails.tags.map(tag => (
                                        <View key={tag.id} style={styles.tagBadge}>
                                            <Text style={styles.tagBadgeText}>{tag.name}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {contactDetails.custom_fields && contactDetails.custom_fields.length > 0 && (
                            <View style={styles.divider} />
                        )}


                        {/* Custom Fields Section */}
                        {contactDetails.custom_fields && contactDetails.custom_fields.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Custom Fields</Text>
                                {contactDetails.custom_fields.map((field, index) => (
                                    <View key={index} style={styles.customFieldRow}>
                                        <Text style={styles.fieldLabel}>{field.field_name || field.label}:</Text>
                                        <Text style={styles.fieldValue}>{field.field_value || field.value}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
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
    scrollContent: {
        paddingBottom: 40,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainCard: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 16,
        marginTop: 10,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
    },

    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 30,
        resizeMode: 'cover',
    },

    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    contactName: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.BLACK2,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    starIcon: {
        width: 14,
        height: 14,
        marginRight: 4,
        resizeMode: 'contain',
    },
    ratingText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
    },
    badgeRow: {
        marginTop: 4,
        alignSelf: 'flex-end'
    },
    companyName: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 8,
    },
    tagGrid: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    serviceBadge: {
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    serviceText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 12,
        color: ColorConstants.BLACK2,
    },
    sharedBadge: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    sharedText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 12,
        color: ColorConstants.WHITE,
    },
    infoList: {
        marginTop: 10,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    infoIcon: {
        width: 18,
        height: 18,
        resizeMode: 'contain',
        tintColor: ColorConstants.DARK_CYAN,
    },
    infoText: {
        marginLeft: 8,
        fontFamily: Fonts.mulishRegular,
        fontSize: 16,
        color: ColorConstants.DARK_CYAN,
    },
    openLinkIcon: {
        width: 16,
        height: 16,
        resizeMode: 'contain',
        tintColor: ColorConstants.DARK_CYAN,
        marginLeft: 12,
    },
    divider: {
        height: 1,
        backgroundColor: ColorConstants.GRAY3,
        marginVertical: 10,
    },
    section: {
        marginTop: 5,
    },
    sectionTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 18,
        color: ColorConstants.BLACK2,
        marginBottom: 16,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tagBadge: {
        backgroundColor: ColorConstants.GRAY3,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
        marginRight: 7,
        marginBottom: 9
    },
    tagBadgeText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 12,
        color: ColorConstants.BLACK2,
    },
    customFieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    fieldLabel: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.DARK_CYAN,
        marginRight: 6,
    },
    fieldValue: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.BLACK2,
    },
});
