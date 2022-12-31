//= Models
import USER, { UserModel } from './user.model';
import RoleModel from './../Roles/role.model';
//= Utils
import queryBuilder, { QueryParams } from '../../utils/queryBuilder';
import errorMessages from '../../utils/error-messages';
//= Middlewares
import { HttpError } from '../../middlewares/error.handler.middleware';
//= Types
import { User } from './user.types';
import { Role } from '../Roles/role.types';

class UserService {
  public MODEL: UserModel = USER;

  public async getUsers(params?: QueryParams): Promise<User[]> {
    const { limit, skip } = params || {};
    const { filter, projection, population, sortition } = queryBuilder(params || {});

    let users: User[] = await this.MODEL.find(filter, projection, { ...population, ...sortition, ...(limit ? { limit } : {}), ...(skip ? { skip } : {}) }).lean();
    return users;
  }

  public async getUserById(id: string): Promise<User> {
    let user: User = await this.MODEL.findById(id).lean();
    return user;
  }

  public async getUserByEmail(email: string): Promise<User> {
    let user: User = await this.MODEL.findOne({ email }).lean();
    return user;
  }

  public async updateUserData(id: string, updates: Partial<User>, currentUser: User): Promise<User | null> {
    let user = await this.MODEL.findById(id);

    if (user) {
      let roles: Role[] = await RoleModel.find({ $or: [{ title: 'SuperAdmin' }, { title: 'Admin' }, { title: 'Moderator' }] }).lean();

      let superAdminRole = roles.find(role => role.title === 'SuperAdmin');
      let AdminRole = roles.find(role => role.title === 'Admin');
      let ModeratorRole = roles.find(role => role.title === 'Moderator');

      // if your are not super-admin and you are updating super-admin
      if (superAdminRole && (String(user.role) === String(superAdminRole._id) && String(user._id) !== String(currentUser._id))) {
        throw HttpError(401, errorMessages.SUPER_ADMIN_UPDATE)
      }
      // if your are not admin and you are updating another user
      if (AdminRole && (String(currentUser.role) !== String(AdminRole._id) && String(user._id) !== String(currentUser._id))) {
        throw HttpError(401, errorMessages.AUTHORIZATION_FAILED)
      }
      // if your are not moderator and you are updating another user
      if (ModeratorRole && (String(currentUser.role) !== String(ModeratorRole._id) && String(user._id) !== String(currentUser._id))) {
        throw HttpError(401, errorMessages.AUTHORIZATION_FAILED)
      }

      user = await this.MODEL.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).lean();
    }

    return user;
  }

  public async removeUser(id: string, currentUser: User): Promise<void> {
    let user = await this.MODEL.findById(id);

    if (user) {
      let roles: Role[] = await RoleModel.find({ $or: [{ title: 'SuperAdmin' }, { title: 'Admin' }, { title: 'Moderator' }] }).lean();

      let superAdminRole = roles.find(role => role.title === 'SuperAdmin');
      let AdminRole = roles.find(role => role.title === 'Admin');
      let ModeratorRole = roles.find(role => role.title === 'Moderator');

      // if your are not super-admin and you are deleting super-admin
      if (superAdminRole && (String(user.role) === String(superAdminRole._id) && String(user._id) !== String(currentUser._id))) {
        throw HttpError(401, errorMessages.SUPER_ADMIN_DELETE)
      }
      // if your are not admin and you are deleting another user
      if (AdminRole && (String(currentUser.role) !== String(AdminRole._id) && String(user._id) !== String(currentUser._id))) {
        throw HttpError(401, errorMessages.AUTHORIZATION_FAILED)
      }
      // if your are not modetator and you are deleting another user
      if (ModeratorRole && (String(currentUser.role) !== String(ModeratorRole._id) && String(user._id) !== String(currentUser._id))) {
        throw HttpError(401, errorMessages.AUTHORIZATION_FAILED)
      }

      await this.MODEL.findByIdAndRemove(id);
    }
  }
}

export default UserService;
