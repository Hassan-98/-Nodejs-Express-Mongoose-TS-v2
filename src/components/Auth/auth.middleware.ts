//= Modules
import jwt from 'jsonwebtoken';
//= Models
import USER from '../User/user.model';
//= Config
import ConfigVars from '../../configs/app.config';
//= Error Messages
import errorMessages from '../../utils/error-messages';
//= Types
import { RequestHandler } from '../../types/request.type';
import { User } from '../User/user.types';

const Config = ConfigVars();

export type TokenPayload = {
  user: string
}

export const Authenticated: RequestHandler = async (req, res, next) => {
  try {
    const JWT_Token = req.signedCookies['login-session'];

    if (!JWT_Token) return res.status(403).json({ success: false, data: null, message: errorMessages.AUTH_REQUIRED });

    const { user: userId } = jwt.verify(JWT_Token, Config.JWT_SECRET) as TokenPayload;

    if (!userId) return res.status(403).json({ success: false, data: null, message: errorMessages.AUTH_REQUIRED });

    const user: User = await USER.findById(userId).select({ username: 1, role: 1, accountStatus: 1, email_confirmed: 1 }).populate('role').lean();

    req.user = user;

    next();
  } catch (err: any) {
    res.status(500).json({ success: false, data: null, message: err.message });
  }
}

export const NotAuthenticated: RequestHandler = (req, res, next) => {
  try {
    const JWT_Token = req.signedCookies['login-session'];

    if (!JWT_Token) return next();

    jwt.verify(JWT_Token, Config.JWT_SECRET);

    return res.status(400).json({ success: false, data: null, message: errorMessages.ALREADY_AUTHENTICATED });
  } catch {
    next();
  }
}

export const PassUser: RequestHandler = async (req, res, next) => {
  try {
    const JWT_Token = req.signedCookies['login-session'];

    if (!JWT_Token) return next();

    const { user: userId } = jwt.verify(JWT_Token, Config.JWT_SECRET) as TokenPayload;

    if (!userId) return next();

    const user: User = await USER.findById(userId).select({ role: 1, accountStatus: 1, email_confirmed: 1, profile_completed: 1 }).populate('role').lean();

    req.user = user;

    next();
  } catch (e: any) {
    res.status(500).json({ err: e.message });
  }
}

export const EmailConfirmed: RequestHandler = (req, res, next) => {
  try {
    const user = req.user;

    if (!user) return res.status(403).json({ success: false, data: null, message: errorMessages.AUTH_REQUIRED });

    if (!user.email_confirmed) return res.status(400).json({ success: false, data: null, message: errorMessages.NOT_CONFIRMED });

    next();
  } catch (e: any) {
    res.status(500).json({ err: e.message });
  }
}

export const NotInActive: RequestHandler = (req, res, next) => {
  try {
    const user = req.user;

    if (!user) return res.status(403).json({ success: false, data: null, message: errorMessages.AUTH_REQUIRED });

    if (user.accountStatus === "inactive") return res.status(401).json({ success: false, data: null, message: errorMessages.INACTIVE_ACCOUNT });

    next();
  } catch (e: any) {
    res.status(500).json({ err: e.message });
  }
}

export const NotBanned: RequestHandler = (req, res, next) => {
  try {
    const user = req.user;

    if (!user) return res.status(403).json({ success: false, data: null, message: errorMessages.AUTH_REQUIRED });

    if (user.accountStatus === "banned") return res.status(401).json({ success: false, data: null, message: errorMessages.BANNED });

    next();
  } catch (e: any) {
    res.status(500).json({ err: e.message });
  }
}