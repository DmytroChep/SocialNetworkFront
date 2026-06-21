import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	type ViewToken,
} from "react-native";
import type { IPost } from "../../modules/my-publications/types/Post.type";
import { PublicationCard } from "../../modules/my-publications/ui/publicationCard/publicationCard";
import {
	useGetUserPostsQuery,
	useViewsIncreaseMutation,
} from "../../shared/api/baseApi";
import { useUserContext } from "../../shared/context/user-context";
import { FONTS } from "../../shared/constants/fonts";
import { COLORS } from "../../shared/constants";

const POSTS_PAGE_SIZE = 3;

export default function MyPublicationsScreen() {
	const { user } = useUserContext();
	const [currentPage, setCurrentPage] = useState(1);

	const { data: publications } = useGetUserPostsQuery(
		{ userId: user?.id ?? 0 },
		{ skip: !user?.id }
		);
	const [increaseView] = useViewsIncreaseMutation();

	const [localPublications, setLocalPublications] = useState(
		publications || [],
	);

	useEffect(() => {
		setLocalPublications(publications || []);
	}, [publications]);

	const paginatedPublications = useMemo(() => {
		const start = (currentPage - 1) * POSTS_PAGE_SIZE;
		const end = start + POSTS_PAGE_SIZE;
		return localPublications.slice(start, end);
	}, [localPublications, currentPage]);

	const hasMorePosts = useMemo(
		() => localPublications.length > currentPage * POSTS_PAGE_SIZE,
		[localPublications.length, currentPage],
	);

	const viewedIds = useRef(new Set<number>());

	const onViewableItemsChanged = useCallback(
		({ viewableItems }: { viewableItems: ViewToken[] }) => {
			viewableItems.forEach(({ item }) => {
				const publication = item as IPost | undefined;
				if (publication && !viewedIds.current.has(publication.id)) {
					viewedIds.current.add(publication.id);
					increaseView({ postId: publication.id })
						.unwrap()
						.catch(() => {});
				}
			});
		},
		[increaseView],
	);

	const viewabilityConfig = useRef({
		itemVisiblePercentThreshold: 50,
	}).current;

	const handleDeletePost = useCallback((postId: number) => {
		setLocalPublications((prev) => prev.filter((p) => p.id !== postId));
	}, []);

	const handleUpdatePost = useCallback((updatedPost: IPost) => {
		setLocalPublications((prev) =>
			prev.map((post) => (post.id === updatedPost.id ? updatedPost : post)),
		);
	}, []);

	const handleLoadMore = useCallback(() => {
		setCurrentPage((prev) => prev + 1);
	}, []);

	const renderItem = useCallback(({ item }: { item: IPost }) => (
		<PublicationCard
			post={item}
			userId={user?.id ?? 0}
			onDelete={handleDeletePost}
			onUpdate={handleUpdatePost}
		/>
	), [user?.id, handleDeletePost, handleUpdatePost]);

	if (!user) {
		return <ActivityIndicator style={{ flex: 1 }} />;
	}

	return (
		<View style={{ flex: 1, paddingVertical: 8, backgroundColor: COLORS.plum50 }}>
			<FlatList
				data={paginatedPublications}
				keyExtractor={(item) => item.id.toString()}
				ItemSeparatorComponent={() => <View style={{ height: 9 }} />}
				ListFooterComponent={
					hasMorePosts ? (
						<View style={{ paddingHorizontal: 12, paddingVertical: 12 }}>
							<TouchableOpacity
								style={styles.loadMoreButton}
								onPress={handleLoadMore}
							>
								<Text style={styles.loadMoreText}>Завантажити ще</Text>
							</TouchableOpacity>
						</View>
					) : null
				}
				renderItem={renderItem}
				onViewableItemsChanged={onViewableItemsChanged}
				viewabilityConfig={viewabilityConfig}
				contentContainerStyle={{ paddingBottom: 24 }}
				showsVerticalScrollIndicator={false}
				removeClippedSubviews={true}
				maxToRenderPerBatch={10}
				updateCellsBatchingPeriod={50}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	loadMoreButton: {
		paddingVertical: 12,
		paddingHorizontal: 16,
		backgroundColor: "#2E5266",
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
	},
	loadMoreText: {
		color: "#FFFFFF",
		fontSize: 14,
		fontFamily: FONTS["GTWalsheimPro-Medium"],
	},
});
