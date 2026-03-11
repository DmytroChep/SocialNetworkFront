import { View, Text, Pressable } from "react-native";
import { styles } from "./Footer.module";
import { ICONS } from "../../icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { IFooterProps } from "./Footer.types";
import { Link } from "expo-router";

export function Footer(props: IFooterProps) {
	const { choosedTab } = props;
	return (
		<View style={styles.footer}>
			<View style={styles.tabs}>
				<Link href="/main" asChild>
					<Pressable
						style={choosedTab === "main" ? styles.choosedTab : styles.tab}
					>
						<ICONS.home />
						<Text>Головна</Text>
					</Pressable>
				</Link>
				<Link href="/my-publications" asChild>
					<Pressable
						style={
							choosedTab === "my-publications" ? styles.choosedTab : styles.tab
						}
					>
						<ICONS.image />
						<Text>Мої публікації</Text>
					</Pressable>
				</Link>
				<Link href="/friends" asChild>
					<Pressable
						style={choosedTab === "friends" ? styles.choosedTab : styles.tab}
					>
						<ICONS.people />
						<Text>Друзі</Text>
					</Pressable>
				</Link>
				<Link href="/chats" asChild>
					<Pressable
						style={choosedTab === "chats" ? styles.choosedTab : styles.tab}
					>
						<ICONS.chat />
						<Text>Чати</Text>
					</Pressable>
				</Link>
			</View>
		</View>
	);
}
