import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IAuthUser, IUser } from "../context/types";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "http://10.0.2.2:8000/" }),
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
    me: builder.query<IUser, string>({  
      query: () => ({
        url: "user/me",
        headers: { Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImRtaXRAZ21haWwuY29tIiwiaWF0IjoxNzc1NDk4MzkzLCJleHAiOjE3NzYxMDMxOTN9.-tC96AdbbI_7E-Zgpa5GewxyjGNmmfaIu6GjMGxuSlc` },
      }),
    }),
  }),
});

export const { useLoginMutation, useRegistrationMutation, useMeQuery } = baseApi;