import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Footer } from "../../shared/ui/Footer";

export default function Main() {
	return (
		<SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
			<View style={{ flex: 1 }}>
				<Text>Main</Text>
			</View>
		</SafeAreaView>
	);
}
