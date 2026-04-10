import { 
  createUser, 
  listUsers, 
  getUserById, 
  updateUserById, 
  deactivateUser, 
  reactivateUser,
  resendInvite,
  AdminServiceError
} from "./service";
import { 
  createUserSchema, 
  updateUserSchema, 
  listUsersPaginatedSchema,
  CreateUserSchema, 
  UpdateUserSchema 
} from "./schema";

export type { CreateUserSchema, UpdateUserSchema };

export const AdminService = {
  user: {
    create: createUser,
    list: listUsers,
    get: getUserById,
    update: updateUserById,
    deactivate: deactivateUser,
    reactivate: reactivateUser,
    resendInvite: resendInvite,
  },
} as const;

export const AdminSchema = {
  user: {
    create: createUserSchema,
    update: updateUserSchema,
    list: listUsersPaginatedSchema,
  },
} as const;

export { AdminServiceError };
