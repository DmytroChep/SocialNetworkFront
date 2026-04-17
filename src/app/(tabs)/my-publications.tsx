import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyPubliactions() {
	return (
		<SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
			<View style={{ flex: 1 }}>
				<Text>My publications</Text>
			</View>
		</SafeAreaView>
	);
}
