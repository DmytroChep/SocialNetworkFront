import type { IUser } from "../../../shared/context/types";

export interface IFriendshipProfile {
	id: number;
	user_id: number;
	birth_date?: string | null;
	signature?: string | null;
	avatar?: string | null;
	pseudonym?: string | null;
	is_image_signature?: boolean;
	is_text_signature?: boolean;
	user: Pick<IUser, "id" | "email" | "username" | "first_name" | "last_name">;
}

export interface IProfileFriend {
	id: number;
	from_profile_id: number;
	to_profile_id: number;
	from_profile: IFriendshipProfile;
	to_profile: IFriendshipProfile;
}

export interface IFriendRequest {
	id: number;
	from_profile_id: number;
	to_profile_id: number;
	created_at: string;
	status?: FriendRequestStatus;
	from_profile: IFriendshipProfile;
	to_profile: IFriendshipProfile;
}

export interface IUserFriendships {
	friends: IProfileFriend[];
	incomingRequests: IFriendRequest[];
	outgoingRequests: IFriendRequest[];
	blacklistedRequests?: IFriendRequest[];
}

export type FriendRequestStatus =
	| "accepted"
	| "rejected"
	| "pending"
	| "blacklisted";

export interface ICreateFriendRequestPayload {
	senderId: number;
	receiverId: number;
	status?: FriendRequestStatus;
}

export interface IUpdateFriendRequestPayload {
	requestId: number;
	status: FriendRequestStatus;
}
