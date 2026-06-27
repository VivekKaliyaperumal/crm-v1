import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import type { AuthUser } from '../../auth/auth-user.interface';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('me')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('me')
export class MeController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Current authenticated user + their organization (for white-label branding)' })
  async me(@CurrentUser() user: AuthUser) {
    const [profile, org] = await Promise.all([
      this.prisma.profile.findUnique({
        where: { id: user.id },
        select: { fullName: true, email: true },
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
      roles: user.roles,
      orgId: user.orgId,
      org,
    };
  }
}
