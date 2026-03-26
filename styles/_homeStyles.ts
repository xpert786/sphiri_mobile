import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorConstants.WHITE,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    backIcon: {
        paddingVertical: 20,
        paddingRight: 20
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    profileImage: {
        width: 24,
        height: 24,
        borderRadius: 12,
    },
    welcomeContainer: {
        marginTop: 0,
    },
    welcomeText: {
        fontFamily: 'SFPro-Medium',
        fontSize: 18,
        color: ColorConstants.PRIMARY_BROWN,
        marginBottom: 4,
    },
    subtitle: {
        fontFamily: 'Inter-Regular',
        fontSize: 12,
        color: ColorConstants.GRAY,
    },
    quickActionsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 10,
        gap: 6,
    },
    vendorActionsContainer: {
        paddingBottom: 10,
        gap: 6,
    },
    quickActions: {
        fontFamily: 'SFPro-Medium',
        fontSize: 14,
        color: ColorConstants.BLACK,
        marginLeft: 20,
        marginBottom: 10
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        minHeight: 34
    },
    searchIcon: {
        marginRight: 10,
        height: 12,
        width: 12
    },
    searchInput: {
        flex: 1,
        fontFamily: 'Inter-Regular',
        fontSize: 11,
        color: ColorConstants.BLACK,
    },
    searchFilterWrapper: {
        padding: 10,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        marginHorizontal: 20,
        borderRadius: 10,
        marginBottom: 15
    },
    dropdownContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 80,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: ColorConstants.GRAY3,
        minHeight: 34,
        alignItems: 'center',
        paddingHorizontal: 10,
        marginRight: 10
    },
    dropdownText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
    },
    quickActionSelected: {
        backgroundColor: '#9B6359',
        borderColor: '#9B6359',
    },

    quickActionTextSelected: {
        color: ColorConstants.WHITE,
    },

    plusIconSelected: {
        tintColor: ColorConstants.WHITE, // agar PNG/SVG tint support karta ho
    },

    quickAction: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 8,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10
    },
    plusIcon: {
        width: 8,
        height: 8,
        tintColor: ColorConstants.GRAY,
    },
    quickActionText: {
        fontFamily: 'Inter-Regular',
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
        textAlign: 'center',
        flexShrink: 1,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 20,

    },
    vendorCards: {
        width: '48%',
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: ColorConstants.LIGHT_PEACH3,
        borderRadius: 12,
        backgroundColor: ColorConstants.PRIMARY_10
    },
    statCard: {
        width: '48%', // Adjusted to fit 2 per row better with gap
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        padding: 16,
        marginBottom: 0, // Handled by gap
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    statCard2: {
        width: '31%', // Adjusted to fit 2 per row better with gap
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    statIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: ColorConstants.PRIMARY_BROWN, // Brownish bg for icon
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5
    },
    actionLabel: {
        fontFamily: 'SFPro-Regular',
        fontSize: 12,
        color: ColorConstants.GRAY,
        textAlign: 'center',
    },
    statIcon: {
        width: 16,
        height: 16,
        tintColor: ColorConstants.WHITE,
    },
    actionIcon: {
        width: 14,
        height: 14,
        tintColor: ColorConstants.DARK_CYAN,
        resizeMode: 'contain',
        marginBottom: 5
    },
    arrowIcon: { // For the tilted arrow in stats
        width: 16,
        height: 16,
        tintColor: ColorConstants.GRAY2,
    },
    statCount: {
        fontFamily: 'Inter-Medium', // Use Bold
        fontSize: 14,
        color: ColorConstants.BLACK, // Titles are dark
        marginBottom: 4,
    },
    statLabel: {
        fontFamily: 'Inter-Regular',
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 2,
    },
    statSubLabel: {
        fontFamily: 'Inter-Regular',
        fontSize: 12,
        color: ColorConstants.DARK_CYAN, // Maybe slightly different? Image shows "+2 this month" maybe green/gray?
    },
    profileContainer: {
        flex: 1,
        marginHorizontal: 20,
    },
    historyContainer: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        gap: 12,
        alignItems: 'center',
        backgroundColor: ColorConstants.WHITE,

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },

    name: {
        fontFamily: Fonts.interSemiBold,
        fontSize: 13,
        color: ColorConstants.DARK_CYAN,
    },
    date: {
        fontFamily: Fonts.interRegular,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 5
    },
    activeClientsView: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        borderRadius: 2,
        alignSelf: 'flex-start'
    },
    activeClient: {
        fontFamily: 'Inter-Regular',
        fontSize: 12,
        color: ColorConstants.WHITE
    },

    documentsList: {
        paddingHorizontal: 15,
        marginHorizontal: 20,
        paddingTop: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        marginBottom: 20
    },
    section: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 12,
        marginBottom: 16,
        marginHorizontal: 20
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    titleRow: {
        justifyContent: 'center',    // 👈 centers text vertically
    },
    viewAllText: {
        fontFamily: 'Inter-Medium',
        fontSize: 12,
        color: ColorConstants.PRIMARY_BROWN,
    },
    sectionTitle: {
        fontFamily: 'SFPro-Medium',
        fontSize: 16,
        color: ColorConstants.BLACK,
        marginBottom: 12,
    },
    alertCard: {
        padding: 4,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    alertText: {
        fontFamily: 'Inter-Regular',
        fontSize: 11,
        color: ColorConstants.GRAY,
        flex: 1,
        marginRight: 10,
    },
    takeActionButton: {
        // Looks like text link in screenshot "Take Action"
        backgroundColor: 'transparent',
        paddingHorizontal: 0,
        paddingVertical: 0,
    },
    takeActionText: {
        fontFamily: 'Inter-Medium',
        fontSize: 9,
        color: ColorConstants.DARK_CYAN, // Link color
        marginRight: 0,
    },
    divider: {
        height: 1,
        backgroundColor: ColorConstants.GRAY3,
        marginBottom: 8,
    },

    alertDivider: {
        borderBottomWidth: 1,
        borderBottomColor: ColorConstants.GRAY3,
        paddingBottom: 6,
    },
    reminderCard: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: ColorConstants.GRAY3,
    },
    noDivider: {
        borderBottomWidth: 0,
        paddingBottom: 0,
    },

    reminderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    reminderTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        flexWrap: 'wrap',
    },
    reminderTitle: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 10,
        color: ColorConstants.DARK_CYAN,
        marginRight: 8,
    },
    priorityBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    priorityHigh: {
        backgroundColor: ColorConstants.RED10,
    },
    priorityMedium: {
        backgroundColor: ColorConstants.ORANGE10,
    },

    priorityText: {
        fontFamily: 'Inter-Medium',
        fontSize: 9, // Small
        color: ColorConstants.DARK_CYAN,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    rescheduleButton: {
        borderWidth: 1,
        borderColor: ColorConstants.PRIMARY_BROWN,
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    rescheduleText: {
        fontFamily: 'Inter-Regular',
        fontSize: 10,
        color: ColorConstants.PRIMARY_BROWN,
    },
    completeButton: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 5, // Match height
    },
    completeText: {
        fontFamily: 'Inter-Regular',
        fontSize: 10,
        color: ColorConstants.WHITE,
    },
    reminderProvider: {
        fontFamily: 'Inter-Regular',
        fontSize: 10,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 8,
    },
    reminderFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    reminderTime: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    timeText: {
        fontFamily: 'Inter-Regular',
        fontSize: 9,
        color: ColorConstants.GRAY,
        marginLeft: 3
    },
    reminderCategory: {
        fontFamily: 'Inter-Regular',
        fontSize: 8,
        color: ColorConstants.GRAY,
        backgroundColor: ColorConstants.GRAY_SHADE,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    activityCard: {
        flexDirection: 'row',
        backgroundColor: ColorConstants.WHITE,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: ColorConstants.GRAY3,
        marginBottom: 0,
        borderWidth: 0,
        alignItems: 'flex-start',
    },
    activityIcon: { // Small icon content? No, images shows text list mostly
        width: 0, // Hidden in new design?
        height: 0, // The image shows just text mainly... wait.
        display: 'none',
    },
    activityContent: {
        flex: 1,
    },
    activityAction: {
        fontFamily: 'Inter-SemiBold', // Title
        fontSize: 11,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 2,
    },
    activityDetail: {
        fontFamily: 'Inter-Regular', // Subtitle
        fontSize: 11,
        color: ColorConstants.DARK_CYAN,
    },
    activityTime: {
        fontFamily: 'Inter-Regular',
        fontSize: 9,
        color: ColorConstants.LIGHT_GREY,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontFamily: 'Inter-Regular',
        fontSize: 12,
        color: ColorConstants.GRAY,
        textAlign: 'center',
    },
    suggestionContent: {
        flex: 1,
    },
    iconSmart: {
        width: 30,
        height: 30,
        backgroundColor: ColorConstants.REDDISH_BROWN,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },

});
