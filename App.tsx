import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { ICONS } from "./src/shared/icons";
import { SettingsIcon } from "./src/shared/icons/settings";
import { Header } from "./src/shared/ui/Header/header";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function App() {
	return (
		<SafeAreaProvider>
			<SafeAreaView style={styles.container}>
				<Header />
				<View style={styles.main}>

				</View>
			</SafeAreaView>
		</SafeAreaProvider>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: "column",
	},
	main: {
		height: "100%",
		width: "100%",
		alignItems: "center",
	},
});
