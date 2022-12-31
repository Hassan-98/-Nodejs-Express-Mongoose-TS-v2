//= Error Messages
import errorMessages from '../../utils/error-messages';
//= Types
import { RequestHandler } from '../../types/request.type';

interface Params {
  model?: string,
  read?: boolean,
  create?: boolean,
  update?: boolean,
  del?: boolean
}

export const RoleValidator = ({ model, read = false, create = false, update = false, del = false }: Params): RequestHandler => (req, res, next) => {
  try {
    const user = req.user;

    if (!user) return res.status(403).json({ success: false, data: null, message: errorMessages.AUTH_REQUIRED });

    const role = user.role;

    if (!role) return res.status(401).json({ success: false, data: null, message: errorMessages.AUTHORIZATION_FAILED });

    const roleModel = role.permissions.find(permission => permission.model === model);

    if (!roleModel) return res.status(401).json({ success: false, data: null, message: errorMessages.AUTHORIZATION_FAILED });

    if (read && !roleModel.read) return res.status(401).json({ success: false, data: null, message: errorMessages.AUTHORIZATION_FAILED });
    if (create && !roleModel.create) return res.status(401).json({ success: false, data: null, message: errorMessages.AUTHORIZATION_FAILED });
    if (update && !roleModel.update) return res.status(401).json({ success: false, data: null, message: errorMessages.AUTHORIZATION_FAILED });
    if (del && !roleModel.delete) return res.status(401).json({ success: false, data: null, message: errorMessages.AUTHORIZATION_FAILED });

    next();
  } catch (err: any) {
    res.status(500).json({ success: false, data: null, message: err.message });
  }
}
