import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import type { AuthUser } from '../../auth/auth-user.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { permissionsFor } from '../../permissions/catalog';
import { UpdateProfileDto } from './me.dto';

@ApiTags('me')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('me')
export class MeController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Current user, organization, and effective permissions' })
  async me(@CurrentUser() user: AuthUser) {
    const [profile, org] = await Promise.all([
      this.prisma.profile.findUnique({
        where: { id: user.id },
        select: { fullName: true, email: true, phone: true },
      }),
      this.prisma.organization.findUnique({
        where: { id: user.orgId },
        select: { id: true, name: true, slug: true, branding: true },
      }),
    ]);

    return {
      id: user.id,
      email: user.email ?? profile?.email ?? null,
      fullName: profile?.fullName ?? null,
      phone: profile?.phone ?? null,
      roles: user.roles,
      orgId: user.orgId,
      org,
      permissions: permissionsFor(user.roles),
    };
  }

  @Patch()
  @ApiOperation({ summary: 'Update own profile (name, phone)' })
  async updateProfile(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.prisma.profile.update({
      where: { id: user.id },
      data: { ...dto },
      select: { id: true, fullName: true, email: true, phone: true },
    });
  }
}
