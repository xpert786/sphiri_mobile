import { ColorConstants } from '@/constants/ColorConstants';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type SectionHeaderProps = {
    title: string;
    actionText?: string;
    onPressAction?: () => void;
};

const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    actionText,
    onPressAction,
}) => {
    return (
        <View>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{title}</Text>

                {actionText ? (
                    <TouchableOpacity onPress={onPressAction}>
                        <Text style={styles.viewAllText}>{actionText}</Text>
                    </TouchableOpacity>
                ) : null}
            </View>

            <View style={styles.divider} />
        </View>
    );
};

const styles = StyleSheet.create({

    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    viewAllText: {
        fontFamily: 'Inter-Medium',
        fontSize: 12,
        color: ColorConstants.PRIMARY_BROWN,
    },
    sectionTitle: {
        fontFamily: 'SFPro-Medium',
        fontSize: 16,
        color: ColorConstants.BLACK,
        marginBottom: 12,
    },
    divider: {
        height: 1,
        backgroundColor: ColorConstants.GRAY3,
        marginBottom: 8,
    },

})

export default SectionHeader;
