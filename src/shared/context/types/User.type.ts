export interface IUser {
    id: number,
    email: string,
    authorName: string,
    userName: string,
    status: string,
    birthDate: Date,
    sign: string,
    currentAvatarId: string,
    currentAvatar: {
        id: number,
        image: string,
        userId: number
    }
}