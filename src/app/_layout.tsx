import { SafeAreaProvider } from "react-native-safe-area-context";
import { Header } from "../shared/ui/Header";
import React from "react";
import { Stack } from "expo-router";
import { ApiProvider } from "@reduxjs/toolkit/query/react";
import { baseApi } from "../shared/api/baseApi";
import { UserContextProvider } from "../shared/context/user-context";
import { SocketContextProvider } from "../shared/context/socket-context";
export default function RootLayout() {
return (
<SafeAreaProvider>
<ApiProvider api={baseApi}>
<UserContextProvider>
<SocketContextProvider>
<Stack
screenOptions={{
headerShown: true,
contentStyle: {backgroundColor: "white"}
                    }}
> 
<Stack.Screen name="index"/>
<Stack.Screen name="(tabs)" options={{headerShown: false}}/>
<Stack.Screen name="registration" options={{header: () => {return <Header hiddenButtons={{settings: false, plus: false, exit: false}}/>}}}/>
<Stack.Screen name="login" options={{header: () => {return <Header hiddenButtons={{settings: false, plus: false, exit: false}}/>}}}/>
</Stack>
</SocketContextProvider>
</UserContextProvider>
</ApiProvider>
</SafeAreaProvider>
    );
}
