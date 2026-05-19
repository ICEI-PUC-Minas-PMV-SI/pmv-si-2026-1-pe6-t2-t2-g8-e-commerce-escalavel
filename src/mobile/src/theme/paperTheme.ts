import { MD3LightTheme, type MD3Theme } from 'react-native-paper';

export const paperTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 1,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#000000',
    onPrimary: '#ffffff',
  },
};
