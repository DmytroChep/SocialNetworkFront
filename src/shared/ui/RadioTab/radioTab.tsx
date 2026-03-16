import { View, Image, Text, Pressable } from "react-native";
import { styles } from "./radioTab.module";
import { IMAGES } from "../../images";
import { RoundButton } from "../RoundButton";
import { ICONS } from "../../icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { IProps } from "./radioTab.types";
import { useRouter } from "expo-router";
import { usePathname } from "expo-router";
import { useState } from "react";

export function RadioTabs(props: IProps) {
	const { radioTabsArray } = props;
	const [choosedTab, setChoosedTab] = useState<string>(radioTabsArray[0].title);

	return (
		<View style={styles.radioTabs}>
			<View style={styles.tabs}>
				{radioTabsArray.map((element) => {
					return (
						<Pressable
							key={element.title}
							onPress={() => setChoosedTab(element.title)}
						>
							<Text
								style={
									choosedTab === element.title ? styles.choosedTab : styles.tab
								}
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
	);
}
