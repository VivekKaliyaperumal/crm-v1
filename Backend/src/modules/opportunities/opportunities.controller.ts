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
import { OpportunitiesService } from './opportunities.service';
import {
  CreateOpportunityDto,
  ListOpportunitiesQueryDto,
  UpdateOpportunityDto,
} from './opportunities.dto';

@ApiTags('opportunities')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly opportunities: OpportunitiesService) {}

  @Get()
  @ApiOperation({ summary: 'List opportunities in the org' })
  list(@CurrentUser() user: AuthUser, @Query() query: ListOpportunitiesQueryDto) {
    return this.opportunities.list(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single opportunity' })
  get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.opportunities.get(user, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create an opportunity' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateOpportunityDto) {
    return this.opportunities.create(user, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an opportunity' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOpportunityDto,
  ) {
    return this.opportunities.update(user, id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'sales_manager')
  @ApiOperation({ summary: 'Delete an opportunity (managers only)' })
  remove(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.opportunities.remove(user, id);
  }
}
