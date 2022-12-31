//= Modules
import { z } from 'zod';
//= Utils
import checkObjectId from '../../utils/checkObjectId';
//= Middlewares
import { HttpError } from '../../middlewares/error.handler.middleware';
//= Types
import { RequestHandler } from '../../types/request.type';

export const UserSchema = z.object({
  username: z.string().trim(),
  email: z.string().trim().email({ message: "Email Address is invalid" }),
  email_confirmed: z.boolean().optional(),
  password: z.string().min(6, { message: "Password must be 6 or more characters long" }),
  password_linked: z.boolean().optional(),
  phone: z.string().min(11).max(13).optional(),
  gender: z.enum(["male", "female"]).optional(),
  picture: z.string().url().optional(),
  role: z.string().refine((val) => checkObjectId(val), { message: "must be a valid id" }).optional(),
  accountStatus: z.enum(['active', 'banned', 'inactive']).optional(),
  externalAuth: z.object({
    google: z.object({
      userId: z.union([z.string(), z.number()]),
      linked: z.boolean()
    }),
    facebook: z.object({
      userId: z.union([z.string(), z.number()]),
      linked: z.boolean(),
    })
  }).optional(),
  reset_token: z.object({
    token: z.string(),
    expiration: z.date(),
  }).optional(),
  confirmation_code: z.object({
    code: z.string().length(4),
    expiration: z.date(),
  }).optional()
});

export const LoginSchema = UserSchema.pick({ email: true, password: true });

export const ProviderLoginSchema = z.object({
  externalToken: z.string(),
  externalType: z.enum(["google", "facebook"]),
  externalId: z.number(),
  rememberMe: z.boolean().optional()
});

export const IDSchema = z.object({
  id: z.string().refine((val) => checkObjectId(val), { message: "must be a valid id" })
});

export type ProviderLoginParams = z.infer<typeof ProviderLoginSchema>

export const validateAuthorizedUser: RequestHandler = (req, res, next): void => {
  if (!req.user || req.body.userId !== req.user._id) throw HttpError(401, 'Unauthorized user');
  next();
}

/*
NOTE: UserValidator is the main schema for validation, use UserValidator.pick({ prop: true }) to create a sub-schema for different validation for endpoints
*/