import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';

export type ThemedModalProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  transparent?: boolean;
  animationType?: 'none' | 'slide' | 'fade';
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  dismissOnBackdrop?: boolean;
};

export function ThemedModal({
  visible,
  onClose,
  children,
  transparent = true,
  animationType = 'fade',
  style,
  contentStyle,
  dismissOnBackdrop = true,
}: ThemedModalProps) {
  const { theme } = useTheme();
  const colors = Colors[theme];

  const handleBackdropPress = () => {
    if (dismissOnBackdrop) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={transparent}
      animationType={animationType}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View
              style={[
                styles.modalContent,
                {
                  backgroundColor: colors.alertBackground,
                  borderColor: colors.alertBorder,
                },
                style,
              ]}
            >
              <View style={contentStyle}>{children}</View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
    minWidth: 280,
    maxWidth: '90%',
    maxHeight: '80%',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

