import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { styles } from "./radioTab.module";
import type { IProps } from "./radioTab.types";

export function RadioTabs(props: IProps) {
	const { radioTabsArray, activeTab, onTabChange, fullHeight, variant } = props;
	const [localTab, setLocalTab] = useState<string>(radioTabsArray[0].title);
	const choosedTab = activeTab ?? localTab;
	const isFriendsVariant = variant === "friends";
	const setChoosedTab = (title: string) => {
		setLocalTab(title);
		onTabChange?.(title);
	};

	return (
		<View style={[styles.radioTabs, fullHeight && styles.fullHeight]}>
			<View style={[styles.tabs, isFriendsVariant && styles.friendsTabs]}>
				{radioTabsArray.map((element) => {
					const isActive = choosedTab === element.title;

					return (
						<Pressable
							key={element.title}
							style={isFriendsVariant && styles.friendsTabButton}
							onPress={() => setChoosedTab(element.title)}
						>
							<Text
								style={[
									isActive ? styles.choosedTab : styles.tab,
									isFriendsVariant && styles.friendsTab,
									isFriendsVariant && isActive && styles.friendsChoosedTab,
								]}
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
						style={[
							choosedTab === element.title ? styles.visible : styles.hidden,
							fullHeight && styles.fullHeight,
						]}
					>
						{element.content}
					</View>
				);
			})}
		</View>
	);
}
