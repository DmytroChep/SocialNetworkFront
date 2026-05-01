import { StyleSheet } from 'react-native';

export const screenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB', // Светлый фон для контраста с белыми карточками
  },
  scrollContent: {
    paddingBottom: 40,   // Дополнительный отступ снизу, чтобы последняя карточка не перекрывалась таб-баром
  }
});