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
import { LeadsService } from './leads.service';
import { CreateLeadDto, ListLeadsQueryDto, UpdateLeadDto } from './leads.dto';

@ApiTags('leads')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('leads')
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  @Get()
  @ApiOperation({ summary: 'List leads visible to the current user' })
  list(@CurrentUser() user: AuthUser, @Query() query: ListLeadsQueryDto) {
    return this.leads.list(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single lead with its timeline' })
  get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.leads.get(user, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a lead' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateLeadDto) {
    return this.leads.create(user, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a lead' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLeadDto,
  ) {
    return this.leads.update(user, id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'sales_manager')
  @ApiOperation({ summary: 'Delete a lead (managers only)' })
  remove(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.leads.remove(user, id);
  }
}
