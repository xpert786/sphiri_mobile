import { Icons } from '@/assets';
import CommonButton from '@/components/CommonButton';
import { ColorConstants } from '@/constants/ColorConstants';
import React from 'react';
import {
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

type DocumentItem = {
    id: number;
    name: string;
    linkedTo?: string;
    expiration?: string;
    verified?: boolean;
    email?: string;
    notes?: string;
    phone?: string;
};


interface ValidationModalProps {
    visible: boolean;
    onClose: () => void;
    alertTitle?: string
}

const ValidationModal: React.FC<ValidationModalProps> = ({ visible, onClose, alertTitle }) => {
    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Image source={Icons.ic_cross} style={styles.closeIcon} />
                    </TouchableOpacity>
                    <Text style={styles.primaryUserText}>
                        {alertTitle}
                    </Text>

                    <CommonButton
                        title={'OK'}
                        onPress={onClose}
                        containerStyle={{width: 100, alignSelf: 'center'}}
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContainer: {
        backgroundColor: ColorConstants.WHITE,
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 20,
        width: '90%'
    },
    closeButton: {
        padding: 4,
        alignSelf: 'flex-end'
    },
    closeIcon: {
        width: 12,
        height: 12,
    },
    primaryUserText: {
        fontFamily: 'Inter-Regular',
        fontSize: 15,
        color: ColorConstants.PRIMARY_BROWN,
        textAlign: 'center',
        marginTop: 12,
    },


});

export default ValidationModal;