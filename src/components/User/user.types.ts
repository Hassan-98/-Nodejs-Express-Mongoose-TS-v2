import { Document } from 'mongoose';
import { Role } from '../Roles/role.types';

export type ProviderProfile = {
  username: string,
  email: string,
  imageUrl: string,
  id: number
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female'
}

export enum UserTypes {
  CUSTOMER = 'customer',
  MODERATOR = 'moderator',
  CUSTOMER_SUPPORT = 'customer-support',
  DELIVERY = 'delivery'
}

export enum Status {
  ACTIVE = 'active',
  BANNED = 'banned',
  INACTIVE = 'inactive'
}

export type ExternalProvider = {
  userId: string;
  linked: boolean
}

export interface User extends Document {
  username: string;
  email: string;
  email_confirmed: boolean;
  password: string;
  password_linked: boolean;
  phone: string;
  gender: Gender;
  picture: string;
  type: UserTypes;
  role: Role | undefined;
  accountStatus: Status;
  externalAuth: {
    google: ExternalProvider;
    facebook: ExternalProvider;
  };
  confirmation_code: {
    code: string;
    expiration: number;
  };
  reset_token: {
    token: string;
    expiration: number;
  };
  createdAt: string;
  updatedAt: string;
}