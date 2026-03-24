import { ColorConstants } from '@/constants/ColorConstants';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
    interpolate,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';

interface CustomSwitchProps {
    value: boolean;
    onValueChange: (value: boolean) => void;
    activeColor?: string;
    inActiveColor?: string;
    thumbColor?: string;
}

const CustomSwitch: React.FC<CustomSwitchProps> = ({
    value,
    onValueChange,
    activeColor = ColorConstants.PRIMARY_BROWN,
    inActiveColor = '#E9E9EA',
    thumbColor = '#FFFFFF',
}) => {
    const switchValue = useSharedValue(value ? 1 : 0);

    useEffect(() => {
        switchValue.value = withSpring(value ? 1 : 0, {
            mass: 1,
            damping: 15,
            stiffness: 120,
            overshootClamping: false,
        });
    }, [value, switchValue]);

    const animatedContainerStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            switchValue.value,
            [0, 1],
            [inActiveColor, activeColor]
        );

        return {
            backgroundColor,
        };
    });

    const animatedThumbStyle = useAnimatedStyle(() => {
        const translateX = interpolate(
            switchValue.value,
            [0, 1],
            [2, 22] // Adjust based on width (51) - thumb width (27) - padding (2) = 22
        );

        return {
            transform: [{ translateX }],
        };
    });

    return (
        <Pressable onPress={() => onValueChange(!value)}>
            <Animated.View style={[styles.container, animatedContainerStyle]}>
                <Animated.View style={[styles.thumb, { backgroundColor: thumbColor }, animatedThumbStyle]} />
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 39,
        height: 22,
        borderRadius: 15.5,
        justifyContent: 'center',
    },
    thumb: {
        width: 17,
        height: 17,
        borderRadius: 13.5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2.5,
        elevation: 1.5,
    },
});

export default CustomSwitch;
