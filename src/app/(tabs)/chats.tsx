import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ICONS } from "../../shared/icons";
import { COLORS } from "../../shared/constants";
import { useState } from "react";
import { FONTS } from "../../shared/constants/fonts";
import { RadioTabs } from "../../shared/ui/RadioTab";

const styles = StyleSheet.create({
	choosedTab: {
		
	},
	visible: {
		display: "flex"
	},
	hidden: {
		display: "none"
	},
	radioTabs: { 
		gap: 6, 
		justifyContent: "center", 
		alignItems: "center",
		paddingVertical: 8
	},
	tabs: {
		width: "100%",
		paddingHorizontal: 16,
		justifyContent: "space-between",
		flexDirection: "row"
		},
	tab: {
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
	},
	choosedRadioTabs: {
		alignItems: "center",
		paddingVertical: 8,
		justifyContent: "center",
		gap: 6,
		borderTopColor: COLORS.darkBlue,
		borderTopWidth: 2
	}

})


export default function Chats() {
	const radioTabsArray = [
		{ title: "Контакти", icon: <ICONS.people />, content: <View><Text style={{fontFamily: FONTS["GTWalsheimPro-Medium"]}}>Контакти</Text></View> },
		{ title: "Повідмолення", icon: <ICONS.chat />, content: <View><Text style={{fontFamily: FONTS["GTWalsheimPro-Medium"]}}>Повідмолення</Text></View> },
		{ title: "Групові чати", icon: <ICONS.chat />, content: <View><Text style={{fontFamily: FONTS["GTWalsheimPro-Medium"]}}>Групові чати</Text></View> },
	];
	const [choosedTab, setChoosedTab] = useState<string>(radioTabsArray[0].title);
	

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: "white" }} edges={["left", "right"]}>
			<View style={{ flex: 1 }}>
				{/* <View
					style={}
				>
					<View
						style={styles.radioTabs}
					>
						<ICONS.people />
						<Text style={{fontSize: 15}}>Контакты</Text>
					</View>
					<View
						style={styles.radioTabs}
					>
						<ICONS.people />
						<Text style={{fontSize: 15}}>Контакты</Text>
					</View>
					<View
						style={styles.radioTabs}
					>
						<ICONS.people />
						<Text style={{fontSize: 15}}>Контакты</Text>
					</View>
				</View> */}

				<View style={styles.radioTabs}>
					<View style={styles.tabs}>
						{radioTabsArray.map((element) => {
							return (
								<Pressable 
									key={element.title}
									style={
											choosedTab === element.title ? styles.choosedRadioTabs : styles.radioTabs
										}
									onPress={() => setChoosedTab(element.title)}
								>
									{element.icon}
									<Text
									>
										{element.title}
									</Text>
								</Pressable>
							);
						})}
					</View>
		
					{radioTabsArray.map((element) => {
						return (
							<View
								key={element.title}
								style={
									choosedTab === element.title ? styles.visible : styles.hidden
								}
							>
								{element.content}
							</View>
						);
					})}
				</View>
			</View>
		</SafeAreaView>
	);
}
