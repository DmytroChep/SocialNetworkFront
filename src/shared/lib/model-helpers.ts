import { ip } from "../../config/ip";
import type { IPost } from "../../modules/my-publications/types/Post.type";
import type { IAlbum, IUser } from "../context/types";

// const mediaBaseUrl = `http://${ip}:8000`;
// export const DEFAULT_AVATAR_URL = `${mediaBaseUrl}/media/avatars/default_avatar.png`;
// const signatureMediaPath = "/media/signatures";

// Build media base URL from `ip` config.
// `ip` can be either a host (e.g. "localhost" or "192.168.0.193")
// or a full URL (e.g. "https://....ngrok-free.dev").
const rawIp = ip || "localhost";
const mediaBaseUrl = rawIp.startsWith("http://") || rawIp.startsWith("https://")
	? rawIp.replace(/\/$/, "")
	: `http://${rawIp}:8000`;
export const BACKEND_MEDIA_BASE = mediaBaseUrl;
// Cloudinary base (optional) — fallback to backend media when not configured
// Try Expo public env var first, then generic one so frontend works without backend changes
const CLOUDINARY_NAME =
	process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || "";
export const CLOUDINARY_BASE = CLOUDINARY_NAME
	? `https://res.cloudinary.com/${CLOUDINARY_NAME}/image/upload`
	: "";
// Use backend-hosted default avatar (with extension) to avoid Cloudinary 404s
export const DEFAULT_AVATAR_URL = `${mediaBaseUrl}/media/avatars/default_avatar.png`;

// В model-helpers.ts або media-files.ts
export function toMediaUrl(value?: string | null, mediaType?: string, owner?: string | number): string | undefined {

	if (!value) return undefined;

	const inferTypeFromStack = (): string => {
		try {
			const stack = new Error().stack || "";
			const lines = stack.split("\n").map((s) => s.toLowerCase());
			// find first caller outside this file
			const caller = lines.find((l) => !l.includes("model-helpers") && l.includes("src/")) || "";
			if (caller.includes("signature")) return "signature";
			if (caller.includes("avatar") || caller.includes("profile") || caller.includes("friends") || caller.includes("contactslist") || caller.includes("avatar-field")) return "avatar";
			if (caller.includes("publication") || caller.includes("post") || caller.includes("my-publications") || caller.includes("publicationcard") || caller.includes("album")) return "post";
			if (caller.includes("message") || caller.includes("chat") || caller.includes("messageitem") || caller.includes("messages")) return "message";
			return "unknown";
		} catch (e) {
			return "unknown";
		}
	};

	let result: string | undefined;

	// Вже повний URL
	if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("file://") || value.startsWith("data:")) {
		result = value;
	}
	// Старий локальний формат: "1234567890-123456789.jpg"
	// Такі файли не існують ні локально ні в Cloudinary
	else if (/^\d{13}-\d+\.(jpg|jpeg|png|webp)$/i.test(value)) {
		result = undefined; // покажемо placeholder
	}
	// Старі локальні шляхи /media/...
	else if (value.startsWith("/media/")) {
		result = `${mediaBaseUrl}${value}`;
	}
	// Новий формат — Cloudinary public_id
	else if (CLOUDINARY_BASE) {
		result = `${CLOUDINARY_BASE}/${value}`;
	} else {
		result = `${mediaBaseUrl}/media/${value}`;
	}

	// Логируем вызов с использованием явного mediaType если он передан, иначе пытаемся угадать
	try {
		const inferred = mediaType || inferTypeFromStack();
		const ownerInfo = owner ? ` owner=${owner}` : "";
		console.debug(`[toMediaUrl] type=${inferred}${ownerInfo} value=${value} -> ${result}`);
	} catch (e) {
		// ignore logging errors
	}

	return result;
}
export function toSignatureMediaUrl(value?: string | null): string | undefined {
  if (!value) return undefined;

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("file://") ||
    value.startsWith("data:")
  ) {
		// лог подписи
		try {
			console.debug(`[toSignatureMediaUrl] type=signature value=${value} -> ${value}`);
		} catch (e) {}
		return value;
  }

  // Старі локальні підписи
  if (value.startsWith("/media/")) {
    const fileName = value.split("/").pop();
    return fileName ? `${mediaBaseUrl}/media/signatures/${fileName}` : undefined;
  }

	// Новий формат — Cloudinary public_id
	if (CLOUDINARY_BASE) {
		try {
			const res = `${CLOUDINARY_BASE}/${value}`;
			console.debug(`[toSignatureMediaUrl] type=signature value=${value} -> ${res}`);
		} catch (e) {}
		return `${CLOUDINARY_BASE}/${value}`;
	}
	// Якщо Cloudinary не налаштований — звертаємось до бекенду під `/media/signatures/...`
	try {
		const res = `${mediaBaseUrl}/media/signatures/${value}`;
		console.debug(`[toSignatureMediaUrl] type=signature value=${value} -> ${res}`);
	} catch (e) {}
	return `${mediaBaseUrl}/media/signatures/${value}`;
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
			'avatar',
			user?.id,
		) || DEFAULT_AVATAR_URL
	);
}

export function getUserSignature(user?: IUser | null): string | undefined {
	return toSignatureMediaUrl(
		user?.profile?.signature || user?.signatureImage || (user as any)?.sign,
	);
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
					'post',
					(post.author as any)?.id
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
