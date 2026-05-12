import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ViewToken,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FirstEnterModal } from "../../shared/ui/first-enter-modal/firstEnterModal";
import {
  useLazyGetAllPostsQuery,
  useViewsIncreaseMutation,
} from "../../shared/api/baseApi";
import { useUserContext } from "../../shared/context/user-context";
import { PublicationCard } from "../../modules/my-publications/ui/publicationCard/publicationCard";
import { IPost } from "../../modules/my-publications/types/Post.type";

const POSTS_LIMIT = 5;

export default function Main() {
  const { user } = useUserContext();

  const [modalVisible, setModalVisible] = useState(false);
  const [posts, setPosts] = useState<IPost[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [getAllPosts, { isFetching }] = useLazyGetAllPostsQuery();
  const [increaseView] = useViewsIncreaseMutation();

  const viewedPosts = useRef(new Set<number>());

  const paginationRef = useRef({
    nextCursor: null as number | null,
    hasMore: true,
    isLoading: false,
  });

  // загрузка постов
  const loadPosts = useCallback(async (reset = false) => {
    const pagination = paginationRef.current;
    if (pagination.isLoading || (!reset && !pagination.hasMore)) return;

    pagination.isLoading = true;

    try {
      const response = await getAllPosts({
        limit: POSTS_LIMIT,
        cursor: reset ? undefined : pagination.nextCursor ?? undefined,
      }).unwrap();

      setPosts((currentPosts) => {
        if (reset) return response.items;

        const existingIds = new Set(currentPosts.map((p) => p.id));
        const newPosts = response.items.filter((p) => !existingIds.has(p.id));

        return [...currentPosts, ...newPosts];
      });

      pagination.nextCursor = response.nextCursor;
      pagination.hasMore = response.hasMore;
      setHasMore(response.hasMore);
    } catch {
      if (reset) {
        pagination.nextCursor = null;
        pagination.hasMore = true;
      }
    } finally {
      pagination.isLoading = false;
    }
  }, [getAllPosts]);

  // pull to refresh
  const refreshPosts = useCallback(async () => {
    setIsRefreshing(true);
    paginationRef.current.nextCursor = null;
    paginationRef.current.hasMore = true;
    viewedPosts.current.clear();
    await loadPosts(true);
    setIsRefreshing(false);
  }, [loadPosts]);

  // 🔥 оптимистичный лайк
  const handleToggleLikeLocal = useCallback((postId: number, isLiked: boolean) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) => {
        if (post.id !== postId) return post;

        const likes = post.likesCount ?? 0;

        return {
          ...post,
          isLiked,
          likesCount: isLiked ? likes + 1 : likes - 1,
        };
      })
    );
  }, []);

  const handleUpdatePost = useCallback((updatedPost: IPost) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === updatedPost.id ? updatedPost : post
      )
    );
  }, []);

  const handleDeletePost = useCallback((postId: number) => {
    setPosts((currentPosts) =>
      currentPosts.filter((post) => post.id !== postId)
    );
  }, []);

  useEffect(() => {
    loadPosts(true);
  }, [loadPosts]);

  // 🔥 оптимистичные просмотры
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      viewableItems.forEach((viewToken) => {
        const post = viewToken.item as IPost;

        if (!post?.id || viewedPosts.current.has(post.id)) return;

        viewedPosts.current.add(post.id);

        // моментально увеличиваем просмотры
        setPosts((currentPosts) =>
          currentPosts.map((p) =>
            p.id === post.id ? { ...p, viewsCount: (p.views ?? 0) + 1 } : p
          )
        );

        // сервер в фоне
        increaseView({ postId: post.id });
      });
    }
  ).current;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
      <FirstEnterModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PublicationCard
            post={item}
            userId={user?.id}
            onDelete={handleDeletePost}
            onUpdate={handleUpdatePost}
            onToggleLikeLocal={handleToggleLikeLocal}
          />
        )}
        onEndReached={() => loadPosts()}
        onEndReachedThreshold={0.5}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 70 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refreshPosts} />
        }
        ListFooterComponent={
          isFetching && posts.length > 0 && hasMore
            ? <ActivityIndicator style={{ paddingVertical: 16 }} />
            : null
        }
        ListEmptyComponent={
          isFetching ? <ActivityIndicator style={{ paddingVertical: 24 }} /> : null
        }
      />
    </SafeAreaView>
  );
}