import type { IUser } from "../../../shared/context/types";

export interface IChatMember {
	id: number;
	chat_id: number;
	user_id: number;
	user: IUser;
}

export interface IChatMessage {
	id: number;
	text: string;
	created_at: string;
	updated_at?: string;
	chat_id: number;
	sender_id: number;
	sender: IUser;
	images?: IChatMessageImage[];
}

export interface IChatMessageImage {
	id: number;
	image: string;
	message_id?: number;
}

export interface IChat {
	id: number;
	name?: string | null;
	is_group: boolean;
	avatar?: string | null;
	admin_id?: number | string | null;
	users: IChatMember[];
	messages?: IChatMessage[];
	lastMessage?: IChatMessage | null;
	unreadCount?: number;
}

export interface IChatsPaginationParams {
	take?: number;
	cursorId?: number;
}

export interface IPaginatedChatsResponse {
	chats: IChat[];
	hasMore: boolean;
	nextCursor: number | null;
}

export interface IChatMessagesPaginationParams {
	chatId: number;
	limit?: number;
	cursorId?: number;
}

export interface IPaginatedMessagesResponse {
	messages: IChatMessage[];
	hasMore: boolean;
	nextCursor: number | null;
}

export interface ICreatePersonalChatPayload {
	participantId: number;
}

export interface ICreateGroupChatPayload {
	name: string;
	userIds: number[];
	avatar?: string | null;
}

export interface IUpdateGroupChatPayload {
	chatId: number;
	name: string;
	userIds: number[];
	avatar?: string | null;
}

export interface IMarkChatAsReadResponse {
	readCount: number;
}
