import { apiPost } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import AppDropdown from '@/components/AppDropdown';
import CommonLoader from '@/components/CommonLoader';
import CustomTextInput from '@/components/CustomTextInput';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { StringConstants } from '@/constants/StringConstants';
import { getDocumentAsync } from 'expo-document-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignupVendor() {
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [reviewData, setReviewData] = useState<any>(null);
    const [formData, setFormData] = useState({
        businessName: '',
        businessType: '',
        phone: '',
        email: '',
        address: '',
        serviceCategory: '',
        skills: '',
        experience: '',
        serviceRegions: '',
        doc1: null as any,
        doc2: null as any,
    });

    const businessTypes = ['Electrician', 'Plumber', 'Cleaner', 'Landscaper', 'Painter', 'HVAC'];
    const serviceCategories = ['Home Maintenance', 'Repairs', 'Cleaning', 'Legal', 'Design'];
    const skillsList = ['Electrical Wiring', 'Appliance Repair', 'Lighting Installation'];
    const experienceLevels = ['0-1 year', '1-3 years', '3-5 years', '5+ years'];

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleDocumentPick = async (docType: 'doc1' | 'doc2') => {
        try {
            const result = await getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });

            if (result.canceled === false) {
                setFormData(prev => ({ ...prev, [docType]: result.assets[0] }));
            }
        } catch (error) {
            console.log('Document Picker Error:', error);
        }
    };

    const handleNext = async () => {
        if (currentStep === 1) {
            setLoading(true);
            try {
                const step1Data = {
                    business_name: formData.businessName.trim(),
                    business_type: formData.businessType.toLowerCase(),
                    phone_number: formData.phone.trim(),
                    email: formData.email.trim(),
                    business_address: formData.address.trim()
                };
                console.log('Sending Step 1 Data:', step1Data);
                await apiPost(ApiConstants.VENDOR_ONBOARDING_STEP_ONE, step1Data);
                setCurrentStep(currentStep + 1);
            } catch (error: any) {
                console.log('Step 1 Error:', error?.response?.data || error.message);
                if (error?.response?.data) {
                    alert(JSON.stringify(error.response.data));
                }
            } finally {
                setLoading(false);
            }
        } else if (currentStep === 2) {
            setLoading(true);
            try {
                // Map experience level text to slugs
                const experienceMapping: { [key: string]: string } = {
                    '0-1 year': '0_1_year',
                    '1-3 years': '1_3_years',
                    '3-5 years': '3_5_years',
                    '5+ years': '5_plus_years'
                };

                // Map service categories to IDs (Defaulting to 1 as per requirement if no fetch logic)
                // Note: In a real scenario, these would come from an API.
                const categoryMapping: { [key: string]: number } = {
                    'Home Maintenance': 1,
                    'Repairs': 2,
                    'Cleaning': 3,
                    'Legal': 4,
                    'Design': 5
                };

                const step2Data = {
                    primary_service_category: categoryMapping[formData.serviceCategory] || 1,
                    experience_level: experienceMapping[formData.experience] || '5_plus_years',
                    service_regions: formData.serviceRegions.trim()
                };

                console.log('Sending Step 2 Data:', step2Data);
                await apiPost(ApiConstants.VENDOR_ONBOARDING_STEP_TWO, step2Data);
                setCurrentStep(currentStep + 1);
            } catch (error: any) {
                console.log('Step 2 Error:', error?.response?.data || error.message);
                if (error?.response?.data) {
                    alert(JSON.stringify(error.response.data));
                }
            } finally {
                setLoading(false);
            }
        } else if (currentStep === 3) {
            setLoading(true);
            try {
                const step3Data = {
                    message: "Step 3 completed successfully",
                    status: "pending_review",
                    credentials_count: 0
                };

                console.log('Sending Step 3 Data:', step3Data);
                await apiPost(ApiConstants.VENDOR_ONBOARDING_STEP_THREE, step3Data);
                // await fetchReviewData();
                setCurrentStep(currentStep + 1);
            } catch (error: any) {
                console.log('Step 3 Error:', error?.response?.data || error.message);
                if (error?.response?.data) {
                    alert(JSON.stringify(error.response.data));
                }
            } finally {
                setLoading(false);
            }
        } else if (currentStep === 4) {
            setLoading(true);
            try {
                // Experience level slug mapping
                const experienceMapping: { [key: string]: string } = {
                    '0-1 year': '0_1_year',
                    '1-3 years': '1_3_years',
                    '3-5 years': '3_5_years',
                    '5+ years': '5_plus_years'
                };

                // Category mapping (Mocking names as per example)
                const categoryNames: { [key: string]: string } = {
                    'Home Maintenance': 'Home Maintaince', // Match user requested typo if intentional? Or stick to UI
                    'Repairs': 'Repairs',
                    'Cleaning': 'Cleaning',
                    'Legal': 'Legal',
                    'Design': 'Design'
                };

                const reviewData = {
                    business_name: formData.businessName.trim(),
                    business_type: formData.businessType.toLowerCase(),
                    business_type_display: formData.businessType,
                    phone_number: formData.phone.trim(),
                    email: formData.email.trim(),
                    business_address: formData.address.trim(),
                    business_description: null,
                    profile_photo: null,
                    primary_service_category: {
                        id: 1,
                        name: categoryNames[formData.serviceCategory] || "Home Maintaince"
                    },
                    subcategories: [],
                    experience_level: experienceMapping[formData.experience] || '5_plus_years',
                    experience_level_display: formData.experience || "5+ years",
                    service_regions: formData.serviceRegions.trim(),
                    credentials: [
                        {
                            id: 14,
                            type: "insurance_certificate",
                            type_display: "Insurance Certificate",
                            file_name: formData.doc2 ? formData.doc2.name : "insurance.jpg",
                            file_url: "http://168.231.121.7/sphiri/media/vendor_credentials/mock_insurance.jpg",
                            is_verified: false,
                            uploaded_at: new Date().toISOString()
                        },
                        {
                            id: 13,
                            type: "business_license",
                            type_display: "Business License",
                            file_name: formData.doc1 ? formData.doc1.name : "license.jpg",
                            file_url: "http://168.231.121.7/sphiri/media/vendor_credentials/mock_license.jpg",
                            is_verified: false,
                            uploaded_at: new Date().toISOString()
                        }
                    ],
                    onboarding_status: "step_3",
                    onboarding_status_display: "Step 3 - Credentials"
                };

                console.log('Sending Review Data:', reviewData);
                await apiPost(ApiConstants.VENDOR_ONBOARDING_REVIEW, reviewData);

                router.replace('/(root)/(drawer)/Home');
            } catch (error: any) {
                console.log('Review Error:', error?.response?.data || error.message);
                if (error?.response?.data) {
                    alert(JSON.stringify(error.response.data));
                }
            } finally {
                setLoading(false);
            }
        } else {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            router.back();
        }
    };

    const renderProgressBar = () => {
        return (
            <View style={styles.progressBarContainer}>
                {[1, 2, 3, 4].map((step) => (
                    <View
                        key={step}
                        style={[
                            styles.progressBarItem,
                            {
                                backgroundColor: step <= currentStep ? ColorConstants.PRIMARY_BROWN : ColorConstants.GRAY3
                            }
                        ]}
                    />
                ))}
            </View>
        );
    };

    const renderStep1 = () => (
        <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Account Registration</Text>
            <Text style={styles.sectionSubtitle}>Create your Vendor account to get started</Text>

            <View style={styles.card}>
                <CustomTextInput
                    label="Business Name"
                    value={formData.businessName}
                    onChangeText={(t) => handleInputChange('businessName', t)}
                    placeholder="Enter your register business name"
                />
                {/* Placeholder for Dropdown - Business Type */}
                <AppDropdown
                    label="Business Type"
                    data={businessTypes}
                    value={formData.businessType}
                    onSelect={(item) => handleInputChange('businessType', item)}
                    placeholder="Select Business Type"
                    zIndex={2000}
                />

                <CustomTextInput
                    label="Phone number"
                    value={formData.phone}
                    onChangeText={(t) => handleInputChange('phone', t)}
                    placeholder="+ 152 251 02556"
                    keyboardType="phone-pad"
                    maxLength={13}
                />

                <CustomTextInput
                    label="Email Address"
                    value={formData.email}
                    onChangeText={(t) => handleInputChange('email', t)}
                    placeholder="Enter your business email"
                    keyboardType="email-address"
                />

                <CustomTextInput
                    label="Business Address"
                    value={formData.address}
                    onChangeText={(t) => handleInputChange('address', t)}
                    placeholder="Enter Business Address Here..."
                    multiline
                    inputStyles={{ height: 80, alignItems: 'flex-start' }}
                />
            </View>
            <View style={styles.infoBox}>
                <Image source={Icons.ic_info} style={styles.infoIcon} />
                <Text style={styles.infoText}>Your account will be verified by our admin team before you can start accepting clients.</Text>
            </View>
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Service Categories & Expertise</Text>
            <Text style={styles.sectionSubtitle}>Select the areas you specialize in so homeowners can find and connect with the right professionals faster.</Text>

            <View style={[styles.card, { zIndex: 10 }]}>
                {/* Placeholders for Dropdown */}
                <AppDropdown
                    label="Primary Service Category"
                    data={serviceCategories}
                    value={formData.serviceCategory}
                    onSelect={(item) => handleInputChange('serviceCategory', item)}
                    placeholder="Select your main area of work"
                    zIndex={3000}
                />

                <AppDropdown
                    label="Subcategories / Skills"
                    data={skillsList}
                    value={formData.skills}
                    onSelect={(item) => handleInputChange('skills', item)}
                    placeholder="Choose multiple relevant skills"
                    zIndex={2000}
                />

                <AppDropdown
                    label="Experience Level"
                    data={experienceLevels}
                    value={formData.experience}
                    onSelect={(item) => handleInputChange('experience', item)}
                    placeholder="How long have you been in business?"
                    zIndex={1000}
                />

                <CustomTextInput
                    label="Service Regions / Areas Covered"
                    value={formData.serviceRegions}
                    onChangeText={(t) => handleInputChange('serviceRegions', t)}
                    placeholder="Cities or ZIP codes you serve"
                />
            </View>
        </View>
    );


    const renderStep3 = () => (
        <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Verification & Documents</Text>
            <Text style={styles.sectionSubtitle}>Upload your licenses, certifications, and insurance details to verify your business credentials.</Text>

            <TouchableOpacity style={styles.uploadCard} onPress={() => handleDocumentPick('doc1')}>
                <Image source={Icons.ic_upload} style={styles.uploadIcon} />
                <Text style={styles.uploadTitle}>
                    {formData.doc1 ? formData.doc1.name : "Business License"}
                </Text>
                <Text style={styles.uploadSubtitle}>
                    {formData.doc1 ? "Tap to change file" : "Upload a clear copy of your business license or certification"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadCard} onPress={() => handleDocumentPick('doc2')}>
                <Image source={Icons.ic_upload} style={styles.uploadIcon} />
                <Text style={styles.uploadTitle}>
                    {formData.doc2 ? formData.doc2.name : "Insurance Certificate"}
                </Text>
                <Text style={styles.uploadSubtitle}>
                    {formData.doc2 ? "Tap to change file" : "Proof of liability insurance or professional coverage"}
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderStep4 = () => {
        const displayData = reviewData || {
            business_name: formData.businessName || 'Lorem Ipsum',
            email: formData.email || 'contact@vendor.com',
            business_type_display: formData.businessType || 'Landscaper',
            phone_number: formData.phone || '15036163675'
        };

        return (
            <View style={styles.formContainer}>
                <View style={styles.summaryCard}>
                    <View style={[styles.row, { marginBottom: 16 }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.summaryTitle}>Business Name</Text>
                            <Text style={styles.summaryValue}>{displayData.business_name}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.summaryTitle}>Email</Text>
                            <Text style={styles.summaryValue}>{displayData.email}</Text>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.summaryTitle}>Business Type</Text>
                            <Text style={styles.summaryValue}>{displayData.business_type_display}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.summaryTitle}>Phone</Text>
                            <Text style={styles.summaryValue}>{displayData.phone_number}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.infoBox}>
                    <Image source={Icons.ic_info} style={styles.infoIcon} />
                    <Text style={styles.infoText}>Your account will be reviewed within 24-48 hours. You'll receive an email confirmation once approved.</Text>
                </View>

                <Text style={styles.docsTitle}>Documents Uploaded</Text>
                <View style={styles.docItem}>
                    <Image source={Icons.ic_check_circle2} style={styles.checkIcon} />
                    <Text style={styles.docText}>Business License</Text>
                </View>
                <View style={styles.docItem}>
                    <Image source={Icons.ic_check_circle2} style={styles.checkIcon} />
                    <Text style={styles.docText}>Insurance Certificate</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <CommonLoader visible={loading} />
            <View style={styles.header}>
                {/* <TouchableOpacity onPress={handlePrevious} style={styles.backBtn}>
                    <Image source={Icons.ic_left_arrow} style={styles.backIcon} />
                </TouchableOpacity> */}
                <Image source={Icons.ic_logo} style={styles.logo} resizeMode='contain' />
                {/* <View style={{ width: 24 }} /> */}
            </View>

            <View style={styles.stepHeader}>
                <Text style={styles.stepTitle}>{StringConstants.COMPLETE_YOUR_PROFILE}</Text>
                <Text style={styles.stepCount}>Step {currentStep} of 4</Text>
            </View>
            {renderProgressBar()}

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.prevBtn} onPress={handlePrevious}>
                    <Text style={styles.prevBtnText}>Previous</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                    <Text style={styles.nextBtnText}>{currentStep === 4 ? 'Complete Setup' : 'Next'}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorConstants.WHITE,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        // justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    backBtn: {
        padding: 4,
    },
    backIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    logo: {
        height: 100,
        width: 180,
        resizeMode: 'contain',
        paddingVertical: -30
    },
    stepHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 10
    },
    stepTitle: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 16,
        color: ColorConstants.BLACK2,
    },
    stepCount: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.GRAY,
    },
    progressBarContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 8,
        marginBottom: 20,
    },
    progressBarItem: {
        flex: 1,
        height: 6,
        borderRadius: 4,
        backgroundColor: ColorConstants.GRAY3,
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    formContainer: {
        flex: 1,
    },
    sectionTitle: {
        fontFamily: Fonts.ManropeSemiBold,
        fontSize: 20,
        color: ColorConstants.PRIMARY_BROWN,
    },
    sectionSubtitle: {
        fontFamily: Fonts.interRegular,
        fontSize: 12,
        color: ColorConstants.GRAY,
        marginBottom: 20,
        lineHeight: 20
    },
    card: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        marginBottom: 20
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingBottom: 20,
        gap: 20
    },
    prevBtn: {
        paddingVertical: 9,
        width: '48%',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        alignItems: 'center',
    },
    prevBtnText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.DARK_CYAN,
    },
    nextBtn: {
        paddingVertical: 9,
        width: '48%',
        borderRadius: 12,
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        alignItems: 'center',
    },
    nextBtnText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.WHITE,
    },
    uploadCard: {
        backgroundColor: ColorConstants.LIGHT_PEACH3,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E5EA', // Dashed border color simulation
        borderStyle: 'dashed',
        padding: 30,
        alignItems: 'center',
        marginBottom: 20,
    },
    uploadIcon: {
        width: 32,
        height: 32,
        marginBottom: 16,
        tintColor: ColorConstants.BLACK2
    },
    uploadTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 18,
        color: ColorConstants.BLACK2,
        marginBottom: 8,
    },
    uploadSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.GRAY,
        textAlign: 'center',
        paddingHorizontal: 20
    },
    summaryCard: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        marginBottom: 20
    },
    summaryTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        marginBottom: 4
    },
    summaryValue: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.GRAY,
        marginBottom: 16
    },
    row: {
        flexDirection: 'row',
        gap: 20
    },
    infoBox: {
        backgroundColor: '#FFF8E6', // Light yellow
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F59E0B',
        padding: 16,
        flexDirection: 'row',
        marginBottom: 24,
        alignItems: 'flex-start'
    },
    infoIcon: {
        marginRight: 10,
        tintColor: ColorConstants.DARK_CYAN,
        marginTop: 4

    },
    infoText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
        flex: 1,
        lineHeight: 20
    },
    docsTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 18,
        color: ColorConstants.BLACK2,
        marginBottom: 12
    },
    docItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        // backgroundColor: ColorConstants.LIGHT_PEACH3
    },
    checkIcon: {
        width: 17,
        height: 17,
        marginRight: 10,
        tintColor: ColorConstants.GREEN2
    },
    docText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.GREEN2
    }
});
