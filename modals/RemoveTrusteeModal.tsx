import { Icons } from '@/assets';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface RemoveTrusteeModalProps {
  visible: boolean;
  trusteeName: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const RemoveTrusteeModal: React.FC<RemoveTrusteeModalProps> = ({
  visible,
  trusteeName,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} disabled={isLoading}>
            <Image source={Icons.ic_cross} style={styles.closeIcon} />
          </TouchableOpacity>

          <Text style={styles.title}>Remove Trustee?</Text>

          <Text style={styles.subtitle}>
            Are you sure you want to remove{' '}
            <Text style={styles.subtitleBold}>{trusteeName}</Text> access? They will no longer be able to view this
            document.
          </Text>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.removeBtn, isLoading && { opacity: 0.8 }]}
              onPress={onConfirm}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={ColorConstants.WHITE} />
              ) : (
                <Text style={styles.removeText}>Remove Access</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: ColorConstants.WHITE,
    borderRadius: 22,
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 25,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  closeIcon: {
    width: 12,
    height: 12,
    tintColor: ColorConstants.GRAY5,
    resizeMode: 'contain',
  },
  title: {
    fontFamily: Fonts.ManropeSemiBold,
    fontSize: 20,
    color: ColorConstants.PRIMARY_BROWN,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: Fonts.ManropeMedium,
    fontSize: 15,
    color: '#5B6472',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 10,
    marginBottom: 22,
  },
  subtitleBold: {
    fontFamily: Fonts.ManropeSemiBold,
    color: ColorConstants.DARK_CYAN,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: ColorConstants.WHITE,
    minWidth: 130,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: Fonts.ManropeMedium,
    fontSize: 18,
    color: '#4B5563',
  },
  removeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: ColorConstants.PRIMARY_BROWN,
    minWidth: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    fontFamily: Fonts.ManropeMedium,
    fontSize: 18,
    color: ColorConstants.WHITE,
  },
});

export default RemoveTrusteeModal;
