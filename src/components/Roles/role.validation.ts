//= Modules
import { z } from 'zod';
//= Utils
import checkObjectId from '../../utils/checkObjectId';
//= Types
import { RoleModels } from './role.types'

export const RoleSchema = z.object({
  title: z.string(),
  permissions: z.array(
    z.object({
      model: z.nativeEnum(RoleModels),
      read: z.boolean(),
      create: z.boolean(),
      update: z.boolean(),
      delete: z.boolean(),
    })
  ).min(1)
});


export const IDSchema = z.object({
  id: z.string().refine((val) => checkObjectId(val), { message: "must be a valid id" })
});