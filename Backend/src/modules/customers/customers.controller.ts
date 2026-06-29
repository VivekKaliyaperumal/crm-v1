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
import { CustomersService } from './customers.service';
import {
  CreateCustomerDto,
  ListCustomersQueryDto,
  UpdateCustomerDto,
} from './customers.dto';

@ApiTags('customers')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'List customers in the org' })
  list(@CurrentUser() user: AuthUser, @Query() query: ListCustomersQueryDto) {
    return this.customers.list(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single customer' })
  get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.customers.get(user, id);
  }

  @Get(':id/related')
  @ApiOperation({ summary: 'Customer-360: all records linked to this customer' })
  related(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.customers.related(user, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a customer' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCustomerDto) {
    return this.customers.create(user, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a customer' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customers.update(user, id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'sales_manager')
  @ApiOperation({ summary: 'Delete a customer (managers only)' })
  remove(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.customers.remove(user, id);
  }
}
