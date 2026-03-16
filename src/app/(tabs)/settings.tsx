import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RadioTabs } from "../../shared/ui/RadioTab";
import { IRadioTab } from "../../shared/ui/RadioTab/radioTab.types";

export default function Settings() {
	const radioTabsArray: IRadioTab[] = [
		{
			title: "Особиста інформація",
			content: (
				<View>
					<Text>personal info</Text>
				</View>
			),
		},
		{
			title: "Альбоми",
			content: (
				<View>
					<Text>Albums</Text>
				</View>
			),
		},
	];
	return (
		<SafeAreaView style={{ flex: 1, padding: 0 }} edges={["left", "right"]}>
			<RadioTabs radioTabsArray={radioTabsArray} />
		</SafeAreaView>
	);
}
