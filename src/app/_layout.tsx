// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Header } from "../shared/ui/Header";


export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        header: () => <Header />,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.label,
        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "#888",
      }}
    >
      <Tabs.Screen
        name="main"
        options={{
          tabBarLabel: "Головна",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-publications"
        options={{
          tabBarLabel: "Мої публікації",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? "image" : "image-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          tabBarLabel: "Друзі",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? "people" : "people-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          tabBarLabel: "Чати",
          tabBarIcon: ({ focused, color }) => (
            <View>
              <Ionicons
                name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"}
                size={24}
                color={color}
              />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>2</Text>
              </View>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    height: 60,
    paddingBottom: 8,
    paddingTop: 4,
  },
  label: {
    fontSize: 11,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: "red",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
});