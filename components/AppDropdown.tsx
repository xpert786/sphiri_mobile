import { Icons } from '@/assets';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import React, { useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import CustomTextInput from './CustomTextInput';

interface AppDropdownProps {
    label: string;
    data: string[];
    value: string;
    onSelect: (item: string) => void;
    placeholder?: string;
    zIndex?: number;
    dropdownWidth?: DimensionValue;
}

const AppDropdown: React.FC<AppDropdownProps> = ({
    label,
    data,
    value,
    onSelect,
    placeholder = 'Select option',
    zIndex = 1000,
    dropdownWidth,
}) => {
    const [visible, setVisible] = useState(false);

    const handleSelect = (item: string) => {
        onSelect(item);
        setVisible(false);
    };

    return (
        <View style={[styles.container, { zIndex: visible ? zIndex : 1 }]}>
            <TouchableOpacity onPress={() => setVisible(!visible)} activeOpacity={0.8}>
                <CustomTextInput
                    label={label}
                    value={value}
                    onChangeText={() => { }}
                    placeholder={placeholder}
                    rightIcon={Icons.ic_down_arrow}
                    editable={false}
                    onRightIconPress={() => setVisible(!visible)}
                    parentStyles={{ pointerEvents: 'none' }}
                />
            </TouchableOpacity>

            {visible && (
                <View style={[styles.dropdownOverlay, dropdownWidth ? { width: dropdownWidth } : {}]}>
                    <ScrollView
                        nestedScrollEnabled={true}
                        style={[styles.list, { maxHeight: 250 }]}
                        contentContainerStyle={{ flexGrow: 1 }}
                    >
                        {data.map((item, index) => (
                            <TouchableOpacity
                                key={item}
                                style={[
                                    styles.dropdownItem,
                                    value === item && styles.selectedItem,
                                    index === data.length - 1 && { borderBottomWidth: 0 }
                                ]}
                                onPress={() => handleSelect(item)}
                            >
                                <Text
                                    style={[
                                        styles.itemText,
                                        value === item && styles.selectedItemText
                                    ]}
                                    numberOfLines={1}
                                >
                                    {item}
                                </Text>
                                {value === item && (
                                    <Image source={Icons.ic_check_circle2} style={styles.checkIcon} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        // marginBottom: 20 // Ensure space if needed, though absolute dropdown floats
    },
    dropdownOverlay: {
        position: 'absolute',
        top: '100%', // Appear right below the input
        left: 0,
        right: 0,
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingVertical: 8,
        marginTop: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        // Removed maxHeight from here to put it on ScrollView
    },
    list: {
        flexGrow: 0,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    selectedItem: {
        backgroundColor: ColorConstants.PRIMARY_10, // Light highlight
    },
    itemText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    selectedItemText: {
        fontFamily: Fonts.ManropeSemiBold,
        color: ColorConstants.PRIMARY_BROWN,
    },
    checkIcon: {
        width: 16,
        height: 16,
        tintColor: ColorConstants.PRIMARY_BROWN,
    },
});

export default AppDropdown;
