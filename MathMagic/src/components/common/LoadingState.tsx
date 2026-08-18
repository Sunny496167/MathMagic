import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../../constants';

interface LoadingStateProps {
  message?: string;
  color?: string;
}

export const LoadingState = ({ message = 'Loading...', color = COLORS.primary }: LoadingStateProps) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={color} />
      {message ? <Text style={styles.text}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
});

export default LoadingState;
