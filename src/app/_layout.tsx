import { TabList, Tabs, TabSlot, TabTrigger } from "expo-router/ui";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Header } from "../shared/ui/Header";
import React from "react";
import { View } from "react-native";
import { styles } from "../shared/ui/Header/header.module";
import { Stack } from "expo-router";

export default function RootLayout() {
	return (
		<SafeAreaProvider>
			<Stack
				screenOptions={{
					headerShown: true,
					contentStyle: {backgroundColor: "white"}
				}}
			>
				<Stack.Screen name="index"/>
				
				<Stack.Screen name="(tabs)" options={{headerShown: false}}/>
			</Stack>
		</SafeAreaProvider>
	);
}
