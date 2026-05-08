import React, { useCallback, useRef } from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import { PublicationCard } from '../../modules/my-publications/ui/publicationCard/publicationCard';
import { useGetUserPostsQuery, useViewsIncreaseMutation } from '../../shared/api/baseApi';
import { useUserContext } from '../../shared/context/user-context';

export default function MyPublicationsScreen() {
  const { user } = useUserContext();

  const { data: publications } = useGetUserPostsQuery(
    { userId: user?.id ?? 0 },
    { pollingInterval: 1000, skip: !user?.id }
  );
  const [increaseView] = useViewsIncreaseMutation();

  
  const viewedIds = useRef(new Set<number>());

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    viewableItems.forEach(({ item }: any) => {
      if (item && !viewedIds.current.has(item.id)) {
        viewedIds.current.add(item.id);
        increaseView({ postId: item.id }).unwrap().catch(() => {});
      }
    });
  }, [increaseView]);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const finalPublications = publications || [];

  if (!user) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

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
