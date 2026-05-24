import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import {
	ActivityIndicator,
	Image,
	SafeAreaView,
	ScrollView,
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
import { ICONS } from "../../shared/icons";
import {
	getUserAlbums,
	getUserAvatar,
	getUserDisplayName,
	getUserHandle,
	toMediaUrl,
} from "../../shared/lib/model-helpers";
import { Button } from "../../shared/ui/button";
import { styles } from "./profile.styles";

const DEFAULT_AVATAR = toMediaUrl("/media/avatars/default_avatar.png") || "";

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
	request.status === "BLACKLISTED";

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

	const handleUpdatePost = useCallback((_updatedPost: IPost) => {}, []);
	const handleDeletePost = useCallback((_postId: number) => {}, []);

	const returnToUsersPage = () => {
		router.replace({
			pathname: "/friends",
		});
	};

	const sendFriendRequest = async () => {
		if (!currentUserId || !profileUserId) return;

		await createFriendshipRequest({
			senderId: currentUserId,
			receiverId: profileUserId,
		}).unwrap();
		returnToUsersPage();
	};

	const acceptRequest = async (requestId: number) => {
		await updateFriendshipStatus({ requestId, status: "ACCEPTED" }).unwrap();
	};

	const rejectRequest = async (requestId: number) => {
		await updateFriendshipStatus({ requestId, status: "BLACKLISTED" }).unwrap();
		returnToUsersPage();
	};

	const removeFriend = async (friendshipId: number) => {
		await deleteFriendship(friendshipId).unwrap();
		returnToUsersPage();
	};

	const deleteFromRecommendations = async () => {
		if (!currentUserId) return;

		if (relation.type === "incoming" || relation.type === "outgoing") {
			await updateFriendshipStatus({
				requestId: relation.requestId,
				status: "BLACKLISTED",
			}).unwrap();
		} else if (relation.type === "none") {
			await createFriendshipRequest({
				senderId: currentUserId,
				receiverId: profileUserId,
				status: "BLACKLISTED",
			}).unwrap();
		}

		returnToUsersPage();
	};

	const openChat = () => {
		router.push({
			pathname: "/chats",
			params: {
				userId: String(profileUserId),
				name: displayName,
				avatar: avatarUrl || DEFAULT_AVATAR,
			},
		});
	};

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
					) : posts.length > 0 ? (
						posts.map((post) => (
							<PublicationCard
								key={post.id}
								post={post}
								userId={currentUser?.id}
								onDelete={handleDeletePost}
								onUpdate={handleUpdatePost}
							/>
						))
					) : (
						<Text style={styles.emptyText}>Дописів поки немає</Text>
					)}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
