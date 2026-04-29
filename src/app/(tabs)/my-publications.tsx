import React from 'react';
import { ScrollView, View } from 'react-native';
import { screenStyles } from './my-publications.styles';
import { Header } from '../../shared/ui/Header';
import { PublicationCard } from '../../modules/my-publications/ui/publicationCard/publicationCard';

export default function MyPublicationsScreen() {
  return (
    <View style={screenStyles.container}>
      {/* Хедер остается статичным сверху */}
      <Header /> 

      <ScrollView 
        // contentContainerStyle отвечает за внутренние отступы при скролле
        contentContainerStyle={screenStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Список публикаций из MOCK_DATA */}
        {MOCK_DATA.map(item => (
          <PublicationCard key={item.id} post={item} />
        ))}
      </ScrollView>
    </View>
  );
}

const MOCK_DATA = [
  {
    id: '1',
    authorName: 'Lina Li',
    authorAvatar: 'https://via.placeholder.com/100',
    title: 'Природа, книга і спокій 🌿',
    description: 'Інколи найкращі ідеї народжуються в тиші — усе, що потрібно, аби перезавантажитись.',
    tags: '#відпочинок #натхнення #життя #природа #читання #спокій #гармонія',
    images: [
      'https://picsum.photos/400/400',
      'https://picsum.photos/400/401',
      'https://picsum.photos/400/402',
      'https://picsum.photos/400/403',
      'https://picsum.photos/400/404',
    ]
  }
];