import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
	ActivityIndicator,
	Image,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import type {
	IFriendRequest,
	IFriendshipProfile,
	IProfileFriend,
	IUserFriendships,
} from "../../modules/friends/types/Friendship.type";
import type { IPost } from "../../modules/my-publications/types/Post.type";
import { PublicationCard } from "../../modules/my-publications/ui/publicationCard/publicationCard";
import { AlbumCard } from "../../modules/profile/albumCard/albumCard";
import {
	useCreateFriendshipRequestMutation,
	useDeleteFriendshipMutation,
	useGetUserByIdQuery,
	useGetUserFriendshipsQuery,
	useGetUserPostsQuery,
	useUpdateFriendshipStatusMutation,
} from "../../shared/api/baseApi";
import { useUserContext } from "../../shared/context/user-context";
import { FONTS } from "../../shared/constants/fonts";
import { ICONS } from "../../shared/icons";
import {
	getUserAlbums,
	getUserAvatar,
	getUserDisplayName,
	getUserHandle,
	toMediaUrl,
	DEFAULT_AVATAR_URL,
} from "../../shared/lib/model-helpers";
import { Button } from "../../shared/ui/button";
import { styles } from "./profile.styles";

const DEFAULT_AVATAR = DEFAULT_AVATAR_URL || "";
const PROFILE_POSTS_PAGE_SIZE = 5;

type ProfileRelation =
	| { type: "self" }
	| { type: "none" }
	| { type: "friend"; friendshipId: number }
	| { type: "incoming"; requestId: number }
	| { type: "outgoing"; requestId: number }
	| { type: "blacklisted"; requestId: number };

const isFriendshipData = (value: unknown): value is IUserFriendships => {
	return Boolean(
		value &&
			typeof value === "object" &&
			Array.isArray((value as IUserFriendships).friends) &&
			Array.isArray((value as IUserFriendships).incomingRequests) &&
			Array.isArray((value as IUserFriendships).outgoingRequests),
	);
};

const getProfileUserId = (profile?: IFriendshipProfile) =>
	profile?.user?.id ?? profile?.user_id;

const isBlacklistedRequest = (request: IFriendRequest) =>
	request.status === "blacklisted";

const getFriendProfile = (
	friendship: IProfileFriend,
	currentUserId?: number,
	currentProfileId?: number,
) => {
	if (friendship.from_profile_id === currentProfileId)
		return friendship.to_profile;
	if (friendship.to_profile_id === currentProfileId)
		return friendship.from_profile;
	if (getProfileUserId(friendship.from_profile) === currentUserId)
		return friendship.to_profile;

	return friendship.from_profile;
};

