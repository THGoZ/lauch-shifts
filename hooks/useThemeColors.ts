import { useColorScheme } from 'react-native';
import { colorPalette } from '../constants/colorScheme';

export const useThemeColors = () => {
  const scheme = useColorScheme();
  return colorPalette[scheme === 'dark' ? 'dark' : 'light'];
};