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
import { SiteVisitsService } from './site-visits.service';
import {
  CreateSiteVisitDto,
  ListSiteVisitsQueryDto,
  UpdateSiteVisitDto,
} from './site-visits.dto';

@ApiTags('site-visits')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('site-visits')
export class SiteVisitsController {
  constructor(private readonly siteVisits: SiteVisitsService) {}

  @Get()
  @ApiOperation({ summary: 'List site visits visible to the current user' })
  list(@CurrentUser() user: AuthUser, @Query() query: ListSiteVisitsQueryDto) {
    return this.siteVisits.list(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single site visit' })
  get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.siteVisits.get(user, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a site visit' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateSiteVisitDto) {
    return this.siteVisits.create(user, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a site visit' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSiteVisitDto,
  ) {
    return this.siteVisits.update(user, id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'sales_manager')
  @ApiOperation({ summary: 'Delete a site visit (managers only)' })
  remove(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.siteVisits.remove(user, id);
  }
}
