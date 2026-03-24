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

interface HierarchicalDropdownProps {
    label: string;
    data: { label: string; value: string; originalName?: string; isParent?: boolean }[];
    value: string; // The indented label
    onSelect: (val: string) => void; // val is the label
    placeholder?: string;
    dropdownWidth?: DimensionValue;
}

const HierarchicalDropdown: React.FC<HierarchicalDropdownProps> = ({
    label,
    data,
    value,
    onSelect,
    placeholder = 'Select option',
    dropdownWidth = 300,
}) => {
    const [visible, setVisible] = useState(false);
    const [dropdownTop, setDropdownTop] = useState(0);
    const [dropdownLeft, setDropdownLeft] = useState(0);
    const containerRef = useRef<View>(null);

    const toggleDropdown = () => {
        if (visible) {
            setVisible(false);
        } else {
            const handle = findNodeHandle(containerRef.current);
            if (handle) {
                UIManager.measure(handle, (x, y, width, height, pageX, pageY) => {
                    setDropdownTop(pageY + height + 4);
                    setDropdownLeft(pageX);
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
                                    width: dropdownWidth,
                                },
                            ]}
                        >
                            <FlatList
                                data={data}
                                keyExtractor={(item) => item.value}
                                keyboardShouldPersistTaps="handled"
                                bounces={false}
                                renderItem={({ item, index }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.dropdownItem,
                                            value === item.label && styles.selectedItem,
                                            index === data.length - 1 && { borderBottomWidth: 0 }
                                        ]}
                                        onPress={() => {
                                            if (!item.isParent) {
                                                handleSelect(item.label);
                                            }
                                        }}
                                        activeOpacity={item.isParent ? 1 : 0.8}
                                    >
                                        <Text
                                            style={[
                                                styles.itemText,
                                                value === item.label && styles.selectedItemText,
                                                item.isParent && styles.parentText
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {item.label}
                                        </Text>
                                        {value === item.label && !item.isParent && (
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
        backgroundColor: 'rgba(0,0,0,0.05)', // Subtle backdrop to help distinguish
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
        maxHeight: 400,
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
    parentText: {
        fontFamily: Fonts.ManropeBold,
        color: ColorConstants.BLACK,
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

export default HierarchicalDropdown;
