import type { IUser } from "../../../shared/context/types";

export interface ITag {
    id: number;
    name: string;
}

export interface IPostTag {
    id?: number;
    post_id: number;
    tag_id: number;
    tag: ITag;
}

export interface IPostImage {
    id: number;
    original_image: string;
    compressed_image?: string | null;
    post_id: number;
    url?: string;
}

export interface IPostLink {
    id: number;
    url: string;
    post_id: number;
}

export interface IPostReaction {
    id: number;
    user_id: number;
    post_id: number;
}

export interface IPost {
    id: number;

    title: string;
    topic?: string | null;
    content: string;
    created_at?: string;
    updated_at?: string;

    author_id: number;
    author: IUser;

    tags?: IPostTag[];
    images?: IPostImage[];
    links?: IPostLink[];

    likes?: IPostReaction[];
    hearts?: IPostReaction[];
    views?: IPostReaction[] | number;

    authorId?: number;
    description?: string | null;
    link?: string | null;
    hashtags?: Array<{ hashtagId: number; hashtag: { title: string } }>;

    heartCount?: number;
    thumbsUpCount?: number;
    isHeartLiked?: boolean;
    isThumbsUpLiked?: boolean;
}

export interface IPostsPaginationParams {
    limit?: number;
    cursor?: number;
}

export interface IPaginatedPostsResponse {
    items: IPost[];
    nextCursor: number | null;
    hasMore: boolean;
}

export interface IPostCreation {
    title: string;
    content: string;

    author_id: number;

    topic?: string | null;

    tags?: string[];
    hashtags?: string[];
    links?: string[];
    images?: Array<{ original_image: string }>;
}
