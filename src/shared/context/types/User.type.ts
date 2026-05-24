import type { IPost } from "../../../modules/my-publications/types/Post.type";

export interface IContact {
	id: number;
	image?: string;
	avatar?: string;
	username?: string;
	first_name?: string;
	last_name?: string;
	email?: string;
}

export interface IAlbumImage {
	id: number;
	image: string;
	created_at?: string;
	is_shown?: boolean;
	album_id: number;
}

export interface IAlbum {
	id: number;
	name: string;
	theme?: string;
	year?: number;
	created_at?: string;
	is_shown?: boolean;
	is_default?: boolean;

	profile_id: number;

	images?: IAlbumImage[];
}

export interface ITag {
	id: number;
	name: string;
}
export interface IAvatar {
	id: number;
	image: string;
	user_id: number;
}

export interface IProfile {
	id: number;
	user_id: number;

	birth_date?: string | null;
	signature?: string | null;
	avatar?: string | null;
	pseudonym?: string | null;
	is_image_signature?: boolean;
	is_text_signature?: boolean;

	albums?: IAlbum[];
}

export interface IChatUser{
	id: number,
	name: string,
	avatar: string,
	
}

export interface IUser {
	id: number;
	password?: string;
	last_login?: string | null;
	is_superuser: boolean;
	username: string;
	first_name: string;
	last_name: string;
	email: string;
	is_staff: boolean;
	is_active: boolean;
	date_joined: string;

	profile?: IProfile | null;
	avatar?: string | null;
	image?: string | null;

	posts?: IPost[];

	/**
	 * Legacy fields are kept optional so screens do not explode while the API is
	 * being switched route-by-route to the Prisma/Django-shaped models.
	 */
	authorName?: string;
	userName?: string;
	birthDate?: string | Date | null;
	sign?: string | null;
	signatureImage?: string | null;
	currentAvatar?: IAvatar | null;
	avatars?: IAvatar[];
	albums?: IAlbum[];
}

export interface IUserUpdatePayload {
	username?: string;
	first_name?: string;
	last_name?: string;
	email?: string;
	password?: string;
	profile?: Partial<
		Pick<
			IProfile,
			| "birth_date"
			| "signature"
			| "pseudonym"
			| "is_image_signature"
			| "is_text_signature"
		>
	>;

	/**
	 * Direct profile fields are useful for backends that flatten PATCH /user/:id.
	 */
	birth_date?: string | null;
	avatar?: string;
	signature?: string | null;
	pseudonym?: string | null;
	is_image_signature?: boolean;
	is_text_signature?: boolean;
}
