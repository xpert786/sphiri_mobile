import { Icons } from '@/assets';
import { ColorConstants } from '@/constants/ColorConstants';
import { StringConstants } from '@/constants/StringConstants';
import React from 'react';
import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export type TaskContactItem = {
    name: string;
    company: string;
    replacement?: string;
    priority: 'High' | 'Medium' | 'Low';
    tags: string[];
    contact: string;
    document: string;
    certificate?: string;
};

type Props = {
    item: TaskContactItem;
    onMarkComplete?: () => void;
    onReschedule?: () => void;
    onSnooze?: () => void;
    tapOnCard?: () => void;
};

const ContactCard: React.FC<Props> = ({
    item,
    onMarkComplete,
    onReschedule,
    onSnooze,
    tapOnCard
}) => {
    const isHigh = item.priority === 'High';

    return (
        <Pressable style={styles.contactCard} onPress={tapOnCard}>
            {/* Header */}
            <View style={styles.contactHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <View style={styles.docContainer}>
                        <Image
                            source={Icons.ic_doc}
                            style={{ tintColor: ColorConstants.PRIMARY_BROWN }}
                        />
                    </View>

                    <View>
                        <Text style={styles.contactName}>{item.name}</Text>
                        <Text style={styles.contactCompany}>{item.company}</Text>

                        {item.replacement ? (
                            <Text style={[styles.contactCompany, { marginBottom: 2 }]}>
                                {item.replacement}
                            </Text>
                        ) : null}

                        <View style={styles.row}>
                            <Image source={Icons.ic_calender} style={styles.detailIcon} />
                            <Text style={styles.contactPhone}>2025-12-08</Text>

                            <Image source={Icons.ic_calender} style={styles.detailIcon} />
                            <Text style={styles.contactPhone}>Every 6 months</Text>
                        </View>

                        <View style={styles.tagsContainer}>
                            {item.tags.map((tag, index) => (
                                <View key={index} style={styles.tag}>
                                    <Text style={styles.tagText}>{tag}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                <View
                    style={[
                        styles.priorityBadge,
                        isHigh ? styles.priorityHigh : styles.priorityMedium,
                    ]}
                >
                    <Text
                        style={[
                            styles.priorityText,
                            { color: isHigh ? ColorConstants.RED : ColorConstants.ORANGE },
                        ]}
                    >
                        {item.priority}
                    </Text>
                </View>
            </View>

            <View style={styles.divider} />

            {/* Footer */}
            <View style={styles.contactFooter}>
                <Text style={styles.contactName}>
                    Contact: <Text style={styles.regularText}>{item.contact}</Text>
                </Text>

                <Text style={styles.contactName}>
                    Document: <Text style={styles.regularText}>{item.document}</Text>
                </Text>

                {item.certificate ? (
                    <Text style={styles.contactCompany}>{item.certificate}</Text>
                ) : null}
            </View>

            {/* Actions */}
            <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.nextButton} onPress={onMarkComplete}>
                    <Text style={styles.nextButtonText}>
                        {StringConstants.MARK_COMPLETE}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelButton} onPress={onReschedule}>
                    <Text style={styles.cancelButtonText}>
                        {StringConstants.RESCHEDULE}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelButton} onPress={onSnooze}>
                    <Text style={styles.cancelButtonText}>
                        {StringConstants.SNOOZE}
                    </Text>
                </TouchableOpacity>
            </View>
        </Pressable>
    );
};


const styles = StyleSheet.create({
    contactCard: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
    },
    contactHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    docContainer: {
        width: 28,
        height: 28,
        borderRadius: 17,
        backgroundColor: ColorConstants.LIGHT_PEACH2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    priorityBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    priorityHigh: {
        backgroundColor: ColorConstants.RED10,
    },
    priorityMedium: {
        backgroundColor: ColorConstants.ORANGE10,
    },

    priorityText: {
        fontFamily: 'Inter-Medium',
        fontSize: 9, // Small
        color: ColorConstants.DARK_CYAN,
    },

    avatarText: {
        fontFamily: 'Inter-Medium',
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
    },

    contactName: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 11,
        color: ColorConstants.DARK_CYAN,
    },
    contactCompany: {
        fontFamily: 'Inter-Regular',
        fontSize: 11,
        color: ColorConstants.DARK_CYAN,
    },
    regularText: {
        fontFamily: 'Inter-Regular',
        fontSize: 10,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },

    detailIcon: {
        width: 10,
        height: 10,
        marginRight: 6,
        resizeMode: 'contain',
        alignSelf: 'center'
    },

    contactPhone: {
        fontFamily: 'Inter-Regular',
        fontSize: 10,
        color: ColorConstants.GRAY,
        marginRight: 10
    },
    contactEmail: {
        fontFamily: 'Inter-Regular',
        fontSize: 10,
        color: ColorConstants.GRAY,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
        gap: 8,
    },
    tag: {
        backgroundColor: ColorConstants.GRAY_SHADE,
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },

    tagText: {
        fontFamily: 'Inter-Regular',
        fontSize: 8,
        color: ColorConstants.GRAY,
    },
    actionButtons: {
        flexDirection: 'row',
        marginLeft: 40,
        marginTop: 15
    },
    cancelButton: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 8,
        alignItems: 'center',
        borderColor: ColorConstants.GRAY3,
        borderWidth: 1,
        marginRight: 12,
    },
    cancelButtonText: {
        fontFamily: 'Inter-Medium',
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
    },
    nextButton: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 8,
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        alignItems: 'center',
        marginRight: 12,
    },
    nextButtonText: {
        fontFamily: 'Inter-Medium',
        fontSize: 12,
        color: ColorConstants.WHITE,
    },
    contactFooter: {
        marginLeft: 40
    },

    divider: {
        backgroundColor: ColorConstants.GRAY3,
        height: 1,
        marginLeft: 40,
        marginBottom: 10
    },
})
export default ContactCard;
