import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { capitalizeFirstLetter } from '@/constants/Helper';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export type ReminderItem = {
    title: string;
    priority_name: 'High' | 'Medium' | 'Low Priority';
    time: string;
    category: string;
    due_display: string;
};

type ReminderCardProps = {
    item: ReminderItem;
    isLast?: boolean;
};

const ReminderCard: React.FC<ReminderCardProps> = ({
    item,
    isLast,
}) => {

    const getBackgroundColor = (item: any) => {
        if (item.priority_name == "High Priority") {
            return ColorConstants.RED10;
        } else if (item.priority_name == "Medium Priority") {
            return ColorConstants.ORANGE10;
        } else {
            return ColorConstants.GREEN10;
        }
    }

    const getTextColor = (item: any) => {
        if (item.priority_name == "High Priority") {
            return ColorConstants.RED;
        } else if (item.priority_name == "Medium Priority") {
            return ColorConstants.ORANGE;
        } else {
            return ColorConstants.GREEN;
        }
    }


    return (
        <View style={[styles.reminderCard, isLast && styles.noDivider]}>
            <View style={styles.reminderHeader}>
                <View style={{ flexDirection: 'column' }}>
                    <Text style={styles.reminderTitle}>{capitalizeFirstLetter(item.title)}</Text>
                    <Text style={styles.reminderDetail}>{item.due_display}</Text>
                </View>
                <View
                    style={[
                        styles.priorityBadge,
                        { backgroundColor: getBackgroundColor(item) }
                    ]}
                >
                    <Text
                        style={[
                            styles.priorityText,
                            { color: getTextColor(item) },
                        ]}
                    >
                        {item.priority_name}
                    </Text>
                </View>
            </View>

            <Text style={styles.reminderProvider}>{item.time}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    reminderCard: {
        paddingBottom: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: ColorConstants.GRAY3,
    },
    noDivider: {
        borderBottomWidth: 0,
        paddingBottom: 0,
    },
    reminderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    reminderTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 13,
        color: ColorConstants.BLACK2,
        flex: 1,
    },
    reminderDetail: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
        marginBottom: -13
    },
    priorityBadge: {
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 10,
    },
    priorityHigh: {
        backgroundColor: ColorConstants.RED10,
    },
    priorityMedium: {
        backgroundColor: ColorConstants.ORANGE10,
    },
    priorityText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 9,
    },
    reminderProvider: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 10,
        color: ColorConstants.DARK_CYAN,
    },
});


export default ReminderCard;
