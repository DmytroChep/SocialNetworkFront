import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Header } from "../shared/ui/Header";

export default function RootLayout() {
	return (
		<SafeAreaProvider>
			<Stack
				screenOptions={{
					header: () => {
                        return (<Header hiddenButtons={{plus: true, exit: true, settings: true}}/>)
                    },
                    
				}}
			>
				<Stack.Screen name="index" />
                <Stack.Screen name="main" />
				<Stack.Screen name="my-publications" />
				<Stack.Screen name="friends" />
				<Stack.Screen name="chats" />
			</Stack>
		</SafeAreaProvider>
	);
}
