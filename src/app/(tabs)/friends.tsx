import React, { ReactNode, useMemo, useState } from "react";
import {
	ActivityIndicator,
	Image,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { RadioTabs } from "../../shared/ui/RadioTab";
import { IRadioTab } from "../../shared/ui/RadioTab/radioTab.types";
import { FONTS } from "../../shared/constants/fonts";
import { styles } from "./friends.styles";
import { DeleteFriendModal } from "../../modules/friends/friendsDeletePopUp/friendsDeletePopUp";
import {
	useCreateFriendshipRequestMutation,
	useDeleteFriendshipMutation,
	useGetAllUsersQuery,
	useGetUserFriendshipsQuery,
	useUpdateFriendshipStatusMutation,
} from "../../shared/api/baseApi";
import { useUserContext } from "../../shared/context/user-context";
import type { IUser } from "../../shared/context/types";
import {
	getUserAvatar,
	getUserDisplayName,
	getUserHandle,
	toMediaUrl,
} from "../../shared/lib/model-helpers";
import type {
	IFriendRequest,
	IFriendshipProfile,
	IProfileFriend,
	IUserFriendships,
} from "../../modules/friends/types/Friendship.type";

const DEFAULT_AVATAR = "https://i.postimg.cc/0y93rTHc/image.png";

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
	onAvatarPress: () => void;
}

type RecommendationRelation =
	| { type: "none" }
	| { type: "friend"; friendshipId: number }
	| { type: "incoming"; requestId: number }
	| { type: "outgoing"; requestId: number };

const isFriendshipData = (value: unknown): value is IUserFriendships => {
	return Boolean(
		value &&
			typeof value === "object" &&
			Array.isArray((value as IUserFriendships).friends) &&
			Array.isArray((value as IUserFriendships).incomingRequests) &&
			Array.isArray((value as IUserFriendships).outgoingRequests),
	);
};

const profileName = (profile: IFriendshipProfile) => {
	const fullName = [profile.user.first_name, profile.user.last_name]
		.filter(Boolean)
		.join(" ")
		.trim();

	return profile.pseudonym || fullName || profile.user.username || profile.user.email;
};

const profileToCardUser = (profile: IFriendshipProfile): FriendCardUser => ({
	id: profile.user.id,
	name: profileName(profile),
	handle: profile.user.username ? `@${profile.user.username}` : profile.user.email,
	avatar: toMediaUrl(profile.avatar) || DEFAULT_AVATAR,
});

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
	if (friendship.from_profile_id === currentProfileId) return friendship.to_profile;
	if (friendship.to_profile_id === currentProfileId) return friendship.from_profile;
	if (friendship.from_profile.user.id === currentUserId) return friendship.to_profile;

	return friendship.from_profile;
};

const SectionHeader = ({ title }: { title: string }) => (
	<View style={styles.sectionHeader}>
		<Text style={[styles.sectionTitle, { fontFamily: FONTS["GTWalsheimPro-Medium"] }]}>
			{title}
		</Text>
	</View>
);

const FriendSection = ({
	title,
	emptyText,
	count,
	children,
}: {
	title: string;
	emptyText: string;
	count: number;
	children: ReactNode;
}) => (
	<View style={styles.blockFriends}>
		<SectionHeader title={title} />
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
		<TouchableOpacity onPress={onAvatarPress} style={styles.profileButton}>
			<View style={styles.avatarContainer}>
				<Image source={{ uri: avatar }} style={styles.avatar} />
				<View style={styles.statusIndicator} />
			</View>
			<Text style={[styles.name, { fontFamily: FONTS["GTWalsheimPro-Regular"] }]}>
				{name}
			</Text>
			<Text style={[styles.handle, { fontFamily: FONTS["GTWalsheimPro-Regular"] }]}>
				{handle}
			</Text>
		</TouchableOpacity>

		<View style={styles.buttonRow}>
			<TouchableOpacity
				style={[styles.primaryBtn, (disabled || primaryDisabled) && styles.disabledBtn]}
				disabled={disabled || primaryDisabled || !onPrimaryPress}
				onPress={onPrimaryPress}
			>
				<Text style={[styles.primaryBtnText, { fontFamily: FONTS["GTWalsheimPro-Medium"] }]}>
					{primaryText}
				</Text>
			</TouchableOpacity>
			{secondaryText ? (
				<TouchableOpacity
					style={styles.outlineBtn}
					disabled={disabled || !onSecondaryPress}
					onPress={onSecondaryPress}
				>
					<Text style={[styles.outlineBtnText, { fontFamily: FONTS["GTWalsheimPro-Medium"] }]}>
						{secondaryText}
					</Text>
				</TouchableOpacity>
			) : null}
		</View>
	</View>
);

