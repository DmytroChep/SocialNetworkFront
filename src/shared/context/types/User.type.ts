export interface IContact {
    id: number,
    image: string,
    authorName?: string,
    userName?: string,
    email?: string
}
export interface IAlbumImage {
    id: number;
    image: string;
    albumId: number;
}

export interface IAlbum {
    id?: number;
    name: string;
    topic?: string;
    year?: string;
    userId: number;
    images?: IAlbumImage[];
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
    signatureImage?: string,
    currentAvatarId: string,
    password?: string,
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