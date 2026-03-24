import { Icons } from '@/assets';
import { ColorConstants } from '@/constants/ColorConstants';
import { Fonts } from '@/constants/Fonts';
import React from 'react';
import { Image, StyleProp, StyleSheet, Text, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';

interface CustomTextInputProps {
  parentStyles?: StyleProp<ViewStyle>;
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  maxLength?: number
  multiline?: boolean
  inputStyles?: any
  multiStyles?: any
  rightIcon?: any;
  onRightIconPress?: () => void;
  rightIconStyle?: any;
  error?: string
  editable?: boolean;
  leftIcon?: any;
  leftIconStyle?: any
  labelsStyles?: any
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  parentStyles,
  inputStyles,
  label,
  value,
  onChangeText,
  placeholder = '',
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  showPasswordToggle = false,
  showPassword = false,
  onTogglePassword,
  maxLength,
  multiline = false,
  multiStyles,
  rightIcon,
  onRightIconPress,
  rightIconStyle,
  error,
  editable,
  leftIcon,
  leftIconStyle,
  labelsStyles


}) => {
  return (
    <View style={[styles.section, parentStyles]}>
      <Text style={[styles.sectionTitle, labelsStyles]}>{label}</Text>
      <View style={[styles.inputContainer, multiline && { alignItems: 'flex-start' }, inputStyles]}>
        {leftIcon && (
          <View
            style={styles.leftIconContainer}>
            <Image
              source={leftIcon}
              style={[styles.leftIcon, leftIconStyle]}
              resizeMode="contain"
            />
          </View>
        )}

        <TextInput
          style={[
            styles.input,
            multiline && multiStyles
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={ColorConstants.GRAY_50}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          editable={editable}
        />
        {showPasswordToggle && onTogglePassword && (
          <TouchableOpacity style={styles.eyeIconContainer} onPress={onTogglePassword}>
            <Image
              source={showPassword ? Icons.ic_eye_show : Icons.ic_eye_hide}
              style={styles.eyeIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}

        {/* Custom right icon */}
        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={onRightIconPress}
            activeOpacity={onRightIconPress ? 0.7 : 1}
          >
            <Image
              source={rightIcon}
              style={[styles.rightIcon, rightIconStyle]}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: Fonts.ManropeMedium,
    fontSize: 14,
    color: ColorConstants.BLACK2,
    marginBottom: 6,
  },
  multilineInput: {
    minHeight: 100,
    paddingBottom: 10,
  },

  inputContainer: {
    borderWidth: 1,
    borderColor: ColorConstants.GRAY3,
    borderRadius: 12,
    backgroundColor: ColorConstants.WHITE,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12
  },
  input: {
    fontFamily: Fonts.mulishRegular,
    fontSize: 13,
    color: ColorConstants.DARK_CYAN,
    padding: 0,
    flex: 1,
  },
  eyeIconContainer: {
    padding: 4,
  },
  eyeIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    tintColor: ColorConstants.GRAY,
  },
  rightIconContainer: {
    paddingLeft: 10,
  },

  rightIcon: {
    tintColor: ColorConstants.GRAY,
  },
  errorText: {
    marginTop: 4,
    fontSize: 11,
    color: ColorConstants.RED,
    fontFamily: 'Inter-Regular',
  },
  leftIconContainer: {
    paddingRight: 10,
  },
  leftIcon: {
    height: 14,
    width: 14,
    resizeMode: 'contain',
    tintColor: ColorConstants.DARK_CYAN,
  }


});

export default CustomTextInput;