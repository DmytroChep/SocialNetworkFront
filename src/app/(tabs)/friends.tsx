import { useLocalSearchParams, useRouter } from "expo-router";
import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	Image,
	Platform,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DeleteFriendModal } from "../../modules/friends/friendsDeletePopUp/friendsDeletePopUp";
import type {
	IFriendRequest,
	IFriendshipProfile,
	IProfileFriend,
	IUserFriendships,
} from "../../modules/friends/types/Friendship.type";
import {
	useCreateFriendshipRequestMutation,
	useDeleteFriendshipMutation,
	useGetAllUsersQuery,
	useGetUserFriendshipsQuery,
	useUpdateFriendshipStatusMutation,
} from "../../shared/api/baseApi";
import { FONTS } from "../../shared/constants/fonts";
import type { IUser } from "../../shared/context/types";
import { useUserContext } from "../../shared/context/user-context";
import {
	getUserAvatar,
	getUserDisplayName,
	getUserHandle,
	toMediaUrl,
} from "../../shared/lib/model-helpers";
import { RadioTabs } from "../../shared/ui/RadioTab";
import type { IRadioTab } from "../../shared/ui/RadioTab/radioTab.types";
import { styles } from "./friends.styles";

const DEFAULT_AVATAR = toMediaUrl("/media/avatars/default_avatar.png") || "";
const REQUESTS_PAGE_SIZE = 3;
const RECOMMENDATIONS_PAGE_SIZE = 5;
const FRIENDS_PAGE_SIZE = 3;
const REQUESTS_PREVIEW_LIMIT = REQUESTS_PAGE_SIZE;
const RECOMMENDATIONS_PREVIEW_LIMIT = RECOMMENDATIONS_PAGE_SIZE;
const FRIENDS_PREVIEW_LIMIT = FRIENDS_PAGE_SIZE;

type FriendTab = "Головна" | "Запити" | "Рекомендації" | "Всі друзі";

interface FriendCardUser {
	id: number;
	name: string;
	handle: string;
	avatar: string;
}

interface FriendCardProps extends FriendCardUser {
	primaryText: string;
	secondaryText?: string;
	disabled?: boolean;
	primaryDisabled?: boolean;
	onPrimaryPress?: () => void;
	onSecondaryPress?: () => void;
	onAvatarPress?: () => void;
}

type RecommendationRelation =
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

const getTabFromParam = (tab?: string | string[]): FriendTab => {
	const value = Array.isArray(tab) ? tab[0] : tab;

	if (value === "requests") return "Запити";
	if (value === "recommendations") return "Рекомендації";
	if (value === "all") return "Всі друзі";

	return "Головна";
};

const getProfileUserId = (profile?: IFriendshipProfile) =>
	profile?.user?.id ?? profile?.user_id;

const isBlacklistedRequest = (request: IFriendRequest) =>
	request.status === "blacklisted";

const isVisibleRequest = (request: IFriendRequest) =>
	!isBlacklistedRequest(request);

const profileName = (profile: IFriendshipProfile, fallbackUser?: IUser) => {
	const fullName = [
		profile.user?.first_name ?? fallbackUser?.first_name,
		profile.user?.last_name ?? fallbackUser?.last_name,
	]
		.filter(Boolean)
		.join(" ")
		.trim();

	return (
		profile.pseudonym ||
		fallbackUser?.profile?.pseudonym ||
		fullName ||
		profile.user?.username ||
		fallbackUser?.username ||
		profile.user?.email ||
		fallbackUser?.email ||
		"Користувач"
	);
};

const profileToCardUser = (
	profile: IFriendshipProfile,
	fallbackUser?: IUser,
): FriendCardUser => {
	const handle = profile.user?.username || fallbackUser?.username;

	return {
		id: profile.user?.id ?? profile.user_id ?? fallbackUser?.id ?? 0,
		name: profileName(profile, fallbackUser),
		handle: handle
			? `@${handle}`
			: profile.user?.email || fallbackUser?.email || "",
		avatar:
			toMediaUrl(profile.avatar) ||
			getUserAvatar(fallbackUser) ||
			DEFAULT_AVATAR,
	};
};

const userToCardUser = (user: IUser): FriendCardUser => ({
	id: user.id,
	name: getUserDisplayName(user),
	handle: getUserHandle(user) ? `@${getUserHandle(user)}` : user.email,
	avatar: getUserAvatar(user) || DEFAULT_AVATAR,
});

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

