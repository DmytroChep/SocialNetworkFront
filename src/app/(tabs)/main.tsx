import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FirstEnterModal } from "../../shared/ui/first-enter-modal/firstEnterModal";

export default function Main() {
	return (
		<SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
			<View style={{ flex: 1 }}>
				<Text>Main</Text>
				<FirstEnterModal></FirstEnterModal>
			</View>
		</SafeAreaView>
	);
}
