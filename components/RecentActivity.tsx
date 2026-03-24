import { ColorConstants } from '@/constants/ColorConstants';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export type RecentActivity = {
    action_display: string;
    subtitle: string;
};

type Props = {
    item: RecentActivity;
    isLast?: boolean;
};

const RecentActivityItem: React.FC<Props> = ({ item, isLast = false }) => {
    // console.log("RecentActivityItem", item);

    return (
        <View
            style={[
                styles.activityCard,
                isLast && styles.noDivider,
            ]}
        >
            <View style={styles.activityContent}>
                <Text style={styles.activityAction}>{item.action_display}</Text>
                <Text style={styles.activityDetail}>{item.subtitle}</Text>
            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    activityCard: {
        backgroundColor: ColorConstants.WHITE,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: ColorConstants.GRAY3,

    },
    noDivider: {
        borderBottomWidth: 0,
        paddingBottom: 0
    },
    activityContent: {
        flex: 1,
    },
    activityAction: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 11,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 2,
    },
    activityDetail: {
        fontFamily: 'Inter-Regular',
        fontSize: 11,
        color: ColorConstants.DARK_CYAN,
    },

});


export default RecentActivityItem;
