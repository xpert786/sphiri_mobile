import { ColorConstants } from '@/constants/ColorConstants';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

type Props = {
  visible: boolean;
};

export default function CommonLoader({ visible }: Props) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color={ColorConstants.PRIMARY_BROWN} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // backgroundColor: 'rgba(0,0,0,0.2)',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
});
