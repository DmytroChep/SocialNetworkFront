import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { styles } from './publicationCard.styles';
import { ICONS } from '../../../../shared/icons';
import { RoundButton } from '../../../../shared/ui/RoundButton';

export const PublicationCard = ({ post }: { post: any }) => {
  return (
    <View style={styles.postCard}>
      {/* Секция автора */}
      <View style={styles.authorSection}>
        <View style={styles.userInfo}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: post.authorAvatar }} style={styles.avatar} />
            <View style={styles.onlineStatus} />
          </View>
          <Text style={styles.userName}>{post.authorName}</Text>
        </View>
        <TouchableOpacity>
          <ICONS.dots />
        </TouchableOpacity>
      </View>

      {/* Подпись автора под аватаром */}
      {/* <Image 
        source={require('../../../../assets/signature.png')} 
        style={styles.signature} 
        resizeMode="contain" 
      /> */}

      <View style={styles.separator} />

      {/* Контентная часть */}
      <View style={styles.contentSection}>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.description}>{post.description}</Text>
        <Text style={styles.hashtags}>{post.tags}</Text>

        {/* Сетка фото */}
        <View style={styles.imageGrid}>
          {post.images.map((img: string, index: number) => (
            <Image 
              key={index} 
              source={{ uri: img }} 
              style={index < 2 ? styles.largeImg : styles.smallImg} 
            />
          ))}
        </View>
      </View>

      {/* Кнопки действий (если нужны по функционалу) */}
      <View style={styles.footer}>
        <RoundButton icon={<ICONS.eye />} />
        <RoundButton icon={<ICONS.settings />} />
      </View>
    </View>
  );
};