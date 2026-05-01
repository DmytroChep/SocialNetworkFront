export interface ICreatePost{
    title: string;
	description?: string | null;
	authorId: number;
	topic?: string | null;
	link?: string | null;
	hashtagIds?: number[];
}

export interface IPost {
    id: number;
    title: string;
    topic: string | null;
    description: string | null;
    link: string | null;
    heartLike: number;
    thumbsUpLike: number;
    views: number;
    authorId: number;
}