import { apiDelete, apiGet, apiPatch } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import AddPaymentMethodModal from '@/modals/AddPaymentMethodModal';
import DeletePaymentMethodModal from '@/modals/DeletePaymentMethodModal';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';

// const BILLING_HISTORY = [
//     { date: 'Feb 15, 2025', amount: '$24.99', status: 'Paid' },
//     { date: 'Jan 15, 2025', amount: '$24.99', status: 'Paid' },
//     { date: 'Dec 15, 2024', amount: '$24.99', status: 'Paid' },
// ];

// const BillingTab = () => {
//     const [billingData, setBillingData] = useState<any>(null);
//     const [plansData, setPlansData] = useState<any>(null);
//     const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
//     const [loading, setLoading] = useState(true);
//     const [showInvoiceModal, setShowInvoiceModal] = useState(false);
//     const [selectedInvoice, setSelectedInvoice] = useState(null);

//     useEffect(() => {
//         fetchData();
//     }, []);

//     const fetchData = async () => {
//         try {
//             setLoading(true);
//             const [billingRes, plansRes] = await Promise.all([
//                 apiGet(ApiConstants.SETTINGS_BILLING),
//                 apiGet(ApiConstants.PLANS)
//             ]);
//             console.log("billingRes.data:", billingRes.data);
//             console.log("plansRes.data:", plansRes.data);


//             if (billingRes.data) setBillingData(billingRes.data);
//             if (plansRes.data) {
//                 setPlansData(plansRes.data);
//                 setBillingCycle(plansRes.data.billing_cycle || 'monthly');
//             }
//         } catch (error) {
//             console.error('Error fetching billing/plans data:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleInvoicePress = (invoice: any) => {
//         setSelectedInvoice(invoice);
//         setShowInvoiceModal(true);
//     };

//     if (loading) {
//         return (
//             <View style={[styles.tabContent, { justifyContent: 'center', height: 400 }]}>
//                 <ActivityIndicator size="large" color={ColorConstants.PRIMARY_BROWN} />
//             </View>
//         );
//     }

//     if (!billingData || !plansData) return null;

//     const { usage } = billingData;
//     console.log("usage=>>>>", usage);

//     const { current_billing, plans, yearly_discount } = plansData;

//     return (
//         <View style={styles.tabContent}>
//             {/* Current Plan */}
//             <View style={styles.card}>
//                 <View style={styles.cardHeader}>
//                     <Text style={styles.cardTitle}>Current Plan</Text>
//                     <View style={styles.planBadge}>
//                         <Text style={styles.planBadgeText}>{current_billing?.plan}</Text>
//                     </View>
//                 </View>
//                 <Text style={styles.cardSubtitle}>
//                     You are currently on the {current_billing?.plan} plan ({current_billing?.status})
//                 </Text>

//                 <View style={styles.infoBox}>
//                     <Text style={styles.infoTitle}>
//                         Next billing date: {current_billing?.next_billing}
//                     </Text>
//                     <Text style={styles.infoSubText}>
//                         {current_billing?.amount_display} • {current_billing?.auto_renew ? 'Auto-renew is on' : 'Auto-renew is off'}
//                     </Text>
//                 </View>

//                 {/* Usage Stats */}
//                 <View style={styles.usageContainer}>
//                     <Text style={styles.usageTitle}>Usage</Text>
//                     <View style={styles.usageItem}>
//                         <View style={styles.usageInfoRow}>
//                             <Text style={styles.usageLabel}>Storage</Text>
//                             <Text style={styles.usageValue}>{usage?.storage?.used_display} / {usage?.storage?.limit_display}</Text>
//                         </View>
//                         <View style={styles.progressBarBg}>
//                             <View style={[styles.progressBarFill, { width: `${Math.min(usage?.storage?.percentage || 0, 100)}%` }]} />
//                         </View>
//                     </View>

//                     <View style={styles.usageItem}>
//                         <View style={styles.usageInfoRow}>
//                             <Text style={styles.usageLabel}>Documents</Text>
//                             <Text style={styles.usageValue}>{usage?.documents?.used} / {usage?.documents?.limit === -1 ? '∞' : usage?.documents?.limit}</Text>
//                         </View>
//                         <View style={styles.progressBarBg}>
//                             <View style={[styles.progressBarFill, { width: `${Math.min((usage?.documents?.used / (usage?.documents?.limit === -1 ? usage?.documents?.used + 1 : usage?.documents?.limit)) * 100, 100)}%` }]} />
//                         </View>
//                     </View>
//                 </View>

//                 <TouchableOpacity style={styles.outlineBtn}>
//                     <Text style={styles.outlineBtnText}>Manage Subscription</Text>
//                 </TouchableOpacity>
//             </View>

