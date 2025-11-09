import React from 'react';
import { View, ViewProps, StyleSheet, Platform } from 'react-native';
import { useResponsive } from '@/hooks/use-responsive';

type ContainerProps = ViewProps & {
  maxWidthDesktop?: number;
  paddingHorizontal?: number;
};

export default function Container({
  style,
  children,
  maxWidthDesktop = 1200,
  paddingHorizontal = 16,
  ...rest
}: ContainerProps) {
  const { isDesktop } = useResponsive();

  if (Platform.OS === 'web' && isDesktop) {
    return (
      <View
        style={[
          styles.webContainer,
          { maxWidth: maxWidthDesktop, paddingHorizontal },
          style,
        ]}
        {...rest}
      >
        {children}
      </View>
    );
  }

  return (
    <View style={[{ paddingHorizontal }, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    width: '100%',
    alignSelf: 'center',
  },
});


