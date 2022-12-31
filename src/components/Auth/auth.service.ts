import { HttpError } from '../../middlewares/error.handler.middleware';
//= Modules
import CryptoJS from 'crypto-js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
//= Models
import USER, { UserModel } from '../User/user.model';
import RoleModel from '../Roles/role.model';
//= Utils
import errorMessages from '../../utils/error-messages';
import { verifyGoogleAuth, verifyFacebookAuth } from './auth.utils';
import uploadFromUrl from '../../storage/uploadFromUrl';
//= Config
import ConfigVars from '../../configs/app.config';
//= Mail Templates
import createResetPasswordTemplate from '../../mails/resetPassword.mail';
import createConfirmEmailTemplate from '../../mails/confirmEmail.mail';
//= Types
import { TokenPayload } from './auth.middleware';
import { User, ProviderProfile } from '../User/user.types';
import { ProviderLoginParams } from '../User/user.validation';
import { Role } from '../Roles/role.types';

const Config = ConfigVars();

class AuthService {
  public USER_MODEL: UserModel = USER;
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.mailgun.org",
      port: 587,
      auth: {
        user: Config.MAILGUN_USERNAME,
        pass: Config.MAILGUN_PASSWORD
      }
    });
  }

  public async findUserById(id: string): Promise<User> {
    let user: User = await this.USER_MODEL.findById(id, { password: 0 }).lean();
    return user;
  }

  public async login(credentials: { email: string, password: string, rememberMe: boolean }): Promise<{ token: string, userId: string }> {
    let user: User = await this.USER_MODEL.findOne({ email: credentials.email }, { email: 1, password: 1, accountStatus: 1, password_linked: 1, role: 1 }).lean();

    if (!user) throw HttpError(422, errorMessages.INVALID_CREDENTIALS);

    const decryptedPassword = CryptoJS.AES.decrypt(user.password, Config.CRYPTO_SECRET).toString(CryptoJS.enc.Utf8);

    if (credentials.password !== decryptedPassword) throw HttpError(422, errorMessages.INVALID_CREDENTIALS);

    if (user.accountStatus === 'banned') throw HttpError(403, errorMessages.BANNED);
    if (user.accountStatus === 'inactive') throw HttpError(403, errorMessages.INACTIVE_ACCOUNT);

    let token = jwt.sign({ user: user._id }, Config.JWT_SECRET, { expiresIn: credentials.rememberMe ? '365d' : '1d' });

    return { token, userId: user._id };
  }

  public async create(credentials: { username: string, email: string, password: string, rememberMe: boolean }): Promise<{ token: string, userId: string }> {
    let userRole: Role | null = await RoleModel.findOne({ title: 'User' }).lean();

    let user: User = await this.USER_MODEL.create({
      username: credentials.username,
      email: credentials.email,
      password: CryptoJS.AES.encrypt(credentials.password, Config.CRYPTO_SECRET).toString(),
      password_linked: true,
      role: userRole?._id || undefined
    });

    let token = jwt.sign({ user: user._id }, Config.JWT_SECRET, { expiresIn: credentials.rememberMe ? '365d' : '1d' });

    return { token, userId: user._id };
  }

  public async loginWithProvider({ externalType, externalToken, externalId }: ProviderLoginParams): Promise<{ user: User, status: string }> {
    let userProfile: ProviderProfile;
    let status: string = 'login';

    if (!['facebook', 'google'].includes(externalType)) throw HttpError(403, errorMessages.AUTH_NOT_SUPPORTED);

    let verifyResponse = externalType === 'facebook' ? await verifyFacebookAuth(externalId, externalToken) : await verifyGoogleAuth(externalToken);

    if (!verifyResponse) throw HttpError(500, errorMessages.AUTH_ERROR);

    userProfile = {
      username: verifyResponse.name,
      email: verifyResponse.email,
      imageUrl: externalType === 'facebook' ? verifyResponse.picture.data.url : verifyResponse.picture,
      id: externalType === 'facebook' ? verifyResponse.id : verifyResponse.sub
    }

    let user = await this.USER_MODEL.findOne(
      {
        $or: [{ 'externalAuth.google.userId': externalId }, { 'externalAuth.facebook.userId': externalId }]
      },
      { role: 1, accountStatus: 1 }
    );

    // Perform sign up operation
    if (!user) {
      if (!userProfile) throw HttpError(417, errorMessages.PROVIDER_ERROR);

      let userFound: User | null = await this.USER_MODEL.findOne({ email: userProfile.email }, { email: 1 });

      if (userFound) throw HttpError(403, errorMessages.AUTH_LINKED);

      let userRole: Role | null = await RoleModel.findOne({ title: 'User' }).lean();

      user = await this.USER_MODEL.create({
        username: userProfile.username,
        email: userProfile.email,
        email_confirmed: true,
        role: userRole?._id || undefined,
        externalAuth: {
          [externalType]: {
            userId: userProfile.id,
            linked: true
          }
        }
      });

      status = 'signup';

      const uploadedPicture = await uploadFromUrl(userProfile.imageUrl, user._id, 'image');

      user.picture = uploadedPicture.url;

      await user.save();
    }

    if (user && user.accountStatus === 'banned') throw HttpError(403, errorMessages.BANNED);
    if (user && user.accountStatus === 'inactive') throw HttpError(403, errorMessages.INACTIVE_ACCOUNT);

    return { user, status };
  }

  public async sendConfirmationEmail(userId: string): Promise<{ success: boolean, error: Error | undefined }> {
    const user = await this.USER_MODEL.findById(userId, { email: 1, confirmation_code: 1, username: 1 });

    if (!user) throw HttpError(500, errorMessages.AUTH_ERROR);

    const savedCode = user.confirmation_code;

    if (savedCode && savedCode.code && savedCode.expiration > new Date().getTime()) throw HttpError(400, errorMessages.CODE_ALREADY_SENT);

    const code = uuidv4().split("-")[1].toUpperCase();

    user.confirmation_code = {
      code,
      expiration: new Date().getTime() + (24 * 60 * 60 * 1000)
    };

    const mail_content = {
      from: "no-reply@domain.com",
      to: user.email,
      subject: "Confirm your email address - Domain",
      html: createConfirmEmailTemplate({
        username: `${user.username || "User"}`,
        email: user.email,
        link: `${Config.CLIENT_URL}/confirm?c=${code}&id=${user._id}`
      })
    }

    return await new Promise<{ success: boolean, error: Error | undefined }>((resolve, reject) => {
      this.transporter.sendMail(mail_content, async function (err, body) {
        if (err) {
          reject({ success: false, error: err })
        } else {
          await user.save();
          resolve({ success: true, error: undefined });
        }
      });
    })
  }

  public async confirmEmail(userId: string, code: string): Promise<User> {
    const user = await this.USER_MODEL.findById(userId).select({ confirmation_code: 1, email_confirmed: 1, username: 1 });

    if (!user) throw HttpError(500, errorMessages.AUTH_ERROR);

    const savedCode = user.confirmation_code;

    if (user.email_confirmed) throw HttpError(400, errorMessages.ALREADY_CONFIRMED);

    if (!savedCode.code || savedCode.expiration < new Date().getTime()) throw HttpError(403, errorMessages.CODE_EXPIRED);

    if (savedCode.code !== code) throw HttpError(400, errorMessages.CODE_NOT_VALID);

    user.email_confirmed = true;

    let savedUser = await user.save();

    return savedUser;
  }

  public async sendPasswordResetEmail(email: string): Promise<{ success: boolean, error: Error | undefined }> {
    const user = await this.USER_MODEL.findOne({ email }, { email: 1, reset_token: 1, username: 1, accountStatus: 1, password_linked: 1 });

    if (!user) throw HttpError(500, errorMessages.AUTH_ERROR);
    if (user.accountStatus === 'banned') throw HttpError(403, errorMessages.BANNED);
    if (!user.password_linked) throw HttpError(400, errorMessages.PASSWORD_NOT_LINKED);

    const savedToken = user.reset_token;

    if (savedToken.token && savedToken.expiration > new Date().getTime()) throw HttpError(400, errorMessages.TOKEN_ALREADY_SENT);

    const token = jwt.sign({ user: user._id }, Config.JWT_SECRET, { expiresIn: '30m' });

    user.reset_token = {
      token,
      expiration: new Date().getTime() + (30 * 60 * 1000)
    };

    const mail_content = {
      from: "no-reply@markety.ml",
      to: email,
      subject: "Reset Account Password - Markety",
      html: createResetPasswordTemplate({
        username: `${user.username || "User"}`,
        link: `${Config.CLIENT_URL}/reset?t=${token}`
      })
    }

    return await new Promise<{ success: boolean, error: Error | undefined }>((resolve, reject) => {
      this.transporter.sendMail(mail_content, async function (err, body) {
        if (err) {
          reject({ success: false, error: err })
        } else {
          await user.save();
          resolve({ success: true, error: undefined });
        }
      });
    })
  }

  public async resetPassword(token: string, password: string): Promise<void> {
    if (!token || !password) throw HttpError(400, errorMessages.INVALID_CREDENTIALS);

    const payload = jwt.verify(token, Config.JWT_SECRET) as TokenPayload;

    const user = await USER.findById(payload.user).select({ reset_token: 1, password: 1, accountStatus: 1, username: 1 });

    if (!user) throw HttpError(400, errorMessages.USER_NOT_FOUND(payload.user));
    if (user.accountStatus === 'banned') throw HttpError(403, errorMessages.BANNED);

    const savedToken = user.reset_token;

    if (!savedToken.token || savedToken.expiration < new Date().getTime()) throw HttpError(403, errorMessages.TOKEN_EXPIRED);

    user.password = CryptoJS.AES.encrypt(password, Config.CRYPTO_SECRET).toString();

    await user.save();
  }
}

export default AuthService;
