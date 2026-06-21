import { useCallback, useMemo, useState } from "react";
import {
	FlatList,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { useGetUserFriendshipsQuery } from "../../shared/api/baseApi";
import { useUserContext } from "../../shared/context/user-context";
import { FONTS } from "../../shared/constants/fonts";
import { ICONS } from "../../shared/icons";
import { DEFAULT_AVATAR_URL, toMediaUrl, getUserAvatar } from "../../shared/lib/model-helpers";
import type {
	IFriendshipProfile,
	IProfileFriend,
} from "../friends/types/Friendship.type";
import { styles } from "./contactList.styles"; // Імпорт винесених стилей

const CONTACTS_PAGE_SIZE = 15;

export interface ContactType {
	id: number;
	name: string;
	avatar: string;
}

interface ContactsListProps {
	contacts?: ContactType[];
	onContactPress?: (contact: ContactType) => void;
}

const getProfileUserId = (profile?: IFriendshipProfile) =>
	profile?.user?.id ?? profile?.user_id;

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

const profileToContact = (profile: IFriendshipProfile): ContactType => {
	const fullName = [profile.user?.first_name, profile.user?.last_name]
		.filter(Boolean)
		.join(" ")
		.trim();

	const resolvedAvatar = toMediaUrl(profile.avatar, 'avatar', profile.user?.id ?? profile.user_id) ||
		// fallback to nested user avatar if profile-level avatar missing
		(profile.user ? getUserAvatar(profile.user) : undefined) || DEFAULT_AVATAR_URL;
	const contactId = getProfileUserId(profile) ?? profile.id;
	if (contactId === 4) {
		try {
			console.debug('[ContactsList] profile id=4, profile.avatar=', profile.avatar, 'resolvedAvatar=', resolvedAvatar, 'profile.user=', profile.user);
		} catch (e) {}
	}
	return {
		id: contactId,
		name:
			profile.pseudonym || fullName || profile.user?.username || "Користувач",
		avatar: resolvedAvatar,
	};
};

export function ContactsList({ contacts, onContactPress }: ContactsListProps) {
	const { user } = useUserContext();
	const [currentPage, setCurrentPage] = useState(1);
	const { data: friendships, error: friendshipsError } = useGetUserFriendshipsQuery(user?.id as number, {
		skip: !user?.id || Boolean(contacts),
	});

	if (typeof friendshipsError !== 'undefined') {
		try {
			console.log('DEBUG ContactsList friendshipsError:', friendshipsError);
		} catch (e) {}
	}
	const [searchQuery, setSearchQuery] = useState<string>("");

	const friends = useMemo<ContactType[]>(() => {
		if (contacts) return contacts;
		if (!friendships?.friends || !user) return [];

		return friendships.friends.map((friendship) => {
			const friendProfile = getFriendProfile(
				friendship,
				user.id,
				user.profile?.id,
			);

			return profileToContact(friendProfile);
		});
	}, [contacts, friendships?.friends, user]);

	const filteredContacts = useMemo(
		() =>
			friends.filter((contact: ContactType) =>
				contact.name.toLowerCase().includes(searchQuery.toLowerCase()),
			),
		[friends, searchQuery],
	);

	const paginatedContacts = useMemo(() => {
		const start = (currentPage - 1) * CONTACTS_PAGE_SIZE;
		const end = start + CONTACTS_PAGE_SIZE;
		return filteredContacts.slice(start, end);
	}, [filteredContacts, currentPage]);

	const hasMoreContacts = useMemo(
		() => filteredContacts.length > currentPage * CONTACTS_PAGE_SIZE,
		[filteredContacts.length, currentPage],
	);

	const handleSearchChange = useCallback((text: string) => {
		setSearchQuery(text);
		setCurrentPage(1);
	}, []);

	const handleContactPress = useCallback(
		(contact: ContactType) => {
			onContactPress?.(contact);
		},
		[onContactPress],
	);

	const handleLoadMore = useCallback(() => {
		setCurrentPage((prev) => prev + 1);
	}, []);

	const renderContactItem = useCallback(
		({ item: contact }: { item: ContactType }) => (
			<TouchableOpacity
				key={contact.id}
				style={styles.contactItem}
				onPress={() => handleContactPress(contact)}
			>
				<Image
					source={{ uri: contact.avatar }}
					style={styles.avatar}
				/>
				<Text style={styles.contactName}>{contact.name}</Text>
			</TouchableOpacity>
		),
		[handleContactPress],
	);

	return (
		<View style={styles.cardContainer}>
			<View style={styles.cardHeader}>
				<ICONS.people />
				<Text style={styles.cardTitle}>Контакти</Text>
			</View>

			<View style={styles.searchWrapper}>
				<ICONS.search
				
					style={styles.searchIcon}
				/>
				<TextInput
					style={styles.searchInput}
					placeholder="Пошук"
					placeholderTextColor="#8E8E93"
					value={searchQuery}
					onChangeText={handleSearchChange}
					autoCapitalize="none"
				/>
			</View>

			<FlatList
				data={paginatedContacts}
				keyExtractor={(item) => item.id.toString()}
				renderItem={renderContactItem}
				ListEmptyComponent={
					<Text style={styles.noResultsText}>Нікого не знайдено</Text>
				}
				ListFooterComponent={
					hasMoreContacts ? (
						<TouchableOpacity
							style={contactsStyles.loadMoreButton}
							onPress={handleLoadMore}
						>
							<Text style={contactsStyles.loadMoreText}>Завантажити ще</Text>
						</TouchableOpacity>
					) : null
				}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.scrollPadding}
				removeClippedSubviews={true}
				maxToRenderPerBatch={10}
				updateCellsBatchingPeriod={50}
			/>
		</View>
	);
}

const contactsStyles = StyleSheet.create({
	loadMoreButton: {
		paddingVertical: 12,
		paddingHorizontal: 16,
		marginVertical: 12,
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
	avatar: {
		width: 50,  // Обязательно
		height: 50, // Обязательно
		borderRadius: 25, // По желанию (для круглых аватарок)
	},
});
