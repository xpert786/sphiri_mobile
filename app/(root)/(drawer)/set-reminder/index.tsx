import { apiDelete, apiGet, apiPost, apiPut } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import Header from '@/components/Header';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import { capitalizeFirstLetter } from '@/constants/Helper';
import { StringConstants } from '@/constants/StringConstants';
import DeleteReminderModal from '@/modals/DeleteReminderModal';
import EditReminderModal from '@/modals/EditReminderModal';
import NewReminderModal from '@/modals/NewReminderModal';
import SnoozeReminderModal from '@/modals/SnoozeReminderModal';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';



const options = [StringConstants.ADD_REMINDER, StringConstants.EXPORT_CALENDAR]

const STATUS_OPTIONS = [
    'All Status',
    'Pending',
    'In-progress',
    'Completed',
    'Overdue',
];

const SORT_OPTIONS = [
    'Sort by: Recent',
    'Sort by: Due Date',
    'Sort by: Priority',
    'Sort by: Category',
];


export default function SetReminder() {
    const categoryRef = React.useRef<any>(null);
    const sortRef = React.useRef<any>(null);
    const statusRef = React.useRef<any>(null);

    const [newReminderModalVisible, setNewReminderModalVisible] = useState(false);

    const [snoozeModalVisible, setSnoozeModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedReminder, setSelectedReminder] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const [reminders, setReminders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState<string[]>(['All categories']);
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState([
        { label: 'Overdue Tasks', count: 0, icon: Icons.ic_clock_warn },
        { label: 'Upcoming This Week', count: 0, icon: Icons.ic_calender_swipe },
        { label: 'Completed This Month', count: 0, icon: Icons.ic_check_circle },
    ]);
    const [dropdownVisible, setDropdownVisible] = React.useState(false);
    const [selectedOption, setSelectedOption] = React.useState<'Add Reminder' | 'Export Calendar'>('Add Reminder');
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [checkedIds, setCheckedIds] = React.useState<string[]>([]);
    const [openDropdown, setOpenDropdown] = React.useState<
        'category' | 'status' | 'sort' | null
    >(null);

    const [selectedCategory, setSelectedCategory] = React.useState('All categories');
    const [selectedStatus, setSelectedStatus] = React.useState('All Status');
    const [selectedSort, setSelectedSort] = React.useState('Sort by: Recent');
    const [dropdownLayout, setDropdownLayout] = React.useState<{
        x: number;
        y: number;
        width: number;
    } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 8;



    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [remindersData, todosData] = await Promise.all([
                fetchRemindersData(),
                fetchTodosData(),
                fetchStats(),
                fetchCategories()
            ]);
            setReminders([...remindersData, ...todosData]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTodosData = async () => {
        try {
            let allTodos: any[] = [];
            let currentUrl: string | null = ApiConstants.TODOS;

            while (currentUrl) {
                // apiGet handles both relative and absolute URLs if axios is configured correctly, 
                // but for safety with baseURL, we should check if it's absolute.
                const response = await apiGet(currentUrl);
                if (response.data && response.data.results) {
                    const mapped = response.data.results.map((item: any) => ({
                        id: `todo-${item.id}`,
                        title: item.title,
                        priority: item.priority_name || item.priority,
                        date: item.due_date || item.reminder_date,
                        displayDate: formatDateToMDY(item.due_date || item.reminder_date),
                        time: item.reminder_time ? formatTimeStr(item.reminder_time) : formatTimeFromISO(item.created_at),
                        reminder_time: item.reminder_time,
                        assignedTo: item.assigned_to_name || 'Unassigned',
                        description: item.description,
                        category: item.category_name,
                        categoryId: item.category,
                        tags: [item.category_name],
                        completed: item.is_completed,
                        priority_color: item.priority_color,
                        status: item.status,
                        is_overdue: item.is_overdue,
                        item_type: 'todo',
                        createdAt: item.created_at
                    }));
                    allTodos = [...allTodos, ...mapped];
                    currentUrl = response.data.next;
                } else {
                    currentUrl = null;
                }
            }
            return allTodos;
        } catch (error) {
            console.error('Error fetching todos:', error);
        }
        return [];
    };

    const fetchRemindersData = async () => {
        try {
            let allReminders: any[] = [];
            let currentUrl: string | null = ApiConstants.REMINDERS;

            while (currentUrl) {
                const response = await apiGet(currentUrl);
                console.log("response in all reminders: ", JSON.stringify(response.data));

                if (response.data && response.data.results) {
                    const mapped = response.data.results.map((item: any) => ({
                        id: `reminder-${item.id}`,
                        title: capitalizeFirstLetter(item.title),
                        priority: item.priority_name || item.priority,
                        dueDate: item.due_date,
                        date: item.reminder_date || item.due_date,
                        displayDate: formatDateToMDY(item.reminder_date || item.due_date),
                        time: item.reminder_time ? formatTimeStr(item.reminder_time) : formatTimeFromISO(item.created_at),
                        reminder_time: item.reminder_time,
                        assignedTo: item.assigned_to_name?.[0] || 'Unassigned',
                        description: item.description,
                        category: item.category_name,
                        categoryId: item.category,
                        tags: [item.category_name],
                        completed: item.is_completed,
                        priority_color: item.priority_color,
                        status: item.status,
                        is_overdue: item.is_overdue,
                        item_type: 'reminder',
                        createdAt: item.created_at
                    }));
                    allReminders = [...allReminders, ...mapped];
                    currentUrl = response.data.next;
                } else {
                    currentUrl = null;
                }
            }
            return allReminders;
        } catch (error) {
            console.error('Error fetching reminders:', error);
        }
        return [];
    };

    const fetchCategories = async () => {
        try {
            const response = await apiGet(ApiConstants.VENDOR_CATEGORIES);
            if (response.data && Array.isArray(response.data)) {
                const categoryNames = response.data.map((cat: any) => cat.name);
                setCategories(['All categories', ...categoryNames]);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await apiGet(ApiConstants.REMINDERS_STATS);
            if (response.data) {
                setStats([
                    { label: 'Overdue Tasks', count: response.data.overdue_count, icon: Icons.ic_clock_warn },
                    { label: 'Upcoming This Week', count: response.data.upcoming_count, icon: Icons.ic_calender_swipe },
                    { label: 'Completed This Month', count: response.data.completed_count, icon: Icons.ic_check_circle },
                ]);
            }
        } catch (error) {
            console.error('Error fetching reminder stats:', error);
        }
    };




    const tapOnSave = async (formData: any) => {
        await createReminder(formData);
        setNewReminderModalVisible(false);
    }

    const createReminder = async (formData: any) => {
        setIsLoading(true);
        try {
            // Helper to format time to HH:MM (24-hour)
            const formatTimeToHM = (date: any) => {
                if (!date) return "";
                if (!(date instanceof Date)) return date; // Already formatted or string
                const h = String(date.getHours()).padStart(2, '0');
                const m = String(date.getMinutes()).padStart(2, '0');
                return `${h}:${m}`;
            };

            // Get the first selected category ID as a string (per user request example)
            const selectedCategoryIds = Object.keys(formData)
                .filter(key => key.startsWith('category_') && formData[key])
                .map(key => key.split('_')[1]);
            const categoryToSend = selectedCategoryIds.length > 0 ? String(selectedCategoryIds[0]) : "";

            const payload = new FormData();
            payload.append('title', formData.taskTitle || '');
            payload.append('description', formData.description || '');
            payload.append('reminder_date', formatDateToYMD(formData.dueDate) || '');
            payload.append('reminder_time', formatTimeToHM(formData.time) || '');
            payload.append('is_recurring', formData.recurring ? "on" : "off");
            payload.append('recurrence_pattern', formData.repeatEvery || 'weekly');
            if (formData.endDate) {
                payload.append('recurrence_end_date', formatDateToYMD(formData.endDate));
            }

            const relatedContact = Array.isArray(formData.associatedContact) && formData.associatedContact.length > 0
                ? formData.associatedContact[0]
                : (formData.associatedContact || null);
            if (relatedContact) {
                payload.append('related_contact', relatedContact);
            }

            if (formData.category) {
                payload.append('related_document', formData.category);
            }

            const assignedToArr = Array.isArray(formData.assignedTo) && formData.assignedTo.length > 0 ? formData.assignedTo : [2];
            assignedToArr.forEach((id: any) => {
                payload.append('assigned_to', id);
            });

            const relatedVendor = Array.isArray(formData.associatedVendor) && formData.associatedVendor.length > 0
                ? formData.associatedVendor[0]
                : (formData.associatedVendor || null);
            if (relatedVendor) {
                payload.append('related_vendor', relatedVendor);
            }

            if (categoryToSend) {
                payload.append('category', categoryToSend);
            }

            payload.append('priority', formData.priority || "3");
            payload.append('notify_via_email', formData.emailNotification ? 'true' : 'false');
            payload.append('notify_via_push', formData.pushNotification ? 'true' : 'false');
            payload.append('notify_via_sms', formData.smsNotification ? 'true' : 'false');
            payload.append('advance_notice', formData.advanceNotice || 0);

            console.log("payload in create reminder", payload);


            const response = await apiPost(ApiConstants.REMINDERS, payload, { isFormData: true });
            console.log("response in reminder:", response.data);

            if (response.data) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Reminder created successfully',
                });
                setNewReminderModalVisible(false);
                fetchData();
            }
        } catch (error: any) {
            console.log('Error creating reminder:', error?.message || error);
            if (error.response) {
                console.log('API Error Status:', error.response.status);
                console.log('API Error Response Data:', JSON.stringify(error.response.data, null, 2));
            } else if (error.request) {
                console.log('No response received. Request details:', error.request._url || error.config?.url);
                console.log('Request headers:', JSON.stringify(error.config?.headers, null, 2));
            } else {
                console.error('Error setting up request:', error.message);
            }
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error?.response?.data?.message || JSON.stringify(error?.response?.data) || error?.message || 'Failed to create reminder',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const toggleCheck = (id: string) => {
        setCheckedIds(prev =>
            prev.includes(id)
                ? prev.filter(itemId => itemId !== id)
                : [...prev, id]
        );
    };

    const openEditModal = (item: any) => {
        setSelectedReminder(item);
        setEditModalVisible(true);
    };

    const handleEditReminder = async (updatedData: any) => {
        if (!selectedReminder) return;
        setIsLoading(true);
        try {
            // Extract meaningful ID
            const originalId = selectedReminder.id.replace('reminder-', '').replace('todo-', '');

            // Priority mapping
            let priorityVal = "3";
            if (updatedData.priority === 'High Priority') priorityVal = "5";
            else if (updatedData.priority === 'Medium Priority') priorityVal = "4";
            else if (updatedData.priority === 'Low Priority') priorityVal = "3";

            // Convert 12-hour time (e.g., "10:00 AM") to 24-hour format (e.g., "10:00")
            let formattedTime = updatedData.time;
            if (formattedTime && (formattedTime.includes('AM') || formattedTime.includes('PM'))) {
                const [timePart, period] = formattedTime.split(' ');
                let [hours, minutes] = timePart.split(':');
                hours = parseInt(hours, 10);
                if (period === 'PM' && hours !== 12) hours += 12;
                if (period === 'AM' && hours === 12) hours = 0;
                formattedTime = `${String(hours).padStart(2, '0')}:${minutes}`;
            }

            const payload: any = {
                title: updatedData.title,
                description: updatedData.description,
                reminder_date: formatDateToYMD(updatedData.dueDate),
                reminder_time: formattedTime,
                priority: priorityVal,
                category: updatedData.categoryId || updatedData.category,
            };

            console.log("Editing reminder with payload:", payload);
            console.log("API URL:", `${ApiConstants.EDIT_REMINDER}${originalId}/`);

            const response = await apiPut(`${ApiConstants.EDIT_REMINDER}${originalId}/`, payload);

            console.log("Edit response:", response.data);

            if (response.data) {
                setEditModalVisible(false);
                fetchData();
            }
        } catch (error: any) {
            console.error('Error editing reminder:', error);
            if (error.response) {
                console.error('Error response data:', error.response.data);
                console.error('Error Status:', error.response.status);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteReminder = async () => {
        setDeleteModalVisible(false);
        console.log("selectedReminder in handleDeleteReminder:", selectedReminder);

        if (!selectedReminder) return;
        setIsLoading(true);
        try {
            // Extract meaningful ID
            const originalId = selectedReminder.id.replace('reminder-', '').replace('todo-', '');
            console.log("originalId", originalId);


            // NOTE: Assuming this endpoint works for both or primarily reminders as per user request.
            const res = await apiDelete(`${ApiConstants.DELETE_REMINDER}${originalId}/`);
            console.log("res in handleDeleteReminder:", res.data);
            if (res.status == 200) {
                Toast.show({
                    type: 'success',
                    text1: 'Reminder deleted successfully',
                })
            }

            fetchData();
        } catch (error) {
            console.error('Error deleting reminder:', error);
            // Optionally show alert
        } finally {
            setIsLoading(false);
        }
    };

    const openDeleteModal = (item: any) => {
        setSelectedReminder(item);
        setDeleteModalVisible(true);
    };

    const handleSnoozeReminder = async (data: any) => {
        if (!selectedReminder) return;
        setIsLoading(true);
        try {
            // Extract meaningful ID
            const originalId = selectedReminder.id.replace('reminder-', '').replace('todo-', '');

            // console.log("Snoozing reminder with payload:", data);

            const response = await apiPost(`${ApiConstants.SNOOZE_REMINDER}${originalId}/`, data);
            if (response.status == 200) {
                setSnoozeModalVisible(false);
                fetchData();
                Toast.show({
                    type: 'success',
                    text1: 'Reminder snoozed successfully',
                })
            }

        } catch (error: any) {
            console.error('Error snoozing reminder:', error);
            if (error.response) {
                console.error('Error response data:', error.response.data);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const openSnoozeModal = (item: any) => {
        setSelectedReminder(item);
        setSnoozeModalVisible(true);
    };


    const parseDate = (dateStr: string) => {
        return dateStr;
    };

    const formatTimeFromISO = (isoString: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const strMinutes = minutes < 10 ? '0' + minutes : minutes;
        const strHours = hours < 10 ? '0' + hours : hours;
        return `${strHours}:${strMinutes} ${ampm}`;
    };

    const formatTimeStr = (timeStr: string) => {
        if (!timeStr) return '';
        const parts = timeStr.split(':');
        if (parts.length < 2) return timeStr;
        let [hours, minutes] = parts.map(p => parseInt(p, 10));
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const strHours = String(hours).padStart(2, '0');
        const strMinutes = String(minutes).padStart(2, '0');
        return `${strHours}:${strMinutes} ${ampm}`;
    };

    const formatDateToMDY = (dateStr: string) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        const [year, month, day] = parts;
        return `${month}/${day}/${year}`;
    };

    const formatDateToYMD = (date: any) => {
        if (!date) return '';
        if (date instanceof Date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        if (typeof date === 'string') {
            const parts = date.split('/');
            if (parts.length === 3) {
                const [m, d, y] = parts;
                return `${y}-${m}-${d}`;
            }
            return date;
        }
        return '';
    };
    const getMarkedDates = () => {
        const marks: any = {};
        reminders.forEach(r => {
            const d = parseDate(r.date);
            if (d) {
                marks[d] = { marked: true, dotColor: ColorConstants.PRIMARY_BROWN };
            }
        });

        if (selectedDate) {
            marks[selectedDate] = {
                ...(marks[selectedDate] || {}),
                selected: true,
                selectedColor: ColorConstants.LIGHT_PEACH3,
                selectedTextColor: ColorConstants.PRIMARY_BROWN
            };
        }
        return marks;
    };

    const formattedSelectedDate = new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const filteredReminders = reminders.filter(r => {
        // 1. Calendar Filter
        if (viewMode === 'calendar' && parseDate(r.date) !== selectedDate) {
            return false;
        }

        // 2. Category Filter
        if (selectedCategory !== 'All categories' && !r.tags.includes(selectedCategory)) {
            return false;
        }

        // 3. Status Filter
        if (selectedStatus !== 'All Status') {
            if (selectedStatus === 'Pending' && r.status !== 'pending') return false;
            if (selectedStatus === 'In-progress' && r.status !== 'in_progress') return false;
            if (selectedStatus === 'Completed' && r.status !== 'completed' && !r.completed) return false;
            if (selectedStatus === 'Overdue' && !r.is_overdue) return false;
        }

        // 4. Search Filter
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            return (
                r.title.toLowerCase().includes(query) ||
                (r.description && r.description.toLowerCase().includes(query))
            );
        }

        return true;
    }).sort((a, b) => {
        if (selectedSort === 'Sort by: Due Date') {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (selectedSort === 'Sort by: Priority') {
            // Mapping priority names to values for sorting if numeric priority isn't available
            const priorityMap: any = { 'High Priority': 3, 'Medium Priority': 2, 'Low Priority': 1 };
            const pA = a.priority_val || priorityMap[a.priority] || 0;
            const pB = b.priority_val || priorityMap[b.priority] || 0;
            return pB - pA; // Higher priority first
        }
        if (selectedSort === 'Sort by: Category') {
            return (a.tags[0] || '').localeCompare(b.tags[0] || '');
        }

        // Default: Group by type (Reminders first, then Todos) and keep API order
        if (a.item_type !== b.item_type) {
            return a.item_type === 'reminder' ? -1 : 1;
        }

        // Same type: maintain relative order from API
        return 0;
    });

    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(filteredReminders.length / pageSize) || 1);
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [filteredReminders.length]);

    const totalPages = Math.max(1, Math.ceil(filteredReminders.length / pageSize) || 1);
    const paginatedReminders = filteredReminders.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };


    const renderStatCard = (item: any, index: number) => (
        <View key={index} style={styles.statCard}>
            <Text style={styles.statLabel}>{item.label}</Text>
            <View style={styles.statCountContainer}>
                <Text style={styles.statCount}>{item.count}</Text>
                <Image source={item.icon} style={styles.statIcon} />
            </View>
        </View>
    );

    const renderReminderItem = ({ item }: { item: any }) => (
        <View style={styles.reminderCard}>
            <View style={styles.reminderHeader}>
                {/* <TouchableOpacity
                    style={styles.checkbox}
                    activeOpacity={0.7}
                    onPress={() => toggleCheck(item.id)}
                >
                    {checkedIds.includes(item.id) && (
                        <Image
                            source={Icons.ic_checkbox_tick}
                            style={styles.checkboxIcon}
                        />
                    )}
                </TouchableOpacity> */}

                <View style={styles.reminderContent}>
                    <View style={styles.titleRow}>
                        <Text style={styles.reminderTitle} numberOfLines={1}>{capitalizeFirstLetter(item.title)}</Text>
                        <View style={[styles.typeTag, item.item_type === 'todo' ? styles.todoTag : styles.reminderTag]}>
                            <Text style={styles.typeTagText}>{item.item_type}</Text>
                        </View>
                    </View>

                    <View style={styles.priorityAndDateRow}>
                        {item.priority ? (
                            <View style={[styles.priorityTag, { backgroundColor: item.priority_color || ColorConstants.RED }]}>
                                <Text style={styles.priorityText}>{item.priority}</Text>
                            </View>
                        ) : null}
                    </View>

                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Image source={Icons.ic_calendar_outline} style={styles.metaIcon} />
                            <Text style={styles.metaText}>{item.displayDate || item.date}</Text>
                        </View>
                        {item.assignedTo && (
                            <View style={styles.metaItem}>
                                <Image source={Icons.ic_user_single} style={styles.metaIcon} />
                                <Text style={styles.metaText} numberOfLines={1}>{item.assignedTo}</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

                    <View style={styles.bottomRow}>
                        <View style={styles.tagsRow}>
                            {(item.tags || []).slice(0, 2).map((tag: string, index: number) => (
                                <View key={index} style={styles.tag}>
                                    <Text style={styles.tagText}>{tag}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.actionsRow}>
                            <TouchableOpacity style={styles.actionButton} onPress={() => openEditModal(item)}>
                                <MaterialCommunityIcons name="pencil-outline" size={16} color={ColorConstants.BLACK2} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton} onPress={() => openDeleteModal(item)}>
                                <MaterialCommunityIcons name="delete-outline" size={16} color={ColorConstants.BLACK2} />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionButton, { marginRight: 0 }]} onPress={() => openSnoozeModal(item)}>
                                <MaterialCommunityIcons name="clock-outline" size={16} color={ColorConstants.BLACK2} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={ColorConstants.WHITE} barStyle="dark-content" />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                {newReminderModalVisible && (
                    <NewReminderModal
                        visible={newReminderModalVisible}
                        onClose={() => {
                            setNewReminderModalVisible(false);
                        }}
                        onSave={(formData) => tapOnSave(formData)}
                    />
                )}

                {editModalVisible && (
                    <EditReminderModal
                        visible={editModalVisible}
                        onClose={() => setEditModalVisible(false)}
                        onSave={handleEditReminder}
                        reminder={selectedReminder}
                    />
                )}

                {deleteModalVisible && (
                    <DeleteReminderModal
                        visible={deleteModalVisible}
                        onClose={() => setDeleteModalVisible(false)}
                        onDelete={handleDeleteReminder}
                        reminder={selectedReminder}
                    />
                )}

                {snoozeModalVisible && (
                    <SnoozeReminderModal
                        visible={snoozeModalVisible}
                        onClose={() => setSnoozeModalVisible(false)}
                        onSnooze={handleSnoozeReminder}
                        reminderTitle={selectedReminder?.title}
                        reminderDate={selectedReminder?.displayDate || selectedReminder?.date}
                    />
                )}

                <Header
                    title={StringConstants.TASKS_AND_REMINDERS}
                    subtitle={StringConstants.MANAGE_YOUR_HOME}
                    showBackArrow={false}
                    containerStyle={{ marginTop: 20 }}
                />

                {/* USER IMPLEMENTED DROPDOWN BUTTON */}
                <TouchableOpacity style={styles.button} onPress={() => { setNewReminderModalVisible(true) }}>
                    <View style={styles.content}>
                        <Image
                            source={selectedOption === StringConstants.ADD_REMINDER ? Icons.ic_plus : Icons.ic_download}
                            style={styles.icon}
                        />
                        <Text style={styles.buttonText}>{selectedOption}</Text>
                        {/* <TouchableOpacity style={styles.arrowWrapper} onPress={() => setDropdownVisible(prev => !prev)}>
                            <Image style={styles.updownArrow}
                                source={dropdownVisible ? Icons.ic_down_arrow : Icons.ic_up_arrow}
                            />
                        </TouchableOpacity> */}
                    </View>
                </TouchableOpacity>
                {/* DROPDOWN */}
                {dropdownVisible && (
                    <View style={styles.dropdownContainer}>
                        {options.map(item => {
                            const isSelected = selectedOption === item;

                            return (
                                <TouchableOpacity
                                    key={item}
                                    style={[
                                        styles.dropdownItem,
                                        isSelected && styles.selectedItem,
                                    ]}
                                    onPress={() => {
                                        setSelectedOption(item as any);
                                        setDropdownVisible(false);
                                    }}
                                >
                                    <Image
                                        source={item === StringConstants.ADD_REMINDER ? Icons.ic_plus : Icons.ic_download}
                                        style={styles.dropdownIcon}
                                    />
                                    <Text style={styles.dropdownText}>{item}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                {/* RESTORED UI IMPLEMENTATION: Stats, Switcher, Search, List */}
                <View style={styles.statsContainer}>
                    <View style={styles.statsRow}>
                        {renderStatCard(stats[0], 0)}
                        {renderStatCard(stats[1], 1)}
                    </View>
                    <View style={styles.statsRow}>
                        {renderStatCard(stats[2], 2)}
                    </View>
                </View>

                <View style={styles.viewSwitcher}>
                    <TouchableOpacity
                        style={[styles.viewOption, viewMode === 'list' && styles.activeViewOption]}
                        onPress={() => setViewMode('list')}
                    >
                        <Text style={styles.viewOptionText}>{StringConstants.LIST_VIEW}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.viewOption, viewMode === 'calendar' && styles.activeViewOption]}
                        onPress={() => setViewMode('calendar')}
                    >
                        <Text style={styles.viewOptionText}>{StringConstants.CALENDAR_VIEW}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                    <Image source={Icons.ic_search} style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search reminders..."
                        style={styles.searchInput}
                        placeholderTextColor={ColorConstants.DARK_CYAN}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>


                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersScrollContainer}
                >
                    <View style={styles.filtersRow}>

                        {/* CATEGORY */}
                        {/* <View style={styles.filterWrapper}>
                            <TouchableOpacity
                                ref={ref => { categoryRef.current = ref; }}
                                style={[styles.dropdownFilter, { width: 170 }]}
                                onPress={() => {
                                    categoryRef.current?.measureInWindow((x: number, y: number, width: number, height: number) => {
                                        setDropdownLayout({
                                            x,
                                            y: y + height + 4,
                                            width,
                                        });
                                        setOpenDropdown(prev => prev === 'category' ? null : 'category');
                                    });
                                }}
                            >
                                <Text style={styles.dropdownFilterText}>{selectedCategory}</Text>
                                <Image
                                    source={openDropdown === 'category' ? Icons.ic_up_arrow : Icons.ic_down_arrow}
                                    style={styles.dropdownArrow}
                                />
                            </TouchableOpacity>
                        </View> */}

                        {/* SORT */}
                        <View style={styles.filterWrapper}>
                            <TouchableOpacity
                                ref={ref => { sortRef.current = ref; }}
                                style={[styles.dropdownFilter, { width: 180 }]}
                                onPress={() => {
                                    sortRef.current?.measureInWindow((x: number, y: number, width: number, height: number) => {
                                        setDropdownLayout({
                                            x,
                                            y: y + height + 4,
                                            width,
                                        });
                                        setOpenDropdown(prev => prev === 'sort' ? null : 'sort');
                                    });
                                }}
                            >
                                <Text style={styles.dropdownFilterText}>{selectedSort}</Text>
                                <Image
                                    source={openDropdown === 'sort' ? Icons.ic_up_arrow : Icons.ic_down_arrow}
                                    style={styles.dropdownArrow}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* STATUS */}
                        <View style={styles.filterWrapper}>
                            <TouchableOpacity
                                ref={ref => { statusRef.current = ref; }}
                                style={[styles.dropdownFilter, { width: 130 }]}
                                onPress={() => {
                                    statusRef.current?.measureInWindow((x: number, y: number, width: number, height: number) => {
                                        setDropdownLayout({
                                            x,
                                            y: y + height + 4,
                                            width,
                                        });
                                        setOpenDropdown(prev => prev === 'status' ? null : 'status');
                                    });
                                }}
                            >
                                <Text style={styles.dropdownFilterText}>{selectedStatus}</Text>
                                <Image
                                    source={openDropdown === 'status' ? Icons.ic_up_arrow : Icons.ic_down_arrow}
                                    style={styles.dropdownArrow}
                                />
                            </TouchableOpacity>
                        </View>

                    </View>
                </ScrollView>


                {/* CALENDAR VIEW */}
                {viewMode === 'calendar' && (
                    <View style={styles.calendarContainer}>
                        <Calendar
                            current={selectedDate}
                            onDayPress={(day: DateData) => {
                                setSelectedDate(day.dateString);
                            }}
                            markedDates={getMarkedDates()}
                            theme={{
                                backgroundColor: '#ffffff',
                                calendarBackground: '#ffffff',
                                textSectionTitleColor: '#b6c1cd',
                                selectedDayBackgroundColor: ColorConstants.LIGHT_PEACH3,
                                selectedDayTextColor: ColorConstants.PRIMARY_BROWN,
                                todayTextColor: ColorConstants.PRIMARY_BROWN,
                                dayTextColor: '#2d4150',
                                textDisabledColor: '#d9e1e8',
                                dotColor: ColorConstants.PRIMARY_BROWN,
                                selectedDotColor: ColorConstants.PRIMARY_BROWN,
                                arrowColor: ColorConstants.PRIMARY_BROWN,
                                monthTextColor: ColorConstants.BLACK2,
                                indicatorColor: ColorConstants.PRIMARY_BROWN,
                                textDayFontFamily: Fonts.mulishRegular,
                                textMonthFontFamily: Fonts.ManropeMedium,
                                textDayHeaderFontFamily: Fonts.mulishRegular,
                                textDayFontSize: 14,
                                textMonthFontSize: 16,
                                textDayHeaderFontSize: 12
                            }}
                        />
                    </View>
                )}


                <View style={styles.listViewWrapper}>
                    <View style={styles.listHeader}>
                        <Text style={styles.listTitle}>
                            {viewMode === 'calendar' ? `Reminders for ${formattedSelectedDate}` : 'Active Reminders'}
                        </Text>
                        {viewMode === 'list' && <Text style={styles.listCount}>{filteredReminders.length} tasks</Text>}
                    </View>

                    {isLoading ? (
                        <View style={{ padding: 40, alignItems: 'center' }}>
                            <ActivityIndicator size="large" color={ColorConstants.PRIMARY_BROWN} />
                        </View>
                    ) : (
                        <FlatList
                            data={paginatedReminders}
                            renderItem={renderReminderItem}
                            keyExtractor={item => item.id}
                            scrollEnabled={false}
                            contentContainerStyle={styles.listContainer}
                            ListEmptyComponent={
                                <View style={{ padding: 20, alignItems: 'center' }}>
                                    <Text style={{ fontFamily: Fonts.mulishRegular, color: ColorConstants.GRAY }}>No reminders found</Text>
                                </View>
                            }
                        />
                    )}

                    {!isLoading && totalPages > 1 && (
                        <View style={styles.paginationContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.pageButton,
                                    currentPage === 1 && styles.pageButtonDisabled
                                ]}
                                disabled={currentPage === 1}
                                onPress={() => handlePageChange(currentPage - 1)}
                            >
                                <Text
                                    style={[
                                        styles.pageArrowText,
                                        currentPage === 1 && styles.pageArrowTextDisabled
                                    ]}
                                >
                                    {'<'}
                                </Text>
                            </TouchableOpacity>

                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(page => {
                                    const maxVisible = 4;
                                    let start = Math.max(1, currentPage - 1);
                                    let end = start + maxVisible - 1;

                                    if (end > totalPages) {
                                        end = totalPages;
                                        start = Math.max(1, end - maxVisible + 1);
                                    }
                                    return page >= start && page <= end;
                                })
                                .map((page) => {
                                    const isActive = page === currentPage;
                                    return (
                                        <TouchableOpacity
                                            key={page}
                                            style={[
                                                styles.pageNumberButton,
                                                isActive && styles.pageNumberButtonActive
                                            ]}
                                            onPress={() => handlePageChange(page)}
                                        >
                                            <Text
                                                style={[
                                                    styles.pageNumberText,
                                                    isActive && styles.pageNumberTextActive
                                                ]}
                                            >
                                                {page}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}

                            <TouchableOpacity
                                style={[
                                    styles.pageButton,
                                    currentPage === totalPages && styles.pageButtonDisabled
                                ]}
                                disabled={currentPage === totalPages}
                                onPress={() => handlePageChange(currentPage + 1)}
                            >
                                <Text
                                    style={[
                                        styles.pageArrowText,
                                        currentPage === totalPages && styles.pageArrowTextDisabled
                                    ]}
                                >
                                    {'>'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

            </ScrollView>
            {openDropdown && dropdownLayout && (
                <Modal
                    visible={!!openDropdown}
                    transparent={true}
                    animationType="none"
                    onRequestClose={() => setOpenDropdown(null)}
                >
                    <TouchableWithoutFeedback onPress={() => setOpenDropdown(null)}>
                        <View style={{ flex: 1 }}>
                            <View
                                style={[
                                    styles.portalDropdown,
                                    {
                                        top: dropdownLayout.y,
                                        left: dropdownLayout.x,
                                        width: dropdownLayout.width,
                                    },
                                ]}
                            >
                                {(openDropdown === 'category'
                                    ? categories
                                    : openDropdown === 'sort'
                                        ? SORT_OPTIONS
                                        : STATUS_OPTIONS
                                ).map(item => (
                                    <TouchableOpacity
                                        key={item}
                                        style={styles.dropdownItem}
                                        onPress={() => {
                                            if (openDropdown === 'category') setSelectedCategory(item);
                                            else if (openDropdown === 'sort') setSelectedSort(item);
                                            else if (openDropdown === 'status') setSelectedStatus(item);
                                            setOpenDropdown(null);
                                        }}
                                    >
                                        <Text style={styles.dropdownItemText}>{item}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            )}
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorConstants.WHITE,
    },
    // User's Styles
    button: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        height: 36,
        marginTop: 10,
        marginBottom: 13,
        marginHorizontal: 20
    },
    buttonText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.WHITE,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        width: 9,
        height: 9,
        resizeMode: 'contain',
        marginRight: 6,
        tintColor: ColorConstants.WHITE,
    },
    arrowWrapper: {
        padding: 12
    },
    updownArrow: {
        width: 10,
        height: 10,
        resizeMode: 'contain',
        marginLeft: 10,
        tintColor: ColorConstants.WHITE,
    },
    dropdownContainer: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 8,
        marginTop: 6,
        elevation: 6, // Android shadow
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        overflow: 'hidden',
        marginHorizontal: 20,
        marginBottom: 20,
        zIndex: 10,
    },
    selectedItem: {
        backgroundColor: ColorConstants.LIGHT_PEACH,
    },
    dropdownIcon: {
        width: 10,
        height: 10,
        resizeMode: 'contain',
        tintColor: ColorConstants.DARK_CYAN,
        marginRight: 8,
    },
    dropdownText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
    },
    filterWrapper: {
        position: 'relative',
        zIndex: 999,
    },

    dropdownBox: {
        position: 'absolute',
        top: 46,
        left: 0,
        right: 0,
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        paddingVertical: 6,

        zIndex: 999,
        elevation: 8, // Android
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },

    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },

    dropdownItemText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
    },

    portalDropdown: {
        position: 'absolute',
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        paddingVertical: 6,

        zIndex: 9999,
        elevation: 20,

        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
    },

    statsContainer: {
        paddingHorizontal: 20,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        height: 93,
    },
    statLabel: {
        fontFamily: Fonts.ManropeRegular,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 14,
    },
    statCountContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statCount: {
        fontFamily: Fonts.mulishSemiBold,
        fontSize: 20,
        color: ColorConstants.BLACK2,
    },
    statIcon: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
    },
    viewSwitcher: {
        flexDirection: 'row',
        backgroundColor: ColorConstants.LIGHT_PEACH,
        marginHorizontal: 20,
        borderRadius: 8,
        padding: 4,
        marginBottom: 12,
    },
    viewOption: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 6,
    },
    activeViewOption: {
        backgroundColor: ColorConstants.WHITE,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    viewOptionText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
    },
    searchContainer: {
        marginHorizontal: 20,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        height: 40,
        marginBottom: 12,
    },
    searchIcon: {
        width: 14,
        height: 14,
        tintColor: ColorConstants.BLACK2,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.BLACK,
    },
    filtersScrollContainer: {
        paddingHorizontal: 20,   // equal space left & right
        marginBottom: 20
    },

    filtersRow: {
        flexDirection: 'row',
        gap: 12,
    },
    dropdownFilter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: ColorConstants.WHITE,
    },
    dropdownFilterText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
        marginRight: 10,
    },
    dropdownArrow: {
        width: 10,
        height: 10,
        tintColor: ColorConstants.DARK_CYAN,
        resizeMode: 'contain'
    },
    listViewWrapper: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3,
        paddingTop: 15,
        marginBottom: 16,
        marginHorizontal: 20,
        paddingBottom: 5

    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 15,
        zIndex: 0
    },
    listTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.BLACK2,
    },
    listCount: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
    },
    listContainer: {
        paddingHorizontal: 20,
    },
    reminderCard: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    reminderHeader: {
        flexDirection: 'row',
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
        marginRight: 14,
    },

    checkboxIcon: {
        width: 14,
        height: 14,
        tintColor: ColorConstants.PRIMARY_BROWN,
    },
    reminderContent: {
        flex: 1,
    },
    calendarContainer: {
        marginBottom: 20,
        marginHorizontal: 20,
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 12,
        padding: 5,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.10,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 2 },
        borderWidth: 1,
        borderColor: ColorConstants.GRAY3
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    typeTag: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    todoTag: {
        backgroundColor: '#EBF5FF',
    },
    reminderTag: {
        backgroundColor: '#FFF7ED',
    },
    typeTagText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 10,
        color: ColorConstants.BLACK2,
        textTransform: 'capitalize',
        letterSpacing: 0.5,
    },
    reminderTitle: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 16,
        color: ColorConstants.BLACK2,
        flex: 1,
        marginRight: 10,
    },
    priorityAndDateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    priorityTag: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
    },
    priorityText: {
        fontFamily: Fonts.ManropeBold,
        fontSize: 9,
        color: ColorConstants.WHITE,
        textTransform: 'uppercase',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 16,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    metaIcon: {
        width: 14,
        height: 14,
        tintColor: '#9CA3AF',
        marginRight: 6,
        resizeMode: 'contain',
    },
    metaText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: '#6B7280',
    },
    description: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 13,
        color: ColorConstants.DARK_CYAN,
        marginBottom: 16,
        lineHeight: 18,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tagsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    tag: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    tagText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 10,
        color: '#4B5563',
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 10,
    },
    actionButton: {
        width: 32,
        height: 32,
        backgroundColor: '#F9FAFB',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    actionIcon: {
        width: 16,
        height: 16,
        tintColor: ColorConstants.BLACK2,
        resizeMode: 'contain',
    },
    paginationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 20,
        gap: 6,
    },
    pageButton: {
        minWidth: 36,
        height: 32,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: ColorConstants.WHITE,
    },
    pageButtonDisabled: {
        opacity: 0.5,
    },
    pageArrowText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
    },
    pageArrowTextDisabled: {
        color: ColorConstants.GRAY2,
    },
    pageNumberButton: {
        minWidth: 32,
        height: 32,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: ColorConstants.WHITE,
    },
    pageNumberButtonActive: {
        backgroundColor: ColorConstants.BLACK2,
        borderColor: ColorConstants.BLACK2,
    },
    pageNumberText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.DARK_CYAN,
    },
    pageNumberTextActive: {
        color: ColorConstants.WHITE,
    },
});
