import ROLE from './role.model';
import { RoleModels } from './role.types';

const DEFAULT_ROLES = [
  {
    title: "User",
    permissions: [
      {
        model: RoleModels.User,
        read: true,
        create: false,
        update: true,
        delete: false
      },
      {
        model: RoleModels.Books,
        read: true,
        create: false,
        update: false,
        delete: false
      },
      {
        model: RoleModels.Permissions,
        read: false,
        create: false,
        update: false,
        delete: false
      },
      {
        model: RoleModels.Logs,
        read: true,
        create: true,
        update: false,
        delete: false
      }
    ]
  },
  {
    title: "Moderator",
    permissions: [
      {
        model: RoleModels.User,
        read: true,
        create: true,
        update: true,
        delete: true
      },
      {
        model: RoleModels.Books,
        read: true,
        create: true,
        update: true,
        delete: true
      },
      {
        model: RoleModels.Permissions,
        read: false,
        create: false,
        update: false,
        delete: false
      },
      {
        model: RoleModels.Logs,
        read: true,
        create: true,
        update: false,
        delete: false
      }
    ]
  },
  {
    title: "Admin",
    permissions: [
      {
        model: RoleModels.User,
        read: true,
        create: true,
        update: true,
        delete: true
      },
      {
        model: RoleModels.Books,
        read: true,
        create: true,
        update: true,
        delete: true
      },
      {
        model: RoleModels.Permissions,
        read: true,
        create: true,
        update: false,
        delete: false
      },
      {
        model: RoleModels.Logs,
        read: true,
        create: true,
        update: false,
        delete: false
      }
    ]
  },
  {
    title: "SuperAdmin",
    permissions: [
      {
        model: RoleModels.User,
        read: true,
        create: true,
        update: true,
        delete: true
      },
      {
        model: RoleModels.Books,
        read: true,
        create: true,
        update: true,
        delete: true
      },
      {
        model: RoleModels.Permissions,
        read: true,
        create: true,
        update: true,
        delete: true
      },
      {
        model: RoleModels.Logs,
        read: true,
        create: true,
        update: true,
        delete: true
      }
    ]
  },
]

export default async function RoleInitiator() {
  let roles = await ROLE.find({}).lean();

  if (!roles.length) {
    roles = await ROLE.create(DEFAULT_ROLES);
  }
}