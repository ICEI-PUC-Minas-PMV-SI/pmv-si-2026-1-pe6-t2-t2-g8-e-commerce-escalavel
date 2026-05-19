import { StyleSheet } from 'react-native';

import { spacing } from '@/src/theme';

export const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: spacing.xs,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingTop: spacing.md,
    gap: spacing.xs,
  },
  price: {
    marginTop: spacing.sm,
  },
});
