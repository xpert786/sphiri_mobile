import { apiGet } from '@/api/apiMethods';
import { ApiConstants } from '@/api/endpoints';
import { Icons } from '@/assets';
import CustomDatePicker from '@/components/CustomDatePicker';
import CustomTextInput from '@/components/CustomTextInput';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts'; // Ensuring correct font import
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';


interface NewReminderModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (formData: any) => void;
}

interface PriorityItem {
    id: number;
    name: string;
    level: number;
    color: string;
}

interface RecurrencePattern {
    value: string;
    label: string;
}

interface AdvanceNoticeOption {
    value: number;
    label: string;
}

interface AssociatedContact {
    id: number;
    name: string;
    email: string;
    phone: string;
}

interface DocumentItem {
    id: number;
    title: string;
    file_type: string;
    description: string;
    file_url: string;
    file_name: string;
}

interface Assignee {
    id: number;
    name: string;
    email: string;
}

interface CategoryItem {
    id: number;
    name: string;
    color: string;
    icon: string;
}

const NewReminderModal: React.FC<NewReminderModalProps> = ({
    visible,
    onClose,
    onSave,
}) => {
    // ---- STATE ----
    const createInitialFormData = () => ({
        taskTitle: '',
        description: '',
        category: '',
        priority: '',
        dueDate: null as Date | null,
        time: null as Date | null,
        recurring: false,
        associatedContact: [] as number[], // Changed to array of IDs
        associatedVendor: [] as number[], // Changed to array of IDs
        assignedTo: [] as number[], // Changed to array of IDs
        linkUrl: '',
        emailNotification: false,
        advanceNotice: '',
        pushNotification: false,
        smsNotification: false,
        // Recurring
        repeatEvery: '',
        endDate: null as Date | null,
    });

    const [selectedFile, setSelectedFile] = useState<any>(null);
    const [fileUploaded, setFileUploaded] = useState(false);
    const [formData, setFormData] = useState(createInitialFormData);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Dropdown visibility states
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [datePickerMode, setDatePickerMode] = useState<'dueDate' | 'endDate'>('dueDate');

    // Form labels and IDs state
    const [prioritiesList, setPrioritiesList] = useState<PriorityItem[]>([]);
    const [recurrencePatterns, setRecurrencePatterns] = useState<RecurrencePattern[]>([]);
    const [advanceNoticeOptions, setAdvanceNoticeOptions] = useState<AdvanceNoticeOption[]>([]);
    const [contactsList, setContactsList] = useState<AssociatedContact[]>([]);
    const [linkedContactsList, setLinkedContactsList] = useState<any[]>([]); // New list for Associated Contacts
    const [vendorContacts, setVendorContacts] = useState<any[]>([]);
    const [documentsList, setDocumentsList] = useState<DocumentItem[]>([]);
    const [assigneesList, setAssigneesList] = useState<Assignee[]>([]);
    const [categoriesList, setCategoriesList] = useState<CategoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [apiTags, setApiTags] = useState<{ label: string; value: string }[]>([]);
    const [showTagDropdown, setShowTagDropdown] = useState(false);
    const [tags, setTags] = useState<{ id: string | number; name: string }[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (visible) {
            setFormData(createInitialFormData());
            setErrors({});
            setSelectedFile(null);
            setFileUploaded(false);
            fetchFormOptions();
            fetchTags();
        }
    }, [visible]);


    const fetchFormOptions = async () => {
        try {
            setLoading(true);
            const [optionsRes, contactsRes, vendorsRes] = await Promise.all([
                apiGet(ApiConstants.FORM_OPTIONS),
                apiGet(ApiConstants.LINKED_CONTACTS),
                apiGet(ApiConstants.VENDORS_LIST_CONTACTS)
            ]);

            if (optionsRes.data) {
                setPrioritiesList(optionsRes.data.priorities || []);
                setRecurrencePatterns(optionsRes.data.recurrence_patterns || []);
                setAdvanceNoticeOptions(optionsRes.data.advance_notice_options || []);
                setContactsList(optionsRes.data.associated_contacts || []);
                setDocumentsList(optionsRes.data.documents || []);
                setAssigneesList(optionsRes.data.assigned_to || []);
                setCategoriesList(optionsRes.data.categories || []);
            }

            if (contactsRes.data) {
                setLinkedContactsList(contactsRes.data || []);
            }

            if (vendorsRes.data) {
                setVendorContacts(vendorsRes.data);
            }
        } catch (error) {
            console.error('Error fetching form options:', error);
        } finally {
            setLoading(false);
        }
    };


    const fetchTags = async () => {
        try {
            const res = await apiGet(ApiConstants.DOCUMENT_TAGS);
            if (res.status === 200 || res.status === 201) {
                const formatted = (res.data.results || []).map((item: any) => ({
                    label: item.name || item.label,
                    value: item.id?.toString() || item.value
                }));
                setApiTags(formatted);
            }
        } catch (error) {
            console.error('Error fetching tags in modal:', error);
        }
    };



    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const formatDate = (date: Date | null) => {
        if (!date) return '';
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

    const formatTime = (date: Date | null) => {
        if (!date) return '';
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
    };

    const getFormattedDate = (date: Date | null) => {
        return date ? formatDate(date) : 'MM/DD/YYYY';
    };

    const getFormattedTime = (date: Date | null) => {
        return date ? formatTime(date) : '-- : -- --';
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (selectedDate) {
            if (datePickerMode === 'dueDate') {
                handleInputChange('dueDate', selectedDate);
            } else {
                handleInputChange('endDate', selectedDate);
            }
        }
    };

    const handleTimeChange = (event: any, selectedTime?: Date) => {
        if (selectedTime) {
            handleInputChange('time', selectedTime);
        }
    };

    const toggleDropdown = (key: string) => {
        setOpenDropdown(prev => (prev === key ? null : key));
    };

    const selectOption = (field: string, value: any, isMulti: boolean = false) => {
        if (isMulti) {
            const currentValues = (formData[field as keyof typeof formData] as any[]) || [];
            const index = currentValues.indexOf(value);
            let nextValues = [...currentValues];
            if (index > -1) {
                nextValues.splice(index, 1);
            } else {
                nextValues.push(value);
            }
            handleInputChange(field, nextValues);
        } else {
            handleInputChange(field, value);
            setOpenDropdown(null);
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.taskTitle.trim()) {
            newErrors.taskTitle = 'Task title is required';
        }
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }
        if (!formData.dueDate) {
            newErrors.dueDate = 'Due date is required';
        }
        if (!formData.time) {
            newErrors.time = 'Time is required';
        }
        if (!formData.associatedContact || formData.associatedContact.length === 0) {
            newErrors.associatedContact = 'Link to contact is required';
        }
        if (!formData.associatedVendor || formData.associatedVendor.length === 0) {
            newErrors.associatedVendor = 'Link to vendor is required';
        }
        if (!formData.category) {
            newErrors.category = 'Link to document is required';
        }
        if (!formData.assignedTo || formData.assignedTo.length === 0) {
            newErrors.assignedTo = 'Assigned to is required';
        }
        if (!formData.priority) {
            newErrors.priority = 'Priority is required';
        }

        // Category validation: atleast one category should be selected
        const hasCategory = categoriesList.some(cat => !!formData[`category_${cat.id}` as keyof typeof formData]);
        if (!hasCategory) {
            newErrors.categories = 'Select at least one category';
        }

        // Advance Notice validation: if notifications are enabled, it's mandatory
        const anyNotification = formData.emailNotification || formData.pushNotification || formData.smsNotification;
        if (anyNotification && !formData.advanceNotice) {
            newErrors.advanceNotice = 'Advance notice is required when notifications are enabled';
        }

        if (formData.recurring) {
            if (!formData.repeatEvery) {
                newErrors.repeatEvery = 'Repeat interval is required';
            }
            if (!formData.endDate) {
                newErrors.endDate = 'End date is required';
            }
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        setSaving(true);
        try {
            await onSave(formData);
        } finally {
            setSaving(false);
        }
    };

    const handleSelectTag = (tag: { label: string; value: string }) => {
        if (!tags.find(t => t.id === tag.value)) {
            const newTags = [...tags, { id: tag.value, name: tag.label }];
            setTags(newTags);

            // Clear tag error
            if (errors.tags) {
                setErrors(prev => {
                    const updated = { ...prev };
                    delete updated.tags;
                    return updated;
                });
            }
        }
        setShowTagDropdown(false);
    };

    const handleRemoveTag = (tagId: string | number) => {
        setTags(tags.filter(tag => tag.id !== tagId));
    };


    // ---- RENDERERS ----

    const renderDropdown = (
        label: string,
        fieldKey: string,
        value: any,
        options: any[],
        zIndexVal: number,
        error?: string,
        isMulti: boolean = false
    ) => {
        const getOptionLabel = (opt: any) => {
            if (typeof opt === 'string') return opt;
            if (fieldKey === 'assignedTo') return opt.email || opt.name;
            return opt.name || opt.label || opt.title;
        };

        const getOptionValue = (opt: any) => {
            if (typeof opt === 'string') return opt;
            return opt.id !== undefined ? opt.id : (opt.value !== undefined ? opt.value : (opt.name || opt.label || opt.title));
        };

        let displayLabel = '';
        if (isMulti) {
            const selectedValues = (value as any[]) || [];
            const labels = options
                .filter(opt => selectedValues.includes(getOptionValue(opt)))
                .map(opt => getOptionLabel(opt));
            displayLabel = labels.join(', ');
        } else {
            const selectedOption = options.find(opt => String(getOptionValue(opt)) === String(value));
            displayLabel = selectedOption ? getOptionLabel(selectedOption) : '';
        }

        return (
            <View style={[styles.inputContainer, { zIndex: openDropdown === fieldKey ? 1000 : zIndexVal }]}>
                <Text style={styles.label}>{label}</Text>
                <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => toggleDropdown(fieldKey)}
                    activeOpacity={0.8}
                >
                    <Text numberOfLines={1} style={[styles.inputText, !displayLabel && { color: ColorConstants.GRAY_50 }]}>
                        {displayLabel || `Select ${label.toLowerCase()}`}
                    </Text>
                    <Image source={Icons.ic_down_arrow} style={styles.arrowIcon} />
                </TouchableOpacity>

                {openDropdown === fieldKey && (
                    <View style={styles.dropdownList}>
                        <ScrollView
                            nestedScrollEnabled={true}
                            keyboardShouldPersistTaps="handled"
                        >
                            {options.map((opt, idx) => {
                                const optionLabel = getOptionLabel(opt);
                                const optionValue = getOptionValue(opt);
                                const isSelected = isMulti
                                    ? ((value as any[]) || []).includes(optionValue)
                                    : String(optionValue) === String(value);

                                return (
                                    <TouchableOpacity
                                        key={idx}
                                        style={[styles.dropdownItem, isSelected && { backgroundColor: '#F0F0F0' }]}
                                        onPress={() => selectOption(fieldKey, optionValue, isMulti)}
                                    >
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={[styles.dropdownItemText, isSelected && { color: ColorConstants.PRIMARY_BROWN, fontWeight: '600' }]}>
                                                {optionLabel}
                                            </Text>
                                            {isSelected && isMulti && (
                                                <Image source={Icons.ic_checkbox_tick} style={{ width: 14, height: 14, tintColor: ColorConstants.PRIMARY_BROWN }} />
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
        );
    };




    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}
            >
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Add New Reminder</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Image source={Icons.ic_cross} style={styles.closeIcon} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, openDropdown === 'advanceNotice' && { paddingBottom: 170 }]}>
                        {/* Task Title */}
                        <CustomTextInput
                            label="Task Title"
                            value={formData.taskTitle}
                            onChangeText={(t) => handleInputChange('taskTitle', t)}
                            placeholder="What need to be done ?"
                            error={errors.taskTitle}
                        />

                        {/* Description */}
                        <CustomTextInput
                            label="Description"
                            value={formData.description}
                            onChangeText={(t) => handleInputChange('description', t)}
                            placeholder="Add details, notes, or instructions..."
                            multiline
                            inputStyles={{ height: 100, alignItems: 'flex-start' }}
                            error={errors.description}
                        />

                        {/* Schedule Section */}
                        <Text style={styles.sectionHeader}>Schedule</Text>

                        {/* Due Date */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Due Date</Text>
                            <TouchableOpacity
                                style={styles.dropdownButton}
                                onPress={() => {
                                    setDatePickerMode('dueDate');
                                    setShowDatePicker(true);
                                }}
                            >
                                <Text style={[styles.inputText, !formData.dueDate && { color: ColorConstants.GRAY_50 }]}>
                                    {getFormattedDate(formData.dueDate)}
                                </Text>
                                <Image source={Icons.ic_calendar_outline} style={styles.inputIcon} />
                            </TouchableOpacity>
                            {errors.dueDate ? <Text style={styles.errorText}>{errors.dueDate}</Text> : null}
                        </View>

                        {/* Time */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Time</Text>
                            <TouchableOpacity
                                style={styles.dropdownButton}
                                onPress={() => setShowTimePicker(true)}
                            >
                                <Text style={[styles.inputText, !formData.time && { color: ColorConstants.GRAY_50 }]}>
                                    {getFormattedTime(formData.time)}
                                </Text>
                                <Image source={Icons.ic_clock} style={styles.inputIcon} />
                            </TouchableOpacity>
                            {errors.time ? <Text style={styles.errorText}>{errors.time}</Text> : null}
                        </View>

                        {/* Recurring Toggle */}
                        <View style={styles.rowToggle}>
                            <Switch
                                trackColor={{ false: '#E0E0E0', true: ColorConstants.PRIMARY_BROWN }}
                                thumbColor={ColorConstants.WHITE}
                                onValueChange={(val) => handleInputChange('recurring', val)}
                                value={formData.recurring}
                                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                            />
                            <Text style={styles.toggleLabel}>Make this a recurring task</Text>
                        </View>

                        {/* Recurring Tasks Fields */}
                        {formData.recurring && (
                            <>
                                {renderDropdown('Repeat Every', 'repeatEvery', formData.repeatEvery, recurrencePatterns, 40, errors.repeatEvery)}

                                <View style={[styles.inputContainer, { zIndex: 35 }]}>
                                    <Text style={styles.label}>End Date</Text>
                                    <TouchableOpacity
                                        style={styles.dropdownButton}
                                        onPress={() => {
                                            setDatePickerMode('endDate');
                                            setShowEndDatePicker(true);
                                        }}
                                    >
                                        <Text style={[styles.inputText, !formData.endDate && { color: ColorConstants.GRAY_50 }]}>
                                            {getFormattedDate(formData.endDate as Date)}
                                        </Text>
                                        <Image source={Icons.ic_calendar_outline} style={styles.inputIcon} />
                                    </TouchableOpacity>
                                    {errors.endDate ? <Text style={styles.errorText}>{errors.endDate}</Text> : null}
                                </View>
                            </>
                        )}

                        {/* Associations */}
                        <Text style={styles.sectionHeader}>Associations</Text>
                        {renderDropdown('Link to Contact', 'associatedContact', formData.associatedContact, linkedContactsList, 30, errors.associatedContact, true)}
                        {renderDropdown('Link to Vendor', 'associatedVendor', formData.associatedVendor, vendorContacts, 28, errors.associatedVendor, true)}
                        {renderDropdown('Link To Document', 'category', formData.category, documentsList, 25, errors.category)}
                        {renderDropdown('Assigned To', 'assignedTo', formData.assignedTo, assigneesList, 20, errors.assignedTo, true)}
                        {renderDropdown('Priority', 'priority', formData.priority, prioritiesList, 15, errors.priority)}


                        {/* Tags Dropdown */}
                        <View style={[styles.inputContainer, { zIndex: showTagDropdown ? 1000 : 12 }]}>
                            <Text style={styles.label}>Tags</Text>
                            <TouchableOpacity
                                style={styles.dropdownButton}
                                onPress={() => {
                                    setOpenDropdown(null);
                                    setShowTagDropdown(!showTagDropdown);
                                }}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.inputText, { color: ColorConstants.GRAY }]}>Select Tags</Text>
                                <Image source={Icons.ic_down_arrow} style={styles.arrowIcon} />
                            </TouchableOpacity>
                            {errors.tags ? <Text style={styles.dropdownErrorText}>{errors.tags}</Text> : null}

                            {showTagDropdown && (
                                <View style={styles.dropdownList}>
                                    <ScrollView
                                        nestedScrollEnabled={true}
                                        showsVerticalScrollIndicator={true}
                                    >
                                        {apiTags.filter(opt => !tags.find(t => t.id.toString() === opt.value)).map((opt, idx) => (
                                            <TouchableOpacity
                                                key={idx}
                                                style={styles.dropdownItem}
                                                onPress={() => handleSelectTag(opt)}
                                            >
                                                <Text style={styles.dropdownItemText}>{opt.label}</Text>
                                            </TouchableOpacity>
                                        ))}
                                        {apiTags.filter(opt => !tags.find(t => t.id.toString() === opt.value)).length === 0 && (
                                            <View style={styles.dropdownItem}>
                                                <Text style={[styles.dropdownItemText, { color: ColorConstants.GRAY }]}>No more tags available</Text>
                                            </View>
                                        )}
                                    </ScrollView>
                                </View>
                            )}
                        </View>

                        {/* Display Tags */}
                        {tags.length > 0 && (
                            <View style={styles.tagsContainer}>
                                {tags.map((tag, index) => (
                                    <View key={index} style={styles.tagChip}>
                                        <Text style={styles.tagText}>{tag.name}</Text>
                                        <TouchableOpacity
                                            onPress={() => handleRemoveTag(tag.id)}
                                            style={styles.removeTagButton}
                                        >
                                            <Image source={Icons.ic_cross} style={styles.removeTagIcon} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}



                        {/* Category */}
                        <Text style={styles.sectionHeader}>Category</Text>
                        <View style={styles.categoryContainer}>
                            {categoriesList.map((cat) => (
                                <View key={cat.id} style={styles.categoryRow}>
                                    <Switch
                                        trackColor={{ false: '#E0E0E0', true: ColorConstants.PRIMARY_BROWN }}
                                        thumbColor={ColorConstants.WHITE}
                                        onValueChange={(val) => {
                                            const categoryKey = `category_${cat.id}`;
                                            handleInputChange(categoryKey, val);
                                        }}
                                        value={!!formData[`category_${cat.id}` as keyof typeof formData]}
                                        style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                                    />
                                    <Text style={styles.categoryLabel}>{cat.name}</Text>
                                </View>
                            ))}
                        </View>
                        {errors.categories ? <Text style={styles.errorText}>{errors.categories}</Text> : null}

                        {/* Notifications */}
                        <Text style={[styles.sectionHeader, { marginTop: 30 }]}>Notifications</Text>
                        <Text style={styles.notifyViaLabel}>Notify Via</Text>

                        <View style={styles.notificationRow}>
                            <Switch
                                trackColor={{ false: '#E0E0E0', true: ColorConstants.PRIMARY_BROWN }}
                                thumbColor={ColorConstants.WHITE}
                                onValueChange={(val) => handleInputChange('emailNotification', val)}
                                value={formData.emailNotification}
                                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                            />
                            <Text style={styles.notificationLabel}>Email</Text>
                        </View>

                        <View style={styles.notificationRow}>
                            <Switch
                                trackColor={{ false: '#E0E0E0', true: ColorConstants.PRIMARY_BROWN }}
                                thumbColor={ColorConstants.WHITE}
                                onValueChange={(val) => handleInputChange('pushNotification', val)}
                                value={formData.pushNotification}
                                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                            />
                            <Text style={styles.notificationLabel}>Push Notification</Text>
                        </View>

                        <View style={[styles.notificationRow, { marginBottom: 14 }]}>
                            <Switch
                                trackColor={{ false: '#E0E0E0', true: ColorConstants.PRIMARY_BROWN }}
                                thumbColor={ColorConstants.WHITE}
                                onValueChange={(val) => handleInputChange('smsNotification', val)}
                                value={formData.smsNotification}
                                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                            />
                            <Text style={styles.notificationLabel}>SMS</Text>
                        </View>
                        {errors.notifications ? <Text style={styles.errorText}>{errors.notifications}</Text> : null}

                        {/* Advance Notice Dropdown */}
                        {renderDropdown('Advance Notice', 'advanceNotice', formData.advanceNotice, advanceNoticeOptions, 10, errors.advanceNotice)}


                        {/* Footer Actions */}
                        <View style={styles.footer}>
                            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.saveButton, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving}>
                                {saving ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Text style={styles.saveButtonText}>Creating...</Text>
                                        <ActivityIndicator size="small" color={ColorConstants.WHITE} />
                                    </View>
                                ) : (
                                    <Text style={styles.saveButtonText}>Create Reminder</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        <CustomDatePicker
                            show={showDatePicker}
                            value={formData.dueDate}
                            onChange={handleDateChange}
                            onClose={() => setShowDatePicker(false)}
                        />

                        <CustomDatePicker
                            show={showEndDatePicker}
                            value={formData.endDate}
                            onChange={handleDateChange}
                            onClose={() => setShowEndDatePicker(false)}
                        />

                        <CustomDatePicker
                            show={showTimePicker}
                            value={formData.time}
                            mode="time"
                            onChange={handleTimeChange}
                            onClose={() => setShowTimePicker(false)}
                        />

                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20
    },
    modalContainer: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 16,
        maxHeight: Dimensions.get('window').height * 0.9,
        overflow: 'hidden'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0'
    },
    headerTitle: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 20,
        color: ColorConstants.BLACK2
    },
    closeButton: {
        padding: 8,
        backgroundColor: '#F5F5F5',
        borderRadius: 20
    },
    closeIcon: {
        width: 12,
        height: 12,
        tintColor: ColorConstants.GRAY5
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 20
    },
    inputContainer: {
        marginBottom: 16
    },
    label: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        marginBottom: 8
    },

    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: ColorConstants.WHITE
    },
    inputText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 13,
        color: ColorConstants.BLACK,
        flex: 1,
        marginRight: 8
    },
    arrowIcon: {
        width: 12,
        height: 12,
        tintColor: ColorConstants.GRAY,
        resizeMode: 'contain'
    },
    inputIcon: {
        width: 16,
        height: 16,
        tintColor: ColorConstants.GRAY,
        resizeMode: 'contain'
    },
    dropdownList: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: ColorConstants.WHITE,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        marginTop: 4,
        zIndex: 1000,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        overflow: 'hidden'
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0'
    },
    dropdownItemText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.BLACK
    },
    sectionHeader: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.BLACK2,
        marginTop: 8,
        marginBottom: 12
    },
    rowToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 8
    },
    toggleLabel: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        marginLeft: 8
    },
    uploadBox: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
        borderRadius: 12,
        backgroundColor: '#FBFAFA',
        alignItems: 'center',
        paddingVertical: 20
    },
    uploadIcon: {
        width: 24,
        height: 24,
        tintColor: ColorConstants.BLACK2,
        marginBottom: 8
    },
    uploadText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2
    },
    uploadSubText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.GRAY,
        marginTop: 4
    },
    uploadedFileContainer: {
        flexDirection: 'row',
        backgroundColor: ColorConstants.WHITE,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        padding: 12,
        marginBottom: 20,
    },
    fileIconWrapper: {
        width: 30,
        height: 30,
        backgroundColor: ColorConstants.REDDISH_BROWN,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        marginTop: 8
    },
    fileInfo: {
        flex: 1
    },
    fileName: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.BLACK2
    },
    fileSize: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN,
        marginVertical: 4
    },
    progressBarBg: {
        height: 4,
        backgroundColor: '#F0F0F0',
        borderRadius: 2,
        marginBottom: 4
    },
    progressBarFill: {
        backgroundColor: '#4CAF50',
        height: '100%',
        borderRadius: 2
    },
    uploadStatusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    uploadSuccessText: {
        fontFamily: Fonts.mulishRegular,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN
    },
    uploadPercent: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 12,
        color: ColorConstants.DARK_CYAN
    },
    fileActions: {
        flexDirection: 'row',
        gap: 8,
        position: 'absolute',
        right: 15,
        top: 15
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0'
    },
    dividerText: {
        marginHorizontal: 12,
        fontFamily: Fonts.mulishRegular,
        fontSize: 14,
        color: ColorConstants.GRAY5
    },
    categoryContainer: {
        gap: 10,
        marginBottom: 8,
    },
    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: -10,
        // backgroundColor: ColorConstants.GRAY3,
        // paddingVertical: -4

    },
    categoryLabel: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        marginLeft: 4,
    },
    notifyViaLabel: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        marginBottom: 8,
    },
    notificationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        // marginBottom: -10,
    },
    notificationLabel: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 14,
        color: ColorConstants.BLACK2,
        marginLeft: 8,
    },
    errorText: {
        marginTop: 4,
        fontSize: 11,
        color: ColorConstants.RED,
        fontFamily: 'Inter-Regular',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    cancelButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginRight: 12
    },
    cancelButtonText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: '#666'
    },
    saveButton: {
        backgroundColor: ColorConstants.PRIMARY_BROWN,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8
    },
    saveButtonText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 16,
        color: ColorConstants.WHITE
    },
    dropdownErrorText: {
        marginTop: 4,
        fontSize: 11,
        color: ColorConstants.RED,
        fontFamily: 'Inter-Regular',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12
    },
    tagChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ColorConstants.GRAY3,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        gap: 6
    },
    tagText: {
        fontFamily: Fonts.ManropeMedium,
        fontSize: 12,
        color: ColorConstants.BLACK2
    },
    taggedPropertiesSection: {
        marginBottom: 20,
    },
    taggedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },
    removeTagButton: {
        padding: 2
    },
    removeTagIcon: {
        width: 10,
        height: 10,
        tintColor: ColorConstants.GRAY5
    },
});

export default NewReminderModal;