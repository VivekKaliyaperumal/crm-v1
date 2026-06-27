import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { CurrentUser } from '../../auth/current-user.decorator';
import type { AuthUser } from '../../auth/auth-user.interface';
import { FollowUpsService } from './follow-ups.service';
import {
  CreateFollowUpDto,
  ListFollowUpsQueryDto,
  UpdateFollowUpDto,
} from './follow-ups.dto';

@ApiTags('follow-ups')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('follow-ups')
export class FollowUpsController {
  constructor(private readonly followUps: FollowUpsService) {}

  @Get()
  @ApiOperation({ summary: 'List follow-ups visible to the current user' })
  list(@CurrentUser() user: AuthUser, @Query() query: ListFollowUpsQueryDto) {
    return this.followUps.list(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single follow-up' })
  get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.followUps.get(user, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a follow-up' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateFollowUpDto) {
    return this.followUps.create(user, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a follow-up' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFollowUpDto,
  ) {
    return this.followUps.update(user, id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'sales_manager')
  @ApiOperation({ summary: 'Delete a follow-up (managers only)' })
  remove(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.followUps.remove(user, id);
  }
}
