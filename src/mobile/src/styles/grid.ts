import { StyleSheet } from 'react-native';

import { spacing } from '@/src/theme';

export const gridStyles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  row: {
    justifyContent: 'space-between',
  },
});
