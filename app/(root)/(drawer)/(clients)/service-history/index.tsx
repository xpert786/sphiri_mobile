import { apiGet } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import Header from '@/components/Header';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import InvoiceModal from '@/modals/InvoiceModal';
import ServiceReportModal from '@/modals/ServiceReportModal';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ServiceRecord {
    id: string;
    title: string;
    price: string;
    date: string;
    status: 'Completed' | 'In Progress' | 'Scheduled';
    notes: string;
}

const ServiceCard = ({
    item,
    onViewInvoice,
    onViewReport
}: {
    item: ServiceRecord;
    onViewInvoice: () => void;
    onViewReport: () => void;
}) => {

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <View style={styles.dateRow}>
                        <Image source={Icons.ic_calendar_outline} style={styles.calendarIcon} />
                        <Text style={styles.dateText}>{item.date}</Text>
                    </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.priceText}>${item.price}</Text>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.notesSection}>
                <Text style={styles.sectionLabel}>Notes:</Text>
                <Text style={styles.notesText}>{item.notes}</Text>
            </View>

            <View style={styles.cardActions}>
                <TouchableOpacity style={styles.invoiceBtn} onPress={onViewInvoice}>
                    <Text style={styles.invoiceBtnText}>View Invoice</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.reportBtn} onPress={onViewReport}>
                    <Text style={styles.reportBtnText}>View Report</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default function ServiceHistory() {
    const { id } = useLocalSearchParams();
    const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [services, setServices] = useState<ServiceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchServices();
        } else {
            setLoading(false);
        }
    }, [id]);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const clientId = Array.isArray(id) ? id[0] : id;
            if (!clientId) return;

            const url = `${ApiConstants.VENDOR_CLIENT_SERVICES}${clientId}/services/`;
            const response = await apiGet(url);
            if (response.data && response.data.services) {
                setServices(response.data.services);
            }
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <Header
                title="Clients"
                subtitle="Manage your client relationships"
                showBackArrow={true}
                tapOnBack={() => router.back()}
            />

            <View style={styles.subHeader}>
                <Text style={styles.pageTitle}>Service History</Text>
                <Text style={styles.pageSubtitle}>All services for John Smith</Text>
            </View>



            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {loading ? (
                    <ActivityIndicator size="large" color={ColorConstants.PRIMARY_BROWN} style={{ marginTop: 20 }} />
                ) : (
                    services.map((item) => (
                        <ServiceCard
                            key={item.id}
                            item={item}
                            onViewInvoice={() => setInvoiceModalVisible(true)}
                            onViewReport={() => setReportModalVisible(true)}
                        />
                    ))
                )}
                {!loading && services.length === 0 && (
                    <Text style={{ textAlign: 'center', marginTop: 20, color: ColorConstants.GRAY }}>
                        No service history found for this category.
                    </Text>
                )}
            </ScrollView>

            <InvoiceModal
                visible={invoiceModalVisible}
                onClose={() => setInvoiceModalVisible(false)}
            />

            <ServiceReportModal
                visible={reportModalVisible}
                onClose={() => setReportModalVisible(false)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorConstants.WHITE,
    },
    subHeader: {
        paddingHorizontal: 20,
        marginTop: 10,
        marginBottom: 10,
    },
    pageTitle: {
        fontSize: 18,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.PRIMARY_BROWN,
    },
    pageSubtitle: {
        fontSize: 12,
        fontFamily: Fonts.interRegular,
        color: ColorConstants.GRAY,
        marginTop: 2,
    },

    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        padding: 20,
        marginBottom: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
        paddingBottom: 12,
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.BLACK2,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    calendarIcon: {
        width: 14,
        height: 14,
        tintColor: ColorConstants.DARK_CYAN,
        marginRight: 6,
    },
    dateText: {
        fontSize: 14,
        fontFamily: Fonts.mulishRegular,
        color: ColorConstants.DARK_CYAN,
    },
    priceText: {
        fontSize: 18,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.BLACK2,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 15,
        marginTop: 8,
        backgroundColor: ColorConstants.GREEN2,
    },
    statusText: {
        fontSize: 12,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.WHITE,
    },
    notesSection: {
        marginBottom: 15,
    },
    sectionLabel: {
        fontSize: 16,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.BLACK2,
        marginBottom: 6,
    },
    notesText: {
        fontSize: 15,
        fontFamily: Fonts.mulishRegular,
        color: ColorConstants.DARK_CYAN,
        lineHeight: 22,
    },
    cardActions: {
        flexDirection: 'row',
        gap: 15,
    },
    invoiceBtn: {
        flex: 1,
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        paddingVertical: 7,
        borderRadius: 10,
        alignItems: 'center',
    },
    invoiceBtnText: {
        fontSize: 15,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.WHITE,
    },
    reportBtn: {
        flex: 1,
        backgroundColor: ColorConstants.WHITE,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        paddingVertical: 7,
        borderRadius: 10,
        alignItems: 'center',
    },
    reportBtnText: {
        fontSize: 15,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.DARK_CYAN,
    },
});
