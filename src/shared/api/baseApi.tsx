import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IAuthUser, IUser, IContact } from "../context/types";
import { IPartialUser } from "../context/types/partial-user.type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IAlbum, IAlbumImage, ITag } from "../context/types/User.type";
import { ip } from "../../config/ip";
import { IPostCreation, IPost } from "../../modules/my-publications/types/Post.type";


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
  tagTypes: ['Posts'],
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
    }),
    update: builder.mutation<IPartialUser | string, { userId: number; body: IPartialUser }>({
      query: ({ userId, body }) => ({
        url: `user/${userId}`,
        method: "PATCH",
        body,
      }),
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
    updateAvatar: builder.mutation<{userId: number, image: string, id: number}, {userId: number, image: string}>({
      query: ({ userId, image }) => ({
        url: `update-avatar`,
        method: "POST",
        body: {userId, image},
      }),
    }),
    getContacts: builder.query<IContact[], void>({
      query: () => ({
        url: "user/contacts",
      }),
    }),
    createAlbum: builder.mutation<IAlbum, IAlbum>({
      query: (body) => ({
        url: "album",
        method: "POST",
        body,
      }),
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
    }),
    deleteAlbum: builder.mutation<void, number>({
      query: (id) => ({
        url: `album/${id}`,
        method: "DELETE",
      }),
    }),
    getAllHashtags: builder.query<ITag[], void>({
      query: () => ({
        url: "hashtags",
      }),
    }),
    addAlbumImages: builder.mutation<IAlbum, { albumId: number;name: string,userId: number, images: {image:string}[] }>({
      query: ({ albumId, images, userId, name }) => ({
        url: `album/${albumId}/images`,
        method: "POST",
        body: { images, name, userId },
      }),
    }),
    deleteAlbumImage: builder.mutation<void, number>({
      query: (imageId) => ({
        url: `album/images/${imageId}`,
        method: "DELETE",
      }),
    }),
    replaceAlbumImages: builder.mutation<IAlbum, { albumId: number;name: string,userId: number, images: { image: string }[] }>({
      query: ({ albumId, images }) => ({
        url: `album/${albumId}/images`,
        method: "PATCH",
        body: { images},
      }),
    }),
    createPost: builder.mutation<IPost, IPostCreation>({
      query: (newPost) => ({
        url: `post`,
        method: "POST",
        body: newPost,
      }),
    }),
    getAllPosts: builder.query<IPost[], void>({
      query: () => ({
        url: "posts",
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
          method: 'PATCH',
          body: post
      }),
      invalidatesTags: ['Posts']
    }),

    deletePost: builder.mutation<void, number>({
        query: (id) => ({
            url: `post/${id}`,
            method: 'DELETE'
        }),
        invalidatesTags: ['Posts']
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
  useAddAlbumImagesMutation,
  useDeleteAlbumImageMutation,
  useReplaceAlbumImagesMutation,
  useCreatePostMutation,
  useGetAllPostsQuery,
  useGetUserPostsQuery,
  useThumbUpIncreaseMutation,
  useThumbUpDecreaseMutation,
  useHeartIncreaseMutation,
  useHeartDecreaseMutation,
  useViewsIncreaseMutation,
  useUpdatePostMutation,
  useDeletePostMutation
} = baseApi;