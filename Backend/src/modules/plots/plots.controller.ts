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
import { PlotsService } from './plots.service';
import { CreatePlotDto, ListPlotsQueryDto, UpdatePlotDto } from './plots.dto';

@ApiTags('plots')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('plots')
export class PlotsController {
  constructor(private readonly plots: PlotsService) {}

  @Get()
  @ApiOperation({ summary: 'List plots in the current org' })
  list(@CurrentUser() user: AuthUser, @Query() query: ListPlotsQueryDto) {
    return this.plots.list(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single plot with its project' })
  get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.plots.get(user, id);
  }

  @Post()
  @Roles('admin', 'sales_manager')
  @ApiOperation({ summary: 'Create a plot (managers only)' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreatePlotDto) {
    return this.plots.create(user, dto);
  }

  @Patch(':id')
  @Roles('admin', 'sales_manager')
  @ApiOperation({ summary: 'Update a plot (managers only)' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePlotDto,
  ) {
    return this.plots.update(user, id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'sales_manager')
  @ApiOperation({ summary: 'Delete a plot (managers only)' })
  remove(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.plots.remove(user, id);
  }
}
