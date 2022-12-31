//= Modules
import { Request, Response } from 'express';
//= Decorators
import { Controller, Get, Post, Patch, Delete, Use } from '../../decorators';
//= Service
import BookService from './book.service';
//= Middlewares
import { RoleValidator } from '../Roles/role.middleware';
import { Authenticated } from '../Auth/auth.middleware';
//= Types
import { RoleModels } from '../Roles/role.types';
import { ExtendedRequest } from '../../types/request.type'

const Service = new BookService();

@Controller('/books')
class AuthController {
  @Get('/')
  @Use(Authenticated)
  @Use(RoleValidator({ model: RoleModels.Books, read: true }))
  public async getAll(req: ExtendedRequest, res: Response) {
    let books = await Service.getAllBooks(req.user);
    res.status(200).json({ success: true, data: books });
  };
}

export default AuthController;

