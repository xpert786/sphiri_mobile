import { Icons } from '@/assets';
import { ColorConstants } from '@/constants/ColorConstants';
import { StringConstants } from '@/constants/StringConstants';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function WelcomeScreen() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>('home_owner'); // track selected role

  const roles = [
    { key: 'home_owner', title: StringConstants.HOMEOWNER, desc: StringConstants.HOMEOWNER_DESC, icon: Icons.ic_homeowner },
    { key: 'family_member', title: StringConstants.TRUSTEE, desc: StringConstants.TRUSTEE_DESC, icon: Icons.ic_trustee },
    { key: 'vendor', title: StringConstants.VENDOR, desc: StringConstants.VENDOR_DESC, icon: Icons.ic_vendor },
  ];

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <StatusBar backgroundColor={ColorConstants.WHITE} style="dark" />
      <Text style={styles.chooseRoleText}>{StringConstants.CHOOSE_YOUR_ROLE}</Text>
      <Text style={styles.tailorExpText}>{StringConstants.WE_WILL_TAILOR_YOUR_EXPERIENCE}</Text>

      {roles.map((role) => (
        <Pressable
          key={role.key}
          style={[styles.boxView, selectedRole === role.key && styles.selectedBox]}
          onPress={() => setSelectedRole(role.key)}
        >
          <Image source={role.icon} style={styles.icons} />
          <View style={styles.textStyles}>
            <Text style={styles.title}>{role.title}</Text>
            <Text style={styles.desc}>{role.desc}</Text>
          </View>
          <TouchableOpacity
            style={styles.selectButton}
            disabled={selectedRole !== role.key}
            onPress={() =>
              router.push({
                pathname: '/LoginScreen',
                params: {
                  role: role.key,
                },
              })
            }

          >
            <Text style={styles.select}>{StringConstants.SELECT}</Text>
            <Image source={Icons.ic_right_arrow} style={styles.rightArrow} />
          </TouchableOpacity>
        </Pressable>
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: ColorConstants.WHITE,
  },
  chooseRoleText: {
    fontSize: 18,
    fontFamily: 'SFPro-Bold',
    color: ColorConstants.PRIMARY_BROWN,
    marginBottom: 4
  },
  tailorExpText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: ColorConstants.GRAY,
    marginBottom: 20,
  },
  boxView: {
    width: '100%',
    backgroundColor: ColorConstants.WHITE,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: ColorConstants.GRAY2,
    padding: 9,
    flexDirection: 'row',
    marginBottom: 12
  },
  selectedBox: {
    backgroundColor: ColorConstants.PRIMARY_10,
    borderColor: ColorConstants.REDDISH_BROWN,
  },
  icons: {
    height: 95,
    width: 95,
    resizeMode: 'contain',
    borderRadius: 4,
    backgroundColor: ColorConstants.PRIMARY_10
  },
  textStyles: {
    marginLeft: 12,
    justifyContent: 'center',
    flex: 1
  },
  title: {
    fontSize: 14,
    fontFamily: 'SFPro-Medium',
    color: ColorConstants.DARK_CYAN,
    marginBottom: 3,
  },
  desc: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: ColorConstants.GRAY,
    marginRight: 30,
  },
  selectButton: {
    flexDirection: 'row',
    position: 'absolute',
    top: 15,
    right: 15,
    alignItems: 'center',
  },
  select: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: ColorConstants.PRIMARY_BROWN,
    marginRight: 4,
    includeFontPadding: false,
    paddingHorizontal: 1,
  },
  rightArrow: {
    alignSelf: 'center',
  }

});