//             {/* Payment Method - Placeholder */}
//             <View style={styles.card}>
//                 <Text style={[styles.cardTitle, { marginBottom: 16 }]}>Payment Method</Text>
//                 <View style={styles.paymentMethodCard}>
//                     <View style={styles.pmInfo}>
//                         <Text style={styles.pmTitle}>Visa ending in 4242</Text>
//                         <Text style={styles.pmSubText}>Expires 12/2026</Text>
//                     </View>
//                     <View style={styles.defaultBadge}>
//                         <Text style={styles.defaultBadgeText}>Default</Text>
//                     </View>
//                 </View>
//                 <TouchableOpacity style={[styles.outlineBtn, { marginTop: 16 }]}>
//                     <Text style={styles.outlineBtnText}>Update Payment Method</Text>
//                 </TouchableOpacity>
//             </View>

//             {/* Billing History */}
//             <View style={styles.card}>
//                 <Text style={styles.cardTitle}>Billing History</Text>
//                 <Text style={styles.cardSubtitle}>View your past invoices and payments</Text>

//                 {BILLING_HISTORY.map((item, index) => (
//                     <TouchableOpacity
//                         key={index}
//                         style={styles.historyRow}
//                         onPress={() => handleInvoicePress(item)}
//                     >
//                         <View style={styles.historyInfo}>
//                             <Text style={styles.historyDate}>{item.date}</Text>
//                             <Text style={styles.historyAmount}>{item.amount}</Text>
//                         </View>
//                         <View style={styles.historyActions}>
//                             <View style={styles.paidBadge}>
//                                 <Text style={styles.paidBadgeText}>{item.status}</Text>
//                             </View>
//                             <TouchableOpacity style={styles.downloadBtn}>
//                                 <Text style={styles.downloadText}>Download</Text>
//                             </TouchableOpacity>
//                         </View>
//                     </TouchableOpacity>
//                 ))}

//                 <InvoiceDetailsModal
//                     visible={showInvoiceModal}
//                     onClose={() => setShowInvoiceModal(false)}
//                     invoice={selectedInvoice}
//                 />
//             </View>

//             {/* Upgrade or Downgrade */}
//             <View style={[styles.card, styles.billing]}>
//                 <View style={styles.sectionHeader}>
//                     <Text style={styles.sectionTitleHeader}>Upgrade or Downgrade</Text>
//                     <Text style={styles.sectionSubtitle}>Choose a different plan that fits your needs</Text>
//                 </View>

//                 {/* Billing Cycle Toggle */}
//                 <View style={styles.toggleContainer}>
//                     <TouchableOpacity
//                         style={[styles.toggleBtn, billingCycle === 'monthly' && styles.toggleBtnActive]}
//                         onPress={() => setBillingCycle('monthly')}
//                     >
//                         <Text style={[styles.toggleBtnText, billingCycle === 'monthly' && styles.toggleBtnTextActive]}>Monthly</Text>
//                     </TouchableOpacity>
//                     <View style={{ flex: 1 }} />
//                     <TouchableOpacity
//                         style={[styles.toggleBtn, billingCycle === 'yearly' && styles.toggleBtnActive]}
//                         onPress={() => setBillingCycle('yearly')}
//                     >
//                         <View style={styles.yearlyLabelContainer}>
//                             <Text style={[styles.toggleBtnText, billingCycle === 'yearly' && styles.toggleBtnTextActive]}>Yearly</Text>
//                             <View style={styles.discountBadge}>
//                                 <Text style={styles.discountBadgeText}>-{yearly_discount}</Text>
//                             </View>
//                         </View>
//                     </TouchableOpacity>
//                 </View>

//                 {plans.map((plan: any) => {
//                     const pricing = plan.pricing[billingCycle];
//                     const isCurrent = plan.id === current_billing?.plan_id;
//                     const priceDisplay = pricing.display;
//                     const periodDisplay = pricing.period;

//                     return (
//                         <View key={plan.id} style={[styles.planCard, isCurrent && styles.currentPlanCard]}>
//                             <View style={styles.planCardHeader}>
//                                 <Text style={styles.planName}>{plan.name}</Text>
//                                 {billingCycle === 'yearly' && pricing.savings && (
//                                     <View style={styles.savingsBadge}>
//                                         <Text style={styles.savingsBadgeText}>{pricing.savings}</Text>
//                                     </View>
//                                 )}
//                             </View>

//                             <View style={styles.planPriceContainer}>
//                                 <Text style={styles.planPrice}>{priceDisplay}</Text>
//                                 {periodDisplay && <Text style={styles.planPeriod}>{periodDisplay}</Text>}
//                             </View>

//                             <View style={styles.featuresContainer}>
//                                 {plan.features.map((feature: string, i: number) => (
//                                     <View key={i} style={styles.featureRow}>
//                                         <Image source={Icons.ic_check} style={styles.featureIcon} />
//                                         <Text style={styles.featureText}>{feature}</Text>
//                                     </View>
//                                 ))}
//                             </View>

//                             <TouchableOpacity
//                                 style={[
//                                     styles.planBtn,
//                                     isCurrent ? styles.currentPlanBtn : styles.choosePlanBtn
//                                 ]}
//                                 disabled={isCurrent}
//                             >
//                                 <Text style={[
//                                     styles.planBtnText,
//                                     isCurrent ? styles.currentPlanBtnText : styles.choosePlanBtnText
//                                 ]}>
//                                     {isCurrent ? 'Current Plan' : 'Choose Plan'}
//                                 </Text>
//                             </TouchableOpacity>
//                         </View>
//                     );
//                 })}
//             </View>
//         </View>
//     );
// };

