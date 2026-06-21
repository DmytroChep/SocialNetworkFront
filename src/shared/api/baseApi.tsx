import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IAuthUser, IUser, IContact } from "../context/types";
import { IPartialUser } from "../context/types/partial-user.type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IAlbum, IAlbumImage, ITag } from "../context/types/User.type";
import { ip } from "../../config/ip";
import { toMediaUrl, DEFAULT_AVATAR_URL } from "../lib/model-helpers";
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
  ICreateGroupChatPayload,
  ICreatePersonalChatPayload,
  IMarkChatAsReadResponse,
  IPaginatedChatsResponse,
  IPaginatedMessagesResponse,
  IUpdateGroupChatPayload,
} from "../../modules/chats/types/chat";


export const baseApi = createApi({
  reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl: `${ip}`,
        prepareHeaders: async (headers) => {
            const token = await AsyncStorage.getItem("token");
            headers.set("ngrok-skip-browser-warning", "true");
            try {
              console.log('DEBUG baseApi.prepareHeaders tokenPresent:', Boolean(token), 'tokenMask:', token ? `***${String(token).slice(-8)}` : null);
            } catch (e) {}
                if (token) {
                    headers.set("Authorization", `Bearer ${token}`);
                }
            return headers;
        },
    }),
  tagTypes: ['Posts', 'User', 'Friendship', 'Chats', 'Messages', 'Hashtags', 'UserStatus'],
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
    // baseApi.ts
    checkIsCodeExists: builder.query<boolean, {code: string, email: string}>({
        query: ({code, email}) => ({
            url: `user/isCodeExists?code=${code}&email=${email}`,
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
      transformResponse: (response: IUserFriendships) => {
        console.log('[API] getUserFriendships transformResponse', {
          friends: Array.isArray(response?.friends) ? response.friends.length : 0,
          incoming: Array.isArray(response?.incomingRequests) ? response.incomingRequests.length : 0,
          outgoing: Array.isArray(response?.outgoingRequests) ? response.outgoingRequests.length : 0,
        });
        const normalizeProfile = (p: any) => {
          if (!p) return p;
          const avatar = toMediaUrl(p.avatar, 'avatar', p.user?.id || p.id) || DEFAULT_AVATAR_URL;
          return { ...p, avatar };
        };

        const normalizeFriend = (f: any) => ({
          ...f,
          from_profile: normalizeProfile(f.from_profile),
          to_profile: normalizeProfile(f.to_profile),
        });

        return {
          friends: Array.isArray(response.friends) ? response.friends.map(normalizeFriend) : [],
          incomingRequests: Array.isArray(response.incomingRequests)
            ? response.incomingRequests.map((r: any) => ({ ...r, from_profile: normalizeProfile(r.from_profile), to_profile: normalizeProfile(r.to_profile) }))
            : [],
          outgoingRequests: Array.isArray(response.outgoingRequests)
            ? response.outgoingRequests.map((r: any) => ({ ...r, from_profile: normalizeProfile(r.from_profile), to_profile: normalizeProfile(r.to_profile) }))
            : [],
          blacklistedRequests: Array.isArray(response.blacklistedRequests)
            ? response.blacklistedRequests.map((r: any) => ({ ...r, from_profile: normalizeProfile(r.from_profile), to_profile: normalizeProfile(r.to_profile) }))
            : undefined,
        } as IUserFriendships;
      },
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

    createGroupChat: builder.mutation<IChat, ICreateGroupChatPayload>({
      query: (body) => ({
        url: 'group-chat/create',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Chats'],
    }),

    updateGroupChat: builder.mutation<IChat, IUpdateGroupChatPayload>({
      query: ({ chatId, ...body }) => ({
        url: `group-chat/${chatId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        'Chats',
        { type: 'Messages', id: arg.chatId },
      ],
    }),

    deleteGroupChat: builder.mutation<{ chatId: number; participantIds: Array<number | string> }, number>({
      query: (chatId) => ({
        url: `group-chat/${chatId}`,
        method: 'DELETE',
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
    transformResponse: (response: IPaginatedMessagesResponse) => {
      console.log('[API] getChatMessages transformResponse, messages:', Array.isArray(response?.messages) ? response.messages.length : 0);
      const sanitizeUrl = (value?: string | null, owner?: string | number) => {
        if (!value) return undefined;
        // Metro bundler dev asset URLs (unstable_path) — don't use them as media
        if (value.includes("unstable_path=")) return undefined;
        return toMediaUrl(value, 'message', owner);
      };

      const normalizeMessage = (m: any) => ({
        ...m,
        sender: m.sender
          ? { ...m.sender, avatar: toMediaUrl(m.sender.avatar, 'avatar', m.sender?.id) || DEFAULT_AVATAR_URL }
          : m.sender,
        images: Array.isArray(m.images)
          ? m.images
              .map((img: any) => ({ ...img, image: sanitizeUrl(img.image, m.sender?.id) }))
              .filter((img: any) => img.image)
          : [],
      });
      console.log('[MSG SENDER]', JSON.stringify(
        response.messages?.[0]?.sender ?? 'NO SENDER'
    ));

      return {
        messages: Array.isArray(response.messages) ? response.messages.map(normalizeMessage) : [],
        hasMore: response.hasMore,
        nextCursor: response.nextCursor,
      } as IPaginatedMessagesResponse;
    },
    providesTags: (_result, _error, arg) => [{ type: 'Messages', id: arg.chatId }],
    keepUnusedDataFor: 300, // ← 5 хвилин замість 60 секунд
}),

    markChatAsRead: builder.mutation<IMarkChatAsReadResponse, number>({
      query: (chatId) => ({
        url: `chats/${chatId}/read`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, arg) => [
        'Chats',
        { type: 'Messages' as const, id: arg },
      ],
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

    getUserStatus: builder.query<{ status: string }, number>({
      query: (userId) => `/user/${userId}/status`,
      providesTags: (result, error, userId) => [{ type: 'UserStatus', id: userId }],
    }),

    updateUserStatus: builder.mutation<void, { userId: number; status: string }>({
      query: ({ userId, status }) => ({
        url: `/user/${userId}/status`,
        method: 'PATCH',
        body: { status: status.toUpperCase() },
      }),
      invalidatesTags: (result, error, { userId }) => [{ type: 'UserStatus', id: userId }],
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
  useCreateGroupChatMutation,
  useUpdateGroupChatMutation,
  useDeleteGroupChatMutation,
  useGetChatMessagesQuery,
  useLazyGetChatMessagesQuery,
  useMarkChatAsReadMutation,
  useCreateFriendshipRequestMutation,
  useUpdateFriendshipStatusMutation,
  useDeleteFriendshipMutation,
  usePrefetch
  
} = baseApi;