const SectionHeader = ({
	title,
	onSeeAll,
}: {
	title: string;
	onSeeAll?: () => void;
}) => (
	<View style={styles.sectionHeader}>
		<Text
			style={[
				styles.sectionTitle,
				{ fontFamily: FONTS["GTWalsheimPro-Medium"] },
			]}
		>
			{title}
		</Text>
		{onSeeAll ? (
			<TouchableOpacity onPress={onSeeAll}>
				<Text
					style={[styles.seeAll, { fontFamily: FONTS["GTWalsheimPro-Medium"] }]}
				>
					Дивитись всі
				</Text>
			</TouchableOpacity>
		) : null}
	</View>
);

const FriendSection = ({
	title,
	emptyText,
	count,
	onSeeAll,
	children,
}: {
	title: string;
	emptyText: string;
	count: number;
	onSeeAll?: () => void;
	children: ReactNode;
}) => (
	<View style={styles.blockFriends}>
		<SectionHeader title={title} onSeeAll={onSeeAll} />
		{count > 0 ? children : <Text style={styles.emptyText}>{emptyText}</Text>}
	</View>
);

const FriendCard = ({
	name,
	handle,
	avatar,
	primaryText,
	secondaryText,
	disabled,
	primaryDisabled,
	onPrimaryPress,
	onSecondaryPress,
	onAvatarPress,
}: FriendCardProps) => (
	<View style={styles.card}>
		<TouchableOpacity
			activeOpacity={onAvatarPress ? 0.7 : 1}
			disabled={!onAvatarPress}
			onPress={onAvatarPress}
			style={styles.profileButton}
		>
			<View style={styles.avatarContainer}>
				<Image source={{ uri: avatar }} style={styles.avatar} />
				<View style={styles.statusIndicator} />
			</View>
			<Text
				style={[styles.name, { fontFamily: FONTS["GTWalsheimPro-Regular"] }]}
			>
				{name}
			</Text>
			<Text
				style={[styles.handle, { fontFamily: FONTS["GTWalsheimPro-Regular"] }]}
			>
				{handle}
			</Text>
		</TouchableOpacity>

		<View style={styles.buttonRow}>
			<TouchableOpacity
				style={[
					styles.primaryBtn,
					(disabled || primaryDisabled) && styles.disabledBtn,
				]}
				disabled={disabled || primaryDisabled || !onPrimaryPress}
				onPress={onPrimaryPress}
			>
				<Text
					style={[
						styles.primaryBtnText,
						{ fontFamily: FONTS["GTWalsheimPro-Medium"] },
					]}
				>
					{primaryText}
				</Text>
			</TouchableOpacity>
			{secondaryText ? (
				<TouchableOpacity
					style={styles.outlineBtn}
					disabled={disabled || !onSecondaryPress}
					onPress={onSecondaryPress}
				>
					<Text
						style={[
							styles.outlineBtnText,
							{ fontFamily: FONTS["GTWalsheimPro-Medium"] },
						]}
					>
						{secondaryText}
					</Text>
				</TouchableOpacity>
			) : null}
		</View>
	</View>
);

