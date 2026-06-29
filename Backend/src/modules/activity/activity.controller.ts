import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import type { AuthUser } from '../../auth/auth-user.interface';
import { ActivityService } from './activity.service';

@ApiTags('activity')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('activity')
export class ActivityController {
  constructor(private readonly activity: ActivityService) {}

  @Get()
  @ApiOperation({ summary: 'Activity timeline for an entity (from the audit trail)' })
  list(
    @CurrentUser() user: AuthUser,
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
  ) {
    return this.activity.forEntity(user, entityType, entityId);
  }
}
