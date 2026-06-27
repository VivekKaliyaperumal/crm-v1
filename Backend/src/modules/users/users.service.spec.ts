import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SupabaseAdminService } from '../../supabase/supabase-admin.service';
import type { AuthUser } from '../../auth/auth-user.interface';
import type { UpdateUserDto } from './users.dto';

interface UsersMock {
  profile: {
    findFirst: jest.Mock;
    update: jest.Mock;
  };
  userRole: {
    deleteMany: jest.Mock;
    create: jest.Mock;
    findMany: jest.Mock;
  };
  $transaction: jest.Mock;
}

function buildMock(): UsersMock {
  return {
    profile: {
      findFirst: jest.fn(),
      update: jest.fn().mockReturnValue('PU'),
    },
    userRole: {
      deleteMany: jest.fn().mockReturnValue('DM'),
      create: jest.fn().mockReturnValue('CR'),
      findMany: jest.fn(),
    },
    $transaction: jest.fn().mockResolvedValue([]),
  };
}

const admin: AuthUser = { id: 'admin1', email: null, orgId: 'o1', roles: ['admin'] };

function dto(value: Partial<UpdateUserDto>): UpdateUserDto {
  return value as UpdateUserDto;
}

describe('UsersService', () => {
  let mock: UsersMock;
  let service: UsersService;

  beforeEach(() => {
    mock = buildMock();
    const adminMock = { isConfigured: false, inviteByEmail: jest.fn() };
    service = new UsersService(
      mock as unknown as PrismaService,
      adminMock as unknown as SupabaseAdminService,
    );
  });

  it('rejects removing your own admin role', async () => {
    mock.profile.findFirst.mockResolvedValueOnce({ id: 'admin1' });
    await expect(
      service.update(admin, 'admin1', dto({ roles: ['telecaller'] })),
    ).rejects.toThrow();
  });

  it('rejects deactivating yourself', async () => {
    mock.profile.findFirst.mockResolvedValueOnce({ id: 'admin1' });
    await expect(
      service.update(admin, 'admin1', dto({ isActive: false })),
    ).rejects.toThrow();
  });

  it('prepares role replacement in a transaction for another user', async () => {
    // First findFirst: target lookup. Second findFirst: getOne() profile.
    mock.profile.findFirst
      .mockResolvedValueOnce({ id: 'u2' })
      .mockResolvedValueOnce({
        id: 'u2',
        fullName: 'Other',
        email: null,
        phone: null,
        isActive: true,
        createdAt: new Date(),
      });
    mock.userRole.findMany.mockResolvedValueOnce([]);

    await service.update(admin, 'u2', dto({ roles: ['telecaller'] }));

    expect(mock.$transaction).toHaveBeenCalledTimes(1);
    expect(mock.userRole.deleteMany).toHaveBeenCalledTimes(1);
    expect(mock.userRole.create).toHaveBeenCalledTimes(1);
    const txArg = mock.$transaction.mock.calls[0][0] as unknown[];
    expect(txArg).toContain('DM');
    expect(txArg).toContain('CR');
  });
});
