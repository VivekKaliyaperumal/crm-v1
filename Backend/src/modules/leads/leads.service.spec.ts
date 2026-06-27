import { Prisma } from '@prisma/client';
import { LeadsService } from './leads.service';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthUser } from '../../auth/auth-user.interface';
import type { ListLeadsQueryDto } from './leads.dto';

interface LeadsMock {
  lead: {
    findMany: jest.Mock;
    count: jest.Mock;
    findFirst: jest.Mock;
    create: jest.Mock;
    delete: jest.Mock;
  };
  $transaction: jest.Mock;
}

function buildMock(): LeadsMock {
  return {
    lead: {
      findMany: jest.fn().mockReturnValue('FM'),
      count: jest.fn().mockReturnValue('CT'),
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn().mockResolvedValue([[], 0]),
  };
}

const manager: AuthUser = { id: 'u1', email: null, orgId: 'o1', roles: ['sales_manager'] };
const exec: AuthUser = { id: 'u2', email: null, orgId: 'o1', roles: ['sales_executive'] };

function baseQuery(overrides: Partial<ListLeadsQueryDto> = {}): ListLeadsQueryDto {
  return { page: 1, pageSize: 25, ...overrides } as ListLeadsQueryDto;
}

/** Extracts the `where` passed to lead.findMany on the most recent call. */
function findManyWhere(mock: LeadsMock): Prisma.LeadWhereInput {
  const call = mock.lead.findMany.mock.calls[0] as [{ where: Prisma.LeadWhereInput }];
  return call[0].where;
}

describe('LeadsService', () => {
  let mock: LeadsMock;
  let service: LeadsService;

  beforeEach(() => {
    mock = buildMock();
    service = new LeadsService(mock as unknown as PrismaService);
  });

  describe('list()', () => {
    it('uses an org-scoped where with no top-level OR for managers', async () => {
      await service.list(manager, baseQuery());
      const where = findManyWhere(mock);
      expect(where.orgId).toBe('o1');
      expect(where.OR).toBeUndefined();
    });

    it('scopes a non-manager to assigned/created rows via OR', async () => {
      await service.list(exec, baseQuery());
      const where = findManyWhere(mock);
      expect(where.orgId).toBe('o1');
      expect(where.OR).toEqual([{ assignedTo: 'u2' }, { createdBy: 'u2' }]);
    });

    it('preserves the visibility OR and adds an AND when searching (non-manager)', async () => {
      await service.list(exec, baseQuery({ search: 'ravi' }));
      const where = findManyWhere(mock);
      expect(where.OR).toEqual([{ assignedTo: 'u2' }, { createdBy: 'u2' }]);
      expect(where.AND).toBeDefined();
    });
  });

  describe('create()', () => {
    it('stamps orgId and createdBy from the auth user', async () => {
      mock.lead.create.mockResolvedValue({ id: 'lead1' });
      await service.create(exec, {
        fullName: 'Test Lead',
      } as Parameters<LeadsService['create']>[1]);

      const call = mock.lead.create.mock.calls[0] as [{ data: Record<string, unknown> }];
      expect(call[0].data.orgId).toBe('o1');
      expect(call[0].data.createdBy).toBe('u2');
    });
  });

  describe('remove()', () => {
    it('throws ForbiddenException for a non-manager', async () => {
      await expect(service.remove(exec, 'id')).rejects.toThrow();
    });
  });
});
