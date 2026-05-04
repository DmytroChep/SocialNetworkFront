import { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, FlatList, ViewToken } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FirstEnterModal } from "../../shared/ui/first-enter-modal/firstEnterModal";
import { useGetAllPostsQuery, useMeQuery, useViewsIncreaseMutation } from "../../shared/api/baseApi";
import { UserContext, useUserContext } from "../../shared/context/user-context";
import { PublicationCard } from "../../modules/my-publications/ui/publicationCard/publicationCard";
import { useRouter } from "expo-router";
import { IPost } from "../../modules/my-publications/types/Post.type";

export default function Main() {
  const { user } = useUserContext();
  const [modalVisible, setModalVisible] = useState(false);

  const { data: posts } = useGetAllPostsQuery(undefined, {
    pollingInterval: 1000,
  });

  const [increaseView] = useViewsIncreaseMutation();

  const viewedPosts = useRef(new Set<number>());

  
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      viewableItems.forEach((viewToken) => {
        const post = viewToken.item as IPost;

        if (!viewedPosts.current.has(post.id)) {
          viewedPosts.current.add(post.id);
          increaseView({ postId: post.id });
        }
      });
    }
  ).current;

  const finalPosts = posts || [];

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
      <FirstEnterModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />

      <FlatList
        data={finalPosts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PublicationCard post={item} userId={user?.id} />
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 70,
        }}
      />
    </SafeAreaView>
  );
}
