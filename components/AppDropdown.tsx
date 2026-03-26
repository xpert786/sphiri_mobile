import { Icons } from '@/assets';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import React, { useRef, useState } from 'react';
import {
    DimensionValue,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    UIManager,
    View,
    findNodeHandle,
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
    const [dropdownTop, setDropdownTop] = useState(0);
    const [dropdownLeft, setDropdownLeft] = useState(0);
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const containerRef = useRef<View>(null);

    const toggleDropdown = () => {
        if (visible) {
            setVisible(false);
        } else {
            const handle = findNodeHandle(containerRef.current);
            if (handle) {
                UIManager.measure(handle, (x, y, width, height, pageX, pageY) => {
                    setDropdownTop(pageY + height + 2);
                    setDropdownLeft(pageX);
                    setContainerWidth(width);
                    setVisible(true);
                });
            }
        }
    };

    const handleSelect = (item: string) => {
        onSelect(item);
        setVisible(false);
    };

    return (
        <View ref={containerRef} style={styles.container}>
            <TouchableOpacity onPress={toggleDropdown} activeOpacity={0.8}>
                <CustomTextInput
                    label={label}
                    value={value}
                    onChangeText={() => { }}
                    placeholder={placeholder}
                    rightIcon={Icons.ic_down_arrow}
                    editable={false}
                    onRightIconPress={toggleDropdown}
                    parentStyles={{ pointerEvents: 'none' }}
                />
            </TouchableOpacity>

            <Modal
                transparent
                visible={visible}
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View
                            style={[
                                styles.dropdownOverlay,
                                {
                                    top: dropdownTop,
                                    left: dropdownLeft,
                                    width: (dropdownWidth || containerWidth) as DimensionValue,
                                },
                            ]}
                        >
                            <FlatList
                                data={data}
                                keyExtractor={(item, index) => `${item}-${index}`}
                                keyboardShouldPersistTaps="handled"
                                bounces={false}
                                style={{ maxHeight: 250 }}
                                renderItem={({ item, index }) => (
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
                                )}
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    dropdownOverlay: {
        position: 'absolute',
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingVertical: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
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
        backgroundColor: ColorConstants.PRIMARY_10,
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
