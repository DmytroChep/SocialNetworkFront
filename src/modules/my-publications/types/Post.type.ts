import { IUser } from "../../../shared/context/types";

export interface ITag {
    id: number;
    title: string;
}

export interface IPostHashtag {
    postId: number;
    hashtagId: number;
    hashtag: ITag;
}


export interface IPost {
  id: number;
  title: string;
  topic: string | null;
  description: string | null;
  link: string | null;

  views: number;

  authorId: number;
  author: IUser;

  hashtags: IPostHashtag[];
  images: { url: string }[];

  heartCount: number;
  thumbsUpCount: number;

  isHeartLiked: boolean;
  isThumbsUpLiked: boolean;
}


export interface IPostCreation{
    title: string;
	description?: string | null;
	authorId: number;
	topic?: string | null;
	link?: string | null;
	hashtagIds?: number[];
}