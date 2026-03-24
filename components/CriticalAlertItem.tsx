import { ColorConstants } from '@/constants/ColorConstants';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type CriticalAlertItemType = {
    title: string;
};

type CriticalAlertItemProps = {
    item: CriticalAlertItemType;
    isLast?: boolean;
    onPressAction?: () => void;
};

const CriticalAlertItem: React.FC<CriticalAlertItemProps> = ({
    item,
    isLast,
    onPressAction,
}) => {
    return (
        <View
            style={[
                styles.alertCard,
                !isLast && styles.alertDivider,
                { marginBottom: !isLast ? 7 : 0 },
            ]}
        >
            <Text style={styles.alertText}>{item.title}</Text>

            <TouchableOpacity
                style={styles.takeActionButton}
                onPress={onPressAction}
            >
                <Text style={styles.takeActionText}>Take Action</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    alertCard: {
        padding: 4,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    alertText: {
        fontFamily: 'Inter-Regular',
        fontSize: 11,
        color: ColorConstants.GRAY,
        flex: 1,
        marginRight: 10,
    },
    takeActionButton: {
        backgroundColor: 'transparent',
        paddingHorizontal: 0,
        paddingVertical: 0,
    },
    takeActionText: {
        fontFamily: 'Inter-Medium',
        fontSize: 9,
        color: ColorConstants.DARK_CYAN,
    },
    alertDivider: {
        borderBottomWidth: 1,
        borderBottomColor: ColorConstants.GRAY3,
        paddingBottom: 6,
    },
});


export default CriticalAlertItem;
