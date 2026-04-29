import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { styles } from './publicationCard.styles';
import { ICONS } from '../../../../shared/icons';
import { RoundButton } from '../../../../shared/ui/RoundButton';

interface PublicationCardProps {
  post: any; 
}

export const PublicationCard = ({ post }: PublicationCardProps) => {
  return (
    <View style={styles.postCard}>
      {/* Верхняя часть: Автор и Меню */}
      <View style={styles.headerRow}>
        <View style={styles.userInfo}>
          <Image source={{ uri: post.authorAvatar }} style={styles.avatar} />
          <View>
            <Text style={styles.userName}>{post.authorName}</Text>
            {/* Если есть иконка подписи, вставляем её сюда */}
          </View>
        </View>
        <TouchableOpacity onPress={() => console.log('Open Menu')}>
          <ICONS.dots />
        </TouchableOpacity>
      </View>

      {/* Контентная часть */}
      <View style={styles.content}>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.text}>{post.description}</Text>
        <Text style={styles.hashtags}>{post.tags}</Text>
      </View>

      {/* Сетка изображений */}
      <View style={styles.imageGrid}>
        {post.images.map((img: string, index: number) => (
          <Image 
            key={index} 
            source={{ uri: img }} 
            style={index < 2 ? styles.largeImg : styles.smallImg} 
          />
        ))}
      </View>

      {/* Нижняя панель: просмотры/взаимодействия */}
      <View style={styles.footer}>
        <RoundButton icon={<ICONS.eye />} onPress={() => {}} />
      </View>
    </View>
  );
};