import type { AuthUserSnapshot, IAuthUserLookup } from '@ecomerece/contracts';
import { UserModel } from './user.models';

/**
 * Live DB auth lookup adapter. Keeps the auth middleware free of the user
 * module's persistence model while preserving the ban/block/delete checks.
 */
export class UserAuthLookupAdapter implements IAuthUserLookup {
  async findAuthUser(userId: string): Promise<AuthUserSnapshot | null> {
    const user = await UserModel.findById(userId).lean();
    if (!user) return null;

    return {
      actor: {
        _id: String(user._id),
        image: user.image ?? '',
        name: { fullName: user.name.fullName },
      },
      role: user.role?.role,
      blocked: Boolean(user.block?.blocked),
      banned: Boolean(user.ban?.banned),
      deleted: Boolean(user.deleted?.deleted),
    };
  }
}
