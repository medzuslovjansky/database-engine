import { z } from 'zod';

import { loginUserCommandPayloadSchema } from './login-user';
import { updateUserCommandPayloadSchema } from './update-user';
import { addUserRoleCommandPayloadSchema } from './add-user-role';
import { removeUserRoleCommandPayloadSchema } from './remove-user-role';
import { rebuildProjectionsCommandPayloadSchema } from './rebuild-projections';

export const commandRegistry = {
  LoginUser: {
    name: 'LoginUser',
    schema: loginUserCommandPayloadSchema,
    type: {} as z.infer<typeof loginUserCommandPayloadSchema>,
  },
  UpdateUser: {
    name: 'UpdateUser',
    schema: updateUserCommandPayloadSchema,
    type: {} as z.infer<typeof updateUserCommandPayloadSchema>,
  },
  UpdateLastLogin: {
    name: 'UpdateLastLogin',
    schema: z.any(),
    type: {} as any,
  },
  AddUserRole: {
    name: 'AddUserRole',
    schema: addUserRoleCommandPayloadSchema,
    type: {} as z.infer<typeof addUserRoleCommandPayloadSchema>,
  },
  RemoveUserRole: {
    name: 'RemoveUserRole',
    schema: removeUserRoleCommandPayloadSchema,
    type: {} as z.infer<typeof removeUserRoleCommandPayloadSchema>,
  },
  RebuildProjections: {
    name: 'RebuildProjections',
    schema: rebuildProjectionsCommandPayloadSchema,
    type: {} as z.infer<typeof rebuildProjectionsCommandPayloadSchema>,
  },
};

export type CommandName = keyof typeof commandRegistry;
export type CommandEntry<T extends CommandName = CommandName> = typeof commandRegistry[T];
export type CommandPayload<T extends CommandName> = typeof commandRegistry[T]['type'];
export type CommandSchema<T extends CommandName> = typeof commandRegistry[T]['schema'];
