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
import { DealsService } from './deals.service';
import { CreateDealDto, ListDealsQueryDto, UpdateDealDto } from './deals.dto';

@ApiTags('deals')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('deals')
export class DealsController {
  constructor(private readonly deals: DealsService) {}

  @Get()
  @ApiOperation({ summary: 'List deals in the org' })
  list(@CurrentUser() user: AuthUser, @Query() query: ListDealsQueryDto) {
    return this.deals.list(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single deal' })
  get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.deals.get(user, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a deal' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateDealDto) {
    return this.deals.create(user, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a deal' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDealDto,
  ) {
    return this.deals.update(user, id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'sales_manager')
  @ApiOperation({ summary: 'Delete a deal (managers only)' })
  remove(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.deals.remove(user, id);
  }
}
