import { Ionicons } from "@expo/vector-icons"; // Заміни на свої кастомні іконки, якщо потрібно
import { useRouter } from "expo-router";
import { useState } from "react";
import {
	FlatList,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { styles } from "./group-chats-list.styles";
import { ICONS } from "../../shared/icons";

// Тимчасові дані для демонстрації (заміни на свої пропси/стейт)
const MOCK_CHATS = [
	{
		id: "1",
		name: "Design Team",
		lastMessage: "Привіт! Як справи?",
		time: "09:41",
		badge: 2,
	},
	{
		id: "2",
		name: "Product Managers",
		lastMessage: "Код готовий до рев'ю екранів",
		time: "Вчора",
		badge: 0,
	},
	{
		id: "3",
		name: "QA Engineers",
		lastMessage: "Знайшли баг на табах, фіксимо",
		time: "20 Трав",
		badge: 5,
	},
];

interface GroupChatsListProps {
	onChatPress?: (chat: (typeof MOCK_CHATS)[number]) => void;
}

export function GroupChatsList({ onChatPress }: GroupChatsListProps) {
	const router = useRouter();

	const [searchQuery, setSearchQuery] = useState("");

	// Логіка фільтрації списку чатів через пошуковий рядок
	const filteredChats = MOCK_CHATS.filter((chat) =>
		chat.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<View style={styles.cardContainer}>
			{/* ШАПКА БЛОКУ ГРУПОВИХ ЧАТІВ */}
			<View style={styles.cardHeader}>
				<View style={styles.iconWrapper}>
					<ICONS.people  color="#8E8E93" />
				</View>
				<Text style={styles.cardTitle}>Групові чати</Text>
			</View>

			{/* ПОЛЕ ПОШУКУ (Тепер біле за макетом) */}
			<View style={styles.searchWrapper}>
				<ICONS.search
					color="#8E8E93"
					style={styles.searchIcon}
				/>
				<TextInput
					style={styles.searchInput}
					placeholder="Пошук"
					placeholderTextColor="#8E8E93"
					value={searchQuery}
					onChangeText={setSearchQuery}
				/>
			</View>

			{/* СПИСОК ЧАТІВ */}
			<FlatList
				data={filteredChats}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => {
					return (
						<TouchableOpacity
							style={styles.chatItem}
							onPress={() => {
								if (onChatPress) {
									onChatPress(item);
									return;
								}

								router.push({
									pathname: "/(tabs)/chat/[id]",
									params: { id: item.id, name: item.name },
								});
							}}
						>
							{/* Аватарка чату */}
							<View style={styles.avatarCircle}>
								<Text style={styles.avatarText}>
									{item.name.substring(0, 2).toUpperCase()}
								</Text>
							</View>

							{/* Контентна частина (Назва, час, останнє повідомлення) */}
							<View style={styles.content}>
								<View style={styles.headerRow}>
									<Text style={styles.name}>{item.name}</Text>
									<Text style={styles.time}>{item.time}</Text>
								</View>
								<Text style={styles.lastMsg} numberOfLines={1}>
									{item.lastMessage}
								</Text>
							</View>
						</TouchableOpacity>
					);
				}}
				showsVerticalScrollIndicator={false}
			/>
		</View>
	);
}
