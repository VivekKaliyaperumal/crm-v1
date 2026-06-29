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
import { ReceiptsService } from './receipts.service';
import {
  CreateReceiptDto,
  ListReceiptsQueryDto,
  UpdateReceiptDto,
} from './receipts.dto';

@ApiTags('receipts')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly receipts: ReceiptsService) {}

  @Get()
  @ApiOperation({ summary: 'List receipts in the org' })
  list(@CurrentUser() user: AuthUser, @Query() query: ListReceiptsQueryDto) {
    return this.receipts.list(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single receipt' })
  get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.receipts.get(user, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a receipt' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateReceiptDto) {
    return this.receipts.create(user, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a receipt' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReceiptDto,
  ) {
    return this.receipts.update(user, id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'sales_manager')
  @ApiOperation({ summary: 'Delete a receipt (managers only)' })
  remove(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.receipts.remove(user, id);
  }
}
