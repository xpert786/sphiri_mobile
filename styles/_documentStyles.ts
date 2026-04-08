import { ColorConstants } from "@/constants/ColorConstants";
import { Fonts } from "@/constants/Fonts";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorConstants.WHITE,
    },
    // Tabs
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#F3E5E5',
        borderRadius: 8,
        padding: 3,
        marginHorizontal: 20,
        marginBottom: 16,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 5,
        alignItems: 'center',
        borderRadius: 6,
    },
    tabButtonActive: {
        backgroundColor: ColorConstants.WHITE,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tabText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },

    // Search & Inputs
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 44, // Increased height for better alignment
        backgroundColor: ColorConstants.WHITE,
        width: '60%'
    },
    searchAndShowRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 12,
        gap: 10,
    },
    showLabel: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: '#4B5563',
    },
    showDropdownTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1.5,
        borderColor: ColorConstants.GRAY,
        borderRadius: 7,
        paddingHorizontal: 10,
        height: 38,
        backgroundColor: ColorConstants.WHITE,
        minWidth: 70,
    },
    showDropdownText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 13,
        color: ColorConstants.BLACK,
        marginRight: 4,
    },
    showDropdownArrow: {
        width: 12,
        height: 12,
        tintColor: ColorConstants.BLACK,
        resizeMode: 'contain',
    },
    itemsDropdownOverlay: {
        position: 'absolute',
        top: 48,
        right: 0,
        backgroundColor: '#EFEBE7', // Matching the screenshot background if possible, or stay with light gray
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        width: 80,
        zIndex: 3000,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        paddingVertical: 5,
    },
    itemsDropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // Center everything
        paddingVertical: 4, // Reduced vertical gap
        paddingHorizontal: 12,
        position: 'relative', // For absolute child
    },
    itemsDropdownItemText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK,
        textAlign: 'center',
    },
    checkIcon: {
        position: 'absolute',
        left: 10,
        width: 14,
        height: 14,
        tintColor: ColorConstants.BLACK,
        resizeMode: 'contain',
    },
    searchIcon: {
        width: 14,
        height: 14,
        tintColor: ColorConstants.BLACK2,
        resizeMode: 'contain',
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.BLACK,
        height: '100%',
    },

    // Dropdowns
    dropdownContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 36,
        backgroundColor: ColorConstants.WHITE,
        width: 146,
    },
    dropdownText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 13,
        color: ColorConstants.DARK_CYAN,
    },
    dropdownArrow: {
        width: 10,
        height: 10,
        resizeMode: 'contain',
    },

    // Custom Dropdown Card (Overlay)
    customDropdownCard: {
        position: 'absolute',
        top: 40, // Below trigger
        left: 0,
        // right: 0, // Don't span full width if trigger is small? actually screenshot shows it spans width of container maybe
        // But for "All Documents" (grid), it's wide. For "Folder" it's wide too.
        minWidth: 300,
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 16,
        zIndex: 2000,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    dropdownHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    dropdownHeaderText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
    },
    dropdownSeparator: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginBottom: 12,
    },
    checkboxGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        rowGap: 12,
    },
    checkboxList: {
        gap: 12,
    },
    checkboxItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkboxBox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: ColorConstants.PRIMARY_BROWN, // or different color
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    tickIcon: {
        width: 17,
        height: 17,
        resizeMode: 'contain',
    },
    checkboxLabel: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 13,
        color: '#4B5563',
    },


    // Filters Row
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 20,
        gap: 12,
    },

    // Documents List
    documentsList: {
        paddingHorizontal: 20,
        borderRadius: 10,

    },

    // --- Folder Management Styles ---
    folderContainer: {
        flex: 1,
    },
    mainFolderCard: {
        marginHorizontal: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingVertical: 10,
        backgroundColor: ColorConstants.WHITE,
    },
    folderWrapper: {
        // overflow: 'hidden', // Removed to allow popup menu to overflow
    },
    folderHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingRight: 16,
    },
    folderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    chevron: {
        width: 10,
        height: 10,
        tintColor: '#666',
        resizeMode: 'contain',
        marginRight: 10,
    },
    folderIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
        marginRight: 10,
    },
    folderTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK,
        marginBottom: 2,
        maxWidth: 200,
    },
    folderSubtitle: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 11,
        color: '#666',
        marginRight: 65,
    },
    folderRight: {
        alignItems: 'flex-end',
    },
    docCountBadge: {
        backgroundColor: '#E5E7EB',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    docCountText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 10,
        color: '#4B5563',
    },
    folderContent: {
        // Child content container
    },
    folderSeparator: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginLeft: 40,
        marginRight: 16,
    },

    // File Items
    fileItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        marginVertical: 4,
        marginRight: 16,
        padding: 10,
        borderRadius: 8,
    },
    fileIconContainer: {
        marginRight: 7,
    },
    fileIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
        tintColor: ColorConstants.BLACK2,
    },
    fileContent: {
        flex: 1,
    },
    fileName: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 10,
        color: ColorConstants.BLACK,
        marginBottom: 2,
    },
    fileDate: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 10,
        color: '#666',
    },
    fileBadgeContainer: {
        borderWidth: 1.5,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginRight: 3,
        marginLeft: 5,
        backgroundColor: '#FFFFFF',
    },
    fileBadgeText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 10,
        color: '#666',
    },
    moreButton: {
        padding: 4,
    },
    moreIcon: {
        width: 16,
        height: 16,
        resizeMode: 'contain',
    },

    // Actions
    folderActionsRow: {
        flexDirection: 'row',
        paddingBottom: 10,
        alignItems: 'center',
        gap: 12,
    },
    smallActionBtn: {
        padding: 4,
    },
    smallActionIcon: {
        width: 14,
        height: 14,
        resizeMode: 'contain',
        tintColor: '#6B7280',
    },

    // Popup Menu
    popupMenu: {
        position: 'absolute',
        top: 25,
        right: 0,
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        width: 100,
        zIndex: 2000,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    popupMenuItem: {
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    popupMenuText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 11,
        color: ColorConstants.BLACK,
    },
});