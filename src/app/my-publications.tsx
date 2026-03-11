import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Footer } from "../shared/ui/Footer";

export default function MyPubliactions() {
	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View style={{ flex: 1 }}></View>
			<Footer choosedTab="my-publications"/>
		</SafeAreaView>
	);
}
