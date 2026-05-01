import React from 'react';
import { ScrollView, View } from 'react-native';
import { screenStyles } from './my-publications.styles';
import { Header } from '../../shared/ui/Header';
import { PublicationCard } from '../../modules/my-publications/ui/publicationCard/publicationCard';
import { useGetUserPostsQuery } from '../../shared/api/baseApi';
import { useUserContext } from '../../shared/context/user-context';
import { useRouter } from 'expo-router';

export default function MyPublicationsScreen() {
  const {user} = useUserContext()
  const router = useRouter()

  if (!user){
      router.replace("/reagistration")
      return
  }

  const {data:publications} = useGetUserPostsQuery({userId: user.id})

  const finalPublications = publications || []

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      {/* Если Header уже есть в _layout.tsx, здесь его дублировать не нужно */}
      {/* <Header /> */} 

      <ScrollView 
        contentContainerStyle={{ paddingVertical: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {finalPublications.map(item => (
          <PublicationCard key={item.id} post={item} />
        ))}
      </ScrollView>
    </View>
  );
}

// export const MOCK_DATA = [
//   {
//     id: '1',
//     authorName: 'Lina Li',
//     authorAvatar: 'https://via.placeholder.com/100',
//     title: 'Природа, книга і спокій 🌿',
//     description: 'Інколи найкращі ідеї народжуються в тиші — усе, що потрібно, аби перезавантажитись.',
//     tags: '#відпочинок #натхнення #життя #природа #читання #спокій #гармонія',
//     images: [
//       'https://picsum.photos/400/400',
//       'https://picsum.photos/400/401',
//       'https://picsum.photos/400/402',
//       'https://picsum.photos/400/403',
//       'https://picsum.photos/400/404',
//     ]
//   }
// ];