import { Icons } from '@/assets';
import { ColorConstants } from '@/constants/ColorConstants';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export type UpcomingJobsItem = {
    title: string;
    task: string;
    schedule: string;
    time: string;
    address: string;
};

type UpcomingJobsProps = {
    item: UpcomingJobsItem;
    isLast?: boolean;
};

const UpcomingJobs: React.FC<UpcomingJobsProps> = ({
    item,
    isLast
}) => {

    return (
        <View style={[styles.reminderCard, { marginBottom: isLast ? 0 : 10 }]}>
            <View style={styles.reminderHeader}>
                <Text style={styles.reminderTitle}>{item.title}</Text>
                <Text style={styles.reminderCategory}>{item.schedule}</Text>
            </View>
            <Text style={styles.reminderProvider}>{item.task}</Text>
            <View style={styles.reminderFooter}>
                <View style={styles.reminderTime}>
                    <Image source={Icons.ic_clock} />
                    <Text style={styles.timeText}>{item.time}</Text>
                </View>
                <View style={styles.reminderTime}>
                    <Image source={Icons.ic_location} />
                    <Text style={styles.timeText}>{item.address}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    reminderCard: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: ColorConstants.GRAY3,
        paddingHorizontal: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        marginBottom: 10
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
        fontFamily: 'Inter-SemiBold',
        fontSize: 10,
        color: ColorConstants.DARK_CYAN,
        marginRight: 8,
    },


    reminderProvider: {
        fontFamily: 'Inter-Regular',
        fontSize: 10,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 8,
    },
    reminderFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    reminderTime: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeText: {
        fontFamily: 'Inter-Regular',
        fontSize: 9,
        color: ColorConstants.GRAY,
        marginLeft: 3,
    },
    reminderCategory: {
        fontFamily: 'Inter-Regular',
        fontSize: 8,
        color: ColorConstants.GRAY,
        backgroundColor: ColorConstants.GRAY_SHADE,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
});


export default UpcomingJobs;
