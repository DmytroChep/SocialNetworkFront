import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IAuthUser, IUser } from "../context/types";
import { IPartialUser } from "../context/types/partial-user.type";
import AsyncStorage from "@react-native-async-storage/async-storage";


export const baseApi = createApi({
  reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://10.0.2.2:8000/",
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
  }),
});

export const {
  useLoginMutation,
  useRegistrationMutation,
  useMeQuery,
  useUpdateMutation,
} = baseApi;