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
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto, ListCampaignsQueryDto, UpdateCampaignDto } from './campaigns.dto';

@ApiTags('campaigns')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaigns: CampaignsService) {}

  @Get()
  @ApiOperation({ summary: 'List campaigns in the current org' })
  list(@CurrentUser() user: AuthUser, @Query() query: ListCampaignsQueryDto) {
    return this.campaigns.list(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single campaign' })
  get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.campaigns.get(user, id);
  }

  @Post()
  @Roles('admin', 'sales_manager')
  @ApiOperation({ summary: 'Create a campaign (managers only)' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCampaignDto) {
    return this.campaigns.create(user, dto);
  }

  @Patch(':id')
  @Roles('admin', 'sales_manager')
  @ApiOperation({ summary: 'Update a campaign (managers only)' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCampaignDto,
  ) {
    return this.campaigns.update(user, id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'sales_manager')
  @ApiOperation({ summary: 'Delete a campaign (managers only)' })
  remove(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.campaigns.remove(user, id);
  }
}
