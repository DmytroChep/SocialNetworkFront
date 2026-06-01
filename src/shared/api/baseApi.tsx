import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IAuthUser, IUser, IContact } from "../context/types";
import { IPartialUser } from "../context/types/partial-user.type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IAlbum, IAlbumImage, ITag } from "../context/types/User.type";
import { ip } from "../../config/ip";
import {
  IPostCreation,
  IPost,
  IPaginatedPostsResponse,
  IPostsPaginationParams,
} from "../../modules/my-publications/types/Post.type";
import type {
  ICreateFriendRequestPayload,
  IProfileFriend,
  IUpdateFriendRequestPayload,
  IUserFriendships,
} from "../../modules/friends/types/Friendship.type";
import type {
  IChat,
  IChatMessagesPaginationParams,
  IChatsPaginationParams,
  ICreatePersonalChatPayload,
  IMarkChatAsReadResponse,
  IPaginatedChatsResponse,
  IPaginatedMessagesResponse,
} from "../../modules/chats/types/chat";


export const baseApi = createApi({
  reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl: `http://${ip}:8000/`,
        prepareHeaders: async (headers) => {
            const token = await AsyncStorage.getItem("token");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
  tagTypes: ['Posts', 'User', 'Friendship', 'Chats', 'Messages', 'Hashtags'],
  endpoints: (builder) => ({
    login: builder.mutation<string, IAuthUser>({
      query: (body) => ({
        url: "user/login",
        method: "POST",
        body,
      }),
    }),
    registration: builder.mutation<string, IAuthUser>({
      query: (body) => ({
        url: "user/registration",
        method: "POST",
        body,
      }),
    }),
    me: builder.query<IUser, void>({
      query: () => ({
        url: "user/me",
      }),
      providesTags: (result) =>
        result ? [{ type: 'User' as const, id: result.id }] : [{ type: 'User' as const, id: 'LIST' }],
    }),
    update: builder.mutation<IPartialUser | string, { userId: number; body: IPartialUser }>({
      query: ({ userId, body }) => ({
        url: `user/${userId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'User' as const, id: arg.userId }],
    }),
    sendCodeVerify: builder.query<string, {gmail: string}>({
      query: ({gmail}) => ({
        url: `user/sendCode?gmail=${gmail}`,
      }),
    }),
    checkIsCodeExists: builder.query<string, {code: number}>({
      query: ({code}) => ({
        url: `user/isCodeExists?code=${code}`,
      }),
    }),
    updateAvatar: builder.mutation<{user_id: number, image: string, id: number}, {userId: number, image: string}>({
      query: ({ userId, image }) => ({
        url: `update-avatar`,
        method: "POST",
        body: { userId, image },
      }),
      invalidatesTags: ['User'],
    }),
    getContacts: builder.query<IContact[], void>({
      query: () => ({
        url: "user/contacts",
      }),
    }),
    createAlbum: builder.mutation<IAlbum, Partial<IAlbum> & { name: string }>({
      query: (body) => ({
        url: "album",
        method: "POST",
        body,
      }),
      invalidatesTags: ['User'],
    }),
    getAlbumById: builder.query<IAlbum, number>({
      query: (id) => ({
        url: `album/${id}`,
      }),
    }),
    getAlbumsByUserId: builder.query<IAlbum[], number>({
      query: (userId) => ({
        url: `user/${userId}/albums`,
      }),
    }),
    updateAlbum: builder.mutation<IAlbum, { id: number; body: Partial<IAlbum> }>({
      query: ({ id, body }) => ({
        url: `album/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ['User'],
    }),
    deleteAlbum: builder.mutation<void, number>({
      query: (id) => ({
        url: `album/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['User'],
    }),
    getAllHashtags: builder.query<ITag[], void>({
      query: () => ({
        url: "hashtags",
      }),
      providesTags: ['Hashtags'],
    }),
    createHashtag: builder.mutation<ITag, { name: string }>({
      query: (body) => ({
        url: "hashtag",
        method: "POST",
        body,
      }),
      invalidatesTags: ['Hashtags'],
    }),
    addAlbumImages: builder.mutation<IAlbum, { albumId: number; name: string; userId: number; images: { image: string }[] }>({
      query: ({ albumId, images, userId, name }) => ({
        url: `album/${albumId}/images`,
        method: "POST",
        body: { images, name, user_id: userId },
      }),
      invalidatesTags: ['User'],
    }),
    deleteAlbumImage: builder.mutation<void, number>({
      query: (imageId) => ({
        url: `album/images/${imageId}`,
        method: "DELETE",
      }),
      invalidatesTags: ['User'],
    }),
    replaceAlbumImages: builder.mutation<IAlbum, { albumId: number; name: string; userId: number; images: { image: string }[] }>({
      query: ({ albumId, images }) => ({
        url: `album/${albumId}/images`,
        method: "PATCH",
        body: { images},
      }),
      invalidatesTags: ['User'],
    }),
    createPost: builder.mutation<IPost, IPostCreation>({
      query: (newPost) => ({
        url: `post`,
        method: "POST",
        body: newPost,
      }),
      invalidatesTags: ['Posts', 'Hashtags'],
    }),
    getAllPosts: builder.query<IPaginatedPostsResponse, IPostsPaginationParams | void>({
      query: (params) => ({
        url: "posts",
        params: {
          limit: params?.limit ?? 5,
          ...(params?.cursor ? { cursor: params.cursor } : {}),
        },
      }),
      providesTags: ['Posts'],
    }),
    getUserPosts: builder.query<IPost[], {userId: number}>({
      query: ({userId}: {userId: number}) => ({
        url: `user/${userId}/posts`,
      }),
      providesTags: ['Posts'],
    }),
    thumbUpIncrease: builder.mutation<string, {postId: number}>({
      query: ({postId}: {postId: number}) => ({
        url: `post/${postId}/thumbUp/increase`,
        method: "PATCH",
      })
    }),
    thumbUpDecrease: builder.mutation<string, {postId: number}>({
      query: ({postId}: {postId: number}) => ({
        url: `post/${postId}/thumbUp/decrease`,
        method: "PATCH",
      })
    }),
    heartIncrease: builder.mutation<string, {postId: number}>({
      query: ({postId}: {postId: number}) => ({
        url: `post/${postId}/heart/increase`,
        method: "PATCH",
      })
    }),
    heartDecrease: builder.mutation<string, {postId: number}>({
      query: ({postId}: {postId: number}) => ({
        url: `post/${postId}/heart/decrease`,
        method: "PATCH",
      })
    }),
    viewsIncrease: builder.mutation<string, {postId: number}>({
      query: ({postId}: {postId: number}) => ({
        url: `post/${postId}/increaseViews`,
        method: "PATCH",
      })
    }),

    updatePost: builder.mutation<IPost, { postId: number; post: Partial<IPostCreation> }>({
      query: ({ postId, post }) => ({
        url: `post/${postId}`,
        method: "PATCH",
        body: post,
      }),
      invalidatesTags: ['Posts', 'Hashtags'],
    }),

    replacePostImages: builder.mutation<IPost, { postId: number; images: Array<{ original_image: string }> }>({
      query: ({ postId, images }) => ({
        url: `post/${postId}/images`,
        method: "PATCH",
        body: { images },
      }),
    }),

    deletePost: builder.mutation<void, number>({
      query: (postId) => ({
        url: `post/${postId}`,
        method: "DELETE",
      }),
    }),

    getAllUsers: builder.query<IUser[], void>({
      query: () => '/users/all',
      providesTags: ['User'],
    }),

    getUserById: builder.query<IUser, number>({
      query: (userId) => `/user/${userId}`,
      providesTags: ['User'],
    }),

    getUserFriendships: builder.query<IUserFriendships, number>({
      query: (userId) => `/friendship/user/${userId}`,
      providesTags: ['Friendship'],
    }),

    getPersonalChats: builder.query<IPaginatedChatsResponse, IChatsPaginationParams | void>({
      query: (params) => ({
        url: 'chats',
        params: {
          take: params?.take ?? 30,
          ...(params?.cursorId ? { cursorId: params.cursorId } : {}),
        },
      }),
      providesTags: ['Chats'],
    }),

    createPersonalChat: builder.mutation<IChat, ICreatePersonalChatPayload>({
      query: (body) => ({
        url: 'chats',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Chats'],
    }),

    getChatMessages: builder.query<IPaginatedMessagesResponse, IChatMessagesPaginationParams>({
      query: ({ chatId, limit, cursorId }) => ({
        url: `chats/${chatId}/messages`,
        params: {
          limit: limit ?? 30,
          ...(cursorId ? { cursorId } : {}),
        },
      }),
      providesTags: (_result, _error, arg) => [{ type: 'Messages', id: arg.chatId }],
    }),

    markChatAsRead: builder.mutation<IMarkChatAsReadResponse, number>({
      query: (chatId) => ({
        url: `chats/${chatId}/read`,
        method: 'POST',
      }),
      invalidatesTags: ['Chats'],
    }),

    createFriendshipRequest: builder.mutation<unknown, ICreateFriendRequestPayload>({
      query: (body) => ({
        url: '/friendship/request',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Friendship'],
    }),

    updateFriendshipStatus: builder.mutation<unknown, IUpdateFriendRequestPayload>({
      query: (body) => ({
        url: '/friendship/status',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Friendship'],
    }),

    deleteFriendship: builder.mutation<string | IProfileFriend, number>({
      query: (id) => ({
        url: `/friendship/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Friendship'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegistrationMutation,
  useMeQuery,
  useUpdateMutation,
  useLazySendCodeVerifyQuery,
  useLazyCheckIsCodeExistsQuery,
  useUpdateAvatarMutation,
  useGetContactsQuery,
  useCreateAlbumMutation,
  useGetAlbumByIdQuery,
  useLazyGetAlbumsByUserIdQuery,
  useUpdateAlbumMutation,
  useDeleteAlbumMutation,
  useGetAllHashtagsQuery,
  useCreateHashtagMutation,
  useAddAlbumImagesMutation,
  useDeleteAlbumImageMutation,
  useReplaceAlbumImagesMutation,
  useCreatePostMutation,
  useGetAllPostsQuery,
  useLazyGetAllPostsQuery,
  useGetUserPostsQuery,
  useThumbUpIncreaseMutation,
  useThumbUpDecreaseMutation,
  useHeartIncreaseMutation,
  useHeartDecreaseMutation,
  useViewsIncreaseMutation,
  useUpdatePostMutation,
  useReplacePostImagesMutation,
  useDeletePostMutation,
  useGetAllUsersQuery, 
  useGetUserByIdQuery,
  useGetUserFriendshipsQuery, 
  useGetPersonalChatsQuery,
  useCreatePersonalChatMutation,
  useGetChatMessagesQuery,
  useLazyGetChatMessagesQuery,
  useMarkChatAsReadMutation,
  useCreateFriendshipRequestMutation,
  useUpdateFriendshipStatusMutation,
  useDeleteFriendshipMutation
} = baseApi;