export default function UserProfile() {
	const router = useRouter();
	const { user: currentUser } = useUserContext();
	const { id, name, handle, avatar } = useLocalSearchParams();
	const profileUserId = Number(id);
	const currentUserId = currentUser?.id;
	const [currentPostsPage, setCurrentPostsPage] = useState(1);

	const {
		data: profileUser,
		isLoading: isUserLoading,
		isError: isUserError,
	} = useGetUserByIdQuery(profileUserId, {
		skip: !profileUserId,
	});
	const { data: posts = [], isLoading: isPostsLoading } = useGetUserPostsQuery(
		{ userId: profileUserId },
		{ skip: !profileUserId },
	);
	const {
		data: profileFriendshipsResponse,
		isLoading: isProfileFriendshipsLoading,
	} = useGetUserFriendshipsQuery(profileUserId, {
		skip: !profileUserId,
	});
	const { data: currentFriendshipsResponse } = useGetUserFriendshipsQuery(
		currentUserId as number,
		{ skip: !currentUserId },
	);

	const [createFriendshipRequest, { isLoading: isCreatingRequest }] =
		useCreateFriendshipRequestMutation();
	const [updateFriendshipStatus, { isLoading: isUpdatingFriendship }] =
		useUpdateFriendshipStatusMutation();
	const [deleteFriendship, { isLoading: isDeletingFriendship }] =
		useDeleteFriendshipMutation();

	const profileFriendships = isFriendshipData(profileFriendshipsResponse)
		? profileFriendshipsResponse
		: { friends: [], incomingRequests: [], outgoingRequests: [] };
	const currentFriendships = isFriendshipData(currentFriendshipsResponse)
		? currentFriendshipsResponse
		: { friends: [], incomingRequests: [], outgoingRequests: [] };

	const relation = useMemo<ProfileRelation>(() => {
		if (!currentUserId || currentUserId === profileUserId)
			return { type: "self" };

		const friendship = currentFriendships.friends.find((item) => {
			const friendProfile = getFriendProfile(
				item,
				currentUserId,
				currentUser?.profile?.id,
			);

			return getProfileUserId(friendProfile) === profileUserId;
		});

		if (friendship) {
			return { type: "friend", friendshipId: friendship.id };
		}

		const allRequests = [
			...currentFriendships.incomingRequests,
			...currentFriendships.outgoingRequests,
			...(currentFriendships.blacklistedRequests ?? []),
		];

		const blacklistedRequest = allRequests.find((item) => {
			if (!isBlacklistedRequest(item)) return false;

			const fromUserId = getProfileUserId(item.from_profile);
			const toUserId = getProfileUserId(item.to_profile);

			return fromUserId === profileUserId || toUserId === profileUserId;
		});

		if (blacklistedRequest) {
			return { type: "blacklisted", requestId: blacklistedRequest.id };
		}

		const incomingRequest = currentFriendships.incomingRequests.find(
			(item) => getProfileUserId(item.from_profile) === profileUserId,
		);

		if (incomingRequest) {
			return { type: "incoming", requestId: incomingRequest.id };
		}

		const outgoingRequest = currentFriendships.outgoingRequests.find(
			(item) => getProfileUserId(item.to_profile) === profileUserId,
		);

		if (outgoingRequest) {
			return { type: "outgoing", requestId: outgoingRequest.id };
		}

		return { type: "none" };
	}, [
		currentFriendships,
		currentUser?.profile?.id,
		currentUserId,
		profileUserId,
	]);

	const displayName = profileUser
		? getUserDisplayName(profileUser)
		: String(name || "");
	const userHandle = profileUser
		? getUserHandle(profileUser)
		: String(handle || "").replace(/^@/, "");
	const avatarUrl = profileUser
		? getUserAvatar(profileUser)
		: String(avatar || "");
	const albums = profileUser ? getUserAlbums(profileUser) : [];
	const isActionLoading =
		isCreatingRequest || isUpdatingFriendship || isDeletingFriendship;

	const returnToUsersPage = useCallback(() => {
		router.replace({
			pathname: "/friends",
		});
	}, [router]);

	const sendFriendRequest = useCallback(async () => {
		if (!currentUserId || !profileUserId) return;

		await createFriendshipRequest({
			senderId: currentUserId,
			receiverId: profileUserId,
		}).unwrap();
		returnToUsersPage();
	}, [currentUserId, profileUserId, createFriendshipRequest, returnToUsersPage]);

	const acceptRequest = useCallback(
		async (requestId: number) => {
			await updateFriendshipStatus({ requestId, status: "accepted" }).unwrap();
		},
		[updateFriendshipStatus],
	);

	const rejectRequest = useCallback(
		async (requestId: number) => {
			await updateFriendshipStatus({ requestId, status: "blacklisted" }).unwrap();
			returnToUsersPage();
		},
		[updateFriendshipStatus, returnToUsersPage],
	);

	const removeFriend = useCallback(
		async (friendshipId: number) => {
			await deleteFriendship(friendshipId).unwrap();
			returnToUsersPage();
		},
		[deleteFriendship, returnToUsersPage],
	);

	const deleteFromRecommendations = useCallback(async () => {
		if (!currentUserId) return;

		if (relation.type === "incoming" || relation.type === "outgoing") {
			await updateFriendshipStatus({
				requestId: relation.requestId,
				status: "blacklisted",
			}).unwrap();
		} else if (relation.type === "none") {
			await createFriendshipRequest({
				senderId: currentUserId,
				receiverId: profileUserId,
				status: "blacklisted",
			}).unwrap();
		}

		returnToUsersPage();
	}, [currentUserId, relation, updateFriendshipStatus, createFriendshipRequest, profileUserId, returnToUsersPage]);

	const openChat = useCallback(() => {
		router.push({
			pathname: "/chats",
			params: {
				userId: String(profileUserId),
				name: displayName,
				avatar: avatarUrl || DEFAULT_AVATAR,
			},
		});
	}, [router, profileUserId, displayName, avatarUrl]);

	const handleUpdatePost = useCallback((_updatedPost: IPost) => {}, []);
	const handleDeletePost = useCallback((_postId: number) => {}, []);

	const paginatedPosts = useMemo(() => {
		const start = (currentPostsPage - 1) * PROFILE_POSTS_PAGE_SIZE;
		const end = start + PROFILE_POSTS_PAGE_SIZE;
		return posts.slice(start, end);
	}, [posts, currentPostsPage]);

	const hasMorePosts = posts.length > currentPostsPage * PROFILE_POSTS_PAGE_SIZE;

	const renderActionButtons = () => {
		if (relation.type === "self") return null;

		if (relation.type === "friend") {
			return (
				<View style={styles.buttonGroup}>
					<Button
						disabled={isActionLoading}
						onPress={openChat}
						style={styles.btnPrimary}
						title="Повідомлення"
						titleStyle={styles.btnTextWhite}
					/>
					<Button
						disabled={isActionLoading}
						onPress={() => removeFriend(relation.friendshipId)}
						style={styles.btnSecondary}
						title="Видалити"
						titleStyle={styles.btnTextDark}
					/>
				</View>
			);
		}

		if (relation.type === "incoming") {
			return (
				<View style={styles.buttonGroup}>
					<Button
						disabled={isActionLoading}
						onPress={() => acceptRequest(relation.requestId)}
						style={styles.btnPrimary}
						title="Підтвердити"
						titleStyle={styles.btnTextWhite}
					/>
					<Button
						disabled={isActionLoading}
						onPress={() => rejectRequest(relation.requestId)}
						style={styles.btnSecondary}
						title="Видалити"
						titleStyle={styles.btnTextDark}
					/>
				</View>
			);
		}

		if (relation.type === "outgoing" || relation.type === "blacklisted") {
			return (
				<View style={styles.buttonGroup}>
					<Button
						disabled
						style={styles.btnPrimary}
						title={relation.type === "blacklisted" ? "Приховано" : "Очікує"}
						titleStyle={styles.btnTextWhite}
					/>
					<Button
						disabled={isActionLoading}
						onPress={deleteFromRecommendations}
						style={styles.btnSecondary}
						title="Видалити"
						titleStyle={styles.btnTextDark}
					/>
				</View>
			);
		}

		return (
			<View style={styles.buttonGroup}>
				<Button
					disabled={isActionLoading}
					onPress={sendFriendRequest}
					style={styles.btnPrimary}
					title="Підтвердити"
					titleStyle={styles.btnTextWhite}
				/>
				<Button
					disabled={isActionLoading}
					onPress={deleteFromRecommendations}
					style={styles.btnSecondary}
					title="Видалити"
					titleStyle={styles.btnTextDark}
				/>
			</View>
		);
	};

	if (!profileUserId) {
		return (
			<SafeAreaView style={styles.safeArea}>
				<View style={styles.centered}>
					<Text style={styles.emptyText}>Профіль не знайдено</Text>
				</View>
			</SafeAreaView>
		);
	}

	if (isUserLoading) {
		return (
			<SafeAreaView style={styles.safeArea}>
				<View style={styles.centered}>
					<ActivityIndicator />
				</View>
			</SafeAreaView>
		);
	}

	if (isUserError) {
		return (
			<SafeAreaView style={styles.safeArea}>
				<View style={styles.centered}>
					<Text style={styles.emptyText}>Не вдалося завантажити профіль</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.safeArea}>
			<ScrollView
				style={styles.container}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.profileCard}>
					<TouchableOpacity style={styles.backBtn}>
						<ICONS.ArrowIcon onPress={() => router.replace("/friends")} />
					</TouchableOpacity>

					<View style={styles.firstSectionProfileView}>
						<View style={styles.avatarContainer}>
							<Image
								source={{ uri: avatarUrl || DEFAULT_AVATAR }}
								style={styles.avatar}
							/>
							<View style={styles.onlineBadge} />
						</View>
						<Text style={styles.userName}>{displayName || "Користувач"}</Text>
						<Text style={styles.userHandle}>
							{userHandle ? `@${userHandle}` : ""}
						</Text>
					</View>

					<View style={styles.statsContainer}>
						<View style={styles.statItem}>
							<Text style={styles.statNumber}>{posts.length}</Text>
							<Text style={styles.statLabel}>Дописи</Text>
						</View>
						<View style={styles.statDivider} />
						<View style={styles.statItem}>
							<Text style={styles.statNumber}>{albums.length}</Text>
							<Text style={styles.statLabel}>Альбоми</Text>
						</View>
						<View style={styles.statDivider} />
						<View style={styles.statItem}>
							<Text style={styles.statNumber}>
								{isProfileFriendshipsLoading
									? "..."
									: profileFriendships.friends.length}
							</Text>
							<Text style={styles.statLabel}>Друзі</Text>
						</View>
					</View>

					{renderActionButtons()}
				</View>

				<View style={styles.sectionContainer}>
					<View style={styles.sectionHeader}>
						<View style={styles.sectionTitleRow}>
							<ICONS.image width={20} height={20} />
							<Text style={styles.sectionTitle}>Альбоми</Text>
						</View>
					</View>

					{albums.length > 0 ? (
						albums.map((album) => (
							<AlbumCard
								key={album.id}
								element={album}
								onOpenPopup={() => {}}
								readonly
							/>
						))
					) : (
						<Text style={styles.emptyText}>Альбомів поки немає</Text>
					)}
				</View>

				<View style={styles.postsSection}>
					{isPostsLoading ? (
						<ActivityIndicator style={{ marginVertical: 16 }} />
					) : paginatedPosts.length > 0 ? (
						<>
							{paginatedPosts.map((post) => (
								<PublicationCard
									key={post.id}
									post={post}
									userId={currentUser?.id}
									onDelete={handleDeletePost}
									onUpdate={handleUpdatePost}
								/>
							))}
							{hasMorePosts && (
								<TouchableOpacity
									style={profileStyles.loadMoreButton}
									onPress={() => setCurrentPostsPage(prev => prev + 1)}
								>
									<Text style={profileStyles.loadMoreText}>Завантажити ще</Text>
								</TouchableOpacity>
							)}
						</>
					) : (
						<Text style={styles.emptyText}>Дописів поки немає</Text>
					)}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const profileStyles = StyleSheet.create({
	loadMoreButton: {
		paddingVertical: 12,
		paddingHorizontal: 16,
		marginHorizontal: 12,
		marginTop: 12,
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
