export interface IContact {
    id: number,
    image: string,
    authorName?: string,
    userName?: string,
    email?: string
}
export interface IAlbum{
    id?: number;
    name: string;
    topic?: string;
    year?: string;
    userId: number;
    }

export interface ITag {
    id: number;
    title: "string"
}

export interface IUser {
    id: number,
    email: string,
    authorName: string,
    userName: string,
    status: string,
    birthDate: Date,
    sign: string,
    currentAvatarId: string,
    password?: string
    currentAvatar: {
        id: number,
        image: string,
        userId: number
    },
    avatars: {
        id: number,
        image: string,
        userId: number
    }[],
    contacts?: IContact[],
    albums: IAlbum[]
}