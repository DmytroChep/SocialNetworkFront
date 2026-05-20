import { ip } from "../../config/ip";
import type { IPost } from "../../modules/my-publications/types/Post.type";
import type { IAlbum, IUser } from "../context/types";

const mediaBaseUrl = `http://${ip}:8000`;
export const DEFAULT_AVATAR_URL = `${mediaBaseUrl}/media/avatars/default_avatar.png`;

export function toMediaUrl(value?: string | null): string | undefined {
	if (!value) return undefined;
	if (
		value.startsWith("http://") ||
		value.startsWith("https://") ||
		value.startsWith("file://") ||
		value.startsWith("data:")
	) {
		return value;
	}

	return value.startsWith("/")
		? `${mediaBaseUrl}${value}`
		: `${mediaBaseUrl}/${value}`;
}

export function getUserHandle(user?: IUser | null): string {
	return user?.username || user?.userName || "";
}

export function getUserDisplayName(user?: IUser | null): string {
	if (!user) return "";

	const fullName = [user.first_name, user.last_name]
		.filter(Boolean)
		.join(" ")
		.trim();

	return (
		user.profile?.pseudonym ||
		user.authorName ||
		fullName ||
		getUserHandle(user) ||
		user.email
	);
}

export function getUserAvatar(user?: IUser | null): string | undefined {
	return (
		toMediaUrl(
			user?.profile?.avatar ||
				user?.currentAvatar?.image ||
				user?.avatar ||
				user?.image,
		) || DEFAULT_AVATAR_URL
	);
}

export function getUserSignature(user?: IUser | null): string | undefined {
	return toMediaUrl(user?.profile?.signature || user?.signatureImage);
}

export function getUserBirthDate(
	user?: IUser | null,
): string | Date | null | undefined {
	return user?.profile?.birth_date || user?.birthDate;
}

export function getUserAlbums(user?: IUser | null): IAlbum[] {
	return user?.profile?.albums || user?.albums || [];
}

export function getPostContent(post: IPost): string {
	return post.content || post.description || "";
}

export function getPostAuthorId(post: IPost): number {
	return post.author_id ?? post.authorId ?? post.author?.id;
}

export function getPostImages(post: IPost): Array<{ id: number; url: string }> {
	return (post.images || [])
		.map((image) => ({
			id: image.id,
			url:
				toMediaUrl(
					image.compressed_image || image.original_image || image.url,
				) || "",
		}))
		.filter((image) => image.url.length > 0);
}

export function getPostTags(post: IPost): string[] {
	if (post.tags?.length) {
		return post.tags.map((item) => item.tag?.name).filter(Boolean);
	}

	return (post.hashtags || [])
		.map((item) => item.hashtag?.title)
		.filter(Boolean);
}

export function getPostLinks(post: IPost): string[] {
	if (post.links?.length) {
		return post.links.map((link) => link.url).filter(Boolean);
	}

	return post.link ? [post.link] : [];
}

export function getPostHeartsCount(post: IPost): number {
	return post.heartCount ?? post.hearts?.length ?? 0;
}

export function getPostLikesCount(post: IPost): number {
	return post.thumbsUpCount ?? post.likes?.length ?? 0;
}

export function getPostViewsCount(post: IPost): number {
	if (Array.isArray(post.views)) return post.views.length;
	return post.views ?? 0;
}
