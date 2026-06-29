import { BadRequestException } from '@nestjs/common';

/**
 * Guards against cross-tenant foreign-key injection: pass a Prisma `count`
 * promise scoped to { id, orgId } for a client-supplied reference. Throws if
 * the referenced row doesn't exist in the caller's organization.
 *
 *   await assertInOrg(this.prisma.customer.count({ where: { id, orgId } }), 'Customer');
 */
export async function assertInOrg(countPromise: Promise<number>, label: string): Promise<void> {
  if ((await countPromise) === 0) {
    throw new BadRequestException(`${label} not found in your organization`);
  }
}
