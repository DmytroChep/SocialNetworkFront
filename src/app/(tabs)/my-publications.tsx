import { useCallback, useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	View,
	type ViewToken,
} from "react-native";
import type { IPost } from "../../modules/my-publications/types/Post.type";
import { PublicationCard } from "../../modules/my-publications/ui/publicationCard/publicationCard";
import {
	useGetUserPostsQuery,
	useViewsIncreaseMutation,
} from "../../shared/api/baseApi";
import { useUserContext } from "../../shared/context/user-context";

export default function MyPublicationsScreen() {
	const { user } = useUserContext();

	const { data: publications } = useGetUserPostsQuery(
		{ userId: user?.id ?? 0 },
		{ pollingInterval: 1000, skip: !user?.id },
	);
	const [increaseView] = useViewsIncreaseMutation();

	const [localPublications, setLocalPublications] = useState(
		publications || [],
	);

	useEffect(() => {
		setLocalPublications(publications || []);
	}, [publications]);

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

	if (!user) {
		return <ActivityIndicator style={{ flex: 1 }} />;
	}

	return (
		<View style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
			<FlatList
				data={localPublications}
				keyExtractor={(item) => item.id.toString()}
				ItemSeparatorComponent={() => <View style={{ height: 9 }} />}
				renderItem={({ item }) => (
					<PublicationCard
						post={item}
						userId={user.id}
						onDelete={handleDeletePost}
						onUpdate={handleUpdatePost}
					/>
				)}
				onViewableItemsChanged={onViewableItemsChanged}
				viewabilityConfig={viewabilityConfig}
				contentContainerStyle={{ paddingBottom: 24 }}
				showsVerticalScrollIndicator={false}
			/>
		</View>
	);
}
