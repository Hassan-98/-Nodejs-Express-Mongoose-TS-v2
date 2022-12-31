import { Document } from 'mongoose';

export interface Permission {
  model: string;
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export interface Role extends Document {
  title: string;
  permissions: Permission[];
}

export enum RoleModels {
  User = "User",
  Books = "Books",
  Permissions = "Permissions",
  Logs = "Logs"
}