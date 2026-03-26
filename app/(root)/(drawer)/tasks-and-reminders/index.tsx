import { apiGet } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import Header from '@/components/Header';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import TaskReminderModal from '@/modals/TaskReminderModal';
import { useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';

// API Response type definitions
type Reminder = {
    id: number;
    title: string;
    description: string;
    reminder_date: string;
    reminder_time: string;
    assigned_to_display: string;
    days_left: number;
    priority: number;
    priority_display: string;
    priority_color: string;
    category: number;
    category_name: string;
    related_contact: any;
    related_contact_name: any;
    status: string;
    status_display: string;
    is_completed: boolean;
    created_at: string;
    updated_at: string;
};

type Stats = {
    total: number;
    pending: number;
    overdue: number;
    completed: number;
};

type ReminderResponse = {
    stats: Stats;
    count: number;
    next: string | null;
    previous: string | null;
    results: Reminder[];
};

type CalendarDay = {
    date: string;
    count: number;
    has_high_priority: boolean;
};

type CalendarResponse = {
    year: number;
    month: number;
    month_name: string;
    stats: Stats;
    calendar_data: CalendarDay[];
    selected_date: string | null;
    selected_reminders: Reminder[];
};

export default function TasksAndReminders() {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState<'Reminders' | 'Calendar'>('Reminders');
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(true);
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [stats, setStats] = useState<Stats>({
        total: 0,
        pending: 0,
        overdue: 0,
        completed: 0,
    });

    // Calendar state
    const [calendarLoading, setCalendarLoading] = useState(false);
    const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selectedReminders, setSelectedReminders] = useState<Reminder[]>([]);

    const [selectedDate, setSelectedDate] = useState('2023-10-04'); // Example date from screenshot

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Reminder | null>(null);

    useEffect(() => {
        if (activeTab === 'Reminders') {
            fetchReminders();
        } else {
            fetchCalendarData();
        }
    }, [searchText, activeTab, currentMonth, currentYear]);

    const fetchReminders = async () => {
        setLoading(true);
        try {
            const response = await apiGet(`${ApiConstants.SHARED_REMINDERS}?search=${searchText}`);
            const data: ReminderResponse = response.data;
            console.log("data in fetchReminders", data);
            setReminders(data.results);
            setStats(data.stats);
            if (data.results.length > 0 && expandedId === null) {
                setExpandedId(data.results[0].id);
            }

        } catch (error) {
            console.error('Error fetching reminders:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCalendarData = async () => {
        setCalendarLoading(true);
        try {
            const response = await apiGet(`${ApiConstants.SHARED_REMINDERS_CALENDAR}?month=${currentMonth}&year=${currentYear}`);
            const data: CalendarResponse = response.data;
            console.log("data in fetchCalendarData", data);

            setCalendarData(data.calendar_data);
            setStats(data.stats);
            setSelectedReminders(data.selected_reminders);
        } catch (error) {
            console.error('Error fetching calendar data:', error);
        } finally {
            setCalendarLoading(false);
        }
    };

    const handleOpenModal = (task: Reminder) => {
        setSelectedTask(task);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedTask(null);
    };

    const dailyReminders = [
        {
            id: 1,
            title: "Sarah's Doctor Appointment",
            time: '2:30 PM',
            assignedTo: 'Sarah',
            description: 'Annual check-up with Dr. Smith. Don\'t forget insurance card.',
            color: ColorConstants.GREEN, // Green dot
            completed: false
        },
        {
            id: 2,
            title: 'Renew Home Insurance Policy',
            time: '2:30 PM',
            assignedTo: 'Sarah',
            description: 'Annual check-up with Dr. Smith. Don\'t forget insurance card.',
            color: ColorConstants.ORANGE, // Orange dot
            completed: false
        }
    ];

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    // Generate markedDates from calendar data
    const getMarkedDates = () => {
        const marked: any = {};
        calendarData.forEach((day) => {
            const dotColor = day.has_high_priority ? ColorConstants.RED : ColorConstants.ORANGE;
            marked[day.date] = {
                marked: true,
                dotColor: dotColor,
            };
        });
        // Add selected date styling
        if (selectedDate) {
            const existingMark = marked[selectedDate] || {};
            marked[selectedDate] = {
                ...existingMark,
                selected: true,
                selectedColor: ColorConstants.LIGHT_PEACH3,
                selectedTextColor: ColorConstants.BLACK2,
            };
        }
        return marked;
    };

    const renderCalendarView = () => (
        <View style={styles.calendarViewContainer}>
            <View style={styles.calendarWrapper}>
                <Calendar
                    current={`${currentYear}-${String(currentMonth).padStart(2, '0')}-01`}
                    onDayPress={(day: { dateString: React.SetStateAction<string>; }) => {
                        setSelectedDate(day.dateString);
                    }}
                    onMonthChange={(month: { month: number; year: number; }) => {
                        setCurrentMonth(month.month);
                        setCurrentYear(month.year);
                    }}
                    markedDates={getMarkedDates()}
                    theme={{
                        backgroundColor: '#ffffff',
                        calendarBackground: '#ffffff',
                        textSectionTitleColor: '#b6c1cd',
                        selectedDayBackgroundColor: ColorConstants.LIGHT_PEACH3,
                        selectedDayTextColor: ColorConstants.BLACK2,
                        todayTextColor: ColorConstants.ORANGE,
                        dayTextColor: '#2d4150',
                        textDisabledColor: '#d9e1e8',
                        dotColor: '#00adf5',
                        selectedDotColor: '#ffffff',
                        arrowColor: ColorConstants.GRAY,
                        monthTextColor: ColorConstants.BLACK2,
                        textDayFontFamily: Fonts.mulishRegular,
                        textMonthFontFamily: Fonts.ManropeMedium,
                        textDayHeaderFontFamily: Fonts.mulishRegular,
                        textDayFontSize: 12,
                        textMonthFontSize: 14,
                        textDayHeaderFontSize: 12
                    }}
                />
            </View>

            <Text style={styles.dailyRemindersTitle}>
                Reminders for {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
            </Text>

            {/* {selectedReminders.map((reminder) => (
                <View key={reminder.id} style={styles.dailyReminderCard}>
                    <View style={styles.reminderHeader}>
                        <TouchableOpacity style={styles.checkboxContainer}>
                            <View style={styles.checkbox} />
                        </TouchableOpacity>
                        <View style={{ flex: 1 }}>
                            <View style={styles.reminderTitleRow}>
                                <View style={[styles.statusDot, { backgroundColor: reminder.priority_color }]} />
                                <Text style={styles.reminderTitle}>{reminder.title}</Text>
                            </View>
                            <View style={styles.reminderMetaRow}>
                                <Image source={Icons.ic_clock} style={styles.metaIcon} />
                                <Text style={styles.metaText}>{reminder.reminder_time}</Text>
                                <View style={styles.metaDivider} />
                                <Image source={Icons.ic_user_single} style={styles.metaIcon} />
                                <Text style={styles.metaText}>Assigned to: {reminder.assigned_to_display}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.reminderContent}>
                        <Text style={styles.reminderDescription}>{reminder.description}</Text>

                        <View style={styles.reminderActions}>
                            <TouchableOpacity style={styles.actionBtnSquare}>
                                <Image source={Icons.ic_edit} style={styles.actionBtnIcon} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionBtnSquare}>
                                <Image source={Icons.ic_clock} style={styles.actionBtnIcon} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionBtnSquare}>
                                <Image source={Icons.ic_bin2} style={styles.actionBtnIcon} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            ))} */}

            <FlatList
                data={selectedReminders}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderCalendarReminderItem}
                scrollEnabled={false}
                ListEmptyComponent={<Text style={styles.emptyText}>No reminders for this date</Text>}
            />
        </View>
    );

    const renderCalendarReminderItem = ({ item }: { item: Reminder }) => (
        <View style={styles.dailyReminderCard}>
            <View style={styles.reminderHeader}>
                <TouchableOpacity style={styles.checkboxContainer}>
                    <View style={styles.checkbox} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <View style={styles.reminderTitleRow}>
                        <View style={[styles.statusDot, { backgroundColor: item.priority_color }]} />
                        <Text style={styles.reminderTitle}>{item.title}</Text>
                    </View>
                    <View style={styles.reminderMetaRow}>
                        <Image source={Icons.ic_clock} style={styles.metaIcon} />
                        <Text style={styles.metaText}>{item.reminder_time}</Text>
                        <View style={styles.metaDivider} />
                        <Image source={Icons.ic_user_single} style={styles.metaIcon} />
                        <Text style={styles.metaText}>Assigned to: {item.assigned_to_display}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.reminderContent}>
                <Text style={styles.reminderDescription}>{item.description}</Text>

                {/* <View style={styles.reminderActions}>
                    <TouchableOpacity style={styles.actionBtnSquare}>
                        <Image source={Icons.ic_edit} style={styles.actionBtnIcon} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtnSquare}>
                        <Image source={Icons.ic_clock} style={styles.actionBtnIcon} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtnSquare}>
                        <Image source={Icons.ic_bin2} style={styles.actionBtnIcon} />
                    </TouchableOpacity>
                </View> */}
            </View>
        </View>
    );

    const renderItem = ({ item }: { item: Reminder }) => {
        const isExpanded = expandedId === item.id;

        return (
            <View style={styles.cardContainer}>
                <TouchableOpacity
                    style={styles.cardHeader}
                    onPress={() => toggleExpand(item.id)}
                    activeOpacity={0.7}
                >
                    <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        {/* <Text style={styles.cardSubtitle}>{item.description}</Text> */}
                    </View>
                    <Image
                        source={isExpanded ? Icons.ic_up_arrow : Icons.ic_down_arrow}
                        style={styles.arrowIcon}
                    />
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.cardContent}>
                        <Text style={styles.sectionLabel}>Reminders Information</Text>

                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>Category</Text>
                            <View style={styles.tagContainer}>
                                <Text style={styles.tagText}>{item.category_name}</Text>
                            </View>
                        </View>

                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>Priority</Text>
                            <View style={[styles.priorityTag, { backgroundColor: item.priority_color }]}>
                                <Text style={styles.priorityText}>{item.priority_display}</Text>
                            </View>
                        </View>

                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>Due Date</Text>
                            <Text style={styles.fieldValue}>{item.reminder_date}</Text>
                        </View>

                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>Status</Text>
                            <View style={styles.statusTag}>
                                <Text style={styles.tagText}>{item.status_display}</Text>
                            </View>
                        </View>

                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>Assigned To</Text>
                            <Text style={styles.fieldValue}>{item.assigned_to_display}</Text>
                        </View>

                        <View style={styles.actionButtonsRow}>
                            <TouchableOpacity style={styles.actionButton} onPress={() => handleOpenModal(item)}>
                                <Image source={Icons.ic_eye_gray} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton}>
                                <Image source={Icons.ic_checkbox_selected} style={styles.actionIcon} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={ColorConstants.WHITE} barStyle="dark-content" />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>

                <Header
                    title="Family Tasks & Reminders"
                    subtitle="Manage shared family tasks, renewals, and important reminders"
                    showBackArrow={false}
                    containerStyle={{ marginTop: 20 }}
                />
                {/* Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <View style={styles.statHeader}>
                                <Text style={styles.statLabel}>Total</Text>
                                <View style={[styles.statIconContainer, { backgroundColor: ColorConstants.GRAY5 }]}>
                                    <Image source={Icons.ic_board} style={[styles.statIcon, { tintColor: ColorConstants.WHITE }]} />
                                </View>
                            </View>
                            <Text style={styles.statValue}>{stats.total}</Text>
                        </View>
                        <View style={[styles.statCard, { marginLeft: 12 }]}>
                            <View style={styles.statHeader}>
                                <Text style={styles.statLabel}>Pending</Text>
                                <View style={[styles.statIconContainer, { backgroundColor: ColorConstants.GRAY5 }]}>
                                    <Image source={Icons.ic_pending} style={[styles.statIcon, { tintColor: ColorConstants.WHITE }]} />
                                </View>
                            </View>
                            <Text style={styles.statValue}>{stats.pending}</Text>
                        </View>
                    </View>
                    <View style={[styles.statsRow, { marginTop: 12 }]}>
                        <View style={styles.statCard}>
                            <View style={styles.statHeader}>
                                <Text style={styles.statLabel}>Overdue</Text>
                                <View style={[styles.statIconContainer, { backgroundColor: ColorConstants.GRAY5 }]}>
                                    <Image source={Icons.ic_clock_warn2} style={[styles.statIcon, { tintColor: ColorConstants.WHITE }]} />
                                </View>
                            </View>
                            <Text style={styles.statValue}>{stats.overdue}</Text>
                        </View>
                        <View style={[styles.statCard, { marginLeft: 12 }]}>
                            <View style={styles.statHeader}>
                                <Text style={styles.statLabel}>Completed</Text>
                                <View style={[styles.statIconContainer, { backgroundColor: ColorConstants.GRAY5 }]}>
                                    <Image source={Icons.ic_check_circle2} style={[styles.statIcon, { tintColor: ColorConstants.WHITE }]} />
                                </View>
                            </View>
                            <Text style={styles.statValue}>{stats.completed}</Text>
                        </View>
                    </View>
                </View>
                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'Reminders' && styles.activeTab]}
                        onPress={() => setActiveTab('Reminders')}
                    >
                        <Text style={[styles.tabText, activeTab === 'Reminders' && styles.activeTabText]}>Reminders</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'Calendar' && styles.activeTab]}
                        onPress={() => setActiveTab('Calendar')}
                    >
                        <Text style={[styles.tabText, activeTab === 'Calendar' && styles.activeTabText]}>Calendar View</Text>
                    </TouchableOpacity>
                </View>

                {/* Conditional Rendering based on activeTab */}
                {activeTab === 'Reminders' ? (
                    <>
                        {/* Search view */}
                        <View style={styles.searchContainer}>
                            <Image source={Icons.ic_search} style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search name..."
                                placeholderTextColor={ColorConstants.GRAY}
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                        </View>

                        <View style={styles.listSection}>
                            <Text style={styles.listSectionTitle}>Tasks & Reminders</Text>
                            {loading ? (
                                <ActivityIndicator size="large" color={ColorConstants.DARK_CYAN} style={{ marginTop: 20 }} />
                            ) : (
                                <FlatList
                                    data={reminders}
                                    keyExtractor={(item) => item.id.toString()}
                                    renderItem={renderItem}
                                    scrollEnabled={false}
                                    contentContainerStyle={{ marginTop: 10 }}
                                    ListEmptyComponent={<Text style={styles.emptyText}>No reminders found</Text>}
                                />
                            )}
                        </View>
                    </>
                ) : (
                    renderCalendarView()
                )}

            </ScrollView>

            <TaskReminderModal
                visible={modalVisible}
                onClose={handleCloseModal}
                task={selectedTask}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorConstants.WHITE,
    },

    statsContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statCard: {
        flex: 1,
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        padding: 16,
        // Shadow for iOS
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.10,
        shadowRadius: 8,
        // Elevation for Android
        elevation: 4,
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 13,
        fontFamily: Fonts.interRegular,
        color: ColorConstants.GRAY,
    },
    statIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statIcon: {
        width: 18,
        height: 18,
        resizeMode: 'contain',
    },
    statValue: {
        fontSize: 24,
        fontFamily: Fonts.interMedium, // Looks like a slightly simpler font in screenshot
        color: ColorConstants.BLACK2,
    },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        backgroundColor: ColorConstants.LIGHT_PEACH, // Using reddish brown background
        borderRadius: 8,
        padding: 4,
        marginBottom: 15,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 6,
    },
    activeTab: {
        backgroundColor: ColorConstants.WHITE,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 4,
    },
    tabText: {
        fontSize: 14,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.BLACK2,
    },
    activeTabText: {
        color: ColorConstants.BLACK2,
    },
    searchContainer: {
        marginHorizontal: 20,
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: Platform.OS === 'ios' ? 12 : 0,
        backgroundColor: ColorConstants.WHITE,
    },
    searchIcon: {
        width: 16,
        height: 16,
        tintColor: ColorConstants.GRAY,
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 13,
        fontFamily: Fonts.mulishRegular,
        color: ColorConstants.BLACK2,
        height: 40
    },
    listSection: {
        paddingHorizontal: 20,
    },
    listSectionTitle: {
        fontSize: 18,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.BLACK2,
        marginBottom: 10,
    },
    cardContainer: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        marginBottom: 12,
        overflow: 'hidden',
    },
    cardHeader: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardTitle: {
        fontSize: 16,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.BLACK2,
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        fontFamily: Fonts.mulishRegular,
        color: ColorConstants.GRAY,
    },
    arrowIcon: {
        width: 16,
        height: 16,
        tintColor: ColorConstants.BLACK2,
        marginTop: 4,
        resizeMode: 'contain'
    },
    cardContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    sectionLabel: {
        fontSize: 16,
        fontFamily: Fonts.ManropeSemiBold,
        color: ColorConstants.BLACK2,
        marginBottom: 16,
    },
    fieldContainer: {
        marginBottom: 16,
    },
    fieldLabel: {
        fontSize: 12,
        fontFamily: Fonts.mulishRegular,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 6,
    },
    fieldValue: {
        fontSize: 14,
        fontFamily: Fonts.mulishRegular, // Using Medium for values per screenshot
        color: ColorConstants.BLACK2,
    },
    tagContainer: {
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    tagText: {
        fontSize: 13,
        fontFamily: Fonts.interRegular,
        color: ColorConstants.BLACK2,
    },
    priorityTag: {
        alignSelf: 'flex-start',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 4,
    },
    priorityHigh: {
        backgroundColor: ColorConstants.RED,
    },
    priorityMedium: {
        backgroundColor: ColorConstants.ORANGE,
    },
    priorityLow: {
        backgroundColor: ColorConstants.GREEN,
    },
    priorityText: {
        fontSize: 12,
        fontFamily: Fonts.interMedium,
        color: ColorConstants.WHITE,
    },
    statusTag: {
        alignSelf: 'flex-start',
        backgroundColor: '#FDF2E3', // Light beige/peach
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    actionButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
        gap: 10
    },
    actionButton: {
        width: 20,
        height: 20,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filledActionButton: {
        backgroundColor: ColorConstants.DARK_CYAN, // Darker color for check
    },
    actionIcon: {
        width: 20,
        height: 20,
        tintColor: ColorConstants.DARK_CYAN,
    },
    // Calendar View Styles
    calendarViewContainer: {
        paddingHorizontal: 20,
    },
    calendarWrapper: {
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 20,
    },
    dailyRemindersTitle: {
        fontSize: 16,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.BLACK2,
        marginBottom: 15,
    },
    dailyReminderCard: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        padding: 16,
        marginBottom: 12,
    },
    reminderHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    checkboxContainer: {
        marginRight: 12,
        marginTop: 4,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: ColorConstants.GRAY,
    },
    reminderTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    reminderTitle: {
        fontSize: 15,
        fontFamily: Fonts.ManropeMedium,
        color: ColorConstants.BLACK2,
    },
    reminderMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    metaIcon: {
        width: 14,
        height: 14,
        resizeMode: 'contain',
        tintColor: ColorConstants.DARK_CYAN,
        marginRight: 4,
    },
    metaText: {
        fontSize: 12,
        fontFamily: Fonts.mulishRegular,
        color: ColorConstants.DARK_CYAN,
    },
    metaDivider: {
        width: 1,
        height: 12,
        backgroundColor: ColorConstants.GRAY3,
        marginHorizontal: 8,
    },
    reminderContent: {
        marginLeft: 32, // Indent to align with title (checkbox width + margin)
    },
    reminderDescription: {
        fontSize: 13,
        fontFamily: Fonts.mulishRegular,
        color: ColorConstants.DARK_CYAN,
        lineHeight: 20,
        marginBottom: 12,
    },
    reminderActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtnSquare: {
        width: 32,
        height: 32,
        backgroundColor: ColorConstants.GRAY3 + '80', // Light gray background
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionBtnIcon: {
        width: 16,
        height: 16,
        resizeMode: 'contain',
        tintColor: ColorConstants.BLACK2,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontFamily: Fonts.mulishRegular,
        color: ColorConstants.GRAY
    }
});
