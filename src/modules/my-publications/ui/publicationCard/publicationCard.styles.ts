import { StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../../../../shared/constants';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 16;
const CARD_PADDING = 16;
const GRID_GAP = 10;
const CONTENT_WIDTH = width - (CARD_MARGIN * 2) - (CARD_PADDING * 2);

export const styles = StyleSheet.create({
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12, // В Figma углы чуть менее скругленные, чем были
    marginHorizontal: CARD_MARGIN,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E8E8E8', // Легкая рамка как в дизайне
  },
  authorSection: {
    padding: CARD_PADDING,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  onlineStatus: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50', // Зеленый индикатор
    borderWidth: 2,
    borderColor: '#FFF',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  signature: {
    width: 100,
    height: 30,
    marginLeft: CARD_PADDING,
    marginBottom: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginHorizontal: 0,
  },
  contentSection: {
    padding: CARD_PADDING,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#4A4A4A',
    lineHeight: 20,
    marginBottom: 12,
  },
  hashtags: {
    fontSize: 13,
    color: '#7A7A7A',
    marginBottom: 16,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  largeImg: {
    width: (CONTENT_WIDTH - GRID_GAP) / 2,
    height: 160,
    borderRadius: 12,
  },
  smallImg: {
    width: (CONTENT_WIDTH - (GRID_GAP * 2)) / 3,
    height: 140, // Вертикальная ориентация как в Figma
    borderRadius: 8,
  },
  footer: {
    padding: CARD_PADDING,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }
});