import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ICONS } from "../../shared/icons";

export default function Chats() {
	return (
		<SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
			<View style={{ flex: 1 }}>
				<View
					style={{
						width: "100%",
						paddingHorizontal: 16,
						justifyContent: "space-between",
					}}
				>
					<View
						style={{ gap: 6, justifyContent: "center", alignItems: "center" }}
					>
						<ICONS.people />
						<Text style={{fontSize: 15}}>Контакты</Text>
					</View>
				</View>
			</View>
		</SafeAreaView>
	);
}
