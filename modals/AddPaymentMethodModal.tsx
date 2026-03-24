import { apiPatch, apiPost } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import CustomTextInput from '@/components/CustomTextInput';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';

interface AddPaymentMethodModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    paymentMethod?: any;
}

export default function AddPaymentMethodModal({ visible, onClose, onSuccess, paymentMethod }: AddPaymentMethodModalProps) {
    const [methodType, setMethodType] = useState<'card' | 'bank'>('card');
    const [cardNumber, setCardNumber] = useState('');
    const [cardholderName, setCardholderName] = useState('');
    const [expiryMonth, setExpiryMonth] = useState('');
    const [expiryYear, setExpiryYear] = useState('');
    const [cvv, setCvv] = useState('');

    // Bank states
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [routingNumber, setRoutingNumber] = useState('');

    const [saveCard, setSaveCard] = useState(true);

    // Dropdown states
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [showYearPicker, setShowYearPicker] = useState(false);

    const [errors, setErrors] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (visible) {
            if (paymentMethod) {
                setMethodType(paymentMethod.type || 'card');
                if (paymentMethod.type === 'card') {
                    setCardholderName(paymentMethod.card_holder_name || paymentMethod.account_holder_name || '');
                    setExpiryMonth(paymentMethod.card_exp_month ? paymentMethod.card_exp_month.toString().padStart(2, '0') : '');
                    setExpiryYear(paymentMethod.card_exp_year ? paymentMethod.card_exp_year.toString() : '');
                    setCardNumber(`**** **** **** ${paymentMethod.card_last_four || '****'}`);
                    setCvv('***');
                } else {
                    setCardholderName(paymentMethod.account_holder_name || paymentMethod.card_holder_name || '');
                    setBankName(paymentMethod.bank_name || '');
                    setAccountNumber(`****${paymentMethod.account_number?.slice(-4) || '****'}`);
                    setRoutingNumber(paymentMethod.routing_number || '');
                }
            } else {
                setMethodType('card');
                setCardNumber('');
                setCardholderName('');
                setExpiryMonth('');
                setExpiryYear('');
                setCvv('');
                setBankName('');
                setAccountNumber('');
                setRoutingNumber('');
            }
            setErrors({});
        }
    }, [visible, paymentMethod]);

    // Generate Months (01 - 12)
    const months = Array.from({ length: 12 }, (_, i) => {
        const value = (i + 1).toString().padStart(2, '0');
        return { label: value, value };
    });

    // Generate Years (Current + 20 years)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 21 }, (_, i) => {
        const value = (currentYear + i).toString();
        return { label: value, value };
    });

    const renderPickerModal = (
        visible: boolean,
        data: { label: string; value: string }[],
        onClose: () => void,
        onSelect: (value: string) => void,
        title: string
    ) => (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={onClose}>
                <View style={styles.pickerContent}>
                    <Text style={styles.pickerTitle}>{title}</Text>
                    <FlatList
                        data={data}
                        keyExtractor={(item) => item.value}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.pickerItem}
                                onPress={() => {
                                    onSelect(item.value);
                                    onClose();
                                }}
                            >
                                <Text style={styles.pickerItemText}>{item.label}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </TouchableOpacity>
        </Modal>
    );

    const handleSubmit = async () => {
        let newErrors: any = {};
        if (methodType === 'card') {
            if (!paymentMethod && !cardNumber) newErrors.cardNumber = 'Card Number is required';
            if (!cardholderName) newErrors.cardholderName = 'Cardholder Name is required';
            if (!expiryMonth) newErrors.expiryMonth = 'Required';
            if (!expiryYear) newErrors.expiryYear = 'Required';
            if (!paymentMethod && !cvv) newErrors.cvv = 'CVV is required';
        } else {
            if (!cardholderName) newErrors.cardholderName = 'Account Holder Name is required';
            if (!bankName) newErrors.bankName = 'Bank Name is required';
            if (!paymentMethod && !accountNumber) newErrors.accountNumber = 'Account Number is required';
            if (!paymentMethod && !routingNumber) newErrors.routingNumber = 'Routing Number is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});

        try {
            setIsSubmitting(true);
            const payload = methodType === 'card' ? {
                type: 'card',
                card_holder_name: cardholderName,
                card_exp_month: parseInt(expiryMonth),
                card_exp_year: parseInt(expiryYear),
                ...(paymentMethod ? {} : { card_number: cardNumber, cvv: cvv })
            } : {
                type: 'bank',
                account_holder_name: cardholderName,
                bank_name: bankName,
                ...(paymentMethod ? {} : { account_number: accountNumber, routing_number: routingNumber })
            };

            const response = paymentMethod
                ? await apiPatch(`${ApiConstants.ADD_PAYMENT_METHODS}${paymentMethod.id}/`, payload)
                : await apiPost(ApiConstants.ADD_PAYMENT_METHODS, payload);

            if (response.status === 200 || response.status === 201) {
                if (paymentMethod) {
                    Toast.show({
                        type: 'success',
                        text1: 'Success',
                        text2: response.data?.message || 'Payment method updated successfully'
                    });
                }
                if (onSuccess) onSuccess();
                onClose();
            }
        } catch (error: any) {
            console.error('Error adding/updating payment method:', error);
            if (paymentMethod) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: error?.response?.data?.message || 'Failed to update payment method'
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.modalTitle}>Add Payment Method</Text>
                            <Text style={styles.modalSubtitle}>Add a new credit or debit card</Text>
                        </View>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Ionicons name="close" size={20} color={ColorConstants.BLACK2} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {/* Payment Method Type */}
                        <Text style={styles.sectionLabel}>Payment Method Type</Text>
                        <View style={styles.methodTabsRow}>
                            <TouchableOpacity
                                style={[styles.methodTab, methodType === 'card' && styles.methodTabActive, paymentMethod && { opacity: 0.5 }]}
                                onPress={() => setMethodType('card')}
                                disabled={!!paymentMethod}
                            >
                                <Ionicons name="card-outline" size={20} color={methodType === 'card' ? ColorConstants.WHITE : ColorConstants.BLACK2} />
                                <Text style={[styles.methodTabText, methodType === 'card' && styles.methodTabTextActive]}>Credit/Debit Card</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.methodTab, methodType === 'bank' && styles.methodTabActive, paymentMethod && { opacity: 0.5 }]}
                                onPress={() => setMethodType('bank')}
                                disabled={!!paymentMethod}
                            >
                                <Ionicons name="business-outline" size={20} color={methodType === 'bank' ? ColorConstants.WHITE : ColorConstants.BLACK2} />
                                <Text style={[styles.methodTabText, methodType === 'bank' && styles.methodTabTextActive]}>Bank Account</Text>
                            </TouchableOpacity>
                        </View>

                        {methodType === 'card' ? (
                            <>
                                {/* Card Number */}
                                <CustomTextInput
                                    label="Card Number *"
                                    placeholder="1234 5678 9012 3456"
                                    value={cardNumber}
                                    onChangeText={(text) => { setCardNumber(text); setErrors({ ...errors, cardNumber: '' }); }}
                                    keyboardType="numeric"
                                    maxLength={19}
                                    inputStyles={[styles.customInput, paymentMethod && { backgroundColor: '#F3F4F6', color: '#9CA3AF' }]}
                                    error={errors.cardNumber}
                                    editable={!paymentMethod}
                                />

                                {/* Cardholder Name */}
                                <CustomTextInput
                                    label="Cardholder Name *"
                                    placeholder="John Doe"
                                    value={cardholderName}
                                    onChangeText={(text) => { setCardholderName(text); setErrors({ ...errors, cardholderName: '' }); }}
                                    inputStyles={styles.customInput}
                                    error={errors.cardholderName}
                                />

                                {/* Expiry and CVV Row */}
                                <View style={styles.row}>
                                    <View style={[styles.flex1, { marginRight: 15 }]}>
                                        <Text style={styles.inputLabel}>Expiry Date <Text style={styles.asterisk}>*</Text></Text>
                                        <View style={styles.expiryRow}>
                                            <View style={[styles.dropdownContainer]}>
                                                <View style={styles.sectionTitlePlaceholder} />
                                                <TouchableOpacity
                                                    style={styles.dropdownInput}
                                                    onPress={() => { setShowMonthPicker(true); setErrors({ ...errors, expiryMonth: '' }); }}
                                                >
                                                    <Text style={[styles.dropdownInputText, !expiryMonth && styles.dropdownPlaceholderText]}>
                                                        {expiryMonth || "Month"}
                                                    </Text>
                                                    <Ionicons name="chevron-down" size={14} color={ColorConstants.BLACK2} />
                                                </TouchableOpacity>
                                                {errors.expiryMonth && <Text style={styles.errorText}>{errors.expiryMonth}</Text>}
                                            </View>
                                            <View style={[styles.dropdownContainer, { marginLeft: 10 }]}>
                                                <View style={styles.sectionTitlePlaceholder} />
                                                <TouchableOpacity
                                                    style={styles.dropdownInput}
                                                    onPress={() => { setShowYearPicker(true); setErrors({ ...errors, expiryYear: '' }); }}
                                                >
                                                    <Text style={[styles.dropdownInputText, !expiryYear && styles.dropdownPlaceholderText]}>
                                                        {expiryYear || "Year"}
                                                    </Text>
                                                    <Ionicons name="chevron-down" size={14} color={ColorConstants.BLACK2} />
                                                </TouchableOpacity>
                                                {errors.expiryYear && <Text style={styles.errorText}>{errors.expiryYear}</Text>}
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.flex1}>
                                        <CustomTextInput
                                            label="CVV *"
                                            placeholder="123"
                                            value={cvv}
                                            onChangeText={(text) => { setCvv(text); setErrors({ ...errors, cvv: '' }); }}
                                            keyboardType="numeric"
                                            maxLength={4}
                                            inputStyles={[styles.customInput, { marginTop: 2 }, paymentMethod && { backgroundColor: '#F3F4F6', color: '#9CA3AF' }]}
                                            error={errors.cvv}
                                            secureTextEntry={!!paymentMethod}
                                            editable={!paymentMethod}
                                        />
                                    </View>
                                </View>
                            </>
                        ) : (
                            <>
                                {/* Account Holder Name */}
                                <CustomTextInput
                                    label="Account Holder Name *"
                                    placeholder="John Doe"
                                    value={cardholderName}
                                    onChangeText={(text) => { setCardholderName(text); setErrors({ ...errors, cardholderName: '' }); }}
                                    inputStyles={styles.customInput}
                                    error={errors.cardholderName}
                                />

                                {/* Bank Name */}
                                <CustomTextInput
                                    label="Bank Name *"
                                    placeholder="Bank of America"
                                    value={bankName}
                                    onChangeText={(text) => { setBankName(text); setErrors({ ...errors, bankName: '' }); }}
                                    inputStyles={styles.customInput}
                                    error={errors.bankName}
                                />

                                {/* Account Number */}
                                <CustomTextInput
                                    label="Account Number *"
                                    placeholder="123456789"
                                    value={accountNumber}
                                    onChangeText={(text) => { setAccountNumber(text); setErrors({ ...errors, accountNumber: '' }); }}
                                    keyboardType="numeric"
                                    maxLength={17}
                                    inputStyles={[styles.customInput, paymentMethod && { backgroundColor: '#F3F4F6', color: '#9CA3AF' }]}
                                    error={errors.accountNumber}
                                    editable={!paymentMethod}
                                />

                                {/* Routing Number */}
                                <CustomTextInput
                                    label="Routing Number *"
                                    placeholder="123456789"
                                    value={routingNumber}
                                    onChangeText={(text) => { setRoutingNumber(text); setErrors({ ...errors, routingNumber: '' }); }}
                                    keyboardType="numeric"
                                    maxLength={9}
                                    inputStyles={[styles.customInput, paymentMethod && { backgroundColor: '#F3F4F6', color: '#9CA3AF' }]}
                                    error={errors.routingNumber}
                                    editable={!paymentMethod}
                                />
                            </>
                        )}

                        {/* Save Card Checkbox */}
                        {/* <Pressable style={styles.checkboxContainer} onPress={() => setSaveCard(!saveCard)}>
                            <View style={[styles.checkbox, saveCard && styles.checkboxActive]}>
                                {saveCard && <Ionicons name="checkmark" size={14} color={ColorConstants.WHITE} />}
                            </View>
                            {methodType === 'card' && <Text style={styles.checkboxLabel}>Save card for future payments</Text>}
                            {methodType === 'bank' && <Text style={styles.checkboxLabel}>Save bank account for future payments</Text>}
                        </Pressable> */}
                    </ScrollView>

                    {/* Footer Actions */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={isSubmitting}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]} onPress={handleSubmit} disabled={isSubmitting}>
                            <Text style={styles.submitBtnText}>{isSubmitting ? 'Saving...' : (paymentMethod ? 'Save Changes' : 'Add Payment Method')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Render Pickers */}
            {renderPickerModal(showMonthPicker, months, () => setShowMonthPicker(false), setExpiryMonth, "Select Month")}
            {renderPickerModal(showYearPicker, years, () => setShowYearPicker(false), setExpiryYear, "Select Year")}
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    modalContent: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 20,
        paddingTop: 20,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: ColorConstants.GRAY3,
    },
    headerTextContainer: {
        flex: 1,
    },
    modalTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 22,
        color: '#111827',
        marginBottom: 4,
    },
    modalSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: '#6B7280',
    },
    closeButton: {
        width: 32,
        height: 32,
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        padding: 20,
    },
    sectionLabel: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 15,
        color: '#374151',
        marginBottom: 12,
    },
    methodTabsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    methodTab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        gap: 8,
    },
    methodTabActive: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        borderColor: ColorConstants.PRIMARY_BROWN,
    },
    methodTabText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: '#374151',
    },
    methodTabTextActive: {
        color: ColorConstants.WHITE,
    },
    inputLabel: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: '#374151',
        marginBottom: 8,
    },
    asterisk: {
        color: '#EF4444',
    },
    customInput: {
        height: 48,
        borderColor: '#E5E7EB',
        borderRadius: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    flex1: {
        flex: 1,
    },
    expiryRow: {
        flexDirection: 'row',
        marginTop: -20,
        marginBottom: 10
    },
    dropdownContainer: {
        flex: 1,
    },
    dropdownInput: {
        height: 48,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
    },
    dropdownInputText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 13,
        color: ColorConstants.DARK_CYAN,
    },
    dropdownPlaceholderText: {
        color: ColorConstants.GRAY_50,
    },
    sectionTitlePlaceholder: {
        height: 20, // To match CustomTextInput label height
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        marginBottom: 10,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: ColorConstants.PRIMARY_BROWN,
        borderRadius: 4,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxActive: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
    },
    checkboxLabel: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 15,
        color: '#374151',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: ColorConstants.GRAY3,
    },
    cancelBtn: {
        height: 48,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    cancelBtnText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: '#374151',
    },
    submitBtn: {
        height: 48,
        borderRadius: 8,
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitBtnText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.WHITE,
    },
    pickerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    pickerContent: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 16,
        padding: 20,
        width: '100%',
        maxHeight: '70%',
    },
    pickerTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 18,
        color: ColorConstants.BLACK,
        marginBottom: 16,
        textAlign: 'center',
    },
    pickerItem: {
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        alignItems: 'center',
    },
    pickerItemText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: '#111827',
    },
    errorText: {
        color: ColorConstants.RED,
        fontSize: 11,
        fontFamily: 'Inter-Regular',
        marginTop: 4,
    }
});
