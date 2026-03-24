import { ColorConstants } from '@/constants/ColorConstants';
import React from 'react';
import {
    ActivityIndicator,
    Image,
    ImageSourcePropType,
    StyleProp,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

type CommonButtonProps = {
    title: string;
    onPress: () => void;

    disabled?: boolean;
    loading?: boolean;

    containerStyle?: StyleProp<ViewStyle>;
    icon?: ImageSourcePropType;
};

const CommonButton: React.FC<CommonButtonProps> = ({
    title,
    onPress,
    disabled = false,
    loading = false,
    containerStyle,
    icon,
}) => {
    return (
        <TouchableOpacity
            style={[
                styles.button,
                disabled && styles.disabledButton,
                containerStyle,
            ]}
            onPress={onPress}
            activeOpacity={0.8}
            disabled={disabled || loading}
        >
            {loading ? (
                <ActivityIndicator color={ColorConstants.WHITE} />
            ) : (
                <View style={styles.content}>
                    {icon && (
                        <Image source={icon} style={styles.icon} />
                    )}
                    <Text style={styles.buttonText}>{title}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        height: 36,
        marginTop: 20,
        marginBottom: 13
    },
    disabledButton: {
        opacity: 0.6,
    },
    buttonText: {
        fontFamily: 'Inter-Medium',
        fontSize: 14,
        color: ColorConstants.WHITE,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        width: 14,
        height: 14,
        resizeMode: 'contain',
        marginRight: 6,
        tintColor: ColorConstants.WHITE,
    },
});

export default CommonButton;
