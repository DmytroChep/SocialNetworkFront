import { IUser } from "../../../shared/context/types";
import { IChatUser } from "../../../shared/context/types/User.type";

export interface IMessage{
    text: string,
    created_at: number,
    sender: IChatUser 
}