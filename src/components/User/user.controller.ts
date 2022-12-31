//= Modules
import { Request, Response } from 'express';
//= Decorators
import { Controller, Get, Post, Patch, Delete, Use } from '../../decorators';
//= Service
import UserService from './user.service';
//= Middlewares
import { bodyValidator, paramsValidator } from '../../middlewares/validation.middleware';
import { RoleValidator } from '../Roles/role.middleware';
import { Authenticated } from '../Auth/auth.middleware';
//= Validations
import { UserSchema, IDSchema } from './user.validation';
//= Types
import { User } from './user.types';
import { RoleModels } from '../Roles/role.types';

type ExtendedRequest = Request & { user: User }

const Service = new UserService();

@Controller('/users')
class UserController {
  @Get('/')
  @Use(Authenticated)
  @Use(RoleValidator({ model: RoleModels.User, read: true }))
  public async getAllUsers(req: Request, res: Response) {
    let users = await Service.getUsers(req.query);

    res.status(200).json({ success: true, data: users });
  };

  @Get('/:id')
  @Use(Authenticated)
  @Use(RoleValidator({ model: RoleModels.User, read: true }))
  @Use(paramsValidator(IDSchema))
  public async getUserById(req: Request, res: Response) {
    let user = await Service.getUserById(req.params.id);

    res.status(200).json({ success: true, data: user });
  };

  @Patch('/:id')
  @Use(Authenticated)
  @Use(RoleValidator({ model: RoleModels.User, read: true, update: true }))
  @Use(paramsValidator(IDSchema))
  @Use(bodyValidator(UserSchema.partial()))
  public async updateUser(req: ExtendedRequest, res: Response) {
    let user = await Service.updateUserData(req.params.id, req.body, req.user);

    res.status(200).json({ success: true, data: user });
  };

  @Delete('/:id')
  @Use(Authenticated)
  @Use(RoleValidator({ model: RoleModels.User, del: true }))
  @Use(paramsValidator(IDSchema))
  public async removeUser(req: ExtendedRequest, res: Response) {
    await Service.removeUser(req.params.id, req.user);

    res.status(200).json({ success: true, data: { _id: req.params.id } });
  };
}

export default UserController;

