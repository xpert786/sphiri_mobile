import { Icons } from '@/assets';
import Header from '@/components/Header';
import { ColorConstants } from '@/constants/ColorConstants';
import { StringConstants } from '@/constants/StringConstants';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CONDITIONS = [
    {
        id: 1,
        title: 'Manual activation by primary user',
        desc: 'You can manually grant emergency access at any time',
        defaultChecked: true,
    },
    {
        id: 2,
        title: 'Inactivity period (60 days)',
        desc: 'Activate if no login activity for 60 consecutive days',
        defaultChecked: false,
    },
    {
        id: 3,
        title: 'Admin confirmation',
        desc: 'Require platform admin verification before access',
        defaultChecked: false,
    },
];

const accessDurationOptions = [
    'Parmanent Access Untill Revoked',
    '30 Days',
    '50 Days',
    '90 Days',
    '1 Year'
];

export default function ConfigureEmergency() {
    const [showDropdown, setShowDropdown] = useState(false);
    const [conditions, setConditions] = useState(
        CONDITIONS.map(item => ({
            ...item,
            checked: item.defaultChecked,
        }))
    );
    const [formData, setFormData] = useState({
        accessDuration: '',
    });

    const toggleCondition = (id: number) => {
        setConditions(prev =>
            prev.map(item =>
                item.id === id ? { ...item, checked: !item.checked } : item
            )
        );
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={ColorConstants.WHITE} barStyle="dark-content" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}
                keyboardShouldPersistTaps="handled"
            >
                <Header
                    title={StringConstants.FAMILY_SHARING_AND_COLLABORATION}
                    subtitle={StringConstants.MANAGE_FAMILY_ACCESS_AND_EMERGENCY_PROTOCOLS}
                    tapOnBack={() => { router.back() }}
                />

                {/* Emergency Header */}
                <View style={styles.emergencySection}>
                    <Image source={Icons.ic_emergency} style={styles.emergencyIcon} />
                    <View style={styles.emergencyContent}>
                        <Text style={styles.emergencyTitle}>
                            {StringConstants.EMERGENCY_ACCESS_CONFIGURATION}
                        </Text>
                        <Text style={styles.emergencyDesc}>
                            {StringConstants.SET_UP_TRUSTED}
                        </Text>
                    </View>
                </View>

                {/* Info Box */}
                <View style={styles.emergencyPoints}>
                    <Text style={styles.bullet}>{'\u2022'}</Text>
                    <Text style={styles.emergencyPointText}>
                        Emergency access allows designated contacts to view critical information
                        when specific trigger conditions are met. This feature is designed for
                        legacy planning and emergencies only.
                    </Text>
                </View>

                {/* Conditions */}
                <Text style={styles.triggerText}>Trigger Conditions</Text>

                {conditions.map(item => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.conditionsSection}
                        activeOpacity={0.7}
                        onPress={() => toggleCondition(item.id)}
                    >
                        {item.checked ? (
                            <Image source={Icons.ic_checkbox_tick} style={styles.checkboxIcon} />
                        ) : (
                            <View style={styles.checkboxUnselectedIcon} />
                        )}

                        <View style={styles.conditionContent}>
                            <Text style={styles.conditionTitle}>{item.title}</Text>
                            <Text style={styles.conditionDesc}>{item.desc}</Text>
                        </View>
                    </TouchableOpacity>
                ))}

                {/* Dropdown */}
                <View style={styles.dropdownSection}>
                    <Text style={styles.sectionTitle}>{StringConstants.ACCESS_DURATION}</Text>

                    <TouchableOpacity
                        style={styles.dropdownContainer}
                        onPress={() => setShowDropdown(prev => !prev)}
                        activeOpacity={0.8}
                    >
                        <Text
                            style={[
                                styles.dropdownText,
                                {
                                    color: formData.accessDuration
                                        ? ColorConstants.DARK_CYAN
                                        : ColorConstants.GRAY_50,
                                },
                            ]}
                        >
                            {formData.accessDuration || 'Select'}
                        </Text>
                        <Image source={Icons.ic_down_arrow} />
                    </TouchableOpacity>

                    {showDropdown && (
                        <View style={styles.dropdownList}>
                            {accessDurationOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.dropdownItem}
                                    onPress={() => {
                                        handleInputChange('accessDuration', option);
                                        setShowDropdown(false);
                                    }}
                                >
                                    <Text style={styles.dropdownItemText}>{option}</Text>
                                    {formData.accessDuration === option && (
                                        <Image
                                            source={Icons.ic_checkbox_tick}
                                            style={styles.checkIcon}
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.cancelButton}>
                        <Text style={styles.cancelButtonText}>{StringConstants.CANCEL}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.nextButton}>
                        <Text style={styles.nextButtonText}>
                            {StringConstants.SAVE_EMERGENCY_SETTINGS}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorConstants.WHITE,
    },
    contentContainer: {
        paddingBottom: 50,
    },

    emergencySection: {
        paddingHorizontal: 20,
        flexDirection: 'row',
        marginBottom: 20,
        paddingTop: 10,
    },
    emergencyIcon: {
        width: 36,
        height: 36,
        resizeMode: 'contain',
        marginRight: 10,
    },
    emergencyContent: {
        flex: 1,
    },
    emergencyTitle: {
        fontFamily: 'Inter-Medium',
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
    },
    emergencyDesc: {
        fontFamily: 'Inter-Light',
        fontSize: 10,
        color: ColorConstants.DARK_CYAN,
    },

    emergencyPoints: {
        padding: 15,
        borderColor: ColorConstants.BROWN20,
        borderWidth: 1,
        borderRadius: 10,
        marginHorizontal: 20,
        flexDirection: 'row',
        backgroundColor: ColorConstants.PRIMARY_10,
        marginBottom: 20,
    },
    bullet: {
        fontSize: 14,
        marginRight: 8,
        color: ColorConstants.DARK_CYAN,
    },
    emergencyPointText: {
        flex: 1,
        fontFamily: 'Inter-Light',
        fontSize: 10,
        color: ColorConstants.DARK_CYAN,
    },

    triggerText: {
        fontFamily: 'SFPro-Medium',
        fontSize: 13,
        color: ColorConstants.BLACK,
        marginLeft: 20,
    },

    conditionsSection: {
        paddingHorizontal: 20,
        flexDirection: 'row',
        paddingTop: 10,
    },
    checkboxUnselectedIcon: {
        width: 15,
        height: 15,
        borderWidth: 2,
        borderColor: ColorConstants.PRIMARY_BROWN,
        marginRight: 10,
        borderRadius: 4,
        alignSelf: 'center',
    },
    checkboxIcon: {
        width: 15,
        height: 15,
        marginRight: 10,
        alignSelf: 'center',
    },
    conditionContent: {
        flex: 1,
    },
    conditionTitle: {
        fontFamily: 'Inter-Medium',
        fontSize: 10,
        color: ColorConstants.DARK_CYAN,
    },
    conditionDesc: {
        fontFamily: 'Inter-Regular',
        fontSize: 8,
        color: ColorConstants.DARK_CYAN,
    },

    dropdownSection: {
        marginHorizontal: 20,
        marginTop: 20,
        position: 'relative',
        zIndex: 10,
    },
    sectionTitle: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 8,
    },
    dropdownContainer: {
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 4,
        paddingHorizontal: 16,
        height: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownText: {
        fontFamily: 'Inter-Regular',
        fontSize: 13,
    },

    dropdownList: {
        position: 'absolute',
        top: 70,
        left: 0,
        right: 0,
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        zIndex: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 2 },
            },
            android: {
                elevation: 5,
            },
        }),
    },
    dropdownItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: ColorConstants.GRAY3,
    },
    dropdownItemText: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
    },
    checkIcon: {
        width: 16,
        height: 16,
        tintColor: ColorConstants.PRIMARY_BROWN,
    },

    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 30,
        marginRight: 20,
    },
    cancelButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        marginRight: 12,
    },
    cancelButtonText: {
        fontFamily: 'Inter-Medium',
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
    },
    nextButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: ColorConstants.RED,
    },
    nextButtonText: {
        fontFamily: 'Inter-Medium',
        fontSize: 14,
        color: ColorConstants.WHITE,
    },
});
