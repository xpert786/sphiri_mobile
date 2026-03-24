import { Icons } from '@/assets';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { handleDownload } from '@/constants/Helper';
import React from 'react';
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

export type DocumentItem = {
    id: number;
    title: string;
    file_url: string;
    badgeText?: string;
    folderName?: string;        // category_name
    providerName?: string;
    fileType?: string;          // file_type e.g. "PDF"
    fileSize?: string;          // file_size_display e.g. "245.9 KB"
    uploadedBy?: string;        // uploaded_by e.g. "Home Owner"
    issuedDate?: string;
    expirationDate?: string;
    status?: string;            // e.g. "active"
    isShared?: boolean;
    linkedContacts?: string[];
    linkedFamilyMembers?: string[];
    linkedVendors?: string[];
    versionCount?: number;
    isLocked?: boolean;
    showInfo?: boolean;
    isExpiringSoon?: boolean;
};

type Props = {
    item: DocumentItem;
};

const DocumentCard: React.FC<Props> = ({ item }) => {
    // Combine all linked contacts for display
    const allLinkedContacts = [
        ...(item.linkedFamilyMembers || []),
        ...(item.linkedContacts || []),
        ...(item.linkedVendors || []),
    ];

    console.log("item in document card:", JSON.stringify(item));


    // Extract fileType from file_url if item.fileType is not present
    const fileExtension = item.file_url ? item.file_url.split('.').pop()?.toUpperCase() : '';
    const displayFileType = item.fileType || fileExtension;

    // Calculate days until expiry (null if no date or already expired)
    const daysUntilExpiry = React.useMemo(() => {
        if (!item.expirationDate) return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiry = new Date(item.expirationDate);
        expiry.setHours(0, 0, 0, 0);
        const diff = Math.round((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diff; // negative = expired, 0 = today, 1/2/3 = soon
    }, [item.expirationDate]);

    const showExpiringSoonBanner = daysUntilExpiry !== null && daysUntilExpiry >= 1 && daysUntilExpiry <= 3;
    const showExpiresTodayBanner = daysUntilExpiry === 0;

    return (
        <View style={styles.documentCard}>
            {/* Header: Category + Icons */}
            <View style={styles.headerRow}>
                <Text style={styles.categoryTitle} numberOfLines={1}>
                    {item.folderName || item.badgeText || 'Document'}
                </Text>
                <View style={styles.iconsContainer}>
                    {item.file_url ? (
                        <TouchableOpacity onPress={() => Linking.openURL(item.file_url)} style={styles.iconMargin}>
                            <Feather name="eye" size={18} color="#6B7280" />
                        </TouchableOpacity>
                    ) : null}
                    <TouchableOpacity onPress={() => handleDownload(item.file_url)}>
                        <Feather name="download" size={18} color="#6B7280" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Document Title */}
            <Text style={styles.documentTitle} numberOfLines={1}>
                {item.title}
            </Text>

            {/* Contact line */}
            {allLinkedContacts.length > 0 && (
                <View style={styles.contactRow}>
                    <Text style={styles.contactLabel}>Contact: </Text>
                    <Text style={styles.contactValue} numberOfLines={1}>
                        {allLinkedContacts.join(', ')}
                    </Text>
                </View>
            )}

            {/* Bullet-point details */}
            <View style={styles.detailsContainer}>
                {displayFileType ? (
                    <View style={styles.detailRow}>
                        <View style={styles.bullet} />
                        <Text style={styles.detailLabel}>Type: </Text>
                        <Text style={styles.detailValue}>{displayFileType}</Text>
                    </View>
                ) : null}
                {item.fileSize && (
                    <View style={styles.detailRow}>
                        <View style={styles.bullet} />
                        <Text style={styles.detailLabel}>Size: </Text>
                        <Text style={styles.detailValue}>{item.fileSize}</Text>
                    </View>
                )}
                {item.uploadedBy && (
                    <View style={styles.detailRow}>
                        <View style={styles.bullet} />
                        <Text style={styles.detailLabel}>Issued by: </Text>
                        <Text style={styles.detailValue}>{item.uploadedBy}</Text>
                    </View>
                )}
                {item.issuedDate && (
                    <View style={styles.detailRow}>
                        <View style={styles.bullet} />
                        <Text style={styles.detailLabel}>Issued: </Text>
                        <Text style={styles.detailValue}>{item.issuedDate}</Text>
                    </View>
                )}
                {item.expirationDate && (
                    <View style={styles.detailRow}>
                        <View style={[styles.bullet, (showExpiringSoonBanner || showExpiresTodayBanner) && { backgroundColor: ColorConstants.RED }]} />
                        <Text style={styles.detailLabel}>Expires: </Text>
                        <Text style={[styles.detailValue, (showExpiringSoonBanner || showExpiresTodayBanner) && { color: ColorConstants.RED }]}>
                            {item.expirationDate}
                        </Text>
                    </View>
                )}
            </View>

            {/* Bottom row: Status badge + Version */}
            <View style={styles.bottomRow}>
                {item.status && (
                    <View style={[
                        styles.statusBadge,
                        item.status === 'active' ? styles.statusActive : styles.statusInactive
                    ]}>
                        <Text style={[
                            styles.statusText,
                            item.status === 'active' ? styles.statusTextActive : styles.statusTextInactive
                        ]}>
                            {item.status}
                        </Text>
                    </View>
                )}
                {item.versionCount && (
                    <View style={styles.versionRow}>
                        <Image source={Icons.ic_v_icon} style={styles.versionIcon} />
                        <Text style={styles.versionText}>{item.versionCount} version</Text>
                    </View>
                )}
            </View>

            {/* Expiring Today Banner */}
            {showExpiresTodayBanner && (
                <View style={styles.expiringBadge}>
                    <Image source={Icons.ic_warn} style={styles.expiringIcon} />
                    <Text style={styles.expiringText}>Expires Today!</Text>
                </View>
            )}

            {/* Expires in 1–3 days Banner */}
            {showExpiringSoonBanner && (
                <View style={styles.expiringBadge}>
                    <Image source={Icons.ic_warn} style={styles.expiringIcon} />
                    <Text style={styles.expiringText}>
                        Expires in {daysUntilExpiry} {daysUntilExpiry === 1 ? 'day' : 'days'}
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    documentCard: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    iconsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconMargin: {
        marginRight: 12,
    },
    categoryTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 15,
        color: ColorConstants.BLACK,
        flex: 1,
        marginRight: 10,
    },
    documentTitle: {
        fontFamily: 'Manrope-Regular',
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 10,
    },
    actionIcon: {
        width: 18,
        height: 18,
        resizeMode: 'contain',
        tintColor: '#6B7280',
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    contactLabel: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 12,
        color: ColorConstants.BLACK,
    },
    contactValue: {
        fontFamily: 'Manrope-Regular',
        fontSize: 12,
        color: '#6B7280',
        flex: 1,
    },
    detailsContainer: {
        gap: 6,
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bullet: {
        width: 5,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#9CA3AF',
        marginRight: 8,
    },
    detailLabel: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 12,
        color: ColorConstants.BLACK,
    },
    detailValue: {
        fontFamily: 'Manrope-Regular',
        fontSize: 12,
        color: '#6B7280',
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusActive: {
        backgroundColor: '#D1FAE5',
    },
    statusInactive: {
        backgroundColor: '#FEE2E2',
    },
    statusText: {
        fontFamily: 'Manrope-Medium',
        fontSize: 12,
    },
    statusTextActive: {
        color: '#065F46',
    },
    statusTextInactive: {
        color: '#991B1B',
    },
    versionRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    versionIcon: {
        width: 14,
        height: 14,
        resizeMode: 'contain',
        tintColor: '#6B7280',
        marginRight: 4,
    },
    versionText: {
        fontFamily: 'Manrope-Regular',
        fontSize: 12,
        color: '#6B7280',
    },
    expiringBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ColorConstants.RED,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 6,
        marginTop: 10,
    },
    expiringIcon: {
        width: 12,
        height: 12,
        tintColor: ColorConstants.WHITE,
        marginRight: 6,
    },
    expiringText: {
        fontFamily: 'Manrope-Medium',
        fontSize: 11,
        color: ColorConstants.WHITE,
    },
});

export default DocumentCard;
