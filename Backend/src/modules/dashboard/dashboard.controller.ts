import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import type { AuthUser } from '../../auth/auth-user.interface';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Aggregate workspace stats for the current org' })
  stats(@CurrentUser() user: AuthUser) {
    return this.dashboard.stats(user);
  }
}
