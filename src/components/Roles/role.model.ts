import mongoose from 'mongoose';
import validator from 'validator';
import { Role } from './role.types';
import UserModel from '../User/user.model';
import { HttpError } from '../../middlewares/error.handler.middleware';
import errorMessages from '../../utils/error-messages';

const RoleSchema = new mongoose.Schema({
  title: {
    type: String,
    validate(title: string) {
      if (validator.isEmpty(title)) throw HttpError(400, errorMessages.EMPTY('title'))
    }
  },
  permissions: [
    {
      model: String,
      read: Boolean,
      create: Boolean,
      update: Boolean,
      delete: Boolean,
      _id: false
    }
  ]
});

async function removeRoleFromUsers(role: Role) {
  await UserModel.updateMany({ role: role._id }, { $unset: { role: 1 } });
}
RoleSchema.post('findOneAndRemove', removeRoleFromUsers);
RoleSchema.post('findOneAndDelete', removeRoleFromUsers);
RoleSchema.post('deleteMany', removeRoleFromUsers);
RoleSchema.post('deleteOne', removeRoleFromUsers);


const Model = mongoose.model<Role>("Role", RoleSchema);

export type RoleModel = typeof Model;

export default Model;
