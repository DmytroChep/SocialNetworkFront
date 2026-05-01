import React, { useCallback, useRef } from 'react';
import { View, FlatList } from 'react-native';
import { PublicationCard } from '../../modules/my-publications/ui/publicationCard/publicationCard';
import { useGetUserPostsQuery, useViewsIncreaseMutation } from '../../shared/api/baseApi';
import { useUserContext } from '../../shared/context/user-context';

export default function MyPublicationsScreen() {
  const { user, token } = useUserContext();

  if (!user){
    return
  }
  const { data: publications } = useGetUserPostsQuery({ userId: user.id }, { pollingInterval: 1000 });
  const [increaseView] = useViewsIncreaseMutation();

  
  const viewedIds = useRef(new Set<number>());

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    viewableItems.forEach(({ item }: any) => {
      if (item && !viewedIds.current.has(item.id)) {
        viewedIds.current.add(item.id);
        increaseView(item.id).unwrap().catch(() => {});
      }
    });
  }, [increaseView]);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const finalPublications = publications || [];

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <FlatList
        data={finalPublications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PublicationCard post={item} userId={user.id} />
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}