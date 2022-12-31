import mongoose from 'mongoose';
import validator from 'validator';
import { User } from './user.types';
import { HttpError } from '../../middlewares/error.handler.middleware';
import errorMessages from '../../utils/error-messages';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    trim: true,
    validate(username: string) {
      if (validator.isEmpty(username)) throw HttpError(400, errorMessages.EMPTY('username'))
    }
  },
  email: {
    type: String,
    required: [true, errorMessages.REQUIRED('email address')],
    unique: true,
    trim: true,
    validate(email: string) {
      if (validator.isEmpty(email)) throw HttpError(400, errorMessages.EMPTY('email address'))
      else if (!validator.isEmail(email)) throw HttpError(400, errorMessages.NOT_VALID('email address'))
    }
  },
  email_confirmed: {
    type: Boolean,
    required: [true, errorMessages.REQUIRED('email confirmed')],
    default: false
  },
  password: {
    type: String,
    required: [true, errorMessages.REQUIRED('password')],
    minlength: [6, errorMessages.TOO_SHORT('password', 6)],
    default: 'not-linked'
  },
  password_linked: {
    type: Boolean,
    default: false
  },
  phone: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    enum: {
      values: ['male', 'female'],
      message: errorMessages.NOT_VALID('gender')
    },
  },
  picture: {
    type: String,
    validate(pic: string) {
      if (validator.isEmpty(pic)) throw HttpError(400, errorMessages.EMPTY('picture'));
      else if (!validator.isURL(pic)) throw HttpError(400, errorMessages.NOT_VALID_URL('picture'));
    }
  },
  role: {
    type: mongoose.Types.ObjectId,
    ref: 'Role'
  },
  accountStatus: {
    type: String,
    required: [true, errorMessages.REQUIRED('account status')],
    default: 'active',
    enum: {
      values: ['active', 'banned', 'inactive'],
      message: errorMessages.NOT_VALID('account status')
    },
    validate(status: string) {
      if (validator.isEmpty(status)) throw HttpError(400, errorMessages.EMPTY('account status'))
    }
  },
  externalAuth: {
    google: {
      userId: {
        type: String,
        default: "not-linked",
        index: true
      },
      linked: {
        type: Boolean,
        default: false
      }
    },
    facebook: {
      userId: {
        type: String,
        default: "not-linked",
        index: true
      },
      linked: {
        type: Boolean,
        default: false
      }
    }
  },
  reset_token: {
    token: {
      type: String,
      validate(token: string) {
        if (validator.isEmpty(token)) throw HttpError(400, errorMessages.EMPTY('reset token'))
        else if (!validator.isJWT(token)) throw HttpError(400, errorMessages.NOT_VALID('reset token'))
      }
    },
    expiration: {
      type: Date
    }
  },
  confirmation_code: {
    code: {
      type: String,
      validate(code: string) {
        if (validator.isEmpty(code)) throw HttpError(400, errorMessages.EMPTY('confirmation code'))
        else if (code.length !== 4) throw HttpError(400, errorMessages.NOT_VALID('confirmation code'))
      }
    },
    expiration: {
      type: Date
    }
  }
}, { timestamps: true });


//= TODO: Logs should be moved to a separate model

const Model = mongoose.model<User>("User", UserSchema);

export type UserModel = typeof Model;

export default Model;
