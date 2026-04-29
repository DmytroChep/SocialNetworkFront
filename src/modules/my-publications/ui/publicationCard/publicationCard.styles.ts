import { StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../../../../shared/constants'; // Убедись, что путь к константам верный

const { width } = Dimensions.get('window');
const CARD_PADDING = 16;
const CONTAINER_MARGIN = 16;
const GRID_GAP = 8;

// Чистая ширина контента внутри карточки
const CONTENT_WIDTH = width - (CONTAINER_MARGIN * 2) - (CARD_PADDING * 2);

export const styles = StyleSheet.create({
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginHorizontal: CONTAINER_MARGIN,
    marginBottom: 16,
    padding: CARD_PADDING,
    // Тени для объема
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F0F0',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 6,
  },
  text: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  hashtags: {
    fontSize: 13,
    color: '#666', // Цвет как на макете
    fontWeight: '400',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    marginBottom: 16,
  },
  // Верхние 2 картинки
  largeImg: {
    width: (CONTENT_WIDTH - GRID_GAP) / 2,
    height: 160,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
  },
  // Нижние 3 картинки
  smallImg: {
    width: (CONTENT_WIDTH - (GRID_GAP * 2)) / 3,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // Или flex-end, если кнопка должна быть справа
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  }
});