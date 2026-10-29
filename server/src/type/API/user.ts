import { userStatus } from "../../utils/enum/enum";

export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  countryCode: string;
  dob: string;
  role: string
}

export type VerifyRequest = {
  otp: string;
  userId: string;
}

export type LoginRequest = {
  email: string;
  password: string;
}

export type GetUserRequest = {
  userId: string;
}

