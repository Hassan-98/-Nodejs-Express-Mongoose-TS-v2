//= Models
import ROLES, { RoleModel } from './role.model';
//= Types
import { Role } from './role.types';

class RolesService {
  public MODEL: RoleModel = ROLES;

  public async getAllRoles(): Promise<Role[]> {
    let roles: Role[] = await this.MODEL.find({}).lean();
    return roles;
  }

  public async getRoleById(id: string): Promise<Role> {
    let role: Role = await this.MODEL.findById(id).lean();
    return role;
  }

  public async addNewRole(role: Role): Promise<Role> {
    let newRole: Role = await this.MODEL.create(role);
    return newRole;
  }

  public async updateRoleById({ id, updates }: UpdateParams): Promise<Role | null> {
    let role: Role | null = await this.MODEL.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    return role;
  }

  public async removeRoleById(id: string): Promise<Role | null> {
    let role: Role | null = await this.MODEL.findByIdAndRemove(id, { new: true });
    return role;
  }
}

interface UpdateParams {
  id: string;
  updates: Partial<Role>
}

export default RolesService;
