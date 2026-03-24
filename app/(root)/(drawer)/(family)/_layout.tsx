// app/(root)/(drawer)/(family)/_layout.tsx
import { Stack } from 'expo-router';

export default function FamilyStackLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        />
    );
}
