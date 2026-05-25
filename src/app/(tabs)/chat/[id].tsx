import { SafeAreaView } from "react-native-safe-area-context";
import Chat from "../../../modules/chats/chat/chat";

export default function ChatScreen() {
	return (
		<SafeAreaView
			style={{ flex: 1, backgroundColor: "white" }}
			edges={["left", "right"]}
		>
			<Chat />
		</SafeAreaView>
	);
}
