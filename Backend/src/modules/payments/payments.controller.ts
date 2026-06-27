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
import { CurrentUser } from '../../auth/current-user.decorator';
import type { AuthUser } from '../../auth/auth-user.interface';
import { PaymentsService } from './payments.service';
import {
  CreatePaymentDto,
  ListPaymentsQueryDto,
  UpdatePaymentDto,
} from './payments.dto';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'List payments in the org' })
  list(@CurrentUser() user: AuthUser, @Query() query: ListPaymentsQueryDto) {
    return this.payments.list(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single payment' })
  get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.payments.get(user, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a payment' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreatePaymentDto) {
    return this.payments.create(user, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a payment' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePaymentDto,
  ) {
    return this.payments.update(user, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a payment' })
  remove(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.payments.remove(user, id);
  }
}
