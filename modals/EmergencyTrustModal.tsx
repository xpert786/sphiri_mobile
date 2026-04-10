import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface EmergencyTrustModalProps {
    visible: boolean;
    onClose: () => void;
    onRequestAccess: () => void;
}

export default function EmergencyTrustModal({ visible, onClose, onRequestAccess }: EmergencyTrustModalProps) {
    const [isChecked, setIsChecked] = useState(false);

    const handleRequest = () => {
        if (isChecked) {
            onRequestAccess();
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.title}>Emergency Access Activation</Text>
                            <Text style={styles.subtitle}>Request access to emergency documents and contacts</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={20} color={ColorConstants.BLACK2} />
                        </TouchableOpacity>
                    </View>

                    {/* Warning Box */}
                    <View style={styles.warningBox}>
                        <Ionicons name="alert-circle-outline" size={24} color={ColorConstants.BLACK2} />
                        <Text style={styles.warningText}>
                            Emergency access is restricted and{'\n'}requires primary user confirmation. This{'\n'}action will be logged.
                        </Text>
                    </View>

                    {/* List */}
                    <Text style={styles.sectionTitle}>Emergency Access Activation</Text>
                    <View style={styles.listContainer}>
                        <View style={styles.listItem}>
                            <View style={styles.bulletPoint} />
                            <Text style={styles.listItemText}>Medical Records</Text>
                        </View>
                        <View style={styles.listItem}>
                            <View style={styles.bulletPoint} />
                            <Text style={styles.listItemText}>Legal Documents (POA, Wills)</Text>
                        </View>
                        <View style={styles.listItem}>
                            <View style={styles.bulletPoint} />
                            <Text style={styles.listItemText}>Emergency Contacts</Text>
                        </View>
                        <View style={styles.listItem}>
                            <View style={styles.bulletPoint} />
                            <Text style={styles.listItemText}>Financial Accounts</Text>
                        </View>
                    </View>

                    {/* Checkbox */}
                    <TouchableOpacity
                        style={styles.checkboxContainer}
                        onPress={() => setIsChecked(!isChecked)}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                            {isChecked && <Ionicons name="checkmark" size={14} color={ColorConstants.WHITE} />}
                        </View>
                        <Text style={styles.checkboxLabel}>
                            I confirm I need emergency access to these documents
                        </Text>
                    </TouchableOpacity>

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.requestButton, !isChecked && styles.requestButtonDisabled]}
                            onPress={handleRequest}
                            disabled={!isChecked}
                        >
                            <Text style={styles.requestButtonText}>Request Emergency Access</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    modalContent: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 16,
        padding: 20,
        width: '100%',
        // maxWidth: 360,
        // Shadow
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: ColorConstants.BLUE20,
        // borderStyle:'dashed',
        paddingBottom: 10

    },
    title: {
        fontSize: 22,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.BLACK2,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
        fontFamily: Fonts.mulishRegular,
        color: ColorConstants.GRAY5,
    },
    closeButton: {
        padding: 4,
        marginLeft: 8,
    },
    warningBox: {
        backgroundColor: '#FFF8E6',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#F59E0B',
        padding: 12,
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    warningText: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        fontFamily: Fonts.mulishRegular,
        color: ColorConstants.GRAY5,
        lineHeight: 18,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.BLACK2,
        marginBottom: 12,
    },
    listContainer: {
        marginBottom: 20,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    bulletPoint: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: ColorConstants.BLACK2,
        marginRight: 8,
    },
    listItemText: {
        fontSize: 14,
        fontFamily: Fonts.mulishRegular,
        color: ColorConstants.GRAY5,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: ColorConstants.GRAY,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#A06A61', // Brownish red
        borderColor: '#A06A61',
    },
    checkboxLabel: {
        flex: 1,
        fontSize: 12,
        fontFamily: Fonts.mulishRegular,
        color: ColorConstants.DARK_CYAN,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        height: 40,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: ColorConstants.WHITE,
    },
    cancelButtonText: {
        fontSize: 16,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.BLACK2,
        textAlign: "center",
    },

    requestButton: {
        height: 40,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        flexDirection: "row",
    },

    requestButtonDisabled: {
        backgroundColor: '#9B635980',
        opacity: 0.7,
    },
    requestButtonText: {
        fontSize: 16,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.WHITE,
        textAlign: 'center'
    },
});
