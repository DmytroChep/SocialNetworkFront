import { IUser } from "../../../shared/context/types";
import { IChatUser } from "../../../shared/context/types/User.type";
import { IMessage } from "../../message/types/message";

export interface IChat{
    name: string,
    is_group: boolean,
    avatar: string,
    users: IChatUser[]
    message: IMessage[]
}