import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, useWindowDimensions } from 'react-native';

type CalcButtonProps = {
  text: string;
  onPress: () => void;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
};

const CalcButton: React.FC<CalcButtonProps> = ({
  text,
  onPress,
  containerStyle,
  textStyle,
  accessibilityLabel,
}) => {
  const { width, height } = useWindowDimensions();
  const isPortrait = height >= width;
  const dynamicFlex = isPortrait ? 0.95 : 1.10;

  return (
    <TouchableOpacity
      style={[styles.btn, { flex: dynamicFlex }, containerStyle]}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel || `button-${text}`}
      activeOpacity={0.7}
    >
      <Text style={[styles.btnText, textStyle]}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    margin: 6,
    borderRadius: 8,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6b6b6b',
  },
  btnText: {
    fontSize: 28,
    color: '#fff',
  },
});

export default CalcButton;