// export default BillingTab;

// const styles = StyleSheet.create({
//     tabContent: {
//         paddingHorizontal: 20,
//     },
//     card: {
//         backgroundColor: ColorConstants.WHITE,
//         borderRadius: 16,
//         padding: 20,
//         marginBottom: 16,
//         borderWidth: 1,
//         borderColor: ColorConstants.GRAY3,
//     },
//     billing: {
//         paddingHorizontal: 20,
//         paddingBottom: 0,
//         paddingTop: 10
//     },
//     cardHeader: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: 4,
//     },
//     cardTitle: {
//         fontFamily: Fonts.ManropeSemiBold,
//         fontSize: 18,
//         color: ColorConstants.BLACK2,
//     },
//     cardSubtitle: {
//         fontFamily: Fonts.mulishRegular,
//         fontSize: 14,
//         color: ColorConstants.DARK_CYAN,
//         marginBottom: 16,
//     },
//     planBadge: {
//         backgroundColor: ColorConstants.PRIMARY_BROWN,
//         paddingHorizontal: 12,
//         paddingVertical: 4,
//         borderRadius: 12,
//     },
//     planBadgeText: {
//         color: ColorConstants.WHITE,
//         fontSize: 12,
//         fontFamily: Fonts.ManropeMedium,
//     },
//     infoBox: {
//         backgroundColor: ColorConstants.WHITE,
//         borderWidth: 1,
//         borderColor: ColorConstants.GRAY3,
//         borderRadius: 12,
//         padding: 16,
//         marginBottom: 16,
//     },
//     infoTitle: {
//         fontFamily: Fonts.ManropeSemiBold,
//         fontSize: 14,
//         color: ColorConstants.BLACK2,
//     },
//     infoSubText: {
//         fontFamily: Fonts.mulishRegular,
//         fontSize: 12,
//         color: ColorConstants.DARK_CYAN,
//         marginTop: 4,
//     },
//     outlineBtn: {
//         borderWidth: 1,
//         borderColor: ColorConstants.GRAY3,
//         paddingVertical: 8,
//         paddingHorizontal: 12,
//         borderRadius: 10,
//         alignSelf: 'flex-start',
//     },
//     outlineBtnText: {
//         fontFamily: Fonts.ManropeMedium,
//         fontSize: 15,
//         color: ColorConstants.BLACK2,
//     },
//     paymentMethodCard: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         borderWidth: 1,
//         borderColor: ColorConstants.GRAY3,
//         borderRadius: 12,
//         padding: 16,
//     },
//     pmInfo: {
//         flex: 1,
//     },
//     pmTitle: {
//         fontFamily: Fonts.ManropeSemiBold,
//         fontSize: 16,
//         color: ColorConstants.BLACK2,
//     },
//     pmSubText: {
//         fontFamily: Fonts.mulishRegular,
//         fontSize: 12,
//         color: ColorConstants.DARK_CYAN,
//         marginTop: 2,
//     },
//     defaultBadge: {
//         backgroundColor: ColorConstants.GRAY3,
//         paddingHorizontal: 10,
//         paddingVertical: 4,
//         borderRadius: 12,
//     },
//     defaultBadgeText: {
//         fontSize: 12,
//         color: ColorConstants.BLACK2,
//         fontFamily: Fonts.ManropeMedium,
//     },
//     historyRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         borderWidth: 1,
//         borderColor: ColorConstants.GRAY3,
//         borderRadius: 12,
//         padding: 12,
//         marginBottom: 12,
//     },
//     historyInfo: {
//         flex: 1,
//     },
//     historyDate: {
//         fontFamily: Fonts.ManropeSemiBold,
//         fontSize: 14,
//         color: ColorConstants.BLACK2,
//     },
//     historyAmount: {
//         fontFamily: Fonts.mulishRegular,
//         fontSize: 12,
//         color: ColorConstants.DARK_CYAN,
//     },
//     historyActions: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 8,
//     },
//     paidBadge: {
//         backgroundColor: ColorConstants.GREEN20,
//         paddingHorizontal: 8,
//         paddingVertical: 2,
//         borderRadius: 12,
//     },
//     paidBadgeText: {
//         fontSize: 11,
//         color: ColorConstants.GREEN2,
//         fontFamily: Fonts.ManropeSemiBold,
//     },
//     downloadBtn: {
//         backgroundColor: ColorConstants.GRAY3,
//         paddingHorizontal: 8,
//         paddingVertical: 4,
//         borderRadius: 6,
//     },
//     downloadText: {
//         fontSize: 11,
//         color: ColorConstants.BLACK2,
//         fontFamily: Fonts.ManropeMedium,
//     },
//     sectionHeader: {
//         marginTop: 8,
//         marginBottom: 16,
//     },
//     sectionTitleHeader: {
//         fontFamily: Fonts.ManropeSemiBold,
//         fontSize: 20,
//         color: ColorConstants.BLACK2,
//     },
//     sectionSubtitle: {
//         fontFamily: Fonts.mulishRegular,
//         fontSize: 14,
//         color: ColorConstants.DARK_CYAN,
//         marginTop: 4,
//     },
//     planCard: {
//         backgroundColor: ColorConstants.WHITE,
//         borderRadius: 16,
//         padding: 24,
//         marginBottom: 20,
//         borderWidth: 1,
//         borderColor: ColorConstants.GRAY3,
//     },
//     currentPlanCard: {
//         borderColor: ColorConstants.PRIMARY_BROWN,
//         backgroundColor: '#FDF8F8',
//     },
//     planName: {
//         fontFamily: Fonts.ManropeSemiBold,
//         fontSize: 18,
//         color: ColorConstants.BLACK2,
//         marginBottom: 8,
//     },
//     planPriceContainer: {
//         flexDirection: 'row',
//         alignItems: 'baseline',
//         marginBottom: 20,
//     },
//     planPrice: {
//         fontFamily: Fonts.ManropeSemiBold,
//         fontSize: 28,
//         color: ColorConstants.BLACK2,
//     },
//     planPeriod: {
//         fontFamily: Fonts.mulishRegular,
//         fontSize: 14,
//         color: ColorConstants.DARK_CYAN,
//         marginLeft: 4,
//     },
//     featuresContainer: {
//         gap: 12,
//         marginBottom: 24,
//     },
//     featureRow: {
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     featureIcon: {
//         width: 14,
//         height: 14,
//         tintColor: ColorConstants.PRIMARY_BROWN,
//         marginRight: 10,
//     },
//     featureText: {
//         fontFamily: Fonts.mulishRegular,
//         fontSize: 14,
//         color: ColorConstants.BLACK2,
//     },
//     planBtn: {
//         paddingVertical: 8,
//         borderRadius: 10,
//         alignItems: 'center',
//     },
//     choosePlanBtn: {
//         backgroundColor: ColorConstants.PRIMARY_BROWN,
//     },
//     currentPlanBtn: {
//         backgroundColor: ColorConstants.WHITE,
//         borderWidth: 1,
//         borderColor: ColorConstants.GRAY3,
//     },
//     planBtnText: {
//         fontFamily: Fonts.ManropeMedium,
//         fontSize: 16,
//     },
//     choosePlanBtnText: {
//         color: ColorConstants.WHITE,
//     },
//     currentPlanBtnText: {
//         color: ColorConstants.GRAY,
//     },
//     usageContainer: {
//         marginBottom: 20,
//     },
//     usageTitle: {
//         fontFamily: Fonts.ManropeSemiBold,
//         fontSize: 16,
//         color: ColorConstants.BLACK2,
//         marginBottom: 12,
//     },
//     usageItem: {
//         marginBottom: 12,
//     },
//     usageInfoRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginBottom: 6,
//     },
//     usageLabel: {
//         fontFamily: Fonts.mulishRegular,
//         fontSize: 13,
//         color: ColorConstants.DARK_CYAN,
//     },
//     usageValue: {
//         fontFamily: Fonts.ManropeMedium,
//         fontSize: 13,
//         color: ColorConstants.BLACK2,
//     },
//     progressBarBg: {
//         height: 6,
//         backgroundColor: ColorConstants.GRAY3,
//         borderRadius: 3,
//         overflow: 'hidden',
//     },
//     progressBarFill: {
//         height: '100%',
//         backgroundColor: ColorConstants.PRIMARY_BROWN,
//     },
//     toggleContainer: {
//         flexDirection: 'row',
//         backgroundColor: '#F3F4F6',
//         borderRadius: 24,
//         padding: 4,
//         marginBottom: 24,
//         width: '100%',
//     },
//     toggleBtn: {
//         flex: 1,
//         paddingVertical: 8,
//         alignItems: 'center',
//         borderRadius: 20,
//     },
//     toggleBtnActive: {
//         backgroundColor: ColorConstants.WHITE,
//         elevation: 2,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.1,
//         shadowRadius: 2,
//     },
//     toggleBtnText: {
//         fontFamily: Fonts.ManropeSemiBold,
//         fontSize: 14,
//         color: ColorConstants.DARK_CYAN,
//     },
//     toggleBtnTextActive: {
//         color: ColorConstants.BLACK2,
//     },
//     yearlyLabelContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 6,
//     },
//     discountBadge: {
//         backgroundColor: '#ECFDF5',
//         paddingHorizontal: 6,
//         paddingVertical: 2,
//         borderRadius: 4,
//     },
//     discountBadgeText: {
//         color: '#059669',
//         fontSize: 10,
//         fontFamily: Fonts.ManropeBold,
//     },
//     planCardHeader: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'flex-start',
//         marginBottom: 8,
//     },
//     savingsBadge: {
//         backgroundColor: '#FEF3C7',
//         paddingHorizontal: 8,
//         paddingVertical: 2,
//         borderRadius: 4,
//     },
//     savingsBadgeText: {
//         color: '#92400E',
//         fontSize: 11,
//         fontFamily: Fonts.ManropeSemiBold,
//     },
// });


const BillingTab = () => {
    const [billingData, setBillingData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null);
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

    // Delete states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingMethodId, setDeletingMethodId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [billingRes, paymentRes] = await Promise.all([
                apiGet(ApiConstants.SETTINGS_BILLING),
                apiGet(ApiConstants.ADD_PAYMENT_METHODS)
            ]);
            console.log("billingRes.data", billingRes.data);

            if (billingRes.data) setBillingData(billingRes.data);
            if (paymentRes.data) setPaymentMethods(Array.isArray(paymentRes.data) ? paymentRes.data : (paymentRes.data.results || []));
        } catch (error) {
            console.error('Error fetching billing/plans data:', error);
        } finally {
            setLoading(false);
        }
    };


    const handleSetDefault = async (methodId: number) => {
        try {
            setLoading(true);
            const response = await apiPatch(`${ApiConstants.ADD_PAYMENT_METHODS}${methodId}/`, { is_default: true });
            if (response.status === 200 || response.status === 201) {
                const successMsg = response.data?.message || 'Payment method set as default';
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: successMsg
                });
                fetchData();
            }
        } catch (error: any) {
            console.error('Error setting default payment method:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error?.response?.data?.message || 'Failed to set default payment method'
            });
            setLoading(false);
        }
    };

    const handleDeletePaymentMethod = async () => {
        if (!deletingMethodId) return;
        try {
            setIsDeleting(true);
            const response = await apiDelete(`${ApiConstants.ADD_PAYMENT_METHODS}${deletingMethodId}/`);
            if (response.status === 200 || response.status === 204) {
                const successMsg = response.data?.message || 'Payment method deleted';
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: successMsg
                });
                setShowDeleteModal(false);
                setDeletingMethodId(null);
                fetchData();
            }
        } catch (error: any) {
            console.error('Error deleting payment method:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error?.response?.data?.message || 'Failed to delete payment method'
            });
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.tabContent, { justifyContent: 'center', height: 400 }]}>
                <ActivityIndicator size="large" color={ColorConstants.PRIMARY_BROWN} />
            </View>
        );
    }

    if (!billingData) return null;

    const { usage, subscription, payment_methods } = billingData;

    const formatDate = (isoString?: string) => {
        if (!isoString) return '';
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return '';
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    };

    return (
        <View style={styles.tabContent}>
            {/* New UI as per screenshots */}
            {/* Current Plan */}
            <View style={styles.card}>
                <View style={[styles.cardHeader, { marginBottom: 12 }]}>
                    <Text style={[styles.cardTitle, { fontSize: 18, fontFamily: Fonts.ManropeBold }]}>Current Plan</Text>
                    <View style={[styles.planBadge, { backgroundColor: '#13404D' }]}>
                        <Text style={[styles.planBadgeText, { fontFamily: Fonts.ManropeBold }]}>{subscription?.plan?.name || "Basic"}</Text>
                    </View>
                </View>
                <Text style={[styles.cardSubtitle, { color: ColorConstants.DARK_CYAN, fontFamily: Fonts.mulishRegular, marginBottom: 20 }]}>
                    You are currently on the {subscription?.plan?.name || ''} plan
                </Text>

                <View style={[styles.infoBox, { borderColor: '#E5E7EB', padding: 20 }]}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Plan Type:</Text>
                        <Text style={styles.detailValue}>{subscription?.plan?.name || "Basic"}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Price:</Text>
                        <Text style={styles.detailValue}>${subscription?.plan?.price || "0"}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Billing Cycle:</Text>
                        <Text style={styles.detailValue}>{subscription?.plan?.billing_cycle}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Status:</Text>
                        <View style={[styles.statusBadge, { backgroundColor: '#E1FCEF' }]}>
                            <Text style={[styles.statusBadgeText, { color: '#059669' }]}>{subscription?.status || "Active"}</Text>
                        </View>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Subscription ID:</Text>
                        <Text style={styles.detailValue}>{subscription?.id || "N/A"}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Start Date:</Text>
                        <Text style={styles.detailValue}>{formatDate(subscription?.start_date)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>End Date:</Text>
                        <Text style={styles.detailValue}>{formatDate(subscription?.end_date)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Days Remaining:</Text>
                        <Text style={styles.detailValue}>{subscription?.days_remaining}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Auto Renew:</Text>
                        <View style={[styles.statusBadge, { backgroundColor: '#FEE2E2' }]}>
                            <Text style={[styles.statusBadgeText, { color: '#EF4444' }]}>{subscription?.auto_renew ? 'Enabled' : 'Disabled'}</Text>
                        </View>
                    </View>
                    <Text style={[styles.infoSubText, { marginTop: 12, color: ColorConstants.DARK_CYAN }]}>
                        Your subscription will expire on the end date.
                    </Text>
                </View>


            </View>

            {/* Usage Statistics */}
            <View style={styles.card}>
                <Text style={[styles.cardTitle, { fontSize: 18, fontFamily: Fonts.ManropeBold }]}>Usage Statistics</Text>
                <Text style={[styles.cardSubtitle, { marginBottom: 20 }]}>Monitor your current usage and limits</Text>

                <View style={styles.usageGrid}>
                    <View style={styles.usageCard}>
                        <View style={styles.usageCardHeader}>
                            <Image source={Icons.ic_folder_outline} style={[styles.usageIcon, { tintColor: '#3B82F6' }]} />
                            <Text style={styles.usageCardLabel}>Storage</Text>
                        </View>
                        <Text style={styles.usageCardValue}>
                            <Text style={{ fontFamily: Fonts.ManropeBold }}>{usage?.storage?.used_display || '291.08 KB'}</Text>
                        </Text>
                        <Text style={styles.usageCardLimit}>of {usage?.storage?.limit_display || 'N/A'}</Text>
                        <View style={styles.usageProgressContainer}>
                            <View style={[styles.usageProgressBar, { width: `${usage?.storage?.percentage || 0}%`, backgroundColor: '#3B82F6' }]} />
                        </View>
                        <Text style={styles.usageCardFooter}>{usage?.storage?.percentage || 0}% used</Text>
                    </View>

                    <View style={styles.usageCard}>
                        <View style={styles.usageCardHeader}>
                            <Image source={Icons.ic_doc} style={[styles.usageIcon, { tintColor: '#10B981' }]} />
                            <Text style={styles.usageCardLabel}>Documents</Text>
                        </View>
                        <Text style={styles.usageCardValue}>
                            <Text style={{ fontFamily: Fonts.ManropeBold }}>{usage?.documents?.used || '0'}</Text>
                        </Text>
                        <Text style={styles.usageCardLimit}>of {usage?.documents?.limit === -1 ? '∞' : usage?.documents?.limit || '10'}</Text>
                        <View style={styles.usageProgressContainer}>
                            <View style={[styles.usageProgressBar, { width: `${(usage?.documents?.used / (usage?.documents?.limit === -1 ? 10 : usage?.documents?.limit)) * 100 || 20}%`, backgroundColor: '#10B981' }]} />
                        </View>
                        <Text style={styles.usageCardFooter}>{usage?.documents?.used || 0} of {usage?.documents?.limit === -1 ? '∞' : usage?.documents?.limit || 10}</Text>
                    </View>
                </View>

                <View style={[styles.usageGrid, { marginTop: 12 }]}>
                    <View style={styles.usageCard}>
                        <View style={styles.usageCardHeader}>
                            <Image source={Icons.ic_users} style={[styles.usageIcon, { tintColor: '#8B5CF6' }]} />
                            <Text style={styles.usageCardLabel}>Contacts</Text>
                        </View>
                        <Text style={styles.usageCardValue}>
                            <Text style={{ fontFamily: Fonts.ManropeBold }}>{usage?.contacts?.used || '0'}</Text>
                        </Text>
                        <Text style={styles.usageCardLimit}>of {usage?.contacts?.limit || '10'}</Text>
                        <View style={styles.usageProgressContainer}>
                            <View style={[styles.usageProgressBar, { width: `${(usage?.contacts?.used / (usage?.contacts?.limit === -1 ? 10 : usage?.contacts?.limit)) * 100 || 20}%`, backgroundColor: '#8B5CF6' }]} />
                        </View>
                        <Text style={styles.usageCardFooter}>{usage?.contacts?.used || '0'} of {usage?.contacts?.limit || '10'}</Text>
                    </View>

                    <View style={styles.usageCard}>
                        <View style={styles.usageCardHeader}>
                            <Image source={Icons.ic_bell} style={[styles.usageIcon, { tintColor: '#F59E0B' }]} />
                            <Text style={styles.usageCardLabel}>Reminders</Text>
                        </View>
                        <Text style={styles.usageCardValue}>
                            <Text style={{ fontFamily: Fonts.ManropeBold }}>{usage?.reminders?.used || '0'}</Text>
                        </Text>
                        <Text style={styles.usageCardLimit}>of {usage?.reminders?.limit || '10'}</Text>
                        <View style={styles.usageProgressContainer}>
                            <View style={[styles.usageProgressBar, { width: `${(usage?.reminders?.used / (usage?.reminders?.limit === -1 ? 10 : usage?.reminders?.limit)) * 100 || 20}%`, backgroundColor: '#F59E0B' }]} />
                        </View>
                        <Text style={styles.usageCardFooter}>{usage?.reminders?.used || '0'} of {usage?.reminders?.limit || '10'}</Text>
                    </View>
                </View>
            </View>

            {/* Payment Information */}
            <View style={styles.card}>
                <Text style={[styles.cardTitle, { fontSize: 18, fontFamily: Fonts.ManropeBold }]}>Payment Information</Text>

                {paymentMethods.length === 0 ? (
                    <View style={styles.emptyPaymentContainer}>
                        <Text style={styles.emptyPaymentText}>No payment methods on file</Text>
                    </View>
                ) : (
                    paymentMethods.map((method, index) => (
                        <View key={method.id || index} style={[styles.infoBox, { borderColor: '#E5E7EB', marginTop: 16, flexDirection: 'column', alignItems: 'stretch' }]}>
                            {/* Top part: details */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <View style={{ width: 44, height: 44, backgroundColor: '#F3F4F6', borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}>
                                        <Ionicons name={method.type === 'card' ? "card" : "business"} size={20} color={ColorConstants.BLACK} />
                                    </View>
                                    <View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                            <Text style={[styles.detailLabel, { color: ColorConstants.BLACK, fontFamily: Fonts.ManropeBold, fontSize: 16 }]}>
                                                {method.type === 'card' ? `${method.card_brand || 'Unknown'} ending in ${method.card_last_four}` : `${method.bank_name || 'Bank Account'} ending in ${method.account_number?.slice(-4) || '****'}`}
                                            </Text>

                                        </View>
                                        <Text style={[styles.cardSubtitle, { marginBottom: 0, marginTop: 4 }]}>
                                            {method.type === 'card' ? `Expires ${method.expiry_display || `${method.card_exp_month?.toString().padStart(2, '0')}/${method.card_exp_year}`}` : 'Bank Account'}
                                        </Text>
                                    </View>

                                </View>
                            </View>
                            {method.is_default && (
                                <View style={styles.defaultView}>
                                    <Text style={styles.defaultText}>Default</Text>
                                </View>
                            )}
                            {/* Buttons part */}
                            {!method.is_default && (
                                <TouchableOpacity style={[styles.outlineBtn, { marginBottom: 8 }]} onPress={() => handleSetDefault(method.id)}>
                                    <Text style={styles.outlineBtnText}>Set Default</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={[styles.outlineBtn, { marginBottom: 8 }]} onPress={() => {
                                setSelectedPaymentMethod(method);
                                setShowAddPaymentModal(true);
                            }}>
                                <Text style={styles.outlineBtnText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.outlineBtn} onPress={() => {
                                setDeletingMethodId(method.id);
                                setShowDeleteModal(true);
                            }}>
                                <Text style={[styles.outlineBtnText, { color: ColorConstants.RED }]}>Delete</Text>
                            </TouchableOpacity>

                        </View>
                    ))
                )}

                <TouchableOpacity style={[styles.primaryBtn, { marginTop: paymentMethods.length > 0 ? 16 : 0 }]} onPress={() => {
                    setSelectedPaymentMethod(null);
                    setShowAddPaymentModal(true);
                }}>
                    <Text style={styles.primaryBtnText}>Add Payment Method</Text>
                </TouchableOpacity>
            </View>

            {/* Billing History */}
            <View style={styles.card}>
                <Text style={[styles.cardTitle, { fontSize: 18, fontFamily: Fonts.ManropeBold }]}>Billing History</Text>
                <Text style={styles.cardSubtitle}>View your past invoices and payments</Text>

                <View style={[styles.infoBox, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderColor: '#E5E7EB', marginTop: 16 }]}>
                    <View>
                        <Text style={[styles.detailLabel, { color: ColorConstants.BLACK, fontFamily: Fonts.ManropeBold }]}>Last Payment</Text>
                        <Text style={[styles.cardSubtitle, { marginBottom: 0, marginTop: 4 }]}>No payment history</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={[styles.statusBadge, { backgroundColor: '#E1FCEF' }]}>
                            <Text style={[styles.statusBadgeText, { color: '#059669' }]}>Paid</Text>
                        </View>
                    </View>

                </View>




                <AddPaymentMethodModal
                    visible={showAddPaymentModal}
                    onClose={() => setShowAddPaymentModal(false)}
                    onSuccess={fetchData}
                    paymentMethod={selectedPaymentMethod}
                />

                <DeletePaymentMethodModal
                    visible={showDeleteModal}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setDeletingMethodId(null);
                    }}
                    onDelete={handleDeletePaymentMethod}
                    isDeleting={isDeleting}
                />
            </View>


        </View>
    );
};

export default BillingTab;

const styles = StyleSheet.create({
    tabContent: {
        paddingHorizontal: 20,
    },
    card: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
    },
    billing: {
        paddingHorizontal: 20,
        paddingBottom: 0,
        paddingTop: 10
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    cardTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 18,
        color: ColorConstants.BLACK2,
    },
    cardSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 16,
    },
    planBadge: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    planBadgeText: {
        color: ColorConstants.WHITE,
        fontSize: 12,
        fontFamily: Fonts.ManropeMedium,
    },
    infoBox: {
        backgroundColor: ColorConstants.WHITE,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    infoTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    infoSubText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
        marginTop: 4,
    },
    outlineBtn: {
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    outlineBtnText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 15,
        color: ColorConstants.BLACK2,
    },
    paymentMethodCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 12,
        padding: 16,
    },
    pmInfo: {
        flex: 1,
    },
    pmTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 16,
        color: ColorConstants.BLACK2,
    },
    pmSubText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
        marginTop: 2,
    },
    defaultBadge: {
        backgroundColor: ColorConstants.GRAY3,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    defaultBadgeText: {
        fontSize: 12,
        color: ColorConstants.BLACK2,
        fontFamily: Fonts.ManropeMedium,
    },
    historyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    historyInfo: {
        flex: 1,
    },
    historyDate: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    historyAmount: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
    },
    historyActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    paidBadge: {
        backgroundColor: ColorConstants.GREEN20,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    paidBadgeText: {
        fontSize: 11,
        color: ColorConstants.GREEN2,
        fontFamily: Fonts.ManropeSemiBold,
    },
    downloadBtn: {
        backgroundColor: ColorConstants.GRAY3,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    downloadText: {
        fontSize: 11,
        color: ColorConstants.BLACK2,
        fontFamily: Fonts.ManropeMedium,
    },
    sectionHeader: {
        marginTop: 8,
        marginBottom: 16,
    },
    sectionTitleHeader: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 20,
        color: ColorConstants.BLACK2,
    },
    sectionSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
        marginTop: 4,
    },
    planCard: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
    },
    currentPlanCard: {
        borderColor: ColorConstants.PRIMARY_BROWN,
        backgroundColor: '#FDF8F8',
    },
    planName: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 18,
        color: ColorConstants.BLACK2,
        marginBottom: 8,
    },
    planPriceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 20,
    },
    planPrice: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 28,
        color: ColorConstants.BLACK2,
    },
    planPeriod: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
        marginLeft: 4,
    },
    featuresContainer: {
        gap: 12,
        marginBottom: 24,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    featureIcon: {
        width: 14,
        height: 14,
        tintColor: ColorConstants.PRIMARY_BROWN,
        marginRight: 10,
    },
    featureText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    planBtn: {
        paddingVertical: 8,
        borderRadius: 10,
        alignItems: 'center',
    },
    choosePlanBtn: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
    },
    currentPlanBtn: {
        backgroundColor: ColorConstants.WHITE,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
    },
    planBtnText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
    },
    choosePlanBtnText: {
        color: ColorConstants.WHITE,
    },
    currentPlanBtnText: {
        color: ColorConstants.GRAY,
    },
    usageContainer: {
        marginBottom: 20,
    },
    usageTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 16,
        color: ColorConstants.BLACK2,
        marginBottom: 12,
    },
    usageItem: {
        marginBottom: 12,
    },
    usageInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    usageLabel: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 13,
        color: ColorConstants.DARK_CYAN,
    },
    usageValue: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 13,
        color: ColorConstants.BLACK2,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: ColorConstants.GRAY3,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: ColorConstants.PRIMARY_BROWN,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 24,
        padding: 4,
        marginBottom: 24,
        width: '100%',
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 20,
    },
    toggleBtnActive: {
        backgroundColor: ColorConstants.WHITE,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    toggleBtnText: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
    },
    toggleBtnTextActive: {
        color: ColorConstants.BLACK2,
    },
    yearlyLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    discountBadge: {
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    discountBadgeText: {
        color: '#059669',
        fontSize: 10,
        fontFamily: Fonts.ManropeBold,
    },
    planCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    savingsBadge: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    savingsBadgeText: {
        color: '#92400E',
        fontSize: 11,
        fontFamily: Fonts.ManropeSemiBold,
    },
    // New Styles
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
    },
    detailLabel: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
    },
    detailValue: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 14,
        color: ColorConstants.BLACK,
        textAlign: 'right',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    statusBadgeText: {
        fontSize: 12,
        fontFamily: Fonts.ManropeBold,
    },
    defaultView: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        alignSelf: 'flex-end',
        marginTop: -10,
        marginBottom: 10
    },
    defaultText: {
        color: '#16A34A', fontSize: 8, fontFamily: Fonts.ManropeMedium
    },
    usageGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    usageCard: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
    },
    usageCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    usageIcon: {
        width: 18,
        height: 20,
        resizeMode: 'contain',
    },
    usageCardLabel: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 14,
        color: ColorConstants.BLACK,
    },
    usageCardValue: {
        fontSize: 18,
        color: ColorConstants.BLACK,
    },
    usageCardLimit: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 12,
    },
    usageProgressContainer: {
        height: 6,
        backgroundColor: '#F3F4F6',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 8,
    },
    usageProgressBar: {
        height: '100%',
        borderRadius: 3,
    },
    usageCardFooter: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 11,
        color: ColorConstants.DARK_CYAN,
    },
    emptyPaymentContainer: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderStyle: 'dashed',
        borderRadius: 12,
        paddingVertical: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        marginBottom: 20
    },
    emptyPaymentText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 15,
        color: ColorConstants.DARK_CYAN,
    },
    primaryBtn: {
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 16,
        backgroundColor: ColorConstants.PRIMARY_BROWN
    },
    primaryBtnText: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 16,
        color: ColorConstants.WHITE,
    },
});