import { Body, Controller, Get, NotFoundException, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { CurrentUser } from '../../auth/current-user.decorator';
import type { AuthUser } from '../../auth/auth-user.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateOrganizationDto } from './organization.dto';

@ApiTags('organization')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('organization')
export class OrganizationController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Get the current organization' })
  async get(@CurrentUser() user: AuthUser) {
    const org = await this.prisma.organization.findUnique({ where: { id: user.orgId } });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  @Patch()
  @Roles('admin')
  @ApiOperation({ summary: 'Update the current organization (admin)' })
  async update(@CurrentUser() user: AuthUser, @Body() dto: UpdateOrganizationDto) {
    return this.prisma.organization.update({
      where: { id: user.orgId },
      data: { ...dto },
    });
  }
}
