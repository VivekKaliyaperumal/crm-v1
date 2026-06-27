import { AppRole } from '@prisma/client';
import { can, permissionsFor, permissionMatrix } from './catalog';

describe('permissions/catalog', () => {
  describe('can()', () => {
    it('grants admin settings.view but denies telecaller settings.view', () => {
      expect(can([AppRole.admin], 'settings', 'view')).toBe(true);
      expect(can([AppRole.telecaller], 'settings', 'view')).toBe(false);
    });

    it('restricts leads.delete to managers', () => {
      expect(can([AppRole.sales_executive], 'leads', 'delete')).toBe(false);
      expect(can([AppRole.sales_manager], 'leads', 'delete')).toBe(true);
    });

    it('allows telecaller to create leads but not projects', () => {
      expect(can([AppRole.telecaller], 'leads', 'create')).toBe(true);
      expect(can([AppRole.telecaller], 'projects', 'create')).toBe(false);
    });

    it('returns false for unknown modules', () => {
      expect(can([AppRole.admin], 'does-not-exist', 'view')).toBe(false);
    });
  });

  describe('permissionsFor()', () => {
    const adminPerms = permissionsFor([AppRole.admin]);

    it('reflects dashboard having view but no create', () => {
      expect(adminPerms.dashboard.view).toBe(true);
      expect(adminPerms.dashboard.create).toBe(false);
    });

    it('grants admin team.view', () => {
      expect(adminPerms.team.view).toBe(true);
    });
  });

  describe('permissionMatrix()', () => {
    it('returns roles and modules with 4 roles and a leads module entry', () => {
      const matrix = permissionMatrix();
      expect(matrix.roles).toHaveLength(4);
      expect(matrix.modules.some((m) => m.key === 'leads')).toBe(true);
    });
  });
});
