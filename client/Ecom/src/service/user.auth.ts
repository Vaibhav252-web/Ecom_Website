import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  countryCode: string;
  dob: string;
  role: string;
}

export interface VerifyOtpRequest {
  userId: string;
  otp: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GetUserRequest {
  userId: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface User {
  _id?: string;
  username: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface RegisterData {
  userId: string;
}

export interface LoginData {
  token: string;
}

export interface UnverifiedLoginData {
  userId: string;
}

export interface VerifyOtpData {
  token: string;
}

export interface GetUser {
  user: User;
}

// Interface for getAllUser response data
export interface GetAllUserData {
  user: object[];
}

export const authUserApi = createApi({
  reducerPath: "authApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4040/api/user",
    prepareHeaders: (headers) => {
  const token = localStorage.getItem("token");

  console.log("Token exists:", !!token);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
},
  }),

  endpoints: (builder) => ({
    // GetUser
    getUser: builder.query<ApiResponse<GetUser>, GetUserRequest>({
      query: (credential) => ({
        url: "/getUser",
        method: "POST",
        body: credential,
      }),
       keepUnusedDataFor: 300,
    }),

    // get All user
    getAllUser: builder.query<ApiResponse<GetAllUserData>, void>({
      query: () => ({
        url: "/getAllUser",
        method: "GET",
      }),
    }),

    // REGISTER
    register: builder.mutation<ApiResponse<RegisterData>, RegisterRequest>({
      query: (credentials) => ({
        url: "/register",
        method: "POST",
        body: credentials,
      }),
    }),

    // VERIFY OTP
    verifyOtp: builder.mutation<ApiResponse<VerifyOtpData>, VerifyOtpRequest>({
      query: (data) => ({
        url: "/verifyOTP",
        method: "POST",
        body: data,
      }),
    }),

    // LOGIN
    login: builder.mutation<
      ApiResponse<LoginData | UnverifiedLoginData>,
      LoginRequest
    >({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useVerifyOtpMutation,
  useLoginMutation,
  useGetUserQuery,
  useGetAllUserQuery,
} = authUserApi;
