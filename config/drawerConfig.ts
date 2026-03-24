import { Icons } from '@/assets';

export type UserRole = 'home_owner' | 'family_member' | 'vendor';

export type DrawerItemConfig = {
    label: string;
    route: string;
    icon: any;
    isVectorIcon?: boolean;
};

export const DRAWER_CONFIG: Record<UserRole, DrawerItemConfig[]> = {


    home_owner: [
        { label: 'Dashboard', route: '/(root)/(drawer)/Home', icon: Icons.ic_dashboard },
        { label: 'Vendors & Contacts', route: '/(root)/(drawer)/(contacts)/contacts', icon: Icons.ic_contacts },
        { label: 'Messages', route: '/(root)/(drawer)/(homemessage)/homemessage', icon: Icons.ic_chat },
        { label: 'Documents', route: '/(root)/(drawer)/upload-document', icon: Icons.ic_doc_container },
        { label: 'Reminders', route: '/(root)/(drawer)/set-reminder', icon: 'bell-ring-outline', isVectorIcon: true },
        { label: 'Family Sharing', route: '/(root)/(drawer)/(family)/family', icon: Icons.ic_family_sharing },
        { label: 'Home Inventory', route: '/(root)/(drawer)/home-inventory', icon: 'cube-outline', isVectorIcon: true },
        { label: 'Account Settings', route: '/(root)/(drawer)/account-settings', icon: Icons.ic_settings },
        { label: 'Help & Support', route: '/(root)/(drawer)/support-tools', icon: 'tools', isVectorIcon: true },
        { label: 'Tools', route: '/(root)/(drawer)/tools', icon: 'wrench', isVectorIcon: true },
    ],

    family_member: [
        { label: 'Dashboard', route: '/(root)/(drawer)/Home', icon: Icons.ic_dashboard },
        { label: 'Documents', route: '/(root)/(drawer)/upload-document', icon: Icons.ic_doc_trustee },
        { label: 'Tasks & Reminders', route: '/(root)/(drawer)/tasks-and-reminders', icon: Icons.ic_bell_ring },
        { label: 'Emergency', route: '/(root)/(drawer)/emergency-trustee', icon: Icons.ic_warn_emergency },
        { label: 'Account Settings', route: '/(root)/(drawer)/trustee-settings', icon: Icons.ic_settings },
    ],

    vendor: [
        { label: 'Dashboard', route: '/(root)/(drawer)/Home', icon: Icons.ic_dashboard },
        { label: 'Grow Business', route: '/(root)/(drawer)/grow-business', icon: 'layers-triple-outline', isVectorIcon: true },
        { label: 'Clients', route: '/(root)/(drawer)/(clients)/clients', icon: Icons.ic_contacts },
        { label: 'Messages', route: '/(root)/(drawer)/(message)/message', icon: Icons.ic_chat },
        { label: 'Inventory', route: '/(root)/(drawer)/inventory-vendor', icon: 'cube-outline', isVectorIcon: true },
        { label: 'Reminders', route: '/(root)/(drawer)/reminders-vendor', icon: Icons.ic_notification },
        { label: 'Permissions', route: '/(root)/(drawer)/permissions', icon: Icons.ic_permissions },
        { label: 'Analytics', route: '/(root)/(drawer)/analytics-vendor', icon: Icons.ic_analytics2 },
        { label: 'Account Settings', route: '/(root)/(drawer)/vendor-settings', icon: Icons.ic_settings },

    ],
};
