import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SupabaseAdminService } from '../../supabase/supabase-admin.service';
import type { AuthUser } from '../../auth/auth-user.interface';
import type { InviteUserDto, UpdateUserDto } from './users.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly admin: SupabaseAdminService,
  ) {}

  async list(user: AuthUser) {
    const [profiles, roles] = await Promise.all([
      this.prisma.profile.findMany({
        where: { orgId: user.orgId },
        select: { id: true, fullName: true, email: true, phone: true, isActive: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.userRole.findMany({ where: { orgId: user.orgId } }),
    ]);

    const rolesByUser = new Map<string, string[]>();
    for (const r of roles) {
      const list = rolesByUser.get(r.userId) ?? [];
      list.push(r.role);
      rolesByUser.set(r.userId, list);
    }

    return profiles.map((p) => ({ ...p, roles: rolesByUser.get(p.id) ?? [] }));
  }

  private async getOne(orgId: string, id: string) {
    const profile = await this.prisma.profile.findFirst({
      where: { id, orgId },
      select: { id: true, fullName: true, email: true, phone: true, isActive: true, createdAt: true },
    });
    if (!profile) throw new NotFoundException('User not found');
    const roles = await this.prisma.userRole.findMany({ where: { userId: id, orgId } });
    return { ...profile, roles: roles.map((r) => r.role) };
  }

  async update(user: AuthUser, id: string, dto: UpdateUserDto) {
    const target = await this.prisma.profile.findFirst({
      where: { id, orgId: user.orgId },
      select: { id: true },
    });
    if (!target) throw new NotFoundException('User not found');

    // Safety: admins can't lock themselves out.
    if (id === user.id && dto.roles && !dto.roles.includes('admin')) {
      throw new BadRequestException('You cannot remove your own admin role');
    }
    if (id === user.id && dto.isActive === false) {
      throw new ForbiddenException('You cannot deactivate yourself');
    }

    const ops: Prisma.PrismaPromise<unknown>[] = [];
    if (dto.roles) {
      const unique = [...new Set(dto.roles)];
      ops.push(this.prisma.userRole.deleteMany({ where: { userId: id, orgId: user.orgId } }));
      for (const role of unique) {
        ops.push(this.prisma.userRole.create({ data: { userId: id, orgId: user.orgId, role } }));
      }
    }
    if (dto.isActive !== undefined) {
      ops.push(this.prisma.profile.update({ where: { id }, data: { isActive: dto.isActive } }));
    }
    if (ops.length) await this.prisma.$transaction(ops);

    return this.getOne(user.orgId, id);
  }

  async invite(user: AuthUser, dto: InviteUserDto) {
    // Creates the auth user + sends the invite email (requires service-role key).
    const newUserId = await this.admin.inviteByEmail(dto.email);

    // The handle_new_user trigger creates the profile row; attach it to this org
    // and grant the chosen roles. Upsert guards against trigger timing.
    const roles = [...new Set(dto.roles)];
    await this.prisma.$transaction([
      this.prisma.profile.upsert({
        where: { id: newUserId },
        update: { orgId: user.orgId },
        create: { id: newUserId, orgId: user.orgId, email: dto.email },
      }),
      this.prisma.userRole.deleteMany({ where: { userId: newUserId, orgId: user.orgId } }),
      ...roles.map((role) =>
        this.prisma.userRole.create({ data: { userId: newUserId, orgId: user.orgId, role } }),
      ),
    ]);

    return this.getOne(user.orgId, newUserId);
  }
}
