import React, { useCallback, useRef, useState, useEffect } from 'react';
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

  const [localPublications, setLocalPublications] = useState(publications || []);

  useEffect(() => {
    setLocalPublications(publications || []);
  }, [publications]);
  
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

  const handleDeletePost = useCallback((postId: number) => {
    setLocalPublications(prev => prev.filter(p => p.id !== postId));
  }, []);

  if (!user) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <FlatList
        data={localPublications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PublicationCard post={item} userId={user.id} onDelete={handleDeletePost} />
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
