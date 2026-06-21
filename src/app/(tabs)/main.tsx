import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	RefreshControl,
	View,
	type ViewToken,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { IPost } from "../../modules/my-publications/types/Post.type";
import { PublicationCard } from "../../modules/my-publications/ui/publicationCard/publicationCard";
import { useLazyGetAllPostsQuery,
	useViewsIncreaseMutation, useGetPersonalChatsQuery, useGetAllHashtagsQuery, useGetUserFriendshipsQuery, useMeQuery, 
	useGetAllUsersQuery,
	useGetUserPostsQuery,
	usePrefetch} from "../../shared/api/baseApi";
import { useUserContext } from "../../shared/context/user-context";
import {
	getUserAvatar,
	getUserDisplayName,
	getUserHandle,
} from "../../shared/lib/model-helpers";
import { FirstEnterModal } from "../../shared/ui/first-enter-modal/firstEnterModal";
import { COLORS } from "../../shared/constants/colors"

const POSTS_LIMIT = 3;

function needsFirstEnterProfile(
	user: ReturnType<typeof useUserContext>["user"],
) {
	if (!user) return false;

	const hasDisplayName = Boolean(
		user.first_name?.trim() || user.profile?.pseudonym?.trim(),
	);

	return !hasDisplayName;
}

export default function Main() {
  const { user } = useUserContext();
  const router = useRouter();

  // --- Prefetch ---
  useMeQuery();
  useGetAllHashtagsQuery();
  useGetAllUsersQuery();
  useGetUserFriendshipsQuery(user?.id ?? 0, { skip: !user?.id });
  useGetUserPostsQuery({ userId: user?.id ?? 0 }, { skip: !user?.id });
  const { data: chatsData } = useGetPersonalChatsQuery(
    { take: 50 },
    { skip: !user?.id }
  );
  const prefetchMessages = usePrefetch('getChatMessages');

  const chatIds = useMemo(
    () => chatsData?.chats?.map((chat) => chat.id) ?? [],
    [chatsData]
  );

  useEffect(() => {
	if (chatIds.length === 0) return;

	chatIds.forEach((chatId, index) => {
		setTimeout(() => {
		prefetchMessages({ chatId, limit: 10 }); // ← було 30, треба 10
		}, index * 150);
	});
	}, [chatIds, prefetchMessages]);

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


	const handleNavigateToProfile = useCallback(
		(
			author: IPost["author"] & {
				name?: string;
				handle?: string;
				avatar?: string | null;
			},
		) => {
			const authorName = author.name || getUserDisplayName(author);
			const authorHandle =
				author.handle ||
				getUserHandle(author) ||
				authorName.toLowerCase().replace(/\s/g, "");
			const authorAvatar = author.avatar || getUserAvatar(author);

			router.push({
				pathname: "/user-profile",
				params: {
					id: author.id,
					name: authorName,
					handle: authorHandle.startsWith("@")
						? authorHandle
						: `@${authorHandle}`,
					avatar: authorAvatar,
				},
			});
		},
		[router],
	);

	const loadPosts = useCallback(
		async (reset = false) => {
			const pagination = paginationRef.current;
			if (pagination.isLoading || (!reset && !pagination.hasMore)) return;
			pagination.isLoading = true;

			try {
				const response = await getAllPosts({
					limit: POSTS_LIMIT,
					cursor: reset ? undefined : (pagination.nextCursor ?? undefined),
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
		},
		[getAllPosts],
	);

	const refreshPosts = useCallback(async () => {
		setIsRefreshing(true);
		paginationRef.current.nextCursor = null;
		paginationRef.current.hasMore = true;
		viewedPosts.current.clear();
		await loadPosts(true);
		setIsRefreshing(false);
	}, [loadPosts]);

	const handleToggleLikeLocal = useCallback(
		(postId: number, isLiked: boolean) => {
			setPosts((currentPosts) =>
				currentPosts.map((post) => {
					if (post.id !== postId) return post;
					const likes = post.thumbsUpCount ?? post.likes?.length ?? 0;
					return {
						...post,
						isThumbsUpLiked: isLiked,
						thumbsUpCount: isLiked ? likes + 1 : Math.max(likes - 1, 0),
					};
				}),
			);
		},
		[],
	);

	const handleUpdatePost = useCallback((updatedPost: IPost) => {
		setPosts((currentPosts) =>
			currentPosts.map((post) =>
				post.id === updatedPost.id ? updatedPost : post,
			),
		);
	}, []);

	const handleDeletePost = useCallback((postId: number) => {
		setPosts((currentPosts) =>
			currentPosts.filter((post) => post.id !== postId),
		);
	}, []);

	useEffect(() => {
		loadPosts(true);
	}, [loadPosts]);

	useEffect(() => {
		if (needsFirstEnterProfile(user)) {
			setModalVisible(true);
		}
	}, [user]);

	const onViewableItemsChanged = useRef(
		({ viewableItems }: { viewableItems: ViewToken[] }) => {
			viewableItems.forEach((viewToken) => {
				const post = viewToken.item as IPost;
				if (!post?.id || viewedPosts.current.has(post.id)) return;
				viewedPosts.current.add(post.id);
				setPosts((currentPosts) =>
					currentPosts.map((p) =>
						p.id === post.id
							? {
									...p,
									views:
										(Array.isArray(p.views) ? p.views.length : (p.views ?? 0)) +
										1,
								}
							: p,
					),
				);
				increaseView({ postId: post.id });
			});
		},
	).current;

	return (
		<SafeAreaView
			style={{ flex: 1, backgroundColor: COLORS.plum50, gap: 6, paddingVertical: 8 }}
			edges={["left", "right"]}
		>
			<FirstEnterModal
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
			/>
			<FlatList
				style = {{ paddingVertical: 8 }}
				data={posts}
				keyExtractor={(item) => item.id.toString()}
				ItemSeparatorComponent={() => <View style={{ height: 9 }} />}
				renderItem={({ item }) => (
    <PublicationCard
        post={item}
        userId={user?.id}
        onDelete={handleDeletePost}
        onUpdate={handleUpdatePost} // ← Мы будем использовать только этот колбэк
					onToggleLikeLocal={handleToggleLikeLocal}
        onProfilePress={() => handleNavigateToProfile(item.author)}
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
					isFetching && posts.length > 0 && hasMore ? (
						<ActivityIndicator style={{ paddingVertical: 16 }} />
					) : null
				}
				ListEmptyComponent={
					isFetching ? (
						<ActivityIndicator style={{ paddingVertical: 24 }} />
					) : null
				}
			/>
		</SafeAreaView>
	);
}
