// Light Theme Colors (Current)
export const lightTheme = {
  // Backgrounds
  background: '#F8F9FA',
  cardBackground: '#FFFFFF',
  modalBackground: '#FFFFFF',
  
  // Text
  text: '#000000',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textDisabled: '#CCCCCC',
  
  // Primary Colors
  purple: '#8000FF',
  purpleLight: '#F0E6FF',
  purpleDark: '#6000CC',
  
  // Accent Colors
  green: '#4ADE80',
  pink: '#FF1493',
  red: '#F87171',
  orange: '#FB923C',
  orangeLight: 'rgba(251, 146, 60, 0.15)',
  gold: '#FCD34D',
  
  // UI Elements
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  shadow: 'rgba(0, 0, 0, 0.1)',
  
  // Status Colors
  success: '#4CAF50',
  error: '#EF4444',
  warning: '#F97316',
  info: '#3B82F6',
  
  // Token Colors
  tokenGreen: '#4CAF50',
  tokenYellow: '#FFC107',
  tokenOrange: '#FF9800',
  tokenPink: '#FF0080',
  tokenRed: '#EF4444',
  
  // Special
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  
  // Theme indicator
  isDarkMode: false,
};

// Dark Theme Colors
export const darkTheme = {
  // Backgrounds
  background: '#121212',
  cardBackground: '#1E1E1E',
  modalBackground: '#2A2A2A',
  
  // Text
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#808080',
  textDisabled: '#4A4A4A',
  
  // Primary Colors
  purple: '#A855F7',
  purpleLight: '#2D1B4E',
  purpleDark: '#C084FC',
  
  // Accent Colors
  green: '#4ADE80',
  pink: '#FF1493',
  red: '#F87171',
  orange: '#FB923C',
  gold: '#FCD34D',
  
  // UI Elements
  border: '#333333',
  borderLight: '#2A2A2A',
  shadow: 'rgba(0, 0, 0, 0.5)',
  
  // Status Colors
  success: '#4ADE80',
  error: '#F87171',
  warning: '#FB923C',
  info: '#60A5FA',
  
  // Token Colors
  tokenGreen: '#4ADE80',
  tokenYellow: '#FDE047',
  tokenOrange: '#FB923C',
  tokenPink: '#FF1493',
  tokenRed: '#F87171',
  
  // Special
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  
  // Theme indicator
  isDarkMode: true,
};

export type Theme = typeof lightTheme;
