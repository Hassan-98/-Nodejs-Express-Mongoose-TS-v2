//= Modules
import { Request, Response } from 'express';
//= Decorators
import { Controller, Get, Post, Patch, Delete, Use } from '../../decorators';
//= Service
import RolesService from './role.service';
//= Middlewares
import { bodyValidator, paramsValidator } from '../../middlewares/validation.middleware';
import { RoleValidator } from './role.middleware';
import { Authenticated } from '../Auth/auth.middleware';
//= Validations
import { RoleSchema, IDSchema } from './role.validation';
//= Types
import { RoleModels } from './role.types';

const Service = new RolesService();

@Controller('/roles')
class RoleController {
  @Get('/')
  @Use(Authenticated)
  @Use(RoleValidator({ model: RoleModels.Permissions, read: true }))
  public async getAllRoles(req: Request, res: Response) {
    let roles = await Service.getAllRoles();

    res.status(200).json({ success: true, data: roles });
  };


  @Get('/:id')
  @Use(Authenticated)
  @Use(RoleValidator({ model: RoleModels.Permissions, read: true }))
  @Use(paramsValidator(IDSchema))
  public async getRoleById(req: Request, res: Response) {
    let roles = await Service.getRoleById(req.params.id);

    res.status(200).json({ success: true, data: roles });
  };

  @Post('/')
  @Use(Authenticated)
  @Use(RoleValidator({ model: RoleModels.Permissions, read: true, create: true }))
  @Use(bodyValidator(RoleSchema))
  public async addNewRole(req: Request, res: Response) {
    let role = await Service.addNewRole(req.body);

    res.status(201).json({ success: true, data: role });
  };

  @Patch('/:id')
  @Use(Authenticated)
  @Use(RoleValidator({ model: RoleModels.Permissions, read: true, update: true }))
  @Use(paramsValidator(IDSchema))
  @Use(bodyValidator(RoleSchema.partial()))
  public async updateARole(req: Request, res: Response) {
    let role = await Service.updateRoleById({ id: req.params.id, updates: { ...req.body } });

    res.status(200).json({ success: true, data: role });
  };

  @Delete('/:id')
  @Use(Authenticated)
  @Use(RoleValidator({ model: RoleModels.Permissions, del: true }))
  @Use(paramsValidator(IDSchema))
  public async removeARole(req: Request, res: Response) {
    let role = await Service.removeRoleById(req.params.id);

    res.status(200).json({ success: true, data: role });
  };
}

export default RoleController;