export default function Friends() {
	const router = useRouter();
	const { user } = useUserContext();
	const currentUserId = user?.id;
	const currentProfileId = user?.profile?.id;

	const [isModalVisible, setModalVisible] = useState(false);
	const [confirmAction, setConfirmAction] = useState<(() => Promise<void>) | null>(null);

	const {
		data: friendshipsResponse,
		isLoading: isFriendshipsLoading,
		isError: isFriendshipsError,
	} = useGetUserFriendshipsQuery(currentUserId as number, {
		skip: !currentUserId,
		pollingInterval: 3000
	});
	const { data: users = [], isLoading: isUsersLoading } = useGetAllUsersQuery();

	const [createFriendshipRequest, { isLoading: isCreating }] =
		useCreateFriendshipRequestMutation();
	const [updateFriendshipStatus, { isLoading: isUpdating }] =
		useUpdateFriendshipStatusMutation();
	const [deleteFriendship, { isLoading: isDeleting }] = useDeleteFriendshipMutation();

	const friendships = isFriendshipData(friendshipsResponse)
		? friendshipsResponse
		: { friends: [], incomingRequests: [], outgoingRequests: [] };
	const isActionLoading = isCreating || isUpdating || isDeleting;

	const relationByUserId = useMemo(() => {
		const relations = new Map<number, RecommendationRelation>();

		friendships.friends.forEach((friendship) => {
			const friendProfile = getFriendProfile(friendship, currentUserId, currentProfileId);
			relations.set(friendProfile.user.id, {
				type: "friend",
				friendshipId: friendship.id,
			});
		});

		friendships.incomingRequests.forEach((request) => {
			relations.set(request.from_profile.user.id, {
				type: "incoming",
				requestId: request.id,
			});
		});

		friendships.outgoingRequests.forEach((request) => {
			relations.set(request.to_profile.user.id, {
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
					relation?.type !== "outgoing" &&
					relation?.type !== "incoming"
				);
			})
			.sort((firstUser, secondUser) => secondUser.id - firstUser.id);
	}, [currentUserId, relationByUserId, users]);

	const navigateToProfile = (cardUser: FriendCardUser) => {
		router.push({
			pathname: "/profile",
			params: {
				id: String(cardUser.id),
				name: cardUser.name,
				handle: cardUser.handle,
				avatar: cardUser.avatar,
			},
		});
	};

	const askConfirmation = (action: () => Promise<void>) => {
		setConfirmAction(() => action);
		setModalVisible(true);
	};

	const handleConfirmAction = async () => {
		if (!confirmAction) return;

		try {
			await confirmAction();
		} finally {
			setConfirmAction(null);
			setModalVisible(false);
		}
	};

	const acceptRequest = async (requestId: number) => {
		await updateFriendshipStatus({ requestId, status: "ACCEPTED" }).unwrap();
	};

	const rejectRequest = async (requestId: number) => {
		await updateFriendshipStatus({ requestId, status: "REJECTED" }).unwrap();
	};

	const addFriend = async (receiverId: number) => {
		if (!currentUserId) return;
		await createFriendshipRequest({ senderId: currentUserId, receiverId }).unwrap();
	};

	const removeFriend = async (friendshipId: number) => {
		await deleteFriendship(friendshipId).unwrap();
	};

	const getRecommendationActions = (recommendedUserId: number) => {
		const relation = relationByUserId.get(recommendedUserId) ?? { type: "none" };

		if (relation.type === "friend") {
			return {
				primaryText: "Друзі",
				secondaryText: "Видалити",
				primaryDisabled: true,
				onPrimaryPress: undefined,
				onSecondaryPress: () => askConfirmation(() => removeFriend(relation.friendshipId)),
			};
		}

		if (relation.type === "incoming") {
			return {
				primaryText: "Підтвердити",
				secondaryText: "Відхилити",
				primaryDisabled: false,
				onPrimaryPress: () => acceptRequest(relation.requestId),
				onSecondaryPress: () => askConfirmation(() => rejectRequest(relation.requestId)),
			};
		}

		if (relation.type === "outgoing") {
			return {
				primaryText: "Очікує",
				secondaryText: "Скасувати",
				primaryDisabled: true,
				onPrimaryPress: undefined,
				onSecondaryPress: () => askConfirmation(() => rejectRequest(relation.requestId)),
			};
		}

		return {
			primaryText: "Додати",
			secondaryText: undefined,
			primaryDisabled: false,
			onPrimaryPress: () => addFriend(recommendedUserId),
			onSecondaryPress: undefined,
		};
	};

	const renderRequestCard = (request: IFriendRequest, type: "incoming" | "outgoing") => {
		const profile = type === "incoming" ? request.from_profile : request.to_profile;
		const cardUser = profileToCardUser(profile);

		return (
			<FriendCard
				key={`${type}-${request.id}`}
				{...cardUser}
				primaryText={type === "incoming" ? "Підтвердити" : "Очікує"}
				secondaryText={type === "incoming" ? "Відхилити" : "Скасувати"}
				disabled={isActionLoading}
				primaryDisabled={type === "outgoing"}
				onPrimaryPress={type === "incoming" ? () => acceptRequest(request.id) : undefined}
				onSecondaryPress={() => askConfirmation(() => rejectRequest(request.id))}
				onAvatarPress={() => navigateToProfile(cardUser)}
			/>
		);
	};

	const RequestsSection = () => {
		const requestCount = friendships.incomingRequests.length + friendships.outgoingRequests.length;

		return (
			<FriendSection
				title="Запити"
				emptyText="Нових запитів поки немає"
				count={requestCount}
			>
				{friendships.incomingRequests.map((request) => renderRequestCard(request, "incoming"))}
				{friendships.outgoingRequests.map((request) => renderRequestCard(request, "outgoing"))}
			</FriendSection>
		);
	};

	const RecommendationsSection = () => (
		<FriendSection
			title="Рекомендації"
			emptyText="Немає нових рекомендацій"
			count={recommendations.length}
		>
			{recommendations.map((recommendedUser) => {
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
						onPrimaryPress={actions.onPrimaryPress}
						onSecondaryPress={actions.onSecondaryPress}
						onAvatarPress={() => navigateToProfile(cardUser)}
					/>
				);
			})}
		</FriendSection>
	);

	const AllFriendsSection = () => (
		<FriendSection
			title="Всі друзі"
			emptyText="Список друзів порожній"
			count={friendships.friends.length}
		>
			{friendships.friends.map((friendship) => {
				const cardUser = profileToCardUser(
					getFriendProfile(friendship, currentUserId, currentProfileId),
				);

				return (
					<FriendCard
						key={`all-${friendship.id}`}
						{...cardUser}
						primaryText="Повідомлення"
						secondaryText="Видалити"
						disabled={isActionLoading}
						onSecondaryPress={() => askConfirmation(() => removeFriend(friendship.id))}
						onAvatarPress={() => navigateToProfile(cardUser)}
					/>
				);
			})}
		</FriendSection>
	);

	const radioTabsArray: IRadioTab[] = [
		{
			title: "Головна",
			content: (
				<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
					<RequestsSection />
					<RecommendationsSection />
					<AllFriendsSection />
				</ScrollView>
			),
		},
		{
			title: "Запити",
			content: (
				<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
					<RequestsSection />
				</ScrollView>
			),
		},
		{
			title: "Рекомендації",
			content: (
				<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
					<RecommendationsSection />
				</ScrollView>
			),
		},
		{
			title: "Всі друзі",
			content: (
				<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
					<AllFriendsSection />
				</ScrollView>
			),
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
					<RadioTabs radioTabsArray={radioTabsArray} />
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
