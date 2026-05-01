import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IAuthUser, IUser, IContact } from "../context/types";
import { IPartialUser } from "../context/types/partial-user.type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IAlbum, ITag } from "../context/types/User.type";


export const baseApi = createApi({
  reducerPath: "api",
    baseQuery: fetchBaseQuery({
        //baseUrl: "http://0.0.0.0:8000/",
        baseUrl: "http://192.168.1.74:8000/", 
        prepareHeaders: async (headers) => {
            const token = await AsyncStorage.getItem("token");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
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
} = baseApi;