//= Modules
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
//= Decorators
import { Controller, Post, Patch, Use } from '../../decorators';
//= Service
import AuthService from './auth.service';
//= Middlewares
import { bodyValidator } from '../../middlewares/validation.middleware';
import { Authenticated, NotAuthenticated } from './auth.middleware';
import { HttpError } from '../../middlewares/error.handler.middleware';
//= Validators
import { UserSchema, LoginSchema, ProviderLoginSchema, IDSchema, validateAuthorizedUser } from '../User/user.validation';
//= Config
import ConfigVars from '../../configs/app.config';

const Config = ConfigVars();
const Service = new AuthService();

@Controller('/auth')
class AuthController {
  @Post('/login')
  @Use(NotAuthenticated)
  @Use(bodyValidator(LoginSchema))
  public async login(req: Request, res: Response) {
    const { email, password, rememberMe } = req.body;

    let { token, userId } = await Service.login({ email, password, rememberMe });

    const userData = await Service.findUserById(userId);

    res.cookie('login-session', token, {
      secure: Config.isProduction,
      httpOnly: true,
      signed: true,
      expires: new Date(new Date().getTime() + (rememberMe ? 365 : 1) * 24 * 60 * 60 * 1000)
    }).status(200).json({ success: true, data: userData });
  };


  @Post('/signup')
  @Use(NotAuthenticated)
  @Use(bodyValidator(UserSchema))
  public async createNewAccount(req: Request, res: Response) {
    const { username, email, password, rememberMe } = req.body;
    let { token, userId } = await Service.create({ username, email, password, rememberMe });

    const userData = await Service.findUserById(userId);

    res.cookie("login-session", token, {
      secure: Config.isProduction,
      httpOnly: true,
      signed: true,
      expires: new Date(new Date().getTime() + (rememberMe ? 365 : 1) * 24 * 60 * 60 * 1000)
    })
      .status(201)
      .json({ success: true, data: userData });
  }


  @Post('/with-provider')
  @Use(NotAuthenticated)
  @Use(bodyValidator(ProviderLoginSchema))
  public async loginWithExternalProvider(req: Request, res: Response) {
    const { externalType, externalId, externalToken, rememberMe } = req.body;
    let { user, status } = await Service.loginWithProvider({ externalType, externalId, externalToken });

    let token = jwt.sign({ user: user._id, role: user.role }, Config.JWT_SECRET, { expiresIn: '365d' });

    const userData = await Service.findUserById(user._id);

    res.cookie('login-session', token, {
      secure: Config.isProduction,
      httpOnly: true,
      signed: true,
      expires: new Date(new Date().getTime() + (rememberMe ? 365 : 1) * 24 * 60 * 60 * 1000)
    })
      .status(status === 'login' ? 200 : 201)
      .json({ success: true, data: userData });
  }


  @Post('/send-confirmation-email')
  @Use(Authenticated)
  @Use(bodyValidator(IDSchema))
  public async sendEmailConfirmation(req: Request, res: Response) {
    const { userId } = req.body;
    const response = await Service.sendConfirmationEmail(userId);

    if (response.error) throw HttpError(500, response.error.message);

    res.status(200).json({ success: true, data: null });
  };


  @Patch('/confirm-email')
  @Use(Authenticated)
  @Use(validateAuthorizedUser)
  public async confirmEmail(req: Request, res: Response) {
    const { userId, code } = req.body;

    await Service.confirmEmail(userId, code);

    res.json({ success: true, data: null });
  };


  @Post('/send-password-reset')
  @Use(NotAuthenticated)
  public async sendResetPasswordEmail(req: Request, res: Response) {
    const { email } = req.body;

    const response = await Service.sendPasswordResetEmail(email);

    if (response.error) throw HttpError(500, response.error.message);

    res.status(200).json({ success: true, data: null });
  };


  @Patch('/reset-password')
  @Use(NotAuthenticated)
  public async resetPassword(req: Request, res: Response) {
    const { token, newPassword } = req.body;

    await Service.resetPassword(token, newPassword);

    res.json({ success: true, data: null });
  };


  @Post('/logout')
  @Use(Authenticated)
  public logout(req: Request, res: Response) {
    res.clearCookie('login-session');
    res.status(200).json({ success: true, data: null });
  };
}

export default AuthController;