export default function Friends() {
	const router = useRouter();
	const { tab } = useLocalSearchParams<{ tab?: string }>();
	const { user } = useUserContext();
	const currentUserId = user?.id;
	const currentProfileId = user?.profile?.id;

	const [activeTab, setActiveTab] = useState<FriendTab>("Головна");
	const [visibleRequestsCount, setVisibleRequestsCount] =
		useState(REQUESTS_PAGE_SIZE);
	const [visibleRecommendationsCount, setVisibleRecommendationsCount] =
		useState(RECOMMENDATIONS_PAGE_SIZE);
	const [visibleFriendsCount, setVisibleFriendsCount] =
		useState(FRIENDS_PAGE_SIZE);
	const [isModalVisible, setModalVisible] = useState(false);
	const [confirmAction, setConfirmAction] = useState<
		(() => Promise<void>) | null
	>(null);

	const {
		data: friendshipsResponse,
		isLoading: isFriendshipsLoading,
		isError: isFriendshipsError,
	} = useGetUserFriendshipsQuery(currentUserId as number, {
		skip: !currentUserId,
		pollingInterval: 3000,
	});
	const { data: users = [], isLoading: isUsersLoading } = useGetAllUsersQuery();

	const [createFriendshipRequest, { isLoading: isCreating }] =
		useCreateFriendshipRequestMutation();
	const [updateFriendshipStatus, { isLoading: isUpdating }] =
		useUpdateFriendshipStatusMutation();
	const [deleteFriendship, { isLoading: isDeleting }] =
		useDeleteFriendshipMutation();

	const friendships = isFriendshipData(friendshipsResponse)
		? friendshipsResponse
		: {
				friends: [],
				incomingRequests: [],
				outgoingRequests: [],
				blacklistedRequests: [],
			};
	const isActionLoading = isCreating || isUpdating || isDeleting;

	useEffect(() => {
		if (activeTab === "Запити") setVisibleRequestsCount(REQUESTS_PAGE_SIZE);
		if (activeTab === "Рекомендації")
			setVisibleRecommendationsCount(RECOMMENDATIONS_PAGE_SIZE);
		if (activeTab === "Всі друзі") setVisibleFriendsCount(FRIENDS_PAGE_SIZE);
	}, [activeTab]);

	useEffect(() => {
		setActiveTab(getTabFromParam(tab));
	}, [tab]);

	const relationByUserId = useMemo(() => {
		const relations = new Map<number, RecommendationRelation>();

		friendships.friends.forEach((friendship) => {
			const friendProfile = getFriendProfile(
				friendship,
				currentUserId,
				currentProfileId,
			);
			const friendUserId = getProfileUserId(friendProfile);
			if (!friendUserId) return;

			relations.set(friendUserId, {
				type: "friend",
				friendshipId: friendship.id,
			});
		});

		const allRequests = [
			...friendships.incomingRequests,
			...friendships.outgoingRequests,
			...(friendships.blacklistedRequests ?? []),
		];

		allRequests.forEach((request) => {
			if (!isBlacklistedRequest(request)) return;

			const fromUserId = getProfileUserId(request.from_profile);
			const toUserId = getProfileUserId(request.to_profile);
			const blacklistedUserId =
				fromUserId === currentUserId ? toUserId : fromUserId;

			if (!blacklistedUserId) return;

			relations.set(blacklistedUserId, {
				type: "blacklisted",
				requestId: request.id,
			});
		});

		friendships.incomingRequests.filter(isVisibleRequest).forEach((request) => {
			const senderUserId = getProfileUserId(request.from_profile);
			if (!senderUserId) return;

			relations.set(senderUserId, {
				type: "incoming",
				requestId: request.id,
			});
		});

		friendships.outgoingRequests.filter(isVisibleRequest).forEach((request) => {
			const receiverUserId = getProfileUserId(request.to_profile);
			if (!receiverUserId) return;

			relations.set(receiverUserId, {
				type: "outgoing",
				requestId: request.id,
			});
		});

		return relations;
	}, [currentProfileId, currentUserId, friendships]);

	const recommendations = useMemo(() => {
		return [...users]
			.filter((item) => {
				if (item.id === currentUserId) return false;

				const relation = relationByUserId.get(item.id);

				return (
					relation?.type !== "friend" &&
					relation?.type !== "incoming" &&
					relation?.type !== "outgoing" &&
					relation?.type !== "blacklisted"
				);
			})
			.sort((firstUser, secondUser) => secondUser.id - firstUser.id);
	}, [currentUserId, relationByUserId, users]);

	const incomingRequests = useMemo(() => {
		return friendships.incomingRequests.filter(isVisibleRequest);
	}, [friendships.incomingRequests]);

	const allFriends = useMemo(() => {
		return [...friendships.friends].sort(
			(firstFriend, secondFriend) => secondFriend.id - firstFriend.id,
		);
	}, [friendships.friends]);
	const usersById = useMemo(() => {
		return new Map(users.map((item) => [item.id, item]));
	}, [users]);

	const visibleRequests = incomingRequests.slice(0, visibleRequestsCount);
	const visibleRecommendations = recommendations.slice(
		0,
		visibleRecommendationsCount,
	);
	const visibleFriends = allFriends.slice(0, visibleFriendsCount);

	const navigateToProfile = useCallback((cardUser: FriendCardUser) => {
		router.push({
			pathname: "/profile",
			params: {
				id: String(cardUser.id),
				name: cardUser.name,
				handle: cardUser.handle,
				avatar: cardUser.avatar,
			},
		});
	}, [router]);

	const navigateToChat = useCallback((cardUser: FriendCardUser) => {
		router.push({
			pathname: "/chats",
			params: {
				userId: String(cardUser.id),
				name: cardUser.name,
				avatar: cardUser.avatar,
			},
		});
	}, [router]);

	const handleMessagePress = useCallback((cardUser: FriendCardUser) => {
		if (Platform.OS === "web") {
			navigateToChat(cardUser);
			return;
		}

		navigateToProfile(cardUser);
	}, [navigateToChat, navigateToProfile]);

	const askConfirmation = useCallback((action: () => Promise<void>) => {
		setConfirmAction(() => action);
		setModalVisible(true);
	}, []);

	const handleConfirmAction = useCallback(async () => {
		if (!confirmAction) return;

		try {
			await confirmAction();
		} finally {
			setConfirmAction(null);
			setModalVisible(false);
		}
	}, [confirmAction]);

	const removeFriend = useCallback(
		async (friendshipId: number) => {
			await deleteFriendship(friendshipId).unwrap();
		},
		[deleteFriendship],
	);

	const acceptRequest = useCallback(
		async (requestId: number) => {
			await updateFriendshipStatus({ requestId, status: "accepted" }).unwrap();
		},
		[updateFriendshipStatus],
	);

	const deleteRequest = useCallback(
		async (request: IFriendRequest) => {
			await updateFriendshipStatus({
				requestId: request.id,
				status: "blacklisted",
			}).unwrap();
		},
		[updateFriendshipStatus],
	);

	const blacklistUser = useCallback(
		async (userId: number) => {
			if (!currentUserId) return;
			await createFriendshipRequest({
				senderId: currentUserId,
				receiverId: userId,
				status: "blacklisted",
			}).unwrap();
		},
		[currentUserId, createFriendshipRequest],
	);

	const getRecommendationActions = useCallback((recommendedUserId: number) => {
		return {
			primaryText: "Додати",
			secondaryText: "Видалити",
			primaryDisabled: false,
			onPrimaryPress: undefined,
			onSecondaryPress: () => blacklistUser(recommendedUserId),
		};
	}, [blacklistUser]);

	const renderRequestCard = useCallback((request: IFriendRequest) => {
		const cardUser = profileToCardUser(
			request.from_profile,
			usersById.get(getProfileUserId(request.from_profile) ?? 0),
		);

		return (
			<FriendCard
				key={`incoming-${request.id}`}
				{...cardUser}
				primaryText="Підтвердити"
				secondaryText="Видалити"
				disabled={isActionLoading}
				onPrimaryPress={() => acceptRequest(request.id)}
				onSecondaryPress={() => askConfirmation(() => deleteRequest(request))}
				onAvatarPress={() => navigateToProfile(cardUser)}
			/>
		);
	}, [usersById, isActionLoading, acceptRequest, deleteRequest, askConfirmation, navigateToProfile]);

	const renderRecommendationCard = useCallback((recommendedUser: IUser) => {
		const cardUser = userToCardUser(recommendedUser);
		const actions = getRecommendationActions(recommendedUser.id);

		return (
			<FriendCard
				key={`rec-${recommendedUser.id}`}
				{...cardUser}
				primaryText={actions.primaryText}
				secondaryText={actions.secondaryText}
				disabled={isActionLoading}
				primaryDisabled={actions.primaryDisabled}
				onPrimaryPress={() => navigateToProfile(cardUser)}
				onSecondaryPress={actions.onSecondaryPress}
			/>
		);
	}, [isActionLoading, navigateToProfile, getRecommendationActions]);

	const renderFriendCard = useCallback((friendship: IProfileFriend) => {
		const friendProfile = getFriendProfile(
			friendship,
			currentUserId,
			currentProfileId,
		);
		const cardUser = profileToCardUser(
			friendProfile,
			usersById.get(getProfileUserId(friendProfile) ?? 0),
		);

		return (
			<FriendCard
				key={`all-${friendship.id}`}
				{...cardUser}
				primaryText="Повідомлення"
				secondaryText="Видалити"
				disabled={isActionLoading}
				onPrimaryPress={() => handleMessagePress(cardUser)}
				onSecondaryPress={() =>
					askConfirmation(() => removeFriend(friendship.id))
				}
				onAvatarPress={() => navigateToProfile(cardUser)}
			/>
		);
	}, [currentUserId, currentProfileId, usersById, isActionLoading, handleMessagePress, askConfirmation, removeFriend, navigateToProfile]);

	const openTab = useCallback((tab: FriendTab) => {
		setActiveTab(tab);
	}, []);

	const RequestsPreviewSection = () => {
		const previewRequests = incomingRequests.slice(0, REQUESTS_PREVIEW_LIMIT);

		return (
			<FriendSection
				title="Запити"
				emptyText="Нових запитів поки немає"
				count={previewRequests.length}
				onSeeAll={
					incomingRequests.length > 0 ? () => openTab("Запити") : undefined
				}
			>
				{previewRequests.map(renderRequestCard)}
			</FriendSection>
		);
	};

	const RecommendationsPreviewSection = () => {
		const previewRecommendations = recommendations.slice(
			0,
			RECOMMENDATIONS_PREVIEW_LIMIT,
		);

		return (
			<FriendSection
				title="Рекомендації"
				emptyText="Немає нових рекомендацій"
				count={previewRecommendations.length}
				onSeeAll={
					recommendations.length > 0 ? () => openTab("Рекомендації") : undefined
				}
			>
				{previewRecommendations.map(renderRecommendationCard)}
			</FriendSection>
		);
	};

	const FriendsPreviewSection = () => {
		const previewFriends = allFriends.slice(0, FRIENDS_PREVIEW_LIMIT);

		return (
			<FriendSection
				title="Всі друзі"
				emptyText="Список друзів порожній"
				count={previewFriends.length}
				onSeeAll={
					allFriends.length > 0 ? () => openTab("Всі друзі") : undefined
				}
			>
				{previewFriends.map(renderFriendCard)}
			</FriendSection>
		);
	};

	const RequestsFullSection = () => (
		<FlatList
			data={visibleRequests}
			keyExtractor={(request) => `incoming-${request.id}`}
			renderItem={({ item }) => renderRequestCard(item)}
			contentContainerStyle={styles.listContent}
			showsVerticalScrollIndicator={false}
			onEndReached={() =>
				setVisibleRequestsCount((count) =>
					Math.min(count + REQUESTS_PAGE_SIZE, incomingRequests.length),
				)
			}
			onEndReachedThreshold={0.5}
			ListHeaderComponent={<SectionHeader title="Запити" />}
			ListEmptyComponent={
				<Text style={styles.emptyText}>Нових запитів поки немає</Text>
			}
		/>
	);

	const RecommendationsFullSection = () => (
		<FlatList
			data={visibleRecommendations}
			keyExtractor={(recommendedUser) => `rec-${recommendedUser.id}`}
			renderItem={({ item }) => renderRecommendationCard(item)}
			contentContainerStyle={styles.listContent}
			showsVerticalScrollIndicator={false}
			onEndReached={() =>
				setVisibleRecommendationsCount((count) =>
					Math.min(count + RECOMMENDATIONS_PAGE_SIZE, recommendations.length),
				)
			}
			onEndReachedThreshold={0.5}
			ListHeaderComponent={<SectionHeader title="Рекомендації" />}
			ListEmptyComponent={
				<Text style={styles.emptyText}>Немає нових рекомендацій</Text>
			}
		/>
	);

	const FriendsFullSection = () => (
		<FlatList
			data={visibleFriends}
			keyExtractor={(friendship) => `all-${friendship.id}`}
			renderItem={({ item }) => renderFriendCard(item)}
			contentContainerStyle={styles.listContent}
			showsVerticalScrollIndicator={false}
			onEndReached={() =>
				setVisibleFriendsCount((count) =>
					Math.min(count + FRIENDS_PAGE_SIZE, allFriends.length),
				)
			}
			onEndReachedThreshold={0.5}
			ListHeaderComponent={<SectionHeader title="Всі друзі" />}
			ListEmptyComponent={
				<Text style={styles.emptyText}>Список друзів порожній</Text>
			}
		/>
	);

	const radioTabsArray: IRadioTab[] = [
		{
			title: "Головна",
			content: (
				<ScrollView
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
				>
					<RequestsPreviewSection />
					<RecommendationsPreviewSection />
					<FriendsPreviewSection />
				</ScrollView>
			),
		},
		{
			title: "Запити",
			content: <RequestsFullSection />,
		},
		{
			title: "Рекомендації",
			content: <RecommendationsFullSection />,
		},
		{
			title: "Всі друзі",
			content: <FriendsFullSection />,
		},
	];

	if (!currentUserId) {
		return (
			<SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
				<View style={styles.centered}>
					<Text style={styles.emptyText}>Увійдіть, щоб бачити друзів</Text>
				</View>
			</SafeAreaView>
		);
	}

	if (isFriendshipsLoading || isUsersLoading) {
		return (
			<SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
				<View style={styles.centered}>
					<ActivityIndicator />
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
			<View style={{ flex: 1 }}>
				{isFriendshipsError ? (
					<View style={styles.centered}>
						<Text style={styles.emptyText}>Не вдалося завантажити друзів</Text>
					</View>
				) : (
					<RadioTabs
						activeTab={activeTab}
						fullHeight
						variant="friends"
						onTabChange={(tab) => setActiveTab(tab as FriendTab)}
						radioTabsArray={radioTabsArray}
					/>
				)}
			</View>
			<DeleteFriendModal
				isVisible={isModalVisible}
				onClose={() => {
					setModalVisible(false);
					setConfirmAction(null);
				}}
				onConfirm={handleConfirmAction}
			/>
		</SafeAreaView>
	);
}
