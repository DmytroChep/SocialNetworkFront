import type { ReactNode } from "react";

export interface IRadioTab {
	title: string;
	content: ReactNode;
}
export interface IProps {
	radioTabsArray: IRadioTab[];
	activeTab?: string;
	onTabChange?: (title: string) => void;
	fullHeight?: boolean;
	variant?: "default" | "friends";
}
