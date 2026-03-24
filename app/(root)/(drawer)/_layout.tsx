// app/(root)/(drawer)/_layout.tsx
import CustomDrawerContent from '@/components/CustomDrawerContent';
import { Drawer } from 'expo-router/drawer';
import { Dimensions } from 'react-native';
import { useEffect } from 'react';
import { WebSocketService } from '../../services/WebSocketService';

const width = Dimensions.get('window').width;

// Global online status websocket
let onlineStatusWs: WebSocketService | null = null;

export default function DrawerLayout() {
    useEffect(() => {
        if (!onlineStatusWs) {
            onlineStatusWs = new WebSocketService('ws/status/');
            onlineStatusWs.connect();
        }

        return () => {
            if (onlineStatusWs) {
                onlineStatusWs.cleanup();
                onlineStatusWs = null;
            }
        };
    }, []);

    return (
        <Drawer
            screenOptions={{
                headerShown: false,
                drawerStyle: { width: width * 0.7 },
            }}
            drawerContent={(props) => <CustomDrawerContent {...props} />}
        />
    );
}
