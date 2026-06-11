import { useMemo, useState } from "react";
import {
	Image,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { useGetUserFriendshipsQuery } from "../../shared/api/baseApi";
import { useUserContext } from "../../shared/context/user-context";
import { ICONS } from "../../shared/icons";
import { DEFAULT_AVATAR_URL, toMediaUrl } from "../../shared/lib/model-helpers";
import type {
	IFriendshipProfile,
	IProfileFriend,
} from "../friends/types/Friendship.type";
import { styles } from "./contactList.styles"; // Імпорт винесених стилей

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

	return {
		id: getProfileUserId(profile) ?? profile.id,
		name:
			profile.pseudonym || fullName || profile.user?.username || "Користувач",
		avatar: toMediaUrl(profile.avatar) || DEFAULT_AVATAR_URL,
	};
};

export function ContactsList({ contacts, onContactPress }: ContactsListProps) {
	const { user } = useUserContext();
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

	const filteredContacts = friends.filter((contact: ContactType) =>
		contact.name.toLowerCase().includes(searchQuery.toLowerCase()),
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
					onChangeText={setSearchQuery}
					autoCapitalize="none"
				/>
			</View>

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.scrollPadding}
			>
				{filteredContacts.length === 0 ? (
					<Text style={styles.noResultsText}>Нікого не знайдено</Text>
				) : (
					filteredContacts.map((contact) => (
						<TouchableOpacity
							key={contact.id}
							style={styles.contactItem}
							onPress={() => onContactPress?.(contact)}
						>
							<Image
								source={{ uri: toMediaUrl(contact.avatar) || contact.avatar }}
								style={styles.avatar}
							/>
							<Text style={styles.contactName}>{contact.name}</Text>
						</TouchableOpacity>
					))
				)}
			</ScrollView>
		</View>
	);
}
