import { Tabs, usePathname } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ICONS } from "../../shared/icons";
import { Header } from "../../shared/ui/Header";
import { COLORS } from "../../shared/constants";

export const styles = StyleSheet.create({
  activeInner: {
    borderTopColor: COLORS.darkBlue,
    borderTopWidth: 2,
    alignItems: "center",
    paddingTop: 6,
    paddingHorizontal: 4,
  },
  inactiveInner: {
    alignItems: "center",
    paddingTop: 9,
    paddingHorizontal: 4,
  },
  footer: {
    height: 64,
  },
});

const TabButton = ({ route, children, ...props }: any) => {
  const pathname = usePathname();
  const isActive = pathname.includes(route);

  return (
    <Pressable
      {...props}
      style={{ flex: 1, alignItems: "center", justifyContent: "flex-start" }}
    >
      <View style={isActive ? styles.activeInner : styles.inactiveInner}>
        {children}
      </View>
    </Pressable>
  );
};
export default function TabsLayout() {
	return (
		<SafeAreaView
			edges={["bottom"]}
			style={{ flex: 1, backgroundColor: "white" }}
		>
			<Tabs
				screenOptions={{
					header: () => (
						<Header hiddenButtons={{ settings: true, exit: true }} />
					),
					tabBarStyle: styles.footer,
					tabBarLabelStyle: { color: COLORS.darkBlue, fontSize: 14 },
				}}
			>
				<Tabs.Screen
					name="main"
					options={{
						title: "Головна",
						header: () => (
							<Header
								hiddenButtons={{ plus: true, settings: true, exit: true }}
							/>
						),
						tabBarIcon: () => <ICONS.home />,
						tabBarButton: (props) => <TabButton {...props} route="main" />,
					}}
				/>
				<Tabs.Screen
					name="my-publications"
					options={{
						title: "Мої публікації",
						header: () => (
							<Header
								hiddenButtons={{ plus: true, settings: true, exit: true }}
							/>
						),
						tabBarIcon: () => <ICONS.image />,
						tabBarButton: (props) => (
							<TabButton {...props} route="my-publications" />
						),
					}}
				/>
				<Tabs.Screen
					name="friends"
					options={{
						title: "Друзі",
						tabBarIcon: () => <ICONS.people />,
						tabBarButton: (props) => <TabButton {...props} route="friends" />,
					}}
				/>
				<Tabs.Screen
					name="chats"
					options={{
						title: "Чати",
						header: () => (
							<Header
								hiddenButtons={{ plus: true, settings: false, exit: true }}
							/>
						),
						tabBarIcon: () => <ICONS.chat />,
						tabBarButton: (props) => <TabButton {...props} route="chats" />,
					}}
				/>
				<Tabs.Screen
					name="settings"
					options={{
						header: () => (
							<Header
								hiddenButtons={{ plus: true, settings: true, exit: true }}
							/>
						),
						tabBarItemStyle: { display: "none" },
					}}
				/>
			</Tabs>
		</SafeAreaView>
	);
}
